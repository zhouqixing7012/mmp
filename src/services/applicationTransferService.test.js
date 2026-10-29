import { createApplicationTransferService } from './applicationTransferService';
import { applicationTransferStore } from '../mock/applicationTransferMock';

const copy = value => JSON.parse(JSON.stringify(value));
function setup() {
  let data = copy(applicationTransferStore.read());
  const store = { references: copy(applicationTransferStore.references), read: () => copy(data), write: next => { data = copy(next); } };
  return { service: createApplicationTransferService(store), store, state: () => copy(data) };
}
const detailFor = service => {
  const order = service.create();
  const asset = service.assets(order.company)[0];
  const detail = service.selectRecipient(service.newDetail(asset.id), 'hewen');
  return { ...order, details: [{ ...detail, purpose: '员工用机' }] };
};

test('查询按创建日期倒序，范围包含起止整天，数量取明细合计', () => {
  const { service } = setup(); const rows = service.list({ dateRange: ['2026-10-14', '2026-10-15'] });
  expect(rows.map(row => row.id)).toEqual(['transfer-order-1', 'transfer-order-2']); expect(rows.every(row => /^AT-\d{12}$/.test(row.number))).toBe(true); expect(rows[0].totalQuantity).toBe(1);
});
test('转出条件读取原属性，转入条件读取目标属性且必须同一明细', () => {
  const { service, store } = setup();
  const state = store.read();
  state.orders[0].details[0].original.department = '原部门';
  state.orders[0].details[0].department = '新部门';
  state.orders[0].details[0].original.building = '原地点';
  state.orders[0].details[0].building = '新地点';
  store.write(state);
  expect(service.list({ sourceDepartment: '原部门', targetDepartment: '新部门', sourceBuilding: '原地点', targetBuilding: '新地点' })).toHaveLength(1);
  expect(service.list({ sourceDepartment: '新部门' })).toHaveLength(0);
  expect(service.list({ targetDepartment: '原部门' })).toHaveLength(0);
  const changed = store.read();
  delete changed.orders[0].details[0].original.department;
  store.write(changed);
  expect(service.list({ sourceDepartment: '新部门' })).toHaveLength(0);
  expect(service.list({ sourceDepartment: '原部门' })).toHaveLength(0);
  expect(service.list({ targetDepartment: '新部门' })).toHaveLength(1);
});
test('新建默认公司及制单人，首次保存生成编号，重复保存沿用同号', () => {
  const { service } = setup(); const order = service.create(); expect(order.creator).toBe('sunzhq');
  const saved = service.save(order); expect(saved.number).toMatch(/^AT-\d{12}$/); expect(service.save(saved).number).toBe(saved.number);
});
test('保存资产锁定，删除明细立即解锁', () => {
  const { service, state } = setup(); const saved = service.save(detailFor(service));
  expect(state().assets.find(row => row.id === saved.details[0].assetId).lock).toBe(saved.id);
  const removed = service.removeDetail(saved.id, saved.details[0].id); expect(removed.details).toHaveLength(0);
  expect(state().assets.find(row => row.id === saved.details[0].assetId).lock).toBe('');
});
test('修改公司保存清除其他公司明细并解锁，不改写资产公司', () => {
  const { service, state } = setup(); const saved = service.save(detailFor(service)); const oldCompany = saved.company;
  const otherCompany = service.references().warehouses.find(row => row.status === '启用' && row.company !== oldCompany).company;
  const changed = service.save({ ...saved, company: otherCompany }); expect(changed.details).toHaveLength(0);
  const asset = state().assets.find(row => row.id === saved.details[0].assetId); expect(asset.company).toBe(oldCompany); expect(asset.lock).toBe('');
});
test('保存拦截缺公司、重复标签、已锁定资产和错误数量', () => {
  const { service } = setup(); expect(() => service.save({ ...service.create(), company: '' })).toThrow('公司');
  const order = detailFor(service); expect(() => service.save({ ...order, details: [order.details[0], order.details[0]] })).toThrow('重复');
  expect(() => service.save({ ...order, details: [{ ...order.details[0], quantity: 2 }] })).toThrow('数量');
  service.save(order); expect(() => service.save(order)).toThrow('锁定');
});
test('明细必须选择有效人员、用途、地点及日期', () => {
  const { service } = setup(); const order = detailFor(service); const detail = order.details[0];
  expect(() => service.validateDetail({ ...detail, recipient: 'unknown' })).toThrow('不存在');
  expect(() => service.validateDetail({ ...detail, floor: 'invalid' })).toThrow('地点');
  expect(() => service.validateDetail({ ...detail, purpose: '' })).toThrow('用途');
  expect(() => service.validateDetail({ ...detail, transferDate: '2026-02-31' })).toThrow('日期');
});
test('执行更新同一资产、费用账户、事务及已完成状态，不能重复执行', () => {
  const { service, state } = setup(); const saved = service.save(detailFor(service)); const done = service.execute(saved.id);
  expect(done.status).toBe('已完成'); const asset = state().assets.find(row => row.id === saved.details[0].assetId);
  expect(asset.owner).toBe('hewen'); expect(asset.feeAccount).toBe('114.17.909004.72101.E2104.0.0.0.0'); expect(asset.lock).toBe('');
  expect(service.transactions()).toHaveLength(1); expect(() => service.execute(saved.id)).toThrow('草稿'); expect(() => service.save(done)).toThrow('草稿');
});
test('执行缺明细、缺账簿、跨账簿及费用账户异常时整体停止', () => {
  const { service, store, state } = setup(); const empty = service.save(service.create()); expect(() => service.execute(empty.id)).toThrow('明细');
  const saved = service.save(detailFor(service)); store.references.plateBooks['17.Corporate'] = ''; expect(() => service.execute(saved.id)).toThrow('账簿');
  store.references.plateBooks['17.Corporate'] = 'OTHER_BOOK'; expect(() => service.execute(saved.id)).toThrow('跨账簿');
  store.references.plateBooks['17.Corporate'] = 'FA_BOOK_SOHU'; const broken = service.save({ ...saved, details: [{ ...saved.details[0], costCenter: 'unknown' }] });
  expect(() => service.execute(broken.id)).toThrow('费用账户'); expect(state().transactions).toHaveLength(0); expect(service.get(saved.id).status).toBe('草稿');
});
test('批量删除含已完成时整批拒绝，删除草稿解锁', () => {
  const { service, state } = setup(); const saved = service.save(detailFor(service));
  expect(() => service.remove([saved.id, 'transfer-order-2'])).toThrow('已完成'); expect(service.get(saved.id)).toBeDefined();
  service.remove([saved.id]); expect(() => service.get(saved.id)).toThrow('不存在'); expect(state().assets.find(row => row.id === saved.details[0].assetId).lock).toBe('');
});
test('旧版本草稿保存被拦截，不覆盖最新内容', () => {
  const { service } = setup(); const saved = service.save(service.create()); const latest = service.save({ ...saved, remarks: '新备注' });
  expect(() => service.save({ ...saved, remarks: '旧内容' })).toThrow('已更新'); expect(service.get(latest.id).remarks).toBe('新备注');
});

test('费用账户只读取明确演示结果，未配置组合停止执行', () => {
  const { service, store, state } = setup();
  const explicitAccount = '114.17.909004.79999.E2104.0.0.0.0';
  store.references.explicitFinanceExamples.find(row => row.recipient === 'hewen').feeAccount = explicitAccount;
  const saved = service.save(detailFor(service)); service.execute(saved.id);
  expect(state().assets.find(row => row.id === saved.details[0].assetId).feeAccount).toBe(explicitAccount);
  const next = service.save(detailFor(service)); store.references.explicitFinanceExamples = [];
  expect(() => service.execute(next.id)).toThrow('未配置明确的演示结果');
  expect(service.get(next.id).status).toBe('草稿'); expect(service.transactions()).toHaveLength(1);
});
