import { saveInventoryPhotoSnapshot } from './inventoryPhotoRules';
jest.mock('antd', () => ({}));
import { buildReviewRows, sortInventoryReviewRows } from './AssetInventoryImageReviewV2';
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
