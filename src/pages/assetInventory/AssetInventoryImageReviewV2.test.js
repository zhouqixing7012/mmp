import { saveMobileInventoryResult } from './inventoryMobileResultStore';
import { inventoryProjectCloseBlockReason } from './inventoryCloseRules';
import { saveInventoryPhotoSnapshot } from './inventoryPhotoRules';
jest.mock('antd', () => ({}));
import { buildReviewRows, sortInventoryReviewRows, saveInventoryPhotoReviewDecisions } from './AssetInventoryImageReviewV2';
import { savePhotoReviewResult } from './inventoryPhotoReviewStore';

beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); });

test('公共与库房待审核保持真实范围，机房不纳入人工审核', () => {
  ['公共', '库房', '机房'].forEach(range => savePhotoReviewResult('P1', {
    assetTag: 'TEST-' + range, inventoryRange: range, status: '审核中', owner: '责任人', description: '资产',
  }));
  const rows = buildReviewRows('P1', ['公共', '库房', '机房']);
  expect(rows.filter(row => row.asset.assetTag.startsWith('TEST-')).map(row => row.asset.inventoryRange)).toEqual(['公共', '库房']);
  expect(rows.some(row => row.asset.inventoryRange === '机房')).toBe(false);
  expect(buildReviewRows('P1', ['员工']).some(row => row.asset.assetTag.startsWith('TEST-'))).toBe(false);
});

test('审核记录缺少范围且标签未在PC清单中时不猜员工范围', () => {
  savePhotoReviewResult('P1', { assetTag: 'UNKNOWN', status: '审核中' });
  expect(buildReviewRows('P1', ['员工']).some(row => row.asset.assetTag === 'UNKNOWN')).toBe(false);
});

test('审核完成后再次进入仍显示结论，不重新变成待审核', () => {
  savePhotoReviewResult('P1', { assetTag: 'TEST-public', inventoryRange: '公共', status: '已盘' });
  const row = buildReviewRows('P1', ['公共']).find(row => row.asset.assetTag === 'TEST-public');
  expect(row.reviewStatus).toBe('审核通过');
  expect(row.asset.inventoryStatus).toBe('已盘');
});

test('快照项目不混入预置审核记录，非必传与范围外记录不进入审核', () => {
  saveInventoryPhotoSnapshot({ projectNo: 'PHOTO-REVIEW', photoConfig: { enabled: true, rules: [] } }, [
    { key: 'need', assetTag: 'NEED', inventoryRange: '公共', needPhoto: true },
    { key: 'optional', assetTag: 'OPTIONAL', inventoryRange: '公共', needPhoto: false },
  ]);
  ['NEED', 'OPTIONAL', 'OUTSIDE'].forEach(assetTag => savePhotoReviewResult('PHOTO-REVIEW', { assetTag, inventoryRange: '公共', status: '审核中' }));
  expect(buildReviewRows('PHOTO-REVIEW', ['公共']).map(row => row.asset.assetTag)).toEqual(['NEED']);
});


test('审核状态排序在结论变化后仍为待审核、不通过、通过',()=>{
  const rows=[{key:'pass',reviewStatus:'审核通过'},{key:'todo',reviewStatus:'待审核'},{key:'fail',reviewStatus:'审核不通过'}];
  expect(sortInventoryReviewRows(rows).map(row=>row.key)).toEqual(['todo','fail','pass']);
  const changed=rows.map(row=>row.key==='todo'?{...row,reviewStatus:'审核通过'}:row);
  expect(sortInventoryReviewRows(changed)[0].key).toBe('fail');
  expect(rows[1].reviewStatus).toBe('待审核');
});

test('审核结论保存不丢失同次提交的实际照片、盘点人和备注',()=>{
  const photos={overall:{key:'overall',label:'资产整体照片',src:'data:image/png;base64,cGhvdG8='},gallery:[]};
  savePhotoReviewResult('CAPTURE',{assetTag:'TAG',inventoryRange:'员工',status:'审核中',photos,counter:'盘点人',inventoryNote:'本次备注'});
  savePhotoReviewResult('CAPTURE',{assetTag:'TAG',status:'已盘'});
  const row=buildReviewRows('CAPTURE',['员工']).find(item=>item.asset.assetTag==='TAG');
  expect(row.photos.overall.src).toBe(photos.overall.src);expect(row.asset.counter).toBe('盘点人');expect(row.asset.inventoryNote).toBe('本次备注');
  expect(row.reviewStatus).toBe('审核通过');
});


test('扫码枪已盘后旧照片待审核不再进入当前审批或关闭拦截，原审核记录保留', () => {
  saveInventoryPhotoSnapshot({ projectNo: 'GUN' }, [{ key: 'a', assetTag: 'A', inventoryRange: '员工', needPhoto: true }]);
  savePhotoReviewResult('GUN', { assetTag: 'A', inventoryRange: '员工', status: '审核中', photos: { overall: { key: 'old' } } });
  expect(buildReviewRows('GUN', ['员工'])).toHaveLength(1);
  saveMobileInventoryResult('GUN', 'A', { status: '代盘', resultSource: '扫码枪' });
  const photoRows = buildReviewRows('GUN', ['员工']);
  expect(photoRows).toHaveLength(0);
  expect(inventoryProjectCloseBlockReason({ projectNo: 'GUN', projectType: '初盘' }, { plans: [{ status: '盘点中' }], photoRows })).toBe('');
  expect(require('./inventoryPhotoReviewStore').getPhotoReviewResults('GUN')[0].photos.overall.key).toBe('old');
});

test('旧照片审核页保存前重新检查项目审批锁，不覆盖已锁定结果', () => {
  const project = { projectNo: 'LOCKED-AUDIT', status: '审核中' };
  savePhotoReviewResult(project.projectNo, { assetTag: 'A', inventoryRange: '员工', status: '审核中' });
  expect(() => saveInventoryPhotoReviewDecisions(project, [{ decision: 'pass', asset: { assetTag: 'A', inventoryRange: '员工' } }])).toThrow('不能修改');
  expect(buildReviewRows(project.projectNo, ['员工']).find(row => row.asset.assetTag === 'A').reviewStatus).toBe('待审核');
});
