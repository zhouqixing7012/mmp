// 合约号码申请模块第二轮 PRD 深审补充。
// 保留第一轮稳定 ID/target，只补被摘要掉的关键规则，并纠正过度乐观的 coverage 状态。

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

export const CONTRACT_NUMBER_AUDIT_SCOPES = {
  authorization: 'route:/yewurules::个人工作台::号码控制',
  application: 'route:/yewurules::个人工作台::合约号码申请',
  allocation: 'route:/yewurules::个人工作台::合约号码ES配给',
  supervisor: 'route:/yewurules::个人工作台::合约号码配给主管审批',
  warehouse: 'route:/yewurules::个人工作台::合约号码库管员待办',
  receiptConfirm: 'route:/yewurules::个人工作台::员工合约号码领取确认',
};

export const contractNumberAuditAnnotationsByScope = {
  [CONTRACT_NUMBER_AUDIT_SCOPES.authorization]: [
    note({
      id: 'contract-audit-auth-formal-employee',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.authorization,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.authorization, 'card', '授权人员列表'),
      title: '授权对象必须是正式员工，授权只控制新建入口',
      priority: 'P0',
      rules: [
        '新增授权人员时必须校验员工状态=正式员工；非正式员工不得开通合约号码申请权限。',
        '授权仅代表可进入并填写申请表，不代表业务申请已审批通过。',
        '停止授权只阻止后续新建申请，不删除历史申请，也不终止已经在途的申请。',
      ],
    }),
    note({
      id: 'contract-audit-auth-notification',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.authorization,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.authorization, 'card', '授权人员列表'),
      title: '授权通知必须真实发送服务号并保留发送结果',
      rules: [
        '已授权员工可由 ES 主动发送合约号码申请服务号通知。',
        '通知不能只展示前端成功提示；需要真实发送结果和失败处理能力。',
      ],
    }),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.application]: [
    note({
      id: 'contract-audit-apply-entry-matrix',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.application,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.application, 'card', '申请信息'),
      title: '进入和提交申请需同时满足正式员工、ES授权和无重复申请',
      priority: 'P0',
      rules: [
        '仅正式员工且已获得 ES 合约号码申请授权才允许进入申请页；直接访问链接也必须做相同权限校验。',
        '员工名下已有合约号码，或已有处理中合约号码申请时，必须阻断再次提交。',
        '申请仅用于因公业务场景，不再因4升5或5级及以上新员工入职自动发放。',
      ],
    }),
    note({
      id: 'contract-audit-apply-business-type',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.application,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.application, 'card', '申请信息'),
      title: '申请类型固定为业务申请且不校验话费申请权限',
      priority: 'P0',
      rules: [
        '申请类型固定为“业务申请”，页面不提供其他类型选择。',
        '因公合约号码申请本身不校验申请人是否具备话费申请权限。',
        '历史个人使用合约号码不可发起话费报销；本流程新发的业务合约号码允许按规则发起话费报销。',
      ],
    }),
    note({
      id: 'contract-audit-apply-base-fields',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.application,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.application, 'card', '申请信息'),
      title: '申请页基础信息需完整展示申请日期、申请人、部门和业务申请类型',
      rules: [
        '申请日期默认系统当前日期；申请人展示姓名-工号；部门展示全路径；申请类型只读为业务申请。',
        '身份证号码只读并脱敏，申请原因由员工填写。',
      ],
    }),
    note({
      id: 'contract-audit-apply-identity-file',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.application,
      target: cardTarget('申请信息', 'detail-field', '上传附件'),
      kind: 'field-rule',
      title: '实名认证附件需校验文件内容约束、格式、大小和必填',
      priority: 'P0',
      rules: [
        '身份证正反面必须放在同一个实名认证文件中。',
        '允许 PDF、Word、JPG、PNG，单文件最大10MB；附件缺失、格式或大小不符合时阻断提交。',
        'ES 配给人员和 ES 主管均需能够查看或下载该附件。',
      ],
    }),
    note({
      id: 'contract-audit-apply-submit-effects',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.application,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.application, 'button', '提交'),
      kind: 'action-rule',
      title: '提交成功必须生成处理中申请和ES配给待办',
      priority: 'P0',
      rules: [
        '提交前校验申请原因、实名认证附件、授权状态、已有号码和在途单据。',
        '提交成功后申请单状态进入“处理中”，直接生成 ES 合约号码管理员配给待办。',
        '本流程下线直属5级及以上领导系统审批，不应再生成该业务审批待办。',
      ],
    }),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.allocation]: [
    note({
      id: 'contract-audit-allocation-number-range',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.allocation,
      target: cardTarget('号码配给', 'detail-field', '电话号码'),
      kind: 'field-rule',
      title: '号码选择需固定过滤可用状态并执行并发锁',
      priority: 'P0',
      rules: [
        '候选号码仅允许“在库（新）”或“在库（旧）”，并且未被其他处理中业务锁定。',
        '选择号码后立即锁定；更换号码时必须先释放原号码，再锁定新号码。',
        'ES配给驳回、主管驳回、撤回或放弃领用时均需释放锁定。',
      ],
    }),
    note({
      id: 'contract-audit-allocation-number-search',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.allocation,
      target: cardTarget('号码配给', 'detail-field', '电话号码'),
      kind: 'field-rule',
      title: '号码选择弹窗默认不展示结果，检索后单选',
      rules: [
        '弹窗默认不展示号码结果，支持按合约号码模糊检索后展示。',
        '列表至少展示序号、标签号、合约号码、套餐金额；一次仅允许单选一个号码。',
      ],
    }),
    note({
      id: 'contract-audit-allocation-number-detail',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.allocation, 'card', '号码配给'),
      title: '选定号码后需带出完整配给信息',
      rules: [
        '选定号码后自动带出品牌、号码说明、套餐内容、套餐金额和号码状态等台账信息。',
        '主管审批页和后续库管员办理页使用同一配给结果，不允许重新选号。',
      ],
    }),
    note({
      id: 'contract-audit-allocation-evidence',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.allocation,
      target: cardTarget('号码配给', 'detail-field', '附件信息'),
      kind: 'field-rule',
      title: '同意前必须上传7级及以上业务审批邮件凭证',
      priority: 'P0',
      rules: [
        '审批邮件附件用于证明业务需求已获得7级及以上领导授权，可包含 VP、CEO-1 等更高层审批。',
        '没有审批邮件附件不得提交同意；附件必须在 ES 主管节点可查看或下载。',
      ],
    }),
    note({
      id: 'contract-audit-allocation-download-log',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.allocation,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.allocation, 'card', '申请信息'),
      title: '实名认证附件和审批凭证的下载需记录操作日志',
      rules: [
        'ES 下载申请人身份证附件或查看审批邮件附件时，需要记录操作人、时间和附件对象等审计信息。',
      ],
    }),
    note({
      id: 'contract-audit-allocation-reject-effects',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.allocation,
      target: cardTarget('审批信息', 'button', '驳回'),
      kind: 'action-rule',
      title: 'ES驳回必须同时结束申请、释放号码并通知申请人',
      priority: 'P0',
      rules: [
        '驳回时审批意见必填；申请单更新为“已驳回”并保留驳回意见。',
        '如已选择号码，必须释放号码锁定；随后向申请人发送驳回通知。',
      ],
    }),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.supervisor]: [
    note({
      id: 'contract-audit-supervisor-readonly-evidence',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.supervisor,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.supervisor, 'card', '号码配给'),
      title: '主管需只读核验完整申请、配给结果和高层审批凭证',
      priority: 'P0',
      rules: [
        '主管页面需只读展示申请类型、申请原因、申请数量、实名认证附件、合约号码、套餐金额。',
        '7级及以上审批邮件附件必须可查看或下载，不应只展示文件名。',
      ],
    }),
    note({
      id: 'contract-audit-supervisor-approve-effects',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.supervisor,
      target: cardTarget('审批信息', 'button', '同意'),
      kind: 'action-rule',
      title: '主管同意需在同一流程事务生成领取通知和库管员待办',
      priority: 'P0',
      rules: [
        '主管同意后同时向申请人发送服务号领取通知，并给对应合约号码仓库的库管员/发放管理员生成待办。',
        '通知和待办应在同一次流程事务中生成；任一失败必须记录并支持补发。',
        '领取通知需包含申请单号、领取地点、联系人和联系电话等必要信息。',
      ],
    }),
    note({
      id: 'contract-audit-supervisor-reject-effects',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.supervisor,
      target: cardTarget('审批信息', 'button', '驳回'),
      kind: 'action-rule',
      title: '主管驳回结束流程并释放号码锁',
      priority: 'P0',
      rules: [
        '驳回时审批意见必填；申请单更新为“已驳回”，释放已配给号码锁并通知申请人。',
      ],
    }),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.warehouse]: [
    note({
      id: 'contract-audit-warehouse-fields',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.warehouse,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.warehouse, 'card', '申请合约号码信息'),
      title: '库管员办理页需展示并维护完整发放字段',
      rules: [
        '展示标签号、合约号码、号码说明、数量、金额、申请原因；城市可选择，子公司按员工信息维护。',
        '申请人区域展示仓库、申请人、联系电话、申请日期、公司、板块、办公区、成本中心、部门和单据备注。',
      ],
    }),
    note({
      id: 'contract-audit-warehouse-claim-transition',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.warehouse,
      target: cardTarget('审批操作', 'button', '领用确认'),
      kind: 'action-rule',
      title: '库管员领用确认只进入员工确认，不得提前完成出库',
      priority: 'P0',
      rules: [
        '库管员现场核验员工和号码后点击领用确认，进入员工本人电子确认页。',
        '此时不得提前生成出库单或把申请置为已完成；只有员工确认成功后才能自动出库。',
      ],
    }),
    note({
      id: 'contract-audit-warehouse-abandon-effects',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.warehouse,
      target: cardTarget('审批操作', 'button', '弃领'),
      kind: 'action-rule',
      title: '放弃领用按完成态结束且不可从原单恢复',
      priority: 'P0',
      rules: [
        '放弃领用不进入员工扫码确认、不生成出库单，流程直接结束。',
        '申请单状态更新为“已完成”，释放号码处理中锁定并恢复可用号码状态。',
        '放弃后原单禁止再次执行正常领用；如仍需号码必须重新发起申请。',
      ],
    }),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm]: [
    note({
      id: 'contract-audit-confirm-page-content',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm, 'card', '领用人信息'),
      title: '员工确认页需完整展示本人、部门、职级和领用号码',
      rules: [
        '申请人信息至少包括申请人、部门全称和职级；合约号码信息展示标签号、号码、号码说明、套餐内容和申请原因。',
      ],
    }),
    note({
      id: 'contract-audit-confirm-method',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm, 'card', '刷卡/扫码确认'),
      title: '目标流程以狐小e扫码形成电子领用确认记录',
      priority: 'P0',
      rules: [
        '本次明确下线员工纸质/手写签字，以狐小e扫码确认替代并生成电子确认记录。',
        '扫码账号必须与当前申请人一致；失败时不得出库，保留待办并通知员工重新确认。',
      ],
    }),
    note({
      id: 'contract-audit-confirm-return',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm, 'button', '返回'),
      kind: 'action-rule',
      title: '员工未确认直接返回时不得改变领用状态',
      rules: [
        '返回不生成任何确认记录，库管员领用待办应保持待处理，员工仍可重新进入确认。',
      ],
    }),
    note({
      id: 'contract-audit-confirm-outbound',
      pageKey: CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm,
      target: scopeTarget(CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm, 'card', '刷卡/扫码确认'),
      title: '确认成功后需原子完成出库、台账、历史和流程状态',
      priority: 'P0',
      rules: [
        '自动生成合约号码出库单和合约号码操作历史；申请单、库管员待办均更新为已完成。',
        '号码解除处理中锁定并更新为“在用-使用中”，仓库清空。',
        '台账责任人、子公司、部门、员工职级、领用日期、申请类型和备注按本次领用结果回写。',
      ],
    }),
  ],
};

