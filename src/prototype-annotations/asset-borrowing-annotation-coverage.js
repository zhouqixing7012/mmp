import { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';

// 资产借用 PRD 重点覆盖账本。
// bound = 已有准确标注承载；review = 页面缺目标 / PRD 与当前实现或现行口径冲突；skip = 明确无需单独标注。
const bound = (id, source, object, rule, annotationId, expectedTargetFragment) => ({
  id, source, object, rule, status: 'bound', annotationId, ...(expectedTargetFragment ? { expectedTargetFragment } : {}),
});
const review = (id, source, object, rule, reason, annotationId) => ({
  id, source, object, rule, status: 'review', reason, ...(annotationId ? { annotationId } : {}),
});
const skip = (id, source, object, rule, reason) => ({ id, source, object, rule, status: 'skip', reason });

export const assetBorrowingRequirementCoverageByScope = {
  [ASSET_BORROWING_SCOPES.apply]: [
    bound('BA-AP-001', '#2/#4-借用权限', '资产借用页面', '仅正式员工可发起资产借用。', 'borrowing-apply-global-rules'),
    bound('BA-AP-002', '#4-物资范围', '添加资产', '只允许启用且允许借用的资产小类，不支持单独借用耗材。', 'borrowing-apply-add-material', '::button::'),
    bound('BA-AP-003', '#4-物资范围', '升级耗材', '主资产已有升级耗材时，耗材随主资产一并出库。', 'borrowing-apply-global-rules'),
    bound('BA-AP-004', '#7.2-申请须知', '已阅读按钮', '首次进入展示申请须知，未点击已阅读前不能进入编辑。', 'borrowing-apply-notice-read', '::button::'),
    review('BA-AP-005', '#7.3-配置', '配置字段', '选择物料后展示物料维度组合中的配置。', '当前申请明细表只有资产说明、数量、借用日期、原因、需求说明和操作，没有“配置”列，因此没有可精确绑定的页面目标。'),
    bound('BA-AP-006', '#7.3-借用数量', '借用数量', '默认1、正整数；数量大于1提交后拆多行但不拆单。', 'borrowing-apply-quantity-rule', '::table-column::'),
    bound('BA-AP-007', '#7.3-借用期限', '借用日期', '开始日今天至未来30天，结束日默认+1月、最长+3月，支持快捷日期。', 'borrowing-apply-period-rule', '::table-column::'),
    bound('BA-AP-008', '#7.3-借用原因', '借用原因', '必填，枚举出差/维修替换/活动/其他。', 'borrowing-apply-reason-rule', '::table-column::'),
    bound('BA-AP-009', '#7.3-需求说明', '需求说明', '必填，描述配置要求，最多150字。', 'borrowing-apply-detail-rule', '::table-column::'),
    review('BA-AP-010', '#7.3-删除', '删除按钮', '支持删除当前明细，但至少保留一条。', '当前删除按钮允许删掉最后一条明细；虽然提交时会阻止空明细，但与“至少保留一条”的页面交互规则不一致。'),
    bound('BA-AP-011', '#7.4-保管职责', '保管职责复选框', '提交前必须勾选保管职责。', 'borrowing-apply-custody-rule', '::checkbox::'),
    bound('BA-AP-012', '#7.5-添加物资', '添加资产按钮', '支持多选并去重追加。', 'borrowing-apply-add-material', '::button::'),
    review('BA-AP-013', '#7.6.1-关键字', '借用物资搜索框', '关键字应支持资产小类、品牌、型号、配置模糊查询并支持Enter。', '当前 BorrowMaterialModal 的搜索只匹配资产大类和资产小类，没有匹配品牌、型号和配置。', 'borrowing-apply-material-search'),
    bound('BA-AP-014', '#7.5-提交', '提交按钮', '整单校验后状态处理中并进入ES配给。', 'borrowing-apply-submit', '::button::'),
    bound('BA-AP-015', '#4-续借/#14-到期处理', '借用全局规则', '续借下线；到期/逾期只通知，不改单据状态和资产逾期标记。', 'borrowing-apply-global-rules'),
    review('BA-AP-016', '#13-出库单及套打模板', '借用出库单/套打模板', '资产出库完成后可查看并打印借用单，模板包含基础信息、资产明细、确认信息和责任说明。', '当前个人工作台资产借用模块没有对应的借用出库单/套打模板页面 target；需要后续在核心“出库”页面单独建立该范围的标注。'),
  ],

  [ASSET_BORROWING_SCOPES.allocation]: [
    bound('BA-AL-001', '#8.1-处理原则', '借用资产信息模块', '整单同意/驳回，每条明细可暂不匹配实物。', 'borrowing-allocation-whole-order'),
    review('BA-AL-002', '#8.3-办理仓库', '仓库字段', '默认按组织/办公区映射，仅可选当前公司且审批人有出库权限的仓库。', '当前 WarehouseSelectModal 使用固定仓库列表，包含跨公司仓库，也没有根据当前审批人出库权限过滤。', 'borrowing-allocation-warehouse-rule'),
    bound('BA-AL-003', '#8.3-资产标签号', '资产标签号字段', 'ES节点资产标签号允许为空。', 'borrowing-allocation-asset-rule', '::table-column::'),
    bound('BA-AL-004', '#8.4.2-状态/小类', '配给资产选择', '资产小类匹配，仓库匹配，状态仅限新增/待处理/再利用且未锁定。', 'borrowing-allocation-asset-rule', '::table-column::'),
    review('BA-AL-005', '#8.4.2-公司板块权限', '配给资产选择范围', '资产范围包含申请人公司/板块及公司板块领用权限映射范围。', '当前 AssetMatchModal 只按小类、仓库、状态和 locked 过滤，没有公司/板块权限映射过滤。', 'borrowing-allocation-asset-rule'),
    review('BA-AL-006', '#8.4.2-资产标记', '配给资产选择范围', '资产标记必须为空。', '当前 AssetMatchModal 和 ES 提交校验未校验资产标记字段。', 'borrowing-allocation-asset-rule'),
    review('BA-AL-007', '#8.4.2/#8.4.4-并发锁定', '选择资产确定', '确定时再次校验并锁定；更换资产时先释放原资产再锁定新资产。', '当前原型把 matchedAsset 写入申请明细，但没有独立持久化资产锁，也没有实现“释放旧锁→锁定新资产”的并发锁定状态。', 'borrowing-allocation-asset-rule'),
    bound('BA-AL-008', '#8.5-员工名下资产', '查看名下资产按钮', '弹窗仅查看，展示概览并支持多条件筛选。', 'borrowing-allocation-view-assets', '::button::'),
    bound('BA-AL-009', '#8.6-同意', '同意按钮', '校验已匹配资产后进入直属领导审批，未匹配明细允许继续。', 'borrowing-allocation-agree', '::button::'),
    bound('BA-AL-010', '#8.6-驳回', '驳回按钮', '驳回原因必填，整单驳回并解除已匹配资产。', 'borrowing-allocation-reject', '::button::'),
    bound('BA-AL-011', '#8.6-驳回原因', '审批意见', 'ES驳回时审批意见必填。', 'borrowing-allocation-opinion', '::control::'),
    skip('BA-AL-012', '#8.4.4-查询/重置/取消', '配给资产弹窗通用操作', '查询、重置和取消按常规弹窗交互执行。', '属于通用查询/关闭交互，不单独占用研发重点标注；核心选择范围、锁定和确定副作用已在资产标签号规则覆盖。'),
  ],

  [ASSET_BORROWING_SCOPES.approval]: [
    bound('BA-AU-001', '#9.1-审批意见', '审批意见', '同意非必填，驳回必填，最多400字。', 'borrowing-approval-opinion', '::control::'),
    review('BA-AU-002', '#9.2-直属5级以上', '审批人路由', '沿直属汇报链查找5级及以上领导。', '当前配给完成后直接使用 record.applicant.leader 作为审批人，没有看到沿汇报链按职级动态查找逻辑。', 'borrowing-approval-route'),
    review('BA-AU-003', '#9.2-VP/CEO-1', '审批人路由', '进入VP/CEO前必须先经过一名VP/CEO-1。', '当前审批流程没有实现 VP/CEO-1 前置节点判断。', 'borrowing-approval-route'),
    bound('BA-AU-004', '#9.3-同意', '同意按钮', '保持处理中并进入库管员发放。', 'borrowing-approval-agree', '::button::'),
    bound('BA-AU-005', '#9.2/#9.3-通过通知', '同意按钮', '通过后生成库管员待办并通知申请人和库管员。', 'borrowing-approval-agree', '::button::'),
    bound('BA-AU-006', '#9.3-驳回', '驳回按钮', '状态已驳回，解除已配给资产，流程结束。', 'borrowing-approval-reject', '::button::'),
    skip('BA-AU-007', '#9.3-返回', '返回按钮', '返回待办列表不改单据。', '纯导航且无业务副作用，不单独标注。'),
    skip('BA-AU-008', '#9.3-加签', '加签按钮', '按现有工作流通用加签能力处理。', '属于现有工作流通用能力，不重复搬运到借用模块业务标注。'),
  ],

  [ASSET_BORROWING_SCOPES.issue]: [
    review('BA-IS-001', '#10.2-当前仓库', '当前仓库', '仅展示当前库管员有出库权限且符合公司板块规则的仓库。', '当前页面仓库选项硬编码为“北京总部仓/北京影像器材仓”，没有动态权限和公司板块映射过滤。', 'borrowing-issue-warehouse'),
    bound('BA-IS-002', '#10.2-资产标签号', '资产标签号', '未配给时必须选，已配给允许重新选并重新执行出库条件校验。', 'borrowing-issue-asset', '::control::'),
    bound('BA-IS-003', '#10.2-City/Building/Floor', '城市字段', '默认办公地点，可修改且三级联动。', 'borrowing-issue-location', '::select::'),
    bound('BA-IS-004', '#10.2-资产用途', '资产用途', '发放前必填并使用现有枚举。', 'borrowing-issue-purpose', '::select::'),
    bound('BA-IS-005', '#10.2-使用说明', '使用说明', '最多400字，出库后写入资产卡片。', 'borrowing-issue-usage-note', '::control::'),
    skip('BA-IS-006', '#10.2-使用说明组件类型', '使用说明', 'PRD原文写多行文本。', '项目后续已统一将借用发放“使用说明”调整为一行 Input；保留业务长度和台账写入规则，不再按旧PRD组件类型标注。'),
    review('BA-IS-007', '#10.2-盘点信息', '实际盘点人/盘点状态', '仅资产处于开启中的盘点计划时展示。', '当前页面无论是否存在开启中的盘点计划都渲染这两个字段，并用“-”/“未盘”兜底。', 'borrowing-issue-inventory'),
    review('BA-IS-008', '#10.2-升级耗材信息', '升级耗材子表', '存在升级耗材时展示，并随主资产一并出库。', '当前发放页只展示“部件数量”，没有升级耗材明细子表，因此不存在可精确绑定的子表 target。'),
    review('BA-IS-009', '#10.3-员工名下资产查询', '员工名下资产查询按钮', '打开员工名下资产查询弹窗且仅查看。', '当前 BorrowingIssuePage 没有员工名下资产查询按钮，也没有挂 EmployeeAssetsModal。'),
    bound('BA-IS-010', '#10.3-借用确认', '借用确认按钮', '资产标签号、仓库、地点完整后发起员工现场确认。', 'borrowing-issue-confirm', '::button::'),
    review('BA-IS-011', '#10.3-弃领', '弃领按钮', '业务动作名称为“弃领”，结束流程、解锁资产、不执行出库。', '当前按钮显示为“取消”，业务处理语义实际是放弃领用；应确认是否按PRD统一按钮文案为“弃领”。', 'borrowing-issue-abandon'),
    review('BA-IS-012', '#3/#5/#10.3-弃领状态', '弃领处理结果', 'PRD不同章节分别出现“已完成”和“已处理”口径。', 'PRD自身存在状态口径冲突；当前代码使用 status=已处理、result=放弃领用，需要产品确认最终状态口径。', 'borrowing-issue-abandon'),
    bound('BA-IS-013', '#12.1/#12.2/#12.3-执行出库', '执行出库按钮', '确认完成后重新校验资产，生成出库单/历史/事务并更新台账，升级耗材同步出库。', 'borrowing-issue-outbound', '::button::'),
    review('BA-IS-014', '#3/#5/#12.4-正常出库状态', '出库完成状态', 'PRD章节分别出现“已完成”和“已处理”。', 'PRD自身存在正常出库后的状态冲突；当前代码使用“已处理”，而12.4明确写“已完成”，需确认最终状态。', 'borrowing-issue-outbound'),
    bound('BA-IS-015', '#14-放弃领用通知', '弃领按钮', '放弃领用后通知申请人流程已结束。', 'borrowing-issue-abandon', '::button::'),
  ],

  [ASSET_BORROWING_SCOPES.confirm]: [
    bound('BA-CF-001', '#11.1-借用资产信息', '借用资产明细', '员工核对实际资产、配置、期限和使用说明。', 'borrowing-confirm-asset-check'),
    review('BA-CF-002', '#11.1-升级耗材', '借用资产明细', '存在关联升级耗材时在员工确认页展示。', '当前员工确认表格没有升级耗材列/明细，也没有其他可精确承载该信息的区域。', 'borrowing-confirm-asset-check'),
    bound('BA-CF-003', '#11.1/#4-确认方式', '确认提示及保管职责', '阅读保管职责；下线Pad手写，只保留扫码/刷卡/输入工号。', 'borrowing-confirm-custody'),
    bound('BA-CF-004', '#11.2-刷卡', '刷卡/工号输入', '刷卡必须校验持卡人与申请人一致。', 'borrowing-confirm-identity-input', '::control::'),
    review('BA-CF-005', '#11.2-输入工号', '输入工号确认', '仅扫码/刷卡不可用时使用，查询人员并二次确认身份，记录为独立确认方式。', '当前输入工号与刷卡共用同一个输入框和“确认”按钮，最终统一记录为“刷卡确认”，没有独立“输入工号确认”方式和二次身份确认。', 'borrowing-confirm-identity-input'),
    review('BA-CF-006', '#11.2-狐小e扫码', '模拟扫码确认按钮', '扫码账号必须与申请人一致。', '当前“模拟扫码确认”直接调用确认成功逻辑，没有模拟或校验扫码账号与申请人一致的步骤。', 'borrowing-confirm-qr-action'),
    bound('BA-CF-007', '#11.1-确认', '确认按钮', '确认人一致后记录确认时间和方式，再允许库管员出库。', 'borrowing-confirm-manual-action', '::button::'),
    bound('BA-CF-008', '#15-确认人员不一致', '确认按钮', '人员不一致时阻断确认。', 'borrowing-confirm-manual-action', '::button::'),
  ],
};

export function flattenAssetBorrowingCoverage() {
  return Object.values(assetBorrowingRequirementCoverageByScope).flat();
}
