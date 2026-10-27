import { submitReplayReview, submitReplayProjectReview, decideReplayReview, getReplaySubmission } from './inventoryReplayReviewStore';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import { downloadInventoryPlans } from './inventoryPlanExport';
import { AssetInventoryVariantProvider } from './AssetInventoryVariantContext';
import AssetInventoryPlansV2Refined from './AssetInventoryPlansV2Refined';
jest.mock('./inventoryPlanExport', () => ({ ...jest.requireActual('./inventoryPlanExport'), downloadInventoryPlans: jest.fn() }));
jest.mock('./AssetInventoryImageReviewV2', () => ({ buildReviewRows: () => [] }));
jest.mock('antd', () => {
  const Box = ({ children }) => <div>{children}</div>;
  return { Dropdown: ({children}) => <>{children}</>, Alert: Box, Card: Box, Space: Box, Button: ({ children, onClick, disabled }) => <button disabled={disabled} onClick={onClick}>{children}</button>, DatePicker: () => null, Input: () => null, Select: ({options,value,onChange}) => <select aria-label={options.some(option=>option.value==='公共') ? '范围筛选' : '计划状态筛选'} value={value || ''} onChange={event=>onChange(event.target.value)}><option value=""/>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>,
    Typography: { Title: Box, Text: Box }, Modal: Object.assign(({open,onOk}) => open ? <button onClick={onOk}>保存批量日期</button> : null, { confirm: jest.fn() }),
    Table: ({ dataSource, rowSelection }) => <div>{dataSource.map(row=><span key={row.key}>{row.planNo}</span>)}<button onClick={() => rowSelection.onChange([dataSource[0].key])}>选择计划</button></div>,
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), error: jest.fn() }, null] } };
});
jest.mock('../../components/AssetQueryControls', () => ({ AssetValueSelect: () => null, matchesQuerySelection: () => true }));
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: ({children,onQuery}) => <div>{children}<button onClick={onQuery}>查询</button></div>, QueryItem: ({children}) => <div>{children}</div> }));
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: () => null, DetailItem: () => null }));
jest.mock('../../components/StatusTag', () => () => null);
jest.mock('./InventoryLocationChangeFlow', () => ({project,onBack}) => <section><h2>位置变更池内容{project.projectNo}</h2><button onClick={onBack}>池返回</button></section>);
jest.mock('./InventoryReplayReview', () => () => null);

test('计划查询无结果时回退允许范围全部计划，勾选时仍只导出所选', () => {
  downloadInventoryPlans.mockClear();
  const rows = [{ key: 'a', planNo: 'A', range: '员工', status: '草稿' }, { key: 'b', planNo: 'B', range: '公共', status: '草稿' }, { key: 'c', planNo: 'C', range: '机房', status: '草稿' }];
  render(<AssetInventoryVariantProvider allowedRanges={['员工', '公共']}><AssetInventoryPlansV2Refined currentOperator="孙志强" project={{ creator: '孙志强', projectNo: 'P', projectType: '初盘' }} rows={rows} setRows={jest.fn()} assetsForPlan={() => []} /></AssetInventoryVariantProvider>);
  fireEvent.change(screen.getByLabelText('计划状态筛选'), { target: { value: '已审核' } });
  fireEvent.click(screen.getByRole('button', { name: '查询' }));
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(downloadInventoryPlans.mock.calls.at(-1)[0].map(row => row.planNo)).toEqual(['A', 'B']);
  fireEvent.change(screen.getByLabelText('计划状态筛选'), { target: { value: '草稿' } });
  fireEvent.click(screen.getByRole('button', { name: '查询' }));
  fireEvent.click(screen.getByRole('button', { name: '选择计划' }));
  fireEvent.click(screen.getByRole('button', { name: '导出' }));
  expect(downloadInventoryPlans.mock.calls.at(-1)[0].map(row => row.planNo)).toEqual(['A']);
});
test('启动前发现未分配资产，要求默认补计划或手工创建，不直接启动已选计划', () => {
  const setRows = jest.fn(); const onGenerateRemainingDefault = jest.fn(); const onManualCreate = jest.fn();
  render(<AssetInventoryPlansV2Refined currentOperator="孙志强" project={{ creator: '孙志强', projectNo: 'P', projectType: '初盘' }} rows={[{ key: 'p1', planNo: 'P1', range: '员工', status: '草稿' }]} setRows={setRows} assetsForPlan={() => [{ quantity: 2, inventoryStatus: '未盘' }]} canManualCreate onGenerateRemainingDefault={onGenerateRemainingDefault} onManualCreate={onManualCreate} />);
  fireEvent.click(screen.getByRole('button', { name: '选择计划' }));
  fireEvent.click(screen.getByRole('button', { name: '启动盘点计划' }));
  const options = Modal.confirm.mock.calls[0][0];
  options.onOk(); options.onCancel();
  expect(onGenerateRemainingDefault).toHaveBeenCalledTimes(1);
  expect(onManualCreate).toHaveBeenCalledTimes(1);
  expect(setRows).not.toHaveBeenCalled();
});

