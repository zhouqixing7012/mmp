import { intangibleIPRows, intangibleIPTypes } from '../mock/businessRulesMock';
export const getIPTypes = () => [...intangibleIPTypes];
export function queryIPs({ keyword = '', type } = {}) {
  const term = keyword.trim().toLocaleLowerCase();
  return intangibleIPRows.filter(row => (!type || row.type === type)
    && (!term || [row.code, row.name].some(value => value.toLocaleLowerCase().includes(term))))
    .map(row => ({ ...row }));
}
export function getIPDetail(id) {
  const row = intangibleIPRows.find(item => item.id === id);
  return row ? JSON.parse(JSON.stringify(row)) : null;
}
