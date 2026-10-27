// 导入方式记录本次执行渠道，与项目配置的盘点方式分别展示。
export const INVENTORY_RESULT_SOURCES = ['狐小e', '狐小e快速扫描', '扫码枪', '人工导入'];

const LEGACY_IMPORT_SOURCES = {
  扫描枪导入: '扫码枪',
  手工导入: '人工导入',
};

export function inventoryResultSource(asset) {
  if (INVENTORY_RESULT_SOURCES.includes(asset?.resultSource)) return asset.resultSource;
  return LEGACY_IMPORT_SOURCES[asset?.importMode] || '';
}
