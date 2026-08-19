// 资产转移第二轮 PRD 深审补充。
// 资产转移并非只有个人工作台中的三张审批页：责任人变更的 /People、/Peoplejieshou、/Peopleshiwu
// 分别复用为申请、接收人保管职责确认、接收人实物确认。本层按真实页面映射重新审计，避免“菜单名不同=页面缺失”的假缺口。

import { ASSET_TRANSFER_SCOPES } from './employee-self-service-expanded-annotations';

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

export const ASSET_TRANSFER_AUDIT_SCOPES = {
  apply: 'route:/People',
  receiverConfirm: 'route:/Peoplejieshou',
  outManager: ASSET_TRANSFER_SCOPES.outManager,
  receiverManager: ASSET_TRANSFER_SCOPES.receiverManager,
  overstandard: ASSET_TRANSFER_SCOPES.approval,
  physicalConfirm: 'route:/Peopleshiwu',
};

const annotations = {
  [ASSET_TRANSFER_AUDIT_SCOPES.apply]: [
    note({
      id: 'transfer-audit-apply-receiver',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.apply, 'field', '接收人'),
      kind: 'field-rule',
      title: '接收人必须同时满足人员、成本中心、办公区和领用权限',
      priority: 'P0',
      rules: [
        '接收人仅允许正式员工，且不得选择当前转出人本人。',
        '接收人与转出人必须同成本中心、同办公区，并满足本单全部转移资产的公司/板块领用权限。',
        '人员选择弹窗需支持员工编号/姓名检索，结果最多展示5条。',
      ],
    }),
    note({
      id: 'transfer-audit-apply-type',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.apply, 'field', '转移类型'),
      kind: 'field-rule',
      title: '一般转移与离职转移共用同一审批链',
      rules: ['转移类型必填，枚举为一般转移、离职转移；两种类型使用同一套审批流程。'],
    }),
    note({
      id: 'transfer-audit-apply-reason',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.apply, 'field', '转移原因'),
      kind: 'field-rule',
      title: '转移原因必填且最多400字符',
      rules: ['转移原因必填，最多400字符；当前页面计数上限和PRD需保持一致。'],
    }),
    note({
      id: 'transfer-audit-apply-location',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.apply, 'table-column', 'City'),
      kind: 'table-column-rule',
      title: 'City / Building / Floor 固定带出转出人地点且不可修改',
      priority: 'P0',
      rules: ['三项默认带出转出人的办公地点，全部只读；流程完成后按申请单中的该地点更新资产台账。'],
    }),
    note({
      id: 'transfer-audit-apply-assets',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.apply, 'table-column', '资产标签号'),
      kind: 'table-column-rule',
      title: '可转移资产必须通过本人归属、配置、状态、锁和盘点校验',
      priority: 'P0',
      rules: [
        '仅本人名下、物料“是否可转移=是”、状态在用-使用中、满足公司板块领用权限且未被其他流程锁定的资产可转移。',
        '启动中的盘点计划内，需盘点且未盘资产可展示但不可勾选，并展示禁止原因。',
        '主资产关联升级配件/耗材自动随主资产转移，不要求申请人单独勾选。',
      ],
    }),
    note({
      id: 'transfer-audit-apply-submit',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.apply, 'button', '预览'),
      kind: 'action-rule',
      title: '当前仅有预览，PRD仍需真实提交、整单锁定与流程创建',
      priority: 'P0',
      rules: [
        '提交时需重新校验人员、接收范围、资产状态、盘点、业务锁、转移原因和每条资产使用用途。',
        '多项资产生成一张转移申请单，整单审批、整单驳回；提交成功后状态=处理中并锁定全部资产及关联耗材。',
        '下一节点为接收人保管职责确认，并生成对应待办/通知。',
      ],
    }),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm]: [
    note({
      id: 'transfer-audit-receiver-duty',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm, 'checkbox', '同意“保管职责”'),
      kind: 'field-rule',
      title: '接收人必须主动勾选保管职责，默认不得勾选',
      priority: 'P0',
      rules: [
        '该节点仅线上勾选确认，不需要手写签名、扫码或刷卡。',
        '复选框默认不勾选；未勾选时点击同意提示“请确认资产保管职责！”。',
      ],
    }),
    note({
      id: 'transfer-audit-receiver-location-readonly',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm, 'table-column', 'City'),
      kind: 'table-column-rule',
      title: '接收确认节点不得修改转移地点',
      priority: 'P0',
      rules: ['City、Building、Floor沿用申请单只读值，接收人不能单条或批量修改地点。'],
    }),
    note({
      id: 'transfer-audit-receiver-actions',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm, 'checkbox', '同意“保管职责”'),
      title: '保管职责确认后必须有同意/驳回/返回流程动作',
      priority: 'P0',
      rules: [
        '同意进入转出人5级及以上领导审批。',
        '驳回时审批意见必填，整单已驳回并解除全部资产及关联耗材锁定。',
        '返回不改变流程状态。',
      ],
    }),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.outManager]: [
    note({
      id: 'transfer-audit-out-manager-routing',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.outManager,
      target: cardTarget('审批操作', 'button', '同意'),
      kind: 'action-rule',
      title: '转出领导需动态找人、去重并执行VP/CEO-1规则',
      priority: 'P0',
      rules: [
        '从转出人汇报链向上找直属5级及以上领导；转出人本人已5级及以上时取其直接上级。',
        '流程即将到达VP/CEO前必须先经过一名VP/CEO-1；与下一节点审批人为同一人时自动跳过重复节点。',
        '同意后进入接收人5级及以上领导审批。',
      ],
    }),
    note({
      id: 'transfer-audit-out-manager-opinion',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.outManager,
      target: cardTarget('审批操作', 'control', '审批意见'),
      kind: 'field-rule',
      title: '转出领导同意、驳回均要求审批意见',
      rules: ['审批意见必填且最多400字符；驳回后整单结束并释放所有转移资产锁。'],
    }),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.receiverManager]: [
    note({
      id: 'transfer-audit-receiver-manager-routing',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.receiverManager,
      target: cardTarget('审批操作', 'button', '同意'),
      kind: 'action-rule',
      title: '接收领导通过后先判断个人超标',
      priority: 'P0',
      rules: [
        '接收领导按接收人汇报链动态查找5级及以上；本人5级及以上取直接上级，并执行VP/CEO-1和相邻审批人去重。',
        '同意后先判断接收人个人超标；个人不超标直接进入实物确认，不再判断部门超标。',
        '个人超标才进入接收人7级及以上领导审批。',
      ],
    }),
    note({
      id: 'transfer-audit-receiver-manager-reject',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.receiverManager,
      target: cardTarget('审批操作', 'button', '驳回'),
      kind: 'action-rule',
      title: '接收领导驳回整单结束并解锁',
      rules: ['驳回意见必填；单据已驳回，全部资产及关联耗材解锁，不生成核心转移单。'],
    }),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.overstandard]: [
    note({
      id: 'transfer-audit-overstandard-routing',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.overstandard,
      target: cardTarget('审批操作', 'button', '同意'),
      kind: 'action-rule',
      title: '通用“资产转移审批”页承载个人/部门超标动态节点',
      priority: 'P0',
      rules: [
        '接收人个人超标时增加接收人7级及以上领导审批；判断规则复用资产申请。',
        '只有个人超标且部门超标时才继续部门超标逐级审批；个人不超标时不判断部门超标。',
        '部门超标逐级向上查找满足审批权限的领导，并执行相邻审批人去重及VP/CEO-1规则。',
      ],
    }),
    note({
      id: 'transfer-audit-overstandard-reject',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.overstandard,
      target: cardTarget('审批操作', 'button', '驳回'),
      kind: 'action-rule',
      title: '任一超标审批驳回均整单结束',
      rules: ['整单状态更新为已驳回，解除全部资产及关联耗材锁定，不更新资产责任关系。'],
    }),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm]: [
    note({
      id: 'transfer-audit-physical-checkbox',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm, 'checkbox', '同意“实物确认”'),
      kind: 'field-rule',
      title: '实物确认必须主动勾选且默认不勾选',
      priority: 'P0',
      rules: ['所有审批通过后由接收人确认已收到全部资产及相关配件；复选框默认不勾选，未勾选不得确认。'],
    }),
    note({
      id: 'transfer-audit-physical-location',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm, 'table-column', 'City'),
      kind: 'table-column-rule',
      title: '最终确认页只读展示申请单地点与资产信息',
      rules: ['资产标签号、资产说明、配置、数量、状态、用途、地点、部件及关联耗材均只读，不在实物确认阶段再次修改。'],
    }),
    note({
      id: 'transfer-audit-physical-complete',
      pageKey: ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm,
      target: scopeTarget(ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm, 'checkbox', '同意“实物确认”'),
      title: '确认成功后必须原子生成转移单并更新完整台账',
      priority: 'P0',
      rules: [
        '确认后自动生成核心转移单，记录申请单号、确认记录和全部资产明细。',
        '同一申请单全部资产在同一事务中更新责任人、部门、成本中心、费用科目、公司/板块、地点、用途；资产状态保持原值。',
        '关联升级配件/耗材同步更新，生成资产操作历史、事务记录和相关报表；全部成功后才解除锁定并将申请单置为已完成。',
        '任一资产更新失败不得出现部分成功。',
      ],
    }),
  ],
};

