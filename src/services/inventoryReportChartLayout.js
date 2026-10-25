// 固定模板步长，范围按本次数据向外取整；不锁定旧年度的最大值。
export function fixedStepAxis(values, step, includeZero = true) {
  const finite = values.filter(value => value != null && Number.isFinite(value));
  const minimum = finite.length ? Math.min(...finite) : 0;
  const maximum = finite.length ? Math.max(...finite) : 0;
  const lower = includeZero ? Math.min(0, Math.floor(minimum / step) * step) : Math.floor(minimum / step) * step;
  let upper = Math.ceil(maximum / step) * step;
  if (upper <= lower || Math.abs(upper - maximum) < step * 1e-8) upper += step;
  const count = Math.round((upper - lower) / step);
  const ticks = Array.from({ length: count + 1 }, (_, index) => Number((lower + index * step).toFixed(8)));
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks, interval: 0 };
}
