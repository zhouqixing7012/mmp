import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as XLSX from 'xlsx';
import { SnapshotAssetTab } from './AssetInventorySnapshotDetailV2';

jest.mock('antd', () => {
  const Box = ({ children }) => <div>{children}</div>;
  return {
    Button: ({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
    Card: Box, Space: Box, Select: () => null, Statistic: Box, Tabs: Box,
    Table: ({ dataSource, rowSelection }) => <div data-testid="asset-count">{dataSource.length}<button onClick={() => rowSelection.onChange([dataSource[0]?.key])}>只勾首项</button></div>,
    Typography: { Title: Box, Text: Box },
    Modal: ({ open, children, footer }) => open ? <div>{children}{footer}</div> : null,
    message: { useMessage: () => [{ warning: jest.fn(), success: jest.fn(), info: jest.fn() }, null] },
  };
});
jest.mock('./InventoryAssetQuery', () => ({ __esModule: true, default: ({ filters, onChange, onQuery }) => <div>
  <input aria-label="标签条件" value={filters.assetTag} onChange={event => onChange({ ...filters, assetTag: event.target.value })} />
  <button onClick={onQuery}>执行查询</button>
</div> }));
jest.mock('../../components/AssetQueryControls', () => ({ formatAssetCategory: () => '' }));
jest.mock('./inventoryPhotoImportStore', () => ({ importInventoryPhotoFiles: jest.fn() }));

const assets = Array.from({ length: 25 }, (_, i) => ({ key: `a${i}`, assetTag: `A-${i}`, inventoryRange: '员工', owner: '责任人', inventoryStatus: '未盘' }));
const makeProps = (extra = {}) => ({ type: 'execution', projectStatus: '快照生成', projectNo: 'CP-1', rows: assets,
  setRows: jest.fn(), setOtherRows: jest.fn(), onMoveRows: jest.fn(),
  messageApi: { warning: jest.fn(), success: jest.fn(), info: jest.fn() }, ...extra });

test('按查询条件转移覆盖全部分页，勾选及未生效条件不改变范围', () => {
  const props = makeProps();
  render(<SnapshotAssetTab {...props} />);
  fireEvent.click(screen.getByText('只勾首项'));
  fireEvent.change(screen.getByLabelText('标签条件'), { target: { value: 'A-1' } });
  fireEvent.click(screen.getByText('按查询条件转移至未执行盘点'));
  const [keys, moved, target] = props.onMoveRows.mock.calls[0];
  expect(keys.size).toBe(25);
  expect(moved).toHaveLength(25);
  expect(target).toBe(false);
  expect(moved.every(asset => asset.executeInventory === false && asset.owner === '责任人' && asset.inventoryStatus === '未盘')).toBe(true);
});

test('已生效标签条件限制完整匹配范围，不按页或勾选截断', () => {
  const props = makeProps({ type: 'notExecution' });
  render(<SnapshotAssetTab {...props} />);
  fireEvent.change(screen.getByLabelText('标签条件'), { target: { value: 'A-1' } });
  fireEvent.click(screen.getByText('执行查询'));
  fireEvent.click(screen.getByText('按查询条件转移至执行盘点'));
  const [keys, moved, target] = props.onMoveRows.mock.calls[0];
  expect(keys.size).toBe(11);
  expect(moved.map(row => row.assetTag)).toEqual(['A-1', ...Array.from({ length: 10 }, (_, i) => `A-${i + 10}`)]);
  expect(target).toBe(true);
});

test('无查询结果不转移', () => {
  const props = makeProps();
  render(<SnapshotAssetTab {...props} />);
  fireEvent.change(screen.getByLabelText('标签条件'), { target: { value: '不存在' } });
  fireEvent.click(screen.getByText('执行查询'));
  fireEvent.click(screen.getByText('按查询条件转移至未执行盘点'));
  expect(props.onMoveRows).not.toHaveBeenCalled();
  expect(props.messageApi.warning).toHaveBeenCalledWith('当前查询没有可转移的资产');
});

test.each(['盘点中', '审核中', '已审核', '盘点关闭'])('%s未包含清单不允许三类转移', status => {
  render(<SnapshotAssetTab {...makeProps({ type: 'excluded', projectStatus: status })} />);
  expect(screen.queryByText('按查询条件转移至执行盘点')).not.toBeInTheDocument();
  expect(screen.queryByText('按查询条件转移至未执行盘点')).not.toBeInTheDocument();
  expect(screen.queryByText('批量转移至执行盘点')).not.toBeInTheDocument();
  expect(screen.queryByText('批量导入转移')).not.toBeInTheDocument();
});

test('生成草稿计划后仍允许启动前查询转移', () => {
  const props = makeProps({ projectStatus: '生成盘点计划', type: 'excluded' });
  render(<SnapshotAssetTab {...props} />);
  fireEvent.click(screen.getByText('按查询条件转移至执行盘点'));
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
  const props = makeProps({ projectStatus: '盘点中' });
  const { rerender } = render(<SnapshotAssetTab {...props} />);
  expect(screen.queryByText('导入盘点照片')).not.toBeInTheDocument();
  rerender(<SnapshotAssetTab {...props} machineRoomProject />);
  expect(screen.getByText('导入盘点照片')).toBeInTheDocument();
  fireEvent.click(screen.getByText('导入盘点结果'));
  expect(props.messageApi.warning).toHaveBeenCalledWith('盘点结果导入模板尚未配置，暂不能导入');
});