export const contractNumberAuditCoverageByScope = {
  [CONTRACT_NUMBER_AUDIT_SCOPES.authorization]: [
    review('CN2-AUTH-001', '3.1/7', '正式员工校验', '仅正式员工可被授权。', '当前新增授权人员数据没有员工状态字段，无法证明仅正式员工可被授权。', 'contract-audit-auth-formal-employee'),
    bound('CN2-AUTH-002', '7.3', '停止授权影响范围', '停止授权仅阻止新建，不删除历史和在途申请。', 'contract-audit-auth-formal-employee'),
    review('CN2-AUTH-003', '7.3', '服务号申请通知', 'ES可向已授权员工发送真实服务号申请通知。', '当前发送通知仅 message.success，没有真实通知接口和发送结果记录。', 'contract-audit-auth-notification'),
    bound('CN2-AUTH-004', '7.4', '新增授权多选', '新增授权人员弹窗支持查询、多选并默认授权。', 'contract-auth-access-control'),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.application]: [
    review('CN2-AP-001', '8.2', '进入权限', '正式员工且已授权才允许进入，直接URL访问同样校验。', '当前 haoma.js 未看到正式员工或授权状态的进入校验。', 'contract-audit-apply-entry-matrix'),
    review('CN2-AP-002', '8.2/8.4', '已有号码与在途申请', '名下已有号码或处理中申请时阻断提交。', '当前提交逻辑仅展示成功提示，未查询已有号码或在途申请。', 'contract-audit-apply-entry-matrix'),
    review('CN2-AP-003', '8.3', '基础字段', '页面展示申请日期、申请人、部门、固定业务申请类型。', '当前申请页未展示申请日期、申请人、部门和申请类型。', 'contract-audit-apply-base-fields'),
    bound('CN2-AP-004', '5.1/8.3', '业务申请类型', '申请类型固定业务申请，不提供其他类型选择。', 'contract-audit-apply-business-type'),
    review('CN2-AP-005', '5.2/8.4', '实名认证附件格式', '身份证正反面同一文件，支持PDF/Word/JPG/PNG且最大10MB，附件必填。', '当前只校验10MB大小，未限制文件格式，Form也未把附件作为提交必填项。', 'contract-audit-apply-identity-file'),
    bound('CN2-AP-006', '8.3', '身份证脱敏', '身份证号只读并隐藏中间位数。', 'contract-apply-id-number-rule'),
    bound('CN2-AP-007', '8.4', '申请原因必填', '申请原因不能为空。', 'contract-apply-reason-rule'),
    review('CN2-AP-008', '8.4', '提交后单据与待办', '提交后生成处理中申请并直接生成ES配给待办。', '当前 submit 只有 message.success/console.log，没有流程数据写入。', 'contract-audit-apply-submit-effects'),
    review('CN2-AP-009', '1.2/5.6', '话费报销关联', '新发业务号码可按规则报销，历史个人使用号码禁止报销。', '当前合约号码申请原型未体现与话费报销资格的联动数据或标识。', 'contract-audit-apply-business-type'),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.allocation]: [
    review('CN2-AL-001', '5.3/9.4', '号码固定过滤', '只展示在库（新）/在库（旧）且未锁定号码。', '当前选择弹窗直接展示全部 candidates，mock中存在“待领用”号码且没有独立锁定字段。', 'contract-audit-allocation-number-range'),
    review('CN2-AL-002', '9.4', '默认不展示', '号码弹窗默认无结果，模糊检索后展示。', '当前弹窗打开后无查询词时直接返回全部 candidates。', 'contract-audit-allocation-number-search'),
    review('CN2-AL-003', '9.4', '选择即锁定/换号释放', '选中号码立即锁定，更换先释放原号码再锁定新号码。', '当前 chooseNumber 只更新 assignedNumber，没有号码锁定状态或换号释放动作。', 'contract-audit-allocation-number-range'),
    review('CN2-AL-004', '9.2/9.3', '配给信息带出', '选择号码后带出品牌、号码说明、套餐内容、金额和号码状态。', '当前号码配给页主要展示电话号码和话费套餐，完整台账字段未展示。', 'contract-audit-allocation-number-detail'),
    bound('CN2-AL-005', '5.4/9.3', '高层审批附件必填', '同意前必须上传7级及以上领导审批邮件附件。', 'contract-audit-allocation-evidence'),
    review('CN2-AL-006', '5.2/9.5', '附件下载日志', '下载实名认证附件或审批凭证需记录操作日志。', '当前 downloadAttachment 直接下载，未写审计日志。', 'contract-audit-allocation-download-log'),
    review('CN2-AL-007', '5.4/10.2', '主管查看审批凭证', '审批邮件附件在主管页可查看或下载。', '当前主管页只显示 allocationAttachment 文件名，没有下载入口。', 'contract-audit-allocation-evidence'),
    review('CN2-AL-008', '9.5', 'ES驳回副作用', '驳回结束申请、释放号码锁并通知申请人。', '当前驳回更新申请状态，但没有真实号码锁释放和通知发送。', 'contract-audit-allocation-reject-effects'),
    review('CN2-AL-009', '9.5', '延期操作', '本版PRD未定义ES配给延期。', '当前页面额外提供“延期”按钮并写延期记录，需要产品确认是否保留。', 'contract-allocation-actions'),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.supervisor]: [
    review('CN2-SV-001', '10.2', '申请/配给信息完整性', '主管只读查看申请类型、申请数量、实名附件、号码、套餐金额及审批凭证。', '当前页面未展示申请类型/申请数量/套餐金额，审批邮件附件仅显示文件名。', 'contract-audit-supervisor-readonly-evidence'),
    review('CN2-SV-002', '10.2', '审批凭证下载', '主管可查看或下载7级及以上审批邮件附件。', '当前 allocationAttachment 没有下载按钮。', 'contract-audit-supervisor-readonly-evidence'),
    review('CN2-SV-003', '10.3/11', '同意通知与待办事务', '同意后同事务生成申请人领取通知与库管员待办，失败可补发。', '当前仅追加库管员历史节点并提示成功，没有真实服务号通知、事务一致性和补发记录。', 'contract-audit-supervisor-approve-effects'),
    review('CN2-SV-004', '10.3', '主管驳回副作用', '驳回释放号码锁并通知申请人。', '当前只更新申请状态/审批历史，无法证明锁释放和通知发送。', 'contract-audit-supervisor-reject-effects'),
    bound('CN2-SV-005', '10.3', '驳回意见', '主管驳回时审批意见必填。', 'contract-supervisor-actions'),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.warehouse]: [
    review('CN2-WH-001', '12.2', '办理字段完整性', '展示数量、城市、子公司、单据备注等完整发放字段。', '当前页面缺少数量和子公司等PRD字段，且备注口径需进一步与PRD字段定义对齐。', 'contract-audit-warehouse-fields'),
    bound('CN2-WH-002', '12.2', '领用确认转场', '领用确认进入员工确认页，不提前出库。', 'contract-audit-warehouse-claim-transition', '::button::'),
    review('CN2-WH-003', '4.3/12.2', '放弃领用状态', '放弃领用不出库，申请单以“已完成”结束。', '当前 submit("弃领") 把 application.status 更新为“已弃领”，与PRD“已完成”不一致。', 'contract-audit-warehouse-abandon-effects'),
    review('CN2-WH-004', '5.3/12.2', '放弃领用释放号码', '放弃领用释放处理中锁定并恢复可用号码。', '当前只把 assignedNumber.status 改为“在库”，没有独立锁对象/并发释放机制。', 'contract-audit-warehouse-abandon-effects'),
    review('CN2-WH-005', '12.2', '放弃后不可恢复', '原单放弃后禁止再次正常领用。', '当前 currentNode 虽改为结束，但需要流程层保证该单不可被重新恢复到领用节点。', 'contract-audit-warehouse-abandon-effects'),
    review('CN2-WH-006', '12.2', '城市/子公司', '城市可选择且默认北京市，子公司按员工信息维护。', '当前城市来自业务数据且有弹窗；页面没有子公司字段。', 'contract-audit-warehouse-fields'),
  ],

  [CONTRACT_NUMBER_AUDIT_SCOPES.receiptConfirm]: [
    review('CN2-CF-001', '13.2', '申请人信息', '员工确认页展示申请人、部门全称和职级。', '当前页面展示使用人、联系电话和部门，但未展示职级。', 'contract-audit-confirm-page-content'),
    bound('CN2-CF-002', '13.2/13.3', '号码与保管职责', '展示号码明细及完整保管职责。', 'contract-receipt-responsibility'),
    review('CN2-CF-003', '1.3/13.4', '确认方式', '目标流程以狐小e扫码确认替代纸质签字。', '当前页面同时开放刷卡/手工工号确认；是否作为兼容入口需与最终产品口径确认。', 'contract-audit-confirm-method'),
    bound('CN2-CF-004', '13.4', '身份校验', '确认员工账号必须与申请人一致，不一致不得出库。', 'contract-receipt-confirm-and-outbound'),
    review('CN2-CF-005', '4.3/13.4', '确认失败重试', '确认失败保留待办、通知员工重新确认且不得出库。', '当前错误会保留员工确认节点，但没有真实重试通知，也没有独立库管员待办状态证明。', 'contract-audit-confirm-method'),
    review('CN2-CF-006', '13.4', '返回不改状态', '返回不生成确认记录，库管员待办保持待处理。', '当前库管员点击领用确认时已把库管员历史节点更新为“已处理”；员工返回不会恢复待处理，与PRD存在差异。', 'contract-audit-confirm-return'),
    review('CN2-CF-007', '14.1', '自动出库单', '确认成功自动生成合约号码出库单并回写流程。', '当前 confirmContractNumberReceipt 没有生成出库单实体或出库单号。', 'contract-audit-confirm-outbound'),
    review('CN2-CF-008', '14.1', '操作历史', '确认成功自动生成合约号码操作历史。', '当前服务仅更新 approval/history 节点，没有独立合约号码操作历史。', 'contract-audit-confirm-outbound'),
    review('CN2-CF-009', '14.1/14.2', '号码台账状态与仓库', '号码更新为在用-使用中并清空仓库。', '当前 assignedNumber.status 仅更新为“已领用”，没有清空号码台账仓库。', 'contract-audit-confirm-outbound'),
    review('CN2-CF-010', '14.2', '台账责任信息', '责任人、子公司、部门、职级、领用日期、申请类型、备注按本次领用回写。', '当前 service 没有合约号码台账字段写回。', 'contract-audit-confirm-outbound'),
    review('CN2-CF-011', '14.1', '库管员待办完成', '成功出库后库管员待办更新为已完成。', '当前 warehouse history 在进入员工确认前已经置为已处理，没有独立待办完成状态。', 'contract-audit-confirm-outbound'),
  ],
};

