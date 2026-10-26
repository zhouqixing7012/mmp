import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { submitReplayReview, getReplaySubmission } from './inventoryReplayReviewStore';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
const mockWarning = jest.fn();
jest.mock('antd', () => {
  const Box = ({children}) => <div>{children}</div>;
  return { Alert:Box, Card:Box, Space:Box, Button:({children,onClick,disabled})=><button disabled={disabled} onClick={onClick}>{children}</button>,
    Input:({onPressEnter,suffix,...props})=><input {...props}/>, Select:()=>null,DatePicker:({value,onChange,disabledDate,...props})=><input {...props} type="date" value={value?.format('YYYY-MM-DD') || ''} data-later-disabled={disabledDate ? String(disabledDate(require('dayjs')('2026-10-27'))) : undefined} onChange={event=>onChange(event.target.value ? require('dayjs')(event.target.value) : null)}/>,Typography:{Title:Box,Text:Box},
    Modal:Object.assign(()=>null,{confirm:jest.fn()}),message:{useMessage:()=>[{warning:mockWarning,error:mockWarning,success:jest.fn(),info:jest.fn()},null]},
    Table:({columns,dataSource,rowSelection})=><><button onClick={()=>rowSelection?.onChange([dataSource[0].key])}>选择首个计划</button><table><tbody>{dataSource.map(row=><tr key={row.key}>{columns.map((column,index)=><td key={index}>{column.render?column.render(row[column.dataIndex],row):row[column.dataIndex]}</td>)}</tr>)}</tbody></table></>,
  };
});
jest.mock('../../components/AssetQueryControls',()=>({AssetValueSelect:()=>null,matchesQuerySelection:()=>true}));
jest.mock('../../components/QueryBar',()=>({__esModule:true,default:()=>null,QueryItem:()=>null}));
jest.mock('../../components/DetailGrid',()=>({__esModule:true,default:()=>null,DetailItem:()=>null}));
jest.mock('../../components/StatusTag',()=>({value})=><span>{value}</span>);
jest.mock('../../components/SelectModal',()=>({open,dataSource,onConfirm})=>open?<div>{dataSource.map(person=><button key={person.id} onClick={()=>onConfirm(person)}>{'选择'+person.employeeName}</button>)}</div>:null);
jest.mock('./AssetInventoryImageReviewV2',()=>({buildReviewRows:()=>[]}));
jest.mock('./InventoryLocationChangeFlow',()=>()=>null);
jest.mock('./InventoryReplayReview',()=>()=>null);
const draft = {key:'manual-1',planNo:'P1',planName:'原名',range:'员工',status:'草稿',startDate:'2026-10-23',endDate:'2026-10-23'};
const originalAssets=[{key:'a',assetTag:'A',quantity:1,inventoryRange:'员工',supervisor:'冯丽婷',executor:'冯丽婷'},{key:'b',assetTag:'B',quantity:1,inventoryRange:'员工',supervisor:'徐博',executor:'徐博'}];
function Harness({plan=draft,projectType='复盘',initialAssets=originalAssets,onChanged=()=>{}}){
 const [rows,setRows]=React.useState([plan]);const [assets,setAssets]=React.useState(initialAssets);
 return <><AssetInventoryPlansV2Refined currentOperator="冯丽婷" project={{creator:'冯丽婷',projectType,projectNo:'CFG',status:'生成盘点计划'}} rows={rows} setRows={setRows} assetsForPlan={()=>assets} onChangePlanAssets={(row,updater)=>{setAssets(current=>{const next=updater(current);onChanged(next);return next;});}}/><output>{JSON.stringify(rows)}</output></>;
}
beforeEach(()=>{window.localStorage.clear();mockWarning.mockClear();});
test('草稿汇总全部资产人员，计划改人同时保存配置并同步全部资产',()=>{
 const changed=jest.fn();render(<Harness onChanged={changed}/>);
 expect(screen.getByLabelText('P1-盘点执行人').value).toBe('冯丽婷、徐博');
 fireEvent.click(screen.getByLabelText('P1-盘点执行人'));
 expect(screen.queryByRole('button',{name:'选择李磊'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'选择冯丽婷'}));
 expect(changed.mock.calls.at(-1)[0].every(asset=>asset.executor==='冯丽婷')).toBe(true);
 expect(screen.getByLabelText('P1-盘点执行人').value).toBe('冯丽婷');
 expect(screen.getByRole('status').textContent).toContain('"executor":"冯丽婷"');
});
test('计划名可保存修改，自定义空名被拦截并保留原名',()=>{
 render(<Harness/>);const name=screen.getByLabelText('P1-计划名称');
 fireEvent.blur(name,{target:{value:'复核计划'}});
 expect(screen.getByRole('status').textContent).toContain('复核计划');
 fireEvent.blur(name,{target:{value:'  '}});
 expect(mockWarning).toHaveBeenCalledWith('自定义计划名称必填');
 expect(screen.getByRole('status').textContent).toContain('复核计划');
});
test('机房初盘和启动后人员均只读，启动处重新核验财务资格',()=>{
 const view=render(<Harness plan={{...draft,range:'机房'}} projectType="初盘"/>);
 expect(screen.queryByLabelText('P1-盘点执行人')).toBeNull();
 view.unmount();
 render(<Harness initialAssets={originalAssets.map(asset=>({...asset,executor:'李磊'}))}/>);
 fireEvent.click(screen.getByRole('button',{name:'选择首个计划'}));
 fireEvent.click(screen.getByRole('button',{name:'启动盘点计划'}));
 expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('须为财务人员'));
 expect(screen.getByRole('status').textContent).toContain('草稿');
});
test('盘点中不再提供计划名及人员修改入口',()=>{
 render(<Harness plan={{...draft,status:'盘点中'}}/>);
 expect(screen.queryByLabelText('P1-盘点执行人')).toBeNull();
 expect(screen.queryByLabelText('P1-盘点监督人')).toBeNull();
 expect(screen.queryByLabelText('P1-计划名称')).toBeNull();
});

