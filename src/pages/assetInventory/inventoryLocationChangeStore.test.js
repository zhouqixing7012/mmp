import { savePhotoReviewResult } from './inventoryPhotoReviewStore';
import { buildLocationDraft } from './inventoryLocationEdit';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import {
  createInventoryLocationChangeDemo,
  approveInventoryLocationChangeRequest,
  getInventoryLocationChanges,
  getInventoryLocationChangeRequest,
  getInventoryLocationChangeRequests,
  recordInventoryLocationChange,
  submitInventoryLocationChangeRequest as submitRequest,
} from './inventoryLocationChangeStore';

const sourceAssets = [{ assetTag: '114121801802', inventoryRange: '员工', needPhoto: true }, { assetTag: '114130000019', inventoryRange: '员工', needPhoto: false }, { assetTag: '114140000031', inventoryRange: '机房', needPhoto: true }];
const submitInventoryLocationChangeRequest = (args) => submitRequest({ projectAssets: sourceAssets, ...args });
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

beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); [projectNo, 'RCP-202608180001'].forEach((number) => savePhotoReviewResult(number, { assetTag, status: '已盘' })); });

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
      [first.id]: after,
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

test('PC位置变更演示复用待发起记录，提交给何文前不改台账', () => {
  const project = {projectNo:'RCP-202608180001', projectType:'复盘'};
  const oldFloor = getAssetMaintenanceRows().find(row=>row.tag===assetTag).floor;
  const change = createInventoryLocationChangeDemo(project);
  expect(createInventoryLocationChangeDemo(project).id).toBe(change.id);
  expect(change.after.floor).not.toBe(oldFloor);
  const request = submitInventoryLocationChangeRequest({...project, reason:'演示现场位置核对', applicant:'冯丽婷'});
  expect(request.approver).toBe('206984-何文');
  expect(request.status).toBe('待审批');
  expect(getAssetMaintenanceRows().find(row=>row.tag===assetTag).floor).toBe(oldFloor);
});

test('编辑备注与申请人部门随提交保存，数量取台账，审批前不更新台账备注', () => {
 const change=record();
 const original=getAssetMaintenanceRows().find(row=>row.tag===assetTag);
 const request=submitInventoryLocationChangeRequest({projectNo,projectType:'复盘',reason:'地点核对',applicant:'213852-孙志强',applicantDepartment:'集团 / 资产管理部 / 员工服务中心',draftRemarks:{[change.id]:'已上架'}});
 expect(request.applicantDepartment).toContain('员工服务中心');
 const saved=getInventoryLocationChanges(projectNo)[0];
 expect(saved.quantity).toBe(original.quantity);
 expect(saved.remark).toBe('已上架');
 expect(getAssetMaintenanceRows().find(row=>row.tag===assetTag).remarks).toBe(original.remarks);
});


test('添加资产草稿提交时使用编辑后的新地点，审批前不改台账，审批后更新',()=>{
 const asset=getAssetMaintenanceRows().find(row=>row.tag===assetTag);
 const draft=buildLocationDraft(asset);
 const request=submitInventoryLocationChangeRequest({projectNo,projectType:'复盘',reason:'新增明细核对',applicant:'冯丽婷',addedAssets:[draft],permittedAssetTags:[assetTag],draftLocations:{[draft.id]:after},draftRemarks:{[draft.id]:'新备注'}});
 const changes=getInventoryLocationChanges(projectNo);expect(changes).toHaveLength(1);expect(changes[0].after).toEqual(after);expect(changes[0].remark).toBe('新备注');expect(getAssetMaintenanceRows().find(row=>row.tag===assetTag).floor).toBe('9层');
 approveInventoryLocationChangeRequest(request.id,{approver:'206984-何文',decision:'同意'});expect(getAssetMaintenanceRows().find(row=>row.tag===assetTag).floor).toBe('8层');
});
test('添加资产越出项目范围或重复时整个提交不落库',()=>{
 const draft={...buildLocationDraft(getAssetMaintenanceRows().find(row=>row.tag===assetTag)),after};
 const args={projectNo,projectType:'复盘',reason:'新增核对',applicant:'冯丽婷',addedAssets:[draft],permittedAssetTags:[]};
 expect(()=>submitInventoryLocationChangeRequest(args)).toThrow('当前复盘项目范围');
 expect(()=>submitInventoryLocationChangeRequest({...args,addedAssets:[draft,draft],permittedAssetTags:[assetTag]})).toThrow('重复');expect(getInventoryLocationChanges(projectNo)).toHaveLength(0);expect(getInventoryLocationChangeRequests(projectNo)).toHaveLength(0);
});


test.each(['审核中', '未盘'])('需照片的拟变更可保存，但%s不能越过提交服务发起审批', (status) => {
  savePhotoReviewResult(projectNo, { assetTag, status });
  record();
  const beforeSubmit = getInventoryLocationChanges(projectNo);
  expect(() => submit()).toThrow('照片须审核通过');
  expect(getInventoryLocationChangeRequests(projectNo)).toHaveLength(0);
  expect(getInventoryLocationChanges(projectNo)).toEqual(beforeSubmit);
  savePhotoReviewResult(projectNo, { assetTag, status: '已盘' });
  expect(submit().status).toBe('待审批');
});

test('别的项目审核通过不能放行本项目；手工添加未审核资产整批拒绝', () => {
  window.localStorage.clear(); window.sessionStorage.clear();
  savePhotoReviewResult('other-project', { assetTag, status: '已盘' });
  const draft = { ...buildLocationDraft(getAssetMaintenanceRows().find((asset) => asset.tag === assetTag)), after };
  expect(() => submitInventoryLocationChangeRequest({ projectNo, projectType: '复盘', reason: '手工准备', applicant: '冯丽婷', addedAssets: [draft], permittedAssetTags: [assetTag] })).toThrow('照片须审核通过');
  expect(getInventoryLocationChangeRequests(projectNo)).toHaveLength(0);
  expect(getInventoryLocationChanges(projectNo)).toHaveLength(0);
});

test('照片未就绪的移动拟变更保留待发起，其余就绪变更可发起且机房免照片审核', () => {
  savePhotoReviewResult(projectNo, { assetTag, status: '审核中' });
  record();
  const second = recordInventoryLocationChange({ projectNo, projectType: '复盘', assetTag: '114130000019', before, after, operator: '冯丽婷' });
  const request = submit();
  expect(request.changeIds).toEqual([second.id]);
  expect(getInventoryLocationChanges(projectNo).find((item) => item.assetTag === assetTag).status).toBe('待发起');
  const machine = getAssetMaintenanceRows().find((asset) => asset.tag === '114140000031');
  const machineDraft = buildLocationDraft(machine);
  const machineAfter = { ...machineDraft.before, floor: '8层' };
  expect(submitInventoryLocationChangeRequest({ projectNo, projectType: '复盘', reason: '机房现场核对', applicant: '冯丽婷', addedAssets: [machineDraft], permittedAssetTags: [machine.tag], draftLocations: { [machineDraft.id]: machineAfter } }).status).toBe('待审批');
});


test('绕过页面直接发起时仍必须提供本项目照片规则，不能因缺数据免审', () => {
  record();
  expect(() => submitRequest({ projectNo, projectType: '复盘', reason: '直接调用', applicant: '冯丽婷' })).toThrow('当前复盘项目资产范围');
  expect(getInventoryLocationChangeRequests(projectNo)).toHaveLength(0);
  expect(getInventoryLocationChanges(projectNo)[0].status).toBe('待发起');
});
