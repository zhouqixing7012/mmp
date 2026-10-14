import * as XLSX from 'xlsx';
import categoryCatalog from '../mock/reference/materialCategoryCatalog.json';
import { findMaterialCategory } from '../mock/reference/materialCategoryMapping';
import { fixture, assetMaterials, reportWarehouses } from '../mock/assetReportsFixtures';
import { assetReportRows } from '../mock/businessRulesMock';
import { buildReportWorkbook, formatReportValue, getReportDefinition, getReportOptions, queryReport, updateReportFilter } from './assetReportsService';
const sort = { key: '资产标签号', order: 'ascend' };
const permission = scopes => ({ userId: 'test-user', canView: true, allowedScopes: scopes });
const all = permission(['集团', '上海媒体', '广州媒体']);
const query = (id, filters = {}, access = all) => queryReport(id, filters, sort, access);
const exported = (id, filters = {}, selected = [], access = all) => {
  const book = buildReportWorkbook(id, filters, selected, sort, access);
  return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, defval: '' });
};
test.each(['集团', '上海媒体', '广州媒体'])('%s查询与导出仅含授权台账', scope => {
  const access = permission([scope]), rows = query('report-1-1', {}, access), data = exported('report-1-1', {}, [], access);
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(row => row.scope === scope)).toBe(true);
  expect(data.slice(1).map(row => row[data[0].indexOf('资产标签号')])).toEqual(rows.map(row => row.values['资产标签号']));
});
test('缺少授权立即失败，选中其他台账不能绕过权限', () => {
  expect(() => query('report-1-1', {}, { ...all, canView: false })).toThrow('无台账及卡片查看权限');
  expect(() => exported('report-1-1', {}, [], { ...all, canView: false })).toThrow('无台账及卡片查看权限');
  const outside = assetReportRows['report-2-1'].find(row => row.scope === '上海媒体');
  expect(exported('report-2-1', {}, [outside.id], permission(['集团']))).toHaveLength(1);
});
test('卡片授权限制列表和导出', () => {
  const tag = assetReportRows['report-1-1'][0].filters['资产标签号'], access = { ...all, allowedAssetTags: [tag] };
  expect(query('report-1-1', {}, access).map(row => row.values['资产标签号'])).toEqual([tag]);
  expect(exported('report-1-1', {}, [], access)).toHaveLength(2);
  const definition = getReportDefinition('report-1-1'), field = definition.filters.find(item => item.label === '资产标签号');
  expect(getReportOptions(definition, field, {}, access).map(option => option.value)).toEqual([tag]);
});
test('真实分类编号保留前导零，三页默认排序正常，未命中报错', () => {
  expect(categoryCatalog.majorRows).toHaveLength(24);
  expect(categoryCatalog.minorRows).toHaveLength(314);
  expect(findMaterialCategory(assetMaterials.find(row => row.materialCode === '112002002237001'))).toEqual({ majorCode: '12', minorCode: '002' });
  ['report-1-1', 'report-2-1', 'report-5-1'].forEach(id => {
    const rows = queryReport(id, {}, null, all);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => row.sort.majorCode && row.sort.minorCode)).toBe(true);
    expect(rows.every((row, index) => !index || Number(rows[index - 1].sort.majorCode) <= Number(row.sort.majorCode))).toBe(true);
  });
  const missing = assetMaterials.find(row => row.materialCode === '112003011031000');
  expect(findMaterialCategory(missing)).toBeNull();
  assetReportRows['report-1-1'].push(fixture('unmatched-source', missing, reportWarehouses[0]));
  try { expect(() => queryReport('report-1-1', {}, null, all)).toThrow('112003011031000/NOTEBOOK/电脑外设-移动光驱'); }
  finally { assetReportRows['report-1-1'].pop(); }
});
test('标签模糊查询与公司多选取交集，分类父节点匹配小类', () => {
  const row = assetReportRows['report-1-1'].find(item => item.scope === '集团');
  expect(query('report-1-1', { '资产标签号': 'asset-0-0', '公司': ['114', '115'] }).map(item => item.id)).toEqual([row.id]);
  expect(query('report-1-1', { '资产标签号': 'asset-0-0', '公司': ['115'] })).toHaveLength(0);
  expect(query('report-1-1', { '公司': ['114', '115'] })).toHaveLength(12);
  const major = row.values['资产大类'];
  expect(query('report-1-1', { '资产类别': [`major:${major}`] }).every(item => item.values['资产大类'] === major)).toBe(true);
});
test('部门包含下级，邻接名称不能误命中', () => {
  const rows = query('report-1-1', { 'HR部门': ['演示组织.集团'] });
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(row => row.values['子公司'] === '集团')).toBe(true);
  expect(query('report-1-1', { 'HR部门': ['演示组织.集团其他'] })).toHaveLength(0);
});
test('入职查询与展示日期一致，领用区间包含当天，逆序日期报错', () => {
  const rows = queryReport('report-4-1', { '入职日期': ['2026-09-02', '2026-09-02'] }, null, all);
  expect(rows).toHaveLength(3);
  expect(rows.every(row => row.values['入职日期'] === '2026-09-02' && row.values['数量'] === 1)).toBe(true);
  expect(query('report-4-1', { '领用日期': ['2026-10-02', '2026-10-02'] })).toHaveLength(3);
  expect(() => query('report-4-1', { '入职日期': ['2026-09-03', '2026-09-02'] })).toThrow('不能晚于');
});
test('延期可见，刷卡按员工确认方式判断', () => {
  const rows = query('report-4-1');
  expect(rows.some(row => row.values['领用状态'] === '延期' && row.values['是否领用'] === '否')).toBe(true);
  expect(rows.every(row => row.values['是否刷卡'] === (row.values['员工确认方式'] === '刷卡' ? '是' : '否'))).toBe(true);
});
test('City改变后仅保留合法Building', () => {
  const definition = getReportDefinition('report-1-1'), field = definition.filters.find(item => item.label === 'City');
  const next = updateReportFilter(definition, { Building: ['127.瑞安广场', '129753.搜狐媒体大厦'] }, field, ['37.上海市']);
  expect(next.Building).toEqual(['127.瑞安广场']);
  expect(getReportOptions(definition, definition.filters.find(item => item.label === 'Building'), next).every(item => item.value === '127.瑞安广场')).toBe(true);
});
test('新增仅已完成的三种入库，完成快照不可修改', () => {
  const rows = query('report-5-1');
  expect(new Set(rows.map(row => row.values['入库类型']))).toEqual(new Set(['新增入库', '采购接收', '自购入库']));
  expect(rows.every(row => row.documentStatus === '已完成' && row.kind === '资产')).toBe(true);
  expect(rows.some(row => row.id === 'add-pending')).toBe(false);
  expect(Object.isFrozen(rows[0].snapshot)).toBe(true);
  expect(() => { rows[0].snapshot['原值'] = 99999; }).toThrow();
});
test('事务单据类型和操作类型独立筛选，不适用的变更字段为空', () => {
  const rows = queryReport('report-3-1', { '单据类型': ['资产变更'], '事务类型': ['104'] }, null, all);
  expect(rows).toHaveLength(3);
  expect(rows.every(row => row.documentStatus === '已处理' && row.values['原序列号'] !== row.values['现序列号'] && row.values['原仓库'] === '' && row.values['现资产责任人'] === '')).toBe(true);
  expect(query('report-3-1').some(row => row.id === 'transaction-pending')).toBe(false);
  const data = exported('report-3-1', { '事务类型': ['104'] });
  expect(data[1][data[0].indexOf('事务执行人')]).toBe('213852.孙志强');
});
test('事务处理日期默认从新到旧', () => {
  const rows = queryReport('report-3-1', {}, null, all);
  expect(rows.every((row, index) => !index || rows[index - 1].sort.processedAt >= row.sort.processedAt)).toBe(true);
});
test.each(['report-6-1', 'report-6-2'])('%s拆行共享单头物料，保持来源数量和价格', id => {
  const rows = query(id, {}, permission(['集团'])), split = rows.find(row => row.grain === '资产配给单.物料.数量');
  const same = rows.filter(row => row.values['申请单号'] === split.values['申请单号']);
  expect(same).toHaveLength(2);
  expect(same[0].claimSource).toBe(same[1].claimSource);
  expect(same[0].values['物料编码']).toBe(same[1].values['物料编码']);
  expect(same[0].values['申请日期']).toBe(same[1].values['申请日期']);
  expect(same.every(row => row.values['申请数量'] === 2)).toBe(true);
  expect(rows.filter(row => row.grain === '资产配给单.物料')).toHaveLength(1);
  expect(same.every(row => row.values['预计采购金额'] === (id === 'report-6-2' ? 2000 : null) && row.values['实际采购金额'] === (id === 'report-6-2' ? 1130 : null))).toBe(true);
});
test('采购有PO未领用已拆行，库存领用标签优先于配给标签', () => {
  const purchased = query('report-6-2').filter(row => row.values['PO单号'] && !row.values['领用出库单号']);
  expect(purchased).toHaveLength(6);
  expect(purchased.every(row => row.values['完成时间'] === '' && row.values['领用数量'] === null)).toBe(true);
  const received = query('report-6-1').filter(row => row.tagSource === '领用单');
  expect(received).toHaveLength(6);
  expect(received.every(row => row.claimSource.claim.tags.includes(row.values['资产标签号']) && !row.claimSource.line.assignedTags.includes(row.values['资产标签号']) && row.values['领用数量'] === 2)).toBe(true);
});
test('耗材两种粒度齐全，普通耗材不生成卡片标签和EBS净值', () => {
  const rows = query('report-2-1');
  expect(new Set(rows.map(row => row.kind))).toEqual(new Set(['耗材', '低值耐用品']));
  expect(rows.filter(row => row.kind === '耗材').every(row => row.grain === '耗材领用单.物料' && !row.filters['资产标签号'] && !row.filters['耗材标签号'] && row.values['净值'] === null)).toBe(true);
  expect(rows.filter(row => row.kind === '低值耐用品').every(row => row.grain === '耗材卡片.耗材标签号' && row.values['耗材标签号'])).toBe(true);
  expect(exported('report-2-1', {}, [rows[0].id])).toHaveLength(2);
  const data = exported('report-2-1', {}, [rows[0].id]);
  expect(data[1][data[0].indexOf('仓库')]).toBe(rows[0].exports['库房']);
  expect(data[1][data[0].indexOf('仓库')]).not.toMatch(/^I\d+\./);
});
test('耗材结果读取领用状态、原税额和仓库，每次查询更新且导出一致', () => {
  const rows = query('report-7-2');
  expect(rows.some(row => row.detailSource.claim.status === 1 && row.values['是否领用'] === '是' && row.values['是否占用'] === '否')).toBe(true);
  expect(rows.some(row => row.detailSource.claim.status === 3 && row.values['是否领用'] === '否' && row.values['是否占用'] === '是')).toBe(true);
  rows.forEach(row => {
    const source = row.detailSource;
    expect(row.values['税金']).toBe(source.inboundDetail.taxAmount);
    const warehouse = source.card ? source.card.warehouse : source.claim.status === 1 ? null : source.inbound.warehouse;
    expect(row.values['仓库']).toBe(warehouse ? `${warehouse.warehouseCode}.${warehouse.warehouseDescription}` : '');
    if (row.kind === '耗材') expect(source.card).toBeNull();
  });
  const ordinary = rows.find(row => row.kind === '耗材' && row.detailSource.claim.status === 1);
  expect(ordinary.values['仓库']).toBe('');
  const source = ordinary.detailSource, savedTax = source.inboundDetail.taxAmount, savedStatus = source.claim.status;
  try {
    source.inboundDetail.taxAmount = 23.45; source.claim.status = 3;
    const fresh = query('report-7-2').find(row => row.id === ordinary.id);
    expect(fresh.values['税金']).toBe(23.45);
    expect(fresh.values['是否领用']).toBe('否'); expect(fresh.values['是否占用']).toBe('是');
    expect(fresh.values['仓库']).toBe(`${source.inbound.warehouse.warehouseCode}.${source.inbound.warehouse.warehouseDescription}`);
    const data = exported('report-7-2', { '耗材物料编码': fresh.values['耗材物料编码'], '申请人公司': [fresh.filters['申请人公司']] });
    expect(data[1][data[0].indexOf('税金')]).toBe('23.45');
    expect(data[1][data[0].indexOf('仓库')]).toBe(`${source.inbound.warehouse.warehouseCode}.${source.inbound.warehouse.warehouseDescription}`);
  } finally { source.inboundDetail.taxAmount = savedTax; source.claim.status = savedStatus; }
});
test('耗材明细列表和选中导出无净值，资产明细净值保留', () => {
  expect(getReportDefinition('report-2-1').columns.some(field => field.key === '净值')).toBe(false);
  const rows = queryReport('report-2-1', {}, null, all), data = exported('report-2-1', {}, [rows[0].id]);
  expect(data).toHaveLength(2); expect(data[0]).not.toContain('净值');
  expect(getReportDefinition('report-1-1').columns.some(field => field.key === '净值')).toBe(true);
});
test('报废金额读取已完成账面源快照，导出一致且移除处置类型', () => {
  const rows = queryReport('report-8-1', {}, null, all), data = exported('report-8-1');
  expect(rows.every(row => row.kind === '资产' && row.values['原值'] === row.values['EBS资产原值'])).toBe(true);
  expect(rows.every(row => row.values['原值'] === row.retirementSource.ebsOriginalValue && row.values['原值'] !== row.retirementSource.assetSystemOriginalValue)).toBe(true);
  expect(getReportDefinition('report-8-1').columns.some(field => field.key === '处置类型')).toBe(false);
  expect(data[0]).not.toContain('处置类型');
  rows.forEach(row => {
    const source = row.accountingSource;
    expect(source.documentStatus).toBe('已完成');
    const detail = source.assetsSnapshot.find(item => item.tagNo === row.values['资产标签号']);
    expect(row.values['报废原值']).toBe(detail.originalValue);
    expect(row.values['报废净值']).toBe(detail.netValue);
    const exportedRow = data.slice(1).find(item => item[data[0].indexOf('资产标签号')] === row.values['资产标签号']);
    expect(exportedRow[data[0].indexOf('报废原值')]).toBe(formatReportValue(detail.originalValue, 'money'));
    expect(exportedRow[data[0].indexOf('报废净值')]).toBe(formatReportValue(detail.netValue, 'money'));
  });
  expect(rows.some(row => row.accountingSource.assetsSnapshot[0].detailScrapMethod === '部分报废')).toBe(true);
  expect(rows.some(row => row.accountingSource.assetsSnapshot[0].detailScrapMethod === '全部报废')).toBe(true);
  expect(query('report-8-1', { '资产标签号': 'retired-0' })).toHaveLength(1);
});
test('财务差异及升级金额可见，零和空保留各自含义', () => {
  const row = query('report-1-1').find(item => item.values['是否有差异'] === '是');
  expect(row.values['原值'] - row.values['EBS资产原值']).not.toBe(0);
  const data = exported('report-1-1', { '资产标签号': row.values['资产标签号'] });
  expect(data[1][data[0].indexOf('升级金额')]).toBe('1,234.56');
  expect(formatReportValue(0, 'money')).toBe('0.00');
  expect(formatReportValue(null, 'money')).toBe('');
  expect(() => formatReportValue('错误金额', 'money')).toThrow();
});

