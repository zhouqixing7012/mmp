import {
  mockComprehensiveData, mockMaterialCategories, mockSubCategoryData,
  mockBrands, mockModels, mockConfigs,
} from '../mock/businessRulesMock';

const TEXT_FIELDS = new Set(['code', 'desc']);
export const hasMaterialFilters = filters => Object.values(filters).some(value => value !== '' && value != null);

export function queryMaterialCombinations(filters = {}) {
  return mockComprehensiveData.filter(row => Object.entries(filters).every(([key, value]) => {
    if (value === '' || value == null) return true;
    if (key === 'priceFrom') return Number(row.refPrice) >= Number(value);
    if (key === 'priceTo') return Number(row.refPrice) <= Number(value);
    if (TEXT_FIELDS.has(key)) return String(row[key] || '').toLowerCase().includes(String(value).trim().toLowerCase());
    return String(row[key] ?? '') === String(value);
  }));
}

// 选择候选沿用现有基础资料入口，不从当前结果倒推候选。
export const materialQueryLookups = {
  catDesc: { label: '物料大类', rows: mockMaterialCategories, valueField: 'desc', codeField: 'code' },
  subCatDesc: { label: '物料小类', rows: mockSubCategoryData, valueField: 'subDesc', codeField: 'subCode' },
  brand: { label: '品牌', rows: mockBrands, valueField: 'desc', codeField: 'code' },
  model: { label: '型号', rows: mockModels, valueField: 'desc', codeField: 'code' },
  configDesc: { label: '配置描述', rows: mockConfigs, valueField: 'desc', codeField: 'code' },
};
