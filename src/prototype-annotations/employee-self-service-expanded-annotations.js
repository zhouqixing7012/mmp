// 员工自助模块扩展研发评审标注。
// 覆盖：资产申请、新员工/实习生领用、耗材、资产更换、资产转移、资产退库、合约号码退库。
// 原则：PRD 重点拆为最小规则单元；页面有精确对象则 bound，页面/实现缺失或口径冲突则 review，纯导航等通用行为才 skip。

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

function note({ id, pageKey, target, kind = 'business-rule', title, rules, section = '研发实现规则', availability, priority }) {
  return {
    id,
    pageKey,
    target,
    kind,
    title,
    summary: '',
    summarySource: 'prd',
    position: { side: 'right', align: 'center', gap: 6 },
    sections: [{ title: section, items: (rules || []).map(prdItem) }],
    ...(availability ? { availability } : {}),
    ...(priority ? { priority } : {}),
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

function mergeScopeMaps(...maps) {
  return maps.reduce((result, map) => {
    Object.entries(map || {}).forEach(([pageScope, values]) => {
      result[pageScope] = [...(result[pageScope] || []), ...(values || [])];
    });
    return result;
  }, {});
}

// -----------------------------------------------------------------------------
// 02 资产申请
// -----------------------------------------------------------------------------
export const ASSET_APPLICATION_SCOPES = {
  apply: scope('物资申请'),
  approval: scope('业务审批'),
  allocation: scope('资产配给'),
  summary: scope('统一申请汇总-资产'),
  claim: scope('ES前台领用'),
  confirm: scope('员工领用确认'),
};

const assetApplicationAnnotations = {
  [ASSET_APPLICATION_SCOPES.apply]: [
    note({
      id: 'asset-apply-entry-rules', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.apply, 'card', '本次申请明细'),
      title: '申请准入与物资范围',
      rules: [
        '提交前需校验申请资格和逾期借用情况；存在到期未归还借用资产时不得继续发起新资产申请。',
        '可申请物资需同时满足启用状态和人员/部门配置的申请权限；临时授权还需校验有效期。',
        '资产与耗材允许在同一入口选择，提交后按业务类型拆分为独立单据。',
      ],
    }),
    note({
      id: 'asset-apply-add-material', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.apply, 'button', '添加物资'), kind: 'action-rule',
      title: '添加物资按五级目录与权限筛选',
      rules: [
        '物资选择按物料类型→资产大类→资产小类→品牌→型号逐级筛选，支持多选。',
        '只展示启用且当前申请人有申请权限的物资；重复选择同一物资时合并并增加数量，不重复新增行。',
        '搜索需支持型号、配置等关键字，并保留完整配置文案供申请人判断。',
      ], availability: 'dynamic',
    }),
    note({
      id: 'asset-apply-quantity-rule', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '数量'), kind: 'table-column-rule',
      title: '数量必须为正整数',
      rules: ['数量必填且只能输入大于等于 1 的整数；预览和提交时均需重新校验。'],
    }),
    note({
      id: 'asset-apply-purpose-rule', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '申请用途'), kind: 'table-column-rule',
      title: '申请用途必填并参与审批判断',
      rules: ['申请用途必填；部门公用、员工用机、专业用途等不同用途会影响后续超标及审批规则。'],
    }),
    note({
      id: 'asset-apply-reason-rule', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '申请原因'), kind: 'table-column-rule',
      title: '申请原因必填且最多400字',
      rules: ['申请原因用于说明真实业务需求，必填且最多 400 字。'],
    }),
    note({
      id: 'asset-apply-overstandard-rule', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '是否超标'), kind: 'table-column-rule',
      title: '超标由系统计算，不阻断提交',
      rules: [
        '是否超标由系统根据人员标签、已有资产和申请物资自动计算，申请人不可手工修改。',
        '个人超标不直接阻断提交，而是增加对应 7 级及以上/部门超标审批节点。',
      ],
    }),
    note({
      id: 'asset-apply-preview-action', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.apply, 'button', '预览'), kind: 'action-rule',
      title: '预览前完成整单必填校验',
      rules: ['至少存在一条申请明细，数量、申请用途、申请原因等必填项全部通过后才进入只读预览。'],
    }),
    note({
      id: 'asset-apply-submit-action', pageKey: ASSET_APPLICATION_SCOPES.apply,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.apply, 'button', '提交'), kind: 'action-rule',
      title: '提交后拆单并进入动态审批链',
      rules: [
        '资产与耗材混合申请需在提交后拆成独立业务单据。',
        '正常申请进入直属领导/5级审批；个人或部门超标时按规则追加对应审批节点。',
        '提交成功后单据状态进入处理中，并保留完整流程记录。',
      ], availability: 'dynamic',
    }),
  ],

  [ASSET_APPLICATION_SCOPES.approval]: [
    note({
      id: 'asset-approval-assets', pageKey: ASSET_APPLICATION_SCOPES.approval,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.approval, 'card', '申请资产信息'),
      title: '审批需查看整单资产及超标信息',
      rules: ['审批页展示申请资产说明、配置、数量、用途、详细说明和超标结果，作为当前审批人判断依据。'],
    }),
    note({
      id: 'asset-approval-opinion', pageKey: ASSET_APPLICATION_SCOPES.approval,
      target: cardTarget('审批操作', 'control', '审批意见'), kind: 'field-rule',
      title: '同意默认同意，驳回意见必填',
      rules: ['同意时审批意见默认“同意”且允许修改；驳回时审批意见必填，最多 400 字。'],
    }),
    note({
      id: 'asset-approval-agree', pageKey: ASSET_APPLICATION_SCOPES.approval,
      target: cardTarget('审批操作', 'button', '同意'), kind: 'action-rule',
      title: '同意后按动态审批矩阵进入下一节点',
      rules: ['同意后根据个人超标、部门超标、视频编辑苹果电脑等规则动态计算下一审批人；流程未结束时单据保持处理中。'],
    }),
    note({
      id: 'asset-approval-reject', pageKey: ASSET_APPLICATION_SCOPES.approval,
      target: cardTarget('审批操作', 'button', '驳回'), kind: 'action-rule',
      title: '驳回整单结束并通知申请人',
      rules: ['驳回需填写审批意见；整单状态更新为已驳回，停止后续审批并通知申请人。'],
    }),
  ],

  [ASSET_APPLICATION_SCOPES.allocation]: [
    note({
      id: 'asset-allocation-view-assets', pageKey: ASSET_APPLICATION_SCOPES.allocation,
      target: cardTarget('申请人信息', 'button', '查看名下资产'), kind: 'action-rule',
      title: '员工名下资产仅用于辅助配给判断',
      rules: ['弹窗仅查看当前申请人名下资产，支持按标签号、资产状态、资产说明等条件查询，不修改资产数据。'],
    }),
    note({
      id: 'asset-allocation-match-status', pageKey: ASSET_APPLICATION_SCOPES.allocation,
      target: cardTarget('ES 配给处理', 'detail-field', '匹配状态'), kind: 'field-rule',
      title: '配给必须选择库存领用或统一采购',
      rules: [
        '库存领用进入现有库存资产配给/领用链路；统一采购进入资产汇总采购链路。',
        '配给提交后需同步更新来源申请行状态，并保留与后续领用/采购数据的关联。',
      ],
    }),
    note({
      id: 'asset-allocation-asset-range', pageKey: ASSET_APPLICATION_SCOPES.allocation,
      target: cardTarget('ES 配给处理', 'button', '匹配资产'), kind: 'action-rule',
      title: '库存资产选择必须满足固定可出库范围',
      rules: [
        '候选资产需满足申请人公司/板块领用权限、资产小类匹配、在库可出库状态、资产标记为空且未被其他业务锁定。',
        '若配给节点暂不确定实物，PRD允许将具体资产留到领用节点再选择。',
      ], availability: 'dynamic',
    }),
    note({
      id: 'asset-allocation-reject', pageKey: ASSET_APPLICATION_SCOPES.allocation,
      target: cardTarget('审批操作', 'button', '驳回'), kind: 'action-rule',
      title: '配给驳回需填写ES意见并结束对应申请',
      rules: ['驳回时 ES 意见必填；更新配给单及来源申请行状态，并向申请人发送驳回通知。'],
    }),
    note({
      id: 'asset-allocation-submit', pageKey: ASSET_APPLICATION_SCOPES.allocation,
      target: cardTarget('审批操作', 'button', '同意'), kind: 'action-rule',
      title: '配给提交按匹配状态进入领用或采购',
      rules: ['库存领用进入前台领用；统一采购进入统一申请汇总，单据关联关系需可追溯。'],
    }),
  ],

  [ASSET_APPLICATION_SCOPES.summary]: [
    note({
      id: 'asset-summary-line-review', pageKey: ASSET_APPLICATION_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.summary, 'button', '驳回'), kind: 'action-rule',
      title: '汇总明细支持按申请人/明细驳回',
      rules: ['ES 汇总人可对不进入本次统一采购的申请明细执行驳回，并保留 ES 建议用于通知申请人。'], availability: 'dynamic',
    }),
    note({
      id: 'asset-summary-description', pageKey: ASSET_APPLICATION_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.summary, 'card', 'ES汇总说明'),
      title: 'ES汇总说明自动生成并允许修改',
      rules: ['系统按汇总周期、公司/部门、申请数量和预计费用生成默认说明；汇总人可在提交前修改。'], availability: 'dynamic',
    }),
    note({
      id: 'asset-summary-project-purpose', pageKey: ASSET_APPLICATION_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.summary, 'card', '项目用途说明'),
      title: '项目用途说明用于采购系统/PR同步',
      rules: ['项目用途说明必填并随汇总采购数据向下游采购/PR系统传递。'], availability: 'dynamic',
    }),
    note({
      id: 'asset-summary-export', pageKey: ASSET_APPLICATION_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.summary, 'button', '导出申请明细'), kind: 'action-rule',
      title: '汇总申请支持导出当前有效明细',
      rules: ['导出内容应与当前参与汇总的有效申请明细一致，并保留申请单、人员、物料、数量、金额及超标信息。'], availability: 'dynamic',
    }),
    note({
      id: 'asset-summary-submit', pageKey: ASSET_APPLICATION_SCOPES.summary,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.summary, 'button', '提交'), kind: 'action-rule',
      title: '汇总提交后不可编辑并进入审批/采购链路',
      rules: ['提交后锁定汇总内容进入 ES 审批；最终通过后推送采购系统，每条采购数据需携带唯一行ID以承接采购拆单。'], availability: 'dynamic',
    }),
  ],

  [ASSET_APPLICATION_SCOPES.claim]: [
    note({
      id: 'asset-claim-warehouse', pageKey: ASSET_APPLICATION_SCOPES.claim,
      target: cardTarget('申请人信息', 'detail-field', '当前仓库'), kind: 'field-rule',
      title: '当前仓库按组织与库管权限限定',
      rules: ['默认按申请人部门、公司、办公区映射；仅允许选择当前公司且当前库管员具有出库权限的仓库。'],
    }),
    note({
      id: 'asset-claim-asset-tag', pageKey: ASSET_APPLICATION_SCOPES.claim,
      target: cardTarget('申请资产信息', 'detail-field', '资产标签号'), kind: 'field-rule',
      title: '领用资产需满足库存和权限固定条件',
      rules: ['资产需位于当前仓库、满足公司/板块领用权限、物料匹配、可出库状态、资产标记为空且未锁定。'],
    }),
    note({
      id: 'asset-claim-location', pageKey: ASSET_APPLICATION_SCOPES.claim,
      target: cardTarget('申请资产信息', 'detail-field', 'City'), kind: 'field-rule',
      title: 'City / Building / Floor 级联维护',
      rules: ['City、Building、Floor 必填；City变化后清空 Building/Floor，Building变化后清空 Floor，出库后回写资产台账。'],
    }),
    note({
      id: 'asset-claim-confirm', pageKey: ASSET_APPLICATION_SCOPES.claim,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.claim, 'button', '领用确认'), kind: 'action-rule',
      title: '领用确认前再次校验仓库和必填信息',
      rules: ['进入员工确认前逐条校验资产当前仓库与单据当前仓库一致；不一致提示“资产不在当前库，请进行移库操作！”并阻断。'],
    }),
    note({
      id: 'asset-claim-abandon', pageKey: ASSET_APPLICATION_SCOPES.claim,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.claim, 'button', '弃领'), kind: 'action-rule',
      title: '弃领结束本次领用并释放资产',
      rules: ['弃领后结束本次领用流程，释放已锁定资产，不生成出库单，并通知申请人。'],
    }),
  ],

  [ASSET_APPLICATION_SCOPES.confirm]: [
    note({
      id: 'asset-confirm-responsibility', pageKey: ASSET_APPLICATION_SCOPES.confirm,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.confirm, 'card', '确认提示及保管职责'),
      title: '员工确认前需阅读资产保管职责',
      rules: ['员工确认收到资产并接受保管职责；电子签能力下线，统一使用刷卡/工号或狐小e扫码确认。'],
    }),
    note({
      id: 'asset-confirm-card', pageKey: ASSET_APPLICATION_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认领用'), kind: 'action-rule',
      title: '刷卡/工号确认必须校验申请人身份',
      rules: ['刷卡设备写入或人工输入的员工工号必须等于当前申请人工号；不一致时提示“员工工号不匹配！”并禁止出库。'],
    }),
    note({
      id: 'asset-confirm-qr', pageKey: ASSET_APPLICATION_SCOPES.confirm,
      target: scopeTarget(ASSET_APPLICATION_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '确认成功后自动执行出库与台账更新',
      rules: ['员工确认成功后系统自动生成出库单，更新资产状态、责任人、部门、成本中心、地点、用途和使用说明，并生成资产事务记录。'],
    }),
  ],
};

