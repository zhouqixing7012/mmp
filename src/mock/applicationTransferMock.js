import { materialCatalog } from './reference/materialCatalog';
import { warehouseCatalog } from './reference/warehouseCatalog';

const copy = value => JSON.parse(JSON.stringify(value));
const warehouse = warehouseCatalog.find(row => row.warehouseCode === 'I0001');
// 人员关联、资产卡片及单据均为本模块显式演示数据；物料和仓库固定属性来自参考目录整行。
const people = [
  { id: '114111', name: '杨芊', department: 'D0001.集团总部', plate: '17.Corporate', costCenter: '909003.集团总部', businessLine: 'E2104.集团', project: '0.*', city: warehouse.city, building: warehouse.building, floor: warehouse.floor },
  { id: 'sunzhq', name: '孙志强', department: 'D0001.集团总部', plate: '17.Corporate', costCenter: '909003.集团总部', businessLine: 'E2104.集团', project: '0.*', city: warehouse.city, building: warehouse.building, floor: warehouse.floor },
  { id: 'hewen', name: '何文', department: 'D0002.财务中心', plate: '17.Corporate', costCenter: '909004.财务中心', businessLine: 'E2104.集团', project: '0.*', city: warehouse.city, building: warehouse.building, floor: warehouse.floor },
];
const assets = materialCatalog.filter(row => row.status === '启用' && row.materialType === '资产').map((material, index) => ({
  id: 'transfer-asset-' + index, tag: '0000' + (810001 + index), serial: 'TR-SN-' + (810001 + index), material,
  company: warehouse.company, quantity: 1, statusCode: '3', status: '在用-使用中', lock: '',
  owner: people[0].id, department: people[0].department, plate: people[0].plate, costCenter: people[0].costCenter,
  city: warehouse.city, building: warehouse.building, floor: warehouse.floor, room: '', purpose: '员工用机',
  book: 'FA_BOOK_SOHU', feeAccount: '114.17.909003.72101.E2104.0.0.0.0', noLocation: '', service: '', subService: '',
}));
const createDetail = asset => ({
  id: 'transfer-detail-' + asset.id, kind: 'material', assetId: asset.id, tag: asset.tag, serial: asset.serial, material: asset.material,
  company: asset.company, quantity: asset.quantity, original: copy(asset), recipient: people[1].id,
  department: people[1].department, plate: people[1].plate, costCenter: people[1].costCenter,
  city: people[1].city, building: people[1].building, floor: people[1].floor, room: '', purpose: '员工用机',
  businessLine: people[1].businessLine, project: people[1].project, transferDate: '2026-10-15', reason: '', usageDescription: '',
  newSerial: '', newNoLocation: '', newService: '', newSubService: '',
});
const draft = { id: 'transfer-order-1', number: 'ZY202610150001', applicationNo: 'ZYSQ202610140001', company: warehouse.company, creator: 'sunzhq', createdAt: '2026-10-15 09:00:00', status: '草稿', migrationValid: 'Y', type: 'ASSETS_TRANSFER_ORDER', remarks: '办公设备转移', details: [createDetail(assets[0])], revision: 1 };
assets[0].lock = draft.id;
const complete = { ...copy(draft), id: 'transfer-order-2', number: 'ZY202610140002', applicationNo: 'ZYSQ202610130002', status: '已完成', createdAt: '2026-10-14 15:00:00', details: [createDetail(assets[1])] };
Object.assign(assets[1], { owner: complete.details[0].recipient, department: complete.details[0].department, costCenter: complete.details[0].costCenter });
const initial = { orders: [draft, complete], assets, transactions: [], nextNumber: 3 };
// 以下仅为这三名演示人员的明确结果样例，不代表正式费用账户生成规则。
const explicitFinanceExamples = [
  { recipient: '114111', company: warehouse.company, plate: '17.Corporate', costCenter: '909003.集团总部', businessLine: 'E2104.集团', project: '0.*', feeAccount: '114.17.909003.72101.E2104.0.0.0.0' },
  { recipient: 'sunzhq', company: warehouse.company, plate: '17.Corporate', costCenter: '909003.集团总部', businessLine: 'E2104.集团', project: '0.*', feeAccount: '114.17.909003.72101.E2104.0.0.0.0' },
  { recipient: 'hewen', company: warehouse.company, plate: '17.Corporate', costCenter: '909004.财务中心', businessLine: 'E2104.集团', project: '0.*', feeAccount: '114.17.909004.72101.E2104.0.0.0.0' },
];
const storageKey = 'mmp-application-transfer-v1';
let memory = copy(initial);
export const applicationTransferStore = {
  references: { explicitFinanceExamples, people, materials: materialCatalog, warehouses: warehouseCatalog, currentUser: { id: 'sunzhq', name: '孙志强', company: warehouse.company }, plateBooks: { '17.Corporate': 'FA_BOOK_SOHU' }, purposes: ['员工用机', '专业用途', '其他用途'] },
  read() {
    const saved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    return saved ? JSON.parse(saved) : copy(memory);
  },
  write(value) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(storageKey, JSON.stringify(value));
    memory = copy(value);
  },
};
