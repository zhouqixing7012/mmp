// 员工自助 PRD 的基础层覆盖：00 总览、01 个人工作台、11 附录。
// 00 为领域定义，不强行制造 UI 锚点；01 对当前工作台精确标注；11 的人员映射挂到物资申请，通知模板来源缺失显式 review。

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
const prdItem = (text) => ({ text, source: 'prd' });

const note = ({ id, pageKey, target, kind = 'business-rule', title, rules, availability }) => ({
  id,
  pageKey,
  target,
  kind,
  title,
  summary: '',
  summarySource: 'prd',
  position: { side: 'right', align: 'center', gap: 6 },
  sections: [{ title: '研发实现规则', items: (rules || []).map(prdItem) }],
  ...(availability ? { availability } : {}),
});

const bound = (id, source, object, rule, annotationId, expectedTargetFragment) => ({
  id, source, object, rule, status: 'bound', annotationId,
  ...(expectedTargetFragment ? { expectedTargetFragment } : {}),
});
const review = (id, source, object, rule, reason, annotationId) => ({
  id, source, object, rule, status: 'review', reason,
  ...(annotationId ? { annotationId } : {}),
});
const skip = (id, source, object, rule, reason) => ({ id, source, object, rule, status: 'skip', reason });

export const EMPLOYEE_WORKBENCH_SCOPE = scope('工作台首页');
export const MATERIAL_APPLY_SCOPE = scope('物资申请');

export const foundationAnnotationsByScope = {
  [EMPLOYEE_WORKBENCH_SCOPE]: [
    note({
      id: 'workbench-my-assets-rules',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'card', '卡片区域'),
      title: '我的资产按资产、耗材、合约号码分区管理',
      rules: [
        '资产页签展示本人名下在用-使用中/在用-借用中资产；借用资产只允许退库。',
        '耗材页签展示本人名下在用耗材及主资产关联信息。',
        '合约号码页签展示本人名下在用合约号码，并支持发起号码退库。',
        '资产、耗材、合约号码均支持按标签号/说明等当前页签信息模糊查询。',
      ],
    }),
    note({
      id: 'workbench-asset-action-rules',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'table-column', '操作'),
      kind: 'table-column-rule',
      title: '资产退库/转移/更换按钮按物料配置显示',
      rules: [
        '单资产操作按钮按物料编码配置的允许退库、允许转移、允许更换规则显示。',
        '借用资产仅展示退库；多选资产时按所选资产共同权限显示批量退库、批量转移、批量更换。',
        '进入业务单据前必须再次检查资产锁定状态，已锁定资产不得继续发起。',
      ],
    }),
    note({
      id: 'workbench-material-apply-action',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '物资申请'),
      kind: 'action-rule',
      title: '物资申请进入统一资产/耗材申请入口',
      rules: ['当前重构将资产申请与耗材申请统一在“物资申请”入口，后续在申请明细中区分资产和耗材并按业务拆单。'],
    }),
    note({
      id: 'workbench-borrow-action',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '资产借用'),
      kind: 'action-rule',
      title: '资产借用仅向符合资格人员开放',
      rules: ['资产借用快捷入口需按员工类型和借用资格控制；不符合资格时不展示或不可进入。'],
    }),
    note({
      id: 'workbench-batch-return',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '批量退库'),
      kind: 'action-rule',
      title: '批量退库将所选资产带入退库申请',
      rules: ['多选资产均有退库权限时显示；点击前重新校验锁定，并将所选标签号带入退库申请。'],
      availability: 'dynamic',
    }),
    note({
      id: 'workbench-batch-transfer',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '批量转移'),
      kind: 'action-rule',
      title: '批量转移将所选资产带入转移申请',
      rules: ['多选资产均有转移权限时显示；点击前重新校验锁定，并将所选标签号带入资产转移申请。'],
      availability: 'dynamic',
    }),
    note({
      id: 'workbench-batch-replace',
      pageKey: EMPLOYEE_WORKBENCH_SCOPE,
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '批量更换'),
      kind: 'action-rule',
      title: '批量更换将所选资产带入更换申请',
      rules: ['多选资产均有更换权限时显示；点击前重新校验锁定，并将所选标签号带入资产更换申请。'],
      availability: 'dynamic',
    }),
  ],

  [MATERIAL_APPLY_SCOPE]: [
    note({
      id: 'appendix-personnel-mapping-rule',
      pageKey: MATERIAL_APPLY_SCOPE,
      target: scopeTarget(MATERIAL_APPLY_SCOPE, 'card', '本次申请明细'),
      title: '技术/设计/视频编辑人员映射影响苹果电脑审批',
      rules: [
        '人员序列/子序列映射决定技术、设计等人员标签及苹果电脑是否需要进入 VP 审批。',
        '视频编辑等专项标签应以最终 HR/PS 人员标签为准，并参与苹果电脑申请超标及审批路由判断。',
        '附录映射属于审批规则输入，不应由申请人手工选择或修改。',
      ],
    }),
  ],
};

