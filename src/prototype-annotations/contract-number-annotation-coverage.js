// 合约号码 PRD 重点覆盖账本。
// 目的不是把 PRD 全搬进标注，而是确保研发需要关注的规则都有明确去向：
// bound = 已精确绑定；review = 页面/口径需确认；skip = 明确无需单独标注。

export const CONTRACT_WAREHOUSE_SCOPE = 'route:/yewurules::个人工作台::合约号码库管员待办';

export const contractWarehouseRequirementCoverage = [
  {
    id: 'CN-WH-001',
    source: '04-合约号码申请.md#12.1',
    object: '库管员办理页',
    rule: '库管员/合约号码发放管理员线下核验员工与已配给号码。',
    status: 'bound',
    annotationId: 'contract-warehouse-onsite-handling',
  },
  {
    id: 'CN-WH-002',
    source: '04-合约号码申请.md#12.2-城市',
    object: '城市字段',
    rule: '城市通过弹窗选择，PRD 写明默认北京市。',
    status: 'review',
    reason: '当前页面存在城市字段，但默认值取业务数据且不一定为北京市；应先确认最新产品口径，再决定字段级标注或修改页面。',
  },
  {
    id: 'CN-WH-003',
    source: '04-合约号码申请.md#12.2-备注',
    object: '备注字段',
    rule: '备注可编辑，员工确认后带入合约号码台账。',
    status: 'bound',
    annotationId: 'contract-warehouse-note-rule',
    expectedTargetFragment: '::detail-field::e5a487e6b3a8',
  },
  {
    id: 'CN-WH-004',
    source: '04-合约号码申请.md#12.2-领用确认',
    object: '领用确认按钮',
    rule: '点击后进入员工领用确认页。',
    status: 'bound',
    annotationId: 'contract-warehouse-claim-action',
    expectedTargetFragment: '::button::e9a286e794a8e7a1aee8aea4',
  },
  {
    id: 'CN-WH-005',
    source: '04-合约号码申请.md#12.2-弃领',
    object: '弃领按钮',
    rule: '结束领用流程，不生成出库单，释放号码锁定，且不能恢复正常领用。',
    status: 'bound',
    annotationId: 'contract-warehouse-abandon-action',
    expectedTargetFragment: '::button::e5bc83e9a286',
  },
  {
    id: 'CN-WH-006',
    source: '04-合约号码申请.md#12.2-返回',
    object: '返回按钮',
    rule: '返回上一页。',
    status: 'skip',
    reason: '纯导航行为、无额外状态或数据副作用，不单独占用研发评审标注。',
  },
];
