import { applyPhotoReviewToInventoryAsset, canReportInventoryLoss } from './inventoryLossRules';

describe('照片驳回后的报失', () => {
  test('初次未盘可以报失', () => {
    expect(canReportInventoryLoss({ status: '未盘', lossReported: false })).toBe(true);
  });
  test('曾报失但没有照片驳回时不能重复报失', () => {
    expect(canReportInventoryLoss({ status: '未盘', lossReported: true })).toBe(false);
  });
  test('曾报失资产重盘后照片驳回，可以再次报失', () => {
    const asset = applyPhotoReviewToInventoryAsset({ status: '审核中', lossReported: true }, { status: '未盘' });
    expect(asset.lossReported).toBe(true);
    expect(canReportInventoryLoss(asset, { status: '未盘' })).toBe(true);
  });
  test('再次报失后旧驳回记录不能造成重复报失', () => {
    expect(canReportInventoryLoss({ status: '报失', lossReported: true }, { status: '未盘' })).toBe(false);
  });
  test('再次报失刷新后保留报失状态与已报失标记', () => {
    expect(applyPhotoReviewToInventoryAsset({ status: '报失', lossReported: true }, { status: '未盘' }))
      .toEqual({ status: '报失', lossReported: true });
  });
  test.each(['已盘', '代盘', '审核中', '未执行盘点'])('%s不能报失', (status) => {
    expect(canReportInventoryLoss({ status, lossReported: true }, { status: '未盘' })).toBe(false);
  });
  test('审核通过不能恢复再次报失资格', () => {
    const asset = applyPhotoReviewToInventoryAsset({ status: '审核中', lossReported: true }, { status: '已盘' });
    expect(canReportInventoryLoss(asset, { status: '已盘' })).toBe(false);
  });
  test('没有资产时不能报失', () => {
    expect(canReportInventoryLoss(null, { status: '未盘' })).toBe(false);
  });
});