const assetApplicationCoverage = {
  [ASSET_APPLICATION_SCOPES.apply]: [
    bound('AA-AP-001', '申请全局规则', '申请准入', '提交前校验申请资格与逾期借用；物资受启用及权限配置控制。', 'asset-apply-entry-rules'),
    review('AA-AP-002', '申请资格', '员工类型', '正式员工、实习生及有效临时授权按配置决定可申请范围。', '当前 AssetApplyPage 直接以 employeeStatus===正式员工作为 canApply，未体现实习生和临时授权口径。'),
    review('AA-AP-003', '提交校验', '逾期借用', '存在逾期借用资产未归还时阻断新资产申请。', '当前 AssetApplyPage 未看到逾期借用校验。'),
    bound('AA-AP-004', '物资选择', '添加物资', '按五级目录、启用状态和人员权限筛选；重复物资合并数量。', 'asset-apply-add-material', '::button::'),
    review('AA-AP-005', '申请明细', '配置字段', '物资说明与配置应分别展示。', '当前列表把 config 作为物资说明单元格的次级文案，没有独立“配置”列。'),
    bound('AA-AP-006', '申请明细', '数量', '数量为大于等于1的整数。', 'asset-apply-quantity-rule', '::table-column::'),
    bound('AA-AP-007', '申请明细', '申请用途', '申请用途必填并参与后续审批判断。', 'asset-apply-purpose-rule', '::table-column::'),
    bound('AA-AP-008', '申请明细', '申请原因', '申请原因必填，最多400字。', 'asset-apply-reason-rule', '::table-column::'),
    bound('AA-AP-009', '超标规则', '是否超标', '系统计算个人/部门超标并影响审批路径。', 'asset-apply-overstandard-rule', '::table-column::'),
    review('AA-AP-010', '提交拆单', '资产与耗材拆单', '混合申请提交后资产与耗材拆成不同业务单据。', '当前 AssetApplyPage 的 buildApplication 将当前 materials 直接组成一个 application，未体现资产/耗材按业务类型拆单。', 'asset-apply-submit-action'),
    review('AA-AP-011', '审批矩阵', '动态审批路由', '根据个人超标、部门超标、视频编辑苹果规则等动态构造审批链。', '当前 approvalRoute 主要依据是否超标拼接固定节点，尚未完整体现 PRD 动态矩阵。', 'asset-apply-submit-action'),
  ],
  [ASSET_APPLICATION_SCOPES.approval]: [
    bound('AA-AU-001', '业务审批', '申请资产信息', '审批人查看整单资产、配置、用途和超标结果。', 'asset-approval-assets'),
    bound('AA-AU-002', '业务审批', '审批意见', '同意默认同意；驳回必填，最多400字。', 'asset-approval-opinion', '::control::'),
    bound('AA-AU-003', '业务审批', '同意', '同意后按审批矩阵进入下一节点。', 'asset-approval-agree', '::button::'),
    bound('AA-AU-004', '业务审批', '驳回', '驳回整单结束并通知申请人。', 'asset-approval-reject', '::button::'),
    review('AA-AU-005', '审批矩阵', 'VP/CEO-1与超标审批', '进入VP/CEO前必须先经过VP/CEO-1，并按个人/部门超标动态查找审批人。', '当前 AssetApprovalPage 基于 application.approvalRoute 静态推进，页面层未体现完整动态查找与 VP/CEO-1 规则。'),
    review('AA-AU-006', '审批参考', '部门现资产参考使用量', '部门超标相关审批应展示当前部门资产参考使用量。', '当前业务审批页未展示部门现资产参考使用量。'),
    review('AA-AU-007', '视频编辑', '苹果电脑审批提示', '视频编辑标签员工申请苹果电脑时展示特殊审批规则提示。', '当前业务审批页未看到视频编辑苹果电脑特殊规则提示。'),
  ],
  [ASSET_APPLICATION_SCOPES.allocation]: [
    bound('AA-AL-001', 'ES配给', '员工名下资产', '可查看申请人名下资产辅助判断。', 'asset-allocation-view-assets', '::button::'),
    bound('AA-AL-002', 'ES配给', '匹配状态', '匹配状态为库存领用或统一采购。', 'asset-allocation-match-status', '::detail-field::'),
    bound('AA-AL-003', 'ES配给', '库存资产选择', '库存资产受公司板块、状态、标记、锁定等固定规则过滤。', 'asset-allocation-asset-range', '::button::'),
    review('AA-AL-004', 'ES配给', '库存资产可延后选择', '配给节点可暂不选具体资产，后续领用节点再选择。', '当前 AssetAllocationPage 在库存领用提交时强制 matchedAsset 非空，与PRD允许后续再选冲突。', 'asset-allocation-asset-range'),
    review('AA-AL-005', 'ES配给', '库存固定过滤条件', '候选资产必须满足公司/板块权限、可出库状态、资产标记为空、未锁定。', '当前弹窗主要通过界面查询条件过滤，未看到完整固定权限/状态/资产标记/锁定过滤。', 'asset-allocation-asset-range'),
    review('AA-AL-006', 'ES配给', '附件', '配给节点支持附件补充。', '当前配给页未展示附件区域。'),
    bound('AA-AL-007', 'ES配给', '驳回', '驳回需ES意见并更新来源申请状态。', 'asset-allocation-reject', '::button::'),
    bound('AA-AL-008', 'ES配给', '提交', '按匹配状态进入领用或统一采购。', 'asset-allocation-submit', '::button::'),
  ],
  [ASSET_APPLICATION_SCOPES.summary]: [
    bound('AA-SM-001', '统一申请汇总', '明细驳回', '汇总明细支持逐项/逐申请人驳回并保留ES建议。', 'asset-summary-line-review', '::button::'),
    bound('AA-SM-002', '统一申请汇总', 'ES汇总说明', '系统默认生成且允许汇总人修改。', 'asset-summary-description'),
    bound('AA-SM-003', '统一申请汇总', '项目用途说明', '必填并同步至采购/PR系统。', 'asset-summary-project-purpose'),
    bound('AA-SM-004', '统一申请汇总', '导出', '支持导出当前有效汇总申请明细。', 'asset-summary-export', '::button::'),
    bound('AA-SM-005', '统一申请汇总', '提交', '提交后进入ES审批并最终推送采购系统。', 'asset-summary-submit', '::button::'),
    review('AA-SM-006', '统一申请汇总', '部门现资产参考使用量', '汇总/审批需展示部门现资产参考使用量。', '当前 UnifiedAssetApplySummary 中 renderCurrentUsage 的 dataSource 为空数组，页面没有实际参考数据。'),
    review('AA-SM-007', '统一申请汇总', '汇总审批操作', '汇总提交后应由对应审批人执行同意/驳回。', '当前组件 approval 视图主要为只读结果展示，未看到真实同意/驳回操作。'),
    review('AA-SM-008', '统一申请汇总', 'PO信息', '采购系统返回后展示PO单号、状态等信息。', '当前统一资产汇总页面未展示PO信息Card。'),
  ],
  [ASSET_APPLICATION_SCOPES.claim]: [
    bound('AA-CL-001', '资产领用', '当前仓库', '按公司、办公区与库管员出库权限限定。', 'asset-claim-warehouse', '::detail-field::'),
    bound('AA-CL-002', '资产领用', '资产标签号', '选择资产需满足仓库、权限、状态、标记及锁定规则。', 'asset-claim-asset-tag', '::detail-field::'),
    review('AA-CL-003', '资产领用', '资产固定过滤范围', '候选资产必须满足完整公司板块权限、状态、资产标记为空和未锁定。', '当前 FrontDeskAssetClaim 的候选弹窗未看到完整固定过滤规则。', 'asset-claim-asset-tag'),
    bound('AA-CL-004', '资产领用', '地点', 'City/Building/Floor级联并回写台账。', 'asset-claim-location', '::detail-field::'),
    review('AA-CL-005', '资产领用', '资产用途枚举', '资产用途沿用员工用机、部门用机、专业用途、其他用途等统一枚举。', '当前页面使用“办公使用/研发使用/其他用途”，与PRD及统一口径不一致。'),
    review('AA-CL-006', '资产领用', '盘点信息展示条件', '仅资产处于开启中的盘点计划时展示盘点执行人和盘点状态。', '当前页面始终渲染盘点执行人/盘点状态并以“-”兜底。'),
    bound('AA-CL-007', '资产领用', '领用确认', '确认前校验资产当前仓库和必填字段。', 'asset-claim-confirm', '::button::'),
    bound('AA-CL-008', '资产领用', '弃领', '弃领结束流程、释放资产且不出库。', 'asset-claim-abandon', '::button::'),
  ],
  [ASSET_APPLICATION_SCOPES.confirm]: [
    bound('AA-CF-001', '员工领用确认', '保管职责', '员工确认前阅读并接受资产保管职责。', 'asset-confirm-responsibility'),
    bound('AA-CF-002', '员工领用确认', '刷卡/工号', '确认工号必须与申请人工号一致。', 'asset-confirm-card', '::button::'),
    review('AA-CF-003', '员工领用确认', '身份校验实现', '刷卡/手工输入工号与申请人不一致时禁止确认。', '当前 EmployeeAssetClaimConfirm 的 handleConfirm 只校验非空，未见与申请人工号比对。', 'asset-confirm-card'),
    review('AA-CF-004', '员工领用确认', '已阅读门槛', 'PRD要求员工先确认已阅读保管职责后才能完成确认。', '当前确认页没有“已阅读并同意”复选门槛。'),
    bound('AA-CF-005', '员工领用确认', '确认后动作', '确认成功后自动生成出库单并更新资产台账/事务。', 'asset-confirm-qr'),
    review('AA-CF-006', '员工领用确认', '真实出库联动', '确认成功需真正执行出库、单据完成和台账写回。', '当前页面 handleConfirm 主要展示成功消息，未看到出库/台账状态写回实现。'),
  ],
};

