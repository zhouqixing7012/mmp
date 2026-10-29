jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LegacyApplicationDetail from './LegacyApplicationDetail';
import { legacyDefinitions } from './legacyDefinitions';
import { legacyApplicationRows } from '../../mock/applicationLegacyMock';
import { queryApplications, buildApplicationWorkbook } from '../../services/applicationQueryService';
import * as XLSX from 'xlsx';

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});

test('借用逐资产详情及配件链接绑定当前行', async () => {
  const source = legacyApplicationRows.find(row => row.id === 'borrow-1');
  const record = { ...source, lines: source.lines.map((line, index) => ({ ...line, accessories: index === 1 ? [{ ...source.lines[0].accessories[0], id: 'second-part', tag: 'SECOND-PART', quantity: 2 }] : line.accessories })) };
  render(<LegacyApplicationDetail definition={legacyDefinitions.find(item => item.id === 'borrow')} record={record} onBack={jest.fn()} onProgress={jest.fn()} />);
  record.lines.forEach(line => expect(screen.getByText(line.tag)).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: /查看.+的配件（2件）/ }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('SECOND-PART')).toBeInTheDocument();
  expect(within(dialog).queryByText(record.lines[0].accessories[0].tag)).not.toBeInTheDocument();
});

test.each(['storage', 'return', 'borrow'])('%s导出保留单头、全部资产及各子集合，不形成重复数量', kind => {
  const definition = legacyDefinitions.find(item => item.id === kind);
  const records = kind === 'storage' ? queryApplications('storage') : legacyApplicationRows.filter(row => row.kind === kind);
  const sheets = definition.exportSheets.map(sheet => ({ ...sheet, rows: sheet.records(records) }));
  expect(sheets.find(sheet => sheet.name === '单据信息').rows).toHaveLength(records.length);
  const assets = sheets.find(sheet => sheet.name === '资产明细').rows;
  expect(assets).toHaveLength(records.reduce((count, row) => count + row.lines.length, 0));
  expect(assets.reduce((sum, row) => sum + row['数量'], 0)).toBe(records.reduce((sum, row) => sum + row.values.quantity, 0));
  const parts = sheets.find(sheet => sheet.name === '附属耗材及配件').rows;
  expect(parts).toHaveLength(records.flatMap(row => row.lines.flatMap(line => line.accessories)).length);
  sheets.forEach(sheet => sheet.rows.forEach(row => Object.keys(row).forEach(key => expect(sheet.columns.map(column => column.key)).toContain(key))));
});

test('退库详情保留赔偿和库管员，单据导出不丢组织信息', () => {
  const record = legacyApplicationRows.find(row => row.id === 'return-3');
  expect(Object.fromEntries(record.head)['是否赔偿']).toBe('否');
  expect(Object.fromEntries(record.head)['库管员']).toBeTruthy();
  const definition = legacyDefinitions.find(item => item.id === 'return');
  const [head] = definition.exportSheets[0].records([record]);
  expect(head['子公司']).toBe(record.filters.subsidiary);
  expect(head['部门']).toBe(record.filters.department);
});

test.each(['return', 'borrow'])('%s组织条件真实过滤，导出按查询结果及完整明细生成', kind => {
  const source = legacyApplicationRows.find(row => row.kind === kind);
  expect(queryApplications(kind, { subsidiary: source.filters.subsidiary, department: source.filters.department })).toHaveLength(3);
  expect(queryApplications(kind, { subsidiary: '不匹配的组织' })).toHaveLength(0);
  const workbook = buildApplicationWorkbook(kind, { applicationNo: source.values.applicationNo });
  const heads = XLSX.utils.sheet_to_json(workbook.Sheets['单据信息']);
  const lines = XLSX.utils.sheet_to_json(workbook.Sheets['资产明细']);
  expect(heads).toHaveLength(1);
  expect(lines).toHaveLength(source.lines.length);
  expect(lines.map(line => line['资产标签号'])).toEqual(source.lines.map(line => line.tag));
});
