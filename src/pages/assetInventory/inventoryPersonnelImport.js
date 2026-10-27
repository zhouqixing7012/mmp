import { INVENTORY_PEOPLE } from './inventoryPeople';
import { EMPLOYEE_ROWS } from './mockData';
import { inventoryPersonnelChangeReason } from './inventoryPlanPersonnel';

export const PERSONNEL_IMPORT_HEADERS = ['资产标签号', '盘点监督人', '盘点执行人'];
const text = value => String(value ?? '').trim();
export function parseInventoryPersonnelImport(sheets, { project, plans, assetsForPlan, people = [...INVENTORY_PEOPLE, ...EMPLOYEE_ROWS] }) {
  const updates = []; const errors = []; const seen = new Set();
  const candidates = new Map();
  plans.forEach(plan => assetsForPlan(plan).forEach(asset => {
    const tag = text(asset.assetTag);
    candidates.set(tag, [...(candidates.get(tag) || []), { plan, asset }]);
  }));
  sheets.forEach(({ name, rows }) => {
    const header = (rows[0] || []).map(text);
    if (header.length !== 3 || PERSONNEL_IMPORT_HEADERS.some(field => header.filter(value => value === field).length !== 1)) {
      errors.push({ sheet: name, row: 1, assetTag: '', message: '模板须且仅包含资产标签号、盘点监督人、盘点执行人三列' }); return;
    }
    rows.slice(1).forEach((row, index) => {
      if (row.every(value => !text(value))) return;
      const tag = text(row[header.indexOf('资产标签号')]);
      try {
        if (row.slice(3).some(value => text(value))) throw new Error('包含模板以外的数据列');
        if (!tag) throw new Error('资产标签号不能为空');
        if (seen.has(tag)) throw new Error('文件内资产标签号重复');
        seen.add(tag);
        const matches = candidates.get(tag) || [];
        if (matches.length !== 1) throw new Error(matches.length ? '资产匹配多个计划，请核对' : '资产不在当前计划资产范围内');
        const { plan, asset } = matches[0];
        const patch = {};
        for (const [label, field] of [['盘点监督人', 'supervisor'], ['盘点执行人', 'executor']]) {
          const value = text(row[header.indexOf(label)]);
          if (!value) continue;
          const match = value.match(/^([^-\s]+)-(.+)$/);
          if (!match || !text(match[2])) throw new Error(`${label}须使用员工工号-姓名格式`);
          const person = people.find(person => text(person.employeeNo) === match[1]);
          if (!person) throw new Error(`${label}工号${match[1]}不存在`);
          const reason = inventoryPersonnelChangeReason(project, plan, asset, field, person);
          if (reason) throw new Error(reason);
          patch[field] = person.employeeName;
        }
        if (Object.keys(patch).length) updates.push({ planKey: plan.key, assetKey: asset.key, patch });
      } catch (error) { errors.push({ sheet: name, row: index + 2, assetTag: tag, message: error.message }); }
    });
  });
  return { updates, errors };
}
