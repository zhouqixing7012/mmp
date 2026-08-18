// 新员工/实习生资产领用第二轮 PRD 深审补充。
// 原则：页面有明确评审对象则补标注；接口、定时任务、幂等、回传等后台规则进入 coverage review，不为凑热点强绑页面。

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

export const NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES = {
  claim: scope('新员工领用单'),
  confirm: scope('新员工领用员工确认'),
};

export const newEmployeeClaimAuditAnnotationsByScope = {
  [NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim]: [
    note({
      id: 'new-employee-claim-number-generation',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: cardTarget('使用人信息', 'detail-field', '领用单号'),
      kind: 'field-rule',
      title: '领用单由PS待入职数据自动生成并使用NE编号',
      priority: 'P0',
      rules: [
        '资产系统根据 PS 待入职人员及资产配置自动生成新员工/实习生领用单，并创建对应库管员待办；生成后状态为“处理中”。',
        '领用单编号使用 NE-年月日-5位流水号规则。',
      ],
    }),
    note({
      id: 'new-employee-claim-asset-config-mapping',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: cardTarget('使用人信息', 'detail-field', '资产配置'),
      kind: 'field-rule',
      title: '资产配置按公司 + City + 配置映射生成默认领用明细',
      priority: 'P0',
      rules: [
        '根据“公司 + City + 资产配置”查询新员工领用物料映射；映射到几种物料即默认生成几条领用明细。',
        '资产配置为空且合同已签约时不生成领用单，直接按 NO_ASSET_REQUIRED 回传 PS。',
        '资产配置存在但找不到物料映射时不得静默跳过，应进入待配置处理并通知配置管理员。',
      ],
    }),
    note({
      id: 'new-employee-claim-header-source',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim, 'card', '使用人信息'),
      title: '使用人和组织字段必须来自PS/人员主数据，不允许人工改写',
      rules: [
        '申请人、公司、板块、成本中心、业务线、部门、制单时间和资产配置按 PS 待入职信息及组织映射带出。',
        'City / Building / Floor 默认按办公地点带出并允许现场修改；修改结果用于最终出库和资产台账。',
      ],
    }),
    note({
      id: 'new-employee-claim-remark-rule',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: cardTarget('使用人信息', 'detail-field', '备注'),
      kind: 'field-rule',
      title: '领用单备注初始为空，库管员可在办理时补充',
      rules: [
        'PS remark 可写入入职信息，但生成新员工领用单时单据备注初始值固定为空；办理页面允许库管员后续编辑。',
      ],
    }),
    note({
      id: 'new-employee-claim-asset-selector-detail',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: cardTarget('领用物资明细', 'table-column', '资产标签号'),
      kind: 'table-column-rule',
      title: '选择资产弹窗有固定查询、过滤和回填规则',
      priority: 'P0',
      rules: [
        '查询条件至少包括资产标签号、序列号、板块、资产说明。',
        '候选资产仅允许在库-待处理、在库-新增、在库-再利用，且资产标记为空、未被其他业务锁定、属于当前公司/板块领用权限范围。',
        '选择后按标签号回填序列号、资产总类、资产大类、资产说明、资产状态及其他资产基础信息。',
      ],
    }),
    note({
      id: 'new-employee-claim-inventory-display',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: cardTarget('领用物资明细', 'table-column', '盘点状态'),
      kind: 'table-column-rule',
      title: '盘点人和盘点状态仅在开启中的盘点计划内展示',
      rules: [
        '资产属于盘点计划且计划状态为开启时，展示实际盘点人和盘点状态；盘点状态枚举为代盘、未盘、已盘、报失。',
        '不满足条件时实际盘点人和盘点状态均展示“-”。',
      ],
    }),
    note({
      id: 'new-employee-claim-save-lock',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim, 'button', '保存'),
      kind: 'action-rule',
      title: '保存已选资产时必须真实锁定资产',
      priority: 'P0',
      rules: [
        '领用明细已经选择资产标签号后，保存单据时锁定对应资产。',
        '被当前领用单锁定的资产不得再被其他领用、出库等业务重复选择。',
      ],
    }),
    note({
      id: 'new-employee-claim-delete-unlock',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: cardTarget('领用物资明细', 'button', '删除'),
      kind: 'action-rule',
      title: '删除已锁定资产明细时必须同步解锁',
      priority: 'P0',
      rules: [
        '删除领用明细不仅删除页面行；若该资产已经被当前领用单锁定，删除时必须同步解除资产锁。',
      ],
    }),
    note({
      id: 'new-employee-claim-contract-lifecycle',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim, 'button', '领用确认'),
      kind: 'action-rule',
      title: '领用确认必须以PS合同状态为前置条件',
      priority: 'P0',
      rules: [
        '已签约：允许继续进入员工刷卡确认。',
        '未签约：禁止领用并提示“新员工合同未签订！”。',
        '取消入职：结束库管员待办、解除已锁定资产、领用单置为已驳回并向 PS 回传 REJECTED。',
      ],
    }),
    note({
      id: 'new-employee-claim-confirm-dialog',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim, 'button', '领用确认'),
      kind: 'action-rule',
      title: '领用前校验通过后才弹确认并进入员工刷卡页',
      rules: [
        '先逐条校验资产当前仓库与领用单当前仓库一致；存在不一致时提示“资产不在当前库，请进行移库操作！”并阻断。',
        '仓库和合同校验全部通过后弹“是否确认领用”；取消时停留当前单据，确定后进入员工领用确认页。',
      ],
    }),
    note({
      id: 'new-employee-claim-abandon-effects',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim, 'button', '弃领'),
      kind: 'action-rule',
      title: '弃领不是单纯结束页面，要完成数量、锁定、状态和PS回传',
      priority: 'P0',
      rules: [
        '弃领原因必须使用PRD规定的业务枚举，不允许仅做通用确认。',
        '弃领后所有明细领用数量置0、解除全部资产锁、单据状态改为已驳回、结束当前库管员待办。',
        '实时向 PS 回传 ABANDONED，并携带弃领原因。',
      ],
    }),
  ],

  [NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm]: [
    note({
      id: 'new-employee-confirm-only-card',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '新员工/实习生确认仅保留刷卡和手工工号，不支持扫码或Pad签字',
      priority: 'P0',
      rules: [
        '领用确认方式统一为刷卡；保留管理员手工输入员工工号后执行同一校验。',
        '狐小e扫码不属于本流程确认方式；Pad签字页、清除/确认签字、签名图片保存、签名复核和打印签名图全部下线。',
      ],
    }),
    note({
      id: 'new-employee-confirm-validation-flow',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认领用'),
      kind: 'action-rule',
      title: '刷卡/工号校验通过后还要再次确认合同状态',
      priority: 'P0',
      rules: [
        '刷卡设备写入员工工号后自动触发校验；手工输入工号后回车执行相同校验。',
        '工号与领用单申请人工号不一致时提示“员工工号不匹配！”且不执行任何业务动作。',
        '工号一致后必须再次确认合同仍为已签约，之后才执行领用完成处理。',
      ],
    }),
    note({
      id: 'new-employee-confirm-result-record',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '确认成功必须持久化确认方式、时间和结果',
      rules: [
        '领用单记录员工实际领用确认时间与确认方式；确认结果需可在后续单据和审计记录中查询。',
      ],
    }),
    note({
      id: 'new-employee-confirm-outbound',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm, 'card', '领用物资明细'),
      title: '员工刷卡成功后系统自动生成已完成出库单并更新台账',
      priority: 'P0',
      rules: [
        '员工确认成功后无需库管员再次操作；系统自动生成并审核“领用出库”单并把出库单号回写新员工领用单。',
        '领用单状态改为已完成；资产状态更新为在用-使用中。',
        '资产卡片回写责任人、HR部门、成本中心、费用科目、City、Building、Floor、用途=员工用机、使用说明，并生成资产变更/事务记录。',
      ],
    }),
    note({
      id: 'new-employee-confirm-ps-callback',
      pageKey: NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm, 'card', '领用物资明细'),
      title: '正常领用完成后实时向PS回传SUCCESS及完整发放信息',
      priority: 'P0',
      rules: [
        '正常领用完成时向 PS 回传 SUCCESS，至少包含员工工号、实际发放人、发放时间、领用结果、新员工领用单号和出库单号。',
        'PS 必须返回明确成功/失败结果；资产系统记录请求与响应，失败时支持人工补发。',
      ],
    }),
  ],
};