test('复盘日期允许多天，修改开始日不再覆盖结束日，结束日允许稍后日期并可启动',()=>{
 render(<Harness/>);
 fireEvent.change(screen.getByLabelText('P1-盘点开始日期'),{target:{value:'2026-10-24'}});
 expect(screen.getByLabelText('P1-盘点结束日期').value).toBe('2026-10-23');
 expect(screen.getByLabelText('P1-盘点结束日期')).toHaveAttribute('data-later-disabled','false');
 fireEvent.change(screen.getByLabelText('P1-盘点结束日期'),{target:{value:'2026-10-26'}});
 fireEvent.click(screen.getByRole('button',{name:'选择首个计划'}));
 fireEvent.click(screen.getByRole('button',{name:'启动盘点计划'}));
 expect(screen.getByRole('status').textContent).toContain('盘点中');
 expect(screen.getByRole('status').textContent).toContain('2026-10-26');
});

test('新草稿与旧审批同编号同key，明确启动后仍盘点中且产生新实例标记',()=>{
 const project={creator:'冯丽婷',projectNo:'CFG',projectType:'复盘'};
 submitReplayReview({project,plans:[{...draft,status:'盘点中'}],assetsForPlan:()=>originalAssets,operator:'冯丽婷'});
 render(<Harness/>);
 expect(screen.getByRole('status').textContent).toContain('草稿');
 fireEvent.click(screen.getByRole('button',{name:'选择首个计划'}));
 fireEvent.click(screen.getByRole('button',{name:'启动盘点计划'}));
 expect(screen.getByRole('status').textContent).toContain('盘点中');
 expect(screen.getByRole('status').textContent).toContain('reviewInstanceKey');
 fireEvent.click(screen.getByRole('button',{name:'选择首个计划'}));
 expect(screen.getByRole('button',{name:'提交计划审批'})).toBeEnabled();
 expect(screen.queryByRole('button',{name:'P1'})).toBeNull();
 expect(getReplaySubmission('CFG').planReviews.P1.status).toBe('审核中');
});