export const foundationCoverageByScope = {
  [EMPLOYEE_WORKBENCH_SCOPE]: [
    review(
      'WB-001',
      '01-个人工作台.md#1',
      '工作台访问权限',
      '个人工作台开放给全体正式员工及实习生。',
      '当前 PersonalWorkspace 直接渲染 mock 用户，没有页面级员工类型准入校验。'
    ),
    bound(
      'WB-002',
      '01-个人工作台.md#2',
      '我的资产',
      '资产、耗材、合约号码分不同页签展示并支持当前页签模糊搜索。',
      'workbench-my-assets-rules'
    ),
    review(
      'WB-003',
      '01-个人工作台.md#2-a',
      '页签动态显隐',
      '实习生仅展示资产页签；名下有合约号码时才展示合约号码页签。',
      '当前 Tabs 固定渲染资产、耗材、合约号码三个页签，没有按员工类型或名下号码动态隐藏。',
      'workbench-my-assets-rules'
    ),
    bound(
      'WB-004',
      '01-个人工作台.md#2-b',
      '资产操作按钮',
      '退库、转移、更换按物料规则显示；借用资产只允许退库。',
      'workbench-asset-action-rules',
      '::table-column::'
    ),
    review(
      'WB-005',
      '01-个人工作台.md#2-b/c',
      '操作前资产锁校验',
      '单项及批量业务跳转前都要校验资产是否被其他单据锁定。',
      '当前 startAssetAction 直接导航，没有读取或校验资产业务锁。',
      'workbench-asset-action-rules'
    ),
    review(
      'WB-006',
      '01-个人工作台.md#2-b',
      '资产转移入口',
      '转移按钮应进入资产转移申请新增页面并带入资产标签号。',
      '当前转移动作导航到 /People，而当前工作台没有资产转移申请页面，无法形成PRD完整链路。',
      'workbench-asset-action-rules'
    ),
    bound(
      'WB-007',
      '01-个人工作台.md#2-c',
      '物资申请快捷入口',
      '快捷入口进入申请单新增页面。',
      'workbench-material-apply-action',
      '::button::'
    ),
    review(
      'WB-008',
      '01-个人工作台.md#2-c',
      '资产/耗材快捷入口',
      'PRD原文分别列资产申请和耗材申请。',
      '当前重构页面合并为一个“物资申请”入口；这是现行产品方案变化，应在最终PRD中同步口径。',
      'workbench-material-apply-action'
    ),
    bound(
      'WB-009',
      '01-个人工作台.md#2-c',
      '资产借用快捷入口',
      '快捷进入资产借用。',
      'workbench-borrow-action',
      '::button::'
    ),
    review(
      'WB-010',
      '01-个人工作台.md#2-c',
      '实习生借用入口',
      '实习生不展示资产借用按钮。',
      '当前页面固定展示资产借用按钮，没有员工类型显隐逻辑。',
      'workbench-borrow-action'
    ),
    bound(
      'WB-011',
      '01-个人工作台.md#2-c',
      '批量退库/转移/更换',
      '多选资产后按共同权限显示批量操作并带入对应新增单据。',
      'workbench-batch-return',
      '::button::'
    ),
    review(
      'WB-012',
      '01-个人工作台.md#3-5',
      '待审批/已审批/已申请',
      '工作台需提供待审批、已审批、已申请列表，支持规定查询条件、字段、分页、排序及流程查看。',
      '当前 WORKSPACE_MENU_ITEMS 和 PersonalWorkspace 均没有这三类完整列表页面，无法绑定PRD中的查询条件、列表字段和查看流程交互。'
    ),
    review(
      'WB-013',
      '01-个人工作台.md#3.3',
      '待办计数刷新',
      '工作台待办计数约60秒刷新一次，列表页加载时也刷新。',
      '当前 pendingTodoCount 为固定 mock 值，没有60秒定时刷新或列表加载刷新机制。'
    ),
  ],

  [MATERIAL_APPLY_SCOPE]: [
    bound(
      'APPX-A-001',
      '11-附录.md#附录A',
      '人员序列映射',
      '技术、设计、视频编辑等人员映射作为苹果电脑审批/超标规则输入。',
      'appendix-personnel-mapping-rule'
    ),
    review(
      'APPX-A-002',
      '11-附录.md#附录A',
      '人员映射实际来源',
      '人员序列/标签应由HR/PS系统提供并实时参与审批规则。',
      '当前物资申请原型使用静态 mock 申请人标签/级别信息，无法证明完整序列映射已经从HR/PS动态同步。',
      'appendix-personnel-mapping-rule'
    ),
    review(
      'APPX-B-001',
      '11-附录.md#附录B',
      '通知模板',
      '各流程通知文案应按“通知模板”统一配置。',
      '当前附录只写“各流程涉及通知模版见：通知模版”，仓库内本PRD文件没有提供模板正文，无法完成逐模板校验。'
    ),
  ],
};