export const newEmployeeClaimAuditCoverageByScope = {
  [NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.claim]: [
    review('NE-CL-011', '16.1/16.8', '自动生成领用单', '资产系统根据PS待入职信息自动生成NE领用单、处理中状态和库管员待办。', '当前 NewEmployeeAssetClaimPage 使用固定演示数据，未体现由PS数据自动生成。', 'new-employee-claim-number-generation'),
    bound('NE-CL-012', '16.8', 'NE编号', '领用单按NE-年月日-5位流水号生成。', 'new-employee-claim-number-generation', '::detail-field::'),
    review('NE-CL-013', '16.4.1', '定时拉取', '资产系统每周二主动调用PS待入职人员接口。', '属于后台定时任务规则，当前原型没有可验证实现。'),
    review('NE-CL-014', '16.4.1', '幂等键', '待入职人员以员工工号+入职日期幂等；相同组合更新，不同入职日期视为新记录。', '当前原型/前端数据层未体现该幂等规则。'),
    review('NE-CL-015', '16.4.1.1', '人员数据落库', '待入职数据需分别写入PS_EMP_ENTRY_INFO与ARCH_USER，并承担不同后续用途。', '属于接口/数据落库规则，当前原型无法证明已实现。'),
    review('NE-CL-016', '16.5.1', '物料映射', '根据公司+City+资产配置查询映射并按映射物料数生成领用明细。', '当前页面以固定 INITIAL_ROWS 初始化，未体现PS资产配置到物料的自动映射。', 'new-employee-claim-asset-config-mapping'),
    review('NE-CL-017', '16.5.1', '无资产配置-已签约', '资产配置为空且合同已签约时不生成领用单，直接回传NO_ASSET_REQUIRED。', '属于领用单生成前置规则，当前原型未体现。', 'new-employee-claim-asset-config-mapping'),
    review('NE-CL-018', '16.5.1', '无资产配置-未签约', '资产配置为空且合同不是已签约状态时当前任务跳过，不生成领用单、不回传。', '属于后台生成规则，当前原型未体现。'),
    review('NE-CL-019', '16.5.1', '缺失物料映射', '有资产配置但找不到物料映射时进入待配置处理并通知配置管理员，不得静默停留。', '当前原型没有待配置处理状态和配置管理员通知能力。', 'new-employee-claim-asset-config-mapping'),
    bound('NE-CL-020', '16.8.1', '使用人信息', '申请人、公司、板块、成本中心、部门、制单时间、资产配置等字段只读带出。', 'new-employee-claim-header-source'),
    bound('NE-CL-021', '16.8.1', '备注', '领用单生成时备注初始为空，库管员可编辑。', 'new-employee-claim-remark-rule', '::detail-field::'),
    review('NE-CL-022', '16.8.2', '资产选择查询', '选择资产弹窗支持标签号、序列号、板块、资产说明查询。', '当前选择资产弹窗直接展示全部 assetClaimSelectableAssets，没有查询区。', 'new-employee-claim-asset-selector-detail'),
    review('NE-CL-023', '16.8.2', '资产固定过滤', '候选资产仅限三种在库状态、资产标记为空、未锁定且满足公司/板块权限。', '当前选择资产弹窗直接使用 mock 列表，未看到完整固定过滤实现。', 'new-employee-claim-asset-selector-detail'),
    bound('NE-CL-024', '16.8.2', '资产选择回填', '选择标签号后回填序列号、总类、大类、说明、状态等资产信息。', 'new-employee-claim-asset-selector-detail', '::table-column::'),
    review('NE-CL-025', '16.8.2', '盘点字段条件', '实际盘点人/盘点状态仅在资产属于开启中的盘点计划时展示，否则为-。', '当前 INITIAL_ROWS 直接携带盘点人和盘点状态，未体现盘点计划条件判断。', 'new-employee-claim-inventory-display'),
    bound('NE-CL-026', '16.8.2', '领用数量', '正常领用按实际资产数量；弃领时系统自动把所有领用数量置0。', 'new-employee-claim-abandon-effects', '::button::'),
    review('NE-CL-027', '16.8.3', '保存锁定', '保存已选择标签号的明细时锁定资产并阻止其他业务重复选择。', '当前 save 仅提示“新员工领用单已保存”，没有资产锁持久化。', 'new-employee-claim-save-lock'),
    review('NE-CL-028', '16.8.3', '删除解锁', '删除已锁定资产明细时同步解除资产锁。', '当前 deleteRows 仅删除本地 rows，没有解锁资产。', 'new-employee-claim-delete-unlock'),
    bound('NE-CL-029', '16.8.3', '现场新增', '库管员可根据实际发放情况新增资产，不强制与PS预设资产大类一致。', 'new-employee-claim-add', '::button::'),
    review('NE-CL-030', '16.4.2/16.8.3', '合同状态', '已签约允许领用；未签约禁止领用；取消入职结束待办、解锁、驳回并回传REJECTED。', '当前领用单没有合同状态数据或合同状态处理逻辑。', 'new-employee-claim-contract-lifecycle'),
    review('NE-CL-031', '16.4.2', '周三未签约处理', '周三12点前未入职时HR推送未签订合同，系统自动将领用单改为已驳回并回传。', '属于合同接口和后台状态规则，当前原型未体现。'),
    review('NE-CL-032', '16.8.3', '领用确认前置校验', '领用确认前逐条校验资产仓库=当前仓库，并校验合同状态。', '当前 confirmClaim 只校验City/Building/Floor和资产标签号。', 'new-employee-claim-confirm-dialog'),
    bound('NE-CL-033', '16.8.3', '确认弹窗', '前置校验通过后弹“是否确认领用”；取消停留，确定进入员工确认页。', 'new-employee-claim-confirm-dialog', '::button::'),
    review('NE-CL-034', '16.8.3', '弃领原因', '弃领原因必须使用非正常领用（不领用/更换设备/无库存）业务枚举。', '当前 abandon 只有通用确认框，没有原因选择。', 'new-employee-claim-abandon-effects'),
    review('NE-CL-035', '16.8.3', '弃领副作用', '弃领后数量置0、解锁、单据已驳回、结束待办并回传ABANDONED。', '当前 abandon 仅显示“已弃领”成功提示，没有业务状态写回。', 'new-employee-claim-abandon-effects'),
    review('NE-CL-036', '16.4.3', 'PS结果码', 'I03必须区分SUCCESS、ABANDONED、REJECTED、NO_ASSET_REQUIRED四种结果。', '当前原型没有PS结果码和回传实现。'),
    review('NE-CL-037', '16.4.3', 'PS回传字段', '回传至少包含员工工号、实际发放人、发放时间、结果码、原因、领用单号、出库单号。', '当前原型没有PS回传载荷。'),
    review('NE-CL-038', '16.4.3', 'PS回传审计与补发', '记录PS请求/响应，失败后支持人工补发。', '当前原型没有接口调用日志和补发能力。'),
  ],

  [NEW_EMPLOYEE_CLAIM_AUDIT_SCOPES.confirm]: [
    review('NE-CF-006', '16.1/16.2/16.9', '确认方式', '新员工/实习生仅刷卡确认，保留手工工号；扫码和Pad签字全部下线。', '当前页面仍展示狐小e二维码和“模拟扫码确认”，与PRD直接冲突。', 'new-employee-confirm-only-card'),
    bound('NE-CF-007', '16.9', '工号触发', '刷卡设备写入工号自动校验；手工输入回车执行相同校验。', 'new-employee-confirm-validation-flow', '::button::'),
    bound('NE-CF-008', '16.9', '工号不匹配', '工号不一致时提示“员工工号不匹配！”且不执行任何操作。', 'new-employee-confirm-validation-flow', '::button::'),
    review('NE-CF-009', '16.5.3/16.9', '合同二次校验', '工号一致后再次确认合同仍为已签约，才允许执行领用完成。', '当前 confirmByEmployeeId 工号匹配后直接 finishConfirm，没有合同二次校验。', 'new-employee-confirm-validation-flow'),
    bound('NE-CF-010', '16.9', '确认记录展示', '领用单记录实际确认时间、确认方式和确认结果。', 'new-employee-confirm-result-record'),
    review('NE-CF-011', '16.9', '确认记录持久化', '确认方式、时间和结果必须写入业务单据并可审计。', '当前 confirmed 仅保存在 React 本地 state，刷新后丢失。', 'new-employee-confirm-result-record'),
    review('NE-CF-012', '16.5.4/16.9', '自动出库', '刷卡成功后无需库管员再次操作，自动生成并审核已完成领用出库单并回写出库单号。', '当前 finishConfirm 仅更新本地确认状态和成功提示，没有出库单生成。', 'new-employee-confirm-outbound'),
    review('NE-CF-013', '16.5.4/16.9', '领用单状态', '出库成功后新员工领用单状态改为已完成。', '当前确认页没有业务单据状态持久化。', 'new-employee-confirm-outbound'),
    review('NE-CF-014', '16.9', '资产台账回写', '责任人、HR部门、成本中心、费用科目、地点、用途、使用说明和资产状态按领用结果回写。', '当前确认页没有资产台账更新实现。', 'new-employee-confirm-outbound'),
    review('NE-CF-015', '16.5.4/16.9', '资产事务记录', '领用完成同步生成资产变更/资产事务记录。', '当前确认页没有事务记录写入。', 'new-employee-confirm-outbound'),
    review('NE-CF-016', '16.4.3/16.9', 'SUCCESS回传', '正常领用完成后实时向PS回传SUCCESS及完整发放信息。', '当前确认页没有PS回传实现。', 'new-employee-confirm-ps-callback'),
    review('NE-CF-017', '16.4.3', '回传失败补发', 'PS返回失败时记录请求响应并支持人工补发。', '当前原型没有接口失败重试/补发能力。', 'new-employee-confirm-ps-callback'),
  ],
};

