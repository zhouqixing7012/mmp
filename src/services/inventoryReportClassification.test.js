import { classifyInventoryReportAsset, mapInventoryReportAsset, getInventoryMinorCategoryA, summarizeInventoryReportCategory } from './inventoryReportClassification';
import { materialMinorCategories } from '../mock/reference/materialCategoryMapping';

test.each([
  ['PC', '主机-标准主机', '台式机、显示器'],
  ['11.PC', '显示器-标准显示器', '台式机、显示器'],
  ['NB', '笔记本-标准笔记本', '笔记本'],
  ['12.NOTEBOOK', '笔记本-技术笔记本', '笔记本'],
  ['OE', '摄影摄像-镜头', '照摄像器材'],
  ['OFFICE EQUIPMENT', '数码配件-三脚架', '照摄像器材'],
  ['OE', '数码配给-组装零件', '办公设备'],
  ['OFFICE EQUIPMENT', '数码配件-组装零件', '办公设备'],
  ['13.OFFICE EQUIPMENT', '数码配件-影棚灯|灯架', '办公设备'],
  ['OE', '移动数码-平板电脑', '移动数码'],
  ['OFFICE EQUIPMENT', '移动数码-手机', '移动数码'],
  ['OE', '打印设备-打印机', '办公设备'],
  ['Net.E', '电话-标准电话', '电话'],
  ['15.NET EQUIPMENT', '电话-高端电话', '电话'],
  ['vec', '汽车-汽车', '车辆'],
  ['18.VEHICLE', '汽车-其他', '车辆'],
])('%s/%s使用确认后的报告分类%s', (major, minor, category) => {
  expect(classifyInventoryReportAsset({ 资产大类: major, 资产小类: minor }).category).toBe(category);
});

test('小类A按第一个半角连字符拆分，不把任意名称片段当分类', () => {
  expect(getInventoryMinorCategoryA('摄影摄像-镜头-其他')).toBe('摄影摄像');
  expect(getInventoryMinorCategoryA('办公设备')).toBe('办公设备');
  expect(classifyInventoryReportAsset({ 资产大类: 'SERVER', 资产小类: '服务器-设备' }).category).toBeNull();
  expect(classifyInventoryReportAsset({ 资产大类: 'NET EQUIPMENT', 资产小类: '非电话设备-路由器' }).category).toBeNull();
});

test('真实目录两项摄影配件例外归办公，其余摄影配件不受排除影响', () => {
  const targets = materialMinorCategories.filter(row => row.majorName === 'OFFICE EQUIPMENT' && ['数码配件-组装零件', '数码配件-影棚灯|灯架', '数码配件-三脚架'].includes(row.name));
  expect(new Set(targets.map(row => row.name)).size).toBe(3);
  targets.forEach(row => expect(classifyInventoryReportAsset({ category: row.majorName, subCategory: row.name }).category)
    .toBe(row.name === '数码配件-三脚架' ? '照摄像器材' : '办公设备'));
});

test('公司分类区分主机显示器，来源旧分类不覆盖新规则且不改原记录', () => {
  const source = { 资产大类: 'PC', 资产小类: '显示器-标准显示器', reportCategory: '办公设备' };
  expect(mapInventoryReportAsset(source)).toMatchObject({ reportCategory: '台式机、显示器', reportCompanyCategory: '显示器', minorCategoryA: '显示器' });
  expect(source.reportCategory).toBe('办公设备');
  expect(mapInventoryReportAsset({ category: 'NOTEBOOK', subCategory: '笔记本-标准笔记本' }).reportCompanyCategory).toBe('笔记本');
});

test('分类汇总按资产数量和金额计算，未映射及缺少金额不补零', () => {
  const rows = [
    { 资产大类: 'OE', 资产小类: '摄影摄像-镜头', 数量: 2, 原值: 100, 报失当月资产净值: 20 },
    { 资产大类: 'OE', 资产小类: '数码配件-组装零件', 数量: 3, 原值: 50, 报失当月资产净值: 10 },
  ];
  expect(summarizeInventoryReportCategory(rows, '照摄像器材')).toEqual({ quantity: 2, original: 100, net: 20 });
  expect(summarizeInventoryReportCategory(rows, '办公设备')).toEqual({ quantity: 3, original: 50, net: 10 });
  expect(summarizeInventoryReportCategory([...rows, { category: 'SERVER', subCategory: '服务器' }], '办公设备')).toBeNull();
  expect(summarizeInventoryReportCategory([{ ...rows[0], 报失当月资产净值: null }], '照摄像器材').net).toBeNull();
});
