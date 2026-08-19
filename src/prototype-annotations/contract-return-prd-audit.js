// 合约号码退库第二轮 PRD 深审补充。
// 第一轮已有申请/办理/员工确认三页基础标注；本层补充正式员工准入、仓库/库管员映射、真实号码入库、台账清理、通知及核心入库页。

import { CONTRACT_RETURN_SCOPES } from './employee-self-service-expanded-annotations';

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

const scopeTarget = (pageScope, kind, label) => `scope-${stableKey(pageScope)}::${kind}::${stableKey(label)}`;
const cardTarget = (cardTitle, kind, label) => `card-${stableKey(cardTitle)}::${kind}::${stableKey(label)}`;
const prdItem = (text) => ({ text, source: 'prd' });

function note({ id, pageKey, target, kind = 'business-rule', title, rules, priority = 'P1', availability }) {
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

export const CONTRACT_RETURN_AUDIT_SCOPES = {
  ...CONTRACT_RETURN_SCOPES,
  inbound: 'route:/yewurules::库存管理::入库',
};

const annotations = {
  [CONTRACT_RETURN_SCOPES.apply]: [
    note({
      id: 'contract-return-audit-eligibility',
      pageKey: CONTRACT_RETURN_SCOPES.apply,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.apply, 'card', '合约号码明细'),
      title: '退库准入需校验正式员工、本人归属、在用状态与业务锁',
      priority: 'P0',
      rules: [
        '仅正式员工可发起合约号码退库。',
        '候选号码必须仍归属当前申请人、状态为“在用”，且未被其他号码退库流程锁定。',
        '提交时必须再次校验号码归属和状态，不能只依赖打开弹窗时的快照。',
      ],
    }),
    note({
      id: 'contract-return-audit-split-routing',
      pageKey: CONTRACT_RETURN_SCOPES.apply,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交后一号一单并独立生成号码库管员待办',
      priority: 'P0',
      rules: [
        '多选提交后每个号码生成一张独立退库申请单，独立员工确认、独立入库。',
        '根据申请人公司+办公区匹配默认号码仓库，再从该仓库具有入库权限的号码库管员中生成待办。',
      ],
    }),
    note({
      id: 'contract-return-audit-submit-notice',
      pageKey: CONTRACT_RETURN_SCOPES.apply,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交成功需通知办理地点、仓库和联系人',
      rules: ['服务号同时通知申请人和匹配库管员，包含申请单号、办理地点、默认仓库、联系人及联系方式。'],
    }),
    note({
      id: 'contract-return-audit-return-action',
      pageKey: CONTRACT_RETURN_SCOPES.apply,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.apply, 'button', '返回'),
      kind: 'action-rule',
      title: '返回只退出页面，不应等同于清空表单',
      rules: ['PRD定义“返回上一页，不提交”；是否保留未提交草稿按统一工作台规则处理，不应把返回按钮实现成纯reset。'],
    }),
  ],

  [CONTRACT_RETURN_SCOPES.handling]: [
    note({
      id: 'contract-return-audit-handling-info',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'card', '申请人信息'),
      title: '办理页需完整展示申请快照与单据状态',
      rules: ['展示处理中状态、申请人、公司、板块、成本中心、部门、办公区、联系电话、申请时间和退库原因。'],
    }),
    note({
      id: 'contract-return-audit-warehouse',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '退库仓库'),
      kind: 'field-rule',
      title: '号码仓库按公司+办公区匹配并受当前库管员权限限制',
      priority: 'P0',
      rules: [
        '默认仓库按申请人公司+办公区匹配，PRD默认示例为 I10086-集团合约机库（新媒体）。',
        '下拉仅允许当前办理人具有入库权限的号码仓库。',
      ],
    }),
    note({
      id: 'contract-return-audit-responsible',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '责任人'),
      kind: 'field-rule',
      title: '责任人随最终仓库映射虚拟库管员',
      rules: ['责任人只读，按最终所选号码仓库映射对应虚拟库管员，不应固定显示泛化的“号码库管员”。'],
    }),
    note({
      id: 'contract-return-audit-usage-note',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '使用说明'),
      kind: 'field-rule',
      title: '使用说明应从号码台账带出并在正常退还后反写',
      rules: ['打开办理页时带出合约号码台账现有使用说明；办理人可修改，正常入库后将最终值写回号码台账。'],
    }),
    note({
      id: 'contract-return-audit-primary',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'button', '退库确认'),
      kind: 'action-rule',
      title: '退库确认→等待员工确认→确认入库分阶段处理',
      priority: 'P0',
      rules: [
        '未发起时进入员工号码退库确认；待确认时主按钮必须禁用；员工已确认后才允许号码入库。',
        '每张退库单只进行一次员工确认，确认记录必须与当前单据一一对应。',
      ],
    }),
    note({
      id: 'contract-return-audit-inbound-ledger',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'card', '退库合约号码信息'),
      title: '正常退还必须生成真实入库单并更新号码台账',
      priority: 'P0',
      rules: [
        '生成核心号码入库单并关联号码退库申请单号。',
        '号码状态更新为“在库（旧）”，仓库更新为最终所选仓库，责任人更新为仓库虚拟库管员。',
        '清空子公司、员工职级、领用日期、申请类型；部门更新为虚拟库管员所在虚拟组织。',
        '生成合约号码退库及入库操作历史，单据终态为“已完成”。',
      ],
    }),
    note({
      id: 'contract-return-audit-reject',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'button', '驳回'),
      kind: 'action-rule',
      title: '驳回只结束退库单，不得修改原号码台账',
      priority: 'P0',
      rules: ['驳回原因必填；单据已驳回；号码原状态、原责任人、原仓库和员工领用信息保持不变，不生成入库单。'],
    }),
    note({
      id: 'contract-return-audit-notifications',
      pageKey: CONTRACT_RETURN_SCOPES.handling,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'card', '审批信息'),
      title: '库管员驳回和正常完成都需要服务号通知',
      rules: [
        '驳回后通知申请人申请单号、号码和驳回原因。',
        '正常退还完成后通知申请人号码退库已完成及申请单号。',
      ],
    }),
  ],

  [CONTRACT_RETURN_SCOPES.confirm]: [
    note({
      id: 'contract-return-audit-confirm-copy',
      pageKey: CONTRACT_RETURN_SCOPES.confirm,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.confirm, 'card', '退库确认提示'),
      title: '确认文案必须明确实体电话卡已交还库管员',
      priority: 'P0',
      rules: ['员工确认的是实体电话卡的实际交还事实，不能只确认页面号码信息。'],
    }),
    note({
      id: 'contract-return-audit-confirm-identity',
      pageKey: CONTRACT_RETURN_SCOPES.confirm,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '三种确认方式均需取得真实确认人工号并与申请人一致',
      priority: 'P0',
      rules: [
        '刷卡读取实际员工卡身份；手工录入使用办理人员实际输入工号；狐小e扫码取得真实扫码账号。',
        '任一方式工号与申请人工号不一致时提示“员工工号不匹配！”，不得记录确认成功。',
      ],
    }),
    note({
      id: 'contract-return-audit-confirm-record',
      pageKey: CONTRACT_RETURN_SCOPES.confirm,
      target: scopeTarget(CONTRACT_RETURN_SCOPES.confirm, 'button', '确认'),
      kind: 'action-rule',
      title: '确认成功记录方式、工号和时间并回传办理页',
      rules: ['确认成功后记录确认方式、确认工号、确认时间，并将当前退库单恢复到号码退库办理节点，允许库管员执行入库。'],
    }),
  ],

  [CONTRACT_RETURN_AUDIT_SCOPES.inbound]: [
    note({
      id: 'contract-return-audit-inbound-list',
      pageKey: CONTRACT_RETURN_AUDIT_SCOPES.inbound,
      target: scopeTarget(CONTRACT_RETURN_AUDIT_SCOPES.inbound, 'card', '入库单列表'),
      title: '号码退库结果复用核心入库页面查询',
      rules: ['正常退还生成的号码入库单应在核心“入库”页面可按入库单号、来源申请单号等条件查询。'],
    }),
    note({
      id: 'contract-return-audit-inbound-detail',
      pageKey: CONTRACT_RETURN_AUDIT_SCOPES.inbound,
      target: scopeTarget(CONTRACT_RETURN_AUDIT_SCOPES.inbound, 'card', '入库单列表'),
      title: '号码入库详情需保留申请、号码和员工确认审计字段',
      priority: 'P0',
      rules: [
        '详情展示入库单号、退库申请单号、制单人/时间、申请人/公司/部门/办公区。',
        '展示合约号码、标签号、说明、合约期限、金额、备注、最终仓库。',
        '展示员工确认方式、工号、时间及办理备注/附件。',
      ],
    }),
    note({
      id: 'contract-return-audit-inbound-print',
      pageKey: CONTRACT_RETURN_AUDIT_SCOPES.inbound,
      target: scopeTarget(CONTRACT_RETURN_AUDIT_SCOPES.inbound, 'button', '批量打印'),
      kind: 'action-rule',
      title: '号码入库单支持真实套打与审计留痕',
      rules: ['打印复用核心入库单套打模板；打印应基于真实号码入库单数据，而非仅记录前端提示。'],
    }),
  ],
};