const COVERAGE_STATUS_OVERRIDES = {
  'NE-CL-001': {
    status: 'review',
    reason: '页面有当前仓库字段，但 WAREHOUSE_OPTIONS 是固定演示选项，未体现公司、当前库管员和出库权限三项动态过滤。',
  },
  'NE-CL-003': {
    status: 'review',
    reason: '页面有选择资产弹窗，但直接展示 mock 列表，没有查询条件和完整的三种在库状态/资产标记/锁定/公司板块权限过滤。',
  },
  'NE-CL-008': {
    status: 'review',
    reason: '页面有弃领按钮，但当前仅弹确认并提示成功，没有弃领原因、数量置0、解锁、单据驳回、结束待办和PS回传。',
  },
  'NE-CF-004': {
    status: 'review',
    reason: '页面展示了“确认成功后自动完成”的标注，但当前实现仅更新本地 confirmed state，没有真实出库、台账更新或PS回传。',
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

export function applyNewEmployeeClaimAnnotationAudit(baseByScope = {}) {
  return mergeScopeMaps(baseByScope, newEmployeeClaimAuditAnnotationsByScope);
}

export function applyNewEmployeeClaimCoverageAudit(baseByScope = {}) {
  const correctedBase = Object.fromEntries(Object.entries(baseByScope || {}).map(([pageScope, requirements]) => [
    pageScope,
    (requirements || []).map((requirement) => {
      const override = COVERAGE_STATUS_OVERRIDES[requirement.id];
      return override ? { ...requirement, ...override } : requirement;
    }),
  ]));
  return mergeScopeMaps(correctedBase, newEmployeeClaimAuditCoverageByScope);
}

export default newEmployeeClaimAuditAnnotationsByScope;
