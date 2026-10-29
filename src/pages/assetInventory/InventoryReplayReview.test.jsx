import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import InventoryReplayReview from './InventoryReplayReview';
import { getReplaySubmission, submitReplayReview, submitReplayProjectReview, decideReplayReview } from './inventoryReplayReviewStore';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
jest.mock('./AssetInventoryImageReviewV2', () => ({ buildReviewRows: () => [] }));
jest.mock('antd',()=>({
 Dropdown:({children})=><>{children}</>,
 Alert:({message})=><div>{message}</div>, DatePicker:()=>null, Modal:Object.assign(()=>null,{confirm:jest.fn()}), message:{useMessage:()=>[{warning:jest.fn(),success:jest.fn(),error:jest.fn()},null]},
 Button:({children,onClick,disabled,danger,icon,...props})=><button disabled={disabled} onClick={onClick} {...props}>{children}</button>,Card:({children,title})=><section>{title}{children}</section>,Space:({children,...props})=><div {...Object.fromEntries(Object.entries(props).filter(([key])=>key.startsWith('data-')))}>{children}</div>,Typography:{Title:({children})=><h1>{children}</h1>,Text:({children})=><span>{children}</span>},
 TreeSelect:Object.assign(()=>null,{SHOW_PARENT:'SHOW_PARENT'}),
 Input:Object.assign(({onPressEnter,suffix,allowClear,...props})=><input {...props}/>, { TextArea: ({value,onChange,...props}) => <textarea value={value} onChange={onChange} {...props}/> }),Select:({value,options,onChange})=><select value={value} onChange={e=>onChange(e.target.value)}><option value=""/>{options.map(o=><option key={o.value}>{o.value}</option>)}</select>,
 Table:({columns,dataSource,rowSelection})=><>{rowSelection && dataSource.map(row=><button key={row.key} onClick={()=>rowSelection.onChange([row.key])}>{`选择${row.planNo}`}</button>)}<table><thead><tr>{columns.map(c=><th key={c.title}>{c.title}</th>)}</tr></thead><tbody>{dataSource.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.title}>{c.render?c.render(r[c.dataIndex],r):r[c.dataIndex]}</td>)}</tr>)}</tbody></table></>
}));
jest.mock('../../components/QueryBar',()=>({__esModule:true,default:({children,onQuery,onReset})=><div>{children}<button onClick={onQuery}>查询</button><button onClick={onReset}>重置</button></div>,QueryItem:({label,children})=><label>{label}{children}</label>}));
jest.mock('../../components/DetailGrid',()=>({__esModule:true,default:({children})=><div>{children}</div>,DetailItem:({children})=><span>{children}</span>}));
jest.mock('../../components/StatusTag',()=>({value})=><span>{value}</span>);
jest.mock('../../components/SelectModal',()=>()=>null);
jest.mock('./InventoryLocationChangeFlow',()=>()=>null);
const plans=[{planNo:'P1',planName:'员工',range:'员工'},{planNo:'P2',planName:'公共',range:'公共'}];
const rawAssetsForPlan=p=>p.planNo==='P1'?[{key:'a',assetTag:'A',description:'笔记本',inventoryStatus:'未盘'},{key:'b',assetTag:'B',description:'手机',inventoryStatus:'已盘'}]:[{key:'c',assetTag:'C',description:'显示器',inventoryStatus:'未盘'}];
const assetsForPlan = plan => rawAssetsForPlan(plan).map(asset => ({...asset,quantity:1,supervisor: plan.planNo === 'P1' ? '冯丽婷' : '徐博',executor:'冯丽婷'}));
beforeEach(()=>window.localStorage.clear());
const setup=()=>render(<InventoryReplayReview project={{period:'2026'}} plans={plans} assetsForPlan={assetsForPlan} submission={{records:[{key:'start',node:'开始',status:'已提交'}]}} onBack={()=>{}}/>);
test('复盘审核可按查询条件筛选，并恢复全部当前计划资产',()=>{setup();fireEvent.change(screen.getByLabelText('资产标签号'),{target:{value:'B'}});fireEvent.click(screen.getByText('查询',{selector:'button'}));expect(screen.queryByText('笔记本')).not.toBeInTheDocument();expect(screen.getByText('手机')).toBeInTheDocument();fireEvent.click(screen.getByText('重置'));expect(screen.getByText('笔记本')).toBeInTheDocument();});
test('点击不同计划仅展示该计划的资产，监督人固定徐博',()=>{setup();fireEvent.click(screen.getByRole('button',{name:'P2'}));expect(screen.getByText('显示器')).toBeInTheDocument();expect(screen.queryByText('手机')).not.toBeInTheDocument();expect(screen.getAllByText('徐博')).toHaveLength(2);expect(screen.getByRole('columnheader',{name:'责任人部门'})).toBeInTheDocument();expect(screen.queryByRole('columnheader',{name:'计划负责人'})).toBeNull();});

