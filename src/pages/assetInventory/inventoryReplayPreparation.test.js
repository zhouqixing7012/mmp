import { getPreparationNotices, schedulePreparationNotices } from './inventoryPreparationNoticeStore';
import { replayPreparationDate, buildReplayPreparationNotices } from './inventoryReplayPreparation';

test('复盘准备通知取启动日与开始前三天中较晚的一天', () => {
  expect(replayPreparationDate('2026-10-10','2026-10-01')).toBe('2026-10-07');
  expect(replayPreparationDate('2026-10-10','2026-10-09')).toBe('2026-10-09');
  expect(replayPreparationDate('2026-10-10','2026-10-10')).toBe('2026-10-10');
  expect(() => replayPreparationDate('2026-10-10','2026-10-11')).toThrow('不能在盘点开始日之后启动');
});

test('各计划按自身开始日通知员工，库房公共不加入员工准备通知', () => {
  const plans=[{planNo:'P1',startDate:'2026-10-10'},{planNo:'P2',startDate:'2026-10-12'}];
  const notices=buildReplayPreparationNotices({projectNo:'R1',projectType:'复盘'},plans,()=>[
    {inventoryRange:'员工',owner:'苏伟'},{inventoryRange:'员工',owner:'苏伟'},{inventoryRange:'公共',owner:'公共管理员'},
  ],'2026-10-01');
  expect(notices.map(n=>n.scheduledDate)).toEqual(['2026-10-07','2026-10-09']);
  expect(notices[0].recipients).toEqual(['苏伟']);
  expect(buildReplayPreparationNotices({projectType:'初盘'},plans,()=>[],'2026-10-01')).toEqual([]);
});

test('准备通知安排按项目隔离并且重复启动不重复安排', () => {
  window.localStorage.clear();
  const notices=[{id:'R1:P1:资产准备',planNo:'P1',scheduledDate:'2026-10-07'}];
  expect(schedulePreparationNotices('R1', notices)).toHaveLength(1);
  expect(schedulePreparationNotices('R1', notices)).toHaveLength(0);
  expect(getPreparationNotices('R1')).toHaveLength(1);
  expect(getPreparationNotices('R2')).toEqual([]);
});
