import { reportTag } from './assetReportTags';
import { materialCatalog } from './reference/materialCatalog';
import { reportWarehouses } from './assetReportsFixtures';
import { assetReportRows } from './assetReportsMock';

const warehouse = reportWarehouses[0];
const material = code => materialCatalog.find(row => row.materialCode === code);
test('标签格式与物料类型对应，重复读取同一对象不换号', () => {
  const notebook = material('112002002237001');
  const tag = reportTag('tag-test', notebook, warehouse);
  expect(tag).toMatch(new RegExp(`^${warehouse.company.split('.')[0]}1626\\d{5}$`));
  expect(reportTag('tag-test', notebook, warehouse)).toBe(tag);
  expect(reportTag('tag-test-2', notebook, warehouse)).not.toBe(tag);
  expect(reportTag('monitor-test', material('111006113036000'), warehouse)).toMatch(/^\d{12}-V$/);
  expect(reportTag('chair-test', material('116008535014000'), warehouse)).toMatch(/^\d{6}Y$/);
  expect(reportTag('phone-test', material('234001011063000'), warehouse)).toMatch(/^P-26\d{4}$/);
  expect(reportTag('sim-test', material('234002503002003'), warehouse)).toMatch(/^N-26\d{4}$/);
});
test('各报表不再使用标签占位号，查询导出排序与快照保持一致', () => {
  Object.values(assetReportRows).flat().forEach(row => {
    const tag = row.values['资产标签号'];
    if (tag) expect(tag).toMatch(/^(\d{12}(-V)?|(QT|P|N)-26\d{4}|\d{6}[ADEYQ])$/);
    expect(row.filters['资产标签号']).toBe(tag);
    expect(row.exports['资产标签号']).toBe(tag);
    expect(row.sort.tag).toBe(tag);
    if (row.snapshot) expect(row.snapshot['资产标签号']).toBe(tag);
    if (row.accountingSource) expect(row.accountingSource.assetsSnapshot[0].tagNo).toBe(tag);
    if (row.kind === '耗材') expect(tag).toBe('');
  });
});