const coverage = {
  [CONTRACT_RETURN_SCOPES.apply]: [
    review('CR2-AP-001', '2/6.1', '正式员工准入', '仅正式员工可发起合约号码退库。', '当前页面/服务没有正式员工身份字段或准入校验。', 'contract-return-audit-eligibility'),
    review('CR2-AP-002', '4.1/6.2', '本人号码归属', '候选号码与提交号码必须仍归属当前申请人。', '当前 getEmployeeContractNumbers 返回固定当前用户mock列表，但号码记录没有责任人工号，无法验证真实归属校验。', 'contract-return-audit-eligibility'),
    bound('CR2-AP-003', '4.1/6.2', '号码状态', '只允许状态为“在用”的号码。', 'contract-return-audit-eligibility'),
    review('CR2-AP-004', '4.1', '业务锁', '处理中号码退库应阻止同一号码重复发起。', '当前 businessLocked 通过“是否存在处理中退库单”动态推导，不是号码台账上的持久化业务锁。', 'contract-return-audit-eligibility'),
    bound('CR2-AP-005', '1/4.1', '单选/多选', '支持本人号码单选或多选发起。', 'contract-return-add'),
    bound('CR2-AP-006', '1/4.1/6.2', '一号一单', '多选提交后一个号码生成一张独立退库单。', 'contract-return-audit-split-routing', '::button::'),
    review('CR2-AP-007', '4.1/4.2', '独立库管员待办', '每张单独匹配仓库/库管员并生成待办。', '当前 createContractReturnApplications 只把 currentNode 设为号码退库办理，没有处理人字段或真实待办对象。', 'contract-return-audit-split-routing'),
    review('CR2-AP-008', '4.2/6.2', '默认仓库匹配', '按申请人公司+办公区匹配默认号码仓库。', '当前创建单据固定写“北京总部号码仓”。', 'contract-return-audit-split-routing'),
    review('CR2-AP-009', '4.2/6.2', '库管员匹配', '根据默认仓库匹配具有入库权限的号码库管员。', '当前申请模型没有库管员处理人字段，也没有仓库权限查询。', 'contract-return-audit-split-routing'),
    bound('CR2-AP-010', '6.1/6.2', '退库原因', '退库原因必填且最多400字。', 'contract-return-reason', '::detail-field::'),
    bound('CR2-AP-011', '6.1', '申请人/部门', '申请页展示申请人和完整部门路径。', 'contract-return-reason'),
    bound('CR2-AP-012', '6.1', '申请时间', '提交时记录申请时间。', 'contract-return-audit-split-routing'),
    bound('CR2-AP-013', '6.2', '提交重校验', '提交时再次校验至少一行、原因、号码状态和业务锁。', 'contract-return-audit-split-routing'),
    review('CR2-AP-014', '6.2/10', '提交服务号通知', '通知申请人和匹配库管员办理地点、仓库、联系人和联系方式。', '当前只有message.success，没有服务号通知、发送结果或失败重试记录。', 'contract-return-audit-submit-notice'),
    review('CR2-AP-015', '6.2', '返回', '返回上一页且不提交。', '当前“返回”按钮调用reset，只清空选择和原因，并没有返回上一页。', 'contract-return-audit-return-action'),
    bound('CR2-AP-016', '4.1', '处理中状态', '提交后单据进入处理中。', 'contract-return-audit-split-routing'),
  ],

  [CONTRACT_RETURN_SCOPES.handling]: [
    review('CR2-HD-001', '7.1', '单据状态展示', '办理页展示“处理中”状态标签。', '当前页面标题区只展示退库单号，没有独立单据状态字段。', 'contract-return-audit-handling-info'),
    review('CR2-HD-002', '7.1', '完整申请快照', '展示申请人、公司、板块、成本中心、部门、办公区、联系电话、申请时间、退库原因。', '大部分字段已展示，但页面使用“申请日期”而非日期时间，未完整展示提交时间。', 'contract-return-audit-handling-info'),
    bound('CR2-HD-003', '7.2', '号码基础信息', '展示合约号码、合约号码说明和号码状态。', 'contract-return-ledger'),
    review('CR2-HD-004', '4.2/7.2', '默认号码仓库', '按公司+办公区匹配，默认示例I10086-集团合约机库（新媒体）。', '当前默认“北京总部号码仓”，与PRD命名及映射规则不一致。', 'contract-return-audit-warehouse'),
    review('CR2-HD-005', '4.2/7.2', '仓库入库权限', '仅可选当前库管员具有入库权限的号码仓库。', '当前 CONTRACT_WAREHOUSES 为固定数组，没有当前办理人权限过滤。', 'contract-return-audit-warehouse'),
    review('CR2-HD-006', '7.2/4.5', '虚拟库管员', '责任人随所选仓库映射虚拟库管员。', '当前页面/模型固定显示“号码库管员”，没有仓库→虚拟库管员映射。', 'contract-return-audit-responsible'),
    bound('CR2-HD-007', '7.2', '退库日期', '员工确认成功后的日期作为退库日期。', 'contract-return-audit-primary'),
    review('CR2-HD-008', '7.2', '使用说明带出', '使用说明从合约号码台账带出。', '当前 handling.usageNote 初始为空，号码mock也没有使用说明字段。', 'contract-return-audit-usage-note'),
    review('CR2-HD-009', '7.2/4.5', '使用说明反写', '正常退还后将最终使用说明写回号码台账。', 'completeContractReturn 只更新退库申请 handling，没有号码台账写入。', 'contract-return-audit-usage-note'),
    bound('CR2-HD-010', '7.3', '三阶段主操作', '退库确认→等待员工确认→确认入库。', 'contract-return-audit-primary', '::button::'),
    bound('CR2-HD-011', '4.3/7.3', '一单一次确认', '每张号码退库单只需一次员工确认。', 'contract-return-audit-primary'),
    bound('CR2-HD-012', '7.3', '驳回原因', '驳回原因必填。', 'contract-return-reject', '::button::'),
    bound('CR2-HD-013', '4.4/7.3', '驳回终态', '库管员驳回后单据状态为已驳回。', 'contract-return-audit-reject'),
    bound('CR2-HD-014', '4.4', '驳回不改号码台账', '驳回后号码原状态、原责任人和领用信息保持不变。', 'contract-return-audit-reject'),
    review('CR2-HD-015', '4.1/4.4', '正常退还终态', '正常退还后单据状态为已完成。', '当前 completeContractReturn 写入“已处理”，与PRD终态不一致。', 'contract-return-audit-inbound-ledger'),
    bound('CR2-HD-016', '4.4', '处理结果', '正常退还另行记录“正常退还”。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-017', '1/4.4/9', '真实号码入库单', '正常退还自动生成核心号码入库单。', '当前仅生成HRK-*字符串写入退库申请，没有创建核心入库单数据对象。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-018', '1/4.4/4.5', '号码状态', '号码状态更新为“在库（旧）”。', 'completeContractReturn 没有更新 EMPLOYEE_CONTRACT_NUMBERS 或独立号码台账。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-019', '4.5', '号码仓库', '号码台账仓库更新为办理页最终仓库。', '当前只把 warehouse 写到退库申请 handling。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-020', '4.5', '号码责任人', '责任人更新为仓库虚拟库管员。', '当前没有号码台账责任人更新。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-021', '4.5', '子公司清空', '正常退还后清空号码台账子公司。', '当前没有号码台账字段更新。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-022', '4.5', '部门虚拟组织', '部门更新为虚拟库管员所在虚拟组织。', '当前没有号码台账部门更新。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-023', '4.5', '员工领用信息清理', '清空员工职级、领用日期、申请类型。', '当前号码mock/completeContractReturn没有对应清理逻辑。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-024', '4.5', '号码操作历史', '生成合约号码退库及入库操作历史。', '当前只向退库申请history追加“执行入库”，没有独立号码操作历史。', 'contract-return-audit-inbound-ledger'),
    review('CR2-HD-025', '10', '驳回通知', '库管员驳回后通知申请人申请单号、号码和原因。', '当前只有页面message，没有服务号通知记录。', 'contract-return-audit-notifications'),
    review('CR2-HD-026', '10', '完成通知', '正常退还完成后通知申请人号码退库完成及申请单号。', '当前只有页面message，没有服务号通知记录。', 'contract-return-audit-notifications'),
  ],

  [CONTRACT_RETURN_SCOPES.confirm]: [
    bound('CR2-CF-001', '8', '确认基础信息', '展示申请单号、申请人和部门。', 'contract-return-confirm-card'),
    bound('CR2-CF-002', '8', '号码确认信息', '展示合约号码、说明和退库原因。', 'contract-return-confirm-card'),
    bound('CR2-CF-003', '8', '实体卡确认文案', '提示员工已将实体电话卡交还库管员。', 'contract-return-audit-confirm-copy'),
    bound('CR2-CF-004', '4.3/8', '刷卡/手工工号校验', '实际输入工号与申请人不一致时阻断。', 'contract-return-audit-confirm-identity'),
    review('CR2-CF-005', '4.3/8', '狐小e真实扫码身份', '狐小e扫码取得真实扫码账号并与申请人一致。', '当前点击二维码直接传 application.applicant.id，属于模拟成功。', 'contract-return-audit-confirm-identity'),
    bound('CR2-CF-006', '4.3', '一单一次确认', '每张号码退库单只确认一次。', 'contract-return-audit-confirm-record'),
    bound('CR2-CF-007', '4.3/8', '确认记录', '记录确认方式、工号和确认时间。', 'contract-return-audit-confirm-record'),
    bound('CR2-CF-008', '8', '工号不匹配提示', '不一致提示“员工工号不匹配！”。', 'contract-return-audit-confirm-identity'),
    bound('CR2-CF-009', '8', '确认回传', '确认成功后返回号码退库办理并允许执行入库。', 'contract-return-audit-confirm-record'),
    skip('CR2-CF-010', '4.3', 'Pad签字', 'Pad手写签字和签名图片保存下线。', '明确下线能力，不应重新加入页面。'),
  ],

  [CONTRACT_RETURN_AUDIT_SCOPES.inbound]: [
    bound('CR2-IN-001', '5/9', '核心入库页面', '号码入库单复用库存管理“入库”页面查询。', 'contract-return-audit-inbound-list'),
    bound('CR2-IN-002', '9', '退库入库类型', '核心入库列表存在“退库入库”类型。', 'contract-return-audit-inbound-list'),
    bound('CR2-IN-003', '9', '来源申请单号', '入库记录可关联来源申请单号。', 'contract-return-audit-inbound-list'),
    bound('CR2-IN-004', '9', '入库单号', '核心入库列表展示入库单号。', 'contract-return-audit-inbound-list'),
    bound('CR2-IN-005', '9', '制单人/时间', '核心入库列表展示创建人和创建日期。', 'contract-return-audit-inbound-list'),
    review('CR2-IN-006', '9', '申请快照详情', '详情展示申请人、公司、部门、办公区。', '当前入库页只有列表，没有号码退库入库详情。', 'contract-return-audit-inbound-detail'),
    review('CR2-IN-007', '9', '号码台账详情', '详情展示号码、标签号、说明、合约期限、金额和备注。', '当前没有号码入库详情字段。', 'contract-return-audit-inbound-detail'),
    review('CR2-IN-008', '9', '最终仓库详情', '详情展示办理页最终仓库。', '当前列表有仓库，但无号码入库详情与退库单动态关联。', 'contract-return-audit-inbound-detail'),
    review('CR2-IN-009', '9', '员工确认记录', '详情展示确认方式、工号、时间。', '当前入库页面没有员工确认记录字段。', 'contract-return-audit-inbound-detail'),
    review('CR2-IN-010', '9', '备注/附件', '详情展示办理备注和附件。', '当前没有号码退库入库详情与附件展示。', 'contract-return-audit-inbound-detail'),
    review('CR2-IN-011', '9', '号码入库套打', '号码入库单支持真实套打。', '当前批量打印仅message提示“操作已记录（原型）”，没有真实套打。', 'contract-return-audit-inbound-print'),
  ],
};

