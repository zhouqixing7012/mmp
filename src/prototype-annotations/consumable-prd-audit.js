// 耗材申请第二轮 PRD 深审补充。
// 正式领用原型按产品口径拆分：方案一=普通耗材（物料编码），方案二=低值耐用品（耗材标签号）。
// 旧“耗材领用”页面不再作为正式 PRD coverage 对象。

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stableKey(value) {
  const text = compactText(value).toLowerCase() || 'item';
  return encodeURIComponent(text)
    .replace(/%/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 72) || 'item';
}

const scope = (menu) => `route:/yewurules::个人工作台::${menu}`;
const scopeTarget = (pageScope, kind, label) => `scope-${stableKey(pageScope)}::${kind}::${stableKey(label)}`;
const cardTarget = (cardTitle, kind, label) => `card-${stableKey(cardTitle)}::${kind}::${stableKey(label)}`;
const prdItem = (text) => ({ text, source: 'prd' });

function note({ id, pageKey, target, kind = 'business-rule', title, rules, availability, priority = 'P1' }) {
  return {
    id,
    pageKey,
    target,
    kind,
    title,
    summary: '',
    summarySource: 'prd',
    priority,
    position: { side: 'right', align: 'center', gap: 6 },
    sections: [{ title: '研发实现规则', items: (rules || []).map(prdItem) }],
    ...(availability ? { availability } : {}),
  };
}

const bound = (id, source, object, rule, annotationId, expectedTargetFragment) => ({
  id, source, object, rule, status: 'bound', annotationId,
  ...(expectedTargetFragment ? { expectedTargetFragment } : {}),
});
const review = (id, source, object, rule, reason, annotationId) => ({
  id, source, object, rule, status: 'review', reason,
  ...(annotationId ? { annotationId } : {}),
});
const skip = (id, source, object, rule, reason) => ({ id, source, object, rule, status: 'skip', reason });

export const CONSUMABLE_AUDIT_SCOPES = {
  apply: scope('物资申请'),
  mis: scope('耗材MIS鉴定'),
  approval: scope('耗材审批'),
  allocation: scope('耗材配给'),
  claimOrdinary: scope('耗材领用方案一'),
  claimLowValue: scope('耗材领用方案二'),
  confirm: scope('员工耗材领用确认'),
  summary: scope('耗材汇总'),
  summaryApproval: scope('耗材汇总审批'),
};

const LEGACY_CLAIM_SCOPE = scope('耗材领用');