test('复盘仅提供位置变更池入口，不再发起或查看位置审批', () => {
 render(<AssetInventoryPlansV2Refined project={{projectNo:'R1',projectType:'复盘'}} rows={[{key:'p',planNo:'P',range:'员工',status:'盘点中'}]} setRows={jest.fn()} assetsForPlan={()=>[]}/>);
 expect(screen.queryByRole('button',{name:'发起位置变更'})).toBeNull();
 expect(screen.queryByRole('button',{name:'位置变更记录'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'位置变更池'}));
 expect(screen.getByRole('heading',{name:'位置变更池内容R1'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'池返回'}));
 expect(screen.getByRole('button',{name:'位置变更池'})).toBeEnabled();
});

test('楼层汇总多范围计划可按授权及范围查询展示，批量日期也包含混合范围计划',()=>{
 const rows=[{key:'mixed',planNo:'MIXED',range:'员工、公共',ranges:['员工','公共'],status:'草稿',startDate:'2026-10-25',endDate:'2026-10-28'}, {key:'public',planNo:'PUBLIC',range:'公共',status:'草稿',startDate:'2026-10-20',endDate:'2026-10-22'}, {key:'employee',planNo:'EMPLOYEE',range:'员工',status:'草稿'}];
 const setRows=jest.fn();
 render(<AssetInventoryVariantProvider allowedRanges={['公共']}><AssetInventoryPlansV2Refined currentOperator="冯丽婷" project={{creator:'冯丽婷',projectNo:'R2',projectType:'复盘'}} rows={rows} setRows={setRows} assetsForPlan={()=>[]}/></AssetInventoryVariantProvider>);
 expect(screen.getByText('MIXED')).toBeInTheDocument();
 expect(screen.queryByText('EMPLOYEE')).toBeNull();
 fireEvent.change(screen.getByLabelText('范围筛选'),{target:{value:'公共'}});
 fireEvent.click(screen.getByRole('button',{name:'查询'}));
 expect(screen.getByText('MIXED')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'批量编辑盘点日期'}));
 fireEvent.click(screen.getByRole('button',{name:'保存批量日期'}));
 const updated=setRows.mock.calls.at(-1)[0](rows);
 expect(updated.find(row=>row.planNo==='PUBLIC').endDate).toBe('2026-10-28');
 expect(updated.find(row=>row.planNo==='MIXED').endDate).toBe('2026-10-28');
 expect(updated.find(row=>row.planNo==='EMPLOYEE').endDate).toBeUndefined();
 fireEvent.click(screen.getByRole('button',{name:'导出'}));
 expect(downloadInventoryPlans).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({planNo:'MIXED'})]),expect.any(Function),'R2',{project:expect.objectContaining({projectType:'复盘'})});
});

test('部分计划已启动时仍可删除草稿计划，通知父级释放其资产分配', () => {
  const started = { key: 'a', planNo: 'A', range: '员工', status: '盘点中' };
  const draft = { key: 'b', planNo: 'B', range: '公共', status: '草稿' };
  const setRows = jest.fn(); const onPlansDeleted = jest.fn();
  render(<AssetInventoryPlansV2Refined project={{ creator: '孙志强', projectNo: 'P', projectType: '初盘', status: '盘点中' }} currentOperator="孙志强" rows={[draft, started]} setRows={setRows} assetsForPlan={() => []} onPlansDeleted={onPlansDeleted} />);
  fireEvent.click(screen.getByRole('button', { name: '选择计划' }));
  fireEvent.click(screen.getByRole('button', { name: '删除盘点计划' }));
  expect(onPlansDeleted).toHaveBeenCalledWith([expect.objectContaining(draft)]);
  expect(setRows.mock.calls[0][0]([draft, started])).toEqual([started]);
});

