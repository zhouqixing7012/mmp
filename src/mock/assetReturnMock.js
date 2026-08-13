export const ASSET_RETURN_STORAGE_KEY = 'mmp.assetReturn.applications.v1';
export const ASSET_RETURN_DRAFT_KEY = 'mmp.assetReturn.draft.v1';
export const CONTRACT_RETURN_STORAGE_KEY = 'mmp.contractReturn.applications.v3';
export const CONTRACT_RETURN_DRAFT_KEY = 'mmp.contractReturn.draft.v1';
export const RETURN_CONFIRMATION_KEY = 'mmp.return.confirmation.v1';

export const RETURN_WAREHOUSES = [
  '北京总部资产仓',
  '北京搜狐媒体大厦仓',
  '上海办公区资产仓',
];

export const CONTRACT_WAREHOUSES = [
  '北京总部号码仓',
  '上海办公区号码仓',
];

export const EMPLOYEE_CONTRACT_NUMBERS = [
  {
    id: 'CN-001',
    number: '13800138001',
    assetTag: 'TEL-2025000188',
    category: '合约号码',
    brand: '中国移动',
    description: '搜狐集团员工商务套餐',
    packageContent: '国内流量 80GB / 语音 1000 分钟',
    amount: 129,
    status: '在用',
    company: '搜狐新动力信息技术有限公司',
    block: '集团',
    department: '集团 / 资产管理部 / 员工服务中心',
    officeArea: '北京-搜狐媒体大厦',
    locked: false,
  },
  {
    id: 'CN-002',
    number: '13900139002',
    assetTag: 'TEL-2024000266',
    category: '合约号码',
    brand: '中国联通',
    description: '员工办公通讯套餐',
    packageContent: '国内流量 60GB / 语音 800 分钟',
    amount: 99,
    status: '在用',
    company: '搜狐新动力信息技术有限公司',
    block: '集团',
    department: '集团 / 资产管理部 / 员工服务中心',
    officeArea: '北京-搜狐媒体大厦',
    locked: false,
  },
  {
    id: 'CN-003',
    number: '13700137003',
    assetTag: 'TEL-2023000312',
    category: '合约号码',
    brand: '中国电信',
    description: '员工基础通讯套餐',
    packageContent: '国内流量 30GB / 语音 500 分钟',
    amount: 69,
    status: '在用',
    company: '搜狐新动力信息技术有限公司',
    block: '集团',
    department: '集团 / 资产管理部 / 员工服务中心',
    officeArea: '北京-搜狐媒体大厦',
    locked: false,
  },
];

export const DEFAULT_ASSET_RETURN_APPLICATIONS = [];

export const DEFAULT_CONTRACT_RETURN_APPLICATIONS = [
  {
    id: 'HTTK-202608040001',
    status: '处理中',
    result: '',
    currentNode: '号码退库办理',
    applyTime: '2026-08-04 09:15:00',
    applicant: {
      id: '213852',
      name: '孙志强',
      phone: '138****2852',
      email: 'sunzhiqiang@sohu-inc.com',
      company: '搜狐新动力信息技术有限公司',
      block: '集团',
      department: '集团 / 资产管理部 / 员工服务中心',
      officeArea: '北京-搜狐媒体大厦',
      costCenter: '112060.员工服务中心',
    },
    reason: '工作调整，申请退还本人名下合约号码及实体电话卡。',
    contractNumber: {
      ...EMPLOYEE_CONTRACT_NUMBERS[0],
      status: '在用',
    },
    handling: {
      warehouse: '北京总部号码仓',
      responsiblePerson: '号码库管员',
      returnDate: '2026-08-04',
      usageNote: '',
      opinion: '',
      confirmationStatus: '未发起',
      confirmationMethod: '',
      confirmationEmployeeId: '',
      confirmationTime: '',
      inboundOrderNo: '',
    },
    history: [
      {
        node: '员工提交',
        status: '已提交',
        comment: '提交合约号码退库申请',
        person: '213852-孙志强',
        time: '2026-08-04 09:15:00',
      },
      {
        node: '号码退库办理',
        status: '待处理',
        comment: '-',
        person: '号码库管员',
        time: '',
      },
    ],
  },
];
