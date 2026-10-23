import { inventoryMandatoryTemplateRows, parseInventoryMandatoryRows } from './inventoryMandatoryImport';

const assets = [{ key: 'a', assetTag: '001' }, { key: 'b', assetTag: '002', isMandatory: true }];
const header = ['资产标签号', '是否必盘'];

test('模板逐资产带出精确标签与必盘值，导入只更新当前范围标记且不修改原资产', () => {
  expect(inventoryMandatoryTemplateRows(assets)).toEqual([header, ['001', '否'], ['002', '是']]);
  expect(parseInventoryMandatoryRows([header, ['001', '是'], ['002', '否']], assets)).toEqual([
    { key: 'a', assetTag: '001', isMandatory: true }, { key: 'b', assetTag: '002', isMandatory: false },
  ]);
  expect(assets[0].isMandatory).toBeUndefined();
  expect(assets[1].isMandatory).toBe(true);
});

test.each([
  [[['是否必盘', '资产标签号'], ['是', '001']], '导入列须依次为'],
  [[header, ['001', '是', '额外值']], '未定义的导入列'],
  [[header, ['001', '是'], ['003', '是']], '不在当前盘点范围中'],
  [[header, ['001', '是'], ['001', '否']], '重复'],
  [[header, ['001', '']], '只能填写'],
  [[header, ['001', 'true']], '只能填写'],
  [[header, ['', '是']], '不在当前盘点范围中'],
  [[header, ['', '']], '没有必盘标记明细'],
])('整批错误不返回部分结果：%s', (matrix, expected) => {
  expect(() => parseInventoryMandatoryRows(matrix, assets)).toThrow(expected);
  expect(assets[0].isMandatory).toBeUndefined();
});

test('阈值强制必盘不能导入取消，普通必盘可以明确取消', () => {
  expect(() => parseInventoryMandatoryRows([header, ['001', '是'], ['002', '否']], assets, new Set(['b']))).toThrow('命中必盘条件，不能改为否');
  expect(parseInventoryMandatoryRows([header, ['002', '否']], assets)).toEqual([{ key: 'b', assetTag: '002', isMandatory: false }]);
});

test('标签精确匹配保留前导零；当前范围标签不唯一时不任意匹配', () => {
  expect(() => parseInventoryMandatoryRows([header, [1, '是']], assets)).toThrow('不在当前盘点范围中');
  expect(() => parseInventoryMandatoryRows([header, ['001', '是']], [...assets, { key: 'copy', assetTag: '001' }])).toThrow('不唯一');
});
