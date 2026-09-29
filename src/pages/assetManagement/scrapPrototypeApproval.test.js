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
    currentNode: 'ES主管确认',
    creator: '213852-孙志强',
  }, 'crossCompany');

  expect(rows.map((row) => row.node)).toEqual(['发起人提交', 'ES主管确认']);
  expect(rows[1].status).toBe('待审批');
});

test('账面报废提单人确认仍属于审批中，进度展示待确认节点', () => {
  const rows = getScrapPrototypeApprovalRecords({
    documentStatus: '审批中', currentNode: '提单人确认', creator: '演示提单人',
  }, 'accounting');
  expect(rows[rows.length - 1]).toMatchObject({ node: '提单人确认', status: '待确认' });
});

test('机房报废办理节点和机房处置协办节点使用待办理/已办理状态', () => {
  const scrapPending = getScrapPrototypeApprovalRecords({
    documentStatus: '审批中',
    currentNode: '采购专员交接资料',
    creator: '220784-演示用户',
    approvalHistory: [{ node: '采购专员填写回收商报价', person: '采购专员', result: '通过', time: '2026-09-29 10:00:00' }],
  }, 'scrap');
  expect(scrapPending[0].status).toBe('已办理');
  expect(scrapPending[scrapPending.length - 1]).toMatchObject({ node: '采购专员交接资料', status: '待办理' });

  const disposalPending = getScrapPrototypeApprovalRecords({
    documentStatus: '审批中',
    currentNode: '采购专员协办',
    creator: '系统自动',
    approvalHistory: [{ node: '系统发起', person: '系统自动', result: '提交', time: '2026-09-29 10:00:00' }],
  }, 'disposal');
  expect(disposalPending[disposalPending.length - 1]).toMatchObject({ node: '采购专员协办', status: '待办理' });
});