test('新员工按数值记录ID升序，与日期或字符串ID无关', () => {
  const rows = queryReport('report-4-1', {}, null, all);
  expect(rows.map(row => row.reportRecordId)).toEqual([3, 12, 21, 103, 112, 121, 203, 212, 221]);
  expect(rows[0].values['入职日期']).toBe('2026-09-02');
});
test.each(['report-6-1', 'report-6-2', 'report-7-1'])('%s每次查询所有待审节点和人员，完成后清空，导出一致', id => {
  const row = query(id).find(item => item.approvalSource.status === '处理中');
  const source = row.approvalSource, savedNodes = source.nodes, savedStatus = source.status;
  const personKey = id === 'report-7-1' ? '当前审批人名称' : '当前审批人';
  try {
    expect(row.values['审批节点']).toBe('ES主管审批；财务审批');
    expect(row.values[personKey]).toBe('213852.孙志强；220784.周琦星');
    expect(row.values['审批节点']).not.toContain('申请人提交');
    source.nodes = [{ name: '新的并行审批', status: '待审批', approvers: [{ employeeNo: '213852', name: '孙志强' }] }];
    const fresh = query(id).find(item => item.id === row.id);
    expect(fresh.values['审批节点']).toBe('新的并行审批');
    const data = exported(id, { '申请单号': row.values['申请单号'] });
    expect(data[1][data[0].indexOf('审批节点')]).toBe('新的并行审批');
    source.status = '已处理';
    expect(query(id).filter(item => item.approvalSource === source).every(item => item.values['审批节点'] === '' && item.values[personKey] === '')).toBe(true);
    const completed = exported(id, { '申请单号': row.values['申请单号'] });
    expect(completed[1][completed[0].indexOf('审批节点')]).toBe('');
    source.status = '已驳回';
    const rejected = query(id).find(item => item.id === row.id);
    expect(rejected.values['审批节点']).toBe('');
    expect(rejected.values[personKey]).toBe('');
    const rejectedExport = exported(id, { '申请单号': row.values['申请单号'] });
    expect(rejectedExport[1][rejectedExport[0].indexOf('审批节点')]).toBe('');
  } finally { source.nodes = savedNodes; source.status = savedStatus; }
});
test('资产报废类型与枚举保持，来源关联账面报废单和同一资产完成源', () => {
  const rows = query('report-3-1', { '单据类型': ['资产报废'], '事务类型': ['70', '71'] });
  expect(rows).toHaveLength(6);
  rows.forEach(row => {
    expect(row.values['单据类型']).toBe('资产报废');
    expect(row.sourceDocumentName).toBe('账面报废单');
    expect(row.values['单据编号']).toBe(row.accountingSource.applicationNo);
    expect(row.values['资产标签号']).toBe(row.accountingSource.assetsSnapshot[0].tagNo);
  });
  const data = exported('report-3-1', { '事务类型': ['70'] });
  expect(data[1][data[0].indexOf('单据类型')]).toBe('资产报废');
});
test('分隔符和金额缺失保持空值，导出不补值或误判差异', () => {
  const material = { ...assetMaterials[0], minorCategory: '无分隔符小类', materialDescription: '无点号说明' };
  const row = fixture('format-missing-test', material, reportWarehouses[0], { '原值': null, 'EBS资产原值': null });
  expect(row.values['资产小类A']).toBe('无分隔符小类');
  expect(row.values['资产小类明细']).toBe('');
  expect(row.values['型号']).toBe('');
  expect(row.values['是否有差异']).toBeNull();
  expect(fixture('empty-amount', material, reportWarehouses[0], { '原值': '', 'EBS资产原值': 1000 }).values['是否有差异']).toBeNull();
  expect(row.exports['资产小类明细']).toBe('');
  expect(formatReportValue(row.exports['原值'], 'money')).toBe('');
});
test('耗材明细缺领用或入库源保持否和空，卡片仓库空不取入库仓', () => {
  const base = query('report-7-2').find(row => row.kind === '耗材'), source = base.detailSource;
  const saved = { ...source };
  const read = () => query('report-7-2').find(row => row.id === base.id).values;
  try {
    source.claim = null; source.inbound = null; source.inboundDetail = null; source.card = null;
    expect(read()).toMatchObject({ '是否领用': '否', '是否占用': '否', '仓库': '', '税金': null });
    source.claim = { status: '3' }; source.inbound = saved.inbound; source.card = { warehouse: null };
    expect(read()).toMatchObject({ '是否领用': '否', '是否占用': '是', '仓库': '' });
    source.card = null; source.claim.status = '0'; source.inbound = { warehouse: { warehouseCode: 'I1001' } };
    expect(read()['仓库']).toBe('');
    source.claim.status = '1';
    expect(read()).toMatchObject({ '是否领用': '是', '是否占用': '否', '仓库': '' });
  } finally { Object.assign(source, saved); }
});

