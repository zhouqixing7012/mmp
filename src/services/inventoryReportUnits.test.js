import { resolveInventoryReportQuantityUnit, withInventoryReportQuantityUnits } from './inventoryReportUnits';
import { materialCatalog } from '../mock/reference/materialCatalog';
import { getInventoryReport } from './inventoryReportService';

test('类别匹配复用物料组合及ES分类，笔记本和PC单位来自真实物料记录', () => {
  expect(resolveInventoryReportQuantityUnit('笔记本及配件')).toMatchObject({ quantityUnit: '台', quantityUnitStatus: 'resolved' });
  const pc = resolveInventoryReportQuantityUnit('台式机、显示器');
  expect(pc.quantityUnit).toBe('台');
  expect(pc.quantityUnitMaterialCodes.every(code => materialCatalog.some(material => material.materialCode === code && material.unit === '台'))).toBe(true);
});

test('混合单位不猜统一件，缺少物料记录不拿相似名称代替', () => {
  expect(resolveInventoryReportQuantityUnit('移动数码')).toMatchObject({ quantityUnit: null, quantityUnitStatus: 'mixed', quantityUnits: expect.arrayContaining(['台', '部']) });
  expect(resolveInventoryReportQuantityUnit('电话')).toMatchObject({ quantityUnit: null, quantityUnitStatus: 'missing' });
  expect(resolveInventoryReportQuantityUnit('未知类别')).toMatchObject({ quantityUnit: null, quantityUnitStatus: 'missing' });
});

test('车辆与电话采用用户本轮明确的类别展示单位，保留目录混合及未覆盖证据', () => {
  const source = [{ category: '车辆', quantity: 15 }, { category: '电话', quantity: 3724 }];
  const rows = withInventoryReportQuantityUnits(source);
  expect(rows[0]).toMatchObject({ quantityUnit: '辆', quantityUnitStatus: 'user-confirmed', quantityUnits: expect.arrayContaining(['辆', '台']) });
  expect(rows[1]).toMatchObject({ quantityUnit: '部', quantityUnitStatus: 'user-confirmed', quantityUnits: [] });
  expect(source[0]).not.toHaveProperty('quantityUnit');
});

test('用户明确照摄像器材及配件为件，混合类别仍按件计数', () => {
  const rows = withInventoryReportQuantityUnits([{ category: '移动数码' }, { category: '照摄像器材及配件' }, { category: '笔记本及配件' }]);
  expect(rows[0]).toMatchObject({ quantityUnit: '件', quantityUnitStatus: 'mixed-count', quantityUnits: expect.arrayContaining(['台', '部']) });
  expect(rows[1]).toMatchObject({ quantityUnit: '件', quantityUnitStatus: 'user-confirmed' });
  expect(rows[2]).toMatchObject({ quantityUnit: '台', quantityUnitStatus: 'resolved' });
});

test('年度报告分布均携带单位信息，不改变数量或金额', () => {
  const report = getInventoryReport(2026);
  expect(report.distribution.find(row => row.category === '车辆')).toMatchObject({ quantity: 15, original: 8000000, quantityUnit: '辆' });
  expect(report.distribution.find(row => row.category === '电话')).toMatchObject({ quantity: 3724, quantityUnit: '部' });
  expect(report.distribution.every(row => Object.prototype.hasOwnProperty.call(row, 'quantityUnit'))).toBe(true);
});
