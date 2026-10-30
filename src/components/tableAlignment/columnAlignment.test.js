import { columnAlignment, alignTableColumns } from './columnAlignment';
test.each([
  ['序号', 'center'], ['行号', 'center'], ['Excel行号', 'center'], ['PO行号', 'left'], ['PR单/行号', 'left'],
  ['资产标签号', 'left'], ['员工编号', 'left'], ['手机号', 'left'], ['公司', 'left'], ['部门', 'left'], ['资产说明', 'left'],
  ['数量', 'right'], ['金额（元）', 'right'], ['原值', 'right'], ['净值', 'right'], ['增长率', 'right'], ['占比', 'right'],
  ['状态', 'center'], ['是否启用', 'center'], ['操作', 'center'], ['申请日期', 'center'], ['审批时间', 'center'], ['年度', 'center'],
  ['金额类型', 'left'], ['数量说明', 'left'], ['资产配置', 'left'], ['累计折旧', 'right'], ['公司人均用量', 'right'], ['打印份数', 'right'], ['含税小计', 'right'], ['税金', 'right'],
])('%s 按字段语义对齐为 %s', (title, align) => expect(columnAlignment({ title })).toBe(align));
test('元数据、分组表头、回调及模板例外', () => {
  const onClick = jest.fn(), render = jest.fn();
  const cols = [{ title: '合计金额', children: [{ title: '金额', dataIndex: 'amount', render, onCell: () => ({ colSpan: 2, onClick, style: { color: 'red', textAlign: 'center' } }) }] }];
  const normalized = alignTableColumns(cols);
  expect(normalized[0].align).toBe('center');
  const money = normalized[0].children[0];
  expect(money.align).toBe('right'); expect(money.render).toBe(render);
  expect(money.onCell({})).toEqual({ colSpan: 2, onClick, style: { color: 'red', textAlign: 'right' } });
  expect(money.onHeaderCell({}).style.textAlign).toBe('right');
  expect(alignTableColumns(cols, true)).toBe(cols);
  expect(columnAlignment({ sizing: { type: 'index' } })).toBe('center');
  expect(columnAlignment({ sizing: { type: 'money' } })).toBe('right');
  expect(columnAlignment({ title: '编码', sizing: { type: 'number' } })).toBe('left');
});
test('文字价值说明、税率与业务行标识不按表面数字误判', () => {
  expect(columnAlignment({ title: '目标价值' })).toBe('left');
  expect(columnAlignment({ title: '税率' })).toBe('right');
  expect(columnAlignment({ title: '行号', dataIndex: 'lineNo' })).toBe('left');
  const sentinel = {}; expect(alignTableColumns([sentinel])[0]).toBe(sentinel);
});
