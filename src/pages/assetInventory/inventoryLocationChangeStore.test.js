import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import {
  approveInventoryLocationChangeRequest,
  getInventoryLocationChanges,
  getInventoryLocationChangeRequest,
  getInventoryLocationChangeRequests,
  recordInventoryLocationChange,
  submitInventoryLocationChangeRequest,
} from './inventoryLocationChangeStore';

const assetTag = '114121801802';
const projectNo = 'RCP-202609300001';
const before = { city: '北京市', building: '搜狐媒体大厦', floor: '9层' };
const after = { city: '北京市', building: '搜狐媒体大厦', floor: '8层' };
const changedAgain = { city: '北京市', building: '搜狐媒体大厦', floor: '7层' };
const record = (newPlace = after, oldPlace = before) => recordInventoryLocationChange({
  projectNo, projectType: '复盘', assetTag, planNo: '', before: oldPlace, after: newPlace, operator: '201132000160-孙志强',
});
const submit = () => submitInventoryLocationChangeRequest({
  projectNo, projectType: '复盘', reason: '复盘现场核对位置变化', applicant: '201132000160-孙志强',
});

beforeEach(() => window.localStorage.clear());

test('审批前台账不变，何文审批后更新台账和位置变更事务且不能重复审批', () => {
  record();
  const request = submit();
  expect(getAssetMaintenanceRows().find((row) => row.tag === assetTag).floor).toBe('9层');
  expect(() => approveInventoryLocationChangeRequest(request.id, { approver: '123-别人', decision: '同意' })).toThrow('仅何文');
  approveInventoryLocationChangeRequest(request.id, { approver: '206984-何文', decision: '同意' });
  const asset = getAssetMaintenanceRows().find((row) => row.tag === assetTag);
  expect(asset.floor).toBe('8层');
  expect(asset.transactionHistory.filter((entry) => entry.operationType === '位置变更' && entry.documentNo === request.id)).toHaveLength(1);
  expect(() => approveInventoryLocationChangeRequest(request.id, { approver: '206984-何文', decision: '同意' })).toThrow('不能重复审批');
});

test('同资产再次待发起只更新目标位置并保留初始台账位置', () => {
  const first = record();
  const second = record(changedAgain);
  expect(second.id).toBe(first.id);
  expect(getInventoryLocationChanges(projectNo)).toHaveLength(1);
  expect(second.before).toEqual(before);
  expect(second.after).toEqual(changedAgain);
  expect(getAssetMaintenanceRows().find((row) => row.tag === assetTag).floor).toBe('9层');
});

test('多资产申请中第二条地点不完整时不修改任何待发起记录', () => {
  const first = record();
  const second = recordInventoryLocationChange({
    projectNo, projectType: '复盘', assetTag: '114130000019', planNo: '',
    before, after, operator: '201132000160-孙志强',
  });
  const originalChanges = getInventoryLocationChanges(projectNo);
  expect(() => submitInventoryLocationChangeRequest({
    projectNo, projectType: '复盘', reason: '核对位置', applicant: '冯丽婷',
    draftLocations: {
      [first.id]: changedAgain,
      [second.id]: { city: '北京市', building: '搜狐媒体大厦', floor: '' },
    },
  })).toThrow('新位置不完整');
  expect(getInventoryLocationChanges(projectNo)).toEqual(originalChanges);
  expect(getInventoryLocationChangeRequests(projectNo)).toHaveLength(0);
});

test('台账位置变动时审批失败，申请仍待审批且未写位置变更事务', () => {
  record();
  const request = submit();
  const storageKey = 'asset-management-maintenance-v4';
  const rows = getAssetMaintenanceRows().map((row) => row.tag === assetTag ? { ...row, floor: '6层' } : row);
  window.localStorage.setItem(storageKey, JSON.stringify(rows));
  expect(() => approveInventoryLocationChangeRequest(request.id, { approver: '206984-何文', decision: '同意' })).toThrow('台账位置已变化');
  expect(getInventoryLocationChangeRequest(request.id).status).toBe('待审批');
  expect(getAssetMaintenanceRows().find((row) => row.tag === assetTag).transactionHistory.filter((entry) => entry.operationType === '位置变更')).toHaveLength(0);
});

test('申请状态写入失败后重试审批不重复记台账事务', () => {
  record();
  const request = submit();
  const original = Storage.prototype.setItem;
  let blocked = false;
  const setter = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
    if (key === 'asset-inventory-location-changes-v1'
      && JSON.parse(value).requests.find((item) => item.id === request.id)?.status === '已通过'
      && !blocked) {
      blocked = true;
      throw new Error('模拟申请状态写入失败');
    }
    return original.call(this, key, value);
  });
  try {
    expect(() => approveInventoryLocationChangeRequest(request.id, { approver: '206984-何文', decision: '同意' })).toThrow('模拟申请状态写入失败');
  } finally {
    setter.mockRestore();
  }
  expect(blocked).toBe(true);
  expect(getInventoryLocationChangeRequest(request.id).status).toBe('待审批');
  expect(getAssetMaintenanceRows().find((row) => row.tag === assetTag).floor).toBe('8层');
  approveInventoryLocationChangeRequest(request.id, { approver: '206984-何文', decision: '同意' });
  const asset = getAssetMaintenanceRows().find((row) => row.tag === assetTag);
  expect(asset.transactionHistory.filter((entry) => entry.operationType === '位置变更' && entry.documentNo === request.id)).toHaveLength(1);
});
