// 资产申请模块第二轮 PRD 深审补充。
// 目标：不推翻第一轮已稳定的标注，只补齐被摘要掉的关键业务规则，并修正少数过粗/过度乐观的审计结论。

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

export const ASSET_APPLICATION_AUDIT_SCOPES = {
  apply: scope('物资申请'),
  approval: scope('业务审批'),
  allocation: scope('资产配给'),
  summary: scope('统一申请汇总-资产'),
  claim: scope('ES前台领用'),
  confirm: scope('员工领用确认'),
};

export const assetApplicationAuditAnnotationsByScope = {
  [ASSET_APPLICATION_AUDIT_SCOPES.apply]: [
    note({
      id: 'asset-apply-notice-read',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.apply, 'button', '已阅读'),
      kind: 'action-rule',
      title: '进入申请页必须先完成申请须知确认',
      priority: 'P0',
      availability: 'dynamic',
      rules: [
        '进入物资申请页时展示申请须知，弹窗不允许通过遮罩、ESC 或右上角关闭。',
        '用户点击“已阅读”后才关闭须知；须知需保留资产/耗材汇总周期、目录缺失咨询人和外地分公司咨询说明。',
      ],
    }),
    note({
      id: 'asset-apply-eligibility-matrix',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.apply, 'card', '本次申请明细'),
      title: '可申请范围由员工类型、物料权限和临时授权共同决定',
      priority: 'P0',
      rules: [
        '正式员工：展示“正式员工可申请=是”且启用的物料。',
        '实习生：展示“实习生可申请=是”且启用的物料。',
        '临时可申请：部门、员工、是否包含下级部门任一条件匹配且未超过结束日期时加入可申请范围；三类结果按并集去重。',
      ],
    }),
    note({
      id: 'asset-apply-intern-computer-limit',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.apply, 'card', '本次申请明细'),
      title: '实习生已有电脑时不得再次申请主机或笔记本',
      priority: 'P0',
      rules: [
        '实习生名下已有主机或笔记本时，不允许再次申请主机/笔记本；已有显示器但无电脑时仍可申请电脑。',
        '命中限制时需明确提示“您名下已有电脑类设备，根据实习生领用规则，您无法再申请资产！”。',
      ],
    }),
    note({
      id: 'asset-apply-overstandard-algorithm',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '是否超标'),
      kind: 'table-column-rule',
      title: '是否超标必须按苹果、人员属性、互斥小类和部门人均量计算',
      priority: 'P0',
      rules: [
        '苹果电脑识别：资产名称包含“苹果”且资产分类属于 PC 或 NOTEBOOK。',
        '技术/设计人员取 HR 人员序列映射；视频编辑标签通过 PS 接口按工号查询。',
        '电脑类、摄影摄像类按 PRD 互斥小类统计“名下已有数量 + 本次申请数量”，达到阈值后判定个人超标。',
        '部门超标需按当前审批人管辖范围计算现使用量、人均量和采购后人均量，并决定是否继续向上审批。',
      ],
    }),
    note({
      id: 'asset-apply-overstandard-confirm',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '存在个人超标时提交前必须二次确认',
      priority: 'P0',
      availability: 'dynamic',
      rules: [
        '个人超标不阻断提交，但提交前需统计超标申请行数量并弹出二次确认。',
        '提示需明确超标行数及“将自动提交至部门7级及以上领导审批”；用户确认后才真正提交。',
      ],
    }),
    note({
      id: 'asset-apply-submit-result',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交成功后需生成正确单号、流程进度和领用联系人提示',
      priority: 'P0',
      availability: 'dynamic',
      rules: [
        '资产申请单按 CA 编号规则生成；资产与耗材混合申请时生成不同业务单据和单号。',
        '非超标申请先走直属领导，再走直属5级及以上领导；超标申请按完整审批矩阵流转。',
        '提交成功后申请记录可查询状态与审批进度，并提示联系人由申请人部门、公司、办公区匹配仓库后取默认库管员，展示电话和邮箱。',
      ],
    }),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.approval]: [
    note({
      id: 'asset-approval-timeout-policy',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.approval,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.approval, 'card', '审批信息'),
      title: '业务审批节点存在3个工作日超时上转与特殊自动驳回规则',
      priority: 'P0',
      rules: [
        '普通业务审批节点处理时限为3个工作日，ES配给/汇总/领用及其审批节点不适用。',
        '普通审批人超期未处理时自动上转直属上级；向 VP/老板直接汇报的审批人超期上转时自动驳回申请。',
        '正常流转到 Charles 的待办永不过期；下级超时上转到 Charles 时直接驳回。',
      ],
    }),
    note({
      id: 'asset-approval-node-capabilities',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.approval,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.approval, 'card', '审批操作'),
      title: '审批按钮必须按当前节点配置开放，不是固定四个按钮',
      priority: 'P0',
      rules: [
        '流程引擎需支持同意、驳回、回退/返回、转交、加签、延期等标准能力，页面按当前节点权限动态显示。',
        '进入老板或 VP 前必须先经过其直接汇报人；审批人去重及后续节点计算由流程规则决定。',
      ],
    }),
    note({
      id: 'asset-approval-countersign-persist',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.approval,
      target: cardTarget('审批操作', 'button', '加签'),
      kind: 'action-rule',
      title: '加签必须真实写入审批链并保留处理记录',
      rules: [
        '加签不是页面提示动作；选择加签人后应生成新的待办/审批记录，并在审批历史中可追溯。',
      ],
    }),
    note({
      id: 'asset-approval-history-audit',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.approval,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.approval, 'card', '审批信息'),
      title: '审批环节、人员、状态、时间和意见必须完整留痕',
      rules: [
        '审批记录需保留审批环节、实际处理人、审批状态、处理时间和审批意见；流程结束后仍可查询。',
      ],
    }),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.allocation]: [
    note({
      id: 'asset-allocation-split-order',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.allocation,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.allocation, 'card', '申请物资明细'),
      title: '业务审批完成后按“申请行 × 数量”拆成独立配给单',
      priority: 'P0',
      rules: [
        '每一申请行按数量拆成独立 MA 配给任务；例如数量3应生成3张配给单，每张通常数量为1。',
        '每张配给单保留来源申请单、来源申请行、申请人、申请用途、配置、超标结果和参考单价等关联信息。',
      ],
    }),
    note({
      id: 'asset-allocation-handler-mapping',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.allocation,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.allocation, 'card', '申请人信息'),
      title: 'ES配给处理人必须按子公司/板块映射',
      priority: 'P0',
      rules: [
        '集团/媒体、视频、焦点、上海媒体分公司、广州媒体分公司分别按 PRD 配给人员映射派发。',
        '页面应展示配给流水号与当前处理人，权限也按该映射控制。',
      ],
    }),
    note({
      id: 'asset-allocation-current-assets-detail',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.allocation,
      target: cardTarget('申请人信息', 'button', '查看名下资产'),
      kind: 'action-rule',
      title: '名下资产弹窗的查询条件、数量统计和列表字段均有固定口径',
      rules: [
        '顶部统计当前申请人名下全部资产数和借用资产数，仅用于辅助配给判断。',
        '查询条件包括资产标签号、物资总类、资产状态、资产说明、资产用途、是否锁定。',
        '列表至少展示资产大类、小类、标签号、说明、启用日期、配置、数量、状态、部件数量。',
      ],
    }),
    note({
      id: 'asset-allocation-es-comment-rule',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.allocation,
      target: cardTarget('ES 配给处理', 'control', 'ES 建议'),
      kind: 'field-rule',
      title: 'ES建议正常配给可选，驳回时必须填写',
      rules: [
        '正常库存领用/统一采购时 ES 建议可填写；执行驳回时必须填写并回写来源申请行。',
        '配给节点还应支持附件上传，用于补充配给说明或驳回依据。',
      ],
    }),
    note({
      id: 'asset-allocation-progress-audit',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.allocation,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.allocation, 'card', '审批信息'),
      title: '配给完成后必须能查看从申请到领用/采购的完整实时进度',
      rules: [
        '已配给单据需展示申请提交、业务审批、ES配给、库存领用或汇总采购、PR、入库和员工领用等进度。',
      ],
    }),
    note({
      id: 'asset-allocation-stock-notification',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.allocation,
      target: cardTarget('审批操作', 'button', '同意'),
      kind: 'action-rule',
      title: '库存领用配给完成后需生成领用单并发送办理地点通知',
      priority: 'P0',
      rules: [
        '库存领用提交完成后生成资产领用单，通知申请人和库管员。',
        '通知中的联系人由申请人部门、公司、办公区匹配仓库后取默认库管员，并展示手机和邮箱。',
      ],
    }),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.summary]: [
    note({
      id: 'asset-summary-grouping-rule',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.summary, 'table-column', '申请部门'),
      kind: 'table-column-rule',
      title: '统一采购实时汇总并按一级部门/特殊二级部门分组',
      priority: 'P0',
      rules: [
        '配给状态变为统一采购后实时生成汇总数据；默认按一级部门汇总，特殊部门按二级部门汇总。',
        '集团媒体、视频、焦点、上海媒体分公司、广州媒体分公司分别派发到对应 ES 汇总人员。',
      ],
    }),
    note({
      id: 'asset-summary-es-advice-carry',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.summary, 'table-column', 'ES建议'),
      kind: 'table-column-rule',
      availability: 'dynamic',
      title: 'ES建议从配给带入且汇总驳回时必须填写',
      rules: [
        '部门汇总明细默认带入配给节点 ES 建议，汇总人员可修改。',
        '单独驳回某申请时 ES 建议必填；驳回项不进入采购系统，并回写申请单状态、原因并通知申请人。',
      ],
    }),
    note({
      id: 'asset-summary-overstandard-groups',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.summary, 'card', '超标申请'),
      availability: 'dynamic',
      title: '汇总编辑必须分开展示超标与非超标申请',
      rules: [
        '按是否超标分组展示采购申请，导出时两组数据均需包含。',
      ],
    }),
    note({
      id: 'asset-summary-current-usage-calc',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.summary, 'card', '部门现资产参考使用量'),
      availability: 'dynamic',
      title: '部门现资产参考使用量必须按真实人数和资产数量计算',
      priority: 'P0',
      rules: [
        '展示现使用量、现人均用量、申请采购量、采购后人均用量和公司人均用量。',
        '现人均量使用部门在职正式人数作为分母；资产类别根据本次申请动态展示。',
      ],
    }),
    note({
      id: 'asset-summary-attachment-rule',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.summary, 'card', '附件信息'),
      availability: 'dynamic',
      title: '统一采购汇总支持维护附件并随汇总留档',
      rules: ['汇总编辑页支持上传相关附件，审批查看时应保留附件信息。'],
    }),
    note({
      id: 'asset-summary-purchase-sync',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.summary, 'button', '提交'),
      kind: 'action-rule',
      availability: 'dynamic',
      title: '汇总提交不是只切页面：需审批、推采购、生成唯一行ID并接收PO/PR回写',
      priority: 'P0',
      rules: [
        '项目用途与说明必填；汇总提交后进入真实汇总审批。',
        '审批完成后同步采购系统，每个推送明细行生成唯一行 ID，以便采购系统拆单后正确回传。',
        '采购系统回传 PO 单号、PO 状态；PR流程和采购进度需回写申请人、ES配给和汇总页面。',
      ],
    }),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.claim]: [
    note({
      id: 'asset-claim-warehouse-scene',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.claim,
      target: cardTarget('申请人信息', 'detail-field', '当前仓库'),
      kind: 'field-rule',
      title: '库存领用与统一采购的当前仓库规则不同',
      priority: 'P0',
      rules: [
        '库存领用：按部门、公司、办公区与仓库映射带出，可选范围仅限当前公司且当前处理人有出库权限的仓库。',
        '统一采购：当前仓库取资产所在仓库并锁定不可修改。',
      ],
    }),
    note({
      id: 'asset-claim-handler-fallback',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.claim,
      target: cardTarget('申请人信息', 'detail-field', '当前仓库'),
      kind: 'field-rule',
      title: '库管员按办公区与仓库映射查找，无法匹配时兜底杨芊',
      priority: 'P0',
      rules: [
        '先按申请人的部门、公司、办公区找到仓库，再从仓库默认库管员确定处理人。',
        '无法匹配库管员时推送杨芊；转签人也必须具有当前仓库出库权限。',
      ],
    }),
    note({
      id: 'asset-claim-asset-editability',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.claim,
      target: cardTarget('申请资产信息', 'detail-field', '资产标签号'),
      kind: 'field-rule',
      title: '库存领用可重选资产，统一采购资产必须锁定只读',
      priority: 'P0',
      rules: [
        '库存领用时资产可能由配给带出也可能为空，库管员允许重新选择。',
        '统一采购入库后生成的领用单必须使用采购入库对应资产，资产标签号锁定不可修改。',
      ],
    }),
    note({
      id: 'asset-claim-usage-writeback',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.claim,
      target: cardTarget('申请资产信息', 'detail-field', '资产用途'),
      kind: 'field-rule',
      title: '资产用途和使用说明在领用完成后回写资产台账',
      rules: [
        '资产用途枚举统一为员工用机、部门公用、专业用途、其他用途。',
        '领用完成后资产用途、使用说明、地点等字段需回写资产台账。',
      ],
    }),
    note({
      id: 'asset-claim-send-notification',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.claim,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.claim, 'button', '发送领用通知'),
      kind: 'action-rule',
      title: '发送领用通知需推送真实办理地点与联系人信息',
      rules: [
        '通知申请人前往指定地点领取资产，并展示当前仓库默认库管员联系人、电话和邮箱。',
      ],
    }),
    note({
      id: 'asset-claim-abandon-side-effects',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.claim,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.claim, 'button', '弃领'),
      kind: 'action-rule',
      title: '弃领必须结束来源申请行并释放已锁定资产',
      priority: 'P0',
      rules: [
        '弃领需要记录处理意见；完成后来源申请行更新为已驳回/结束，不生成出库，并释放已经锁定的资产。',
      ],
    }),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.confirm]: [
    note({
      id: 'asset-confirm-record-fields',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.confirm,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '员工确认必须记录确认方式、结果和时间',
      rules: [
        '确认记录需区分狐小e扫码、刷卡或手工工号，并保存确认结果与确认时间。',
      ],
    }),
    note({
      id: 'asset-confirm-qr-feedback',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.confirm,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '狐小e扫码确认结果必须回传库管员PC端',
      priority: 'P0',
      rules: [
        '员工移动端扫码后需校验申请人身份，并把成功/失败结果实时反馈到当前库管员办理页面。',
      ],
    }),
    note({
      id: 'asset-confirm-outbound-writeback',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认领用'),
      kind: 'action-rule',
      title: '员工确认成功后自动生成并审核出库单并完成台账回写',
      priority: 'P0',
      rules: [
        '确认成功后再次校验资产仓库与当前仓库一致，自动生成并审核出库单。',
        '更新资产状态、责任人、部门、成本中心、地点、用途、使用说明并生成资产事务记录。',
        '原申请行任务状态、审批人、时间、状态和意见同步回写为完成。',
      ],
    }),
    note({
      id: 'asset-confirm-upgrade-consumables',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.confirm,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.confirm, 'card', '领用物资明细'),
      title: '主资产包含升级耗材时确认出库需同步更新耗材台账',
      priority: 'P0',
      rules: [
        '资产含升级耗材/关联耗材时，员工一次确认后主资产与耗材的领用状态、责任关系和台账需同步更新。',
      ],
    }),
    note({
      id: 'asset-confirm-progress-completion',
      pageKey: ASSET_APPLICATION_AUDIT_SCOPES.confirm,
      target: scopeTarget(ASSET_APPLICATION_AUDIT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '领用完成后申请详情必须保留完整流程和采购信息',
      rules: [
        '详情进度展示申请提交、业务审批、ES配给、库存领用/统一采购、采购/PR、入库和员工领用节点。',
        '统一采购场景还需展示关联 PO 单号、PO 状态和采购/PR审批进度。',
      ],
    }),
  ],
};