// -----------------------------------------------------------------------------
// 03 新员工/实习生资产领用
// -----------------------------------------------------------------------------
export const NEW_EMPLOYEE_CLAIM_SCOPES = {
  claim: scope('新员工领用单'),
  confirm: scope('新员工领用员工确认'),
};

const newEmployeeClaimAnnotations = {
  [NEW_EMPLOYEE_CLAIM_SCOPES.claim]: [
    note({
      id: 'new-employee-claim-warehouse', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.claim,
      target: cardTarget('使用人信息', 'detail-field', '当前仓库'), kind: 'field-rule',
      title: '仓库按公司、办公地点和库管权限匹配',
      rules: ['默认仓库由员工办公地点映射；仅允许选择领用单公司下且当前库管员具有出库权限的仓库。'],
    }),
    note({
      id: 'new-employee-claim-location', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.claim,
      target: cardTarget('使用人信息', 'detail-field', 'City'), kind: 'field-rule',
      title: 'City / Building / Floor 必填并级联',
      rules: ['地点默认由待入职人员办公地点带出，可修改；City/Building变化时需清空下级地点。'],
    }),
    note({
      id: 'new-employee-claim-assets', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_SCOPES.claim, 'card', '领用物资明细'),
      title: '资产选择、锁定与释放必须成套处理',
      rules: [
        '候选资产限在库-待处理/新增/再利用，资产标记为空、未锁定并满足公司板块领用权限。',
        '保存已选择标签号的明细时锁定资产；删除、弃领、取消入职、驳回时同步解除锁定。',
      ],
    }),
    note({
      id: 'new-employee-claim-add', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.claim,
      target: cardTarget('领用物资明细', 'button', '新增'), kind: 'action-rule',
      title: '允许按现场实际情况新增资产',
      rules: ['库管员可新增实际发放资产，不强制完全按照PS预设资产配置的大类发放。'],
    }),
    note({
      id: 'new-employee-claim-confirm', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_SCOPES.claim, 'button', '领用确认'), kind: 'action-rule',
      title: '领用确认前校验仓库、合同和资产完整性',
      rules: [
        '逐条校验资产当前仓库=领用单当前仓库，不一致提示“资产不在当前库，请进行移库操作！”。',
        '员工合同必须已签约；未签约提示“新员工合同未签订！”，取消入职则结束待办、解锁资产并回传REJECTED。',
      ],
    }),
    note({
      id: 'new-employee-claim-abandon', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.claim,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_SCOPES.claim, 'button', '弃领'), kind: 'action-rule',
      title: '弃领原因必选并回传ABANDONED',
      rules: [
        '弃领原因枚举：非正常领用（不领用）/非正常领用（更换设备）/非正常领用（无库存）。',
        '弃领后领用数量置0、解除全部资产锁、单据已驳回、待办结束，并将原因实时回传PS。',
      ],
    }),
  ],
  [NEW_EMPLOYEE_CLAIM_SCOPES.confirm]: [
    note({
      id: 'new-employee-confirm-employee-id', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认领用'), kind: 'action-rule',
      title: '刷卡或输入工号必须与领用人一致',
      rules: ['刷卡设备写入或手工输入工号后立即校验；与申请人工号不一致时提示“员工工号不匹配！”且不得出库。'],
    }),
    note({
      id: 'new-employee-confirm-complete', pageKey: NEW_EMPLOYEE_CLAIM_SCOPES.confirm,
      target: scopeTarget(NEW_EMPLOYEE_CLAIM_SCOPES.confirm, 'card', '领用物资明细'),
      title: '确认成功后自动完成出库、台账和PS回传',
      rules: [
        '员工确认成功后无需库管员二次操作，系统自动生成已完成出库单。',
        '更新领用单为已完成、资产状态为在用-使用中，并回写责任人、组织、地点、用途和事务记录。',
        '正常领用向PS回传SUCCESS。',
      ],
    }),
  ],
};

const newEmployeeClaimCoverage = {
  [NEW_EMPLOYEE_CLAIM_SCOPES.claim]: [
    bound('NE-CL-001', '16.5/16.8', '当前仓库', '仓库按公司、办公地点及库管员出库权限匹配。', 'new-employee-claim-warehouse', '::detail-field::'),
    bound('NE-CL-002', '16.8', '地点', 'City/Building/Floor默认带出且可级联修改。', 'new-employee-claim-location', '::detail-field::'),
    bound('NE-CL-003', '16.5.2', '资产选择', '候选资产状态/标记/锁定/公司板块权限需满足固定范围。', 'new-employee-claim-assets'),
    review('NE-CL-004', '16.5.2', '资产锁定', '保存资产后锁定，删除/弃领/取消入职/驳回时解锁。', '当前 NewEmployeeAssetClaimPage 的保存/删除主要更新页面状态，未看到持久化资产锁和成套解锁实现。', 'new-employee-claim-assets'),
    bound('NE-CL-005', '16.8.3', '新增资产', '允许根据现场情况新增实际发放资产。', 'new-employee-claim-add', '::button::'),
    bound('NE-CL-006', '16.8.3', '领用确认', '进入员工确认前校验仓库和合同状态。', 'new-employee-claim-confirm', '::button::'),
    review('NE-CL-007', '16.8.3', '仓库/合同校验实现', '确认前资产仓库必须与单据仓库一致且合同已签约。', '当前 confirmClaim 仅校验地点和资产标签号，未看到资产仓库一致性与合同状态校验。', 'new-employee-claim-confirm'),
    bound('NE-CL-008', '16.8.3', '弃领', '弃领需选择原因并更新数量、锁定、单据及PS回传。', 'new-employee-claim-abandon', '::button::'),
    review('NE-CL-009', '16.8.3', '弃领原因', '弃领原因必须从三个业务枚举中选择。', '当前弃领只有通用确认框，没有弃领原因枚举。', 'new-employee-claim-abandon'),
    review('NE-CL-010', '16.4', 'PS接口联动', '处理结果需区分SUCCESS/ABANDONED/REJECTED/NO_ASSET_REQUIRED并记录请求响应。', '当前原型页面未体现PS结果码、调用日志及失败补发能力。'),
  ],
  [NEW_EMPLOYEE_CLAIM_SCOPES.confirm]: [
    bound('NE-CF-001', '16.9', '工号校验', '刷卡/手工输入工号必须等于申请人工号。', 'new-employee-confirm-employee-id', '::button::'),
    review('NE-CF-002', '16.2/16.9', '确认方式', '新员工/实习生领用仅保留刷卡/工号确认，Pad和其他确认方式下线。', '当前确认页仍展示“狐小 e 扫码确认”二维码，与PRD“仅刷卡确认”冲突。'),
    review('NE-CF-003', '16.5.3', '合同二次校验', '工号一致后仍需再次确认合同状态为已签约。', '当前确认页只校验工号，未看到合同状态二次校验。'),
    bound('NE-CF-004', '16.5.4/16.9', '确认后处理', '成功后自动生成出库单、更新台账并回传PS。', 'new-employee-confirm-complete'),
    review('NE-CF-005', '16.9', '真实出库/PS联动', '确认成功应真正落出库、台账和PS回传。', '当前页面主要更新本地 confirmed 状态并提示成功，未看到真实出库和PS联动。', 'new-employee-confirm-complete'),
  ],
};

// -----------------------------------------------------------------------------
// 05 耗材申请
// -----------------------------------------------------------------------------
export const CONSUMABLE_SCOPES = {
  apply: scope('物资申请'),
  mis: scope('耗材MIS鉴定'),
  approval: scope('耗材审批'),
  allocation: scope('耗材配给'),
  claim: scope('耗材领用'),
  confirm: scope('员工耗材领用确认'),
  summary: scope('耗材汇总'),
  summaryApproval: scope('耗材汇总审批'),
};