test('逐计划入口仅提交对应计划，全部通过后才开放项目审批，徐博复用审核页完成',()=>{
 const project = {creator:'冯丽婷',projectType:'复盘',projectNo:'R-ui',period:'2026'};
 function Harness({operator}) { const [rows,setRows]=React.useState(plans.map(plan=>({...plan,key:plan.planNo,status:'盘点中'}))); return <AssetInventoryPlansV2Refined allAssetsPlanned project={project} currentOperator={operator} rows={rows} setRows={setRows} assetsForPlan={assetsForPlan}/>; }
 let view=render(<Harness operator="冯丽婷"/>);
 expect(screen.queryByRole('button',{name:'提交项目审批'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'选择P1'}));
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果编辑"]')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'提交'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果审核"]')).toBeInTheDocument();
 expect(screen.queryByText('财务经理审批')).toBeNull();
 expect(screen.queryByText('ES主管审批')).toBeNull();
 expect(screen.queryByText('NO领导审批')).toBeNull();
 expect(screen.queryByRole('columnheader',{name:'内审监督人'})).toBeNull();
 fireEvent.change(screen.getByLabelText('复盘审批意见'),{target:{value:'现场复核'}});
 fireEvent.click(screen.getByRole('button',{name:'同意'}));
 expect(screen.queryByText('狐小e待办处理记录')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 expect(screen.queryByRole('button',{name:'提交项目审批'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'选择P2'}));
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批'}));
 fireEvent.click(screen.getByRole('button',{name:'提交'}));
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 view.unmount();
 view=render(<Harness operator="徐博"/>);
 fireEvent.click(screen.getByRole('button',{name:'选择P2'}));
 fireEvent.click(screen.getByRole('button',{name:'P2'}));
 fireEvent.click(screen.getByRole('button',{name:'同意'}));
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 expect(screen.getByRole('button',{name:'提交项目审批'})).toBeDisabled();
 view.unmount();
 view=render(<Harness operator="冯丽婷"/>);
 expect(screen.getByRole('button',{name:'提交项目审批'})).toBeEnabled();
 fireEvent.click(screen.getByRole('button',{name:'提交项目审批'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果审核"]')).toBeInTheDocument();
 expect(screen.getByText('财务经理审批')).toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 view.unmount();
 view=render(<Harness operator="徐博"/>);
 fireEvent.click(screen.getByRole('button',{name:'查看项目审批'}));
 fireEvent.click(screen.getByRole('button',{name:'同意'}));
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 view.unmount();
 render(<Harness operator="徐博"/>);
 fireEvent.click(screen.getByRole('button',{name:'查看项目审批'}));
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
});

test('计划驳回后恢复该计划提交入口，重提保留意见',()=>{
 const project={creator:'冯丽婷',projectNo:'R-reject',projectType:'复盘'};
 function Harness(){ const [rows,setRows]=React.useState([{...plans[0],key:'P1',status:'盘点中'}]);return <AssetInventoryPlansV2Refined project={project} currentOperator="冯丽婷" rows={rows} setRows={setRows} assetsForPlan={assetsForPlan}/>; }
 render(<Harness/>);
 fireEvent.click(screen.getByRole('button',{name:'选择P1'}));
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果编辑"]')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'提交'}));
 fireEvent.change(screen.getByLabelText('复盘审批意见'),{target:{value:'请补充'}});
 fireEvent.click(screen.getByRole('button',{name:'驳回'}));
 expect(screen.queryByText('演示已清除')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 fireEvent.click(screen.getByRole('button',{name:'选择P1'}));
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果编辑"]')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'提交'}));
 expect(screen.getByText('请补充')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'同意'})).toBeInTheDocument();
});

test('关闭项目时计划审批只读',()=>{
 const project={creator:'冯丽婷',projectNo:'R-close',projectType:'复盘'};
 const state=submitReplayReview({project,plans:[{...plans[0],status:'盘点中'}],assetsForPlan,operator:'冯丽婷'});
 const review=state.planReviews.P1;
 render(<InventoryReplayReview project={{...project,status:'盘点关闭'}} plans={review.plans} submission={review} assetsForPlan={assetsForPlan} currentOperator="冯丽婷" onDecide={jest.fn()}/>);
 expect(screen.queryByRole('button',{name:'同意'})).toBeNull();
 expect(screen.queryByRole('button',{name:'驳回'})).toBeNull();
});

 test('复盘信息隐藏已盘数量，未盘必盘数量只计必盘且状态未盘的资产', () => {
 const list = [{key:'1',assetTag:'A',quantity:10,inventoryStatus:'未盘',isMandatory:true},{key:'2',assetTag:'B',quantity:2,inventoryStatus:'未盘',isMandatory:false},{key:'3',assetTag:'C',quantity:3,inventoryStatus:'已盘',isMandatory:true},{key:'4',assetTag:'D',quantity:4,inventoryStatus:'报失',isMandatory:true},{key:'5',assetTag:'E',quantity:5,inventoryStatus:'审核中',isMandatory:true}];
 render(<InventoryReplayReview project={{period:'2026'}} plans={[plans[0]]} assetsForPlan={()=>list} submission={{records:[]}} onBack={()=>{}}/>);
 expect(screen.queryByRole('columnheader',{name:'已盘数量'})).toBeNull();
 const headers=screen.getAllByRole('columnheader').map(node=>node.textContent);
 expect(headers[headers.indexOf('未盘数量')+1]).toBe('未盘必盘数量');
 const cells=within(screen.getAllByRole('row')[1]).getAllByRole('cell');
 expect(cells[headers.indexOf('未盘必盘数量')]).toHaveTextContent('10');
 });

test('工具栏先选一已启动计划进入编辑，进入和返回都不生成审批记录，明确提交才进入审核',()=>{
 const project={creator:'冯丽婷',projectNo:'R-edit',projectType:'复盘'};
 function Harness(){const [rows,setRows]=React.useState(plans.map(plan=>({...plan,key:plan.planNo,status:'盘点中'})));return <AssetInventoryPlansV2Refined project={project} currentOperator="冯丽婷" rows={rows} setRows={setRows} assetsForPlan={assetsForPlan}/>;}
 render(<Harness/>);
 expect(screen.getByRole('button',{name:'提交计划审批'})).toBeDisabled();
 expect(screen.queryByRole('columnheader',{name:'操作'})).toBeNull();
 expect(screen.queryByRole('columnheader',{name:'计划审批'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'选择P1'}));
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果编辑"]')).toBeInTheDocument();
 expect(screen.queryByText('审批信息')).toBeNull();
 expect(getReplaySubmission(project.projectNo)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'返回'}));
 expect(getReplaySubmission(project.projectNo)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'提交计划审批'}));
 fireEvent.click(screen.getByRole('button',{name:'提交'}));
 expect(document.querySelector('[data-mmp-page-title="复盘结果审核"]')).toBeInTheDocument();
 expect(getReplaySubmission(project.projectNo).planReviews.P1.records.some(record=>record.node==='提交计划审批')).toBe(true);
});

