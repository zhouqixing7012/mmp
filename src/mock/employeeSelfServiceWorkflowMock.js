export const EMPLOYEE_SELF_SERVICE_ALLOCATION_STORAGE_KEY = 'mmp_demo_employee_self_service_allocations';
export const EMPLOYEE_SELF_SERVICE_SUMMARY_STORAGE_KEY = 'mmp_demo_employee_self_service_summaries';

export const ES_ALLOCATION_HANDLERS = {
  集团媒体: ['200620-王英', '206984-何文'],
  视频: ['114111-杨芊', '206984-何文'],
  焦点: ['213852-孙志强', '206984-何文'],
  上海媒体分公司: ['215410-卢铭华'],
  广州媒体分公司: ['130113-李琴宝'],
};

export const APPLICANT_CURRENT_ASSETS = [
  {
    id: 'OWN-001',
    applicantId: '220784',
    assetTag: '112161100271-V',
    assetDesc: '显示器.戴尔.P2419H',
    config: '23.8 英寸 / IPS',
    assetStatus: '在用-使用中',
    borrowStatus: '非借用',
  },
  {
    id: 'OWN-002',
    applicantId: '220784',
    assetTag: '114122102371',
    assetDesc: '笔记本.微软.Surface Laptop 4',
    config: 'i7 / 16G / 256G SSD',
    assetStatus: '在用-借用中',
    borrowStatus: '未超期',
  },
];

export const ALLOCATABLE_ASSETS = [
  {
    id: 'STOCK-001',
    materialId: 'MAT-001',
    assetTag: '112026070001',
    company: '集团媒体',
    block: '集团',
    assetDesc: '笔记本.联想.ThinkPad T14',
    config: 'i7 / 16G / 512G SSD',
    warehouse: 'I0018-资产集团前台库（新动力）',
    assetStatus: '在库-新增',
    assetMark: '',
    locked: false,
    enabledDate: '2026-07-20',
  },
  {
    id: 'STOCK-002',
    materialId: 'MAT-001',
    assetTag: '112026070002',
    company: '集团媒体',
    block: '媒体',
    assetDesc: '笔记本.联想.ThinkPad T14',
    config: 'i7 / 16G / 512G SSD',
    warehouse: 'I0018-资产集团前台库（新动力）',
    assetStatus: '在库-再利用',
    assetMark: '',
    locked: false,
    enabledDate: '2024-11-08',
  },
  {
    id: 'STOCK-003',
    materialId: 'MAT-003',
    assetTag: '112026070010',
    company: '集团媒体',
    block: '集团',
    assetDesc: '显示器.戴尔.U2723QE',
    config: '27 英寸 / 4K / Type-C',
    warehouse: 'I0018-资产集团前台库（新动力）',
    assetStatus: '在库-待处理',
    assetMark: '',
    locked: false,
    enabledDate: '2025-03-16',
  },
  {
    id: 'STOCK-004',
    materialId: 'MAT-002',
    assetTag: '112026070021',
    company: '集团媒体',
    block: '集团',
    assetDesc: '笔记本.苹果.MacBook Pro 14',
    config: 'M3 Pro / 18G / 512G SSD',
    warehouse: 'I0018-资产集团前台库（新动力）',
    assetStatus: '在库-新增',
    assetMark: '',
    locked: false,
    enabledDate: '2026-07-22',
  },
];

export const DEPARTMENT_ASSET_USAGE = [
  { id: 'USE-001', department: '集团总部.员工服务中心', category: '笔记本', currentQuantity: 42, employeeCount: 36, companyAverage: 1.08 },
  { id: 'USE-002', department: '集团总部.员工服务中心', category: '显示器', currentQuantity: 51, employeeCount: 36, companyAverage: 1.21 },
  { id: 'USE-003', department: '集团总部.员工服务中心', category: '主机', currentQuantity: 8, employeeCount: 36, companyAverage: 0.32 },
];

export const DEFAULT_ALLOCATION_ORDERS = [];
export const DEFAULT_PURCHASE_SUMMARIES = [];
