import source from './reference/documentNumberRules.json';

export const documentNumberRules = Object.freeze(source.rules.map(rule => Object.freeze(rule)));
const rules = new Map(documentNumberRules.map(rule => [rule.type, rule]));
const reserved = new Map();
const sequences = new Map();

// 仅分配当前原型会话的交易演示号，不连接或占用正式系统流水。
// 分隔符位于前缀之后；日期与补齐位数的流水直接拼接，沿用现有CA示例。
export function mockDocumentNumber(type, id, date, company = '', existingNumbers = []) {
  const rule = rules.get(type);
  if (!rule) throw new Error(`未提供单据编号规则：${type}`);
  const day = String(date).slice(0, 10).replaceAll('-', '');
  if (!/^\d{8}$/.test(day)) throw new Error(`单据编号日期无效：${date}`);
  const companyCode = rule.hasCompany ? String(company).split(/[.-]/)[0] : '';
  if (rule.hasCompany && !/^\d+$/.test(companyCode)) throw new Error(`单据编号缺少公司编号：${type}`);
  const pool = `${rule.prefix}|${companyCode}|${day}`;
  const key = `${pool}|${id}`;
  if (reserved.has(key)) return reserved.get(key);
  const occupied = new Set(existingNumbers);
  let serial = sequences.get(pool) || 0;
  let number;
  do {
    serial += 1;
    if (serial >= 10 ** rule.serialDigits) throw new Error(`单据演示流水已满：${type}`);
    number = `${rule.prefix}${rule.separator}${companyCode ? companyCode + rule.separator : ''}${day}${String(serial).padStart(rule.serialDigits, '0')}`;
  } while (occupied.has(number));
  sequences.set(pool, serial);
  reserved.set(key, number);
  return number;
}