export const assetApplicationAuditCoverageByScope = {
  [ASSET_APPLICATION_AUDIT_SCOPES.apply]: [
    bound('AA-AP-012', '6.2.2', '申请须知', '进入申请页必须阅读申请须知后关闭弹窗。', 'asset-apply-notice-read', '::button::'),
    review('AA-AP-013', '6.3-6.4', '申请人信息', 'PRD要求展示申请人、电话、邮箱、公司、部门、办公区、申请日期、员工状态、成本中心。', '当前重构原型不展示申请人信息Card，与PRD字段清单存在已知差异。'),
    review('AA-AP-014', '6.6', '可申请范围', '正式员工、实习生、临时可申请三类结果按并集去重。', '当前 canApply 仅判断正式员工，AssetStoreModal 也未按人员/部门/临时授权过滤物料。', 'asset-apply-eligibility-matrix'),
    review('AA-AP-015', '6.6.1', '实习生电脑限制', '实习生名下已有主机或笔记本时不得再次申请电脑。', '当前页面没有根据名下电脑资产执行实习生限制。', 'asset-apply-intern-computer-limit'),
    bound('AA-AP-016', '6.5', '物资搜索与配置展示', '支持型号/配置模糊搜索，长配置换行且Tooltip完整展示。', 'asset-apply-add-material', '::button::'),
    bound('AA-AP-017', '6.5', '重复物资合并', '重复添加同一物资不新增行，原行数量+1并提示。', 'asset-apply-add-material', '::button::'),
    review('AA-AP-018', '4.4.1', '苹果电脑识别', '名称包含苹果且分类为PC/NOTEBOOK时按苹果电脑规则计算个人超标。', '当前 AssetStoreModal 直接按 A002/A012 等固定 mock ID 标记超标，没有按名称与分类计算。', 'asset-apply-overstandard-algorithm'),
    review('AA-AP-019', '4.4.1', '互斥小类超标', '名下已有数量+本次申请数量达到阈值时判个人超标。', '当前页面未按PRD电脑类/摄影摄像类互斥小类进行实时计算。', 'asset-apply-overstandard-algorithm'),
    review('AA-AP-020', '4.4.2-4.4.3', '人员属性与部门超标', '技术/设计取HR映射、视频编辑取PS标签，并按部门人均量决定后续审批。', '当前 requiresVp/departmentOverStandard 为物料mock字段，没有接入HR/PS标签或部门人均量计算。', 'asset-apply-overstandard-algorithm'),
    review('AA-AP-021', '6.8', '超标二次确认', '存在个人超标时提交前弹出含超标行数的二次确认。', '当前预览页只显示Alert，点击提交后直接 submitApplication，没有二次确认Modal。', 'asset-apply-overstandard-confirm'),
    bound('AA-AP-022', '4.1/6.9', 'CA单号与处理中状态', '提交后生成CA资产申请单并进入处理中。', 'asset-apply-submit-result', '::button::'),
    review('AA-AP-023', '6.9', '提交后联系人提示', '提交成功后提示按部门/公司/办公区匹配的ES前台联系人、电话、邮箱。', '当前成功消息只展示申请单号，没有领用办理联系人信息。', 'asset-apply-submit-result'),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.approval]: [
    review('AA-AU-008', '4.2', '审批时限', '普通业务审批节点处理时限为3个工作日。', '当前页面与service没有工作日计时或deadline字段。', 'asset-approval-timeout-policy'),
    review('AA-AU-009', '4.2', '超时上转', '普通审批人超时自动上转直属上级；向VP/老板直接汇报者超时上转时自动驳回。', '当前审批只在用户点击同意/驳回时推进，不存在超时自动任务。', 'asset-approval-timeout-policy'),
    review('AA-AU-010', '4.2', 'Charles特殊规则', '正常到Charles的待办永不过期；下级超时上转到Charles时直接驳回。', '当前审批模型没有Charles节点及特殊超时策略。', 'asset-approval-timeout-policy'),
    review('AA-AU-011', '4.2/7.5', '节点操作权限', '同意、驳回、回退、转交、加签、延期等能力按节点配置显示。', '当前页面固定展示同意/驳回/返回/加签，没有转交、延期，也没有节点能力配置。', 'asset-approval-node-capabilities'),
    review('AA-AU-012', '7.5', '加签落流程', '加签后产生真实待办与审批记录。', '当前handleCountersign只弹成功消息，没有写入approvalRoute或approvalHistory。', 'asset-approval-countersign-persist'),
    bound('AA-AU-013', '4.8/7.2', '审批留痕', '审批环节、人员、状态、时间和意见在审批信息中保留。', 'asset-approval-history-audit'),
    review('AA-AU-014', '4.3', '完整审批决策矩阵', '技术/视频编辑/个人超标/苹果电脑/部门超标组合按18种矩阵决定最终审批人。', '当前 buildApplication 仅按overStandard/requiresVp拼固定路线，未实现完整18种矩阵。', 'asset-approval-agree'),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.allocation]: [
    bound('AA-AL-009', '4.7/8.1', '配给拆单', '业务审批完成后按申请行×数量生成独立配给单。', 'asset-allocation-split-order'),
    review('AA-AL-010', '8.8', 'MA编号', '配给单编号需符合正式MA编号规则。', '当前service以MA-来源单号-行序-数量序拼接演示编号，尚不能证明符合正式编号规则。', 'asset-allocation-split-order'),
    review('AA-AL-011', '8.2', 'ES配给人员映射', '按子公司/板块映射具体ES配给人并控制权限。', '当前buildAllocationOrders主要按company查ES_ALLOCATION_HANDLERS，未完整体现PRD板块/分公司映射。', 'asset-allocation-handler-mapping'),
    review('AA-AL-012', '8.3/8.7', '配给流水号与处理人', '页面展示独立配给流水号和当前处理人。', '当前页面右上角展示来源申请单号，未突出展示selectedOrder.id配给流水号和处理人。', 'asset-allocation-handler-mapping'),
    bound('AA-AL-013', '8.4', '名下资产统计与查询', '统计总资产/借用资产，并支持标签号、总类、状态、说明、用途、锁定查询。', 'asset-allocation-current-assets-detail', '::button::'),
    review('AA-AL-014', '8.4.2', '名下资产结果字段', '列表需包含启用日期、部件数量等完整字段。', '当前申请人资产列表没有启用日期，部件字段口径也与PRD“部件数量”不完全一致。', 'asset-allocation-current-assets-detail'),
    review('AA-AL-015', '8.6', '匹配资产固定过滤', '资产大类必须与申请资产大类一致，并叠加公司板块权限、状态、资产标记为空、仓库/锁定条件。', '当前filteredAssets只应用用户输入查询条件，没有实现这些系统固定过滤；原第一轮标注“资产小类匹配”口径也需要纠正为资产大类。', 'asset-allocation-asset-range'),
    bound('AA-AL-016', '8.7-8.8', 'ES建议', '正常配给可填，驳回时必填并回写来源申请。', 'asset-allocation-es-comment-rule', '::control::'),
    review('AA-AL-017', '8.8', '配给完整进度', '配给后可查看申请、审批、配给、领用/采购、PR、入库、员工领用全链路进度。', '当前ApprovalHistoryCard主要展示来源申请的业务审批历史，没有完整后续进度。', 'asset-allocation-progress-audit'),
    review('AA-AL-018', '8.8', '库存领用服务号通知', '库存配给完成后生成领用单并通知办理地点、联系人、电话、邮箱。', '当前submitAllocation只提示本地success，未看到服务号通知实现。', 'asset-allocation-stock-notification'),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.summary]: [
    bound('AA-SM-009', '9.1', '实时汇总生成', '统一采购配给完成后实时生成汇总数据。', 'asset-summary-grouping-rule'),
    review('AA-SM-010', '9.1', '部门汇总层级', '默认一级部门、特殊部门二级部门汇总。', '当前syncPurchaseSummaries固定取department前两段，未看到特殊部门配置。', 'asset-summary-grouping-rule'),
    review('AA-SM-011', '9.1', 'ES汇总人员映射', '不同板块/分公司汇总数据派发给指定ES汇总人。', '当前UnifiedAssetApplySummary使用静态mock，未体现汇总人员权限映射。', 'asset-summary-grouping-rule'),
    review('AA-SM-012', '9.3', 'ES建议回带与驳回', '配给ES建议默认带入、可修改；驳回时必填并回写状态/原因/通知。', '当前handleReject只显示演示warning，没有必填校验、状态回写或通知。', 'asset-summary-es-advice-carry'),
    bound('AA-SM-013', '9.4', '超标/非超标分组', '汇总编辑按是否超标分组展示。', 'asset-summary-overstandard-groups'),
    review('AA-SM-014', '9.4.2', '部门资产使用量', '按真实资产数量与在职正式人数计算现/采购后/公司人均量。', '当前部门现资产参考使用量表dataSource为空，未执行计算。', 'asset-summary-current-usage-calc'),
    bound('AA-SM-015', '9.4-9.5', '附件', '汇总编辑可上传附件，审批查看保留。', 'asset-summary-attachment-rule'),
    review('AA-SM-016', '9.5', '项目用途必填', '项目用途与说明必填后才允许提交。', '当前handleSubmit没有校验projectPurpose为空。', 'asset-summary-purchase-sync'),
    review('AA-SM-017', '9.1/9.7', '采购推送与唯一行ID', '审批完成后推采购系统，每个明细行生成唯一行ID并接收PO/PR回写。', '当前handleSubmit只切换到approval视图，未形成真实审批、采购推送或唯一行ID。', 'asset-summary-purchase-sync'),
    review('AA-SM-018', '9.6', '汇总状态与进度回写', '汇总单有处理中/已汇总/已驳回状态，采购进度回写资产申请进度。', '当前UnifiedAssetApplySummary主要用currentView切换展示，没有真实汇总单状态机及上游进度回写。', 'asset-summary-purchase-sync'),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.claim]: [
    review('AA-CL-009', '10.3-10.4', '当前仓库场景规则', '库存领用可按权限选择仓库；统一采购取资产所在仓库且不可修改。', '当前页面无论来源场景都展示同一个可编辑Select，且候选为固定mock仓库。', 'asset-claim-warehouse-scene'),
    review('AA-CL-010', '10.3', '库管员匹配与兜底', '按部门/公司/办公区映射仓库和默认库管员，无法匹配时兜底杨芊。', '当前页面使用静态assetClaimApplication，没有动态库管员匹配。', 'asset-claim-handler-fallback'),
    review('AA-CL-011', '10.2/10.5', '单据备注', '申请人信息区域需提供可编辑单据备注且单独一行。', '当前FrontDeskAssetClaim没有单据备注字段。'),
    review('AA-CL-012', '10.5', '资产标签号可编辑性', '库存领用可重选，统一采购必须锁定只读。', '当前页面没有根据库存/统一采购来源切换资产标签号可编辑性。', 'asset-claim-asset-editability'),
    review('AA-CL-013', '10.5', '资产用途与使用说明', '用途使用统一枚举，使用说明按PRD规则维护并回写台账。', '当前用途枚举为办公使用/研发使用/其他用途，与PRD不一致；使用说明也未见出库后写回。', 'asset-claim-usage-writeback'),
    review('AA-CL-014', '10.3/10.6', '转签', '只允许选择具有当前仓库出库权限的人员进行转签。', '当前页面按钮为“加签”，且handleAction仅成功提示，没有转签人员权限选择。'),
    bound('AA-CL-015', '10.6', '发送领用通知', '向员工推送办理地点与联系人信息。', 'asset-claim-send-notification', '::button::'),
    review('AA-CL-016', '10.6/13', '驳回与打印', '领用页支持驳回及按模板打印领用单/出库单并包含确认记录。', '当前页面没有驳回按钮和打印能力。'),
    review('AA-CL-017', '10.6', '弃领实际副作用', '弃领更新来源申请行、释放锁定资产且不出库。', '当前handleAction仅显示“弃领操作成功”，没有状态更新或资产解锁。', 'asset-claim-abandon-side-effects'),
  ],

  [ASSET_APPLICATION_AUDIT_SCOPES.confirm]: [
    review('AA-CF-007', '11.2', '确认记录字段', '需展示/保存确认方式、确认结果和确认时间。', '当前员工确认页没有确认结果/时间展示，也没有持久化确认方式。', 'asset-confirm-record-fields'),
    review('AA-CF-008', '11.4', '狐小e扫码回传', '员工扫码后结果实时回传库管员PC端。', '当前页面仅渲染QRCode，没有扫码结果回传或PC端状态联动。', 'asset-confirm-qr-feedback'),
    review('AA-CF-009', '11.3', '自动出库与台账回写', '确认成功后自动生成并审核出库单并更新资产台账。', '当前handleConfirm只显示success消息，没有出库单和台账更新。', 'asset-confirm-outbound-writeback'),
    review('AA-CF-010', '11.3', '升级耗材同步', '主资产含升级耗材时同步更新耗材台账。', '当前确认页只展示单条主资产mock，没有升级耗材处理。', 'asset-confirm-upgrade-consumables'),
    review('AA-CF-011', '11.3/12', '上游任务与完整进度', '完成后回写原申请行和审批记录，并保留申请到领用/采购的完整进度。', '当前确认页没有上游状态回写与详情进度能力。', 'asset-confirm-progress-completion'),
    review('AA-CF-012', '14', '领用完成通知', '领用完成后通知申请人和库管员。', '当前确认成功仅本地message提示，未看到服务号通知。', 'asset-confirm-progress-completion'),
  ],
};

