import { getImportedInventoryPhotos, importInventoryPhotoFiles } from './inventoryPhotoImportStore';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';
const project = { projectNo: 'ROOM-PHOTO', status: '盘点中' };
const asset = { key: 'a', assetTag: 'ROOM001', planNo: 'P1', inventoryRange: '机房', inventoryStatus: '未盘', quantity: 10 };
let create, revoke;
beforeEach(() => {
  window.localStorage.clear(); window.sessionStorage.clear();
  create = URL.createObjectURL; revoke = URL.revokeObjectURL;
  URL.createObjectURL = jest.fn(() => 'blob:test'); URL.revokeObjectURL = jest.fn();
});
afterEach(() => { URL.createObjectURL = create; URL.revokeObjectURL = revoke; });
test('机房照片上传只保存匹配照片，不提交或改变当前盘点结果', () => {
  saveMobileInventoryResult(project.projectNo, asset.assetTag, { status: '未盘', inventoryRemark: '原备注' });
  const before = getMobileInventoryResults(project.projectNo);
  const result = importInventoryPhotoFiles({ projectNo: project.projectNo, project, plans: [{ planNo: 'P1', status: '盘点中' }], assets: [asset], files: [new File(['photo'], 'ROOM001_整体.png', { type: 'image/png' })] });
  expect(result.matched).toHaveLength(1);
  expect(getMobileInventoryResults(project.projectNo)).toEqual(before);
  expect(asset.inventoryStatus).toBe('未盘');
});
test('未匹配先反馈标签错误，不保存照片或盘点结果', () => {
  const no = 'UNMATCHED-PHOTO';
  const result = importInventoryPhotoFiles({ projectNo: no, project: { ...project, projectNo: no }, assets: [asset], files: [new File(['photo'], 'unknown.png', { type: 'image/png' })] });
  expect(result.unmatched).toHaveLength(1);
  expect(getImportedInventoryPhotos(no)).toEqual([]);
  expect(getMobileInventoryResults(no)).toEqual({});
});
test('审核中或已通过的计划在照片保存入口锁定', () => {
  for (const status of ['审核中', '已审核']) {
    expect(() => importInventoryPhotoFiles({ projectNo: 'LOCKED-PHOTO', project: { ...project, projectNo: 'LOCKED-PHOTO' }, plans: [{ planNo: 'P1', status }], assets: [asset], files: [new File(['photo'], 'ROOM001.png', { type: 'image/png' })] })).toThrow('不能修改');
  }
  expect(getImportedInventoryPhotos('LOCKED-PHOTO')).toEqual([]);
});
