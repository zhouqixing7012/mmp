// 页面和Excel使用同一份业务格式定义；只改变展示，不改写源数值。
export const INVENTORY_REPORT_FORMATS = Object.freeze({
  integer: '#,##0;-#,##0;"-"',
  accountingInteger: '#,##0;(#,##0);"-"',
  integerWithZero: '#,##0;-#,##0;0',
  companyInteger: '#,##0;-#,##0;;',
  decimal: '#,##0.00;-#,##0.00;0.00',
  accountingDecimal: '#,##0.00;(#,##0.00);"-"',
  percentThree: '0.000%;-0.000%;"-"',
  percentTwo: '0.00%;-0.00%;0.00%',
  fullPercent: '0%',
});
const number = (value, digits) => value.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const amount = value => value == null ? '' : number(value, 2);
export const accountingAmount = value => value == null ? '' : value === 0 ? '-' : value < 0 ? `(${amount(-value)})` : amount(value);
export const quantity = value => value == null ? '' : number(value, 0);
export const integer = value => value === 0 ? '-' : quantity(value);
export const accounting = value => value == null ? '' : value === 0 ? '-' : value < 0 ? `(${quantity(-value)})` : quantity(value);
export const historyPercent = value => value == null ? '' : value === 0 ? '-' : `${(value * 100).toFixed(3)}%`;
export const percent = value => value == null ? '' : `${(value * 100).toFixed(2)}%`;
export const summaryPercent = (value, row) => row.name === '全部盘点资产' ? '100%' : historyPercent(value);
export const companyQuantity = value => value == null || value === 0 ? '' : quantity(value);
export const companyAmount = companyQuantity;
