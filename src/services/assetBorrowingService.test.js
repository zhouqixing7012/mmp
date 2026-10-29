import { getAssetBorrowingApplications } from './assetBorrowingService';
import { readDemoData } from './demoStorage';
jest.mock('./demoStorage', () => ({ readDemoData: jest.fn(), writeDemoData: jest.fn() }));
test('旧借用结束状态按已完成读取，处理中、已驳回和历史办理结果保持原值', () => {
  const history = [{ node: '执行出库', status: '已出库' }];
  const records = [{ id: 'done', status: '已处理', result: '正常出库', approvalHistory: history }, { id: 'pending', status: '处理中' }, { id: 'rejected', status: '已驳回' }];
  readDemoData.mockReturnValue(records);
  const rows = getAssetBorrowingApplications();
  expect(rows.map(row => row.status)).toEqual(['已完成', '处理中', '已驳回']);
  expect(rows[0]).toMatchObject({ result: '正常出库', approvalHistory: history });
  expect(records[0].status).toBe('已处理');
});
