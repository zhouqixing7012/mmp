import { mockDocumentNumber } from './documentNumbers';
import { claimSourceData, claimApplicationRows } from './applicationClaimMock';
import { legacyApplicationRows } from './applicationLegacyMock';
import { employeeApplicationRows } from './applicationEmployeeMock';
import { assetReportRows } from './assetReportsMock';

test('编号保留来源前缀、分隔符、日期、公司及流水位数，同一对象重复取号不变', () => {
  const ca = mockDocumentNumber('统一申请', 'number-test-1', '2026-10-25');
  expect(ca).toMatch(/^CA-20261025\d{5}$/);
  expect(mockDocumentNumber('统一申请', 'number-test-1', '2026-10-25')).toBe(ca);
  expect(mockDocumentNumber('统一申请', 'number-test-2', '2026-10-25')).not.toBe(ca);
  expect(mockDocumentNumber('库存转移', 'number-test', '2026-10-25')).toMatch(/^TS-20261025\d{4}$/);
  expect(mockDocumentNumber('复盘批次', 'number-test', '2026-10-25')).toMatch(/^RE20261025\d{4}$/);
  expect(mockDocumentNumber('入库单', 'number-test', '2026-10-25', '114.新媒体')).toMatch(/^PI-114-20261025\d{4}$/);
  expect(() => mockDocumentNumber('入库单', 'missing-company', '2026-10-25')).toThrow('公司编号');
  expect(() => mockDocumentNumber('未知单据', 'number-test', '2026-10-25')).toThrow('未提供');
  expect(() => mockDocumentNumber('统一申请', 'number-test', 'invalid')).toThrow('日期无效');
});
test('申请菜单各单据使用对应编号，统一申请的两个物资类型共用CA号段且不重号', () => {
  const numbers = claimSourceData.applications.map(row => row.values.applicationNo);
  expect(numbers.every(number => /^CA-\d{13}$/.test(number))).toBe(true);
  expect(new Set(numbers).size).toBe(numbers.length);
  expect(claimApplicationRows.filter(row => row.kind === 'newEmployee').every(row => /^NE-\d{12}$/.test(row.values.applicationNo))).toBe(true);
  const prefix = { storage: 'TS', return: 'ERA', borrow: 'EBA', transfer: 'ETA', replacement: 'CHA' };
  [...legacyApplicationRows, ...employeeApplicationRows].forEach(row => {
    const code = row.extension ? 'ERB' : prefix[row.kind];
    expect(row.values.applicationNo).toMatch(new RegExp(`^${code}-\\d{${code === 'CHA' ? 13 : 12}}$`));
    expect(row.filters.applicationNo).toBe(row.values.applicationNo);
  });
});
test('报废事务引用账面报废源编号，列表快照及导出保持同一单号', () => {
  const rows = assetReportRows['report-3-1'].filter(row => row.accountingSource);
  expect(rows.length).toBeGreaterThan(0);
  rows.forEach(row => {
    expect(row.values['单据编号']).toMatch(/^AS-\d{12}$/);
    expect(row.values['单据编号']).toBe(row.accountingSource.applicationNo);
    expect(row.filters['单据编号']).toBe(row.values['单据编号']);
    expect(row.exports['单据编号']).toBe(row.values['单据编号']);
  });
});

test('创建转移单时跳过刷新前已经保存的同日单号', () => {
  const number = mockDocumentNumber('资产转移', 'persisted-skip-test', '2027-01-02', '', ['AT-202701020001']);
  expect(number).toBe('AT-202701020002');
});