const STATUS_OVERRIDES = new Map([
  ['CR-AP-001', { status: 'review', reason: '当前没有正式员工身份校验；号码归属也仅通过固定mock列表间接表达，原bound过于乐观。' }],
  ['CR-AP-003', { status: 'review', reason: '一号一单拆分已实现，但公司+办公区仓库匹配、仓库库管员匹配和真实待办未实现。' }],
  ['CR-HD-001', { status: 'review', reason: '当前退库仓库是固定数组，没有公司+办公区映射和当前库管员入库权限过滤。' }],
  ['CR-HD-005', { status: 'review', reason: '当前只更新退库申请状态并生成HRK-*字符串，没有真实号码台账清理、虚拟库管员更新和操作历史。' }],
  ['CR-CF-001', { status: 'review', reason: '手工/刷卡路径能校验工号，但狐小e扫码直接使用申请人工号模拟成功，不能整体判定真实身份校验已完成。' }],
]);

function cloneMap(map = {}) {
  return Object.fromEntries(Object.entries(map).map(([pageScope, values]) => [pageScope, [...(values || [])]]));
}

export function applyContractReturnAnnotationAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(annotations).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export function applyContractReturnCoverageAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(next).forEach(([pageScope, values]) => {
    next[pageScope] = values.map((item) => {
      const override = STATUS_OVERRIDES.get(item.id);
      return override ? { ...item, ...override } : item;
    });
  });
  Object.entries(coverage).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export const contractReturnAuditAnnotationsByScope = annotations;
export const contractReturnAuditCoverageByScope = coverage;
