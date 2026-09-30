import { mockLocationBasicDataData } from '../../mock/businessRulesMock';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';

const cityKey = (value) => String(value || '').replace(/市$/, '');
const unique = (values) => [...new Set(values.filter(Boolean))];

// 选择值仅来自现有地点基础资料及台账，不在页面生成虚构的地点。
export function getInventoryLocationOptions(location) {
  const rows = getAssetMaintenanceRows();
  const cities = unique([location.city, ...mockLocationBasicDataData.filter((city) => city.enabled).map((city) => city.cityName), ...rows.map((row) => row.city)])
    .filter((value, index, all) => all.findIndex((item) => cityKey(item) === cityKey(value)) === index);
  const city = mockLocationBasicDataData.find((item) => item.enabled && cityKey(item.cityName) === cityKey(location.city));
  const buildings = unique([
    ...(city?.children || []).filter((item) => item.enabled).map((item) => item.buildingName),
    ...rows.filter((row) => cityKey(row.city) === cityKey(location.city)).map((row) => row.building),
  ]);
  const floors = unique(rows.filter((row) => cityKey(row.city) === cityKey(location.city) && row.building === location.building).map((row) => row.floor));
  return { city: cities, building: buildings, floor: floors };
}