export const ASSET_APPLICATION_ANNOTATION_PATCHES = {
  'asset-allocation-asset-range': {
    rules: [
      '候选资产需满足申请人公司/板块领取权限，资产大类与申请资产大类一致，状态仅限在库-待处理/新增/再利用，资产标记为空，并继续受当前仓库与锁定状态限制。',
      '若配给节点暂不确定实物，PRD允许将具体资产留到领用节点再选择。',
    ],
  },
};

export const ASSET_APPLICATION_COVERAGE_PATCHES = {
  'AA-AP-009': {
    object: '是否超标展示',
    rule: '页面展示系统给出的个人/部门超标结果；具体算法另行审计。',
  },
  'AA-SM-005': {
    status: 'review',
    reason: '当前提交仅切换到approval只读视图并显示成功提示，没有真实汇总审批和采购推送。',
  },
  'AA-CL-001': {
    status: 'review',
    reason: '当前仓库候选为固定mock选项，没有按公司、办公区及当前库管员出库权限过滤。',
  },
  'AA-CL-008': {
    status: 'review',
    reason: '当前弃领按钮仅调用handleAction显示成功提示，没有结束来源申请、释放资产或阻止出库。',
  },
  'AA-CF-005': {
    status: 'review',
    reason: '当前确认页没有自动生成出库单或更新资产台账/事务，真实后续动作尚未实现。',
  },
};

