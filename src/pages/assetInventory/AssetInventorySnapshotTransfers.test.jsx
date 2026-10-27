import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Modal } from 'antd';
import * as XLSX from 'xlsx';
import { serializeInventoryAssetExport } from './inventoryAssetExport';
import AssetInventorySnapshotDetailV2, { SnapshotAssetTab } from './AssetInventorySnapshotDetailV2';

jest.mock('antd', () => {
  const Box = ({ children }) => <div>{children}</div>;
  return {
    Button: ({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
    Card: Box, Space: Box, Select: () => null, Statistic: Box, Tabs: Box,
    Table: ({ dataSource, rowSelection }) => <div data-testid="asset-count">{dataSource.length}<button onClick={() => rowSelection.onChange([dataSource[0]?.key])}>只勾首项</button></div>,
    Typography: { Title: Box, Text: Box },
    Modal: Object.assign(({ open, children, footer }) => open ? <div>{children}{footer}</div> : null, { confirm: jest.fn() }),
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), info: jest.fn() }, null] },
  };
});
jest.mock('./InventoryAssetQuery', () => ({ __esModule: true, default: ({ filters, onChange, onQuery }) => <div>
  <input aria-label="标签条件" value={filters.assetTag} onChange={event => onChange({ ...filters, assetTag: event.target.value })} />
  <button onClick={onQuery}>执行查询</button>
</div> }));
jest.mock('../../components/AssetQueryControls', () => ({ formatAssetCategory: () => '' }));
jest.mock('../../components/DetailGrid', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div>, DetailItem: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/StatusTag', () => ({ value }) => <span>{value}</span>);
jest.mock('./inventoryPhotoImportStore', () => ({ ...jest.requireActual('./inventoryPhotoImportStore'), importInventoryPhotoFiles: jest.fn() }));
jest.mock('./inventoryAssetExport', () => ({ ...jest.requireActual('./inventoryAssetExport'), serializeInventoryAssetExport: jest.fn(() => ({ csv: '', missingFields: [] })) }));

const assets = Array.from({ length: 25 }, (_, i) => ({ key: `a${i}`, assetTag: `A-${i}`, inventoryRange: '员工', owner: '责任人', inventoryStatus: '未盘' }));
const makeProps = (extra = {}) => ({ type: 'execution', projectStatus: '快照生成', projectNo: 'CP-1', project: { projectNo: 'CP-1', creator: '孙志强' }, currentOperator: '孙志强', rows: assets,
  setRows: jest.fn(), setOtherRows: jest.fn(), onMoveRows: jest.fn(),
  messageApi: { warning: jest.fn(), success: jest.fn(), info: jest.fn() }, ...extra });

test('快照清单导出非空查询取匹配全页，空查询回退当前清单全部资产', () => {
  serializeInventoryAssetExport.mockReturnValue({ csv: '', missingFields: [] });
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
  URL.createObjectURL = jest.fn(() => 'blob:export'); URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    render(<SnapshotAssetTab {...makeProps()} />);
    fireEvent.change(screen.getByLabelText('标签条件'), { target: { value: 'A-1' } });
    fireEvent.click(screen.getByText('执行查询'));
    fireEvent.click(screen.getByRole('button', { name: '导出' }));
    expect(serializeInventoryAssetExport.mock.calls.at(-1)[0]).toHaveLength(11);
    fireEvent.change(screen.getByLabelText('标签条件'), { target: { value: '不存在' } });
    fireEvent.click(screen.getByText('执行查询'));
    fireEvent.click(screen.getByRole('button', { name: '导出' }));
    expect(serializeInventoryAssetExport.mock.calls.at(-1)[0]).toEqual(assets);
  } finally { click.mockRestore(); URL.createObjectURL = create; URL.revokeObjectURL = revoke; }
});

test.each([['初盘', '是否按子公司＋盘点范围生成盘点计划？'], ['复盘', '是否按楼层汇总生成复盘计划？']])('%s默认生成入口说明实际分组，回调拒绝不更新生成状态', (projectType, content) => {
  Modal.confirm.mockClear();
  const onGenerateDefault = jest.fn(() => false);
  render(<AssetInventorySnapshotDetailV2 currentOperator="孙志强" project={{ creator: '孙志强', projectNo: 'GEN', projectType, status: '快照生成', scopeRanges: ['员工'] }} assets={[assets[0]]} onGenerateDefault={onGenerateDefault} />);
  fireEvent.click(screen.getByRole('button', { name: '生成盘点计划' }));
  const dialog = Modal.confirm.mock.calls[0][0];
  expect(dialog.content).toBe(content);
  act(() => dialog.onOk());
  expect(onGenerateDefault).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: '生成盘点计划' })).toBeInTheDocument();
});