export const consumableAuditAnnotationsByScope = {
  [CONSUMABLE_AUDIT_SCOPES.apply]: [
    note({
      id: 'consumable-audit-apply-notice', pageKey: CONSUMABLE_AUDIT_SCOPES.apply,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.apply, 'button', '已阅读'), kind: 'action-rule',
      title: '首次进入必须先阅读申请须知',
      rules: ['首次进入物资申请页自动弹申请须知，不能点遮罩或关闭按钮绕过，只允许点击“已阅读”关闭。', '耗材申请按公司每周一汇总，目录缺失时联系集团ES刘建。'],
    }),
    note({
      id: 'consumable-audit-apply-scope', pageKey: CONSUMABLE_AUDIT_SCOPES.apply,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.apply, 'button', '添加物资'), kind: 'action-rule',
      title: '耗材标签页只允许低值耐用品和普通耗材',
      rules: ['添加物资后切换耗材标签页；候选物料范围仅包含物料类型“低值耐用品”和“耗材”。', '耗材申请本身不做个人/部门超标限制。'],
    }),
    note({
      id: 'consumable-audit-apply-main-asset-condition', pageKey: CONSUMABLE_AUDIT_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '关联主资产'), kind: 'table-column-rule',
      title: '主资产不是所有耗材必填，而是由物料配置条件决定', priority: 'P0',
      rules: ['只有物料配置“是否关联主资产=是”时才展示并要求主资产标签号必填；其他耗材不得被统一强制关联主资产。', '候选主资产仅限申请人名下“在用-使用中”资产，并继续按物料配置的主资产物料小类过滤。', '选择后自动带出主资产说明。'],
    }),
    note({
      id: 'consumable-audit-apply-purpose', pageKey: CONSUMABLE_AUDIT_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '申请用途'), kind: 'table-column-rule',
      title: '耗材申请用途使用耗材专属四项枚举',
      rules: ['耗材申请用途枚举为：日常办公使用、特殊项目采购、提升电脑配置使用、部门公共设备使用。', '不得沿用资产申请的员工用机/专业用途等资产枚举。'],
    }),
    note({
      id: 'consumable-audit-apply-preview', pageKey: CONSUMABLE_AUDIT_SCOPES.apply,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.apply, 'button', '预览'), kind: 'action-rule',
      title: '预览前统一校验耗材必填项并切换只读态',
      rules: ['数量必须为大于等于1的整数；申请用途、申请原因必填；主资产仅在物料配置要求时条件必填。', '预览页所有申请字段只读，底部仅保留“上一步”“提交”。'],
    }),
    note({
      id: 'consumable-audit-apply-submit-route', pageKey: CONSUMABLE_AUDIT_SCOPES.apply,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.apply, 'button', '提交'), kind: 'action-rule',
      title: '资产与耗材混合申请必须拆单，耗材再按MIS属性分流', priority: 'P0',
      rules: ['共享页面可同时选择资产和耗材，但提交后资产申请与耗材申请必须拆成不同业务单据。', '耗材任一申请行“是否MIS审核=是”时整张耗材申请单进入MIS鉴定且不拆行；否则直接进入直属5级及以上领导审批。'], availability: 'dynamic',
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.mis]: [
    note({
      id: 'consumable-audit-mis-row-content', pageKey: CONSUMABLE_AUDIT_SCOPES.mis,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.mis, 'card', '申请耗材信息'),
      title: 'MIS页只展示需鉴定行，但申请用途等业务字段仍要完整带出',
      rules: ['仅展示“是否MIS审核=是”且未驳回的行。', '每行应展示耗材说明、配置、数量、申请用途、申请原因，以及条件主资产信息，避免鉴定人缺少申请场景。'],
    }),
    note({
      id: 'consumable-audit-mis-mixed-result', pageKey: CONSUMABLE_AUDIT_SCOPES.mis,
      target: cardTarget('申请耗材信息', 'table-column', 'MIS意见'), kind: 'table-column-rule',
      title: 'MIS必须支持同一申请中部分通过、部分不通过', priority: 'P0',
      rules: ['每行独立选择“鉴定通过/鉴定不通过”。', '鉴定不通过行反写已驳回；只要仍有有效行，其他行继续进入5级审批；仅当全部申请行都已驳回时整单结束。'],
    }),
    note({
      id: 'consumable-audit-mis-description', pageKey: CONSUMABLE_AUDIT_SCOPES.mis,
      target: cardTarget('申请耗材信息', 'table-column', '意见说明'), kind: 'table-column-rule',
      title: '意见说明校验需按最终PRD口径统一',
      rules: ['字段表写明“鉴定不通过时必填，最多400字”；同时操作规则又写“意见说明未填写”需提示。', '研发实现前需统一最终口径，不能让前端校验和业务规则互相冲突。'],
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.approval]: [
    note({
      id: 'consumable-audit-approval-lines', pageKey: CONSUMABLE_AUDIT_SCOPES.approval,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.approval, 'card', '申请耗材信息'),
      title: '5级审批查看整单，但已被MIS驳回行不得再生成配给单',
      rules: ['直属5级及以上领导按整单审批并查看完整申请上下文。', '同意后只对仍有效/MIS通过的申请行生成配给单，每一行对应一张配给单。'],
    }),
    note({
      id: 'consumable-audit-approval-countersign', pageKey: CONSUMABLE_AUDIT_SCOPES.approval,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.approval, 'button', '加签'), kind: 'action-rule',
      title: '加签必须真实写入审批链和待办，不是成功提示',
      rules: ['加签人确认后生成真实审批节点和待办；审批历史需可追溯加签人、时间、结果。'],
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.allocation]: [
    note({
      id: 'consumable-audit-allocation-detail', pageKey: CONSUMABLE_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.allocation, 'card', '申请耗材明细'),
      title: '单条配给需完整展示申请用途、主资产与MIS结果',
      rules: ['配给单对应一条申请行，应完整带出耗材说明、参考单价、申请用途、申请原因、数量、条件主资产信息、MIS鉴定结果及说明。'],
    }),
    note({
      id: 'consumable-audit-allocation-stock', pageKey: CONSUMABLE_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.allocation, 'button', '匹配耗材'), kind: 'action-rule',
      title: '库存领用必须匹配可实际领用的库存耗材',
      rules: ['匹配状态选择库存领用后必须选择实际库存耗材。', '库存数据不能只按物料说明文本相等过滤，还应满足仓库、可出库状态、锁定等实际库存约束。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-audit-allocation-inventory-submit', pageKey: CONSUMABLE_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.allocation, 'button', '提交'), kind: 'action-rule',
      title: '库存领用提交后生成领用单并通知申请人与匹配前台', priority: 'P0',
      rules: ['配给单状态更新为已完成并生成耗材领用单。', '系统根据申请人公司、末级部门和办公区匹配默认耗材管理员，并通过狐小e/Myfamily通知申请人和前台。'],
    }),
    note({
      id: 'consumable-audit-allocation-purchase-submit', pageKey: CONSUMABLE_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.allocation, 'button', '提交'), kind: 'action-rule',
      title: '统一采购提交后进入正确公司维度的周汇总', priority: 'P0',
      rules: ['统一采购时配给单完成，来源申请行继续处理中。', '汇总维度必须按集团&媒体、视频、焦点、上海分公司、广州分公司分别进入对应草稿，不能全部塞进单一集团&媒体汇总。'],
    }),
    note({
      id: 'consumable-audit-allocation-reject', pageKey: CONSUMABLE_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.allocation, 'button', '驳回'), kind: 'action-rule',
      title: '配给驳回保留ES建议并同步来源申请和通知',
      rules: ['驳回时ES建议必填；配给单和来源申请行均更新为已驳回，并向申请人发送驳回通知。', '“驳回类型”已按现行产品口径下线，不应重新加回页面。'],
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.claimOrdinary]: [
    note({
      id: 'consumable-audit-ordinary-warehouse', pageKey: CONSUMABLE_AUDIT_SCOPES.claimOrdinary,
      target: cardTarget('申请人信息', 'detail-field', '当前仓库'), kind: 'field-rule',
      title: '普通耗材仓库按组织办公区映射，并最终匹配库管员', priority: 'P0',
      rules: ['根据申请人部门、公司、办公区匹配默认仓库，再由仓库描述匹配库管员；无法匹配时兜底杨芊。', '当前库管员仅能选择本人有出库权限的仓库。'],
    }),
    note({
      id: 'consumable-audit-ordinary-material-code', pageKey: CONSUMABLE_AUDIT_SCOPES.claimOrdinary,
      target: cardTarget('申请耗材信息', 'detail-field', '物料编码'), kind: 'field-rule',
      title: '普通耗材按物料编码和数量办理，不生成耗材标签号',
      rules: ['普通耗材使用物料编码识别实际发放物料；耗材标签号为空，不要求序列号或低值耐用品台账卡片。', '数量来源配给/领用单并用于出库数量。'],
    }),
    note({
      id: 'consumable-audit-ordinary-location', pageKey: CONSUMABLE_AUDIT_SCOPES.claimOrdinary,
      target: cardTarget('申请耗材信息', 'detail-field', '城市'), kind: 'field-rule',
      title: '普通耗材领用地点必须完整并按City→Building→Floor级联',
      rules: ['City、Building、Floor均必填；Building随City联动，Floor随Building联动。'],
    }),
    note({
      id: 'consumable-audit-ordinary-confirm', pageKey: CONSUMABLE_AUDIT_SCOPES.claimOrdinary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.claimOrdinary, 'button', '领用确认'), kind: 'action-rule',
      title: '普通耗材领用确认必须进入员工确认状态机', priority: 'P0',
      rules: ['未发起时点击后确认并进入员工耗材领用确认；待确认时主按钮应显示“等待员工确认”且禁用；员工确认后主按钮变为“执行出库”。', '执行出库后生成耗材出库单和事务。'],
    }),
    note({
      id: 'consumable-audit-ordinary-actions', pageKey: CONSUMABLE_AUDIT_SCOPES.claimOrdinary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.claimOrdinary, 'button', '弃领'), kind: 'action-rule',
      title: '弃领、加签和发送通知都必须产生真实业务副作用',
      rules: ['弃领处理意见必填并结束领用单，不生成出库。', '加签人必须具备当前仓库出库权限。', '发送领用通知通过狐小e/Myfamily真实发送给申请人。'],
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.claimLowValue]: [
    note({
      id: 'consumable-audit-lowvalue-warehouse', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: cardTarget('申请人信息', 'detail-field', '当前仓库'), kind: 'field-rule',
      title: '低值耐用品仓库同样按组织办公区和库管员权限匹配', priority: 'P0',
      rules: ['根据申请人部门、公司、办公区匹配默认仓库并匹配库管员，无法匹配时兜底杨芊；仓库候选受当前库管员出库权限限制。'],
    }),
    note({
      id: 'consumable-audit-lowvalue-tag', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: cardTarget('申请耗材信息', 'detail-field', '耗材标签号'), kind: 'field-rule',
      title: '低值耐用品按耗材标签号办理并带出台账信息', priority: 'P0',
      rules: ['低值耐用品必须选择耗材标签号，标签选择后带出序列号、公司、板块、启用日期、实际耗材说明和配置。', '实际选择的低值耐用品必须属于可出库库存并与当前领用要求一致。'],
    }),
    note({
      id: 'consumable-audit-lowvalue-purpose', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: cardTarget('申请耗材信息', 'detail-field', '使用用途'), kind: 'field-rule',
      title: '低值耐用品出库前必须维护最终使用用途',
      rules: ['使用用途为低值耐用品台账更新依据之一；同时维护使用说明，出库后写回卡片。'],
    }),
    note({
      id: 'consumable-audit-lowvalue-main-asset', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.claimLowValue, 'card', '申请耗材信息'),
      title: '关联主资产信息必须在低值耐用品领用页继续展示',
      rules: ['来源申请行有关联主资产时，领用页展示主资产标签号和主资产说明，供后续绑定和报废期处理。'],
    }),
    note({
      id: 'consumable-audit-lowvalue-scrap', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.claimLowValue, 'card', '申请耗材信息'),
      title: '内存/硬盘关联主资产时才出现报废期延长规则', priority: 'P0',
      rules: ['仅低值耐用品小类为内存或硬盘且已关联主资产时展示“是否延长报废期”和“ES实物报废期”。', 'ES实物报废期按资产启用日期+折旧年限+1年计算；勾选延长后出库完成同步更新主资产卡片并绑定耗材。'],
    }),
    note({
      id: 'consumable-audit-lowvalue-confirm', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.claimLowValue, 'button', '领用确认'), kind: 'action-rule',
      title: '低值耐用品确认后必须完成员工确认→执行出库→台账回写', priority: 'P0',
      rules: ['未发起、待员工确认、已确认三个阶段的主按钮状态与普通耗材一致。', '执行出库后生成出库单/事务，并更新低值耐用品责任人、部门、成本中心、费用科目、地点、状态、使用说明等台账字段。'],
    }),
    note({
      id: 'consumable-audit-lowvalue-actions', pageKey: CONSUMABLE_AUDIT_SCOPES.claimLowValue,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.claimLowValue, 'button', '弃领'), kind: 'action-rule',
      title: '低值耐用品弃领/加签/通知也必须真实落业务状态',
      rules: ['弃领处理意见必填且不出库；加签仅允许当前仓库有出库权限人员；通知需真实发送，不以toast作为完成依据。'],
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.confirm]: [
    note({
      id: 'consumable-audit-confirm-read', pageKey: CONSUMABLE_AUDIT_SCOPES.confirm,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.confirm, 'card', '确认提示及保管职责'),
      title: '员工必须勾选已阅读确认后才能刷卡或扫码', priority: 'P0',
      rules: ['保管职责完整红字展示；必须有“已阅读确认”复选框，未勾选时刷卡、手工工号和二维码确认均不可执行。'],
    }),
    note({
      id: 'consumable-audit-confirm-identity', pageKey: CONSUMABLE_AUDIT_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认'), kind: 'action-rule',
      title: '刷卡/工号确认必须校验领用人工号',
      rules: ['员工工号与领用单申请人不一致时提示“员工工号不匹配！”并禁止确认；狐小e扫码也必须返回真实登录员工身份做同样校验。'],
    }),
    note({
      id: 'consumable-audit-confirm-result', pageKey: CONSUMABLE_AUDIT_SCOPES.confirm,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '确认成功记录账号、时间、方式和结果，但出库由库管员继续执行',
      rules: ['成功后持久化确认员工、确认时间、确认方式和已确认结果。', '确认完成后返回领用办理，主按钮进入“执行出库”，不得在员工确认页伪造已完成出库。'],
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.summary]: [
    note({
      id: 'consumable-audit-summary-company', pageKey: CONSUMABLE_AUDIT_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.summary, 'card', '耗材汇总'),
      title: '统一采购按五类公司维度进入每周汇总',
      rules: ['分别按集团&媒体、视频、焦点、上海分公司、广州分公司汇总统一采购配给单；汇总周期按当前周计算，被驳回重提时保留原汇总发起周期。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-audit-summary-line-reject', pageKey: CONSUMABLE_AUDIT_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.summary, 'button', '驳回'), kind: 'action-rule',
      title: '汇总驳回应按明细行处理并保留ES建议',
      rules: ['每条统一采购明细可独立维护ES建议并驳回该行，不应按申请人一次驳回多条无关明细。', '驳回不清空已填写的ES汇总说明/项目用途，并向申请人通知ES建议。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-audit-summary-required', pageKey: CONSUMABLE_AUDIT_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.summary, 'button', '提交'), kind: 'action-rule',
      title: '汇总提交前校验说明/用途并锁定编辑', priority: 'P0',
      rules: ['ES汇总说明和项目用途说明必填；两者按周周期、公司、数量、金额规则默认生成并允许修改。', '提交后汇总单进入ES主管审批并不可编辑，项目用途同步PR系统。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-audit-summary-attachment', pageKey: CONSUMABLE_AUDIT_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.summary, 'card', '附件信息'),
      title: '汇总附件属于业务单据数据，不能只停留在页面fileList',
      rules: ['附件不限格式并随汇总申请持久化；保存草稿、提交审批后都应能继续查看。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-audit-summary-po', pageKey: CONSUMABLE_AUDIT_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.summary, 'card', '申请明细'),
      title: '最终采购需唯一行ID并接收PO单号/状态回写',
      rules: ['推送采购系统的每一行必须带唯一行ID，以支持采购拆单后的回写关联。', '采购系统返回PO单号和PO状态后展示PO信息Card；无数据时隐藏。'], availability: 'dynamic',
    }),
  ],

  [CONSUMABLE_AUDIT_SCOPES.summaryApproval]: [
    note({
      id: 'consumable-audit-summary-approval-content', pageKey: CONSUMABLE_AUDIT_SCOPES.summaryApproval,
      target: scopeTarget(CONSUMABLE_AUDIT_SCOPES.summaryApproval, 'card', 'ES汇总说明'),
      title: '汇总审批应能核对完整汇总说明、项目用途和申请明细',
      rules: ['审批人需看到汇总说明、项目用途、部门汇总和申请明细，不能只展示部分汇总上下文。'],
    }),
    note({
      id: 'consumable-audit-summary-approval-final', pageKey: CONSUMABLE_AUDIT_SCOPES.summaryApproval,
      target: cardTarget('审批信息', 'button', '同意'), kind: 'action-rule',
      title: 'ES总监最终同意必须真实推送采购并通知申请人', priority: 'P0',
      rules: ['ES主管同意进入ES总监；ES总监同意后推送采购系统。', '审批完成后通知耗材申请人已进入采购环节，并在申请/配给/汇总页面展示采购和PR进展。'],
    }),
    note({
      id: 'consumable-audit-summary-approval-reject', pageKey: CONSUMABLE_AUDIT_SCOPES.summaryApproval,
      target: cardTarget('审批信息', 'button', '驳回'), kind: 'action-rule',
      title: '任一汇总审批驳回都返回草稿并通知汇总人',
      rules: ['驳回时审批意见必填；任一节点驳回将汇总单返回ES汇总草稿，保留已填内容并通知汇总人。'],
    }),
  ],
};

