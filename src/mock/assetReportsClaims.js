import { assetMaterials, consumableMaterials, reportWarehouses, consumableWarehouses, fixture } from './assetReportsFixtures';

function approval(status) {
  return { status, source: '并行待审批演示，不表示正式节点人员授权', nodes: [
    { name: 'ES主管审批', status: status === '已处理' ? '已通过' : '待审批', approvers: [{ employeeNo: '213852', name: '孙志强' }, { employeeNo: '220784', name: '周琦星' }] },
    { name: '财务审批', status: status === '已处理' ? '已通过' : '待审批', approvers: [{ employeeNo: '213852', name: '孙志强' }] },
    { name: '申请人提交', status: '已通过', approvers: [{ employeeNo: '220784', name: '周琦星' }] },
  ] };
}
function applicant(row) {
  const person = `${row.values['资产责任人工号']}.${row.values['资产责任人姓名']}`;
  const department = row.filters['HR部门'];
  Object.assign(row.values, { '申请人': person, '申请人部门': department, '申请人部门名称': department,
    '申请人办公区': `${row.values['City']}.${row.values['Building']}` });
  Object.assign(row.filters, { '申请人': row.values['资产责任人工号'], '申请人部门': department, '部门': department });
  Object.assign(row.lookupLabels, { '申请人': person, '申请人部门': department, '部门': department });
  return row;
}
function sync(row) { row.exports = { ...row.values }; return row; }
export const newEmployeeClaims = reportWarehouses.flatMap((warehouse, group) => ['刷卡', '扫码', ''].map((confirmation, index) => {
  const received = Boolean(confirmation), date = `2026-09-${String(index + 1).padStart(2, '0')}`;
  const row = fixture(`new-${group}-${index}`, assetMaterials[index], warehouse, {
    '申请单号': `NEW-CLAIM-DEMO-${group}-${index}`, '单据状态': received ? '已处理' : '处理中',
    '领用状态': received ? '领用' : '延期', '入职日期': date, 'PS配置': assetMaterials[index].config,
    '办公地点': `${warehouse.city}.${warehouse.building}`, '是否领用': received ? '是' : '否',
    '领用日期': received ? `2026-10-0${index + 1}` : '', '是否刷卡': confirmation === '刷卡' ? '是' : '否',
    '员工确认方式': confirmation, '出库单号': received ? `OUT-NEW-DEMO-${group}-${index}` : '',
  });
  row.values['部门'] = row.filters['HR部门']; row.filters['领用日期'] = row.values['领用日期'];
  row.reportRecordId = group * 100 + [21, 3, 12][index]; row.sort.recordId = row.reportRecordId;
  row.sort.processedAt = row.values['领用日期']; row.documentStatus = row.values['单据状态'];
  return sync(row);
}));
function assetClaimSource(warehouse, group, mode, stage) {
  const purchase = mode === '统一采购', linked = stage !== '待匹配', received = stage === '已领用';
  const material = assetMaterials[0], suffix = `${group}-${mode}-${stage}`;
  // 单头、配给物料和联查结果构成同一演示链路，投影行共享此对象。
  return {
    warehouse, material, mode, stage, approval: approval(received ? '已处理' : '处理中'),
    header: { number: `ASSET-CLAIM-DEMO-${suffix}`, applyDate: '2026-10-02 09:00:00', status: received ? '已处理' : '处理中' },
    line: { number: `ASSIGN-DEMO-${suffix}`, quantity: 2, referencePrice: 1000,
      assignedTags: !purchase && linked ? [`ASSIGN-TAG-${suffix}-1`, `ASSIGN-TAG-${suffix}-2`] : [] },
    summary: purchase && linked ? { number: `SUMMARY-DEMO-${suffix}`, suggestion: '汇总单采购建议', person: '213852.孙志强' } : null,
    procurement: purchase && linked ? { request: `PR-DEMO-${suffix}`, po: `PO-DEMO-${suffix}`, status: '已完成', taxIncludedUnitPrice: 1130 } : null,
    claim: { abandoned: received ? '否' : '', tags: received ? [`CLAIM-TAG-${suffix}-1`, `CLAIM-TAG-${suffix}-2`] : [] },
    outbound: received ? { number: `OUT-CLAIM-DEMO-${suffix}`, auditedAt: '2026-10-03 09:00:00', quantity: 2, confirmation: '刷卡', handSigned: '否' } : null,
  };
}
function projectAssetClaim(source) {
  const { material, warehouse, header, line, summary, procurement, claim, outbound, mode } = source;
  const tags = claim.tags.length ? claim.tags : line.assignedTags;
  const split = mode === '统一采购' ? Boolean(procurement?.po) : tags.length > 0;
  return Array.from({ length: split ? line.quantity : 1 }, (_, index) => {
    const tag = tags[index] || '', quantity = line.quantity;
    const row = applicant(fixture(`${header.number}-${index + 1}`, material, warehouse, {
      '申请单号': header.number, '申请日期': header.applyDate, '统一申请单状态': header.status,
      '资产总类': material.materialType, '资产名称': material.materialDescription, '申请数量': quantity,
      '申请原因': '办公设备领用', '详细说明': '报表流程演示', '是否超标': '否', '资产配给单号': line.number,
      '资产统一汇总单号': summary?.number || '', '子流程类型': mode === '库存领用' ? '领用' : summary ? '采购汇总' : '采购',
      '匹配状态': mode, '审批节点': outbound ? '' : 'ES主管审批', '当前审批人': outbound ? '' : 'DEMO-HEWEN.何文',
      '参考单价': line.referencePrice, '预计采购金额': mode === '统一采购' ? quantity * line.referencePrice : null,
      '汇总提交人': summary?.person || '', 'ES建议': summary?.suggestion || '配给单建议',
      '采购申请单号': procurement?.request || '', '采购申请状态': procurement?.status || '',
      'PO单号': procurement?.po || '', 'PO状态': procurement?.status || '', '实际采购金额': procurement?.taxIncludedUnitPrice ?? null,
      '完成时间': outbound?.auditedAt || '', '是否弃领': claim.abandoned, '领用出库单号': outbound?.number || '',
      '出库日期': outbound?.auditedAt || '', '员工确认方式': outbound?.confirmation || '', '是否手签': outbound?.handSigned || '',
      '资产标签号': tag, '领用数量': outbound?.quantity ?? null,
    }));
    if (!tag) ['资产大类', '资产小类', '资产说明', '使用说明'].forEach(key => { row.values[key] = ''; });
    Object.assign(row.filters, { '申请日期': header.applyDate, '申请人办公区': row.values['申请人办公区'], '汇总提交人名称': summary ? '213852' : '', '是否超标': '否' });
    row.lookupLabels['汇总提交人名称'] = summary?.person || '';
    row.matchStatus = mode; row.documentStatus = header.status; row.sort.applyDate = header.applyDate;
    row.grain = split ? '资产配给单.物料.数量' : '资产配给单.物料'; row.claimSource = source; row.approvalSource = source.approval;
    row.tagSource = claim.tags.length ? '领用单' : line.assignedTags.length ? '配给单' : '';
    return sync(row);
  });
}
export const stockClaimSources = reportWarehouses.flatMap((warehouse, group) => ['待匹配', '已配给', '已领用'].map(stage => assetClaimSource(warehouse, group, '库存领用', stage)));
export const purchaseClaimSources = reportWarehouses.flatMap((warehouse, group) => ['待匹配', '已采购', '已领用'].map(stage => assetClaimSource(warehouse, group, '统一采购', stage)));
export const stockClaims = stockClaimSources.flatMap(projectAssetClaim);
export const purchaseClaims = purchaseClaimSources.flatMap(projectAssetClaim);
export const consumableClaims = consumableWarehouses.flatMap((warehouse, group) => consumableMaterials.slice(0, 6).map((material, index) => {
  const completed = index % 2 === 1, quantity = 2, price = 50;
  const row = applicant(fixture(`consumable-claim-${group}-${index}`, material, warehouse, {
    '申请日期': `2026-10-0${index + 1} 09:00:00`, '统一申请单状态': completed ? '已处理' : '处理中',
    '匹配状态': '统一采购', '耗材总类名称': material.materialType, '耗材名称': material.materialDescription,
    '申请原因': '日常办公', '详细说明': '耗材申领演示', '耗材配给单号': `CONSUM-ASSIGN-DEMO-${group}-${index}`,
    '配给单审核完成时间': '2026-10-02 09:00:00', '耗材统一汇总单号': `CONSUM-SUMMARY-DEMO-${group}-${index}`,
    '审批节点': completed ? '' : 'ES主管审批', '当前审批人名称': completed ? '' : 'DEMO-HEWEN.何文',
    '申请数量': quantity, '参考单价': price, '预计采购金额': quantity * price, '汇总提交人名称': '213852.孙志强',
    'ES建议': '汇总单建议', '采购申请单号': completed ? `PR-CONSUM-DEMO-${group}-${index}` : '', '采购申请状态': completed ? '已完成' : '',
    'PO单号': completed ? `PO-CONSUM-DEMO-${group}-${index}` : '', 'PO状态': completed ? '已完成' : '',
    '采购数量': completed ? 2 : null, '采购单价': completed ? 56.5 : null, '采购金额': completed ? 113 : null,
    '是否弃领': completed ? '否' : '', '领用出库单号': completed ? `OUT-CONSUM-DEMO-${group}-${index}` : '',
    '出库日期': completed ? '2026-10-03 09:00:00' : '', '员工确认方式': completed ? '刷卡' : '',
    '耗材大类名称': material.majorCategory, '耗材小类名称': material.minorCategory, '领用数量': completed ? 2 : null,
  }));
  Object.assign(row.filters, { '耗材物料编码': material.materialCode, '耗材名称': material.materialCode, '申请日期': row.values['申请日期'], '申请人办公区': row.values['申请人办公区'] });
  row.approvalSource = approval(completed ? '已处理' : '处理中');
  row.sort.applyDate = row.values['申请日期']; row.documentStatus = row.values['统一申请单状态']; return sync(row);
}));
// 申请结果补充页的领用/占用来自独立演示源标记；现状未定义生成公式。
const detailFlags = [{ received: '否', occupied: '否' }, { received: '是', occupied: '是' }, { received: '是', occupied: '否' }];
export const consumableClaimDetails = consumableClaims.map((row, index) => {
  const flags = detailFlags[index % detailFlags.length];
  const values = { ...row.values, '耗材物料编码': row.values['物料编码'], '耗材物料描述': row.values['耗材名称'],
    '耗材大类': row.values['耗材大类名称'], '耗材小类': row.values['耗材小类名称'], '总类': row.kind,
    '不含税单价': 50, '税金': 6.5, '耗材数量': 2, '耗材公司': row.values['公司'], '耗材状态': '在用',
    '耗材责任人': row.values['申请人'], '耗材责任人公司': row.values['公司'], '耗材责任人板块': row.values['板块'],
    '耗材责任人部门': row.values['申请人部门'], '申请人公司': row.values['公司'], '申请人板块': row.values['板块'],
    '是否领用': flags.received, '是否占用': flags.occupied,
    '采购单': row.values['PO单号'], '耗材领用单号': row.values['领用出库单号'] };
  return { ...row, sourceFlags: flags, flagSource: '申请结果明细独立演示标记，公式未定义', sort: { ...row.sort, claimState: row.documentStatus, materialCode: row.values['物料编码'], tag: row.values['耗材标签号'] }, id: `detail-${row.id}`, values, exports: { ...values }, filters: { ...row.filters,
    '耗材公司': row.filters['公司'], '耗材责任人公司': row.filters['公司'], '申请人公司': row.filters['公司'],
    '耗材责任人': row.filters['申请人'], '耗材责任人查询': row.filters['申请人'], '耗材责任人部门': row.filters['申请人部门'],
    '耗材标签号': values['耗材标签号'], '耗材物料编码': values['耗材物料编码'], '是否领用': values['是否领用'], '是否占用': values['是否占用'], '耗材责任人板块': '17', '申请人板块': '17', '耗材物料描述': values['耗材物料描述'],
  } };
});