const consumableAnnotations = {
  [CONSUMABLE_SCOPES.apply]: [
    note({
      id: 'consumable-apply-main-asset', pageKey: CONSUMABLE_SCOPES.apply,
      target: cardTarget('本次申请明细', 'table-column', '关联主资产'), kind: 'table-column-rule',
      title: '需关联主资产的耗材必须选择有效主资产',
      rules: ['物料配置“是否关联主资产=是”时主资产标签号必填；候选仅限申请人名下在用-使用中资产，并按配置的主资产物料小类进一步过滤。'],
    }),
    note({
      id: 'consumable-apply-route', pageKey: CONSUMABLE_SCOPES.apply,
      target: scopeTarget(CONSUMABLE_SCOPES.apply, 'button', '提交'), kind: 'action-rule',
      title: '耗材提交按MIS属性进入鉴定或5级审批',
      rules: ['任一申请行“是否MIS审核=是”时整单进入MIS鉴定且不拆单；否则直接进入直属5级及以上领导审批。'], availability: 'dynamic',
    }),
  ],
  [CONSUMABLE_SCOPES.mis]: [
    note({
      id: 'consumable-mis-visible-lines', pageKey: CONSUMABLE_SCOPES.mis,
      target: scopeTarget(CONSUMABLE_SCOPES.mis, 'card', '申请耗材信息'),
      title: 'MIS仅处理需要鉴定的申请行',
      rules: ['MIS页面只展示“是否MIS审核=是”且尚未驳回的申请行；不需要MIS的行不在此节点出现。'],
    }),
    note({
      id: 'consumable-mis-opinion', pageKey: CONSUMABLE_SCOPES.mis,
      target: cardTarget('申请耗材信息', 'table-column', 'MIS意见'), kind: 'table-column-rule',
      title: 'MIS意见必须选择鉴定通过/不通过',
      rules: ['MIS意见必填，枚举为“鉴定通过、鉴定不通过”；意见说明最多400字，鉴定不通过时必须填写。'],
    }),
    note({
      id: 'consumable-mis-agree', pageKey: CONSUMABLE_SCOPES.mis,
      target: scopeTarget(CONSUMABLE_SCOPES.mis, 'button', '同意'), kind: 'action-rule',
      title: 'MIS同意后有效行进入5级审批',
      rules: ['同意前校验当前可见行MIS意见；通过后保留有效申请行进入直属5级及以上领导审批。'],
    }),
    note({
      id: 'consumable-mis-reject', pageKey: CONSUMABLE_SCOPES.mis,
      target: scopeTarget(CONSUMABLE_SCOPES.mis, 'button', '驳回'), kind: 'action-rule',
      title: 'MIS驳回更新行状态并判断整单是否结束',
      rules: ['驳回后当前处理行更新为已驳回；若全部申请行均已驳回则整单结束，否则其他有效行继续进入5级审批。'],
    }),
  ],
  [CONSUMABLE_SCOPES.approval]: [
    note({
      id: 'consumable-approval-whole-order', pageKey: CONSUMABLE_SCOPES.approval,
      target: scopeTarget(CONSUMABLE_SCOPES.approval, 'card', '申请耗材信息'),
      title: '5级及以上领导按整单审批',
      rules: ['领导查看整单全部申请行；同意后仅对有效/MIS通过行按“一行一配给单”生成耗材配给单。'],
    }),
    note({
      id: 'consumable-approval-agree', pageKey: CONSUMABLE_SCOPES.approval,
      target: cardTarget('审批操作', 'button', '同意'), kind: 'action-rule',
      title: '同意后按申请行生成配给单',
      rules: ['同意后每个有效申请行生成一张耗材配给单，来源申请继续处理中直至后续领用/采购完成。'],
    }),
    note({
      id: 'consumable-approval-reject', pageKey: CONSUMABLE_SCOPES.approval,
      target: cardTarget('审批操作', 'button', '驳回'), kind: 'action-rule',
      title: '领导驳回整单结束',
      rules: ['驳回时审批意见必填；全部有效申请行更新为已驳回，整单状态已驳回并通知申请人。'],
    }),
  ],
  [CONSUMABLE_SCOPES.allocation]: [
    note({
      id: 'consumable-allocation-view-assets', pageKey: CONSUMABLE_SCOPES.allocation,
      target: cardTarget('申请人信息', 'button', '查看名下资产'), kind: 'action-rule',
      title: '名下资产用于辅助判断主资产与合理性',
      rules: ['仅查看申请人名下资产，不修改台账。'],
    }),
    note({
      id: 'consumable-allocation-status', pageKey: CONSUMABLE_SCOPES.allocation,
      target: cardTarget('ES配给处理', 'detail-field', '匹配状态'), kind: 'field-rule',
      title: '匹配状态仅库存领用或统一采购',
      rules: ['提交配给单时匹配状态必须为库存领用或统一采购；库存领用生成领用单，统一采购进入公司维度耗材汇总。'],
    }),
    note({
      id: 'consumable-allocation-reject', pageKey: CONSUMABLE_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_SCOPES.allocation, 'button', '驳回'), kind: 'action-rule',
      title: '配给驳回需ES建议',
      rules: ['驳回时ES建议必填；配给单及来源申请行更新为已驳回并通知申请人。'],
    }),
    note({
      id: 'consumable-allocation-submit', pageKey: CONSUMABLE_SCOPES.allocation,
      target: scopeTarget(CONSUMABLE_SCOPES.allocation, 'button', '提交'), kind: 'action-rule',
      title: '提交后按匹配状态更新来源申请',
      rules: ['库存领用进入领用链路；统一采购来源申请行继续处理中并进入耗材汇总；申请整单状态按所有行状态统一计算。'],
    }),
  ],
  [CONSUMABLE_SCOPES.claim]: [
    note({
      id: 'consumable-claim-warehouse', pageKey: CONSUMABLE_SCOPES.claim,
      target: cardTarget('申请人信息', 'detail-field', '当前仓库'), kind: 'field-rule',
      title: '仓库按部门、公司、办公区映射并受出库权限限制',
      rules: ['根据申请人部门、公司、办公区匹配默认仓库；库管员仅处理本人有出库权限的仓库。'],
    }),
    note({
      id: 'consumable-claim-tag', pageKey: CONSUMABLE_SCOPES.claim,
      target: cardTarget('申请耗材信息', 'detail-field', '耗材标签号'), kind: 'field-rule',
      title: '低值耐用品有标签，普通耗材无标签',
      rules: ['低值耐用品必须选择耗材标签号并带出序列号/台账信息；普通耗材标签号为空。'],
    }),
    note({
      id: 'consumable-claim-scrap-date', pageKey: CONSUMABLE_SCOPES.claim,
      target: cardTarget('申请耗材信息', 'detail-field', '是否延长报废期'), kind: 'field-rule',
      title: '内存/硬盘关联主资产时支持延长ES实物报废期',
      rules: ['仅低值耐用品且小类为内存或硬盘并已关联主资产时展示；勾选后按规则更新主资产ES实物报废期。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-claim-primary', pageKey: CONSUMABLE_SCOPES.claim,
      target: scopeTarget(CONSUMABLE_SCOPES.claim, 'button', '领用确认'), kind: 'action-rule',
      title: '领用主按钮随员工确认状态切换',
      rules: ['未发起时为“领用确认/发起领用确认”；待员工确认时应禁用并显示等待；员工确认后变为“执行出库”。'],
    }),
    note({
      id: 'consumable-claim-abandon', pageKey: CONSUMABLE_SCOPES.claim,
      target: scopeTarget(CONSUMABLE_SCOPES.claim, 'button', '弃领'), kind: 'action-rule',
      title: '弃领时处理意见必填',
      rules: ['弃领需填写处理意见；单据结束且不执行耗材出库。'],
    }),
    note({
      id: 'consumable-claim-notify', pageKey: CONSUMABLE_SCOPES.claim,
      target: scopeTarget(CONSUMABLE_SCOPES.claim, 'button', '发送领用通知'), kind: 'action-rule',
      title: '支持再次发送领用通知',
      rules: ['领用通知通过狐小e/Myfamily服务号发送给申请人，并包含领取地点等必要信息。'],
    }),
  ],
  [CONSUMABLE_SCOPES.confirm]: [
    note({
      id: 'consumable-confirm-responsibility', pageKey: CONSUMABLE_SCOPES.confirm,
      target: scopeTarget(CONSUMABLE_SCOPES.confirm, 'card', '确认提示及保管职责'),
      title: '员工确认前阅读耗材保管职责',
      rules: ['员工必须阅读耗材保管职责；PRD要求勾选“已阅读确认”后才允许继续确认。'],
    }),
    note({
      id: 'consumable-confirm-card', pageKey: CONSUMABLE_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认'), kind: 'action-rule',
      title: '刷卡/工号必须校验申请人身份',
      rules: ['输入或刷出的员工工号必须与申请人工号一致，否则提示“员工工号不匹配！”并禁止确认。'],
    }),
    note({
      id: 'consumable-confirm-result', pageKey: CONSUMABLE_SCOPES.confirm,
      target: scopeTarget(CONSUMABLE_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '员工确认后记录方式时间并允许库管出库',
      rules: ['确认成功记录确认时间、确认方式和结果；随后由领用链路生成出库单并更新低值耐用品台账。'],
    }),
  ],
  [CONSUMABLE_SCOPES.summary]: [
    note({
      id: 'consumable-summary-line-advice', pageKey: CONSUMABLE_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_SCOPES.summary, 'button', '驳回'), kind: 'action-rule',
      title: '汇总明细支持ES建议与明细驳回',
      rules: ['汇总人按统一采购明细维护ES建议；驳回明细时保留原汇总说明和项目用途，并向申请人同步ES建议。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-summary-description', pageKey: CONSUMABLE_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_SCOPES.summary, 'card', 'ES汇总说明'),
      title: 'ES汇总说明必填并支持默认生成',
      rules: ['按一周周期、汇总公司、采购数量和预计金额生成默认文案，允许人工修改。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-summary-project', pageKey: CONSUMABLE_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_SCOPES.summary, 'card', '项目用途说明'),
      title: '项目用途说明同步PR系统',
      rules: ['项目用途说明必填、允许修改，并同步至PR系统。'], availability: 'dynamic',
    }),
    note({
      id: 'consumable-summary-submit', pageKey: CONSUMABLE_SCOPES.summary,
      target: scopeTarget(CONSUMABLE_SCOPES.summary, 'button', '提交'), kind: 'action-rule',
      title: '汇总提交后进入ES主管审批',
      rules: ['提交后汇总不可编辑，进入ES主管→ES总监审批；最终通过后推送采购系统并携带唯一行ID。'], availability: 'dynamic',
    }),
  ],
  [CONSUMABLE_SCOPES.summaryApproval]: [
    note({
      id: 'consumable-summary-approval-info', pageKey: CONSUMABLE_SCOPES.summaryApproval,
      target: scopeTarget(CONSUMABLE_SCOPES.summaryApproval, 'card', '审批信息'),
      title: 'ES主管与ES总监依次审批汇总申请',
      rules: ['ES主管同意后进入ES总监；ES总监同意后推送采购系统。任一节点驳回返回ES汇总草稿并通知汇总人。'],
    }),
    note({
      id: 'consumable-summary-approval-agree', pageKey: CONSUMABLE_SCOPES.summaryApproval,
      target: cardTarget('审批信息', 'button', '同意'), kind: 'action-rule',
      title: '同意进入下一审批或采购系统',
      rules: ['根据当前节点进入ES总监或完成审批并推送采购。'],
    }),
    note({
      id: 'consumable-summary-approval-reject', pageKey: CONSUMABLE_SCOPES.summaryApproval,
      target: cardTarget('审批信息', 'button', '驳回'), kind: 'action-rule',
      title: '驳回意见必填并返回汇总草稿',
      rules: ['驳回时审批意见必填；汇总单退回ES汇总草稿并通知汇总人。'],
    }),
  ],
};

