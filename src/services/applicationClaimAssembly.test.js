import { assembleClaimRows } from './applicationClaimAssembly';
import { claimApplicationRows, claimSourceData } from '../mock/applicationClaimMock';
import { assetExportSheets, consumableExportColumns } from '../pages/applicationQueries/claimDefinitions';

test('同一耗材申请按物料、子单及实际出库拆行，不丢多次出库', () => {
  const rows = claimApplicationRows.filter(row => row.values.applicationNo === claimSourceData.applications.find(item => item.id === 'consumable-1').values.applicationNo);
  expect(new Set(rows.map(row => row.originalLineId)).size).toBe(2);
  const issued = rows.filter(row => row.originalLineId.endsWith('-2') && row.filters.subType === 'USE');
  expect(issued).toHaveLength(2);
  expect(issued.reduce((sum, row) => sum + row.values.receivedQuantity, 0)).toBe(4);
  expect(rows.find(row => row.originalLineId.endsWith('-2') && row.filters.subType === 'PURCHASE').values.estimatedAmount).toBe(175);
});
test('审批按唯一记录标识保留同环节五人及再次办理，三方历史每个节点保留', () => {
  const row = claimApplicationRows.find(item => item.kind === 'consumable' && item.filters.subType === 'PURCHASE');
  expect(row.history.filter(item => item.node === 'MIS-鉴定')).toHaveLength(6);
  expect(row.progressSections.map(section => section.records.length)).toEqual([4, 2, 3]);
  expect(row.progressSections[0].records.map(item => item.node)).toContain('PR单审批');
  const source = { ...claimSourceData, flowRecords: [...claimSourceData.flowRecords, claimSourceData.flowRecords[0]] };
  const rebuilt = assembleClaimRows(source).find(item => item.id === row.id);
  expect(rebuilt.history).toHaveLength(row.history.length);
});
test('耗材模板严格20列，资产全单导出包含单头、关联、原明细及汇总', () => {
  expect(consumableExportColumns.map(item => item.label)).toEqual(['子流程单号','子流程类型','申请时间','申请人','申请人部门','申请单号','审批节点','单据状态','当前审批人','预计采购金额','汇总提交人','采购申请单号','采购申请状态','PO单号','PO状态','实际采购金额','完成时间','领用出库单号','出库日期','领用数量']);
  const rows = claimApplicationRows.filter(row => row.kind === 'asset');
  expect(assetExportSheets.map(sheet => sheet.name)).toEqual(['申请信息','申请关联单据','申请明细','汇总明细']);
  expect(assetExportSheets.find(sheet => sheet.name === '申请明细').records(rows)[0]).toEqual(expect.objectContaining({ originalQuantity: 3, quantity: 2, reason: '办公使用', detailDescription: '申请明细中的详细需求说明' }));
  expect(claimApplicationRows.find(row => row.kind === 'asset' && row.filters.subType === 'USE').progressTitle).toBe('资产申请详情（此信息来源于资产系统）');
});
test('等待环节的展示与查询字段一致，权限公司使用完整参考值', () => {
  const source = { ...claimSourceData, flowRecords: claimSourceData.flowRecords.map(row => row.documentId === 'asset-1-summary' ? { ...row, node: '等待', approver: '114111-杨芊' } : row) };
  const waiting = assembleClaimRows(source).find(row => row.kind === 'asset' && row.filters.subType === 'PURCHASE');
  expect(waiting.values.node).toBe('待汇总');
  expect(waiting.filters.node).toEqual(['待汇总']);
  expect(waiting.values.approver).toBe('');
  expect(waiting.filters.approver).toEqual([]);
  claimApplicationRows.forEach(row => expect(row.access.company).toBe(row.head['公司']));
});
test('最新同序号多人节点完整展示并按各账号和节点筛选', () => {
  const parallel = [
    { id: 'latest-manager', documentId: 'asset-1-summary', sequence: '6', node: 'ES领导-审批', account: '213852', approver: '213852-孙志强', status: '待审批', time: '' },
    { id: 'latest-es', documentId: 'asset-1-summary', sequence: '6', node: 'ES领导-审批', account: '114111', approver: '114111-杨芊', status: '待审批', time: '' },
    { id: 'latest-review', documentId: 'asset-1-summary', sequence: '6', node: '部门总监-审批', account: 'review-demo', approver: '复核人（交易演示）', status: '待审批', time: '' },
  ];
  const row = assembleClaimRows({ ...claimSourceData, flowRecords: [...claimSourceData.flowRecords, ...parallel] }).find(item => item.kind === 'asset' && item.filters.subType === 'PURCHASE');
  expect(row.values.approver).toBe('213852-孙志强、114111-杨芊、复核人（交易演示）');
  expect(row.filters.approver).toEqual(['213852', '114111', 'review-demo']);
  expect(row.filters.node).toEqual(['ES领导-审批', '部门总监-审批']);
  expect(row.optionLabels.approver['114111']).toBe('114111-杨芊');
  parallel.forEach(record => expect(row.history.find(item => item.id === record.id)).toEqual(record));
});
test('一级子单处理中且汇总驳回时选一级子号及其审批，完整历史保留汇总记录', () => {
  const rejected = { ...claimSourceData, summaries: claimSourceData.summaries.map(summary => summary.id === 'asset-1-summary' ? { ...summary, statusCode: '5' } : summary) };
  const row = assembleClaimRows(rejected).find(item => item.kind === 'asset' && item.filters.subType === 'PURCHASE');
  const sub = rejected.subOrders.find(item => item.id === 'asset-1-child');
  expect(sub.statusCode).toBe('3');
  expect(row.values.subNo).toBe(sub.number);
  expect(row.filters.subNo).toBe(sub.number);
  expect(row.values.node).toBe('ES-配给');
  expect(row.values.summaryApplicant).toBe('');
  expect(row.filters.summaryApplicant).toBe('');
  expect(row.history.some(item => item.documentId === 'asset-1-summary')).toBe(true);
  const normal = assembleClaimRows(claimSourceData).find(item => item.id === row.id);
  expect(normal.values.subNo).toBe(claimSourceData.summaries.find(item => item.id === 'asset-1-summary').number);
  expect(normal.values.node).toBe('ES采购汇总');
});

test('资产申请单号按CA规则生成，日期与源单一致并传递到查询和汇总', () => {
  const applications = claimSourceData.applications.filter(row => row.kind === 'asset');
  expect(applications.length).toBeGreaterThan(0);
  expect(new Set(applications.map(row => row.values.applicationNo)).size).toBe(applications.length);
  applications.forEach(application => {
    const number = application.values.applicationNo;
    expect(number).toMatch(/^CA-\d{13}$/);
    expect(number.slice(3, 11)).toBe(application.createdAt.slice(0, 10).replaceAll('-', ''));
    expect(application.filters.applicationNo).toBe(number);
    claimApplicationRows.filter(row => row.kind === 'asset' && row.originalLineId === application.id + '-original-line').forEach(row => {
      expect(row.values.applicationNo).toBe(number);
      expect(row.filters.applicationNo).toBe(number);
    });
    claimSourceData.summaries.flatMap(row => row.detail.lines).filter(line => line.originalLineId === application.id + '-original-line').forEach(line => {
      expect(line.applicationNo).toBe(number);
    });
  });
});
