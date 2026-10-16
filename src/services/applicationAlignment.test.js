import * as XLSX from 'xlsx';
import { applicationQueryRows } from '../mock/businessRulesMock';
import { DEFAULT_APPLICATION_ACCESS } from './applicationAccess';
import { applicationProgressRecords, queryApplications, buildApplicationWorkbook, getApplicationOptions, getApplicationDefinition } from './applicationQueryService';
import { prepareApplicationWeeklyReport } from './applicationWeeklyReport';

const access = (grants, extra = {}) => ({ ...DEFAULT_APPLICATION_ACCESS, grants: { people: [], departments: [], companies: [], ...grants }, ...extra });
test('申请人员、部门、公司权限独立生效且查询导出与候选相同范围', () => {
  const row = applicationQueryRows.find(item => item.kind === 'return');
  for (const grants of [{ people: [row.access.applicant] }, { departments: [row.access.department] }, { companies: [row.access.company] }]) {
    const permission = access(grants), rows = queryApplications('return', {}, null, permission);
    expect(rows.some(item => item.id === row.id)).toBe(true);
    const book = buildApplicationWorkbook('return', {}, null, null, permission);
    const first = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1 });
    expect(first.length).toBeGreaterThan(1);
  }
  const personOnly = access({ people: [row.access.applicant] });
  expect(getApplicationOptions('return', getApplicationDefinition('return').filters.find(field => field.key === 'warehouse'), personOnly).map(item => item.value)).toContain(row.filters.warehouse);
  const denied = access({ companies: ['UNAUTHORIZED-DEMO-COMPANY'] });
  expect(queryApplications('return', {}, null, denied)).toHaveLength(0);
  const book = buildApplicationWorkbook('return', {}, null, null, denied);
  expect(XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1 })).toHaveLength(1);
  expect(getApplicationOptions('return', getApplicationDefinition('return').filters.find(field => field.key === 'applicant'), denied)).toHaveLength(0);
  expect(() => queryApplications('return', {}, null, access({}, { canView: false }))).toThrow('无申请查看权限');
});
test('未完成仅管理员查询，等待及无有效待办仍保留，完成退出', () => {
  expect(() => queryApplications('unfinished', {}, null, access({}, { administratorIds: [] }))).toThrow('管理员权限');
  const rows = queryApplications('unfinished');
  for (const suffix of ['013', '014', '016']) expect(rows.some(row => row.id.endsWith(suffix))).toBe(true);
  expect(rows.some(row => row.id.endsWith('015'))).toBe(false);
  expect(rows).toHaveLength(17);
  expect(rows.find(row => row.id.endsWith('013')).values.node).toContain('等待');
});
test('同序号多人和再次办理保留，仅重复记录ID去重，空序号真实记录保留', () => {
  const rows = applicationProgressRecords([
    { id: 'a', sequence: '2', approver: '张甲', time: '2026-10-13' },
    { id: 'b', sequence: '2', approver: '李乙', time: '2026-10-14' },
    { id: 'c', sequence: '2', approver: '张甲', time: '2026-10-15' },
    { id: 'a', sequence: '2', approver: '张甲', time: '2026-10-13' },
    { id: 'd', sequence: '', node: '提交' },
  ]);
  expect(rows.map(row => row.id)).toEqual(['d', 'a', 'b', 'c']);
});
test('周一材料包含全部处理中员工申请和固定五人，不伪称已发送', () => {
  const result = prepareApplicationWeeklyReport('2026-10-19');
  expect(result.recipients).toEqual(['杨芊', '王英', '孙志强', '刘建', '何文']);
  expect(result.rows).toHaveLength(11);
  expect(result.rows.every(row => row.employeeApplication)).toBe(true);
  expect(result.sent).toBe(false);
  const data = XLSX.utils.sheet_to_json(result.workbook.Sheets[result.workbook.SheetNames[0]], { header: 1 });
  expect(data).toHaveLength(12);
  expect(() => prepareApplicationWeeklyReport('2026-10-20')).toThrow('每周一');
});

test('获权申请打开关联汇总时不泄露未授权原申请明细', () => {
  const visible = applicationQueryRows.find(row => row.kind === 'asset' && row.summary);
  const hiddenId = 'PERMISSION-TEST-HIDDEN-LINE';
  const hidden = { ...visible, id: 'PERMISSION-TEST-HIDDEN-RECORD', originalLineId: hiddenId,
    access: { applicant: 'OTHER-ACCOUNT', department: 'OTHER-DEPARTMENT', company: 'OTHER-COMPANY', ledger: '资产台账' } };
  const hiddenLine = { ...visible.summary.lines[0], id: 'hidden-summary-line', originalLineId: hiddenId };
  applicationQueryRows.push(hidden);
  visible.summary.lines.push(hiddenLine);
  try {
    const result = queryApplications('asset', {}, null, access({ people: [visible.access.applicant] })).find(row => row.id === visible.id);
    expect(result.summary.lines.some(line => line.originalLineId === hiddenId)).toBe(false);
    expect(result.summary.lines.length).toBeGreaterThan(0);
  } finally { visible.summary.lines.pop(); applicationQueryRows.pop(); }
});
