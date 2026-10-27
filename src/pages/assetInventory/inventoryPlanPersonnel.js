import { EMPLOYEE_ROWS } from './mockData';
import { INVENTORY_PEOPLE } from './inventoryPeople';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';

export const INVENTORY_FINANCIAL_SUPERVISOR = '徐博';
const present = value => Boolean(String(value ?? '').trim()) && value !== '-';
const personName = person => typeof person === 'object' && person ? person.employeeName || person.name || '' : String(person || '');

export function inventoryPublicSupervisor(project, configured) {
  return present(configured) ? personName(configured) : personName(project?.creator).replace(/^\d+-/, '').trim() || '-';
}

// 使用用户确认的财务人员工号和部门，不另造身份。
export function inventoryFinancePeople() {
  return INVENTORY_PEOPLE.filter(person => person.department === '财务中心_集团业务支持部')
    .map(person => ({ ...person, id: person.employeeNo }));
}

export function isInventoryFinancePerson(person) {
  const value = personName(person);
  return inventoryFinancePeople().some(row => row.employeeName === value);
}

export function inventoryPersonnelCandidates(project, field, people = EMPLOYEE_ROWS) {
  return project?.projectType === '复盘' && ['supervisor', 'executor'].includes(field) ? inventoryFinancePeople() : people;
}

export function canEditInventoryPersonnel(project, plan, asset, field) {
  if (project?.status === '盘点关闭' || project?.status === '关闭' || !['草稿', '暂存'].includes(plan?.status)) return false;
  return !(project?.projectType === '初盘' && (asset?.inventoryRange || plan?.range) === '机房');
}

export function inventoryPersonnelChangeReason(project, plan, asset, field, person) {
  if (!['supervisor', 'executor'].includes(field)) return '只能修改盘点监督人或盘点执行人';
  if (!canEditInventoryPersonnel(project, plan, asset, field)) return '当前计划人员已锁定，机房初盘人员由系统带出';
  if (project?.projectType === '复盘' && present(personName(person)) && !isInventoryFinancePerson(person)) return '复盘监督人和执行人仅可选择财务人员';
  return '';
}

export function applyInventoryPersonnelChange(project, plan, assets, field, person, assetKey = null) {
  const targets = assetKey === null ? assets : assets.filter(asset => asset.key === assetKey);
  if (!targets.length) throw new Error('没有可修改的计划资产');
  targets.forEach(asset => {
    const reason = inventoryPersonnelChangeReason(project, plan, asset, field, person);
    if (reason) throw new Error(reason);
  });
  return assets.map(asset => assetKey === null || asset.key === assetKey ? { ...asset, [field]: personName(person) || '-' } : asset);
}

function locationKeeper(asset) {
  const code = String(present(asset.warehouseCode) ? asset.warehouseCode : asset.warehouse || '').trim();
  if (!present(code)) return '';
  const record = warehouseCatalog.find(row => row.warehouseCode === code);
  return record?.keeper || '';
}

export function initializeInventoryPlanPersonnel(project, assets, configuration = {}, mode = 'default') {
  return assets.map(asset => {
    const range = asset.inventoryRange || asset.range;
    // 公共资产不沿用库管员或旧计划人员；自定义监督人优先于项目创建人。
    if (range === '公共') {
      return { ...asset,
        supervisor: inventoryPublicSupervisor(project, configuration.supervisor),
        executor: present(configuration.executor) ? personName(configuration.executor) : '-',
        ...(project?.projectType === '复盘' ? { financialSupervisor: INVENTORY_FINANCIAL_SUPERVISOR } : {}),
      };
    }
    if (project?.projectType === '复盘') {
      const supervisor = configuration.supervisor ?? asset.supervisor;
      const executor = configuration.executor ?? asset.executor;
      return { ...asset, supervisor: isInventoryFinancePerson(supervisor) ? supervisor : '-', executor: isInventoryFinancePerson(executor) ? executor : '-', financialSupervisor: INVENTORY_FINANCIAL_SUPERVISOR };
    }
    if (project?.projectType === '初盘' && range === '机房') return { ...asset, supervisor: '-', executor: present(asset.owner) ? asset.owner : '-' };
    if ((project?.projectType === '初盘' || (project?.projectType === '抽盘' && mode === 'default')) && range === '员工') {
      const supervisor = mode === 'custom' && present(configuration.supervisor) ? personName(configuration.supervisor) : asset.departmentAssistant || '-';
      const executor = mode === 'custom' && present(configuration.executor) ? personName(configuration.executor) : asset.owner || '-';
      return { ...asset, supervisor, executor };
    }
    // 自定义初盘非员工范围按原需求明细：配置有值带入，无值留空；机房已在前面固定责任人。
    if (mode === 'custom' && project?.projectType === '初盘') return { ...asset, supervisor: configuration.supervisor || '-', executor: configuration.executor || '-' };
    // 默认抽盘员工、库房按初盘同范围规则带出；库房仅按编号关联管理员。
    if (mode === 'default' && ['初盘', '抽盘'].includes(project?.projectType) && range === '库房') {
      const keeper = locationKeeper(asset) || '-';
      return { ...asset, supervisor: keeper, executor: keeper };
    }
    return { ...asset, supervisor: configuration.supervisor || asset.supervisor || '-', executor: configuration.executor || asset.executor || '-' };
  });
}

export function inventoryPlanFinanceBlockReason(project, assets) {
  if (project?.projectType !== '复盘') return '';
  const invalid = assets.find(asset => !isInventoryFinancePerson(asset.executor) || (present(asset.supervisor) && !isInventoryFinancePerson(asset.supervisor)));
  return invalid ? `资产 ${invalid.assetTag || invalid.key} 的复盘监督人、执行人须为财务人员` : '';
}