function appendByScope(baseMap = {}, supplementMap = {}) {
  const result = {};
  const scopes = new Set([...Object.keys(baseMap), ...Object.keys(supplementMap)]);
  scopes.forEach((pageScope) => {
    result[pageScope] = [...(baseMap[pageScope] || []), ...(supplementMap[pageScope] || [])];
  });
  return result;
}

export function applyAssetApplicationAnnotationAudit(baseMap = {}) {
  const patched = Object.fromEntries(Object.entries(baseMap).map(([pageScope, annotations]) => [
    pageScope,
    (annotations || []).map((annotation) => {
      const patch = ASSET_APPLICATION_ANNOTATION_PATCHES[annotation.id];
      if (!patch) return annotation;
      const next = { ...annotation, ...patch };
      if (patch.rules) {
        next.sections = [{
          title: annotation.sections?.[0]?.title || '研发实现规则',
          items: patch.rules.map(prdItem),
        }];
      }
      delete next.rules;
      return next;
    }),
  ]));
  return appendByScope(patched, assetApplicationAuditAnnotationsByScope);
}

export function applyAssetApplicationCoverageAudit(baseMap = {}) {
  const patched = Object.fromEntries(Object.entries(baseMap).map(([pageScope, requirements]) => [
    pageScope,
    (requirements || []).map((requirement) => ({
      ...requirement,
      ...(ASSET_APPLICATION_COVERAGE_PATCHES[requirement.id] || {}),
    })),
  ]));
  return appendByScope(patched, assetApplicationAuditCoverageByScope);
}

export default assetApplicationAuditAnnotationsByScope;
