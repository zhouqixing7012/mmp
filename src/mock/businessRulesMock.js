// Mock 数据集中管理，后续接真实接口时只改这一个文件

// 物料大类
export const mockMaterialCategories = [
  { id: 1, code: '001', desc: 'SERVER' },
  { id: 2, code: '002', desc: 'OFFICE EQUIPMENT' },
  { id: 3, code: '003', desc: 'NET EQUIPMENT' },
  { id: 4, code: '004', desc: 'COMPUTER PARTS' },
  { id: 5, code: '005', desc: 'CONSUMABLES' },
];

// 品牌
export const mockBrands = [
  { id: 1, code: '001', desc: '华硕' },
  { id: 2, code: '002', desc: '三星' },
  { id: 3, code: '003', desc: '闪迪' },
  { id: 4, code: '004', desc: '联想' },
  { id: 5, code: '005', desc: '戴尔' },
];

// 型号
export const mockModels = [
  { id: 1, brand: '华硕', code: '001', desc: '天选5 Pro' },
  { id: 2, brand: '三星', code: '002', desc: 'Galaxy S8+' },
  { id: 3, brand: '闪迪', code: '003', desc: '512G固态硬盘' },
  { id: 4, brand: '联想', code: '004', desc: 'ThinkPad X1 Carbon' },
  { id: 5, brand: '戴尔', code: '005', desc: 'XPS 15' },
];

// 配置
export const mockConfigs = [
  { id: 1, brand: '华硕', model: '天选5 Pro', code: '001', desc: '标准配置' },
  { id: 2, brand: '三星', model: 'Galaxy S8+', code: '002', desc: 'G9550 64G 全网通' },
  { id: 3, brand: '闪迪', model: '512G固态硬盘', code: '003', desc: '512G NVMe' },
  { id: 4, brand: '联想', model: 'ThinkPad X1 Carbon', code: '004', desc: 'i7 16GB 512GB' },
  { id: 5, brand: '戴尔', model: 'XPS 15', code: '005', desc: 'i9 32GB 1TB' },
];

// 公司
export const mockCompanies = [
  { id: 1, code: '114', desc: '搜狐媒体' },
  { id: 2, code: '115', desc: '新媒体' },
  { id: 3, code: '122', desc: '焦点直销' },
  { id: 4, code: '203', desc: '焦点新干线' },
  { id: 5, code: '420', desc: '上海搜狐互' },
];

// 部门
export const mockDepartments = [
  { id: 1, code: 'D0001', desc: '集团总部' },
  { id: 2, code: 'D0002', desc: '财务中心' },
  { id: 3, code: 'D0003', desc: '法律中心' },
  { id: 4, code: 'D0161', desc: '搜狐媒体' },
  { id: 5, code: 'D0164', desc: '搜狐媒体_社会招聘' },
];

