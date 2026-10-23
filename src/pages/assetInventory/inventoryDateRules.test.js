import { inventoryDateBlockReason, inventoryProjectDateBlockReason } from './inventoryDateRules';

test.each(['初盘', '抽盘', '复盘'])('%s项目和计划允许跨天，仍校验日期完整及先后', type => {
  expect(inventoryDateBlockReason(type, '2026-09-01', '2026-09-03')).toBe('');
  expect(inventoryDateBlockReason(type, '2026-09-01', '2026-09-01')).toBe('');
  expect(inventoryDateBlockReason(type, '2026-09-03', '2026-09-01')).toBe('盘点结束日期不能早于盘点开始日期');
  expect(inventoryDateBlockReason(type, '', '2026-09-01')).toBe('请完整填写盘点开始日期和盘点结束日期');
});

test('项目日期允许跨天并保留完整与先后校验', () => {
  expect(inventoryProjectDateBlockReason('2026-09-01', '2026-09-03')).toBe('');
  expect(inventoryProjectDateBlockReason('', '2026-09-03')).toBe('请完整填写盘点开始日期和盘点结束日期');
  expect(inventoryProjectDateBlockReason('2026-09-03', '2026-09-01')).toBe('盘点结束日期不能早于盘点开始日期');
});
