import { materialCatalog } from '../../mock/reference/materialCatalog';
import { CURRENT_EMPLOYEE } from '../../mock/employeeSelfServiceMock';

const DEMO_APPLICANT = `${CURRENT_EMPLOYEE.id}-${CURRENT_EMPLOYEE.name}`;
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';
import { DEFAULT_ASSET_MAINTENANCE_ROWS } from '../../mock/assetManagementMock';

export const OFFICE_MAJOR_CATEGORIES = new Set([
  'PC',
  'NOTEBOOK',
  'OFFICE EQUIPMENT',
  'FURNITURE',
  'VEHICLE',
  'BUILDINGS',
  'Investment Properties',
  'LEASEHOLD IMPROVEMENT',
  'Park lot land use rights',
]);

export const MACHINE_MAJOR_CATEGORIES = new Set(['SERVER', 'NET EQUIPMENT']);

export const ASSET_SCOPE_OPTIONS = [
  { label: '机房资产', value: '机房资产' },
  { label: '软件', value: '软件' },
  { label: '办公设备', value: '办公设备' },
];

export const SCRAP_TYPE_OPTIONS = [
  { label: '已到报废期', value: '已到报废期' },
  { label: '未到报废期', value: '未到报废期' },
  { label: '丢失', value: '丢失' },
];

const officeWarehouse = warehouseCatalog.find((item) => item.company === '114.新媒体') || warehouseCatalog[0];
const shWarehouse = warehouseCatalog.find((item) => item.company === '115.新媒体-上海') || officeWarehouse;
const gzWarehouse = warehouseCatalog.find((item) => item.company === '116.新媒体-广州') || officeWarehouse;

function materialByMajor(majorCategory) {
  return materialCatalog.find((item) => item.materialType === '资产' && item.majorCategory === majorCategory);
}

function fromMaintenance(row, extra = {}) {
  return {
    id: row.id,
    tagNo: row.tag,
    serialNumber: row.serialNumber || '-',
    assetNo: row.assetNo || '-',
    majorCategory: row.majorCategory,
    minorCategory: row.minorCategory,
    description: row.assetDesc,
    config: row.config,
    enableDate: row.enabledDate,
    company: row.companyCode ? `${row.companyCode}.${row.company}` : row.company,
    plate: row.plate,
    responsiblePerson: row.ownerId ? `${row.ownerId}-${row.ownerName}` : row.ownerName,
    costCenter: row.costCenter,
    warehouse: row.warehouse,
    city: row.city,
    building: row.building,
    floor: row.floor,
    status: row.status,
    quantity: row.quantity || 1,
    originalValue: row.originalValue || 0,
    netValue: row.netValue || 0,
    purchaseDate: row.purchaseDate || '',
    scope: getAssetScope(row.majorCategory),
    ...extra,
  };
}

function fromCatalog({ id, majorCategory, tagNo, company, warehouse, owner, status, city, building, floor, originalValue, scope }) {
  const material = materialByMajor(majorCategory);
  if (!material) return null;

  return {
    id,
    tagNo,
    serialNumber: `SN-${tagNo.replace(/[^A-Z0-9]/gi, '')}`,
    assetNo: `FA-${tagNo.replace(/[^A-Z0-9]/gi, '')}`,
    majorCategory: material.majorCategory,
    minorCategory: material.minorCategory,
    description: material.materialDescription,
    materialCode: material.materialCode,
    brand: material.brand,
    model: material.model,
    config: material.config,
    company,
    plate: '17_Corporate',
    responsiblePerson: owner,
    costCenter: 'CC1001.产品技术中心',
    warehouse,
    city,
    building,
    floor,
    status,
    quantity: 1,
    originalValue: originalValue ?? material.referencePrice ?? 0,
    netValue: Math.max(0, Number(originalValue ?? material.referencePrice ?? 0) * 0.25),
    purchaseDate: '2023-06-18',
    scope: scope || getAssetScope(majorCategory),
  };
}

export function getAssetScope(majorCategory) {
  if (MACHINE_MAJOR_CATEGORIES.has(majorCategory)) return '机房资产';
  if (majorCategory === 'SOFTWARE') return '软件';
  return '办公设备';
}

const maintenanceRows = DEFAULT_ASSET_MAINTENANCE_ROWS.slice(0, 6);
const basePool = maintenanceRows.map((row) => fromMaintenance(row));