export const consumableAuditCoverageByScope = {
  [CONSUMABLE_AUDIT_SCOPES.apply]: [
    bound('CO2-AP-001', '8.1.2/8.1.4', '申请须知', '首次进入强制阅读，只允许已阅读关闭。', 'consumable-audit-apply-notice', '::button::'),
    review('CO2-AP-002', '6/8.1.4', '耗材物料范围', '耗材页签只展示低值耐用品和普通耗材。', '当前 AssetStoreModal 只有统一 consumable 类型，未体现低值耐用品/普通耗材物料属性和范围校验。', 'consumable-audit-apply-scope'),
    bound('CO2-AP-003', '6', '不做超标', '耗材申请不设置个人或部门超标限制。', 'consumable-audit-apply-scope'),
    review('CO2-AP-004', '6/8.1.3', '主资产条件展示', '仅物料配置要求关联主资产时才展示并必填。', '当前 validate 对所有 type=consumable 明细统一强制 relatedAsset，范围过宽。', 'consumable-audit-apply-main-asset-condition'),
    review('CO2-AP-005', '6/8.1.3', '主资产固定过滤', '候选仅本人名下在用-使用中资产并按主资产物料小类继续过滤。', '当前 RelatedAssetSelectModal 直接展示 MY_EXISTING_ASSETS，未按状态和主资产物料小类过滤。', 'consumable-audit-apply-main-asset-condition'),
    review('CO2-AP-006', '8.1.3', '申请用途枚举', '耗材用途为日常办公/特殊项目/提升配置/部门公共设备。', '当前共享页沿用资产 APPLICATION_PURPOSE_OPTIONS：员工用机/部门公用/其他用途/专业用途，与耗材PRD不一致。', 'consumable-audit-apply-purpose'),
    bound('CO2-AP-007', '6/8.1.4', '重复耗材合并', '重复选择不新增行，原行数量+1并提示。', 'consumable-audit-apply-scope'),
    review('CO2-AP-008', '8.1.4', '预览条件校验', '预览前按耗材条件规则校验所有必填。', '当前预览会把全部 consumable 强制要求关联主资产，与条件必填口径不一致。', 'consumable-audit-apply-preview'),
    bound('CO2-AP-009', '8.1.4', '预览只读', '预览页只读并仅保留上一步/提交。', 'consumable-audit-apply-preview', '::button::'),
    review('CO2-AP-010', '8.1.1', '资产耗材拆单', '同页混合申请提交后资产与耗材拆成不同业务申请单。', '当前 buildApplication 将所有 materials 一起写入 employeeSelfService 资产申请数据，没有资产/耗材拆单。', 'consumable-audit-apply-submit-route'),
    review('CO2-AP-011', '6/8.1.4', '耗材MIS路由', '耗材存在MIS审核行整单进入MIS，否则进入5级审批。', '当前共享页提交调用 addEmployeeSelfServiceApplication，没有接 createConsumableApplication 和 requiresMis 路由。', 'consumable-audit-apply-submit-route'),
    review('CO2-AP-012', '10', '提交通知', '申请提交和后续待办通过狐小e/Myfamily发送。', '当前共享页提交仅 message.success，未看到耗材工作流通知。', 'consumable-audit-apply-submit-route'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.mis]: [
    bound('CO2-MI-001', '8.2', '可见行', '只展示需要MIS审核的申请行。', 'consumable-audit-mis-row-content'),
    review('CO2-MI-002', '8.2.3', '申请用途', 'MIS行需展示申请用途。', '当前 MIS 表格没有申请用途列，只有申请原因和详细说明。', 'consumable-audit-mis-row-content'),
    bound('CO2-MI-003', '8.2.3', '主资产字段', '有关联主资产时展示标签号和说明。', 'consumable-audit-mis-row-content'),
    bound('CO2-MI-004', '8.2.3', 'MIS意见枚举', '每行必选鉴定通过/鉴定不通过。', 'consumable-audit-mis-mixed-result', '::table-column::'),
    review('CO2-MI-005', '6/8.2.4/9.1', '部分不通过', '同一单允许部分行鉴定不通过，其余有效行进入5级审批。', '当前 decide 同意要求全部可见行=鉴定通过，驳回要求全部=鉴定不通过，混合结果无法提交。', 'consumable-audit-mis-mixed-result'),
    review('CO2-MI-006', '8.2.3/8.2.4', '意见说明口径', '不通过必填还是所有行必填需统一PRD口径。', 'PRD字段定义和操作校验本身存在交叉描述；当前实现强制所有可见行填写。', 'consumable-audit-mis-description'),
    bound('CO2-MI-007', '8.2.4', '全部驳回结束', '全部申请行已驳回时整单已驳回并结束。', 'consumable-audit-mis-mixed-result'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.approval]: [
    bound('CO2-AU-001', '8.3', '整单审批', '直属5级及以上领导查看整单并整单决策。', 'consumable-audit-approval-lines'),
    bound('CO2-AU-002', '8.3.3', '一行一配给单', '同意后仅有效行一行生成一张配给单。', 'consumable-audit-approval-lines'),
    bound('CO2-AU-003', '8.3.3', '整单驳回', '驳回时意见必填，全部有效行已驳回。', 'consumable-approval-reject', '::button::'),
    review('CO2-AU-004', '8.3.3', '加签真实节点', '加签必须生成真实审批节点和待办。', '当前加签弹窗确认后只 message.success，没有写 workflow/history。', 'consumable-audit-approval-countersign'),
    review('CO2-AU-005', '10', '审批通知', '审批待办及领导驳回通过服务号通知。', '当前 service 只更新本地工作流状态，未见通知实现。'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.allocation]: [
    review('CO2-AL-001', '8.4.4', '申请用途', '单条配给需展示来源申请用途。', '当前 ConsumableAllocationPage detailColumns 没有申请用途字段。', 'consumable-audit-allocation-detail'),
    bound('CO2-AL-002', '8.4.4', '主资产/MIS信息', '主资产和MIS结果/说明按来源申请行展示。', 'consumable-audit-allocation-detail'),
    review('CO2-AL-003', '8.4.5', '库存匹配约束', '库存领用应匹配可出库且符合仓库/锁定等条件的实际耗材。', '当前库存弹窗仅按 materialDesc 相等过滤 CONSUMABLE_STOCK。', 'consumable-audit-allocation-stock'),
    bound('CO2-AL-004', '8.4.5', '库存领用必选库存', '库存领用提交前必须匹配耗材。', 'consumable-audit-allocation-stock', '::button::'),
    review('CO2-AL-005', '8.4.4/10', '库存通知', '库存领用提交后通知申请人和按组织办公区匹配的ES前台。', '当前 submitAllocationDecision 创建 claim，但未见狐小e/Myfamily通知和前台动态匹配。', 'consumable-audit-allocation-inventory-submit'),
    review('CO2-AL-006', '4.4/8.4.5', '统一采购公司汇总', '统一采购按五类公司维度进入对应周汇总。', '当前 appendSummaryRow 固定寻找 company=集团&媒体 的草稿，其它公司维度没有分流。', 'consumable-audit-allocation-purchase-submit'),
    bound('CO2-AL-007', '8.4.5', '驳回ES建议', '配给驳回时ES建议必填。', 'consumable-audit-allocation-reject', '::button::'),
    review('CO2-AL-008', '8.4.5/10', '驳回通知', '配给驳回同步来源申请行并通知申请人。', '当前 service 更新状态但未见通知实现。', 'consumable-audit-allocation-reject'),
    skip('CO2-AL-009', '8.4.5', '驳回类型', '现行产品口径已下线耗材配给“驳回类型”字段。', '以当前产品确认口径为准，不把PRD旧字段作为页面缺陷。'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.claimOrdinary]: [
    review('CO2-OC-001', '8.5.2/8.5.4', '仓库映射', '普通耗材按部门/公司/办公区匹配仓库及库管员，无匹配兜底杨芊。', '方案一 WAREHOUSE_OPTIONS 为固定列表，没有组织映射、权限和库管员兜底。', 'consumable-audit-ordinary-warehouse'),
    bound('CO2-OC-002', '6/8.5.4', '物料编码', '普通耗材使用物料编码办理且无耗材标签号。', 'consumable-audit-ordinary-material-code', '::detail-field::'),
    bound('CO2-OC-003', '8.5.4', '数量', '普通耗材按领用单数量办理出库。', 'consumable-audit-ordinary-material-code'),
    review('CO2-OC-004', '8.5.4', '地点级联', 'City/Building/Floor必填且联动。', '方案一三个Select使用固定独立选项，修改City不会清空/过滤Building和Floor。', 'consumable-audit-ordinary-location'),
    review('CO2-OC-005', '8.5.5', '领用状态机', '未发起→待确认禁用→已确认执行出库。', '方案一只有固定“领用确认”按钮，点击仅toast，没有待确认/执行出库状态机。', 'consumable-audit-ordinary-confirm'),
    review('CO2-OC-006', '8.5.5', '真实出库', '执行出库生成耗材出库单和事务。', '方案一没有service调用，提交只message.success。', 'consumable-audit-ordinary-confirm'),
    review('CO2-OC-007', '8.5.5', '弃领', '弃领处理意见必填并结束单据、不出库。', '方案一弃领直接 handleAction toast，没有处理意见和状态更新。', 'consumable-audit-ordinary-actions'),
    review('CO2-OC-008', '8.5.5/10', '加签/通知', '加签校验仓库权限；发送真实领用通知。', '方案一两项操作均为toast，没有权限或通知实现。', 'consumable-audit-ordinary-actions'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.claimLowValue]: [
    review('CO2-LV-001', '8.5.2/8.5.4', '仓库映射', '低值耐用品按部门/公司/办公区匹配仓库及库管员，无匹配兜底杨芊。', '方案二仓库为固定列表，没有组织映射、权限和库管员兜底。', 'consumable-audit-lowvalue-warehouse'),
    bound('CO2-LV-002', '6/8.5.4', '耗材标签号', '低值耐用品按耗材标签号办理并展示序列号。', 'consumable-audit-lowvalue-tag', '::detail-field::'),
    review('CO2-LV-003', '8.5.4', '标签选择/台账回填', '标签号应从库存选择并自动带出序列号、公司、板块、启用日期等。', '方案二耗材标签号目前是可自由编辑Input，页面数据为静态，不是库存选择回填。', 'consumable-audit-lowvalue-tag'),
    bound('CO2-LV-004', '8.5.4', '使用用途', '低值耐用品维护最终使用用途和使用说明。', 'consumable-audit-lowvalue-purpose', '::detail-field::'),
    review('CO2-LV-005', '8.5.4', '主资产信息', '来源申请有关联主资产时展示标签号和说明。', '方案二页面没有主资产标签号/主资产说明字段。', 'consumable-audit-lowvalue-main-asset'),
    review('CO2-LV-006', '6/8.5.4/8.6.4', '报废期延长', '内存/硬盘且关联主资产时展示延长报废期和ES实物报废期，并在出库后更新主资产。', '方案二没有这两个条件字段及后续主资产更新。', 'consumable-audit-lowvalue-scrap'),
    review('CO2-LV-007', '8.5.4', '地点级联', 'City/Building/Floor必填且联动。', '方案二三个Select仍是独立固定选项，没有级联。'),
    review('CO2-LV-008', '8.5.5', '领用状态机', '未发起→待确认禁用→已确认执行出库。', '方案二固定显示“领用确认”，点击仅toast。', 'consumable-audit-lowvalue-confirm'),
    review('CO2-LV-009', '8.6.4', '低值台账回写', '出库更新责任人、部门、成本中心、费用科目、地点、状态、使用说明等卡片信息。', '方案二没有service或台账更新实现。', 'consumable-audit-lowvalue-confirm'),
    review('CO2-LV-010', '8.5.5/10', '弃领/加签/通知', '弃领真实结束；加签校验仓库权限；发送真实通知。', '方案二相关按钮均只调用handleAction toast。', 'consumable-audit-lowvalue-actions'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.confirm]: [
    bound('CO2-CF-001', '8.6.3', '保管职责', '确认前完整展示耗材保管职责。', 'consumable-audit-confirm-read'),
    review('CO2-CF-002', '8.6.3', '已阅读确认', '未勾选已阅读确认不可刷卡/扫码。', '当前员工耗材确认页没有已阅读确认复选框。', 'consumable-audit-confirm-read'),
    bound('CO2-CF-003', '8.6.3', '工号校验', '刷卡/手工工号必须与申请人一致。', 'consumable-audit-confirm-identity', '::button::'),
    review('CO2-CF-004', '8.6.3', '扫码身份', '狐小e扫码需以真实登录员工身份校验。', '当前二维码点击直接把 current.applicant.id 作为确认人传入，属于模拟确认，未验证真实扫码用户。', 'consumable-audit-confirm-identity'),
    bound('CO2-CF-005', '8.6.3', '确认记录', '确认成功记录工号、时间、方式和结果。', 'consumable-audit-confirm-result'),
    bound('CO2-CF-006', '8.5.5/8.6.4', '确认后返回办理', '员工确认后由库管员继续执行出库。', 'consumable-audit-confirm-result'),
    review('CO2-CF-007', '8.6.4', '真实出库/台账', '执行出库需真正生成出库单/事务并更新低值耐用品卡片。', '当前 completeConsumableClaim 只更新claim状态并追加“已生成耗材出库单”历史文本，没有出库单对象或台账回写。'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.summary]: [
    review('CO2-SM-001', '4.4/8.7', '公司汇总维度', '统一采购按五类公司分别每周汇总。', '当前 service appendSummaryRow 固定写入集团&媒体草稿。', 'consumable-audit-summary-company'),
    review('CO2-SM-002', '8.7.3/8.7.4', '明细行驳回', '每条采购明细独立驳回并保留ES建议。', '当前 rejectApplicant 按 applicationId+applicant 将该申请人的多条行一起置为驳回。', 'consumable-audit-summary-line-reject'),
    review('CO2-SM-003', '8.7.4/10', '驳回通知', '明细驳回通知申请人并带ES建议，已填汇总说明/项目用途不清空。', '当前仅本地标记并message.warning，没有通知实现。', 'consumable-audit-summary-line-reject'),
    review('CO2-SM-004', '8.7.3', 'ES汇总说明默认生成', '按周周期、公司、数量、金额默认生成且必填。', '当前页面可以编辑 summaryDescription，但 submit 前没有必填校验，默认值依赖mock。', 'consumable-audit-summary-required'),
    review('CO2-SM-005', '8.7.3', '项目用途必填/PR同步', '项目用途默认生成、必填、可修改并同步PR。', '当前 submit 前无必填校验，且没有真实PR系统同步。', 'consumable-audit-summary-required'),
    bound('CO2-SM-006', '8.7.3', '数量金额实时汇总', '只统计通过行数量和预计费用。', 'consumable-audit-summary-required'),
    review('CO2-SM-007', '8.7.3', '附件持久化', '附件不限格式且随汇总单保存/提交。', '当前 fileList 仅React state，updateSummary/submitSummary没有保存附件。', 'consumable-audit-summary-attachment'),
    bound('CO2-SM-008', '8.7.3', '导出', '支持导出汇总申请明细。', 'consumable-audit-summary-required'),
    bound('CO2-SM-009', '8.7.4', '提交锁定', '提交后进入ES主管审批并不可编辑。', 'consumable-audit-summary-required', '::button::'),
    review('CO2-SM-010', '8.7.3/8.8.3/10', '唯一行ID/采购推送', '采购推送每行携带唯一ID并可接收拆单回写。', '当前只在本地summary row生成id，没有真实采购推送契约。', 'consumable-audit-summary-po'),
    review('CO2-SM-011', '8.7.3', 'PO信息Card', '采购回传PO单号/状态后展示，无数据时隐藏。', '当前正式 ConsumableSummaryPage 没有PO信息Card。', 'consumable-audit-summary-po'),
  ],
  [CONSUMABLE_AUDIT_SCOPES.summaryApproval]: [
    review('CO2-SA-001', '8.8.2', '审批完整上下文', '审批页展示汇总信息、项目用途、申请明细和审批信息。', '当前审批页展示ES汇总说明、部门汇总和申请明细，但没有项目用途说明。', 'consumable-audit-summary-approval-content'),
    bound('CO2-SA-002', '8.8.3', '主管→总监', 'ES主管同意后进入ES总监。', 'consumable-audit-summary-approval-final', '::button::'),
    review('CO2-SA-003', '8.8.3/10', '总监推采购', 'ES总监同意后真实推送采购系统。', '当前 approveSummary 只把 currentNode 改为采购系统并注入mock PO，没有真实外部调用。', 'consumable-audit-summary-approval-final'),
    review('CO2-SA-004', '8.8.3/10', '审批完成通知/进度', '通知申请人进入采购环节，并展示采购/PR全流程进度。', '当前没有通知或采购/PR进度联动。', 'consumable-audit-summary-approval-final'),
    bound('CO2-SA-005', '8.8.3', '驳回回草稿', '任一节点驳回返回ES汇总草稿，审批意见必填。', 'consumable-audit-summary-approval-reject', '::button::'),
    review('CO2-SA-006', '8.8.3', '驳回通知汇总人', '驳回后通知ES汇总人继续修改。', '当前 approveSummary 会返回草稿并追加历史，但未见通知实现。', 'consumable-audit-summary-approval-reject'),
  ],
};

const COVERAGE_STATUS_OVERRIDES = {
  'CO-AP-001': { status: 'review', reason: '共享页把所有 consumable 都强制要求关联主资产，而PRD要求由物料配置条件决定；且主资产弹窗没有完整固定过滤。' },
  'CO-AP-003': { status: 'review', reason: '共享页提交仍走 employeeSelfService 资产申请数据，没有接耗材 createConsumableApplication/MIS 路由。' },
  'CO-AP-004': { status: 'bound', reason: undefined },
  'CO-AL-004': { status: 'skip', reason: '现行产品口径已明确下线耗材配给驳回类型字段，不再作为缺陷。', annotationId: undefined },
  'CO-CF-004': { status: 'review', reason: '确认记录已有实现，但真正的耗材出库单、事务及低值耐用品台账回写仍未实现。' },
  'CO-SM-001': { status: 'review', reason: '当前汇总驳回按申请人/申请单批量标记，PRD要求按明细行处理；通知也未实现。' },
  'CO-SM-002': { status: 'review', reason: '页面有ES汇总说明，但提交前未校验必填，默认生成主要依赖mock数据。' },
  'CO-SM-003': { status: 'review', reason: '页面有项目用途，但提交前未校验必填，也没有真实同步PR系统。' },
  'CO-SA-002': { status: 'review', reason: '主管→总监本地状态可流转，但总监完成后并未真实推送采购系统。' },
};

function mergeScopeMaps(baseByScope = {}, additionsByScope = {}) {
  const result = {};
  const scopes = new Set([...Object.keys(baseByScope || {}), ...Object.keys(additionsByScope || {})]);
  scopes.forEach((pageScope) => {
    if (pageScope === LEGACY_CLAIM_SCOPE) return;
    result[pageScope] = [...(baseByScope[pageScope] || []), ...(additionsByScope[pageScope] || [])];
  });
  return result;
}

function correctCoverage(baseByScope = {}) {
  return Object.fromEntries(Object.entries(baseByScope || {})
    .filter(([pageScope]) => pageScope !== LEGACY_CLAIM_SCOPE)
    .map(([pageScope, requirements]) => [
      pageScope,
      (requirements || []).map((requirement) => {
        const override = COVERAGE_STATUS_OVERRIDES[requirement.id];
        if (!override) return requirement;
        const next = { ...requirement, ...override };
        if (override.reason === undefined) delete next.reason;
        if (override.annotationId === undefined && override.status === 'skip') delete next.annotationId;
        return next;
      }),
    ]));
}

export function applyConsumableAnnotationAudit(baseByScope = {}) {
  return mergeScopeMaps(baseByScope, consumableAuditAnnotationsByScope);
}

export function applyConsumableCoverageAudit(baseByScope = {}) {
  return mergeScopeMaps(correctCoverage(baseByScope), consumableAuditCoverageByScope);
}

export default consumableAuditAnnotationsByScope;
