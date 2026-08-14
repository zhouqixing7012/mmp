export const UNIFIED_SUMMARY_LIST = [
  {
    id: 'UA-202601-001',
    department: '集团总部.员工服务中心',
    quantity: 4,
    summaryTime: '2026-08-03至2026-08-09',
    status: '待汇总',
  },
];

export const UNIFIED_SUMMARY_APPLICANTS = [
  {
    key: '114111',
    applicant: '114111-杨芊',
    formNo: 'CA-2026010800002',
    department: '集团总部.员工服务中心.资产部',
    items: [
      {
        key: '114111-1',
        category: '显示器-标准显示器',
        assetDesc: '缺省.标配显示器',
        config: '无',
        detail: '测试',
        price: 0,
        overStandard: '否',
        quantity: 1,
        esAdvice: '同意',
        currentAssets: 4,
      },
    ],
  },
  {
    key: '206984',
    applicant: '206984-何文',
    formNo: 'CA-2026020500004',
    department: '集团总部.员工服务中心.资产部',
    items: [
      {
        key: '206984-1',
        category: '办公设备-多功能一体机',
        assetDesc: '东芝.e-STUDIO 4508A一体机',
        config: '无',
        detail: '测试',
        price: 33000,
        overStandard: '否',
        quantity: 2,
        esAdvice: '同意',
        currentAssets: 0,
      },
    ],
  },
  {
    key: '213852',
    applicant: '213852-孙志强',
    formNo: 'CA-2025122400006',
    department: '集团总部.员工服务中心.资产部',
    items: [
      {
        key: '213852-1',
        category: '显示器-标准显示器',
        assetDesc: 'A.O史密斯.AO史密斯 电热水器',
        config: '无',
        detail: '资产领用全文检索3',
        price: 0,
        overStandard: '否',
        quantity: 1,
        esAdvice: '同意',
        currentAssets: 2,
      },
    ],
  },
];

export const SUMMARY_TEXT = [
  '2025年12月集团总部.员工服务中心统一申请已经统计完毕，申请采购物资共计4件，预计采购费用66,000.00元。',
  'ES已核实员工申请需求，目前无可用库存进行调配。',
];

export const DEPARTMENT_SUMMARY_ROWS = [
  { key: 'monitor', index: 1, category: '显示器-标准显示器', quantity: 2, amount: 0 },
  { key: 'printer', index: 2, category: '办公设备-多功能一体机', quantity: 2, amount: 66000 },
];

export const NON_OVER_STANDARD_ROWS = [
  {
    key: '213852-1',
    index: 1,
    applicant: '213852-孙志强',
    category: '显示器-标准显示器',
    assetDesc: 'A.O史密斯.AO史密斯 电热水器',
    config: '无',
    quantity: 1,
    amount: 0,
    detail: '资产领用全文检索3',
    currentAssets: 2,
    esAdvice: '同意',
  },
  {
    key: '114111-1',
    index: 2,
    applicant: '114111-杨芊',
    category: '显示器-标准显示器',
    assetDesc: '缺省.标配显示器',
    config: '无',
    quantity: 1,
    amount: 0,
    detail: '测试',
    currentAssets: 4,
    esAdvice: '同意',
  },
  {
    key: '206984-1',
    index: 3,
    applicant: '206984-何文',
    category: '办公设备-多功能一体机',
    assetDesc: '东芝.e-STUDIO 4508A一体机',
    config: '无',
    quantity: 2,
    amount: 66000,
    detail: '测试',
    currentAssets: 0,
    esAdvice: '同意',
  },
];