export const SCRAP_ASSET_POOL = [
  ...basePool,
  fromCatalog({
    id: 'scrap-machine-114',
    majorCategory: 'SERVER',
    tagNo: 'FA-2026-000120',
    company: '114.新媒体',
    warehouse: officeWarehouse?.warehouseDescription || '',
    owner: '213852-孙志强',
    status: '在用-使用中',
    city: officeWarehouse?.city || '',
    building: officeWarehouse?.building || '',
    floor: officeWarehouse?.floor || '',
  }),
  fromCatalog({
    id: 'scrap-soft-1',
    majorCategory: 'SOFTWARE',
    tagNo: 'SW-2026-000021',
    company: '114.新媒体',
    warehouse: officeWarehouse?.warehouseDescription || '',
    owner: '117058-刘臻',
    status: '在用-使用中',
    city: officeWarehouse?.city || '',
    building: officeWarehouse?.building || '',
    floor: officeWarehouse?.floor || '',
    originalValue: 180000,
  }),
  fromCatalog({
    id: 'scrap-furniture-1',
    majorCategory: 'FURNITURE',
    tagNo: 'FA-2026-000116',
    company: '114.新媒体',
    warehouse: officeWarehouse?.warehouseDescription || '',
    owner: 'SOHU53-库房管理员-搜狐媒体',
    status: '在库-再利用',
    city: officeWarehouse?.city || '',
    building: officeWarehouse?.building || '',
    floor: officeWarehouse?.floor || '',
    originalValue: 1200,
  }),
  fromCatalog({
    id: 'scrap-vehicle-1',
    majorCategory: 'VEHICLE',
    tagNo: 'FA-2026-000118',
    company: '115.新媒体-上海',
    warehouse: shWarehouse?.warehouseDescription || '',
    owner: '215410-卢铭华',
    status: '在用-使用中',
    city: shWarehouse?.city || '',
    building: shWarehouse?.building || '',
    floor: shWarehouse?.floor || '',
    originalValue: 280000,
  }),
  fromCatalog({
    id: 'scrap-building-1',
    majorCategory: 'BUILDINGS',
    tagNo: 'FA-2026-000119',
    company: '116.新媒体-广州',
    warehouse: gzWarehouse?.warehouseDescription || '',
    owner: '130113-李琴宝',
    status: '在用-使用中',
    city: gzWarehouse?.city || '',
    building: gzWarehouse?.building || '',
    floor: gzWarehouse?.floor || '',
    originalValue: 6500000,
  }),
].filter(Boolean);

export const ACCOUNTING_ASSET_POOL = SCRAP_ASSET_POOL.map((item, index) => ({
  ...item,
  status: String(item.status || '').startsWith('在库') ? '在库-待报废' : item.status,
  scrapMethod: index === 0 ? '调账' : '非调账',
  detailScrapMethod: index === 0 ? '调账' : index === 1 ? '部分报废' : '全部报废',
  scrapType: index === 5 ? '丢失' : index % 3 === 2 ? '未到报废期' : '已到报废期',
  reason: index % 3 === 2 ? '设备不满足继续使用要求' : '达到报废条件',
  sourceBusinessType: index === 0 ? '跨公司转移' : '资产报废',
  sourceBusinessNo: index === 0 ? 'CT20260923000001' : `BF20260923${String(index + 1).padStart(6, '0')}`,
  newCompany: index === 0 ? '115.新媒体-上海' : '',
  newPlate: index === 0 ? '17_Corporate' : '',
  newCostCenter: index === 0 ? '112064_新媒体成本中心' : '',
  newResponsiblePerson: index === 0 ? '215410-卢铭华' : '',
  targetWarehouse: index === 0 ? 'I3001.资产上海分公司库（新媒体上海）' : '',
  targetCity: index === 0 ? '37.上海市' : '',
  targetBuilding: index === 0 ? '127.瑞安广场' : '',
  targetFloor: index === 0 ? '12层' : '',
  purpose: item.purpose || '',
  project: item.project || '',
}));

const DISPOSAL_QUOTE_SAMPLES = [
  [1250.5, 1280, 1198.88],
  [6800, 6520.5, 6200],
  [23750.25, 22990, 21800.75],
  [1850, 1725.5, 1680],
  [980, 1025.25, 950],
  [14500.75, 13880, 12600],
  [5600, 5380.25, 5120],
  [3200.5, 3100, 2899.99],
  [8500, 8200.5, 7999],
  [19800, 18750.75, 17600],
];

export const DISPOSAL_ASSET_POOL = ACCOUNTING_ASSET_POOL
  .filter((item) => item.scrapMethod !== '调账')
  .map((item, index) => {
    const [recycler1, recycler2, recycler3] = DISPOSAL_QUOTE_SAMPLES[index % DISPOSAL_QUOTE_SAMPLES.length];
    const disposalMode = item.scope === '软件' || item.scrapType === '丢失' ? '无实物处置' : '实物处置';
    return {
      ...item,
      id: `disposal-${item.id}`,
      sourceAssetId: item.id,
      status: '已报废-待处置',
      sourceScrapNo: item.sourceBusinessType === '资产报废' ? item.sourceBusinessNo : '-',
      sourceAccountingNo: `ZMBF20260923${String(index + 1).padStart(4, '0')}`,
      scrapDate: '2026-09-23',
      disposalStatus: '待处置',
      disposalMode,
      enteredAt: '2026-09-23',
      region: String(item.city || '').includes('北京') ? '北京' : '非北京',
      dataCleaning: item.scope === '机房资产' && index === 0 ? '是' : '否',
      recycler1: disposalMode === '实物处置' ? recycler1 : null,
      recycler2: disposalMode === '实物处置' ? recycler2 : null,
      recycler3: disposalMode === '实物处置' ? recycler3 : null,
    };
  });

