export const assetClaimApplication = {
  applicationNo: 'CA-2024090500001',
  warehouse: 'I0018-资产集团前台库（新动力）',
  applicant: '111485-王立伟',
  phone: '010-00000001',
  email: 'davidwong@sohu-lab.com',
  company: '北京新动力',
  officeArea: '北京-搜狐媒体大厦',
  costCenter: '162001.视频_技术部_产品技术',
  department: '视频.产品技术中心.运维系统部.运维组',
  applyDate: '2024-09-05',
  remark: '',
  asset: {
    id: 'asset-1',
    tag: '112161100027-V',
    serialNumber: 'SOHUXX162141',
    warehouse: 'I0018-资产集团前台库（新动力）',
    spareQuantity: 0,
    company: '112-北京新动力',
    block: '视频',
    enabledDate: '2013-12-24',
    description: '惠普.P221显示器',
    configuration: '-',
    city: '35.北京市',
    building: '129753.搜狐媒体大厦',
    floor: '8层',
    purpose: '其他用途',
    usageDescription: '',
    inventoryOwner: '-',
    inventoryStatus: '未盘',
    applyConfiguration: '无',
    applyMaterialDescription: '惠普.P221显示器',
    applyReason: '1',
    detailDescription: '',
    quantity: 1,
  },
};

export const assetClaimSelectableAssets = [
  assetClaimApplication.asset,
  {
    ...assetClaimApplication.asset,
    id: 'asset-2',
    tag: '112161100031-V',
    serialNumber: 'SOHUXX162155',
    description: '戴尔.U2723QE显示器',
    configuration: '27英寸 / 4K / Type-C',
  },
  {
    ...assetClaimApplication.asset,
    id: 'asset-3',
    tag: '112161100099-V',
    serialNumber: 'SOHUXX162199',
    warehouse: 'I0020-资产集团备用库',
    description: '联想.ThinkPad T14笔记本',
    configuration: 'i7 / 16G / 512G',
  },
];

export const assetClaimLocationData = [
  {
    city: '35.北京市',
    buildings: [
      { building: '129753.搜狐媒体大厦', floors: ['6层', '7层', '8层', '9层'] },
      { building: '129754.搜狐网络大厦', floors: ['3层', '4层', '5层'] },
    ],
  },
  {
    city: '31.上海市',
    buildings: [
      { building: '310001.上海办公室', floors: ['10层', '11层', '12层'] },
    ],
  },
];

export const assetClaimNotice =
  '领用人员承担妥善保管物资的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应赔偿责任。因公司需要，领用人应当配合及时调换或归还借用物资。';
