import { amount, accountingAmount, quantity, integer, accounting, historyPercent, percent, summaryPercent, companyQuantity, companyAmount } from './inventoryReportFormats';

test('分析数量金额显示整数、会计负数括号，0和缺值分别处理', () => {
  expect(integer(13317)).toBe('13,317');
  expect(integer(0)).toBe('-');
  expect(integer(-1234.5)).toBe('-1,235');
  expect(accounting(2)).toBe('2');
  expect(accounting(-1234.5)).toBe('(1,235)');
  expect(accounting(0)).toBe('-');
  expect(accounting(null)).toBe('');
});
test('汇总历史占比三位、全量100%，年度率两位，真实0与缺失均按各表定义', () => {
  expect(historyPercent(0.00014)).toBe('0.014%');
  expect(historyPercent(0)).toBe('-');
  expect(historyPercent(null)).toBe('');
  expect(summaryPercent(1, { name: '全部盘点资产' })).toBe('100%');
  expect(percent(-0.0875)).toBe('-8.75%');
  expect(percent(0)).toBe('0.00%');
});
test('公司0空白且金额整数，明细和类型万元金额两位，年度指标为整数', () => {
  expect(companyQuantity(0)).toBe('');
  expect(companyAmount(2274)).toBe('2,274');
  expect(companyAmount(null)).toBe('');
  expect(amount(1946)).toBe('1,946.00');
  expect(amount(0)).toBe('0.00');
  expect(amount(null)).toBe('');
  expect(quantity(7806.7413)).toBe('7,807');
  expect(quantity(0)).toBe('0');
});


test('明细原值净值用会计两位，赔偿损失General两位保留真实0，未知均空白', () => {
  expect(accountingAmount(0)).toBe('-');
  expect(accountingAmount(-1234.5)).toBe('(1,234.50)');
  expect(accountingAmount(1234.5)).toBe('1,234.50');
  expect(accountingAmount(null)).toBe('');
  expect(amount(0)).toBe('0.00');
  expect(amount(null)).toBe('');
});