test('日期范围可仅一端，并在查询和导出使用相同自然日边界', () => {
  expect(query('report-4-1', { '入职日期': [null, '2026-09-01'] })).toHaveLength(3);
  expect(query('report-4-1', { '入职日期': ['2026-09-03', null] })).toHaveLength(3);
  expect(query('report-4-1', { '入职日期': [null, null] })).toHaveLength(9);
  const rows = query('report-4-1', { '入职日期': [null, '2026-09-02'] });
  expect(exported('report-4-1', { '入职日期': [null, '2026-09-02'] })).toHaveLength(rows.length + 1);
  expect(() => query('report-4-1', { '入职日期': '2026-09-01' })).toThrow('须填写日期范围');
  expect(() => query('report-4-1', { '入职日期': ['错误日期', null] })).toThrow('须填写有效日期');
  expect(() => query('report-4-1', { '入职日期从': '2026-09-01' })).toThrow('未定义查询条件');
});
test('十页合并日期与导出命名，01查询和结果按最新确认精修', () => {
  const ids = Object.keys(assetReportRows);
  ids.forEach(id => {
    const definition = getReportDefinition(id);
    expect(definition.exportLabel).toBe('导出');
    expect(definition.filters.some(field => field.type === 'date')).toBe(false);
    definition.filters.filter(field => field.type === 'daterange').forEach(field => {
      expect(field.label).toBe(field.key);
      expect(field.match).toBe('dateRange');
      expect(query(id, { [field.label]: [null, null] })).toHaveLength(query(id).length);
    });
  });
  const definition = getReportDefinition('report-1-1');
  expect(definition.filters.some(field => ['级别', '报废状态'].includes(field.label))).toBe(false);
  expect(definition.filters.find(field => field.label === '资产类别').type).toBe('treeSelect');
  expect(definition.filters.find(field => field.label === '资产状态').type).toBe('assetStatusSelect');
  expect(definition.columns.some(field => field.key === '级别')).toBe(false);
  const floor = definition.filters.find(field => field.label === 'Floor');
  expect(floor).toMatchObject({ type: 'select', multiple: true });
  expect(getReportOptions(definition, floor).every(option => option.label === option.name)).toBe(true);
  const building = definition.filters.find(field => field.label === 'Building');
  expect(getReportOptions(definition, building, { City: ['37.上海市'] })).toEqual(expect.arrayContaining([expect.objectContaining({ value: '127.瑞安广场', name: '瑞安广场', city: '上海市' })]));
  const warehouse = definition.filters.find(field => field.label === '仓库');
  expect(getReportOptions(definition, warehouse).every(option => option.company && option.code)).toBe(true);
});

