// 资产借用第二轮 PRD 深审补充。
// 第一轮已具备较完整页面标注；本层重点拆细真实研发副作用，并纠正“页面动作存在即视为业务已实现”的乐观判断。

import { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';

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
  id,
  source,
  object,
  rule,
  status: 'bound',
  annotationId,
  ...(expectedTargetFragment ? { expectedTargetFragment } : {}),
});

const review = (id, source, object, rule, reason, annotationId) => ({
  id,
  source,
  object,
  rule,
  status: 'review',
  reason,
  ...(annotationId ? { annotationId } : {}),
});

const skip = (id, source, object, rule, reason) => ({
  id,
  source,
  object,
  rule,
  status: 'skip',
  reason,
});

export const ASSET_BORROWING_AUDIT_SCOPES = ASSET_BORROWING_SCOPES;

const APPLY_CARD = '借用资产明细';
const ALLOCATION_CARD = '借用资产信息';
const APPROVAL_CARD = '审批信息';
const ISSUE_CARD = '借用资产明细';
const CONFIRM_CARD = '刷卡/扫码确认';

export const assetBorrowingAuditAnnotationsByScope = {
  [ASSET_BORROWING_SCOPES.apply]: [
    note({
      id: 'borrowing-audit-account-validity',
      pageKey: ASSET_BORROWING_SCOPES.apply,
      target: scopeTarget(ASSET_BORROWING_SCOPES.apply, 'card', APPLY_CARD),
      title: '借用准入不仅校验正式员工，还要求账号有效',
      priority: 'P0',
      rules: [
        '进入借用申请前同时校验申请人账号有效、员工类型为正式员工；实习生、外包及其他类型不得发起。',
        '准入失败不得仅靠隐藏按钮，应在提交时再次校验，避免前端状态绕过。',
      ],
    }),
    note({
      id: 'borrowing-audit-material-hierarchy',
      pageKey: ASSET_BORROWING_SCOPES.apply,
      target: scopeTarget(ASSET_BORROWING_SCOPES.apply, 'control', '搜索大类或小类'),
      kind: 'field-rule',
      title: '借用物资选择应支持大类/小类联动及完整关键字检索',
      rules: [
        '固定范围只展示启用且“是否允许借用=是”的资产物料，不展示耗材。',
        '查询支持资产大类、资产小类联动；关键字需同时覆盖资产小类、品牌、型号和配置。',
      ],
      availability: 'dynamic',
    }),
    note({
      id: 'borrowing-audit-material-granularity',
      pageKey: ASSET_BORROWING_SCOPES.apply,
      target: scopeTarget(ASSET_BORROWING_SCOPES.apply, 'button', '添加资产'),
      kind: 'action-rule',
      title: '物料回填必须保留申请所需的配置维度',
      priority: 'P0',
      rules: [
        '选择物料后申请明细必须能展示“资产大类.资产小类”和物料配置；不能只按小类聚合后丢失品牌、型号或配置维度。',
        '重复物料不重复新增；已选择物料按同一物料维度去重。',
      ],
    }),
    note({
      id: 'borrowing-audit-period-interaction',
      pageKey: ASSET_BORROWING_SCOPES.apply,
      target: cardTarget(APPLY_CARD, 'table-column', '借用日期'),
      kind: 'table-column-rule',
      title: '开始日期与结束日期的可选范围必须独立受控',
      rules: [
        '开始日期默认当天，只能选择当天至未来30天；结束日期以已选开始日为基准，默认+1个月、最长+3个月。',
        '快捷项7天、15天、1个月、2个月、3个月都必须按当前开始日计算。',
      ],
    }),
    note({
      id: 'borrowing-audit-reminder-schedule',
      pageKey: ASSET_BORROWING_SCOPES.apply,
      target: cardTarget(APPLY_CARD, 'table-column', '借用日期'),
      kind: 'table-column-rule',
      title: '借用结束日期同时驱动四级到期提醒任务',
      priority: 'P0',
      rules: [
        '结束日期前7天通知申请人；结束日期前3天再次通知申请人。',
        '超过结束日期后每日通知申请人；超过7天后每日同时通知申请人和直属5级及以上领导，但VP/CEO不接收催还通知。',
        '提醒任务只发消息，不修改借用单状态，也不增加资产逾期标记。',
      ],
    }),
  ],

  [ASSET_BORROWING_SCOPES.allocation]: [
    note({
      id: 'borrowing-audit-allocation-config',
      pageKey: ASSET_BORROWING_SCOPES.allocation,
      target: scopeTarget(ASSET_BORROWING_SCOPES.allocation, 'card', ALLOCATION_CARD),
      title: 'ES配给必须完整看到申请物料配置',
      rules: [
        '申请资产信息应展示办理仓库、资产标签号、资产说明、配置、借用原因、需求说明和借用起止日期。',
        '未匹配实物时资产说明按申请大类.小类展示；匹配后带出品牌.型号，同时保留申请配置用于核对。',
      ],
    }),
    note({
      id: 'borrowing-audit-allocation-query',
      pageKey: ASSET_BORROWING_SCOPES.allocation,
      target: cardTarget(ALLOCATION_CARD, 'table-column', '资产标签号'),
      kind: 'table-column-rule',
      title: '配给资产弹窗的查询条件与结果字段必须完整',
      rules: [
        '查询条件至少包含资产标签号、SN号、板块、资产说明；资产说明支持小类、品牌、型号、配置模糊查询。',
        '结果需展示公司、板块、仓库、大类、小类、说明、品牌、配置、数量、原值、责任人、状态、成本中心和启用日期。',
      ],
    }),
    note({
      id: 'borrowing-audit-employee-assets',
      pageKey: ASSET_BORROWING_SCOPES.allocation,
      target: cardTarget('申请人信息', 'button', '查看名下资产'),
      kind: 'action-rule',
      title: '员工名下资产弹窗是只读辅助判断，不得修改台账',
      rules: [
        '查询条件包含资产标签号、物资总类、资产状态、资产说明、资产用途、是否锁定。',
        '顶部展示名下总资产数和借用资产数；结果展示资产/耗材、大类、小类、标签号、说明、配置、数量、状态、部件数量。',
        '该弹窗只读，不得直接修改员工名下资产。',
      ],
    }),
    note({
      id: 'borrowing-audit-warehouse-change',
      pageKey: ASSET_BORROWING_SCOPES.allocation,
      target: cardTarget(ALLOCATION_CARD, 'table-column', '仓库'),
      kind: 'table-column-rule',
      title: '更换办理仓库必须重新验证并清理不兼容的已配给资产',
      priority: 'P0',
      rules: [
        '仓库默认按申请人公司、部门、办公区映射，并只允许当前审批人有出库权限的当前公司仓库。',
        '办理仓库变化后，原已匹配资产若不属于新仓库必须立即失效；重新选资产时再次执行全部出库条件校验。',
      ],
    }),
  ],

  [ASSET_BORROWING_SCOPES.approval]: [
    note({
      id: 'borrowing-audit-approval-readonly',
      pageKey: ASSET_BORROWING_SCOPES.approval,
      target: scopeTarget(ASSET_BORROWING_SCOPES.approval, 'card', '借用资产信息'),
      title: '直属领导审批只能核对整单，不允许修改申请明细',
      rules: [
        '审批页展示申请人、申请日期、联系方式、部门和完整借用资产信息；借用明细在领导节点全部只读。',
      ],
    }),
    note({
      id: 'borrowing-audit-approval-agree-effects',
      pageKey: ASSET_BORROWING_SCOPES.approval,
      target: cardTarget(APPROVAL_CARD, 'button', '同意'),
      kind: 'action-rule',
      title: '领导同意后要按办理仓库真正生成库管员待办并发通知',
      priority: 'P0',
      rules: [
        '审批通过后单据保持处理中，根据办理仓库找到有出库权限的库管员并生成发放待办。',
        '同一业务动作内分别向申请人和库管员发送服务号通知；申请人收到办理地点，库管员收到发放待办提示。',
      ],
    }),
    note({
      id: 'borrowing-audit-approval-reject-effects',
      pageKey: ASSET_BORROWING_SCOPES.approval,
      target: cardTarget(APPROVAL_CARD, 'button', '驳回'),
      kind: 'action-rule',
      title: '领导驳回要真实释放资产锁并通知申请人',
      priority: 'P0',
      rules: [
        '驳回意见必填；单据更新为已驳回并结束流程。',
        '所有已配给实物资产必须解除持久化业务锁，不仅清空页面选择；同时通知申请人驳回节点和原因。',
      ],
    }),
  ],

  [ASSET_BORROWING_SCOPES.issue]: [
    note({
      id: 'borrowing-audit-issue-final-validation',
      pageKey: ASSET_BORROWING_SCOPES.issue,
      target: cardTarget(ISSUE_CARD, 'detail-field', '资产标签号'),
      kind: 'field-rule',
      title: '库管员重新配给和最终出库必须执行完整资产条件校验',
      priority: 'P0',
      rules: [
        '校验仓库、申请公司/板块权限、资产小类、三种可出库状态、资产标记为空、未被其他流程占用。',
        '执行出库前再次校验资产仍满足条件，并重新校验借用开始/结束日期有效。',
      ],
    }),
    note({
      id: 'borrowing-audit-issue-status-display',
      pageKey: ASSET_BORROWING_SCOPES.issue,
      target: scopeTarget(ASSET_BORROWING_SCOPES.issue, 'card', ISSUE_CARD),
      title: '发放页必须展示并核对实物资产状态及升级耗材',
      rules: [
        '选择资产后带出SN、公司、板块、资产说明、配置、资产状态；资产状态用于最终出库校验。',
        '主资产存在升级耗材时展示独立升级耗材明细，并在出库时随主资产同步处理。',
      ],
    }),
    note({
      id: 'borrowing-audit-confirm-method',
      pageKey: ASSET_BORROWING_SCOPES.issue,
      target: scopeTarget(ASSET_BORROWING_SCOPES.issue, 'button', '借用确认'),
      kind: 'action-rule',
      title: '发起现场确认不能硬编码确认方式',
      rules: [
        '确认方式仅允许狐小e扫码、刷卡、输入工号三种；下线Pad签名。',
        '发起确认前资产、仓库、地点信息必须完整；生成待确认记录后等待员工本人完成身份确认。',
      ],
    }),
    note({
      id: 'borrowing-audit-outbound-effects',
      pageKey: ASSET_BORROWING_SCOPES.issue,
      target: scopeTarget(ASSET_BORROWING_SCOPES.issue, 'button', '执行出库'),
      kind: 'action-rule',
      title: '执行出库必须落真实出库单、台账、事务和升级耗材',
      priority: 'P0',
      availability: 'dynamic',
      rules: [
        '员工确认完成且最终校验全部通过后，在核心出库页生成资产借用出库单并记录源借用单号。',
        '同步生成资产操作历史、事务记录和报表；升级耗材随主资产生成出库明细并更新耗材台账。',
        '资产台账更新责任人、部门、成本中心/费用科目、City/Building/Floor、资产状态=在用-借用中、使用说明。',
        '出库成功记录真实出库单号和完成时间，并向申请人发送含借用起止日期的出库完成通知。',
      ],
    }),
    note({
      id: 'borrowing-audit-abandon-effects',
      pageKey: ASSET_BORROWING_SCOPES.issue,
      target: scopeTarget(ASSET_BORROWING_SCOPES.issue, 'button', '取消'),
      kind: 'action-rule',
      title: '放弃领用必须解除真实锁定且不产生任何出库数据',
      priority: 'P0',
      rules: [
        '正式业务动作应按产品口径显示“弃领/放弃领用”，并二次提示流程将结束。',
        '放弃后解除所有已匹配资产的持久化业务锁，不生成出库单、台账变更或事务；通知申请人流程结束及处理结果。',
      ],
    }),
  ],

  [ASSET_BORROWING_SCOPES.confirm]: [
    note({
      id: 'borrowing-audit-confirm-details',
      pageKey: ASSET_BORROWING_SCOPES.confirm,
      target: scopeTarget(ASSET_BORROWING_SCOPES.confirm, 'card', '借用资产明细'),
      title: '员工确认页必须核对实物、期限、使用说明和关联升级耗材',
      rules: [
        '确认页展示资产标签号、资产说明、配置、借用开始/结束日期、使用说明；存在升级耗材时同时展示关联耗材。',
      ],
    }),
    note({
      id: 'borrowing-audit-confirm-manual',
      pageKey: ASSET_BORROWING_SCOPES.confirm,
      target: cardTarget(CONFIRM_CARD, 'button', '确认'),
      kind: 'action-rule',
      title: '手工工号确认是独立兜底方式，不能和刷卡混记',
      priority: 'P0',
      rules: [
        '输入工号仅用于扫码或刷卡不可用场景；系统查询人员并进行二次身份确认。',
        '确认成功后必须按实际方式记录“输入工号确认”，不能统一记成“刷卡确认”。',
      ],
    }),
    note({
      id: 'borrowing-audit-confirm-qr',
      pageKey: ASSET_BORROWING_SCOPES.confirm,
      target: cardTarget(CONFIRM_CARD, 'button', '模拟扫码确认'),
      kind: 'action-rule',
      title: '狐小e扫码必须校验实际扫码账号与申请人一致',
      priority: 'P0',
      rules: [
        '二维码只能作为扫码入口；服务端必须取得实际扫码账号并校验与借用申请人一致。',
        '账号不一致时阻断确认，不得直接使用申请人工号模拟成功。',
      ],
    }),
    note({
      id: 'borrowing-audit-confirm-record',
      pageKey: ASSET_BORROWING_SCOPES.confirm,
      target: scopeTarget(ASSET_BORROWING_SCOPES.confirm, 'card', CONFIRM_CARD),
      title: '员工确认记录要持久化并通知库管员继续出库',
      rules: [
        '确认成功持久化确认方式、确认人和确认时间，并将流程重新交回库管员发放节点。',
        '库管员应收到可执行出库的待办/通知，而不是依赖人工刷新页面发现状态变化。',
      ],
    }),
  ],
};