const additions = {
  [ASSET_TRANSFER_AUDIT_SCOPES.apply]: [
    bound('AT2-AP-001', '1.2/4.1', '申请页复用', '责任人变更编辑页 /People 作为资产转移申请入口。', 'transfer-audit-apply-receiver'),
    review('AT2-AP-002', '2', '发起人资格', '仅正式员工可发起；实习生、外包不展示入口。', '当前 ResponsiblePersonEdit 为静态原型，未见员工类型准入判断。', 'transfer-audit-apply-receiver'),
    review('AT2-AP-003', '4.2/5', '接收人选择弹窗', '仅正式员工、同成本中心、同办公区并满足全部资产领用权限；不得选择本人。', '当前接收人只是文本输入框+搜索图标，没有人员弹窗、候选过滤或选中回填逻辑。', 'transfer-audit-apply-receiver'),
    review('AT2-AP-004', '5', '接收人查询', '支持员工编号、姓名查询，回车触发，匹配超过5条只展示前5条。', '当前未实现接收人查询弹窗。'),
    review('AT2-AP-005', '4.2', '接收人自动带出', '选择接收人后自动带出电话、邮箱、部门。', '当前电话/邮箱/部门仅为disabled空输入框，没有选择人员后的数据联动。'),
    review('AT2-AP-006', '4.2', '转移类型', '一般转移、离职转移均可选且共用审批流。', '当前下拉框只有“一般转移”一个选项。', 'transfer-audit-apply-type'),
    review('AT2-AP-007', '4.2', '转移原因长度', '必填且最多400字符。', '当前 textarea 没有受控必填校验，页面展示计数上限为500，与PRD 400不一致。', 'transfer-audit-apply-reason'),
    review('AT2-AP-008', '4.3', '资产使用用途', '每条资产使用用途必填且最多400字符。', '当前申请资产表没有“使用用途”字段。'),
    review('AT2-AP-009', '4.3', '资产备注', '每条资产备注可填，最多200字符。', '当前申请资产表没有备注编辑字段。'),
    review('AT2-AP-010', '2/6', '可转移资产固定范围', '本人名下、允许转移、在用-使用中、未锁定且满足公司板块权限。', '当前 tableData 为静态mock，没有资产候选过滤或业务资格计算。', 'transfer-audit-apply-assets'),
    review('AT2-AP-011', '2/6.2', '盘点禁止转移', '启动盘点计划中需盘且未盘资产可见但不可勾选。', '当前没有盘点状态/是否需盘判断，也没有置灰原因。', 'transfer-audit-apply-assets'),
    review('AT2-AP-012', '6.1', '资产选择查询', '资产弹窗支持标签号、说明、大类、小类、状态、用途组合筛选。', '当前申请页没有资产选择弹窗。'),
    review('AT2-AP-013', '6.4', '资产跨页多选', '支持多选、跨页保留选择、确定前重校验状态与锁。', '当前申请页没有资产选择弹窗或跨页选择逻辑。'),
    review('AT2-AP-014', '4.4', '添加资产', '添加资产打开选择弹窗，同一资产不得重复。', '当前页面没有“添加资产”按钮，只有批量导入展示按钮。'),
    review('AT2-AP-015', '4.4', '删除资产', '可删除明细，但整单至少保留一条资产。', '当前静态表格没有删除操作。'),
    review('AT2-AP-016', '2', '地点只读', 'City/Building/Floor默认带出转出人办公地点且不可修改。', '申请页表格显示静态地点，尚未证明来源为转出人人员信息和只读业务约束。', 'transfer-audit-apply-location'),
    review('AT2-AP-017', '4.3/14', '关联耗材自动跟随', '主资产关联升级配件/耗材自动展示并随主资产锁定、转移。', '当前children以“主/备”模拟部件，但没有耗材台账关联与自动锁定机制。'),
    review('AT2-AP-018', '4.4/4.5', '提交前重校验', '提交需重新校验人员、资产、盘点、锁、接收人权限、必填项。', '当前页面没有提交动作，只有预览按钮。', 'transfer-audit-apply-submit'),
    review('AT2-AP-019', '2/4.4', '一单多资产', '多项资产生成一张转移申请单，整单审批/驳回。', '当前没有真实单据创建服务。', 'transfer-audit-apply-submit'),
    review('AT2-AP-020', '14.1', '资产与耗材锁', '提交成功持久化锁定全部资产及关联耗材。', '当前没有资产转移业务锁实现。', 'transfer-audit-apply-submit'),
    review('AT2-AP-021', '1.3/3', '流程创建', '提交后状态处理中并进入接收人保管职责确认。', '当前没有转移申请状态机或待办创建。', 'transfer-audit-apply-submit'),
    review('AT2-AP-022', '15', '提交通知', '提交成功通知接收人待确认，并记录通知结果。', '当前没有服务号/待办通知实现。'),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.receiverConfirm]: [
    bound('AT2-RC-001', '7', '页面复用', '责任人变更接收人确认页 /Peoplejieshou 承载保管职责确认。', 'transfer-audit-receiver-duty'),
    review('AT2-RC-002', '7.1', '确认方式', '仅线上勾选，不扫码、不刷卡、不签字。', '页面没有扫码/刷卡，但复选框当前 defaultChecked，未体现主动确认。', 'transfer-audit-receiver-duty'),
    review('AT2-RC-003', '7.3', '默认未勾选', '保管职责默认不勾选，未勾选不得同意。', '当前 checkbox 使用 defaultChecked。', 'transfer-audit-receiver-duty'),
    review('AT2-RC-004', '2/7', '地点只读', 'City/Building/Floor沿用申请单值且不可修改。', '当前页面允许单行编辑City/Building/Floor并提供“批量编辑”弹窗，与现行口径相反。', 'transfer-audit-receiver-location-readonly'),
    review('AT2-RC-005', '7.3', '同意', '同意后进入转出人5级及以上领导审批。', '当前页面没有同意按钮和流程推进。', 'transfer-audit-receiver-actions'),
    review('AT2-RC-006', '7.3', '驳回', '驳回意见必填，整单已驳回并释放全部资产锁。', '当前页面没有审批意见和驳回按钮。', 'transfer-audit-receiver-actions'),
    review('AT2-RC-007', '7.3', '返回', '返回不改变流程状态。', '当前页面没有返回流程动作。'),
    review('AT2-RC-008', '15', '节点通知', '接收人确认后通知转出领导待审批。', '当前页面无通知/待办创建。'),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.outManager]: [
    review('AT2-OM-001', '8.1', '动态5级领导', '从转出人汇报链找到5级及以上；本人5级及以上取直接上级。', '当前审批页使用静态mock人员，不存在汇报链查找。', 'transfer-audit-out-manager-routing'),
    review('AT2-OM-002', '8.1', 'VP/CEO-1', '到VP/CEO前必须先经过VP/CEO-1。', '当前页面无动态审批链。', 'transfer-audit-out-manager-routing'),
    review('AT2-OM-003', '8.1', '相邻审批去重', '下一节点审批人与当前同一人时自动跳过。', '当前静态历史无法验证去重。', 'transfer-audit-out-manager-routing'),
    review('AT2-OM-004', '8.2', '审批意见', '同意和驳回均必填，最多400字符。', '当前默认“同意”，同意时不要求用户实际填写；仅驳回时做弱校验。', 'transfer-audit-out-manager-opinion'),
    review('AT2-OM-005', '8.3', '同意流转', '同意后真实进入接收人领导审批。', '当前 decide() 仅message.success，不更新流程状态。', 'transfer-audit-out-manager-routing'),
    review('AT2-OM-006', '8.3/14.1', '驳回解锁', '驳回整单并解除资产/关联耗材业务锁。', '当前按钮仅toast，没有单据状态和解锁副作用。'),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.receiverManager]: [
    review('AT2-RM-001', '9.1', '动态接收领导', '从接收人汇报链找到5级及以上；本人5级及以上取直接上级。', '当前页面使用静态mock。', 'transfer-audit-receiver-manager-routing'),
    review('AT2-RM-002', '9.1', 'VP/CEO-1与去重', '执行VP/CEO-1及相邻审批人去重。', '当前没有动态流程引擎。', 'transfer-audit-receiver-manager-routing'),
    review('AT2-RM-003', '9.3', '个人超标判断', '同意后先判断个人超标；不超标直接实物确认。', '当前同意按钮仅toast，不执行超标计算。', 'transfer-audit-receiver-manager-routing'),
    review('AT2-RM-004', '10', '7级审批', '个人超标时进入接收人7级及以上领导审批。', '当前没有动态节点创建。'),
    review('AT2-RM-005', '9.3/14.1', '驳回解锁', '驳回整单并解除资产及关联耗材锁。', '当前驳回按钮没有状态/解锁副作用。', 'transfer-audit-receiver-manager-reject'),
    review('AT2-RM-006', '15', '审批通知', '流转到下一节点后生成待办/服务号通知。', '当前无通知实现。'),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.overstandard]: [
    bound('AT2-OS-001', '10-11', '页面复用', '个人7级及以上/部门超标审批可复用通用“资产转移审批”页面外壳。', 'transfer-audit-overstandard-routing'),
    review('AT2-OS-002', '10.1', '个人超标规则', '复用资产申请个人超标算法。', '当前通用页面没有超标计算数据。', 'transfer-audit-overstandard-routing'),
    review('AT2-OS-003', '10.3', '个人超标同意', '同意后仅在部门也超标时继续逐级审批。', '当前按钮仅toast。', 'transfer-audit-overstandard-routing'),
    review('AT2-OS-004', '2/10', '个人不超标短路', '个人不超标时不判断部门超标，直接实物确认。', '当前没有可验证条件路由。'),
    review('AT2-OS-005', '11.1', '部门超标触发', '仅个人超标且部门超标时触发。', '当前没有部门超标判断。', 'transfer-audit-overstandard-routing'),
    review('AT2-OS-006', '11.1', '部门审批权限', '按资产申请超标审批权限逐级向上，直至审批人满足权限。', '当前通用页没有权限矩阵。'),
    review('AT2-OS-007', '11.1', '超标领导查找', '相邻审批人去重，到VP/CEO前先过VP/CEO-1。', '当前静态审批历史无法实现。'),
    review('AT2-OS-008', '10-11', '审批意见', '同意、驳回均必填且最多400字符。', '当前页面默认“同意”，同意不强制用户填写。'),
    review('AT2-OS-009', '10-11/14.1', '超标驳回解锁', '任一超标节点驳回均整单结束并解除全部资产锁。', '当前驳回仅toast。', 'transfer-audit-overstandard-reject'),
    review('AT2-OS-010', '15', '超标审批通知', '每次流转生成下一审批人待办和通知。', '当前无通知实现。'),
  ],

  [ASSET_TRANSFER_AUDIT_SCOPES.physicalConfirm]: [
    bound('AT2-PC-001', '12', '页面复用', '责任人变更实物确认页 /Peopleshiwu 承载最终接收人实物确认。', 'transfer-audit-physical-checkbox'),
    review('AT2-PC-002', '12.2', '默认未勾选', '同意实物确认默认不勾选。', '当前 checkbox 使用 defaultChecked。', 'transfer-audit-physical-checkbox'),
    review('AT2-PC-003', '12.2', '确认意见', '支持可选确认意见，最多400字符。', '当前页面没有确认意见输入。'),
    review('AT2-PC-004', '12.3', '确认按钮', '未勾选时阻止确认并提示“请确认实物确认！”。', '当前页面没有确认按钮和校验。', 'transfer-audit-physical-checkbox'),
    review('AT2-PC-005', '12.3', '驳回', '驳回时确认意见必填，整单已驳回并释放锁。', '当前页面没有驳回动作。'),
    review('AT2-PC-006', '12.3', '返回', '返回不改变流程状态。', '当前页面没有返回动作。'),
    review('AT2-PC-007', '12.2', '确认资产字段', '应展示配置、使用用途、部件及关联耗材等完整资产信息。', '当前表格有标签/SN/关系/说明/数量/地点/类别/状态，但缺配置、使用用途及独立关联耗材展示。', 'transfer-audit-physical-location'),
    review('AT2-PC-008', '13', '核心转移单', '确认成功自动生成核心转移单并记录确认记录。', '当前页面无任何提交服务或转移单对象。', 'transfer-audit-physical-complete'),
    review('AT2-PC-009', '14.2', '责任人/组织更新', '更新责任人、部门、成本中心、费用科目、公司/板块。', '当前页面为纯静态数据，没有台账更新。', 'transfer-audit-physical-complete'),
    review('AT2-PC-010', '14.2', '地点/用途更新', '按申请单只读地点和资产行使用用途更新台账，资产状态保持原值。', '当前无台账更新。', 'transfer-audit-physical-complete'),
    review('AT2-PC-011', '14.3', '关联耗材同步', '升级配件/耗材同步责任人、组织、成本中心、公司板块、地点。', '当前children仅用于视觉展示，没有耗材台账联动。', 'transfer-audit-physical-complete'),
    review('AT2-PC-012', '14.3', '事务与报表', '生成资产操作历史、事务记录并更新相关报表。', '当前无业务服务实现。', 'transfer-audit-physical-complete'),
    review('AT2-PC-013', '14.3', '整单原子性', '多项资产必须同一事务更新，任一失败不得部分成功。', '当前无事务层。', 'transfer-audit-physical-complete'),
    review('AT2-PC-014', '14.1', '完成解锁', '全部台账更新成功后解除资产/耗材锁并置单据已完成。', '当前没有业务锁和状态机。', 'transfer-audit-physical-complete'),
    review('AT2-PC-015', '15', '完成通知', '流程完成后通知转出人、接收人并记录结果。', '当前无服务号通知。'),
  ],
};

