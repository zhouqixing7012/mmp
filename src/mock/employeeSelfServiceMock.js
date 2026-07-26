export const EMPLOYEE_SELF_SERVICE_STORAGE_KEY = 'mmp_demo_employee_self_service_applications';

export const CURRENT_EMPLOYEE = {
  id: '220784',
  name: '周琦星',
  phone: '010-00000001',
  email: 'zhouqixing@sohu-lab.com',
  company: '集团媒体',
  department: '集团总部.员工服务中心.产品组',
  officeArea: '北京-搜狐媒体大厦',
  employeeStatus: '正式员工',
  jobType: '非技术人员',
  costCenter: '162001.员工服务中心',
  directLeader: '206984-何文',
  level5Leader: '111585-刘宇',
  level7Leader: '111681-章宇东',
};

export const APPLICATION_NOTICE = [
  '须以实际业务需求及办公为前提填写申请；',
  '资产申请以部门为维度，每月汇总提交；',
  '如资产选择目录缺少所需信息，请联系集团 ES 王英；',
  '外地分公司员工申请资产，可先联系当地 ES 沟通咨询。',
];

export const ASSET_MATERIAL_OPTIONS = [
  {
    id: 'MAT-001',
    materialType: '资产',
    category: 'PC-便携式电脑-笔记本-联想-ThinkPad T14',
    assetDesc: '笔记本.联想.ThinkPad T14',
    config: 'i7 / 16G / 512G SSD',
    referencePrice: 7800,
    overStandard: false,
    departmentOverStandard: false,
    requiresVp: false,
  },
  {
    id: 'MAT-002',
    materialType: '资产',
    category: 'PC-便携式电脑-笔记本-苹果-MacBook Pro 14',
    assetDesc: '笔记本.苹果.MacBook Pro 14',
    config: 'M3 Pro / 18G / 512G SSD',
    referencePrice: 14999,
    overStandard: true,
    departmentOverStandard: true,
    requiresVp: true,
  },
  {
    id: 'MAT-003',
    materialType: '资产',
    category: 'OFFICE EQUIPMENT-显示设备-显示器-戴尔-U2723QE',
    assetDesc: '显示器.戴尔.U2723QE',
    config: '27 英寸 / 4K / Type-C',
    referencePrice: 3999,
    overStandard: false,
    departmentOverStandard: false,
    requiresVp: false,
  },
];

export const APPLICATION_REASON_OPTIONS = ['设备更新', '新项目需要', '设备损坏', '新增岗位', '其他原因'];
export const APPLICATION_PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途'];

export const DEFAULT_EMPLOYEE_SELF_SERVICE_APPLICATIONS = [
  {
    id: 'CA-2026072600001',
    applyDate: '2026-07-26',
    status: '处理中',
    taskStatus: '业务审批',
    currentNode: '直属领导',
    applicant: CURRENT_EMPLOYEE,
    materials: [
      {
        id: 'MAT-002',
        assetDesc: '笔记本.苹果.MacBook Pro 14',
        config: 'M3 Pro / 18G / 512G SSD',
        quantity: 1,
        reason: '新项目需要',
        purpose: '专业用途',
        detail: '用于移动端设计和视频素材处理',
        overStandard: true,
        departmentOverStandard: true,
        requiresVp: true,
      },
    ],
    approvalHistory: [
      {
        node: '开始',
        person: '220784-周琦星',
        status: '已提交',
        time: '2026-07-26 10:20',
        comment: '-',
      },
      {
        node: '直属领导',
        person: '206984-何文',
        status: '待审批',
        time: '-',
        comment: '-',
      },
    ],
  },
];
