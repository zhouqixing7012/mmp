// 资产标记复用资产维护、入库既有配置，空值表示没有标记。
export const ASSET_MARK_OPTIONS = Object.freeze(['硬件老化', '组件缺失', '设备故障', '物理损伤']);
export const ASSET_MARK_SELECT_OPTIONS = ASSET_MARK_OPTIONS.map((value) => ({ label: value, value }));
export const isValidAssetMark = (value) => !value || ASSET_MARK_OPTIONS.includes(value);