const COVERAGE_OVERRIDES = {
  'CN-AP-001': {
    status: 'review',
    reason: '当前申请页未展示PRD要求的申请日期、申请人、部门和固定“业务申请”字段，不能将“基础信息完整带出”视为已实现。',
  },
  'CN-AL-003': {
    status: 'review',
    reason: '当前号码选择弹窗未按在库（新）/在库（旧）与锁定状态固定过滤，mock中“待领用”号码也可进入候选。',
  },
  'CN-WH-005': {
    status: 'review',
    reason: '当前弃领状态写为“已弃领”而非PRD“已完成”，且没有独立号码锁释放与禁止恢复机制。',
  },
  'CN-CF-002': {
    status: 'review',
    reason: '身份校验已实现，但“成功后自动完成号码出库”不能由当前 service 证明：未生成出库单、台账写回和操作历史。',
  },
};

function mergeScopeMaps(base = {}, supplement = {}) {
  const result = {};
  const scopes = new Set([...Object.keys(base || {}), ...Object.keys(supplement || {})]);
  scopes.forEach((pageScope) => {
    result[pageScope] = [...(base[pageScope] || []), ...(supplement[pageScope] || [])];
  });
  return result;
}

export function applyContractNumberAnnotationAudit(baseAnnotationsByScope = {}) {
  return mergeScopeMaps(baseAnnotationsByScope, contractNumberAuditAnnotationsByScope);
}

export function applyContractNumberCoverageAudit(baseCoverageByScope = {}) {
  const overridden = {};
  Object.entries(baseCoverageByScope || {}).forEach(([pageScope, requirements]) => {
    overridden[pageScope] = (requirements || []).map((item) => {
      const override = COVERAGE_OVERRIDES[item.id];
      if (!override) return item;
      const next = { ...item, ...override };
      if (next.status !== 'bound') delete next.expectedTargetFragment;
      return next;
    });
  });
  return mergeScopeMaps(overridden, contractNumberAuditCoverageByScope);
}

export default contractNumberAuditAnnotationsByScope;
