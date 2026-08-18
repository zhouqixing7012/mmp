// 合约号码 PRD 重点覆盖账本。
// 目的不是把 PRD 全搬进标注，而是确保研发需要关注的规则都有明确去向：
// bound = 已有准确标注承载；review = 页面缺目标 / 实现与 PRD 仍存在差异；skip = 明确无需单独标注。

export const CONTRACT_NUMBER_SCOPES = {
  authorization: 'route:/yewurules::个人工作台::号码控制',
  application: 'route:/yewurules::个人工作台::合约号码申请',
  allocation: 'route:/yewurules::个人工作台::合约号码ES配给',
  supervisor: 'route:/yewurules::个人工作台::合约号码配给主管审批',
  warehouse: 'route:/yewurules::个人工作台::合约号码库管员待办',
  receiptConfirm: 'route:/yewurules::个人工作台::员工合约号码领取确认',
};

export const CONTRACT_WAREHOUSE_SCOPE = CONTRACT_NUMBER_SCOPES.warehouse;

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

export const contractNumberRequirementCoverageByScope = {
  [CONTRACT_NUMBER_SCOPES.authorization]: [
    bound(
      'CN-AUTH-001',
      '04-合约号码申请.md#申请权限',
      '授权人员列表',
      '只有正式员工且已被 ES 预授权，才能进入合约号码申请。',
      'contract-auth-access-control'
    ),
    review(
      'CN-AUTH-002',
      '04-合约号码申请.md#申请权限',
      '新增授权人员',
      '授权对象必须为正式员工。',
      '当前号码控制页使用 mockAllUsers，人员数据没有员工类型字段，新增授权时未校验是否正式员工。',
      'contract-auth-access-control'
    ),
    bound(
      'CN-AUTH-003',
      '04-合约号码申请.md#停止授权',
      '停止授权',
      '停止授权只阻止后续新建申请，不影响历史申请和在途单据。',
      'contract-auth-access-control'
    ),
    review(
      'CN-AUTH-004',
      '04-合约号码申请.md#申请通知',
      '发送通知',
      'ES 可向授权员工发送服务号申请通知。',
      '当前“发送通知”只展示成功 message，没有看到真实服务号通知接口或发送结果记录。',
      'contract-auth-access-control'
    ),
  ],

  [CONTRACT_NUMBER_SCOPES.application]: [
    bound(
      'CN-AP-001',
      '04-合约号码申请.md#申请页面',
      '申请信息',
      '申请类型固定为业务申请，申请人等基础信息由系统带出。',
      'contract-apply-core-rules'
    ),
    review(
      'CN-AP-002',
      '04-合约号码申请.md#提交校验',
      '申请资格与重复申请',
      '未授权、名下已有合约号码或已有在途合约号码申请时应阻断提交。',
      '当前 haoma.js 直接展示申请表并在 onFinish 后提示成功，没有看到授权校验、已有号码校验或在途单据校验。',
      'contract-apply-core-rules'
    ),
    bound(
      'CN-AP-003',
      '04-合约号码申请.md#身份证号码',
      '身份证号码',
      '身份证号码只读并对中间位数脱敏。',
      'contract-apply-id-number-rule',
      '::detail-field::e8baabe4bbbde8af81e58fb7e7a081'
    ),
    bound(
      'CN-AP-004',
      '04-合约号码申请.md#申请原因',
      '申请原因',
      '申请原因必填，用于说明业务场景。',
      'contract-apply-reason-rule',
      '::detail-field::e794b3e8afb7e58e9fe59ba0'
    ),
    bound(
      'CN-AP-005',
      '04-合约号码申请.md#实名认证附件',
      '上传附件',
      '身份证正反面实名认证附件必填，单文件最大 10MB。',
      'contract-apply-attachment-rule',
      '::detail-field::e4b88ae4bca0e99984e4bbb6'
    ),
    review(
      'CN-AP-006',
      '04-合约号码申请.md#实名认证附件',
      '附件格式与必填校验',
      '附件支持 PDF、Word、JPG、PNG，正反面放在同一文件，缺失或格式/大小不符合要求时阻断提交。',
      '当前页面仅在 beforeUpload 校验 10MB 大小；Form 未把附件声明为必填，也未限制文件格式或校验正反面材料规则。',
      'contract-apply-attachment-rule'
    ),
    review(
      'CN-AP-007',
      '04-合约号码申请.md#提交后流程',
      '提交',
      '提交成功后生成申请单，状态处理中，并生成 ES 配给待办。',
      '当前 submit 仅 message.success + console.log，没有看到真实单据状态、ES 待办及后续流程数据写入。',
      'contract-apply-core-rules'
    ),
  ],

  [CONTRACT_NUMBER_SCOPES.allocation]: [
    bound(
      'CN-AL-001',
      '04-合约号码申请.md#ES配给核验',
      '申请信息与实名认证附件',
      'ES 配给时可查看申请信息并下载实名认证附件。',
      'contract-allocation-identity-attachment'
    ),
    review(
      'CN-AL-002',
      '04-合约号码申请.md#附件操作日志',
      '附件下载',
      '下载实名认证附件需要记录操作日志。',
      '当前 downloadAttachment 直接生成下载，没有看到附件下载审计日志。',
      'contract-allocation-identity-attachment'
    ),
    bound(
      'CN-AL-003',
      '04-合约号码申请.md#号码配给',
      '号码配给',
      '只能选择在库（新）/在库（旧）且未被其他处理中单据锁定的号码。',
      'contract-allocation-number-and-evidence'
    ),
    review(
      'CN-AL-004',
      '04-合约号码申请.md#号码锁定',
      '号码并发锁',
      '选择号码后需锁定；驳回、撤回或弃领时必须释放，避免重复配给。',
      '当前页面选择号码后只写 assignedNumber；需要结合服务层确认是否存在独立、可并发校验的号码锁及完整释放机制。',
      'contract-allocation-number-and-evidence'
    ),
    bound(
      'CN-AL-005',
      '04-合约号码申请.md#高层审批凭证',
      '附件信息',
      'ES 同意前必须上传 7 级及以上领导审批邮件附件。',
      'contract-allocation-number-and-evidence'
    ),
    review(
      'CN-AL-006',
      '04-合约号码申请.md#高层审批凭证',
      '审批邮件附件内容',
      '上传附件应作为 7 级及以上领导业务审批凭证，并在主管节点可查看/下载。',
      '当前页面只校验“存在一个 allocationAttachment”，没有附件类型、来源或审批凭证有效性校验。',
      'contract-allocation-number-and-evidence'
    ),
    bound(
      'CN-AL-007',
      '04-合约号码申请.md#ES操作',
      '同意/驳回',
      '同意进入 ES 主管审批；驳回意见必填、结束流程并释放号码锁定。',
      'contract-allocation-actions'
    ),
    review(
      'CN-AL-008',
      '04-合约号码申请.md#ES操作',
      '延期按钮',
      '本节点 PRD 定义的业务操作为同意、驳回及附件下载。',
      '当前 ES 配给页额外提供“延期”按钮和 ES审批延期记录，但本版 PRD 未定义该业务动作，需要确认是否保留。',
      'contract-allocation-actions'
    ),
  ],

  [CONTRACT_NUMBER_SCOPES.supervisor]: [
    bound(
      'CN-SV-001',
      '04-合约号码申请.md#主管审批',
      '主管核验信息',
      '主管只读核验业务申请、实名认证附件、已配给号码和 7 级及以上审批邮件附件。',
      'contract-supervisor-review-evidence'
    ),
    bound(
      'CN-SV-002',
      '04-合约号码申请.md#主管审批',
      '同意/驳回',
      '主管同意后生成库管员待办并通知申请人；驳回结束流程并释放号码锁定。',
      'contract-supervisor-actions'
    ),
    review(
      'CN-SV-003',
      '04-合约号码申请.md#主管通过通知',
      '领取通知与库管员待办',
      '同意后领取通知和库管员待办应在同一流程事务生成，失败可记录并补发。',
      '当前页面只更新 currentNode/history 并展示成功 message；未看到真实服务号通知、失败记录与补发机制。',
      'contract-supervisor-actions'
    ),
    review(
      'CN-SV-004',
      '04-合约号码申请.md#主管驳回',
      '号码锁释放',
      '主管驳回时需释放已配给号码锁。',
      '当前主管页更新申请状态为已驳回，但页面层无法证明已配给号码锁同步释放。',
      'contract-supervisor-actions'
    ),
  ],

  [CONTRACT_NUMBER_SCOPES.warehouse]: [
    bound(
      'CN-WH-001',
      '04-合约号码申请.md#12.1',
      '库管员办理页',
      '库管员/合约号码发放管理员线下核验员工与已配给号码。',
      'contract-warehouse-onsite-handling'
    ),
    review(
      'CN-WH-002',
      '04-合约号码申请.md#12.2-城市',
      '城市字段',
      '城市通过弹窗选择，PRD 写明默认北京市。',
      '当前页面存在城市字段，但默认值取业务数据且不一定为北京市；应先确认最新产品口径，再决定字段级标注或修改页面。'
    ),
    bound(
      'CN-WH-003',
      '04-合约号码申请.md#12.2-备注',
      '备注字段',
      '备注可编辑，员工确认后带入合约号码台账。',
      'contract-warehouse-note-rule',
      '::detail-field::e5a487e6b3a8'
    ),
    bound(
      'CN-WH-004',
      '04-合约号码申请.md#12.2-领用确认',
      '领用确认按钮',
      '点击后进入员工领用确认页。',
      'contract-warehouse-claim-action',
      '::button::e9a286e794a8e7a1aee8aea4'
    ),
    bound(
      'CN-WH-005',
      '04-合约号码申请.md#12.2-弃领',
      '弃领按钮',
      '结束领用流程，不生成出库单，释放号码锁定，且不能恢复正常领用。',
      'contract-warehouse-abandon-action',
      '::button::e5bc83e9a286'
    ),
    review(
      'CN-WH-006',
      '04-合约号码申请.md#弃领后处理',
      '号码锁与恢复限制',
      '弃领后必须释放号码锁，且之后不能从原单恢复正常领用。',
      '当前页面把号码 status 改为“在库”并结束节点，但需要结合服务层确认独立号码锁已释放且原单无法再次进入正常领用。',
      'contract-warehouse-abandon-action'
    ),
    skip(
      'CN-WH-007',
      '04-合约号码申请.md#12.2-返回',
      '返回按钮',
      '返回上一页。',
      '纯导航行为、无额外状态或数据副作用，不单独占用研发评审标注。'
    ),
  ],

  [CONTRACT_NUMBER_SCOPES.receiptConfirm]: [
    bound(
      'CN-CF-001',
      '04-合约号码申请.md#员工领取确认',
      '保管职责',
      '取消纸质/手写签字，员工阅读合约号码保管职责后完成电子确认。',
      'contract-receipt-responsibility'
    ),
    bound(
      'CN-CF-002',
      '04-合约号码申请.md#员工领取确认',
      '身份校验与出库',
      '确认账号/工号必须与申请人一致；成功后自动完成号码出库，失败不得出库。',
      'contract-receipt-confirm-and-outbound'
    ),
    review(
      'CN-CF-003',
      '04-合约号码申请.md#确认失败',
      '失败待办处理',
      '确认失败应保留员工及库管员待办、通知员工重新确认且不得执行出库。',
      '当前页面会展示 service 返回的错误，但需要结合 service/待办数据确认失败后双侧待办和重试通知状态是否完整保留。',
      'contract-receipt-confirm-and-outbound'
    ),
    review(
      'CN-CF-004',
      '04-合约号码申请.md#确认成功',
      '自动出库与台账',
      '成功后自动生成合约号码出库单/操作历史，申请单和库管员待办完成，号码状态更新为在用-使用中。',
      '当前确认页本身只调用 confirmContractNumberReceipt 并展示成功结果，需由 service 层证明出库单、待办、号码状态和操作历史均已原子更新。',
      'contract-receipt-confirm-and-outbound'
    ),
  ],
};

// 兼容已有引用。
export const contractWarehouseRequirementCoverage = contractNumberRequirementCoverageByScope[CONTRACT_WAREHOUSE_SCOPE];