export const FOUNDATION_PRD_MODULES = [
  {
    id: 'module-overview',
    name: '员工自助模块总览',
    prd: '00-员工自助模块总览.md',
    state: 'reference',
    label: '领域定义',
    prdSources: [{ path: 'docs/员工自助功能PRD/00-员工自助模块总览.md', reviewedBlobSha: '7aac6706b19eb24af5311f83da07d176872441d2' }],
    annotationsByScope: {},
    coverageByScope: {},
    referenceCoverage: [
      skip('OV-001', '00-员工自助模块总览.md', '资产/耗材/合约号码定义', '定义资产、耗材（普通耗材/低值耐用品）和合约号码的业务边界。', '属于跨模块领域定义，不存在独立页面控件；定义已作为各业务模块物料类型、状态和流程规则的基础，不单独制造页面标注。'),
    ],
  },
  {
    id: 'personal-workbench',
    name: '个人工作台',
    prd: '01-个人工作台.md',
    state: 'audited',
    label: '已审计，存在PRD差异',
    prdSources: [{ path: 'docs/员工自助功能PRD/01-个人工作台.md', reviewedBlobSha: '9c44d029ff5087a9597629e2e522f882de283b7a' }],
    annotationsByScope: { [EMPLOYEE_WORKBENCH_SCOPE]: foundationAnnotationsByScope[EMPLOYEE_WORKBENCH_SCOPE] },
    coverageByScope: { [EMPLOYEE_WORKBENCH_SCOPE]: foundationCoverageByScope[EMPLOYEE_WORKBENCH_SCOPE] },
  },
  {
    id: 'appendix',
    name: '附录',
    prd: '11-附录.md',
    state: 'audited',
    label: '已审计，存在来源待补项',
    prdSources: [{ path: 'docs/员工自助功能PRD/11-附录.md', reviewedBlobSha: 'e7f941444db9aa655a1d264da8d621f4a81fceac' }],
    annotationsByScope: { [MATERIAL_APPLY_SCOPE]: [foundationAnnotationsByScope[MATERIAL_APPLY_SCOPE][0]] },
    coverageByScope: { [MATERIAL_APPLY_SCOPE]: foundationCoverageByScope[MATERIAL_APPLY_SCOPE] },
  },
];

export default foundationAnnotationsByScope;