const consumableCoverage = {
  [CONSUMABLE_SCOPES.apply]: [
    bound('CO-AP-001', '6/8.1', '关联主资产', '需关联主资产的耗材必须从申请人名下在用资产中选择。', 'consumable-apply-main-asset', '::table-column::'),
    review('CO-AP-002', '6', '主资产过滤', '主资产还需按物料配置的主资产物料小类过滤。', '当前物资申请页的关联主资产能力需结合 AssetStoreModal/数据层进一步确认是否完整按主资产小类过滤。', 'consumable-apply-main-asset'),
    bound('CO-AP-003', '8.1.4', '提交路由', '存在MIS审核行进入MIS，否则进入5级审批。', 'consumable-apply-route', '::button::'),
    review('CO-AP-004', '6/8.1', '重复耗材合并', '重复选择同一耗材时不新增行而是数量+1并提示。', '当前共享物资申请页需结合选择弹窗状态进一步验证耗材重复合并规则。'),
  ],
  [CONSUMABLE_SCOPES.mis]: [
    bound('CO-MI-001', '8.2', '可见申请行', 'MIS仅展示需审核申请行。', 'consumable-mis-visible-lines'),
    bound('CO-MI-002', '8.2.3', 'MIS意见', '意见必填，枚举鉴定通过/鉴定不通过。', 'consumable-mis-opinion', '::table-column::'),
    review('CO-MI-003', '8.2.3/8.2.4', '意见说明', 'PRD字段表写鉴定不通过必填，但校验描述又要求意见说明不为空。', 'PRD自身存在口径交叉；当前实现强制所有可见行填写意见说明，需要产品确认最终口径。', 'consumable-mis-opinion'),
    bound('CO-MI-004', '8.2.4', '同意', '同意后有效行进入5级审批。', 'consumable-mis-agree', '::button::'),
    bound('CO-MI-005', '8.2.4', '驳回', '驳回当前行并判断整单是否结束。', 'consumable-mis-reject', '::button::'),
  ],
  [CONSUMABLE_SCOPES.approval]: [
    bound('CO-AU-001', '8.3', '整单审批', '5级及以上领导查看整单并整单审批。', 'consumable-approval-whole-order'),
    bound('CO-AU-002', '8.3.3', '同意', '同意后按一行一配给单生成配给。', 'consumable-approval-agree', '::button::'),
    bound('CO-AU-003', '8.3.3', '驳回', '驳回整单，审批意见必填。', 'consumable-approval-reject', '::button::'),
  ],
  [CONSUMABLE_SCOPES.allocation]: [
    bound('CO-AL-001', '8.4', '名下资产', 'ES可查看申请人名下资产。', 'consumable-allocation-view-assets', '::button::'),
    bound('CO-AL-002', '8.4.4', '匹配状态', '库存领用/统一采购为配给提交有效状态。', 'consumable-allocation-status', '::detail-field::'),
    bound('CO-AL-003', '8.4.5', '驳回', '驳回需ES建议并同步来源申请。', 'consumable-allocation-reject', '::button::'),
    review('CO-AL-004', '8.4.5', '驳回类型', '匹配状态选择驳回后显示驳回类型：取消申请/填写错误/转资产申请。', '当前 ConsumableAllocationPage 已下线驳回类型字段，PRD仍保留该字段，需要以现行产品口径确认。'),
    bound('CO-AL-005', '8.4.5', '提交', '提交后按匹配状态进入领用或汇总并回写申请行状态。', 'consumable-allocation-submit', '::button::'),
  ],
  [CONSUMABLE_SCOPES.claim]: [
    bound('CO-CL-001', '8.5', '当前仓库', '按组织/办公区映射并限制库管员权限。', 'consumable-claim-warehouse', '::detail-field::'),
    review('CO-CL-002', '8.5', '仓库权限实现', '可选仓库需来自动态映射和当前库管员权限。', '当前页面仓库选项为固定数组，未体现动态权限映射。', 'consumable-claim-warehouse'),
    bound('CO-CL-003', '8.5.4', '耗材标签号', '低值耐用品有标签号/序列号，普通耗材无标签号。', 'consumable-claim-tag', '::detail-field::'),
    bound('CO-CL-004', '8.5.4', '延长报废期', '内存/硬盘且关联主资产时条件展示。', 'consumable-claim-scrap-date', '::detail-field::'),
    bound('CO-CL-005', '8.5.5', '主操作', '发起确认→等待员工确认→执行出库。', 'consumable-claim-primary', '::button::'),
    review('CO-CL-006', '8.5.5', '等待确认状态', '待确认时主按钮显示“等待员工确认”并禁用。', '当前独立 ConsumableClaimPage 的 primaryText 仅区分已确认/未确认，待确认时仍进入确认页；与PRD状态按钮规则不完全一致。', 'consumable-claim-primary'),
    bound('CO-CL-007', '8.5.5', '弃领', '弃领处理意见必填。', 'consumable-claim-abandon', '::button::'),
    bound('CO-CL-008', '8.5.5', '领用通知', '支持发送领用通知。', 'consumable-claim-notify', '::button::'),
  ],
  [CONSUMABLE_SCOPES.confirm]: [
    bound('CO-CF-001', '8.6', '保管职责', '员工确认前展示保管职责。', 'consumable-confirm-responsibility'),
    review('CO-CF-002', '8.6.3', '已阅读确认', '未勾选已阅读确认不可扫码/刷卡确认。', '当前 ConsumableClaimConfirmPage 未展示“已阅读确认”复选框。', 'consumable-confirm-responsibility'),
    bound('CO-CF-003', '8.6.3', '刷卡/工号', '工号必须与申请人工号一致。', 'consumable-confirm-card', '::button::'),
    bound('CO-CF-004', '8.6.3/8.6.4', '确认结果', '记录方式/时间/结果并进入出库台账更新。', 'consumable-confirm-result'),
  ],
  [CONSUMABLE_SCOPES.summary]: [
    bound('CO-SM-001', '8.7', '明细ES建议/驳回', '维护ES建议并支持明细驳回。', 'consumable-summary-line-advice', '::button::'),
    bound('CO-SM-002', '8.7.3', 'ES汇总说明', '默认生成、必填、可修改。', 'consumable-summary-description'),
    bound('CO-SM-003', '8.7.3', '项目用途说明', '必填并同步PR系统。', 'consumable-summary-project'),
    bound('CO-SM-004', '8.7.4', '提交', '提交后不可编辑并进入ES主管审批。', 'consumable-summary-submit', '::button::'),
    review('CO-SM-005', '8.7.4', 'PO信息', '采购系统回传后有数据时展示PO单信息Card。', '当前 ConsumableSummaryPage 未展示PO单信息Card。'),
  ],
  [CONSUMABLE_SCOPES.summaryApproval]: [
    bound('CO-SA-001', '8.8', '审批链', 'ES主管→ES总监依次审批。', 'consumable-summary-approval-info'),
    bound('CO-SA-002', '8.8.3', '同意', '主管同意进入总监；总监同意推送采购。', 'consumable-summary-approval-agree', '::button::'),
    bound('CO-SA-003', '8.8.3', '驳回', '驳回意见必填并退回汇总草稿。', 'consumable-summary-approval-reject', '::button::'),
  ],
};

// -----------------------------------------------------------------------------
// 07 资产更换
// -----------------------------------------------------------------------------
export const ASSET_REPLACEMENT_SCOPES = {
  apply: scope('资产更换申请'),
  mis: scope('MIS鉴定'),
  handling: scope('资产更换办理'),
  confirm: scope('员工资产确认'),
};

const assetReplacementAnnotations = {
  [ASSET_REPLACEMENT_SCOPES.apply]: [
    note({
      id: 'replacement-apply-reason', pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: cardTarget('更换信息说明', 'detail-field', '更换原因'), kind: 'field-rule',
      title: '更换原因必填且最多150字', rules: ['更换原因必填，最多150字。'],
    }),
    note({
      id: 'replacement-apply-assets', pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'card', '退回资产信息'),
      title: '仅本人名下符合可更换规则的资产可提交',
      rules: ['申请人仅正式员工/实习生；资产需责任人为本人、状态在用-使用中、允许更换、未锁定且不属于苹果笔记本/苹果一体机/组装机/工作站。', '批量选择后一个旧资产生成一张独立更换申请单。'],
    }),
    note({
      id: 'replacement-apply-notice', pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: cardTarget('更换须知', 'checkbox', '已阅读并同意'), kind: 'field-rule',
      title: '未确认更换须知不得提交', rules: ['员工须阅读数据迁移和现场退回旧资产等更换须知，并勾选“已阅读并同意”。'],
    }),
    note({
      id: 'replacement-apply-submit', pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'button', '提交'), kind: 'action-rule',
      title: '提交重新校验并锁定旧资产',
      rules: ['提交时重新校验资格、资产状态、业务锁和盘点状态；通过后逐资产拆单、状态处理中、当前节点MIS鉴定，并锁定旧资产。'],
    }),
  ],
  [ASSET_REPLACEMENT_SCOPES.mis]: [
    note({
      id: 'replacement-mis-description', pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: cardTarget('MIS鉴定处理', 'detail-field', '鉴定说明'), kind: 'field-rule',
      title: 'MIS鉴定说明来自固定枚举', rules: ['鉴定说明枚举：无、主板故障、键盘故障、屏幕故障、硬盘故障。'],
    }),
    note({
      id: 'replacement-mis-agree', pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.mis, 'button', '同意'), kind: 'action-rule',
      title: '仅“资产更换”结果允许同意', rules: ['同意时鉴定结果必须为资产更换；通过后进入ES库管员更换办理，并写入维修历史及发送通知。'],
    }),
    note({
      id: 'replacement-mis-reject', pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.mis, 'button', '驳回'), kind: 'action-rule',
      title: '资产维修/员工取消通过驳回结束流程', rules: ['驳回时鉴定结果应为资产维修或员工取消，审批意见必填；旧资产解锁，单据已驳回并结束。'],
    }),
  ],
  [ASSET_REPLACEMENT_SCOPES.handling]: [
    note({
      id: 'replacement-handling-return', pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'button', '退库确认'), kind: 'action-rule',
      title: '旧资产先确认退回再执行入库',
      rules: ['员工先完成旧资产退回确认；确认后库管员执行入库、生成入库单并更新旧资产台账。旧资产未入库前不得进入新资产领取确认。'],
    }),
    note({
      id: 'replacement-handling-return-warehouse', pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'detail-field', '仓库'), kind: 'field-rule',
      title: '退回仓库仅限当前库管员有入库权限', rules: ['默认按申请人公司/部门/办公区映射，仅允许当前库管员有入库权限的仓库。'],
    }),
    note({
      id: 'replacement-handling-new-asset', pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '资产标签号'), kind: 'field-rule',
      title: '新资产必须同小类、可出库且未锁定',
      rules: ['待发放资产必须与旧资产小类一致（特殊PC/NB规则按最终口径），在当前仓库并满足申请人公司/板块领用规则、可出库状态、资产标记及未锁定要求；选择后锁定。'],
    }),
    note({
      id: 'replacement-handling-location', pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '城市'), kind: 'field-rule',
      title: '新资产地点级联并在出库后回写', rules: ['City/Building/Floor必填；修改City清空Building/Floor，修改Building清空Floor。'],
    }),
    note({
      id: 'replacement-handling-issue', pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'button', '领用确认'), kind: 'action-rule',
      title: '新资产领取确认必须在旧资产入库后进行', rules: ['旧资产入库完成且已选择新资产、地点/用途完整后才能发起员工新资产领取确认；员工确认后执行出库并完成更换。'],
    }),
    note({
      id: 'replacement-handling-reject', pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.handling, 'button', '驳回'), kind: 'action-rule',
      title: '不同办理阶段驳回保留已完成的入/出库结果',
      rules: ['旧资产未入库时驳回：解锁旧资产、状态已驳回；旧资产已入库但新资产未出库：保留退库结果、释放新资产、状态已完成，不生成出库单。驳回意见必填。'],
    }),
  ],
  [ASSET_REPLACEMENT_SCOPES.confirm]: [
    note({
      id: 'replacement-confirm-identity', pageKey: ASSET_REPLACEMENT_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认'), kind: 'action-rule',
      title: '两次确认均需校验申请人工号', rules: ['旧资产退回和新资产领取均支持狐小e扫码或刷卡/工号；确认工号必须与申请人工号一致。'],
    }),
    note({
      id: 'replacement-confirm-scene', pageKey: ASSET_REPLACEMENT_SCOPES.confirm,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.confirm, 'card', '确认提示及保管职责'),
      title: '退回与领取展示不同确认文案', rules: ['旧资产退回：确认已将旧资产及配件交还ES；新资产领取：确认已领取新资产并接受资产保管职责。'],
    }),
  ],
};