test("资产明细财务与组织格式同步列表导出且不修改其他报表", () => {
  const rows = query("report-1-1");
  expect(new Set(rows.map(row => row.values["子公司"]))).toEqual(new Set(["集团", "媒体", "焦点", "视频"]));
  for (const row of rows) {
    expect(row.values["费用账户"]).toBe("112.16.909003.72101.E2104.0.0.0.0");
    expect(row.values["资产账簿"]).toBe("FA_BOOK_SOHU");
    expect(row.values["资产编号"]).toMatch(/^\d+$/);
    expect(row.values["HR一级部门"]).toBe("D0001.集团总部");
    expect(row.values["HR二级部门"]).toBe("D0002.财务中心");
    for (const key of ["费用账户", "资产账簿", "资产编号", "子公司", "HR一级部门", "HR二级部门"]) expect(row.exports[key]).toBe(row.values[key]);
    if(row.values["报废类型"]) expect(["已到报废期", "未到报废期", "丢失"]).toContain(row.values["报废类型"]);
  }
});

test("事务标签模糊查询导出一致，秒级处理日期和担保人列按新口径", () => {
  const definition = getReportDefinition("report-3-1");
  const rows = query("report-3-1"), tag = rows[0].values["资产标签号"];
  const term = tag.slice(1, -1);
  const filtered = query("report-3-1", { "资产标签号": term });
  expect(filtered.length).toBeGreaterThan(0);
  expect(filtered.every(row => row.values["资产标签号"].includes(term))).toBe(true);
  const data = exported("report-3-1", { "资产标签号": term });
  expect(data[0]).not.toContain("原资产担保人");
  expect(data[0]).not.toContain("现资产担保人");
  const column = data[0].indexOf("事务处理日期");
  expect(data.slice(1).map(row => row[column])).toEqual(filtered.map(row => row.values["事务处理日期"]));
  data.slice(1).forEach(row => expect(row[column]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/));
  expect(definition.filters.find(field => field.label === "资产类别").type).toBe("treeSelect");
});

