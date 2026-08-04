export const CONTRACT_NUMBER_ALLOCATION_STORAGE_KEY = 'mmp.contractNumberAllocation.applications.v1';

export const CONTRACT_NUMBER_CANDIDATES = [
  { id: 'CN-001', imei: '1', assetTag: 'N-0094', phoneNumber: '18001311393', packageName: '140元套餐', status: '在库' },
  { id: 'CN-002', imei: '2', assetTag: 'N-0100', phoneNumber: '18001311551', packageName: '140元套餐', status: '在库' },
  { id: 'CN-003', imei: '3', assetTag: 'N-0105', phoneNumber: '18001311153', packageName: '140元套餐', status: '在库' },
  { id: 'CN-004', imei: '4', assetTag: 'N-0122', phoneNumber: '18001063803', packageName: '140元套餐', status: '在库' },
  { id: 'CN-005', imei: '5', assetTag: 'N-0135', phoneNumber: '18001311120', packageName: '140元套餐', status: '在库' },
  { id: 'CN-006', imei: '6', assetTag: 'N-0141', phoneNumber: '18001311986', packageName: '199元套餐', status: '在库' },
  { id: 'CN-007', imei: '7', assetTag: 'N-0158', phoneNumber: '18001311771', packageName: '99元套餐', status: '在库' },
];

export const DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS = [
  {
    id: 'PCMFL202409100001',
    status: '待审批',
    currentNode: 'ES审批',
    applicant: {
      id: '219319',
      name: '王天明',
      department: '视频产品技术中心/互动技术部',
      level: '5',
      phone: '13810693008',
      extension: '010-56601907',
      entryTime: '2021-10-27 00:00:00',
    },
    applyReason: '通讯资源管理系统主动推送',
    idCard: '220***********2079',
    notice: '5级及以上人员流程为自动发起，已在通知邮件中进行提醒，领取电话卡时需携带身份证复印件。',
    assignedNumber: null,
    delayRecords: [],
    history: [
      {
        id: 'history-1',
        person: '王天明(219319)',
        node: '开始',
        time: '2024-09-10 14:29:00',
        status: '已提交',
        comment: '系统自动发起合约号码申请',
      },
      {
        id: 'history-2',
        person: '王天明(219319)',
        node: '申请人确认',
        time: '2024-09-10 15:08:04',
        status: '已同意',
        comment: '确认申请',
      },
      {
        id: 'history-3',
        person: '孙志强(213852)',
        node: 'ES审批',
        time: '',
        status: '待审批',
        comment: '',
      },
    ],
  },
];