const assetReplacementCoverage = {
  [ASSET_REPLACEMENT_SCOPES.apply]: [
    bound('AR-AP-001', '4.2/6', '可更换资产', '员工类型、物料配置、责任人、状态、权限、锁定及禁用小类共同决定可更换范围。', 'replacement-apply-assets'),
    bound('AR-AP-002', '6.1', '更换原因', '必填且最多150字。', 'replacement-apply-reason', '::detail-field::'),
    bound('AR-AP-003', '6.1', '更换须知', '必须勾选已阅读并同意。', 'replacement-apply-notice', '::checkbox::'),
    bound('AR-AP-004', '6.2', '提交', '提交重校验、逐资产拆单并锁定旧资产。', 'replacement-apply-submit', '::button::'),
    review('AR-AP-005', '6.2', '盘点校验', '资产处于盘点期且未盘时不得提交。', '页面 submit 只直接调用 service，需以 service 实现确认盘点未盘校验是否完整。', 'replacement-apply-submit'),
  ],
  [ASSET_REPLACEMENT_SCOPES.mis]: [
    bound('AR-MI-001', '8.1', '鉴定说明', '固定故障说明枚举。', 'replacement-mis-description', '::detail-field::'),
    review('AR-MI-002', '8.1/4.5', '鉴定结果', '鉴定结果必须可选择资产维修/资产更换（员工取消按现行口径处理），并与同意/驳回组合校验。', '当前 ReplacementMisPage 没有“鉴定结果”控件，submitMisDecision 传入 result为空字符串，无法实现PRD强制组合校验。'),
    bound('AR-MI-003', '8.2', '同意', '资产更换结果才允许同意进入ES。', 'replacement-mis-agree', '::button::'),
    bound('AR-MI-004', '8.2', '驳回', '维修/取消结果驳回结束并解锁。', 'replacement-mis-reject', '::button::'),
  ],
  [ASSET_REPLACEMENT_SCOPES.handling]: [
    bound('AR-HD-001', '9.4/9.6', '退库确认', '旧资产确认后执行入库。', 'replacement-handling-return', '::button::'),
    review('AR-HD-002', '9.4', '退回仓库权限', '退回仓库仅当前库管员有入库权限。', '当前 WAREHOUSE_OPTIONS 为固定仓库数组，未看到动态库管权限过滤。', 'replacement-handling-return-warehouse'),
    bound('AR-HD-003', '9.5/10', '待发放资产', '同小类、仓库/权限/状态/标记/锁定条件，并在选择后锁定。', 'replacement-handling-new-asset', '::detail-field::'),
    review('AR-HD-004', '10.2/10.4', '新资产重新选择锁', '重新选择需先释放旧选择再锁定新选择；保存失败不得丢失原锁。', '需要结合 assetReplacementService 验证原子锁切换；当前页面状态层无法证明该并发规则。', 'replacement-handling-new-asset'),
    bound('AR-HD-005', '9.5', '地点', 'City/Building/Floor级联。', 'replacement-handling-location', '::detail-field::'),
    bound('AR-HD-006', '9.6', '领用确认', '旧资产入库完成后才能确认领取新资产。', 'replacement-handling-issue', '::button::'),
    bound('AR-HD-007', '9.6', '驳回', '根据已完成入/出库阶段保留结果并释放未完成侧锁定。', 'replacement-handling-reject', '::button::'),
    review('AR-HD-008', '9.4', '资产标记枚举', '资产标记应为硬件老化、组件缺失、设备故障、物理损伤。', '当前 ASSET_MARK_OPTIONS 为无/限制出库/待维修/待数据清理，与PRD不一致。'),
  ],
  [ASSET_REPLACEMENT_SCOPES.confirm]: [
    bound('AR-CF-001', '11', '员工身份确认', '扫码/刷卡/工号均需与申请人工号一致。', 'replacement-confirm-identity', '::button::'),
    bound('AR-CF-002', '11.3', '确认场景', '旧资产退回和新资产领取使用不同确认说明。', 'replacement-confirm-scene'),
    skip('AR-CF-003', '11', 'Pad签字', 'Pad手写签字和签名图片保存下线。', '下线能力无需在新页面保留独立标注目标。'),
  ],
};

// -----------------------------------------------------------------------------
// 08 资产转移（当前工作台仅存在三张审批页，其余PRD节点显式进入review）
// -----------------------------------------------------------------------------
export const ASSET_TRANSFER_SCOPES = {
  approval: scope('资产转移审批'),
  outManager: scope('转出部门经理审批'),
  receiverManager: scope('接收部门经理审批'),
};

function transferApprovalNotes(pageScope, prefix, stageTitle, nextRule) {
  return [
    note({
      id: `${prefix}-info`, pageKey: pageScope,
      target: scopeTarget(pageScope, 'card', '转移资产信息'),
      title: '审批需核对转出人、接收人和整单资产',
      rules: ['转移申请为整单审批；转出人、接收人、转移资产、地点和使用用途均为审批判断依据。'],
    }),
    note({
      id: `${prefix}-opinion`, pageKey: pageScope,
      target: cardTarget('审批操作', 'control', '审批意见'), kind: 'field-rule',
      title: '审批意见最多400字',
      rules: ['转出/接收领导审批意见按PRD必填；驳回必须提供明确原因。'],
    }),
    note({
      id: `${prefix}-agree`, pageKey: pageScope,
      target: cardTarget('审批操作', 'button', '同意'), kind: 'action-rule',
      title: '同意后按资产转移审批链进入下一节点', rules: [nextRule],
    }),
    note({
      id: `${prefix}-reject`, pageKey: pageScope,
      target: cardTarget('审批操作', 'button', '驳回'), kind: 'action-rule',
      title: '任一审批驳回整单结束并解锁全部资产', rules: ['驳回后单据状态更新为已驳回，解除全部资产锁定，不生成转移单，不更新资产责任关系。'],
    }),
  ];
}

const assetTransferAnnotations = {
  [ASSET_TRANSFER_SCOPES.approval]: transferApprovalNotes(ASSET_TRANSFER_SCOPES.approval, 'transfer-approval', '资产转移审批', '根据当前所处节点继续进入转出人/接收人领导、超标审批或实物确认；相邻审批人为同一人时自动跳过重复节点。'),
  [ASSET_TRANSFER_SCOPES.outManager]: transferApprovalNotes(ASSET_TRANSFER_SCOPES.outManager, 'transfer-out-manager', '转出部门经理审批', '从转出人汇报链找到直属5级及以上领导；本人5级及以上时取直接上级，进入VP/CEO前先经过VP/CEO-1；同意后进入接收人领导审批。'),
  [ASSET_TRANSFER_SCOPES.receiverManager]: transferApprovalNotes(ASSET_TRANSFER_SCOPES.receiverManager, 'transfer-receiver-manager', '接收部门经理审批', '从接收人汇报链找到直属5级及以上领导；同意后先判断个人超标，个人不超标直接进入实物确认。'),
};

const assetTransferCoverage = {
  [ASSET_TRANSFER_SCOPES.approval]: [
    review('AT-MD-001', '4-6', '资产转移申请页', '正式员工选择接收人和可转移资产，校验同成本中心/办公区/公司板块权限、盘点与锁定后提交整单。', '当前个人工作台没有“资产转移申请”页面，仅有三张审批页面，无法绑定申请交互。'),
    review('AT-MD-002', '5', '接收人选择弹窗', '接收人仅正式员工、同成本中心同办公区且满足所有资产领用权限，结果超过5条只展示前5条。', '当前工作台无接收人选择弹窗页面。'),
    review('AT-MD-003', '6', '转移资产选择弹窗', '候选资产必须本人名下、允许转移、未锁定、满足权限；盘点未盘可见但不可选。', '当前工作台无转移资产选择弹窗页面。'),
    review('AT-MD-004', '7', '接收人保管职责确认', '领导审批前接收人线上勾选保管职责；无需扫码/刷卡。', '当前工作台没有接收人保管职责确认页面。'),
    review('AT-MD-005', '10-11', '个人/部门超标审批', '接收人个人超标时增加7级及以上审批；个人超标且部门超标时逐级审批。', '当前工作台没有独立个人超标/部门超标审批页面或可验证路由。'),
    review('AT-MD-006', '12', '接收人实物确认', '最终由接收人确认收到实物后生成转移单并更新台账/事务。', '当前工作台没有接收人实物确认页面。'),
    bound('AT-AU-001', '8-10', '资产转移审批信息', '现有审批页展示转出人、接收人、资产及审批记录。', 'transfer-approval-info'),
    bound('AT-AU-002', '审批操作', '同意', '同意后按转移审批链推进。', 'transfer-approval-agree', '::button::'),
    bound('AT-AU-003', '审批操作', '驳回', '任一节点驳回整单结束并解锁。', 'transfer-approval-reject', '::button::'),
  ],
  [ASSET_TRANSFER_SCOPES.outManager]: [
    bound('AT-OM-001', '8.1', '转出人领导审批', '从汇报链查找5级及以上；进入VP/CEO前过VP/CEO-1。', 'transfer-out-manager-agree', '::button::'),
    bound('AT-OM-002', '8.2', '审批意见', '审批意见最多400字。', 'transfer-out-manager-opinion', '::control::'),
    review('AT-OM-003', '8.1', '动态找人/去重', '本人5级以上取直接上级、VP/CEO-1、相同审批人自动跳过。', '当前 TransferApprovalPages 使用静态mock审批人和历史记录，不能证明动态找人及去重规则。'),
  ],
  [ASSET_TRANSFER_SCOPES.receiverManager]: [
    bound('AT-RM-001', '9', '接收人领导审批', '同意后判断个人超标；不超标直接实物确认。', 'transfer-receiver-manager-agree', '::button::'),
    bound('AT-RM-002', '9', '驳回', '驳回整单并解除资产锁定。', 'transfer-receiver-manager-reject', '::button::'),
    review('AT-RM-003', '9-11', '超标后续路由', '个人超标才判断部门超标并进入对应审批。', '当前页面仅模拟审批成功消息，没有可验证的超标判断与后续流转。'),
  ],
};