test("全报表公共查询口径、级别删除、名称与格式保持一致", () => {
  const ids = Object.keys(assetReportRows);
  for (const id of ids) {
    const definition = getReportDefinition(id);
    expect([...definition.columns, ...definition.exportColumns].some(c => ["级别", "资产级别", "库房", "采购申请号"].includes(c.label))).toBe(false);
    for (const field of definition.filters) {
      if (field.match === "category") expect(field.type).toBe("treeSelect");
      if (field.match === "department") expect(field.type).toBe("departmentTreeSelect");
      if (field.label === "资产标签号") {
        const row = query(id).find(row => row.values["资产标签号"]);
        const term = row.values["资产标签号"].slice(1, -1);
        const rows = query(id, { "资产标签号": term });
        expect(rows.length).toBeGreaterThan(0);
        expect(rows.every(row => row.values["资产标签号"].includes(term))).toBe(true);
        const data = exported(id, { "资产标签号": term });
        expect(data.slice(1).map(row => row[data[0].indexOf("资产标签号")])).toEqual(rows.map(row => row.values["资产标签号"]));
      }
      if (field.optionSet === "Floor") expect(getReportOptions(definition, field).every(option => option.label === option.name)).toBe(true);
    }
  }
  for (const id of ["report-4-1", "report-5-1"]) expect(query(id).every(row => row.values["费用账户"] === "112.16.909003.72101.E2104.0.0.0.0")).toBe(true);
  expect(query("report-5-1").every(row => row.values["资产账簿"] === "FA_BOOK_SOHU")).toBe(true);
  const retired = query("report-8-1");
  expect(retired.map(row => row.values["报废类型"])).toEqual(["已到报废期", "未到报废期", "丢失"]);
  retired.forEach(row => expect(row.values["报废类型"]).toBe(row.accountingSource.assetsSnapshot[0].retirementType));
  expect(getReportDefinition("report-2-1").filters.find(f => f.label === "部门").multiple).toBe(false);
});
