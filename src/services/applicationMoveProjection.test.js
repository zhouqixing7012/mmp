import * as XLSX from 'xlsx';
import { readMoveDocuments, writeMoveDocuments, MOVE_DOCUMENT_STATUSES } from '../mock/inventoryMoveMock';
import { queryApplications, getApplicationDefinition, buildApplicationWorkbook } from './applicationQueryService';
import { DEFAULT_APPLICATION_ACCESS } from './applicationAccess';

let before;
beforeEach(() => { before = readMoveDocuments(); });
afterEach(() => { writeMoveDocuments(before); });
test('移库查询的单号、四种状态和明细数量取自库存管理同一批单据', () => {
  const rows = queryApplications('storage');
  expect(rows.map(row => row.values.applicationNo).sort()).toEqual(before.map(doc => doc.documentNo).sort());
  expect(getApplicationDefinition('storage').filters.find(field => field.key === 'status').options.map(item => item.label)).toEqual(MOVE_DOCUMENT_STATUSES);
  rows.forEach(row => {
    const source = before.find(doc => doc.documentNo === row.values.applicationNo);
    expect(row.values.status).toBe(source.status);
    expect(row.lines.map(line => line.tag)).toEqual(source.lines.map(line => line.assetTag));
    expect(row.values.quantity).toBe(source.lines.reduce((sum, line) => sum + Number(line.quantity), 0));
  });
});
test('库存移库变更状态及明细后，查询、筛选和导出立即读取最新结果，刷新读取不重置', () => {
  const source = before.find(doc => doc.status === '出库待接收');
  writeMoveDocuments(before.map(doc => doc.id === source.id ? { ...doc, status: '已完成', lines: doc.lines.map(line => ({ ...line, moveStatus: '已接收', receiver: '114111-杨芊' })) } : doc));
  const row = queryApplications('storage', { applicationNo: source.documentNo, status: '已完成' })[0];
  expect(row.lines.every(line => line.handlingStatus === '已接收')).toBe(true);
  expect(queryApplications('storage', { applicationNo: source.documentNo, status: '出库待接收' })).toHaveLength(0);
  expect(readMoveDocuments().find(doc => doc.id === source.id).status).toBe('已完成');
  const book = buildApplicationWorkbook('storage', { applicationNo: source.documentNo });
  expect(XLSX.utils.sheet_to_json(book.Sheets['单据信息'])[0]['单据状态']).toBe('已完成');
});
test('后台新建的源单按原授权查询；不为查询入口扩大权限或另造单号', () => {
  const document = { ...before[0], id: 'es-new-document', documentNo: 'TS-202610250088', creator: 'admin-系统管理员' };
  writeMoveDocuments([...before, document]);
  expect(queryApplications('storage', { applicationNo: document.documentNo })).toHaveLength(0);
  const access = { ...DEFAULT_APPLICATION_ACCESS, grants: { ...DEFAULT_APPLICATION_ACCESS.grants, people: [...DEFAULT_APPLICATION_ACCESS.grants.people, 'admin'] } };
  const [row] = queryApplications('storage', { applicationNo: document.documentNo }, null, access);
  expect(row.values.applicationNo).toBe(document.documentNo);
  expect(row.values.status).toBe(document.status);
});
