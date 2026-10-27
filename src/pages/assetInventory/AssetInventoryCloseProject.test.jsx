import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from 'antd';
import AssetInventoryProjectListV2 from './AssetInventoryProjectListV2';
import { inventoryProjectCloseBlockReason } from './inventoryCloseRules';
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('./projectListMockData', () => ({ PROJECT_LIST_ROWS: [
 { creator: '孙志强', key: 'draft', projectNo: 'ZERO', projectName: '零计划项目', projectType: '初盘', status: '盘点中' },
 { creator: '孙志强', key: 'room', projectNo: 'ROOM', projectName: '机房项目', projectType: '初盘', status: '盘点中', generationSource: '系统生成', scopeRanges: ['机房'] },
] }));
jest.mock('antd', () => {
 const Box = ({ children, extra }) => <div>{extra}{children}</div>;
 return { Button: ({ children, onClick, disabled }) => <button disabled={disabled} onClick={onClick}>{children}</button>, Card: Box, Space: Box, DatePicker: Object.assign(() => null, { RangePicker: () => null }), Input: () => null, Select: () => null, Typography: { Text: Box, Title: Box }, Modal: { confirm: jest.fn() },
 Table: ({ dataSource, rowSelection }) => <><button onClick={() => rowSelection.onChange([])}>清选择</button><button onClick={() => rowSelection.onChange(dataSource.map(row => row.key))}>多选项目</button>{dataSource.map(row => <button key={row.key} onClick={() => rowSelection.onChange([row.key])}>选中-{row.projectNo}</button>)}</>, message: { useMessage: () => [{ warning: jest.fn(), info: jest.fn(), success: jest.fn() }, null] } };
});
jest.mock('../../components/QueryBar', () => ({ __esModule: true, default: () => null, QueryItem: () => null }));
beforeEach(() => jest.clearAllMocks());
test('初盘已启动后单选可关闭，零选或多选不弹确认，机房初盘也可手动关闭', () => {
 const close = jest.fn();
 render(<AssetInventoryProjectListV2 creator="孙志强" onCloseProject={close} getCloseBlockReason={row => inventoryProjectCloseBlockReason(row, { plans: [], photoRows: [] })} />);
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 expect(Modal.confirm).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button', { name: '多选项目' }));
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 expect(Modal.confirm).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button', { name: '选中-ZERO' }));
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 Modal.confirm.mock.calls[0][0].onOk();
 expect(close).toHaveBeenCalledWith(expect.objectContaining({ projectNo: 'ZERO', status: '盘点关闭' }));
 fireEvent.click(screen.getByRole('button', { name: '选中-ROOM' }));
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 expect(Modal.confirm).toHaveBeenCalledTimes(2);
});
test('确认前新产生审核会再次校验并阻止关闭', () => {
 let pending = false;const close = jest.fn();
 render(<AssetInventoryProjectListV2 creator="孙志强" onCloseProject={close} getCloseBlockReason={row => inventoryProjectCloseBlockReason(row, { photoRows: pending ? [{ reviewStatus: '待审核' }] : [] })} />);
 fireEvent.click(screen.getByRole('button', { name: '选中-ZERO' }));
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 pending = true;Modal.confirm.mock.calls[0][0].onOk();
 expect(close).not.toHaveBeenCalled();
});

test('非创建人不能手动关闭，已打开确认框在切换身份后也不能关闭', () => {
 const close = jest.fn();
 const props = { onCloseProject: close, getCloseBlockReason: row => inventoryProjectCloseBlockReason(row, { plans: [], photoRows: [] }) };
 const view = render(<AssetInventoryProjectListV2 {...props} creator="其他人" />);
 fireEvent.click(screen.getByRole('button', { name: '选中-ZERO' }));
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 expect(Modal.confirm).not.toHaveBeenCalled();
 view.rerender(<AssetInventoryProjectListV2 {...props} creator="孙志强" />);
 fireEvent.click(screen.getByRole('button', { name: '关闭项目' }));
 const confirmation = Modal.confirm.mock.calls[0][0];
 view.rerender(<AssetInventoryProjectListV2 {...props} creator="其他人" />);
 confirmation.onOk();
 expect(close).not.toHaveBeenCalled();
});
