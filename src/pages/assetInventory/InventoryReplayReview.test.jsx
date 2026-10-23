import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InventoryReplayReview from './InventoryReplayReview';
import { submitReplayReview } from './inventoryReplayReviewStore';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
jest.mock('./AssetInventoryImageReviewV2', () => ({ buildReviewRows: () => [] }));
jest.mock('antd',()=>({
 Alert:({message})=><div>{message}</div>, DatePicker:()=>null, Modal:Object.assign(()=>null,{confirm:jest.fn()}), message:{useMessage:()=>[{warning:jest.fn(),success:jest.fn(),error:jest.fn()},null]},
 Button:({children,onClick,disabled,danger,icon,...props})=><button disabled={disabled} onClick={onClick} {...props}>{children}</button>,Card:({children,title})=><section>{title}{children}</section>,Space:({children})=><div>{children}</div>,Typography:{Title:({children})=><h1>{children}</h1>,Text:({children})=><span>{children}</span>},
 TreeSelect:Object.assign(()=>null,{SHOW_PARENT:'SHOW_PARENT'}),
 Input:Object.assign(({onPressEnter,suffix,allowClear,...props})=><input {...props}/>, { TextArea: ({value,onChange,...props}) => <textarea value={value} onChange={onChange} {...props}/> }),Select:({value,options,onChange})=><select value={value} onChange={e=>onChange(e.target.value)}><option value=""/>{options.map(o=><option key={o.value}>{o.value}</option>)}</select>,
 Table:({columns,dataSource})=><table><thead><tr>{columns.map(c=><th key={c.title}>{c.title}</th>)}</tr></thead><tbody>{dataSource.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.title}>{c.render?c.render(r[c.dataIndex],r):r[c.dataIndex]}</td>)}</tr>)}</tbody></table>
}));
jest.mock('../../components/QueryBar',()=>({__esModule:true,default:({children,onQuery,onReset})=><div>{children}<button onClick={onQuery}>查询</button><button onClick={onReset}>重置</button></div>,QueryItem:({label,children})=><label>{label}{children}</label>}));
jest.mock('../../components/DetailGrid',()=>({__esModule:true,default:({children})=><div>{children}</div>,DetailItem:({children})=><span>{children}</span>}));
jest.mock('../../components/StatusTag',()=>({value})=><span>{value}</span>);
jest.mock('../../components/SelectModal',()=>()=>null);
jest.mock('./InventoryLocationChangeFlow',()=>()=>null);
const plans=[{planNo:'P1',planName:'员工',range:'员工'},{planNo:'P2',planName:'公共',range:'公共'}];
const rawAssetsForPlan=p=>p.planNo==='P1'?[{key:'a',assetTag:'A',description:'笔记本',inventoryStatus:'未盘'},{key:'b',assetTag:'B',description:'手机',inventoryStatus:'已盘'}]:[{key:'c',assetTag:'C',description:'显示器',inventoryStatus:'未盘'}];
const assetsForPlan = plan => rawAssetsForPlan(plan).map(asset => ({...asset,supervisor: plan.planNo === 'P1' ? '冯丽婷' : '徐博',executor:'冯丽婷'}));
beforeEach(()=>window.localStorage.clear());
const setup=()=>render(<InventoryReplayReview project={{period:'2026'}} plans={plans} assetsForPlan={assetsForPlan} submission={{records:[{key:'start',node:'开始',status:'已提交'}]}} onBack={()=>{}}/>);
test('复盘审核可按查询条件筛选，并恢复全部当前计划资产',()=>{setup();fireEvent.change(screen.getByLabelText('资产标签号'),{target:{value:'B'}});fireEvent.click(screen.getByText('查询',{selector:'button'}));expect(screen.queryByText('笔记本')).not.toBeInTheDocument();expect(screen.getByText('手机')).toBeInTheDocument();fireEvent.click(screen.getByText('重置'));expect(screen.getByText('笔记本')).toBeInTheDocument();});
test('点击不同计划仅展示该计划的资产，监督人固定徐博',()=>{setup();fireEvent.click(screen.getByRole('button',{name:'P2'}));expect(screen.getByText('显示器')).toBeInTheDocument();expect(screen.queryByText('手机')).not.toBeInTheDocument();expect(screen.getAllByText('徐博')).toHaveLength(2);expect(screen.getByRole('columnheader',{name:'责任人部门'})).toBeInTheDocument();expect(screen.queryByRole('columnheader',{name:'计划负责人'})).toBeNull();});