export const assetBorrowingAuditCoverageByScope = {
  [ASSET_BORROWING_SCOPES.apply]: [
    review('BA2-AP-001', '#7.1', '账号有效性', '正式员工之外还需校验申请人账号有效。', 'CURRENT_BORROWER 只有 employeeType，没有账号有效/禁用字段或再次校验逻辑。', 'borrowing-audit-account-validity'),
    bound('BA2-AP-002', '#7.6.1', '资产大类/小类联动', '资产大类选择后联动展示对应资产小类。', 'borrowing-audit-material-hierarchy'),
    bound('BA2-AP-003', '#7.6.2', '借用物料固定范围', '只展示 enabled=true 且 borrowable=true 的借用资产，不展示耗材。', 'borrowing-audit-material-hierarchy'),
    review('BA2-AP-004', '#7.3/#7.6', '物料配置维度', '选择物料后必须保留并展示配置信息。', 'BorrowMaterialModal 先按大类+小类聚合，生成的选择项 config 固定为空；申请表也没有“配置”列，品牌/型号/配置维度会丢失。', 'borrowing-audit-material-granularity'),
    bound('BA2-AP-005', '#7.3', '资产类别展示', '选择后按资产大类.资产小类展示。', 'borrowing-audit-material-granularity'),
    bound('BA2-AP-006', '#7.3', '日期快捷项', '7天/15天/1月/2月/3月均按当前开始日期计算结束日期。', 'borrowing-audit-period-interaction'),
    review('BA2-AP-007', '#7.3', '结束日期解锁交互', '结束日期应在选择开始日期后解锁并以开始日为计算基准。', '当前使用 RangePicker 一次选择起止日期，不存在独立“先选开始日再解锁结束日”的交互；业务范围校验已实现，但页面交互与PRD不同。', 'borrowing-audit-period-interaction'),
    bound('BA2-AP-008', '#15', '提交成功提示', '成功后提示申请已提交并等待审批通过后的办理通知。', 'borrowing-apply-submit', '::button::'),
    review('BA2-AP-009', '#14', 'T-7提醒', '结束日期前7天通知申请人按期退库。', 'assetBorrowingService 仅提供 localStorage CRUD，没有到期定时任务或通知服务。', 'borrowing-audit-reminder-schedule'),
    review('BA2-AP-010', '#14', 'T-3提醒', '结束日期前3天再次通知申请人。', '当前没有借用到期调度/服务号通知实现。', 'borrowing-audit-reminder-schedule'),
    review('BA2-AP-011', '#14', '逾期每日提醒', '超过结束日期后每日通知申请人归还。', '当前没有逾期扫描和每日通知任务。', 'borrowing-audit-reminder-schedule'),
    review('BA2-AP-012', '#14', '逾期7天升级催还', '超过7天后每日通知申请人及直属5级以上领导，VP/CEO不接收。', '当前没有逾期天数计算、5级领导查找或VP/CEO排除通知逻辑。', 'borrowing-audit-reminder-schedule'),
  ],

  [ASSET_BORROWING_SCOPES.allocation]: [
    bound('BA2-AL-001', '#8.2', '申请人信息', '借用单号、申请人、日期、公司/部门、办公区、电话、邮箱只读展示。', 'borrowing-allocation-whole-order'),
    review('BA2-AL-002', '#8.3', '配置字段', 'ES配给表必须展示申请物料配置。', 'BorrowingAllocationPage 的借用资产信息表没有“配置”列，只展示资产说明、原因、需求和日期。', 'borrowing-audit-allocation-config'),
    bound('BA2-AL-003', '#8.4.1', '配给资产查询条件', '支持标签号、SN、板块和资产说明/配置查询。', 'borrowing-audit-allocation-query'),
    review('BA2-AL-004', '#8.4.3', '配给资产结果字段', '结果列表必须包含仓库等完整台账字段。', 'AssetMatchModal 已展示大部分字段，但结果列缺少“仓库”，只能从弹窗外当前仓库上下文推断。', 'borrowing-audit-allocation-query'),
    bound('BA2-AL-005', '#8.5.1', '名下资产查询条件', '支持标签号、物资总类、状态、说明、用途、是否锁定筛选。', 'borrowing-audit-employee-assets'),
    bound('BA2-AL-006', '#8.5.2', '名下资产列表字段', '展示资产/耗材、大类、小类、标签号、说明、配置、数量、状态、部件数量。', 'borrowing-audit-employee-assets'),
    bound('BA2-AL-007', '#8.5.2', '名下资产概览', '展示名下总资产数和借用资产数。', 'borrowing-audit-employee-assets'),
    bound('BA2-AL-008', '#8.5', '名下资产只读', '弹窗只用于辅助判断，不允许直接改台账。', 'borrowing-audit-employee-assets'),
    review('BA2-AL-009', '#8.3/#8.4', '仓库变更后的锁/配给重算', '更换办理仓库需解除旧资产锁并按新仓库重新选择。', '页面会把不属于新仓库的 matchedAsset 清空，但没有持久化资产锁，因此无法证明真实“解锁旧资产→锁定新资产”的并发规则。', 'borrowing-audit-warehouse-change'),
  ],

  [ASSET_BORROWING_SCOPES.approval]: [
    bound('BA2-AU-001', '#9.1', '审批页只读', '领导审批只能查看申请人和借用明细，不允许修改申请数据。', 'borrowing-audit-approval-readonly'),
    bound('BA2-AU-002', '#9.1', '审批意见长度', '审批意见最多400字，同意可空、驳回必填。', 'borrowing-approval-opinion', '::control::'),
    review('BA2-AU-003', '#9.2', '库管员待办分配', '审批通过后根据办理仓库匹配有出库权限的库管员。', 'BorrowingApprovalPage 只把 currentNode 改为“库管员发放”，没有仓库→库管员映射或具体待办处理人。', 'borrowing-audit-approval-agree-effects'),
    review('BA2-AU-004', '#9.2/#14', '审批通过通知', '分别通知申请人办理地点和库管员发放待办。', '当前只显示前端 success message，没有服务号通知记录或发送实现。', 'borrowing-audit-approval-agree-effects'),
    review('BA2-AU-005', '#9.3/#14', '领导驳回通知', '驳回后通知申请人驳回节点和原因。', '当前驳回只更新 localStorage 单据状态，没有服务号通知。', 'borrowing-audit-approval-reject-effects'),
    review('BA2-AU-006', '#9.3', '驳回真实解锁', '驳回时解除所有已配给实物资产的业务锁。', '当前只是把 matchedAsset 置空；系统本身没有持久化资产锁。', 'borrowing-audit-approval-reject-effects'),
    skip('BA2-AU-007', '#9.3', '加签', '按工作流现有通用加签能力处理。', '通用工作流能力已经由第一轮 coverage 明确，不重复占用借用业务重点标注。'),
  ],

  [ASSET_BORROWING_SCOPES.issue]: [
    bound('BA2-IS-001', '#10.2', '申请人信息', '发放页只读展示申请人、日期、公司、办公区、联系方式和部门。', 'borrowing-audit-issue-status-display'),
    review('BA2-IS-002', '#10.2', '资产状态展示', '选择实物后必须展示资产状态供库管员核对。', 'BorrowingIssuePage 展示盘点状态，但没有独立“资产状态”字段。', 'borrowing-audit-issue-status-display'),
    review('BA2-IS-003', '#10.1/#12.1', '公司板块/资产标记最终校验', '重新配给和最终出库均需校验公司板块权限、资产标记为空。', 'validateIssueData 只校验仓库、materialId、三种状态和 locked，没有公司/板块权限或资产标记字段。', 'borrowing-audit-issue-final-validation'),
    review('BA2-IS-004', '#12.1', '借用日期最终校验', '执行出库前再次校验借用开始/结束日期有效。', 'validateIssueData 没有重新校验 startDate/endDate。', 'borrowing-audit-issue-final-validation'),
    review('BA2-IS-005', '#10.2', '确认方式选择', '发起现场确认前应按扫码/刷卡/输入工号三种方式处理，不得硬编码。', 'BorrowingIssuePage 的 confirmMethod 来自申请默认值且没有可选择控件，新申请默认固定“狐小e扫码确认”。', 'borrowing-audit-confirm-method'),
    bound('BA2-IS-006', '#10.3/#11', '待确认状态流转', '发起确认后进入员工确认节点，员工确认成功后返回库管员发放节点。', 'borrowing-audit-confirm-method'),
    review('BA2-IS-007', '#12.2', '真实借用出库单', '核心出库页生成借用出库单并关联源借用申请单号。', 'executeOut 仅生成 CK-JY 字符串写回申请记录，没有创建核心出库单业务对象或出库页数据。', 'borrowing-audit-outbound-effects'),
    review('BA2-IS-008', '#12.2', '操作历史/事务/报表', '出库同步生成资产操作历史、事务记录并更新相关报表。', '当前只在借用申请 approvalHistory 追加“执行出库”记录，没有独立资产操作历史/事务/报表更新。', 'borrowing-audit-outbound-effects'),
    review('BA2-IS-009', '#12.3', '资产台账回写', '出库回写责任人、部门、成本中心/费用科目、地点、状态和使用说明。', 'assetBorrowingService 只保存借用申请 localStorage，没有资产台账写入能力。', 'borrowing-audit-outbound-effects'),
    review('BA2-IS-010', '#12.2', '升级耗材同步出库', '主资产升级耗材同步进入出库明细并更新耗材台账。', '页面只计算部件数量，未展示升级耗材子表；executeOut 也没有耗材台账处理。', 'borrowing-audit-outbound-effects'),
    review('BA2-IS-011', '#14', '出库完成通知', '出库后通知申请人并展示借用开始、结束日期。', '当前执行出库只有前端 success message，没有服务号通知。', 'borrowing-audit-outbound-effects'),
    review('BA2-IS-012', '#10.3/#14', '放弃领用真实副作用', '放弃领用解除持久化锁、无出库数据并通知申请人。', '当前“取消”只清空 matchedAsset、更新借用申请状态和前端提示；没有真实资产解锁或服务号通知。', 'borrowing-audit-abandon-effects'),
  ],

  [ASSET_BORROWING_SCOPES.confirm]: [
    bound('BA2-CF-001', '#11.1', '申请人/部门', '展示借用申请人和部门。', 'borrowing-audit-confirm-details'),
    review('BA2-CF-002', '#11.1', '关联升级耗材', '存在升级耗材时员工确认页同步展示。', '当前借用确认表格没有关联升级耗材字段或子表。', 'borrowing-audit-confirm-details'),
    bound('BA2-CF-003', '#11.1', '保管职责', '员工现场确认前展示资产保管职责。', 'borrowing-confirm-custody'),
    review('BA2-CF-004', '#11.2', '手工工号确认方式', '手工工号为独立兜底方式，查询人员并二次确认身份。', '当前输入工号和刷卡共用同一输入框/按钮，最终总是记录“刷卡确认”。', 'borrowing-audit-confirm-manual'),
    review('BA2-CF-005', '#11.2', '狐小e真实账号校验', '扫码账号必须与申请人一致。', '“模拟扫码确认”直接 confirm(狐小e扫码确认)，没有取得或校验实际扫码账号。', 'borrowing-audit-confirm-qr'),
    bound('BA2-CF-006', '#11.1/#11.2', '确认记录持久化', '确认方式、确认人、确认时间写回借用单并返回库管员发放。', 'borrowing-audit-confirm-record'),
    review('BA2-CF-007', '#11/#14', '确认后库管员通知', '员工确认成功后库管员收到可执行出库的待办/通知。', '当前只把 currentNode 改回“库管员发放”并向当前员工页面显示 success；没有库管员服务号通知或待办消息。', 'borrowing-audit-confirm-record'),
  ],
};