test.each(['execution', 'notExecution', 'excluded'])('%s不提供查询条件转移，保留勾选及模板转移', type => {
  const props = makeProps({ type });
  render(<SnapshotAssetTab {...props} />);
  expect(screen.queryByText(/按查询条件转移/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('只勾首项'));
  const label = type === 'execution' ? '转移至未执行盘点' : type === 'notExecution' ? '转移至执行盘点' : '批量转移至执行盘点';
  fireEvent.click(screen.getByText(label));
  expect(props.onMoveRows).toHaveBeenCalledWith(new Set(['a0']), [expect.objectContaining({ key: 'a0', executeInventory: type !== 'execution' })], type !== 'execution');
  expect(screen.getByText(type === 'excluded' ? '批量导入转移' : type === 'execution' ? '模板转移至未执行盘点' : '模板转移至执行盘点')).toBeInTheDocument();
});

test.each(['盘点中', '审核中', '已审核', '盘点关闭'])('%s未包含清单不允许三类转移', status => {
  render(<SnapshotAssetTab {...makeProps({ type: 'excluded', projectStatus: status })} />);
  expect(screen.queryByText('按查询条件转移至执行盘点')).not.toBeInTheDocument();
  expect(screen.queryByText('按查询条件转移至未执行盘点')).not.toBeInTheDocument();
  expect(screen.queryByText('批量转移至执行盘点')).not.toBeInTheDocument();
  expect(screen.queryByText('批量导入转移')).not.toBeInTheDocument();
});

test('生成草稿计划后仍允许启动前勾选转移', () => {
  const props = makeProps({ projectStatus: '生成盘点计划', type: 'excluded' });
  render(<SnapshotAssetTab {...props} />);
  fireEvent.click(screen.getByText('只勾首项'));
  fireEvent.click(screen.getByText('批量转移至执行盘点'));
  expect(props.onMoveRows).toHaveBeenCalledWith(expect.any(Set), expect.any(Array), true);
});

test('文件读取期间项目启动，整批模板转移被阻止', async () => {
  const props = makeProps();
  const { rerender } = render(<SnapshotAssetTab {...props} />);
  fireEvent.click(screen.getByText('模板转移至未执行盘点'));
  let finishRead;
  const file = { name: '转移.xlsx', arrayBuffer: () => new Promise(resolve => { finishRead = resolve; }) };
  const input = screen.getByLabelText('转移资产文件');
  fireEvent.change(input, { target: { files: [file] } });
  rerender(<SnapshotAssetTab {...props} projectStatus="盘点中" />);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['资产标签号'], ['A-0']]), '转移');
  finishRead(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }));
  await waitFor(() => expect(props.messageApi.warning).toHaveBeenCalledWith('计划已启动，不能调整盘点范围'));
  expect(props.onMoveRows).not.toHaveBeenCalled();
});

test('非机房不展示照片导入，机房盘点中保留照片入口', () => {
  const props = makeProps({ projectStatus: '盘点中', project: { projectNo: 'CP-1', status: '盘点中', creator: '孙志强' }, currentOperator: '孙志强' });
  const { rerender } = render(<SnapshotAssetTab {...props} />);
  expect(screen.queryByText('导入盘点照片')).not.toBeInTheDocument();
  rerender(<SnapshotAssetTab {...props} machineRoomProject />);
  expect(screen.getByText('导入盘点照片')).toBeInTheDocument();
  fireEvent.click(screen.getByText('导入盘点结果'));
  expect(screen.getByRole('button', { name: '选择Excel文件' })).toBeInTheDocument();
  expect(props.messageApi.warning).not.toHaveBeenCalled();
});


test('机房项目快照生成及盘点中展示照片上传，审批中和关闭时不展示', () => {
  const roomAsset = { key: 'room', assetTag: 'ROOM-1', inventoryRange: '机房', planNo: 'P1', executor: '200-执行人' };
  const props = makeProps({ projectStatus: '快照生成', project: { projectNo: 'ROOM-ENTRY', creator: '100-创建人', scopeRanges: ['机房'] }, currentOperator: '200-执行人', rows: [roomAsset], plans: [{ planNo: 'P1', status: '暂存' }], machineRoomProject: true });
  const { rerender } = render(<SnapshotAssetTab {...props} />);
  expect(screen.getByText('导入盘点照片')).toBeInTheDocument();
  fireEvent.click(screen.getByText('导入盘点照片'));
  expect(props.messageApi.warning).not.toHaveBeenCalled();
  rerender(<SnapshotAssetTab {...props} projectStatus="盘点中" />);
  expect(screen.getByText('导入盘点照片')).toBeInTheDocument();
  rerender(<SnapshotAssetTab {...props} projectStatus="审核中" />);
  expect(screen.queryByText('导入盘点照片')).toBeNull();
  rerender(<SnapshotAssetTab {...props} projectStatus="盘点关闭" />);
  expect(screen.queryByText('导入盘点照片')).toBeNull();
});
