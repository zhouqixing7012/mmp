// 用途编码供报表筛选使用；维护表单沿用名称值，顺序与已认可页面保持一致。
export const ASSET_PURPOSE_OPTIONS = Object.freeze([
  { value: '73', label: '部门公用' },
  { value: '70', label: '员工用机' },
  { value: '69', label: '其他用途' },
  { value: '68', label: '专业用途' },
  { value: '99', label: '空' },
]);

export const ASSET_ADD_TYPE_OPTIONS = Object.freeze([
  '报废新增', '采购新增', '历史新增', '收购新增', '赠与新增', '再利用新增', '转移新增',
]);

// 耗材原有业务范围不包含报废新增。
export const CONSUMABLE_ADD_TYPE_OPTIONS = Object.freeze(
  ASSET_ADD_TYPE_OPTIONS.filter(value => value !== '报废新增'),
);
