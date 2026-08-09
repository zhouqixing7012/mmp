export { CURRENT_EMPLOYEE } from './employeeSelfServiceMock';

export const EMPLOYEE_SELF_SERVICE_CLAIM_STORAGE_KEY = 'mmp_demo_employee_self_service_claims';
export const EMPLOYEE_SELF_SERVICE_OUTBOUND_STORAGE_KEY = 'mmp_demo_employee_self_service_outbounds';

export const DEFAULT_EMPLOYEE_SELF_SERVICE_CLAIMS = [];
export const DEFAULT_EMPLOYEE_SELF_SERVICE_OUTBOUNDS = [];

export const DEFAULT_CLAIM_LOCATION = {
  city: '35.北京市',
  building: '129753.搜狐媒体大厦',
  floor: '8层',
};

export const WAREHOUSE_OPTIONS = [
  'I0018-资产集团前台库（新动力）',
  'I0020-集团备件库',
];

export const WAREHOUSE_KEEPERS = {
  'I0018-资产集团前台库（新动力）': ['200620-王英', '119039-刘建'],
  'I0020-集团备件库': ['114111-杨芊', '119039-刘建'],
};

export const INVENTORY_STATUS_OPTIONS = ['未盘', '已盘', '代盘', '报失'];

export const ASSET_CUSTODY_NOTICE = '领用人确认已收到上述资产及相关配件，认同公司资产仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。领用人应承担妥善保管资产的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应的赔偿责任。应公司需要，领用人应当配合及时调换或归还领用资产。如领用人延迟甚至拒绝交还公司资产，公司保留采取进一步手段的权利，包括但不限于留置领用人工资、奖金或者其他个人资产。';
