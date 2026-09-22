import { materialCatalog } from '../../mock/reference/materialCatalog';
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
    plate: '17.Corporate',
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
].filter((item) => item.majorCategory);

const businessRows = {
  crossCompany: [
    {
      id: 'cc-1',
      applicationNo: 'CT202609230001',
      documentStatus: '审批中',
      assetScope: '机房资产',
      company: '114.新媒体',
      creator: '220314-刘帅',
      createdAt: '2026-09-23',
      assetCount: 2,
      currentNode: '责任人7级及以上直属领导',
      remark: '北京机房资产转入新媒体上海',
    },
    {
      id: 'cc-2',
      applicationNo: 'CT202609220003',
      documentStatus: '已完成',
      assetScope: '办公设备',
      company: '123.天津飞狐',
      creator: 'ES专员',
      createdAt: '2026-09-22',
      assetCount: 5,
      currentNode: '已进入待报废池',
      remark: '办公设备跨公司调整',
    },
  ],
  scrap: [
    {
      id: 'scrap-1',
      applicationNo: 'BF202609230006',
      documentStatus: '审批中',
      assetScope: '机房资产',
      company: '114.新媒体',
      creator: '220314-刘帅',
      createdAt: '2026-09-23',
      assetCount: 12,
      currentNode: '采购专员',
      remark: '机房设备批量报废',
    },
    {
      id: 'scrap-2',
      applicationNo: 'BF202609220011',
      documentStatus: '已审批',
      assetScope: '办公设备',
      company: '114.新媒体',
      creator: 'ES专员',
      createdAt: '2026-09-22',
      assetCount: 3,
      currentNode: '已进入待报废池',
      remark: '办公设备报废',
    },
  ],
  accounting: [
    {
      id: 'acc-1',
      applicationNo: 'ZMBF202609230002',
      documentStatus: '审批中',
      assetScope: '机房资产',
      company: '114.新媒体',
      creator: '吕静',
      createdAt: '2026-09-23',
      assetCount: 8,
      currentNode: 'NO部门5级及以上领导',
      remark: '机房资产账面报废',
    },
    {
      id: 'acc-2',
      applicationNo: 'ZMBF202609220008',
      documentStatus: '待提单人确认',
      assetScope: '办公设备',
      company: '115.新媒体-上海',
      creator: '卢铭华',
      createdAt: '2026-09-22',
      assetCount: 4,
      currentNode: '提单人确认',
      remark: '办公设备账面报废',
    },
  ],
  disposal: [
    {
      id: 'disp-1',
      applicationNo: 'CZ202609230001',
      documentStatus: '处理中',
      assetScope: '机房资产',
      company: '114.新媒体',
      creator: '采购专员',
      createdAt: '2026-09-23',
      assetCount: 2,
      currentNode: 'ES专员协办',
      remark: '北京机房资产实物处置',
    },
    {
      id: 'disp-2',
      applicationNo: 'CZ202609220004',
      documentStatus: '审批中',
      assetScope: '办公设备',
      company: '114.新媒体',
      creator: 'ES专员',
      createdAt: '2026-09-22',
      assetCount: 6,
      currentNode: 'ES一级审批',
      remark: '办公设备实物处置',
    },
  ],
};

export function getInitialBusinessRows(type) {
  return (businessRows[type] || []).map((row) => ({ ...row }));
}

export function filterAssetsForScope(scope) {
  return SCRAP_ASSET_POOL.filter((item) => item.scope === scope);
}

export function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