test('复盘按钮随启动、全部分配及全部计划审批条件展示', () => {
 window.localStorage.clear();
 const project = { projectNo: 'BUTTONS', creator: '冯丽婷', projectType: '复盘', status: '盘点中' };
 const plan = { key: 'p', planNo: 'PB', range: '员工', status: '草稿' };
 const assetsForPlan = () => [{ key: 'a', assetTag: 'A', quantity: 1, supervisor: '冯丽婷', executor: '冯丽婷' }];
 const props = { project, currentOperator: '冯丽婷', rows: [plan], setRows: jest.fn(), assetsForPlan };
 const view = render(<AssetInventoryPlansV2Refined {...props} />);
 expect(screen.queryByRole('button', { name: '提交计划审批' })).toBeNull();
 expect(screen.queryByRole('button', { name: '位置变更池' })).toBeNull();
 expect(screen.queryByRole('button', { name: '提交项目审批' })).toBeNull();
 const started = { ...plan, status: '盘点中' };
 view.rerender(<AssetInventoryPlansV2Refined {...props} rows={[started]} allAssetsPlanned />);
 expect(screen.getByRole('button', { name: '提交计划审批' })).toBeInTheDocument();
 expect(screen.getByRole('button', { name: '位置变更池' })).toBeInTheDocument();
 expect(screen.queryByRole('button', { name: '提交项目审批' })).toBeNull();
 submitReplayReview({ project, plans: [started], assetsForPlan, operator: '冯丽婷' });
 const review = getReplaySubmission(project.projectNo).planReviews.PB;
 decideReplayReview({ project, operator: '冯丽婷', decision: '同意', planNo: 'PB', round: review.round, planKey: review.plans[0].key, reviewInstanceKey: review.plans[0].reviewInstanceKey });
 view.unmount();
 const utils = render(<AssetInventoryPlansV2Refined {...props} rows={[started]} allAssetsPlanned={false} />);
 expect(screen.getByRole('button', { name: '位置变更池' })).toBeInTheDocument();
 expect(screen.queryByRole('button', { name: '提交项目审批' })).toBeNull();
 utils.rerender(<AssetInventoryPlansV2Refined {...props} rows={[started]} allAssetsPlanned />);
 expect(screen.getByRole('button', { name: '提交项目审批' })).toBeEnabled();
 utils.rerender(<AssetInventoryPlansV2Refined {...props} rows={[started, { ...plan, key: 'other', planNo: 'OTHER' }]} allAssetsPlanned />);
 expect(screen.queryByRole('button', { name: '提交项目审批' })).toBeNull();
});


test('徐博驳回后项目提交按钮直接可用，计划仍已审核且不能重提计划', () => {
 window.localStorage.clear();
 const project = { projectNo: 'DIRECT-RESUBMIT', creator: '冯丽婷', projectType: '复盘', status: '盘点中' };
 const plan = { key: 'p', planNo: 'P', range: '员工', status: '盘点中' };
 const assetsForPlan = () => [{ key: 'a', assetTag: 'A', quantity: 1, supervisor: '冯丽婷', executor: '冯丽婷' }];
 submitReplayReview({ project, plans: [plan], assetsForPlan, operator: '冯丽婷' });
 let state = getReplaySubmission(project.projectNo);
 decideReplayReview({ project, operator: '冯丽婷', decision: '同意', planNo: 'P', round: state.planReviews.P.round, planKey: 'p' });
 submitReplayProjectReview({ project, plans: [plan], operator: '冯丽婷' });
 decideReplayReview({ project, operator: '徐博', scope: 'project', round: 1, decision: '驳回', opinion: '请补充' });
 render(<AssetInventoryPlansV2Refined project={project} currentOperator="冯丽婷" rows={[plan]} setRows={jest.fn()} assetsForPlan={assetsForPlan} allAssetsPlanned />);
 expect(screen.getByRole('button', { name: '提交项目审批' })).toBeEnabled();
 fireEvent.click(screen.getByRole('button', { name: '选择计划' }));
 expect(screen.getByRole('button', { name: '提交计划审批' })).toBeDisabled();
 fireEvent.click(screen.getByRole('button', { name: '提交项目审批' }));
 state = getReplaySubmission(project.projectNo);
 expect(state.projectReview.round).toBe(2);
 expect(state.projectReview.status).toBe('审核中');
 expect(state.planReviews.P.status).toBe('已审核');
 expect(state.planReviews.P.round).toBe(1);
});