test('同一Plans组件切换项目不继承前项目同号计划的审批状态',()=>{
 const originalProject={creator:'冯丽婷',projectNo:'R-before',projectType:'复盘'};
 const currentPlans=[{...plans[0],key:'P1',status:'盘点中'}];
 submitReplayReview({project:originalProject,plans:currentPlans,assetsForPlan,operator:'冯丽婷'});
 const props={currentOperator:'冯丽婷',setRows:jest.fn(),assetsForPlan};
 const view=render(<AssetInventoryPlansV2Refined {...props} project={originalProject} rows={currentPlans}/>);
 fireEvent.click(screen.getByRole('button',{name:'选择P1'}));
 expect(screen.getByRole('button',{name:'P1'})).toBeInTheDocument();
 view.rerender(<AssetInventoryPlansV2Refined {...props} project={{projectNo:'R-after',projectType:'复盘'}} rows={[{...currentPlans[0],status:'草稿'}]}/>);
 fireEvent.click(screen.getByRole('button',{name:'选择P1'}));
 expect(screen.queryByRole('button',{name:'P1'})).toBeNull();
 expect(screen.queryByRole('button',{name:'提交计划审批'})).toBeNull();
 expect(getReplaySubmission('R-before').planReviews.P1.status).toBe('审核中');
 expect(getReplaySubmission('R-after')).toBeNull();
});

test('旧批次项目审批在重建计划时不显示入口，同一真实批次仍可查看',()=>{
 const project={creator:'冯丽婷',projectNo:'R-project-binding',projectType:'复盘'};
 const oldPlan={...plans[0],key:'same',reviewInstanceKey:'old',status:'盘点中'};
 submitReplayReview({project,plans:[oldPlan],assetsForPlan,operator:'冯丽婷'});
 decideReplayReview({project,planNo:oldPlan.planNo,planKey:oldPlan.key,reviewInstanceKey:'old',round:1,operator:'冯丽婷',decision:'同意'});
 submitReplayProjectReview({project,plans:[oldPlan],operator:'冯丽婷'});
 const props={project,currentOperator:'徐博',setRows:jest.fn(),assetsForPlan};
 const view=render(<AssetInventoryPlansV2Refined {...props} rows={[oldPlan]}/>);
 expect(screen.getByRole('button',{name:'查看项目审批'})).toBeInTheDocument();
 view.rerender(<AssetInventoryPlansV2Refined {...props} rows={[{...oldPlan,status:'草稿'}]}/>);
 expect(screen.queryByRole('button',{name:'查看项目审批'})).toBeNull();
 view.rerender(<AssetInventoryPlansV2Refined {...props} rows={[{...oldPlan,reviewInstanceKey:'new'}]}/>);
 expect(screen.queryByRole('button',{name:'查看项目审批'})).toBeNull();
 expect(getReplaySubmission(project.projectNo).projectReview.status).toBe('审核中');
});
