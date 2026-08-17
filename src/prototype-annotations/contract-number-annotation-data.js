// 合约号码申请模块的研发评审基线标注。
// 内容仅摘取 PRD 中会影响实现/验收的准入、校验、状态流转和跨节点副作用；
// target 使用标注工具按 page scope + Ant Design Card 标题生成的稳定语义目标。

const SCOPES = {
  authorization: 'route:/yewurules::个人工作台::号码控制',
  application: 'route:/yewurules::个人工作台::合约号码申请',
  allocation: 'route:/yewurules::个人工作台::合约号码ES配给',
  supervisor: 'route:/yewurules::个人工作台::合约号码配给主管审批',
  warehouse: 'route:/yewurules::个人工作台::合约号码库管员待办',
  receiptConfirm: 'route:/yewurules::个人工作台::员工合约号码领取确认',
};

const TARGETS = {
  authorizationList: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae58fb7e7a081e68e::card::e68e88e69d83e4babae59198e58897e8a1a8',
  applicationInfo: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59088e7baa6e58f::card::e794b3e8afb7e4bfa1e681af',
  allocationNumber: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59088e7baa6e58f::card::e58fb7e7a081e9858de7bb99',
  approvalInfo: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59088e7baa6e58f::card::e5aea1e689b9e4bfa1e681af',
  warehouseInfo: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59088e7baa6e58f::card::e794b3e8afb7e59088e7baa6e58fb7e7a081e4bfa1e681af',
  warehouseActions: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59088e7baa6e58f::card::e5aea1e689b9e6938de4bd9c',
  responsibility: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59198e5b7a5e590::card::e4bf9de7aea1e8818ce8b4a3',
  receiptConfirm: 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae59198e5b7a5e590::card::e588b7e58da12fe689abe7a081e7a1aee8aea4',
};

const prdItem = (text) => ({ text, source: 'prd' });