// 仓库
export const mockWarehouses = [
  { id: 1, code: 'I0001', desc: '资产库北京库(新媒体)', city: '北京市' },
  { id: 2, code: 'I0015', desc: '资产库(前台库)(互联网)', city: '北京市' },
  { id: 3, code: 'I2031', desc: '资产库北京库(焦点互动)', city: '北京市' },
  { id: 4, code: 'I3001', desc: '资产库上海库', city: '上海市' },
 { id: 5, code: 'I4001', desc: '资产库深圳库', city: '深圳市' },
 ];
 
 // 表格展示 mock 数据（来自 yewurules.js 各视图组件）
 export const mockComprehensiveData = [
   { id: 1, mainCatCode: '3', code: '228002052003000', desc: '闪迪 512G固态硬盘', catDesc: '内存/硬盘', subCatDesc: '硬盘', brand: '闪迪', model: '512G', configDesc: '', unit: '块', hasLevel: '0', level: '', hasMainAsset: '1', returnCheck: 'MIS', misAudit: '1', enabled: '1', canApply: '0', refPrice: '1380.00', isStop: '0', needCheck: '否', allowReplace: '1', allowTransfer: '0', allowBorrow: '1', needEsApproval: '0', allowReturn: '1' },
   { id: 2, mainCatCode: '3', code: '228002001279000', desc: '三星 500G固态硬盘', catDesc: '内存/硬盘', subCatDesc: '硬盘', brand: '三星', model: '500G', configDesc: '', unit: '块', hasLevel: '0', level: '', hasMainAsset: '1', returnCheck: 'MIS', misAudit: '1', enabled: '1', canApply: '0', refPrice: '0.00', isStop: '0', needCheck: '否', allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '1', allowReturn: '0' },
   { id: 3, mainCatCode: '1', code: '11100583001000', desc: '测试品牌-测试型号', catDesc: 'PC', subCatDesc: '测试PC小类', brand: '测试品牌', model: '测试型号', configDesc: '', unit: '个', hasLevel: '0', level: '', hasMainAsset: '0', returnCheck: 'ES', misAudit: '1', enabled: '1', canApply: '0', refPrice: '0.00', isStop: '0', needCheck: '是', allowReplace: '1', allowTransfer: '1', allowBorrow: '1', needEsApproval: '0', allowReturn: '1' },
 ];
 
 export const mockCategoryData = [
   { id: 14, code: '001', desc: 'SERVER', enabled: true },
   { id: 34, code: '002', desc: '合约机', enabled: true },
 ];
 
 export const mockSubCategoryData = [
   { id: 1, catDesc: 'OFFICE EQUIPMENT', subCode: '113', subDesc: '移动数码-智能机器人', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
   { id: 2, catDesc: 'NET EQUIPMENT', subCode: '025', subDesc: '网络设备-UPS电源', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
 ];
 
 export const mockBrandListData = [
   { id: 1, code: '040', desc: '滴滴出行', enabled: true },
   { id: 2, code: '055', desc: '优客工场', enabled: true },
 ];
 
export const mockModelListData = [
  { id: 1, brand: '华硕', code: '014', desc: '天选5 Pro 魔霸版', enabled: true },
];
 
 export const mockNOServiceData = [
 { id: 1, brand: '三星', model: 'Galaxy S8+', code: '001', desc: 'G9550 64G 全网通', enabled: true },
];

// 办公区
export const mockOffices = [
  { id: 1, code: 'L062', desc: '北京-搜狐媒体大厦' },
  { id: 2, code: 'L063', desc: '北京-搜狐网络大厦' },
  { id: 3, code: 'L064', desc: '上海-搜狐媒体大厦' },
];

export const mockOfficeWarehouseData = [
  { id: 1, company: 'WJS.北京搜狐互联网信息服务有限公司', dept: 'D0164.搜狐媒体.社交产品中心', office: 'L062.北京-搜狐媒体大厦', warehouse: 'I0015.资产集团前台库（互联网）', enabled: true },
  { id: 2, company: '420.上海搜狐互联网有限公司', dept: 'D0164.搜狐媒体.社交产品中心', office: 'L064.上海-搜狐媒体大厦', warehouse: 'I3001.资产库上海库', enabled: true },
];

// 城市
export const mockCities = [
  { id: 1, code: 'CT0001', desc: '北京' },
  { id: 2, code: 'CT0002', desc: '上海' },
  { id: 3, code: 'CT0003', desc: '深圳' },
];

// 建筑
export const mockBuildings = [
  { id: 1, code: '206', desc: '缺省' },
  { id: 2, code: 'SOHU01', desc: '搜狐媒体大厦' },
  { id: 3, code: 'NETC01', desc: '联通数据中心' },
];

export const mockEmployeeMappingData = [
  { id: 1, company: 'WJS_北京搜狐互...', dept: 'D0164_搜狐媒体_社会...', office: 'L062_北京-搜狐媒体大厦...', warehouse: 'I0015_资产库(前台库)(互联网)...', enabled: true },
];
 
 
export const mockPSNewEmployeeMappingData = [
  { id: 1, company: '搜狐千线', config: '笔记本-ThinkPad X1 Carbon Gen 11', city: '北京', desc: '新员工标配笔记本', qty: 5, dept: '技术部', enabled: true },
  { id: 2, company: '搜狐媒体', config: '台式机-Dell OptiPlex 7080', city: '北京', desc: '新员工标配台式机', qty: 3, dept: '内容部', enabled: true },
  { id: 3, company: '搜狐视频', config: '笔记本-MacBook Pro 14"', city: '上海', desc: '新员工标配开发机', qty: 2, dept: '研发部', enabled: true },
];

export const mockNOLocationData = [
  { id: 1, code: 'SDZZ_CH1', desc: '枣庄联通机房', info: '山东省市中区长白山路2666号联通数据中心', city: '68.山东省-枣庄市', building: '206.联通数据中心', floor: '3层', enabled: true },
  { id: 2, code: 'SDZZ_CU1', desc: '青岛联通', info: '青岛市苗岭路11号4楼 秦岭路IDC机房', city: '68.山东省-青岛市', building: '206.缺省', floor: '缺省', enabled: true },
 ];
 
export const mockVirtualWarehouseData = [
  { isGroup: true, groupName: '搜狐' },
  { id: 1, code: 'SDZZ_CH1', desc: '枣庄联通机房', info: '山东省市中区长白山路2666号联通数...', city: '1854374_山东省_枣庄市', building: '1854711_联通数据中心', floor: '3层', enabled: true },
];
 
 export const mockVirtualWarehouseManagerData = [
   { id: 1, company: '203_搜狐千线', plate: '59_SAAS', virtualAdmin: 'SOHU52-库房管理员-焦点', realAdmin: 'SOHU51-公共管理员-焦点', enabled: true },
 ];

// 虚拟库管员参考数据
export const mockVirtualAdmins = [
  { id: 1, code: 'SOHU52', desc: 'SOHU52-库房管理员-焦点' },
  { id: 2, code: 'SOHU53', desc: 'SOHU53-库房管理员-搜狐媒体' },
  { id: 3, code: 'SOHU54', desc: 'SOHU54-库房管理员-新媒体' },
];

// 仓库管理员参考数据
export const mockRealAdmins = [
  { id: 1, code: 'SOHU51', desc: 'SOHU51-公共管理员-焦点' },
  { id: 2, code: 'SOHU55', desc: 'SOHU55-公共管理员-搜狐媒体' },
];
 
 export const mockPlateLedgerData = [
   { id: 1, plate: '22_搜索事业部', ledger: 'FA_BOOK_SOGOU', enabled: true },
 ];
 
 export const mockCompanyPlateAuthData = [
   { id: 1, company: '114_搜狐媒体', plate: '17_Corporate', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '', enabled: '1' },
    { id: 2, company: '122_焦点直销', plate: '52_房产', materialCategory: '142_焦点_北京', empCompany: '122_焦点直销', empPlate: '52_房产', enabled: '1' },
    { id: 3, company: '203_焦点新干线', plate: '33_SAAS', materialCategory: '140_搜狐媒体_武汉', empCompany: '203_焦点新干线', empPlate: '33_SAAS', enabled: '0' },
    { id: 4, company: '114_搜狐媒体', plate: '17_Corporate', materialCategory: '160_机房_北京', empCompany: '114_搜狐媒体', empPlate: '17_Corporate', enabled: '1' },
 ];
 
 export const mockNODeviceAuthData = [
  { id: 1, type: '服务器', owner: '220314-刘帅', enabled: '1' },
  { id: 2, type: '网络设备', owner: '210415-王强', enabled: '1' },
  { id: 3, type: '服务器', owner: '190621-李娜', enabled: '0' },
];
 
 export const mockCompanyBelongingAuthData = [
   { id: 1, belonging: '焦点', company: '122_焦点直销', plate: '52_房产' },
 ];

// yewurules.js 页面 - Warehouse Info 表格数据
export const mockWarehouseInfoData = [
    { id: 1, code: 'I0001', desc: '资产库北京库(新媒体)', usage: 'IU0001_资产库标准', isVirtual: false, company: '114_新媒体', city: '35_北京市', admin: '114111-杨平', enabled: true },
  ];
// yewurules.js 页面 - Warehouse Usage 表格数据
export const mockWarehouseUsageData = [
    { id: 1, code: 'IU0007', desc: 'NO_Net-E库', category: '资产', mainCategory: 'NET EQUIPMENT', subCategory: '', enabled: true },
  ];
// yewurules.js 页面 - Warehouse Permission 表格数据
export const mockWarehousePermissionData = [
    { id: 1, warehouse: 'I2031_资产库北京库(焦点互动)...', operator: '219128-刘蓓', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
  ];
// yewurules.js 页面 - Location Basic Data 表格数据
export const mockLocationBasicDataData = [
    {
      id: '1', cityName: '北京市', enabled: true,
      children: [
        { id: '1-1', buildingName: '搜狐媒体大厦', enabled: true },
        { id: '1-2', buildingName: '搜狐网络大厦', enabled: true },
        { id: '1-3', buildingName: '搜狐畅游大厦', enabled: true },
      ]
    },
    {
      id: '2', cityName: '上海市', enabled: true,
      children: [
        { id: '2-1', buildingName: '搜狐上海大厦', enabled: true },
      ]
    },
    {
      id: '3', cityName: '深圳市', enabled: true,
      children: [
        { id: '3-1', buildingName: '搜狐深圳大厦', enabled: false },
      ]
    },
  ];
// yewurules.js 页面 - Receipt Rule Management 表格数据
export const mockReceiptRuleManagementData = [
    { id: 1, type: '员工信息', prefix: 'PAI', separator: '-', hasCompany: false, dateType: '年月日', serialType: '5位流水号' },
  ];
// yewurules.js 页面 - H R Company Finance Mapping 表格数据
export const mockHRCompanyFinanceMappingData = [
    { id: 1, hrCompany: 'FRA', hrCompanyDesc: '北京搜狐新时代信息技术有限公司', financeCompany: '101', financeCompanyDesc: '新时代', enabled: true },
  ];
// yewurules.js 页面 - Dept Cost Center Mapping 表格数据
export const mockDeptCostCenterMappingData = [
    { id: 1, hrDept: 'D0177', hrDeptDesc: '搜狐媒体_大沟通', costCenter: '111001', costCenterDesc: 'BD_大沟通', enabled: true },
  ];
// yewurules.js 页面 - Cost Center Plate Mapping 表格数据
export const mockCostCenterPlateMappingData = [
    { id: 1, costCenter: '181004', costCenterDesc: '搜狐-畅游品牌_节目制作部_内容运营', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false },
  ];
// yewurules.js 页面 - City Business Line Mapping 表格数据
export const mockCityBusinessLineMappingData = [
    { id: 1, city: '001', cityDesc: '美国', businessLine: '', businessLineDesc: '', enabled: false },
  ];
// yewurules.js 页面 - Dept Business Line Mapping 表格数据
export const mockDeptBusinessLineMappingData = [
    { id: 1, hrDept: 'D2307', hrDeptDesc: '焦点房地产资讯', businessLine: 'F601', businessLineDesc: '石家庄', enabled: true },
  ];
// yewurules.js 页面 - Asset Allocation Rule 表格数据
export const mockAssetAllocationRuleData = [
    { id: 1, name: '高配影像器材', desc: '方案3', subCat: '摄影摄像-镜头', level: '高端', qty: 3 },
  ];
// yewurules.js 页面 - Material Request Limit 表格数据
// 排除小类
export const mockExcludeSubCats = [
  { id: 1, code: '12302', desc: '主机-设计主机' },
  { id: 2, code: '12303', desc: '主机-测试主机' },
  { id: 3, code: '12304', desc: '笔记本-标准配置' },
];

export const mockMaterialRequestLimitData = [
    { name: '主机-设计主机', subCat: '12302_主机-设计主机', excludeSubCat: '12302_主机...', excludePerson: '' },
  ];
// yewurules.js 页面 - Asset Depreciation Rule 表格数据
export const mockAssetDepreciationRuleData = [
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反机身', originalValue: '5000.0', relation: '>=', years: '4年以上', valueType: '净值' },
  ];
// yewurules.js 页面 - Account Book Content 表格数据
export const mockAccountBookContentData = [
    { id: 1, company: '搜狐干线', plate: 'SAAS', name: '搜狐干线', cnName: '搜狐干线', enName: 'FOCUS XinGanXian' },
  ];
// yewurules.js 页面 - Expense Account Rule 表格数据
// 成本中心
export const mockCostCenters = [
  { id: 1, code: '112064', desc: '112064_新媒体成本中心' },
  { id: 2, code: '112065', desc: '112065_媒体成本中心' },
];

// 板块
export const mockPlates = [
  { id: 1, code: '17', desc: '17_Corporate' },
  { id: 2, code: '18', desc: '18_Media' },
];

// 科目
export const mockSubjects = [
  { id: 1, code: '909003', desc: '909003_费用科目' },
  { id: 2, code: '909004', desc: '909004_收入科目' },
];

// 子目
export const mockSubSubjects = [
  { id: 1, code: 'S001', desc: 'S001_子目A' },
];

// 业务线
export const mockLines = [
  { id: 1, code: 'L001', desc: 'L001_业务线A' },
];

// 项目
export const mockProjects = [
  { id: 1, code: 'P001', desc: 'P001_项目A' },
];

// 往来
export const mockTrans = [
  { id: 1, code: 'T001', desc: 'T001_往来A' },
];

// 备用
export const mockMisc = [
  { id: 1, code: 'M001', desc: 'M001_备用A' },
];

export const mockExpenseAccountRuleData = [
    { id: 1, inCat: '16.FURNITURE', inComp: '114_新媒体', inCost: '112064', outComp: '', outPlate: '17_Corporate', outCost: '909003', outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: true },
  ];
// yewurules.js 页面 - Cost Center Subject Mapping 表格数据
export const mockCostCenterSubjectMappingData = [
    { id: 1, costCenter: '168001.视频_分摊费用', cat: '11.PC', company: '115.新媒体-上海', subject: '72101.General and Administrative', enabled: true },
];
// yewurules.js 页面 - Material Sub Subject Mapping 表格数据
export const mockMaterialSubSubjectMappingData = [
    { id: 1, mainCat: '001.SERVER', subSubj: 'S001.S001_子目A', enabled: true },
 ];
// yewurules.js 页面 - N O Service Subject Mapping 表格数据
export const mockNOServiceSubjectMappingData = [
    { id: 1, service: 'NO001', plate: '17_Corporate.企业板块', costCenter: '168001.视频_分摊费用', subject: '72101.General and Administrative', enabled: true },
  ];
// yewurules.js 页面 - Employee Project Mapping 表格数据
export const mockEmployeeProjectMappingData = [
    { id: 21, empNo: '219177', empName: '黄涛', projName: 'A项目' },
  ];
