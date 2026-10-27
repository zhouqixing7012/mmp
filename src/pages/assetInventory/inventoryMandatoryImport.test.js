import * as XLSX from 'xlsx';
import { INVENTORY_MANDATORY_IMPORT_HEADERS as header, inventoryMandatoryTemplateRows, parseInventoryMandatoryRows } from './inventoryMandatoryImport';

const assets = [{ key: 'a', assetTag: '001', description: '原始资产说明' }, { key: 'b', assetTag: '002', isMandatory: true }];
const tagColumn = header.indexOf('资产标签号');
const mandatoryColumn = header.indexOf('是否必盘');
function matrix(rows) {
  return [header, ...rows.map(([tag, flag, extra]) => {
    const row = header.map(() => ''); row[tagColumn] = tag; row[mandatoryColumn] = flag;
    if (extra !== undefined) row.push(extra);
    return row;
  })];
}

test('复盘导入模板独立保留两列及标签前导零', () => {
  const rows = inventoryMandatoryTemplateRows(assets);
  expect(rows[0]).toHaveLength(2);
  expect(rows[0]).toEqual(header);
  expect(parseInventoryMandatoryRows(rows, assets)).toEqual([{ key: 'a', assetTag: '001', isMandatory: false }, { key: 'b', assetTag: '002', isMandatory: true }]);
});

test('按列名识别完整清单，调整列序后仍能准确匹配', () => {
  const rows = matrix([['001', '是']]).map((row) => [...row].reverse());
  expect(parseInventoryMandatoryRows(rows, assets)).toEqual([{ key: 'a', assetTag: '001', isMandatory: true }]);
});

test.each([
  [[['资产标签号'], ['001']], '缺少列'],
  [[header.map((name, index) => index === 0 ? '是否必盘' : name)], '重复列'],
  [[[...header, '自定义列']], '未定义列'],
  [matrix([['001', '是', '额外值']]), '未定义的导入列'],
  [matrix([['001', '是'], ['003', '是']]), '不在当前项目关联初盘的可选执行资产中'],
  [matrix([['001', '是'], ['001', '否']]), '重复'],
  [matrix([['001', '']]), '只能填写'],
  [matrix([['001', 'true']]), '只能填写'],
  [matrix([['', '是']]), '不在当前项目关联初盘的可选执行资产中'],
  [matrix([['', '']]), '没有资产明细'],
])('任一错误阻止整批导入：%s', (rows, expected) => {
  expect(() => parseInventoryMandatoryRows(rows, assets)).toThrow(expected);
  expect(assets[0].isMandatory).toBeUndefined();
});

test('阈值强制必盘不能取消，普通必盘可以明确取消', () => {
  expect(() => parseInventoryMandatoryRows(matrix([['001', '是'], ['002', '否']]), assets, new Set(['b']))).toThrow('命中必盘条件，不能改为否');
  expect(parseInventoryMandatoryRows(matrix([['002', '否']]), assets)).toEqual([{ key: 'b', assetTag: '002', isMandatory: false }]);
});

test('标签精确匹配保留前导零；可选初盘执行源标签不唯一时不任意匹配', () => {
  expect(() => parseInventoryMandatoryRows(matrix([[1, '是']]), assets)).toThrow('不在当前项目关联初盘的可选执行资产中');
  expect(() => parseInventoryMandatoryRows(matrix([['001', '是']]), [...assets, { key: 'copy', assetTag: '001' }])).toThrow('不唯一');
});

test('范围清单逐行收集错误，整批不修改，供错误明细下载', () => {
  let failure;
  try { parseInventoryMandatoryRows(matrix([['999', '是'], ['001', '错误'], ['001', '否']]), assets); }
  catch (error) { failure = error; }
  expect(failure.errors.map(error => error.row)).toEqual([2, 3, 4]);
  expect(failure.errors[2].message).toContain('重复');
  expect(assets[0].isMandatory).toBeUndefined();
});