// -----------------------------------------------------------------------------
// 09 资产退库
// -----------------------------------------------------------------------------
export const ASSET_RETURN_SCOPES = {
  apply: scope('资产退库'),
  mis: scope('退库审批'),
  leader: scope('领导退库审批'),
  handling: scope('资产退库办理'),
  confirm: scope('员工退库确认'),
};

const assetReturnAnnotations = {
  [ASSET_RETURN_SCOPES.apply]: [
    note({ id: 'asset-return-reason', pageKey: ASSET_RETURN_SCOPES.apply, target: cardTarget('申请信息', 'detail-field', '退库原因'), kind: 'field-rule', title: '退库原因必填且最多400字', rules: ['退库原因必填，最多400字；退库类型为资产退库或离职退还。'] }),
    note({ id: 'asset-return-assets', pageKey: ASSET_RETURN_SCOPES.apply, target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'card', '退库资产明细'), title: '主资产与关联升级耗材必须一并退库', rules: ['可选资产仅限本人名下有退库权限且未被其他流程锁定的资产；主资产存在升级耗材时自动带出并一并锁定/退库。'] }),
    note({ id: 'asset-return-add', pageKey: ASSET_RETURN_SCOPES.apply, target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'button', '添加资产'), kind: 'action-rule', title: '退库资产弹窗支持多选并固定过滤不可退资产', rules: ['锁定资产不可勾选；盘点计划中需盘点且未盘的资产不得提交；已选资产不重复添加。'] }),
    note({ id: 'asset-return-submit', pageKey: ASSET_RETURN_SCOPES.apply, target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'button', '提交'), kind: 'action-rule', title: '提交后按一项主资产一张单据拆分并锁定', rules: ['校验退库原因、资产状态、业务锁、盘点及关联耗材完整性；通过后逐主资产拆单并分别进入领导/MIS/ES路由。'] }),
  ],
  [ASSET_RETURN_SCOPES.leader]: [
    note({ id: 'asset-return-leader-info', pageKey: ASSET_RETURN_SCOPES.leader, target: scopeTarget(ASSET_RETURN_SCOPES.leader, 'card', '资产信息'), title: '部门公用资产才进入领导审批', rules: ['资产用途=部门公用时进入申请人直属5级及以上领导审批；其他用途跳过领导节点。'] }),
    note({ id: 'asset-return-leader-agree', pageKey: ASSET_RETURN_SCOPES.leader, target: cardTarget('审批操作', 'button', '同意'), kind: 'action-rule', title: '领导同意后继续判断MIS配置', rules: ['同意后根据物料“退库MIS鉴定”配置决定进入MIS或直接ES退库办理。'] }),
    note({ id: 'asset-return-leader-reject', pageKey: ASSET_RETURN_SCOPES.leader, target: cardTarget('审批操作', 'button', '驳回'), kind: 'action-rule', title: '领导驳回意见必填并解锁资产', rules: ['驳回时审批意见必填；单据已驳回，主资产及关联耗材解除锁定。'] }),
  ],
  [ASSET_RETURN_SCOPES.mis]: [
    note({ id: 'asset-return-mis-assets', pageKey: ASSET_RETURN_SCOPES.mis, target: scopeTarget(ASSET_RETURN_SCOPES.mis, 'card', '退库资产信息'), title: 'MIS核验退库资产与申请信息', rules: ['仅“退库MIS鉴定=是”的资产进入MIS；鉴定通过只允许同意，鉴定不通过只允许驳回。'] }),
    note({ id: 'asset-return-mis-agree', pageKey: ASSET_RETURN_SCOPES.mis, target: cardTarget('审批信息', 'button', '同意'), kind: 'action-rule', title: '鉴定通过进入ES办理', rules: ['鉴定通过后进入ES退库办理。'] }),
    note({ id: 'asset-return-mis-reject', pageKey: ASSET_RETURN_SCOPES.mis, target: cardTarget('审批信息', 'button', '驳回'), kind: 'action-rule', title: '鉴定不通过驳回并解锁', rules: ['鉴定不通过时鉴定说明/审批意见必填；单据已驳回并解除资产锁定。'] }),
  ],
  [ASSET_RETURN_SCOPES.handling]: [
    note({ id: 'asset-return-handling-warehouse', pageKey: ASSET_RETURN_SCOPES.handling, target: cardTarget('退库信息维护', 'detail-field', '仓库'), kind: 'field-rule', title: '退库仓库仅当前库管员有入库权限', rules: ['默认按申请人组织与办公区匹配；只允许当前库管员有入库权限的仓库。'] }),
    note({ id: 'asset-return-handling-confirm', pageKey: ASSET_RETURN_SCOPES.handling, target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'button', '确认'), kind: 'action-rule', title: '员工确认完成后执行入库', rules: ['首次确认发起员工退库确认；待确认阶段不得入库；员工已确认后生成退库入库单并更新资产及关联耗材台账。'] }),
    note({ id: 'asset-return-handling-reject', pageKey: ASSET_RETURN_SCOPES.handling, target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'button', '驳回'), kind: 'action-rule', title: 'ES驳回意见必填并结束退库', rules: ['驳回后单据已驳回、资产解锁、不生成入库单。'] }),
  ],
  [ASSET_RETURN_SCOPES.confirm]: [
    note({ id: 'asset-return-confirm-identity', pageKey: ASSET_RETURN_SCOPES.confirm, target: cardTarget('刷卡/扫码确认', 'button', '确认退库'), kind: 'action-rule', title: '扫码/刷卡/工号均校验申请人身份', rules: ['每张退库单只确认一次；确认工号必须与申请人工号一致，方式记录为狐小e扫码、刷卡或手工工号。'] }),
    note({ id: 'asset-return-confirm-result', pageKey: ASSET_RETURN_SCOPES.confirm, target: scopeTarget(ASSET_RETURN_SCOPES.confirm, 'card', '退库资产明细'), title: '确认成功后由退库办理链路完成入库与台账更新', rules: ['正常退库生成入库单，资产状态更新为在库-待处理，并更新仓库、地点、责任人/组织、用途、使用说明、资产标记和事务记录；关联耗材同步。'] }),
  ],
};

const assetReturnCoverage = {
  [ASSET_RETURN_SCOPES.apply]: [
    bound('RT-AP-001', '6', '退库原因', '必填且最多400字。', 'asset-return-reason', '::detail-field::'),
    bound('RT-AP-002', '4.3/6', '关联耗材', '主资产存在升级耗材时必须一并退库。', 'asset-return-assets'),
    bound('RT-AP-003', '6.3', '添加资产', '候选资产按本人权限、锁定、盘点等固定范围筛选。', 'asset-return-add', '::button::'),
    bound('RT-AP-004', '4.1/6.2', '提交', '一项主资产一张单据拆分并锁定。', 'asset-return-submit', '::button::'),
    review('RT-AP-005', '4.3', '关联耗材完整性提示', '若主资产存在子耗材但未完整选择，应明确提示并阻断。', '当前页面自动以 relatedConsumables 展示关联耗材，但需确认 service 是否完整校验“必须一并退库”的强制阻断。', 'asset-return-assets'),
  ],
  [ASSET_RETURN_SCOPES.leader]: [
    bound('RT-LD-001', '4.4', '领导审批条件', '部门公用资产进入直属5级及以上领导审批。', 'asset-return-leader-info'),
    bound('RT-LD-002', '领导审批', '同意', '同意后按MIS配置继续路由。', 'asset-return-leader-agree', '::button::'),
    bound('RT-LD-003', '领导审批', '驳回', '驳回意见必填并解锁。', 'asset-return-leader-reject', '::button::'),
    review('RT-LD-004', '领导找人', '动态5级领导', '审批人应从申请人汇报链动态查找5级及以上领导。', '当前 LeaderAssetReturnApprovalPage 使用静态mock审批人，无法验证动态找人。'),
  ],
  [ASSET_RETURN_SCOPES.mis]: [
    bound('RT-MI-001', '4.4/4.5', 'MIS节点', '仅配置需MIS的资产进入，鉴定结果与审批动作需组合校验。', 'asset-return-mis-assets'),
    review('RT-MI-002', '4.5', '鉴定结果/说明控件', '鉴定通过/不通过应作为显式结果，鉴定不通过说明必填。', '当前 AssetReturnApprovalPage 没有独立鉴定结果/鉴定说明控件，而是根据同意/驳回自动写结果，页面无法让MIS按PRD填写。'),
    bound('RT-MI-003', '4.5', '同意', '鉴定通过进入ES。', 'asset-return-mis-agree', '::button::'),
    bound('RT-MI-004', '4.5', '驳回', '鉴定不通过驳回并解锁。', 'asset-return-mis-reject', '::button::'),
  ],
  [ASSET_RETURN_SCOPES.handling]: [
    bound('RT-HD-001', 'ES办理', '仓库', '只允许当前库管员有入库权限的仓库。', 'asset-return-handling-warehouse', '::detail-field::'),
    review('RT-HD-002', 'ES办理', '仓库权限实现', '仓库应按组织映射并动态过滤入库权限。', '当前 RETURN_WAREHOUSES 为固定选项，未看到动态权限过滤。', 'asset-return-handling-warehouse'),
    review('RT-HD-003', '4.4', 'ES补充鉴定', '退库MIS鉴定=否时ES办理页需补充鉴定结果/说明。', '当前 AssetReturnHandlingPage 未展示MIS鉴定结果/说明字段。'),
    bound('RT-HD-004', '4.6/4.8', '确认/入库', '员工确认后执行入库并更新台账。', 'asset-return-handling-confirm', '::button::'),
    bound('RT-HD-005', '4.7', '驳回', 'ES驳回解锁且不生成入库单。', 'asset-return-handling-reject', '::button::'),
    review('RT-HD-006', '4.7', '21天自动驳回', 'ES确认待办未处理满21天自动驳回并解锁。', '页面层无法看到21天定时自动驳回机制，需要后端任务实现确认。'),
  ],
  [ASSET_RETURN_SCOPES.confirm]: [
    bound('RT-CF-001', '4.6', '员工身份确认', '扫码/刷卡/手工工号均必须与申请人一致。', 'asset-return-confirm-identity', '::button::'),
    bound('RT-CF-002', '4.8', '确认后处理', '生成入库单并更新主资产/关联耗材台账和事务。', 'asset-return-confirm-result'),
    skip('RT-CF-003', '4.6', 'Pad签字', 'Pad手写签字与签名图片保存下线。', '下线能力无需在新确认页保留目标。'),
  ],
};

