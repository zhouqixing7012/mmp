import { inventoryDateBlockReason } from './inventoryDateRules';

test('复盘项目和计划仅允许同一天，其他项目允许跨天', () => {
  expect(inventoryDateBlockReason('复盘', '2026-09-01', '2026-09-02')).toBe('复盘执行期间只能为同一天');
  expect(inventoryDateBlockReason('复盘', '2026-09-01', '2026-09-01')).toBe('');
  expect(inventoryDateBlockReason('初盘', '2026-09-01', '2026-09-02')).toBe('');
});
