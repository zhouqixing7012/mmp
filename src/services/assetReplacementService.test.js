jest.mock('./demoStorage', () => ({ readDemoData: jest.fn(), writeDemoData: jest.fn() }));

import { readDemoData, writeDemoData } from './demoStorage';
import {
  confirmReplacementByEmployee, endReplacementApplication, executeReplacementInbound,
  executeReplacementOutbound, getAssetReplacementApplications, requestReplacementConfirmation,
  saveAssetReplacementApplications,
} from './assetReplacementService';

const application = () => ({
  id: 'replacement-order-test', status: '处理中', currentNode: '旧资产退回',
  applicant: { id: 'DEMO', name: '测试员工' }, history: [], newAsset: { assetTag: 'NEW-ASSET' },
  returnProcess: { inboundStatus: '未入库', inboundOrderNo: '' },
  issueProcess: { confirmStatus: '未发起', outboundStatus: '未出库', outboundOrderNo: '' },
});
beforeEach(() => {
  let records = [];
  readDemoData.mockImplementation(() => JSON.parse(JSON.stringify(records)));
  writeDemoData.mockImplementation((key, value) => { records = JSON.parse(JSON.stringify(value)); return value; });
  saveAssetReplacementApplications([application()]);
  writeDemoData.mockClear();
});

test.each([
  ['发起新资产确认', id => requestReplacementConfirmation(id, '新资产领取', '狐小e扫码确认')],
  ['员工确认新资产', id => confirmReplacementByEmployee(id, '新资产领取', '刷卡确认')],
  ['执行新资产出库', id => executeReplacementOutbound(id, { newAsset: { assetTag: 'NEW-ASSET' } })],
])('旧资产未入库时阻止%s，不保存部分结果', (_, action) => {
  const before = getAssetReplacementApplications();
  expect(() => action(before[0].id)).toThrow('请先完成旧资产入库');
  expect(writeDemoData).not.toHaveBeenCalled();
  expect(getAssetReplacementApplications()).toEqual(before);
});

test('旧资产入库后才可确认领取及出库，关联入库结果保留', () => {
  const id = application().id;
  executeReplacementInbound(id, '测试仓库');
  const inbound = getAssetReplacementApplications()[0].returnProcess;
  requestReplacementConfirmation(id, '新资产领取', '狐小e扫码确认');
  confirmReplacementByEmployee(id, '新资产领取', '狐小e扫码确认');
  executeReplacementOutbound(id, { newAsset: { assetTag: 'NEW-ASSET' } });
  const result = getAssetReplacementApplications()[0];
  expect(result.status).toBe('已完成');
  expect(result.returnProcess).toEqual(inbound);
  expect(result.issueProcess.outboundStatus).toBe('已出库');
  expect(result.issueProcess.outboundOrderNo).toBeTruthy();
});

test('历史先领后退异常只保留实发结果，不补入库、不清新资产及原历史', () => {
  const historical = application();
  historical.issueProcess = { outboundStatus: '已出库', outboundOrderNo: 'HISTORICAL-OUTBOUND' };
  historical.history = [{ node: '执行出库', status: '已完成', comment: '历史实际发放' }];
  saveAssetReplacementApplications([historical]);
  endReplacementApplication(historical.id, '历史异常收尾');
  const result = getAssetReplacementApplications()[0];
  expect(result.status).toBe('已完成');
  expect(result.newAsset).toEqual(historical.newAsset);
  expect(result.issueProcess).toEqual(historical.issueProcess);
  expect(result.returnProcess).toEqual(historical.returnProcess);
  expect(result.history.slice(0, historical.history.length)).toEqual(historical.history);
  expect(() => requestReplacementConfirmation(historical.id, '新资产领取', '刷卡确认')).toThrow('该更换申请已结束');
});
