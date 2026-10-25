import { createTextMeasurer, percentileWidth, sizeTableColumns } from './columnSizing';
const measure = text => String(text).length * 10;
const size = (columns, rows = [], options = {}) => sizeTableColumns(columns, rows, { measure, ...options });
test('按实际格式化金额、完整编码及表头图标测量，遵守上下限', () => {
  const result = size([
    { title: '金额', dataIndex: 'amount', sizing: { type: 'money', format: value => value.toLocaleString('en-US', { minimumFractionDigits: 2 }) } },
    { title: '标签号', dataIndex: 'tag', sizing: { type: 'code' } },
    { title: '较长排序表头', dataIndex: 'a', sorter: true, sizing: { type: 'number' } },
  ], [{ amount: 1234567.89, tag: '123456789012345678' }]);
  expect(result.columns.map(c => c.width)).toEqual([136, 196, 96]);
});
test('说明P95忽略单个极长异常值，编码仍按最长值，空态按类型和表头', () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({ value: i === 19 ? 'X'.repeat(80) : 'short' }));
  expect(size([{ title: '说明', dataIndex: 'value', sizing: { type: 'description' } }], rows).totalWidth).toBe(180);
  expect(size([{ title: '编号', dataIndex: 'value', sizing: { type: 'code' } }], rows).totalWidth).toBe(280);
  expect(size([{ title: '较长的空态表头', sizing: { type: 'status' } }]).totalWidth).toBe(96);
  expect(percentileWidth([], 0.95)).toBe(0);
});
test('枚举覆盖未出现值，嵌套取值，分组表头按子列总宽补足', () => {
  const result = size([{ title: '很长很长很长很长很长很长很长很长很长很长', children: [
    { title: '状态', dataIndex: ['values', 'state'], sizing: { type: 'status', enumValues: ['待确认的状态内容'] } },
    { title: '年份', dataIndex: ['values', 'year'], sizing: { type: 'year' } },
  ] }], [{ values: { year: '2026' } }]);
  expect(result.totalWidth).toBeGreaterThanOrEqual(216);
  expect(result.columns[0].children.every(c => c.width > 0)).toBe(true);
});
test('只给可伸展列分配空余，窄屏保留固有宽度，紧凑表不铺满', () => {
  const columns = [{ title: '名称', dataIndex: 'name', sizing: { type: 'text', flex: 1 } }, { title: '数量', dataIndex: 'quantity', sizing: { type: 'number' } }];
  const wide = size(columns, [], { containerWidth: 350 });
  expect(wide.columns[1].width).toBe(88);
  expect(wide.totalWidth).toBe(348);
  expect(size(columns, [], { containerWidth: 100 }).totalWidth).toBe(208);
  expect(size(columns, [], { containerWidth: 900, compact: true }).totalWidth).toBe(208);
  expect(size(columns, [], { previous: wide.intrinsicWidths, containerWidth: 100 }).totalWidth).toBe(208);
});
test('保留原字段渲染、合并规则；旧宽度不控制算法，固有缓存防翻页收缩', () => {
  const render = value => value;
  const columns = [{ title: '标签', dataIndex: 'tag', width: 999, render, sizing: { type: 'code' } }];
  const first = size(columns, [{ tag: '123456789012345678' }]);
  const next = size(columns, [], { previous: first.intrinsicWidths });
  expect(next.totalWidth).toBe(196);
  expect(next.columns[0].render).toBe(render);
  expect(columns[0].width).toBe(999);
});
test('Canvas按指定字体测量多行文本，估算支持中文', () => {
  const context = { measureText: text => ({ width: text.length * 7 }) };
  expect(createTextMeasurer('14px sans-serif', context)('ab\n1234')).toBe(28);
  expect(context.font).toBe('14px sans-serif');
  expect(createTextMeasurer('14px sans-serif', null)('中文')).toBe(28);
});

test('普通文字及分类指标不吞剩余空间，英文大类按最长值而非P95', () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({ name: i === 29 ? 'OFFICE EQUIPMENT' : 'PC' }));
  const label = size([{ title: '资产大类', dataIndex: 'name', sizing: { type: 'label' } }], rows, { containerWidth: 1200 });
  expect(label.totalWidth).toBe(176);
  const text = size([{ title: '资产情况', dataIndex: 'name', sizing: { type: 'text' } }], [{ name: '全部盘点资产' }], { containerWidth: 1200 });
  expect(text.totalWidth).toBe(120);
});
test('超出字段类型上限的表头仍完整保留并禁止逐字换行', () => {
  const result = size([{ title: '占全部盘点资产', dataIndex: 'rate', sizing: { type: 'percent', max: 50 } }]);
  expect(result.totalWidth).toBe(86);
  expect(result.columns[0].onHeaderCell().style.whiteSpace).toBe('nowrap');
});