// -----------------------------------------------------------------------------
// 10 合约号码退库
// -----------------------------------------------------------------------------
export const CONTRACT_RETURN_SCOPES = {
  apply: scope('合约号码退库'),
  handling: scope('合约号码退库办理'),
  confirm: scope('员工合约号码退库确认'),
};

const contractReturnAnnotations = {
  [CONTRACT_RETURN_SCOPES.apply]: [
    note({ id: 'contract-return-reason', pageKey: CONTRACT_RETURN_SCOPES.apply, target: cardTarget('申请信息', 'detail-field', '退库原因'), kind: 'field-rule', title: '退库原因必填且最多400字', rules: ['仅正式员工可对本人名下在用合约号码发起退库；退库原因必填，最多400字。'] }),
    note({ id: 'contract-return-add', pageKey: CONTRACT_RETURN_SCOPES.apply, target: cardTarget('合约号码明细', 'button', '添加物资'), kind: 'action-rule', title: '仅可选择本人名下在用合约号码', rules: ['支持单选或多选；候选号码必须仍归属当前员工且状态为在用。'] }),
    note({ id: 'contract-return-submit', pageKey: CONTRACT_RETURN_SCOPES.apply, target: scopeTarget(CONTRACT_RETURN_SCOPES.apply, 'button', '提交'), kind: 'action-rule', title: '提交后一号一单拆分并匹配号码库管员', rules: ['每个号码生成独立退库单和待办；根据申请人公司+办公区匹配默认号码仓库，再按仓库匹配有入库权限的库管员，并发送现场办理通知。'] }),
  ],
  [CONTRACT_RETURN_SCOPES.handling]: [
    note({ id: 'contract-return-warehouse', pageKey: CONTRACT_RETURN_SCOPES.handling, target: cardTarget('退库信息维护', 'detail-field', '退库仓库'), kind: 'field-rule', title: '号码仓库按公司+办公区匹配并限制入库权限', rules: ['默认号码仓库按申请人公司和办公区映射；仅允许当前号码库管员有入库权限的仓库。'] }),
    note({ id: 'contract-return-primary', pageKey: CONTRACT_RETURN_SCOPES.handling, target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'button', '退库确认'), kind: 'action-rule', title: '退库确认→等待员工确认→确认入库', rules: ['未发起时进入员工确认；待确认阶段主按钮禁用；员工已确认后执行号码入库。'] }),
    note({ id: 'contract-return-reject', pageKey: CONTRACT_RETURN_SCOPES.handling, target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'button', '驳回'), kind: 'action-rule', title: '驳回原因必填且号码原状态保持不变', rules: ['库管员驳回时审批/驳回原因必填；单据已驳回，号码原状态、责任人和领用信息不变。'] }),
    note({ id: 'contract-return-ledger', pageKey: CONTRACT_RETURN_SCOPES.handling, target: scopeTarget(CONTRACT_RETURN_SCOPES.handling, 'card', '退库合约号码信息'), title: '正常退还后更新号码台账', rules: ['正常入库后号码状态更新为在库（旧），仓库更新为办理页最终仓库，责任人改为仓库虚拟库管员，清空员工职级/领用日期/申请类型等领用信息并生成操作历史。'] }),
  ],
  [CONTRACT_RETURN_SCOPES.confirm]: [
    note({ id: 'contract-return-confirm-identity', pageKey: CONTRACT_RETURN_SCOPES.confirm, target: cardTarget('刷卡/扫码确认', 'button', '确认'), kind: 'action-rule', title: '员工确认工号必须与申请人一致', rules: ['狐小e扫码、刷卡和手工输入工号均需校验申请人工号；不一致时提示“员工工号不匹配！”。'] }),
    note({ id: 'contract-return-confirm-card', pageKey: CONTRACT_RETURN_SCOPES.confirm, target: scopeTarget(CONTRACT_RETURN_SCOPES.confirm, 'card', '退库确认提示'), title: '员工确认实体电话卡已交还', rules: ['每张号码退库单只进行一次员工确认；确认成功记录方式、工号和时间，随后库管员可执行号码入库。'] }),
  ],
};

const contractReturnCoverage = {
  [CONTRACT_RETURN_SCOPES.apply]: [
    bound('CR-AP-001', '6.1', '退库原因', '正式员工、本人名下在用号码，退库原因必填。', 'contract-return-reason', '::detail-field::'),
    bound('CR-AP-002', '6.2', '添加号码', '支持单选/多选本人名下在用号码。', 'contract-return-add', '::button::'),
    bound('CR-AP-003', '4.1/6.2', '提交', '一号一单拆分并匹配仓库/库管员。', 'contract-return-submit', '::button::'),
    review('CR-AP-004', '6.2/10', '现场办理通知', '提交成功通过服务号通知申请人和匹配库管员办理地点/联系人。', '当前页面提交成功仅展示message，需确认 service/通知层是否实际发送服务号通知。', 'contract-return-submit'),
  ],
  [CONTRACT_RETURN_SCOPES.handling]: [
    bound('CR-HD-001', '7.2', '退库仓库', '按公司+办公区匹配并限制当前库管员入库权限。', 'contract-return-warehouse', '::detail-field::'),
    review('CR-HD-002', '7.2', '仓库映射实现', '默认应为I10086等号码仓库并动态按权限过滤。', '当前页面默认“北京总部号码仓”且 CONTRACT_WAREHOUSES 为固定列表，未体现PRD动态映射/权限。', 'contract-return-warehouse'),
    bound('CR-HD-003', '7.3', '主操作', '退库确认→等待员工确认→确认入库。', 'contract-return-primary', '::button::'),
    bound('CR-HD-004', '7.3', '驳回', '驳回原因必填且保持号码原台账归属。', 'contract-return-reject', '::button::'),
    bound('CR-HD-005', '4.5', '号码台账', '正常退还后状态在库（旧）并清理员工领用信息。', 'contract-return-ledger'),
  ],
  [CONTRACT_RETURN_SCOPES.confirm]: [
    bound('CR-CF-001', '8', '身份确认', '扫码/刷卡/输入工号必须与申请人一致。', 'contract-return-confirm-identity', '::button::'),
    bound('CR-CF-002', '8', '确认提示', '员工确认实体电话卡已交还并记录确认方式/时间。', 'contract-return-confirm-card'),
    skip('CR-CF-003', '4.3', 'Pad签字', 'Pad手写签字与签名图片保存下线。', '下线能力无需在新页面保留目标。'),
  ],
};

export const EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES = [
  {
    id: 'asset-application', name: '资产申请', prd: '02-资产申请.md',
    prdSources: [
      { path: 'docs/员工自助功能PRD/02-资产申请/01-申请与业务审批.md', reviewedBlobSha: '98293510a0e627d956468745eaa5a1a004bd88ce' },
      { path: 'docs/员工自助功能PRD/02-资产申请/02-ES配给与统一采购.md', reviewedBlobSha: '4342696f1abe816fdbe904e618d5407f2b8b80e7' },
      { path: 'docs/员工自助功能PRD/02-资产申请/03-资产领用与确认.md', reviewedBlobSha: '9c5fb027865b541be2dfc1fcb321fca7d4d70761' },
    ],
    annotationsByScope: assetApplicationAnnotations,
    coverageByScope: assetApplicationCoverage,
  },
  {
    id: 'new-employee-claim', name: '新员工与实习生资产领用', prd: '03-新员工与实习生资产领用.md',
    prdSources: [{ path: 'docs/员工自助功能PRD/03-新员工与实习生资产领用.md', reviewedBlobSha: '0a9853f9c74a65e40c8aee7b5fc3af7cc1473e09' }],
    annotationsByScope: newEmployeeClaimAnnotations,
    coverageByScope: newEmployeeClaimCoverage,
  },
  {
    id: 'consumables', name: '耗材申请', prd: '05-耗材申请.md',
    prdSources: [{ path: 'docs/员工自助功能PRD/05-耗材申请.md', reviewedBlobSha: '800427276c25ca2f5439dc36e66351454c8bd7a4' }],
    annotationsByScope: consumableAnnotations,
    coverageByScope: consumableCoverage,
  },
  {
    id: 'asset-replacement', name: '资产更换', prd: '07-资产更换.md',
    prdSources: [{ path: 'docs/员工自助功能PRD/07-资产更换.md', reviewedBlobSha: '6c23c90ab4c4e0a1bdf71ed7ebf0615e235c43d6' }],
    annotationsByScope: assetReplacementAnnotations,
    coverageByScope: assetReplacementCoverage,
  },
  {
    id: 'asset-transfer', name: '资产转移', prd: '08-资产转移.md',
    prdSources: [{ path: 'docs/员工自助功能PRD/08-资产转移.md', reviewedBlobSha: '23dfe9d91b8dcb40c6fe61da069ce2c93fc89f57' }],
    annotationsByScope: assetTransferAnnotations,
    coverageByScope: assetTransferCoverage,
  },
  {
    id: 'asset-return', name: '资产退库', prd: '09-资产退库.md',
    prdSources: [{ path: 'docs/员工自助功能PRD/09-资产退库.md', reviewedBlobSha: '4de7a0b531e44b9896916729b5fa77699ca11d0f' }],
    annotationsByScope: assetReturnAnnotations,
    coverageByScope: assetReturnCoverage,
  },
  {
    id: 'contract-number-return', name: '合约号码退库', prd: '10-合约号码退库.md',
    prdSources: [{ path: 'docs/员工自助功能PRD/10-合约号码退库.md', reviewedBlobSha: '42746acca08e6863715a5332235a7f70b719a044' }],
    annotationsByScope: contractReturnAnnotations,
    coverageByScope: contractReturnCoverage,
  },
];

export const expandedEmployeeSelfServiceAnnotationsByScope = mergeScopeMaps(
  ...EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.map((module) => module.annotationsByScope)
);

export const expandedEmployeeSelfServiceCoverageByScope = mergeScopeMaps(
  ...EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.map((module) => module.coverageByScope)
);

export function getExpandedEmployeeSelfServiceModule(moduleId) {
  return EXPANDED_EMPLOYEE_SELF_SERVICE_MODULES.find((module) => module.id === moduleId) || null;
}

export default expandedEmployeeSelfServiceAnnotationsByScope;