const contractNumberAnnotationsByScope = {
  [SCOPES.authorization]: [
    {
      id: 'contract-auth-access-control',
      pageKey: SCOPES.authorization,
      target: TARGETS.authorizationList,
      kind: 'business-rule',
      position: { side: 'right', align: 'start', gap: 8, offsetY: 8 },
      title: '申请权限由 ES 预授权控制',
      summary: '只有经 ES 授权的正式员工才能新建合约号码申请；停止授权只阻止后续新建，不影响历史申请和已在途单据。',
      summarySource: 'prd',
      sections: [
        {
          title: '准入规则',
          items: [
            prdItem('申请人必须是正式员工，并已被 ES 合约号码管理员授予“合约号码申请”权限。'),
            prdItem('未授权员工不可进入申请页；直接访问链接时提示“您暂未开通合约号码申请权限，请先联系 ES 进行业务需求确认。”'),
            prdItem('授权只代表可以填写申请表，不代表业务申请已经审批通过。'),
          ],
        },
        {
          title: '授权操作',
          items: [
            prdItem('授权后员工可正常进入并提交申请；停止授权后不可新建申请，但历史申请和待处理单据保留。'),
            prdItem('支持发送服务号申请通知；新增授权人员确认后默认完成授权。'),
          ],
        },
      ],
    },
  ],
  [SCOPES.application]: [
    {
      id: 'contract-apply-core-rules',
      pageKey: SCOPES.application,
      target: TARGETS.applicationInfo,
      kind: 'business-rule',
      position: { side: 'right', align: 'start', gap: 8, offsetY: 12 },
      title: '合约号码申请核心校验',
      summary: '申请只开放因公业务场景，申请类型固定为“业务申请”；提交前必须校验申请原因、实名认证附件和本人已有/在途合约号码。',
      summarySource: 'prd',
      sections: [
        {
          title: '表单规则',
          items: [
            prdItem('申请类型固定为“业务申请”，不提供其他类型选择；申请日期、申请人、部门由系统自动带出。'),
            prdItem('申请原因必填，用于说明真实业务场景。身份证号只读展示，中间位数使用 * 隐藏。'),
          ],
        },
        {
          title: '实名认证附件',
          items: [
            prdItem('身份证正反面必须放在同一个文件中；支持 PDF、Word、JPG、PNG，单文件最大 10MB。'),
            prdItem('身份证附件必填，后续 ES 配给人员和 ES 主管可下载查看。'),
          ],
        },
        {
          title: '提交阻断与结果',
          items: [
            prdItem('申请原因为空、身份证附件为空、附件格式/大小不符合要求时均阻断提交。'),
            prdItem('申请人名下已有合约号码或已有在途合约号码单据时阻断提交。'),
            prdItem('提交成功后申请单进入“处理中”，并生成 ES 配给待办；返回上一页时不保存未提交数据。'),
          ],
        },
      ],
    },
  ],
  [SCOPES.allocation]: [
    {
      id: 'contract-allocation-identity-attachment',
      pageKey: SCOPES.allocation,
      target: TARGETS.applicationInfo,
      kind: 'business-rule',
      position: { side: 'right', align: 'start', gap: 8, offsetY: 8 },
      title: '实名附件供 ES 配给核验',
      summary: 'ES 配给时需要查看申请人的业务申请信息，并可下载身份证实名认证附件用于后续办理。',
      summarySource: 'prd',
      sections: [
        {
          title: '核验内容',
          items: [
            prdItem('申请人信息包含申请人、部门、职级、手机、分机、入职时间和申请原因。'),
            prdItem('申请人上传的身份证实名认证附件在本节点可下载；下载附件需要记录操作日志。'),
          ],
        },
      ],
    },
    {
      id: 'contract-allocation-number-and-evidence',
      pageKey: SCOPES.allocation,
      target: TARGETS.allocationNumber,
      kind: 'business-rule',
      position: { side: 'right', align: 'center', gap: 8 },
      title: '号码可选范围与审批凭证',
      summary: '只能配给“在库（新）/在库（旧）”且未被其他单据锁定的号码；提交主管审批前必须上传 7 级及以上领导审批邮件附件。',
      summarySource: 'prd',
      sections: [
        {
          title: '号码选择',
          items: [
            prdItem('ES 仅可选择状态为“在库（新）”或“在库（旧）”的合约号码。'),
            prdItem('已被其他处理中单据选中的号码必须锁定，不得重复配给。'),
            prdItem('申请被驳回、撤回或放弃领用后，应释放对应号码锁定。'),
          ],
        },
        {
          title: '高层审批凭证',
          items: [
            prdItem('ES 配给提交前必须上传 7 级及以上领导审批邮件附件，可包含 VP、CEO-1 等更高层级审批。'),
            prdItem('审批邮件附件用于证明业务需求已获得授权，ES 主管节点可查看或下载。'),
          ],
        },
      ],
    },
    {
      id: 'contract-allocation-actions',
      pageKey: SCOPES.allocation,
      target: TARGETS.approvalInfo,
      kind: 'business-rule',
      position: { side: 'right', align: 'end', gap: 8, offsetY: -8 },
      title: 'ES 配给提交与驳回',
      summary: '同意前校验号码和高层审批附件；驳回时审批意见必填，并立即结束流程、释放号码锁定、通知申请人。',
      summarySource: 'prd',
      sections: [
        {
          title: '操作规则',
          items: [
            prdItem('同意：必须已选择合约号码并上传审批邮件附件，校验通过后进入 ES 主管审批。'),
            prdItem('驳回：审批意见必填；申请单更新为“已驳回”，流程结束，释放号码锁定并通知申请人。'),
            prdItem('PRD 本节点明确的业务操作为同意、驳回及附件下载。'),
          ],
        },
      ],
    },
  ],
  [SCOPES.supervisor]: [
    {
      id: 'contract-supervisor-review-evidence',
      pageKey: SCOPES.supervisor,
      target: TARGETS.allocationNumber,
      kind: 'business-rule',
      position: { side: 'right', align: 'center', gap: 8 },
      title: '主管核验配给结果与审批凭证',
      summary: 'ES 主管需要核验业务申请、实名认证附件、已配给号码及 7 级及以上审批邮件附件，配给信息在本节点只读。',
      summarySource: 'prd',
      sections: [
        {
          title: '核验范围',
          items: [
            prdItem('申请信息、身份证实名认证附件、配给合约号码及套餐金额均为审核依据。'),
            prdItem('7 级及以上领导审批邮件附件必须可查看或下载。'),
          ],
        },
      ],
    },
    {
      id: 'contract-supervisor-actions',
      pageKey: SCOPES.supervisor,
      target: TARGETS.approvalInfo,
      kind: 'business-rule',
      position: { side: 'right', align: 'end', gap: 8, offsetY: -8 },
      title: '主管审批会触发通知与待办',
      summary: '主管同意后要同时发送服务号领取通知并生成库管员待办；驳回则结束流程、释放号码锁定并通知申请人。',
      summarySource: 'prd',
      sections: [
        {
          title: '同意',
          items: [
            prdItem('审批通过后，系统向申请人发送领取通知，并生成对应仓库库管员/发放管理员待办。'),
            prdItem('领取通知和库管员待办应在同一次流程事务中生成；任一失败需要记录并支持补发。'),
            prdItem('领取通知包含申请单号、领取地点、联系人、联系电话、领取要求和详情链接。'),
          ],
        },
        {
          title: '驳回',
          items: [
            prdItem('驳回时审批意见必填；申请单更新为“已驳回”，释放号码锁定并通知申请人。'),
          ],
        },
      ],
    },
  ],
  [SCOPES.warehouse]: [
    {
      id: 'contract-warehouse-onsite-handling',
      pageKey: SCOPES.warehouse,
      target: TARGETS.warehouseInfo,
      kind: 'business-rule',
      position: { side: 'right', align: 'start', gap: 8, offsetY: 8 },
      title: '库管员现场核验与领用信息维护',
      summary: '员工本人线下到场领取，库管员核验申请人与配给号码；本节点维护的备注在员工确认后带入合约号码台账。',
      summarySource: 'prd',
      sections: [
        {
          title: '办理规则',
          items: [
            prdItem('办理对象为对应合约号码仓库的库管员/发放管理员，员工本人需线下到场领取电话卡。'),
            prdItem('库管员核验员工身份和已配给号码后，再发起员工领用确认。'),
            prdItem('备注可编辑，员工确认完成后应带入合约号码台账。'),
          ],
        },
      ],
    },
    {
      id: 'contract-warehouse-claim-or-abandon',
      pageKey: SCOPES.warehouse,
      target: TARGETS.warehouseActions,
      kind: 'business-rule',
      position: { side: 'right', align: 'center', gap: 8 },
      title: '领用确认与弃领是两个终态分支',
      summary: '领用确认进入员工扫码确认；弃领不生成出库单并释放号码锁定，之后不能恢复正常领用，如仍需号码必须重新申请。',
      summarySource: 'prd',
      sections: [
        {
          title: '领用确认',
          items: [
            prdItem('点击“领用确认”后进入员工领用确认页，待员工完成身份校验和扫码确认。'),
          ],
        },
        {
          title: '弃领',
          items: [
            prdItem('弃领后流程结束，不执行员工扫码确认、不生成出库单，并释放号码锁定。'),
            prdItem('放弃领用后禁止再次执行正常领用；如仍有需求，由申请人重新发起新单。'),
            prdItem('PRD 状态口径：放弃领用也视为单据“已完成”。'),
          ],
        },
      ],
    },
  ],
  [SCOPES.receiptConfirm]: [
    {
      id: 'contract-receipt-responsibility',
      pageKey: SCOPES.receiptConfirm,
      target: TARGETS.responsibility,
      kind: 'business-rule',
      position: { side: 'right', align: 'start', gap: 8, offsetY: 8 },
      title: '取消纸质签字，确认保管职责后扫码',
      summary: '员工领取确认不再执行线下纸质/手写签字，改为阅读保管职责后通过狐小 e 扫码形成电子确认记录。',
      summarySource: 'prd',
      sections: [
        {
          title: '保管职责核心口径',
          items: [
            prdItem('合约号码用于工作用途，领用人仅享有使用权，应妥善保管，不得擅自转售或借出。'),
            prdItem('公司要求归还时，领用人应配合及时办理归还。'),
          ],
        },
      ],
    },
    {
      id: 'contract-receipt-confirm-and-outbound',
      pageKey: SCOPES.receiptConfirm,
      target: TARGETS.receiptConfirm,
      kind: 'business-rule',
      position: { side: 'right', align: 'center', gap: 8 },
      title: '扫码身份校验成功后自动完成出库',
      summary: '确认账号必须与申请人一致；校验成功后生成电子确认记录并自动出库，失败则保留待办且不得出库。',
      summarySource: 'prd',
      sections: [
        {
          title: '确认校验',
          items: [
            prdItem('扫码时核验员工工号与申请人一致；不一致时确认失败。'),
            prdItem('确认失败时保留库管员/员工待办，通知员工重新确认，不得执行出库。'),
            prdItem('点击返回不生成确认记录，库管员待办继续保持待处理。'),
          ],
        },
        {
          title: '确认成功后的系统动作',
          items: [
            prdItem('自动生成合约号码出库单和合约号码操作历史。'),
            prdItem('申请单更新为“已完成”，库管员待办更新为已完成。'),
            prdItem('号码解除处理中锁定，并更新为“在用-使用中”。'),
          ],
        },
      ],
    },
  ],
};

export default contractNumberAnnotationsByScope;
