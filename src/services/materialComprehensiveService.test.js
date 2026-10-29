import { queryMaterialCombinations, hasMaterialFilters } from './materialComprehensiveService';

test('组合文本、枚举及价格区间按同一记录过滤', () => {
  expect(queryMaterialCombinations({ desc: '闪迪', mainCatCode: '3', priceFrom: 1000, priceTo: 1500 }).map(row => row.id)).toEqual([1]);
  expect(queryMaterialCombinations({ desc: '闪迪', priceTo: 1000 })).toEqual([]);
});

test('空条件与0值条件区分，无结果不修改源记录', () => {
  expect(hasMaterialFilters({ code: '', enabled: undefined })).toBe(false);
  expect(hasMaterialFilters({ priceTo: 0 })).toBe(true);
  expect(queryMaterialCombinations({ code: 'missing' })).toEqual([]);
  expect(queryMaterialCombinations({})).toHaveLength(3);
  expect(queryMaterialCombinations({ priceTo: 0 })).toHaveLength(2);
});
