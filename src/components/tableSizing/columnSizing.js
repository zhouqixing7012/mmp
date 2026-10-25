// 列类型只定义展示边界，业务页面不再逐列指定像素宽度。
export const COLUMN_SIZING = {
  text: { min: 120, max: 280, percentile: 0.95, flex: 1 },
  description: { min: 180, max: 360, percentile: 0.95, flex: 2 },
  code: { min: 140, max: 280 },
  number: { min: 88, max: 180 },
  money: { min: 130, max: 220 },
  percent: { min: 112, max: 180 },
  date: { min: 112, max: 160 },
  year: { min: 80, max: 110 },
  status: { min: 96, max: 180 },
  index: { min: 64, max: 96 },
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const plainText = value => value == null ? '' : String(value);
export function percentileWidth(values, percentile = 1) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * percentile) - 1)];
}
export function columnValue(row, dataIndex) {
  return (Array.isArray(dataIndex) ? dataIndex : [dataIndex]).reduce((value, key) => value?.[key], row);
}
// 浏览器使用真实字体测量；服务端/无Canvas环境使用保守估算，挂载后重新实测。
export function createTextMeasurer(font, context) {
  return value => {
    const lines = plainText(value).split(/\r?\n/);
    if (context) {
      context.font = font;
      return Math.max(0, ...lines.map(line => context.measureText(line).width));
    }
    const size = Number(/([\d.]+)px/.exec(font)?.[1]) || 14;
    return Math.max(0, ...lines.map(line => Array.from(line).reduce((width, char) => width + (char.charCodeAt(0) > 255 ? size : size * 0.62), 0)));
  };
}

export function sizeTableColumns(columns, rows, { measure, measureHeader = measure, padding = 16, containerWidth = 0, compact = false, previous = {} } = {}) {
  const leaves = [];
  const groups = [];
  const visit = (items, path = '') => items.map((column, index) => {
    const key = String(column.key ?? column.dataIndex ?? `${path}${index}`);
    if (column.children) {
      const start = leaves.length;
      const children = visit(column.children, `${key}.`);
      groups.push({ column, start, end: leaves.length });
      return { ...column, children };
    }
    const sizing = column.sizing || {};
    const rule = { ...(COLUMN_SIZING[sizing.type] || COLUMN_SIZING.text), ...sizing };
    const extras = (column.sorter ? 20 : 0) + (column.filters ? 20 : 0);
    const header = measureHeader(sizing.headerText ?? plainText(column.title)) + padding + extras;
    const values = rule.enumValues || rows.map(row => {
      if (sizing.text) return sizing.text(row);
      const value = columnValue(row, column.dataIndex);
      return sizing.format ? sizing.format(value, row) : value;
    });
    const content = percentileWidth(values.filter(value => value != null).map(value => measure(plainText(value))), rule.percentile ?? 1) + padding;
    const width = Math.ceil(clamp(Math.max(header, content, previous[key] || 0), rule.min, rule.max));
    const result = { ...column, width };
    delete result.sizing;
    leaves.push({ column: result, key, rule });
    return result;
  });
  const result = visit(columns);
  const distribute = (targets, extra, respectFlex) => {
    let pending = targets.filter(item => item.column.width < item.rule.max && (!respectFlex || item.rule.flex));
    while (extra >= 1 && pending.length) {
      const weight = pending.reduce((sum, item) => sum + (respectFlex ? item.rule.flex : 1), 0);
      const available = extra;
      let added = 0;
      for (const item of pending) {
        const share = Math.max(1, Math.floor(available * (respectFlex ? item.rule.flex : 1) / weight));
        const delta = Math.min(share, item.rule.max - item.column.width, available - added);
        item.column.width += delta;
        added += delta;
      }
      if (!added) break;
      extra -= added;
      pending = pending.filter(item => item.column.width < item.rule.max);
    }
  };
  // 组标题使用其子列总宽度，不能按单个子列宽度测量。
  groups.forEach(({ column, start, end }) => {
    const targets = leaves.slice(start, end);
    const current = targets.reduce((sum, item) => sum + item.column.width, 0);
    distribute(targets, Math.ceil(measureHeader(column.sizing?.headerText ?? plainText(column.title)) + padding - current), false);
  });
  const intrinsicWidths = Object.fromEntries(leaves.map(item => [item.key, item.column.width]));
  const intrinsicWidth = leaves.reduce((sum, item) => sum + item.column.width, 0);
  if (!compact) distribute(leaves, Math.floor(containerWidth - intrinsicWidth - 2), true);
  const totalWidth = leaves.reduce((sum, item) => sum + item.column.width, 0);
  return { columns: result, totalWidth, intrinsicWidth, intrinsicWidths };
}
