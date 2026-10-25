import { fixedStepAxis } from './inventoryReportChartLayout';
test('四年变化金额20百万元、数量500件；动态覆盖本年度数据', () => {
  expect(fixedStepAxis([85.199, 80.401, 74.657, 78.067, 4.604], 20).ticks).toEqual([0, 20, 40, 60, 80, 100]);
  expect(fixedStepAxis([13317, 12134, 11072, 14456], 500, false).ticks).toEqual([11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500]);
  expect(fixedStepAxis([125], 20).domain).toEqual([0, 140]);
});
test('占比已转换百分点，0.050%步长无浮点尾数；数量5件步长', () => {
  expect(fixedStepAxis([0.008, 0.025, 0.361, 0.014], 0.05).ticks).toEqual([0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4]);
  expect(fixedStepAxis([1, 3, 40, 2], 5).domain).toEqual([0, 45]);
});
test('缺失、零及负值能形成有效轴，不把缺失值绘成0', () => {
  expect(fixedStepAxis([null, undefined, NaN], 20).ticks).toEqual([0, 20]);
  expect(fixedStepAxis([0], 5).domain).toEqual([0, 5]);
  expect(fixedStepAxis([-12, 32], 20).domain).toEqual([-20, 40]);
});
