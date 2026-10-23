import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { recordInventoryLocationChange, getInventoryLocationChanges, getInventoryLocationChangeRequests, getInventoryLocationChangePool, submitInventoryLocationChangeRequest, approveInventoryLocationChangeRequest, ensureInventoryLocationPoolCloseNotification, getInventoryLocationPoolCloseNotifications } from './inventoryLocationChangeStore';
const project = { projectNo: 'R-POOL', projectType: '复盘', projectName: '复盘位置池', status: '盘点关闭' };
const before = { city: '北京市', building: '搜狐媒体大厦', floor: '9层' };
const after = { ...before, floor: '8层' };
const assetTag = '114121801802';
const record = target => recordInventoryLocationChange({ projectNo: project.projectNo, projectType: '复盘', assetTag, before, after: target || after, operator: '冯丽婷' });
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

test('移动位置建议进入池，同资产更新保留初始地点，台账不随建议变化', () => {
 const first = record();
 expect(first.status).toBe('待变更');
 const second = record({ ...after, floor: '7层' });
 expect(second.id).toBe(first.id);
 expect(getInventoryLocationChangePool(project.projectNo)).toHaveLength(1);
 expect(second.before).toEqual(before);
 expect(second.after.floor).toBe('7层');
 expect(getAssetMaintenanceRows().find(asset => asset.tag === assetTag).floor).toBe('9层');
 expect(() => submitInventoryLocationChangeRequest({})).toThrow('审批流程已取消');
 expect(() => approveInventoryLocationChangeRequest('old', {})).toThrow('审批流程已取消');
});

test('历史申请与记录原样保留，旧未处理建议在池可见，已通过不再次待变更', () => {
 const old = { changes: [
  { id: 'old', projectNo: project.projectNo, assetTag: 'A', status: '待审批', before, after },
  { id: 'done', projectNo: project.projectNo, assetTag: 'B', status: '已通过', before, after },
 ], requests: [{ id: 'request', projectNo: project.projectNo, status: '待审批', changeIds: ['old'] }] };
 localStorage.setItem('asset-inventory-location-changes-v1', JSON.stringify(old));
 expect(getInventoryLocationChangePool(project.projectNo)).toEqual([expect.objectContaining({ id: 'old', historicalStatus: '待审批', status: '待变更' })]);
 expect(getInventoryLocationChanges(project.projectNo)).toEqual(old.changes);
 expect(getInventoryLocationChangeRequests(project.projectNo)).toEqual(old.requests);
});

test('关闭有待变更资产时生成一次ES服务号待发送通知，刷新重试不重复', () => {
 record();
 const first = ensureInventoryLocationPoolCloseNotification(project);
 expect(first).toMatchObject({ recipient: '213852-孙志强', employeeNo: '213852', channel: '服务号', status: '待发送', assetTags: [assetTag] });
 expect(ensureInventoryLocationPoolCloseNotification(project)).toEqual(first);
 expect(getInventoryLocationPoolCloseNotifications(project.projectNo)).toHaveLength(1);
 expect(getInventoryLocationChanges(project.projectNo)).toHaveLength(1);
});

test('无池记录不生成通知，未关闭拒绝；写入失败明确抛错，重试可恢复', () => {
 expect(ensureInventoryLocationPoolCloseNotification(project)).toBeNull();
 expect(() => ensureInventoryLocationPoolCloseNotification({ ...project, status: '盘点中' })).toThrow('关闭后');
 record();
 const original = Storage.prototype.setItem;
 const mock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function(key, value) {
  if (key === 'asset-inventory-location-changes-v1' && JSON.parse(value).notifications?.length) throw new Error('空间不足');
  return original.call(this, key, value);
 });
 expect(() => ensureInventoryLocationPoolCloseNotification(project)).toThrow('空间不足');
 mock.mockRestore();
 expect(getInventoryLocationPoolCloseNotifications(project.projectNo)).toHaveLength(0);
 expect(ensureInventoryLocationPoolCloseNotification(project)).toBeTruthy();
});
