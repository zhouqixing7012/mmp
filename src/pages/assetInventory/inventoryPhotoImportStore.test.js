import { getImportedInventoryPhotos, importInventoryPhotoFiles, inventoryPhotoUploadBlockReason } from './inventoryPhotoImportStore';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';
const project = { projectNo: 'ROOM-PHOTO', status: '盘点中', creator: '100-创建人' };
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
  const result = importInventoryPhotoFiles({ projectNo: project.projectNo, project, operator: '100-创建人', plans: [{ planNo: 'P1', status: '盘点中' }], assets: [asset], files: [new File(['photo'], 'ROOM001_整体.png', { type: 'image/png' })] });
  expect(result.matched).toHaveLength(1);
  expect(getMobileInventoryResults(project.projectNo)).toEqual(before);
  expect(asset.inventoryStatus).toBe('未盘');
});
test('未匹配先反馈标签错误，不保存照片或盘点结果', () => {
  const no = 'UNMATCHED-PHOTO';
  const result = importInventoryPhotoFiles({ projectNo: no, project: { ...project, projectNo: no }, operator: '100-创建人', assets: [asset], files: [new File(['photo'], 'unknown.png', { type: 'image/png' })] });
  expect(result.unmatched).toHaveLength(1);
  expect(getImportedInventoryPhotos(no)).toEqual([]);
  expect(getMobileInventoryResults(no)).toEqual({});
});
test('审核中或已通过的计划在照片保存入口锁定', () => {
  for (const status of ['审核中', '已审核']) {
    expect(() => importInventoryPhotoFiles({ projectNo: 'LOCKED-PHOTO', project: { ...project, projectNo: 'LOCKED-PHOTO' }, operator: '100-创建人', plans: [{ planNo: 'P1', status }], assets: [asset], files: [new File(['photo'], 'ROOM001.png', { type: 'image/png' })] })).toThrow('不能修改');
  }
  expect(getImportedInventoryPhotos('LOCKED-PHOTO')).toEqual([]);
});


test('机房项目创建人或已配置的机房计划执行人可上传，监督人及未知身份不可上传', () => {
  const context = { project, assets: [{ ...asset, executor: '200-执行人', supervisor: '300-监督人' }], plans: [{ planNo: 'P1', status: '盘点中' }] };
  expect(inventoryPhotoUploadBlockReason({ ...context, operator: '100-创建人' })).toBe('');
  expect(inventoryPhotoUploadBlockReason({ ...context, operator: '200-执行人' })).toBe('');
  expect(inventoryPhotoUploadBlockReason({ ...context, operator: '300-监督人' })).toContain('仅项目创建人');
  expect(inventoryPhotoUploadBlockReason({ ...context, operator: '999-执行人' })).toContain('仅项目创建人');
  expect(inventoryPhotoUploadBlockReason({ ...context, operator: '执行人' })).toContain('员工编号');
  expect(inventoryPhotoUploadBlockReason({ ...context, plans: [], operator: '200-执行人' })).toContain('仅项目创建人');
  expect(inventoryPhotoUploadBlockReason({ ...context, project: { ...project, scopeRanges: ['员工'] }, operator: '100-创建人' })).toContain('机房项目范围');
});

test('计划执行人可上传同一机房项目中其他计划资产的照片，不因非本人资产拒绝', () => {
  const own = { ...asset, key: 'owner', assetTag: 'OWN-1', executor: '200-执行人', planNo: 'P1' };
  const other = { ...asset, key: 'other', assetTag: 'OTHER-1', executor: '400-另一执行人', planNo: 'P2' };
  const result = importInventoryPhotoFiles({ projectNo: 'EXEC-PHOTO', project: { ...project, projectNo: 'EXEC-PHOTO' }, operator: '200-执行人', plans: [{ planNo: 'P1', status: '盘点中' }, { planNo: 'P2', status: '盘点中' }], assets: [own, other], files: [new File(['photo'], 'OTHER-1.jpg', { type: 'image/jpeg' })] });
  expect(result.matched.map(row => row.assetTag)).toEqual(['OTHER-1']);
});

test('照片上传按JPG、JPEG、PNG格式校验，未授权人员或关闭项目不得保存', () => {
  const no = 'FORMAT-PHOTO';
  const matched = ['jpg', 'jpeg', 'png'].map((ext, index) => ({ ...asset, key: `f${index}`, assetTag: `FORMAT-${index}` }));
  const files = matched.map((item, index) => new File(['photo'], `${item.assetTag}.${['jpg','jpeg','png'][index]}`, { type: index === 2 ? 'image/png' : 'image/jpeg' }));
  files.push(new File(['photo'], 'FORMAT-0.webp', { type: 'image/webp' }));
  const context = { projectNo: no, project: { ...project, projectNo: no }, operator: '100-创建人', assets: matched, files };
  const result = importInventoryPhotoFiles(context);
  expect(result.matched).toHaveLength(3);
  expect(result.invalid).toEqual(['FORMAT-0.webp']);
  expect(() => importInventoryPhotoFiles({ ...context, operator: '999-其他人' })).toThrow('仅项目创建人');
  expect(() => importInventoryPhotoFiles({ ...context, project: { ...context.project, status: '盘点关闭' } })).toThrow('已关闭');
});


test('同资产同类型已有照片或同批重复时不静默覆盖，整批不保存并说明替换待确认', () => {
  const no = 'REPLACE-PHOTO';
  const context = { projectNo: no, project: { ...project, projectNo: no }, operator: '100-创建人', assets: [asset] };
  const first = new File(['first'], 'ROOM001.png', { type: 'image/png' });
  importInventoryPhotoFiles({ ...context, files: [first] });
  const before = getImportedInventoryPhotos(no);
  expect(() => importInventoryPhotoFiles({ ...context, files: [new File(['second'], 'ROOM001.jpg', { type: 'image/jpeg' })] })).toThrow('照片替换规则待确认');
  expect(getImportedInventoryPhotos(no)).toEqual(before);
  const batchContext = { ...context, projectNo: 'DUPLICATE-PHOTO', project: { ...project, projectNo: 'DUPLICATE-PHOTO' } };
  expect(() => importInventoryPhotoFiles({ ...batchContext, files: [first, first] })).toThrow('照片替换规则待确认');
  expect(getImportedInventoryPhotos(batchContext.projectNo)).toEqual([]);
});
