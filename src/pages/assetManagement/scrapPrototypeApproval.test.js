import { getScrapPrototypeApprovalRecords } from './scrapPrototypeApproval';

const activeRecords = [
  ['crossCompany', { assetScope: '办公设备', currentNode: 'ES主管确认' }],
  ['scrap', { assetScope: '软件', currentNode: '5级及以上直属领导' }],
  ['accounting', { currentNode: '财务初审', assetsSnapshot: [{ scope: '办公设备' }] }],
  ['disposal', { assetScope: '办公设备', disposalMode: '实物处置', currentNode: 'ES二级审批' }],
];

test.each(activeRecords)('%s 审批进度显示发起记录和当前待审批节点', (type, fields) => {
  const rows = getScrapPrototypeApprovalRecords({
    ...fields,
    documentStatus: '审批中',
    creator: '213852-孙志强',
    applicationDate: '2026-09-26',
    approvalHistory: [
      { node: '发起人提交', person: '213852-孙志强', result: '提交', time: '2026-09-26 10:00:00' },
    ],
  }, type);

  expect(rows.map((row) => row.node)).toEqual(['发起人提交', fields.currentNode]);
  expect(rows[1]).toMatchObject({
    status: '待审批',
    time: '',
    comment: '',
  });
});

test('缺少历史记录时仍按单据流程显示发起记录和当前节点', () => {
  const rows = getScrapPrototypeApprovalRecords({
    assetScope: '办公设备',
    documentStatus: '审批中',
    creator: '213852-孙志强',
  }, 'crossCompany');

  expect(rows.map((row) => row.node)).toEqual(['发起人提交', '责任人5级及以上直属领导']);
  expect(rows[1].status).toBe('待审批');
});
