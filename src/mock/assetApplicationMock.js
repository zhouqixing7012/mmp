export const ASSET_APPLICATION_STORAGE_KEY = 'mmp_demo_asset_applications';

export const TREE_CATEGORIES = [
  {
    id: 'c-pc',
    name: 'IT终端设备',
    children: [
      {
        id: 'c-pc-l2',
        name: '电脑整机',
        children: [
          {
            id: 'c-pc-l3-nb',
            name: '便携式电脑',
            children: [
              { id: 'cat-nb-win', name: 'Windows 笔记本' },
              { id: 'cat-nb-mac', name: 'MacBook' },
            ],
          },
          {
            id: 'c-pc-l3-dt',
            name: '台式电脑',
            children: [{ id: 'cat-host', name: '标准主机' }],
          },
        ],
      },
    ],
  },
  {
    id: 'c-office',
    name: '办公与耗材',
    children: [
      {
        id: 'c-office-l2',
        name: '外设及配件',
        children: [
          {
            id: 'c-office-l3-disp',
            name: '显示设备',
            children: [{ id: 'cat-monitor', name: '桌面显示器' }],
          },
          {
            id: 'c-office-l3-acc',
            name: '耗材配件',
            children: [{ id: 'cat-consumable', name: '键鼠与线材' }],
          },
        ],
      },
    ],
  },
];

export const ASSET_LIBRARY = [
  { id: 'A001', name: 'ThinkPad T14 笔记本', categoryId: 'cat-nb-win', type: 'main', desc: '14英寸 / i7 / 16G / 512G' },
  { id: 'A002', name: 'MacBook Pro 14', categoryId: 'cat-nb-mac', type: 'main', desc: 'M3 Pro / 18G / 512G' },
  { id: 'A004', name: '戴尔 U2723QE 显示器', categoryId: 'cat-monitor', type: 'main', desc: '27英寸 4K Type-C' },
  { id: 'A005', name: '联想 启天 M430', categoryId: 'cat-host', type: 'main', desc: '商用台式主机 i5' },
  { id: 'A006', name: '西部数据 4TB 移动硬盘', categoryId: 'cat-consumable', type: 'consumable', desc: '2.5英寸 USB 3.0' },
  { id: 'A007', name: '苹果 35W 双USB-C 电源适配器', categoryId: 'cat-consumable', type: 'consumable', desc: '原装充电头' },
  { id: 'A008', name: '罗技 MX Master 3S', categoryId: 'cat-consumable', type: 'consumable', desc: '静音办公无线鼠标' },
];

export const MY_EXISTING_ASSETS = [
  {
    id: '112161100271-V',
    name: '戴尔 E2417H显示器',
    assetTag: '112161100271-V',
    assetDesc: '戴尔 E2417H显示器',
    config: '23.8英寸 / IPS / 三年质保',
    status: '在用-使用中',
    purpose: '员工用机',
  },
  {
    id: '114122102371',
    name: '微软 Surface Laptop 4',
    assetTag: '114122102371',
    assetDesc: '微软 Surface Laptop 4',
    config: 'i7-1185G7 / 16G / 256G SSD',
    status: '在用-使用中',
    purpose: '员工用机',
  },
  {
    id: '115083104512',
    name: '苹果 MacBook Air M2',
    assetTag: '115083104512',
    assetDesc: '苹果 MacBook Air M2',
    config: 'M2 / 16G / 512G SSD / 13.6英寸',
    status: '在用-使用中',
    purpose: '员工用机',
  },
];

export const REASON_OPTIONS = ['新员入职', '设备损坏', '项目测试', '日常补充', '其他原因'];

export const DEFAULT_ASSET_APPLICATIONS = [
  {
    id: 'CA-2026071500001',
    status: 'pending',
    applicant: {
      name: '王英',
      id: '200620',
      phone: '010-00000001',
      email: 'yingwang200620@sohu-lab.com',
      department: '集团总部-员工服务中心-资产部',
    },
    applyDate: '2026-07-15',
    materials: [
      {
        id: 'A001',
        name: 'ThinkPad T14 笔记本',
        desc: '联想 ThinkPad T14',
        config: 'i7 / 16G / 512G',
        detail: '旧电脑性能不足以支撑新项目编译',
        reason: '设备更新',
        usage: '专业用途',
        isOverStandard: true,
        quantity: 1,
      },
    ],
    approvalHistory: [
      { node: '开始', person: '200620-王英', agent: '-', status: 'submitted', time: '2026-07-15 10:20', comment: '-' },
      { node: '部门经理-审批', person: '206984-何文', agent: '-', status: 'agreed', time: '2026-07-16 09:15', comment: '同意，项目确实需要。' },
      { node: '部门总监-审批', person: '111585-刘宇', agent: '-', status: 'agreed', time: '2026-07-16 14:30', comment: '同意' },
      { node: '资产管理员-审批', person: '当前用户', agent: '-', status: 'pending', time: '-', comment: '-' },
    ],
  },
];