const oldCoverageOverrides = {
  'AT-MD-001': review('AT-MD-001', '4-6', '资产转移申请页', '责任人变更 /People 复用为资产转移申请页。', '页面已存在，不再按missing处理；但目前仍是静态原型，接收人选择、资产选择、提交校验和流程创建尚未实现。', 'transfer-audit-apply-submit'),
  'AT-MD-002': review('AT-MD-002', '5', '接收人选择弹窗', '接收人仅正式员工、同成本中心同办公区且满足所有资产领用权限，结果超过5条只展示前5条。', '申请页已复用，但接收人选择弹窗仍未实现。', 'transfer-audit-apply-receiver'),
  'AT-MD-003': review('AT-MD-003', '6', '转移资产选择弹窗', '候选资产必须本人名下、允许转移、未锁定、满足权限；盘点未盘可见但不可选。', '申请页已复用，但资产选择弹窗仍未实现。', 'transfer-audit-apply-assets'),
  'AT-MD-004': review('AT-MD-004', '7', '接收人保管职责确认', '责任人变更 /Peoplejieshou 复用为保管职责确认。', '页面已存在，但地点错误地可编辑、复选框默认勾选，且没有同意/驳回/返回流程动作。', 'transfer-audit-receiver-duty'),
  'AT-MD-005': review('AT-MD-005', '10-11', '个人/部门超标审批', '通用“资产转移审批”页可复用个人7级及部门超标审批外壳。', '页面外壳存在，但没有动态个人/部门超标判断、审批权限与逐级路由。', 'transfer-audit-overstandard-routing'),
  'AT-MD-006': review('AT-MD-006', '12', '接收人实物确认', '责任人变更 /Peopleshiwu 复用为最终实物确认。', '页面已存在，但复选框默认勾选，无确认/驳回动作，也没有核心转移单和台账更新。', 'transfer-audit-physical-complete'),
  'AT-AU-002': review('AT-AU-002', '审批操作', '同意', '同意后按转移审批链推进。', '当前 AssetTransferApprovalPage 的同意仅 message.success，不推进流程。', 'transfer-approval-agree'),
  'AT-AU-003': review('AT-AU-003', '审批操作', '驳回', '任一节点驳回整单结束并解锁。', '当前驳回仅toast，没有状态更新与资产解锁。', 'transfer-approval-reject'),
  'AT-OM-001': review('AT-OM-001', '8.1', '转出人领导审批', '从汇报链查找5级及以上；进入VP/CEO前过VP/CEO-1。', '当前页面为静态mock，按钮不执行动态审批链。', 'transfer-audit-out-manager-routing'),
  'AT-RM-001': review('AT-RM-001', '9', '接收人领导审批', '同意后判断个人超标；不超标直接实物确认。', '当前按钮仅toast，不执行超标判断与路由。', 'transfer-audit-receiver-manager-routing'),
  'AT-RM-002': review('AT-RM-002', '9', '驳回', '驳回整单并解除资产锁定。', '当前按钮仅toast，没有状态/解锁副作用。', 'transfer-audit-receiver-manager-reject'),
};

function mergeScopeMaps(base = {}, extra = {}) {
  const result = {};
  const scopes = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
  scopes.forEach((scope) => {
    result[scope] = [...(base?.[scope] || []), ...(extra?.[scope] || [])];
  });
  return result;
}

export function applyAssetTransferAnnotationAudit(annotationsByScope = {}) {
  return mergeScopeMaps(annotationsByScope, annotations);
}

export function applyAssetTransferCoverageAudit(coverageByScope = {}) {
  const overridden = Object.fromEntries(
    Object.entries(coverageByScope || {}).map(([scope, items]) => [
      scope,
      (items || []).map((item) => oldCoverageOverrides[item.id] || item),
    ])
  );
  return mergeScopeMaps(overridden, additions);
}

export default annotations;