const COVERAGE_STATUS_OVERRIDES = {
  'BA-AP-003': {
    status: 'review',
    reason: '升级耗材“随主资产一并出库”属于真实出库副作用；当前发放/确认页没有升级耗材明细，executeOut 也没有耗材台账更新。',
  },
  'BA-AP-015': {
    status: 'review',
    reason: '续借入口确实已下线，但PRD还要求按结束日期执行T-7/T-3/逾期每日/逾期7天升级提醒；当前 service 没有任何提醒调度或通知实现。',
  },
  'BA-AU-005': {
    status: 'review',
    reason: '领导同意目前只切换 currentNode，未按办理仓库分配实际库管员，也没有向申请人/库管员发送服务号通知。',
  },
  'BA-AU-006': {
    status: 'review',
    reason: '驳回会清空 matchedAsset，但当前模块没有持久化业务锁，因此无法证明“解除已配给资产锁定”已实现。',
  },
  'BA-IS-013': {
    status: 'review',
    reason: '当前 executeOut 仅写入 outOrderNo、申请状态和 approvalHistory；没有真实核心出库单、资产操作历史、事务/报表、资产台账或升级耗材出库。',
  },
  'BA-IS-015': {
    status: 'review',
    reason: '放弃领用当前只有页面成功提示，没有服务号通知申请人流程结束。',
  },
};

function mergeScopeMaps(baseByScope = {}, additionsByScope = {}) {
  const result = {};
  const scopes = new Set([...Object.keys(baseByScope || {}), ...Object.keys(additionsByScope || {})]);
  scopes.forEach((pageScope) => {
    result[pageScope] = [...(baseByScope[pageScope] || []), ...(additionsByScope[pageScope] || [])];
  });
  return result;
}

export function applyAssetBorrowingAnnotationAudit(baseByScope = {}) {
  return mergeScopeMaps(baseByScope, assetBorrowingAuditAnnotationsByScope);
}

export function applyAssetBorrowingCoverageAudit(baseByScope = {}) {
  const correctedBase = Object.fromEntries(Object.entries(baseByScope || {}).map(([pageScope, requirements]) => [
    pageScope,
    (requirements || []).map((requirement) => {
      const override = COVERAGE_STATUS_OVERRIDES[requirement.id];
      return override ? { ...requirement, ...override } : requirement;
    }),
  ]));
  return mergeScopeMaps(correctedBase, assetBorrowingAuditCoverageByScope);
}

export default assetBorrowingAuditAnnotationsByScope;
