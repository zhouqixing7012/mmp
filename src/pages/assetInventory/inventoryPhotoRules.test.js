import { applyInventoryPhotoSnapshot, getInventoryPhotoConfig, getInventoryPhotoSnapshot, matchesInventoryPhotoRule, saveInventoryPhotoConfig, saveInventoryPhotoSnapshot, selectInventoryPhotoAssets } from './inventoryPhotoRules';

const assets = Array.from({ length: 5 }, (_, i) => ({ key: `a${i}`, assetTag: `T${i}`, inventoryRange: '员工', city: i < 3 ? '北京' : '上海', ownerDept: '产品部', category: 'NOTEBOOK', subCategory: '电脑', useStatus: '在用', quantity: 10, needPhoto: true }));
const rule = (overrides = {}) => ({ range: '员工', percent: 50, ...overrides });
beforeEach(() => window.localStorage.clear());

test('按资产条数四舍五入，与每条资产数量无关，抽取不重复且不改输入', () => {
  const result = selectInventoryPhotoAssets(assets, [rule()], true, () => 0);
  expect(result.filter(asset => asset.needPhoto).map(asset => asset.assetTag)).toEqual(['T0', 'T1', 'T2']);
  expect(assets.every(asset => asset.needPhoto)).toBe(true);
});
test('每条规则独立抽取后合并去重，后一条不清除前一条结果', () => {
  const result = selectInventoryPhotoAssets(assets, [rule({ city: ['上海'], percent: 100 }), rule({ city: ['北京'], percent: 50 }), rule({ city: ['北京'], percent: 100 })], true, () => 0);
  expect(result.filter(asset => asset.needPhoto)).toHaveLength(5);
});
test('0%及关闭开关清除旧照片标记，100%只选匹配项', () => {
  expect(selectInventoryPhotoAssets(assets, [rule({ percent: 0 })], true).some(asset => asset.needPhoto)).toBe(false);
  expect(selectInventoryPhotoAssets(assets, [rule({ percent: 100 })], false).some(asset => asset.needPhoto)).toBe(false);
  expect(selectInventoryPhotoAssets(assets, [rule({ city: ['上海'], percent: 100 })], true).filter(asset => asset.needPhoto)).toHaveLength(2);
});
test('各条件交集、单条件多选并集，支持类别树的父子值', () => {
  expect(matchesInventoryPhotoRule(assets[0], rule({ city: ['北京', '上海'], department: ['产品部'], category: ['major:NOTEBOOK'] }))).toBe(true);
  expect(matchesInventoryPhotoRule(assets[0], rule({ department: ['财务部'] }))).toBe(false);
  expect(matchesInventoryPhotoRule(assets[0], rule({ category: ['minor:NOTEBOOK|电脑'] }))).toBe(true);
  expect(matchesInventoryPhotoRule(assets[0], rule({ range: '公共' }))).toBe(false);
});
test.each([null, '', -1, 101, NaN])('非法百分比立即阻止生成快照：%s', percent => {
  expect(() => selectInventoryPhotoAssets(assets, [rule({ percent })], true)).toThrow('图片上传百分比');
});
test('快照持久化且按项目隔离，重读不重新抽取，计划只取项目清单', () => {
  const chosen = selectInventoryPhotoAssets(assets, [rule()], true, () => 0);
  saveInventoryPhotoSnapshot({ projectNo: 'CP1', photoConfig: { enabled: true, rules: [rule()] } }, chosen);
  expect(getInventoryPhotoSnapshot('CP1').assets).toEqual(chosen);
  expect(getInventoryPhotoSnapshot('CP2')).toBeNull();
  saveInventoryPhotoSnapshot({ projectNo: 'CP1' }, chosen.slice(0, 2));
  expect(getInventoryPhotoSnapshot('CP1').config).toEqual({ enabled: true, rules: [rule()] });
  saveInventoryPhotoSnapshot({ projectNo: 'CP1' }, chosen);
  expect(applyInventoryPhotoSnapshot('CP1', [...assets, { assetTag: 'other' }]).map(asset => asset.needPhoto)).toEqual([true, true, true, false, false]);
});

test('保存配置可重读，修改配置不改变已有快照的抽取结果', () => {
  const config = { enabled: true, rules: [rule()] };
  const chosen = selectInventoryPhotoAssets(assets, config.rules, true, () => 0);
  saveInventoryPhotoSnapshot({ projectNo: 'CP1', photoConfig: config }, chosen);
  saveInventoryPhotoConfig('CP1', { enabled: false, rules: [] });
  expect(getInventoryPhotoConfig('CP1')).toEqual({ enabled: false, rules: [] });
  expect(getInventoryPhotoSnapshot('CP1').assets).toEqual(chosen);
});
