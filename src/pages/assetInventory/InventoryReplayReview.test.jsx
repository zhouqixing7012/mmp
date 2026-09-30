import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InventoryReplayReview from './InventoryReplayReview';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
jest.mock('antd',()=>({
 Alert:()=>null, DatePicker:()=>null, Modal:Object.assign(()=>null,{confirm:jest.fn()}), message:{useMessage:()=>[{warning:jest.fn(),success:jest.fn()},null]},
 Button:({children,onClick})=><button onClick={onClick}>{children}</button>,Card:({children,title})=><section>{title}{children}</section>,Space:({children})=><div>{children}</div>,Typography:{Title:({children})=><h1>{children}</h1>,Text:({children})=><span>{children}</span>},
 TreeSelect:Object.assign(()=>null,{SHOW_PARENT:'SHOW_PARENT'}),
 Input:({value,onChange})=><input value={value} onChange={onChange}/>,Select:({value,options,onChange})=><select value={value} onChange={e=>onChange(e.target.value)}><option value=""/>{options.map(o=><option key={o.value}>{o.value}</option>)}</select>,
 Table:({columns,dataSource})=><table><thead><tr>{columns.map(c=><th key={c.title}>{c.title}</th>)}</tr></thead><tbody>{dataSource.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.title}>{c.render?c.render(r[c.dataIndex],r):r[c.dataIndex]}</td>)}</tr>)}</tbody></table>
}));
jest.mock('../../components/QueryBar',()=>({__esModule:true,default:({children,onQuery,onReset})=><div>{children}<button onClick={onQuery}>查询</button><button onClick={onReset}>重置</button></div>,QueryItem:({label,children})=><label>{label}{children}</label>}));
jest.mock('../../components/DetailGrid',()=>({__esModule:true,default:({children})=><div>{children}</div>,DetailItem:({children})=><span>{children}</span>}));
jest.mock('../../components/StatusTag',()=>({value})=><span>{value}</span>);
jest.mock('../../components/SelectModal',()=>()=>null);
jest.mock('./InventoryLocationChangeFlow',()=>()=>null);
const plans=[{planNo:'P1',planName:'员工',range:'员工'},{planNo:'P2',planName:'公共',range:'公共'}];
const assetsForPlan=p=>p.planNo==='P1'?[{key:'a',assetTag:'A',description:'笔记本',inventoryStatus:'未盘'},{key:'b',assetTag:'B',description:'手机',inventoryStatus:'已盘'}]:[{key:'c',assetTag:'C',description:'显示器',inventoryStatus:'未盘'}];
beforeEach(()=>window.localStorage.clear());
const setup=()=>render(<InventoryReplayReview project={{period:'2026'}} plans={plans} assetsForPlan={assetsForPlan} submission={{records:[{key:'start',node:'开始',status:'已提交'}]}} onBack={()=>{}}/>);
test('复盘审核可按查询条件筛选，并恢复全部当前计划资产',()=>{setup();fireEvent.change(screen.getByLabelText('资产标签号'),{target:{value:'B'}});fireEvent.click(screen.getByText('查询',{selector:'button'}));expect(screen.queryByText('笔记本')).not.toBeInTheDocument();expect(screen.getByText('手机')).toBeInTheDocument();fireEvent.click(screen.getByText('重置'));expect(screen.getByText('笔记本')).toBeInTheDocument();});
test('点击不同计划仅展示该计划的资产，监督人固定徐博',()=>{setup();fireEvent.click(screen.getByRole('button',{name:'P2'}));expect(screen.getByText('显示器')).toBeInTheDocument();expect(screen.queryByText('手机')).not.toBeInTheDocument();expect(screen.getAllByText('徐博')).toHaveLength(2);expect(screen.getByRole('columnheader',{name:'责任人部门'})).toBeInTheDocument();});

test('复盘计划提交审批后直接打开真实结果审核页并生成待审批记录',()=>{
 function Harness(){const [rows,setRows]=React.useState(plans.map((p,i)=>({...p,key:p.planNo,status:'盘点中',startDate:`2026-09-${i+20}`,endDate:`2026-09-${i+20}`})));return <AssetInventoryPlansV2Refined project={{projectType:'复盘',projectNo:'RCP-test',samplingRatio:1,period:'2026'}} currentOperator="冯丽婷" rows={rows} setRows={setRows} assetsForPlan={assetsForPlan} onBack={()=>{}}/>;}
 const view = render(<Harness/>);expect(screen.getAllByText('徐博')).toHaveLength(2);fireEvent.click(screen.getByRole('button',{name:'提交审批'}));expect(screen.getByRole('heading',{name:'复盘结果审核'})).toBeInTheDocument();expect(screen.getByText('待审批')).toBeInTheDocument();expect(screen.getByText('冯丽婷')).toBeInTheDocument();expect(screen.getByText('财务经理审批')).toBeInTheDocument();expect(screen.getByText('待流转')).toBeInTheDocument();expect(screen.getAllByText('徐博')).toHaveLength(3);view.unmount();render(<Harness/>);fireEvent.click(screen.getByRole('button',{name:'查看审批'}));expect(screen.getByRole('heading',{name:'复盘结果审核'})).toBeInTheDocument();expect(screen.getByText('待审批')).toBeInTheDocument();
});