const lostDisposalAsset = DISPOSAL_ASSET_POOL.find((item) => item.scrapType === '丢失');

const businessRows = {
  crossCompany: [
    {
      id: 'cc-1',
      applicationNo: 'CT20260923000001',
      documentStatus: '审批中',
      assetScope: '机房资产',
      company: '114.新媒体',
      targetCompany: '115.新媒体-上海',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-23',
      assetCount: 2,
      currentNode: '责任人7级及以上直属领导',
      remark: '北京机房资产转入新媒体上海',
    },
    {
      id: 'cc-2',
      applicationNo: 'CT20260922000003',
      documentStatus: '已完成',
      assetScope: '办公设备',
      company: '123.天津飞狐',
      targetCompany: '116.新媒体-广州',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-22',
      assetCount: 5,
      currentNode: '已进入待报废池',
      remark: '办公设备跨公司调整',
    },
  ],
  scrap: [
    {
      id: 'scrap-1',
      applicationNo: 'BF20260923000006',
      documentStatus: '审批中',
      assetScope: '机房资产',
      company: '114.新媒体',
      region: '北京',
      scrapMethod: '全部报废',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-23',
      assetCount: 12,
      currentNode: '采购专员',
      remark: '机房设备批量报废',
    },
    {
      id: 'scrap-2',
      applicationNo: 'BF20260922000011',
      documentStatus: '已审批',
      assetScope: '办公设备',
      company: '114.新媒体',
      region: '北京',
      scrapMethod: '全部报废',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-22',
      assetCount: 3,
      currentNode: '已进入待报废池',
      remark: '办公设备报废',
    },
    {
      id: 'scrap-machine-draft', applicationNo: 'BF20260926000001', documentStatus: '草稿',
      assetScope: '机房资产', company: '114.新媒体', creator: DEMO_APPLICANT,
      createdAt: '2026-09-26', assetCount: 1, scrapMethod: '全部报废',
      assetCategory: 'SERVER', assetLocation: '北京', description: '机房服务器报废演示',
      assetsSnapshot: [SCRAP_ASSET_POOL.find((item) => item.id === 'scrap-machine-114')],
    },
    {
      id: 'scrap-office-draft', applicationNo: 'BF20260926000002', documentStatus: '草稿',
      assetScope: '办公设备', company: '114.新媒体', creator: DEMO_APPLICANT,
      createdAt: '2026-09-26', assetCount: 1, scrapMethod: '全部报废',
      description: '办公设备报废演示',
      assetsSnapshot: [SCRAP_ASSET_POOL.find((item) => item.id === 'scrap-furniture-1')],
    },
  ],
  accounting: [
    {
      id: 'acc-1',
      applicationNo: 'ZMBF20260923000002',
      documentStatus: '审批中',
      assetScope: '机房资产',
      company: '114.新媒体',
      plate: '17_Corporate',
      scrapMethod: '非调账',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-23',
      assetCount: 8,
      currentNode: 'NO部门5级及以上领导',
      remark: '机房资产账面报废',
    },
    {
      id: 'acc-2',
      applicationNo: 'ZMBF20260922000008',
      documentStatus: '待提单人确认',
      assetScope: '办公设备',
      company: '115.新媒体-上海',
      plate: '18_Media',
      scrapMethod: '非调账',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-22',
      assetCount: 4,
      currentNode: '提单人确认',
      remark: '办公设备账面报废',
    },
  ],
  disposal: [
    {
      id: 'disp-1',
      applicationNo: 'CZ20260923000001',
      documentStatus: '处理中',
      assetScope: '机房资产',
      company: '114.新媒体',
      region: '北京',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-23',
      assetCount: 2,
      currentNode: 'ES专员协办',
      remark: '北京机房资产实物处置',
    },
    {
      id: 'disp-2',
      applicationNo: 'CZ20260922000004',
      documentStatus: '审批中',
      assetScope: '办公设备',
      company: '114.新媒体',
      region: '北京',
      creator: DEMO_APPLICANT,
      createdAt: '2026-09-22',
      assetCount: 6,
      currentNode: 'ES一级审批',
      remark: '办公设备实物处置',
    },
    {
      id: 'disp-software', applicationNo: 'CZ20260923000003', documentStatus: '处理中',
      assetScope: '软件', company: '114.新媒体', creator: '系统自动', createdAt: '2026-09-23',
      assetCount: 1, currentNode: '无实物处置确认', disposalMode: '无实物处置',
      remark: '软件无实物处置',
    },
    {
      id: 'disp-lost', applicationNo: 'CZ20260923000004', documentStatus: '处理中',
      assetScope: lostDisposalAsset?.scope || '办公设备',
      company: lostDisposalAsset?.company || '115.焦点互动',
      creator: '系统自动', createdAt: '2026-09-23',
      assetCount: 1, currentNode: '无实物处置确认', disposalMode: '无实物处置',
      assetIds: lostDisposalAsset ? [lostDisposalAsset.id] : [],
      remark: '丢失资产无实物处置',
    },
    {
      id: 'disp-office-beijing', applicationNo: 'CZ20260921000001', documentStatus: '审批中',
      assetScope: '办公设备', company: DISPOSAL_ASSET_POOL.find((item) => item.id === 'disposal-asset-2')?.company || '116.北京新动力',
      region: '北京', creator: DEMO_APPLICANT, createdAt: '2026-09-21',
      assetCount: 1, assetIds: ['disposal-asset-2'], currentNode: 'ES二级审批',
      remark: '笔记本线下询价及处置审批',
    },
    {
      id: 'disp-machine-beijing', applicationNo: 'CZ20260920000002', documentStatus: '处理中',
      assetScope: '机房资产', company: DISPOSAL_ASSET_POOL.find((item) => item.id === 'disposal-asset-3')?.company || '115.新媒体',
      region: '北京', creator: DEMO_APPLICANT, createdAt: '2026-09-20',
      assetCount: 1, assetIds: ['disposal-asset-3'], currentNode: 'ES专员协办',
      remark: '机房服务器完成询价待线下交接',
    },
    {
      id: 'disp-office-shanghai', applicationNo: 'CZ20260919000003', documentStatus: '审批中',
      assetScope: '办公设备', company: DISPOSAL_ASSET_POOL.find((item) => item.id === 'disposal-scrap-vehicle-1')?.company || '115.新媒体-上海',
      region: '非北京', creator: '213852-孙志强', createdAt: '2026-09-19',
      assetCount: 1, assetIds: ['disposal-scrap-vehicle-1'], currentNode: 'ES一级审批',
      remark: '上海车辆处置等待ES一级审批',
    },
    {
      id: 'disp-office-guangzhou', applicationNo: 'CZ20260918000005', documentStatus: '处理中',
      assetScope: '办公设备', company: DISPOSAL_ASSET_POOL.find((item) => item.id === 'disposal-scrap-building-1')?.company || '116.新媒体-广州',
      region: '非北京', creator: '213852-孙志强', createdAt: '2026-09-18',
      assetCount: 1, assetIds: ['disposal-scrap-building-1'], currentNode: 'ES专员处理',
      remark: '广州资产进入线下处置办理',
    },
  ],
};