test('逐计划入口仅提交对应计划，全部通过后才开放项目审批，徐博复用审核页完成',()=>{
 const project = {projectType:'复盘',projectNo:'R-ui',period:'2026'};
 function Harness({operator}) { const [rows,setRows]=React.useState(plans.map(plan=>({...plan,key:plan.planNo,status:'盘点中'}))); return <AssetInventoryPlansV2Refined project={project} currentOperator={operator} rows={rows} setRows={setRows} assetsForPlan={assetsForPlan}/>; }
 let view=render(<Harness operator="冯丽婷"/>);
 expect(screen.getByRole('button',{name:'提交项目审批'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批P1'}));
 expect(screen.getByRole('heading',{name:'复盘结果审核'})).toBeInTheDocument();
 expect(screen.queryByText('财务经理审批')).toBeNull();
 expect(screen.queryByText('ES主管审批')).toBeNull();
 expect(screen.queryByText('NO领导审批')).toBeNull();
 expect(screen.queryByRole('columnheader',{name:'内审监督人'})).toBeNull();
 fireEvent.change(screen.getByLabelText('复盘审批意见'),{target:{value:'现场复核'}});
 fireEvent.click(screen.getByRole('button',{name:'同意'}));
 expect(screen.queryByText('狐小e待办处理记录')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 expect(screen.getByRole('button',{name:'提交项目审批'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批P2'}));
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 view.unmount();
 view=render(<Harness operator="徐博"/>);
 fireEvent.click(screen.getByRole('button',{name:'查看计划审批P2'}));
 fireEvent.click(screen.getByRole('button',{name:'同意'}));
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 expect(screen.getByRole('button',{name:'提交项目审批'})).toBeEnabled();
 fireEvent.click(screen.getByRole('button',{name:'提交项目审批'}));
 expect(screen.getByRole('heading',{name:'复盘结果审核'})).toBeInTheDocument();
 expect(screen.getByText('财务经理审批')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'同意'}));
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 view.unmount();
 render(<Harness operator="徐博"/>);
 fireEvent.click(screen.getByRole('button',{name:'查看项目审批'}));
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
});

test('计划驳回后恢复该计划提交入口，重提保留意见',()=>{
 const project={projectNo:'R-reject',projectType:'复盘'};
 function Harness(){ const [rows,setRows]=React.useState([{...plans[0],key:'P1',status:'盘点中'}]);return <AssetInventoryPlansV2Refined project={project} currentOperator="冯丽婷" rows={rows} setRows={setRows} assetsForPlan={assetsForPlan}/>; }
 render(<Harness/>);
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批P1'}));
 fireEvent.change(screen.getByLabelText('复盘审批意见'),{target:{value:'请补充'}});
 fireEvent.click(screen.getByRole('button',{name:'驳回'}));
 expect(screen.queryByText('演示已清除')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批P1'}));
 expect(screen.getByText('请补充')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'同意'})).toBeInTheDocument();
});

test('关闭项目时计划审批只读',()=>{
 const project={projectNo:'R-close',projectType:'复盘'};
 const state=submitReplayReview({project,plans:[{...plans[0],status:'盘点中'}],assetsForPlan,operator:'冯丽婷'});
 const review=state.planReviews.P1;
 render(<InventoryReplayReview project={{...project,status:'盘点关闭'}} plans={review.plans} submission={review} assetsForPlan={assetsForPlan} currentOperator="冯丽婷" onDecide={jest.fn()}/>);
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 expect(screen.queryByRole('button',{name:'驳回'})).toBeNull();
});
