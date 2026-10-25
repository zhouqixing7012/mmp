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
  return { Alert: Box, Card: Box, Space: Box, Button: ({ children, onClick, disabled }) => <button disabled={disabled} onClick={onClick}>{children}</button>, DatePicker: () => null, Input: () => null, Select: ({options,value,onChange}) => <select aria-label={options.some(option=>option.value==='公共') ? '范围筛选' : '计划状态筛选'} value={value || ''} onChange={event=>onChange(event.target.value)}><option value=""/>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>,
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
  render(<AssetInventoryVariantProvider allowedRanges={['员工', '公共']}><AssetInventoryPlansV2Refined project={{ projectNo: 'P', projectType: '初盘' }} rows={rows} setRows={jest.fn()} assetsForPlan={() => []} /></AssetInventoryVariantProvider>);
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
  render(<AssetInventoryPlansV2Refined project={{ projectNo: 'P', projectType: '初盘' }} rows={[{ key: 'p1', planNo: 'P1', range: '员工', status: '草稿' }]} setRows={setRows} assetsForPlan={() => [{ quantity: 2, inventoryStatus: '未盘' }]} canManualCreate onGenerateRemainingDefault={onGenerateRemainingDefault} onManualCreate={onManualCreate} />);
  fireEvent.click(screen.getByRole('button', { name: '选择计划' }));
  fireEvent.click(screen.getByRole('button', { name: '启动盘点计划' }));
  const options = Modal.confirm.mock.calls[0][0];
  options.onOk(); options.onCancel();
  expect(onGenerateRemainingDefault).toHaveBeenCalledTimes(1);
  expect(onManualCreate).toHaveBeenCalledTimes(1);
  expect(setRows).not.toHaveBeenCalled();
});

test('复盘仅提供位置变更池入口，不再发起或查看位置审批', () => {
 render(<AssetInventoryPlansV2Refined project={{projectNo:'R1',projectType:'复盘'}} rows={[]} setRows={jest.fn()} assetsForPlan={()=>[]}/>);
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
 render(<AssetInventoryVariantProvider allowedRanges={['公共']}><AssetInventoryPlansV2Refined project={{projectNo:'R2',projectType:'复盘'}} rows={rows} setRows={setRows} assetsForPlan={()=>[]}/></AssetInventoryVariantProvider>);
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
