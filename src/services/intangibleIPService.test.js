import { getIPDetail, queryIPs } from './intangibleIPService';

test('关键字与类型取交集，匹配代码时忽略首尾空格和大小写', () => {
  expect(queryIPs({ keyword: ' ip2019cn0001 ', type: '剧本' })).toHaveLength(1);
  expect(queryIPs({ keyword: 'IP2019CN0001', type: '小说' })).toHaveLength(0);
  expect(queryIPs({ keyword: '宠物' })[0].code).toBe('IP2019CN0001');
});
test('每个IP只返回自己的明细，保留已驳回状态且不推导资产金额', () => {
  const row = getIPDetail(queryIPs()[0].id);
  expect(row.purchases[0].amount).toBe(800000);
  expect(row.purchases[0].status).toBe('已驳回');
  expect(row.contracts).toEqual([]);
  expect(getIPDetail('不存在')).toBeNull();
});
test('详情读取不会让调用者修改来源快照', () => {
  const id = queryIPs()[0].id;
  const row = getIPDetail(id);
  row.purchases[0].amount = 0;
  expect(getIPDetail(id).purchases[0].amount).toBe(800000);
});