export function getInitialBusinessRows(type) {
  const sourcePool = type === 'accounting'
    ? ACCOUNTING_ASSET_POOL
    : type === 'disposal'
      ? DISPOSAL_ASSET_POOL
      : SCRAP_ASSET_POOL;

  return (businessRows[type] || []).map((row) => {
    const scoped = row.assetScope === '混合'
      ? sourcePool
      : sourcePool.filter((item) => item.scope === row.assetScope);
    const matching = type === 'disposal' && row.disposalMode === '无实物处置'
      ? scoped.filter((item) => row.assetScope === '软件' ? item.scope === '软件' : item.scrapType === '丢失')
      : scoped.filter((item) => item.disposalMode !== '无实物处置');
    const companyMatching = type === 'disposal'
      ? matching.filter((item) => item.company === row.company)
      : matching;
    const assets = type === 'disposal' && Array.isArray(row.assetIds)
      ? companyMatching.filter((item) => row.assetIds.includes(item.id))
      : companyMatching.slice(0, Math.max(1, row.assetCount || 1));

    return {
      ...row,
      lastModifiedAt: row.lastModifiedAt || row.createdAt,
      originalValueTotal: assets.reduce((sum, item) => sum + Number(item.originalValue || 0), 0),
      netValueTotal: assets.reduce((sum, item) => sum + Number(item.netValue || 0), 0),
      ...(type === 'disposal' ? { assetsSnapshot: assets, approvalHistory: [
        { node: row.disposalMode === '无实物处置' || row.assetScope === '机房资产' ? '系统发起' : '制单人提交', person: row.creator, result: '提交', opinion: '', time: `${row.createdAt} 09:00:00` },
      ] } : {}),
    };
  });
}

export function filterAssetsForScope(scope) {
  return SCRAP_ASSET_POOL.filter((item) => item.scope === scope);
}

export function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
