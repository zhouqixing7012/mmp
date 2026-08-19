// 个人工作台第二轮 PRD 深审补充。
// 第一轮已覆盖首页主要展示/动作，本层拆细人员显隐、资产/耗材/号码范围、锁校验，以及待审批/已审批/已申请列表能力。

import { EMPLOYEE_WORKBENCH_SCOPE } from './employee-self-service-foundation-annotations';

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
const prdItem = (text) => ({ text, source: 'prd' });

function note({ id, target, kind = 'business-rule', title, rules, priority = 'P1', availability }) {
  return {
    id,
    pageKey: EMPLOYEE_WORKBENCH_SCOPE,
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
  id, source, object, rule, status: 'bound', annotationId,
  ...(expectedTargetFragment ? { expectedTargetFragment } : {}),
});
const review = (id, source, object, rule, reason, annotationId) => ({
  id, source, object, rule, status: 'review', reason,
  ...(annotationId ? { annotationId } : {}),
});
const skip = (id, source, object, rule, reason) => ({ id, source, object, rule, status: 'skip', reason });

export const PERSONAL_WORKBENCH_AUDIT_SCOPES = {
  home: EMPLOYEE_WORKBENCH_SCOPE,
};

const annotations = {
  [EMPLOYEE_WORKBENCH_SCOPE]: [
    note({
      id: 'workbench-audit-tab-visibility',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'tab', '资产'),
      kind: 'tab-rule',
      title: '页签必须按员工类型和实际持有数据动态显示',
      priority: 'P0',
      rules: [
        '正式员工展示资产、耗材页签；实习生仅展示资产页签。',
        '合约号码页签仅在当前员工名下实际存在合约号码时展示。',
      ],
    }),
    note({
      id: 'workbench-audit-asset-scope',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'tab', '资产'),
      kind: 'tab-rule',
      title: '资产页签只展示本人在用资产并按状态限制操作',
      rules: [
        '资产数据范围仅为本人名下“在用-使用中”和“在用-借用中”。',
        '资产列至少包含小类、标签号、说明、配置、数量、状态、用途；借用资产只能退库。',
      ],
    }),
    note({
      id: 'workbench-audit-lock-recheck',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'table-column', '操作'),
      kind: 'table-column-rule',
      title: '单项和批量业务跳转前必须重新校验业务锁',
      priority: 'P0',
      rules: [
        '退库、转移、更换及对应批量操作都必须在跳转前重新读取最新业务锁状态。',
        '任一所选资产已锁定时阻断发起，并明确提示资产标签号和“可能其他工单正在操作此资产”。',
      ],
    }),
    note({
      id: 'workbench-audit-transfer-route',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '批量转移'),
      kind: 'action-rule',
      title: '资产转移复用责任人变更申请页',
      rules: ['单项/批量转移进入 /People 责任人变更申请页，并将所选资产标签号预带入；该页面即当前资产转移正式申请入口。'],
      availability: 'dynamic',
    }),
    note({
      id: 'workbench-audit-consumable-scope',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'tab', '耗材'),
      kind: 'tab-rule',
      title: '耗材页签展示本人在用耗材及主资产关系',
      rules: ['仅展示本人名下在用-使用中耗材，字段包括耗材小类、耗材标签号、耗材说明、主资产标签号和主资产说明。'],
    }),
    note({
      id: 'workbench-audit-contract-scope',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'tab', '合约号码'),
      kind: 'tab-rule',
      title: '合约号码仅在实际持有时显示并支持退库',
      rules: ['只展示本人名下在用合约号码；行操作及批量操作均可带入合约号码退库申请。'],
      availability: 'dynamic',
    }),
    note({
      id: 'workbench-audit-shortcuts',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'button', '资产借用'),
      kind: 'action-rule',
      title: '快捷功能按现行统一入口与员工类型控制',
      rules: [
        '资产申请与耗材申请现行方案统一为“物资申请”入口，不再要求拆成两个按钮。',
        '实习生不展示资产借用快捷入口。',
      ],
    }),
    note({
      id: 'workbench-audit-todo-pages',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'card', '卡片区域'),
      title: '工作台仍需完整待审批、已审批、已申请查询入口',
      priority: 'P0',
      rules: [
        '待审批需支持单据类型、编号、状态、申请人、公司、板块、部门、申请时间、资产标签号查询，并按申请时间倒序分页展示。',
        '已审批复用待审批查询结构，展示当前员工历史已处理任务。',
        '已申请覆盖资产、耗材、借用、退库、转移、新员工领用、合约号码申请/退库、更换等历史申请，支持详情与流程查看。',
      ],
    }),
    note({
      id: 'workbench-audit-refresh',
      target: scopeTarget(EMPLOYEE_WORKBENCH_SCOPE, 'card', '卡片区域'),
      title: '待办数量和列表需按约60秒刷新',
      rules: ['工作台待办计数约60秒刷新一次；进入待审批/已审批列表时也应主动刷新最新数据。'],
    }),
  ],
};

const coverage = {
  [EMPLOYEE_WORKBENCH_SCOPE]: [
    review('WB2-001', '1', '访问人员', '仅正式员工和实习生开放个人工作台。', '当前 PersonalWorkspace 使用固定 mock 用户，没有员工类型准入判断。'),
    bound('WB2-002', '2-a', '资产数据范围', '资产页签展示本人名下在用-使用中/在用-借用中资产。', 'workbench-audit-asset-scope'),
    bound('WB2-003', '2-b', '资产列表字段', '展示小类、标签号、说明、配置、数量、状态、用途。', 'workbench-audit-asset-scope'),
    bound('WB2-004', '2-b', '借用资产操作', '在用-借用中资产只允许退库。', 'workbench-audit-asset-scope'),
    bound('WB2-005', '2-b', '单项动作显隐', '退库/转移/更换按物料编码允许配置显示。', 'workbench-asset-action-rules'),
    review('WB2-006', '2-b/2-c', '单项锁重校验', '进入退库/转移/更换前重新检查最新业务锁。', '当前 startAssetAction 直接导航，没有读取资产实时业务锁。', 'workbench-audit-lock-recheck'),
    bound('WB2-007', '2-b', '资产转移路由', '资产转移进入申请页并带入资产标签号。', 'workbench-audit-transfer-route', '::button::'),
    bound('WB2-008', '2-c', '批量操作显隐', '多选后按所选资产共同权限显示批量退库/转移/更换。', 'workbench-batch-return'),
    review('WB2-009', '2-c', '批量锁重校验', '批量操作前任一资产锁定均应整体阻断。', '当前批量动作同样直接调用 startAssetAction，没有最新锁状态重校验。', 'workbench-audit-lock-recheck'),
    bound('WB2-010', '2-a/2-b', '耗材范围与字段', '耗材页签展示本人在用耗材、小类、标签号、说明及主资产信息。', 'workbench-audit-consumable-scope'),
    review('WB2-011', '2-a', '实习生页签', '实习生只展示资产页签。', '当前 Tabs 固定展示资产、耗材、合约号码三个页签。', 'workbench-audit-tab-visibility'),
    review('WB2-012', '2-a', '合约号码页签显隐', '只有名下存在合约号码才展示该页签。', '当前合约号码 Tab 固定渲染，不根据实际持有数量隐藏。', 'workbench-audit-tab-visibility'),
    bound('WB2-013', '2-a/2-b', '合约号码范围与字段', '展示本人在用合约号码、号码说明并支持退库。', 'workbench-audit-contract-scope'),
    bound('WB2-014', '2-c', '合约号码批量退库', '多选号码可批量进入合约号码退库申请并带入号码。', 'workbench-audit-contract-scope'),
    bound('WB2-015', '2-c', '页签搜索', '资产/耗材/合约号码均支持当前页签标签号或说明模糊查询。', 'workbench-my-assets-rules'),
    skip('WB2-016', '2-c', '资产申请/耗材申请两个按钮', 'PRD原文分别展示资产申请、耗材申请快捷入口。', '现行产品方案已统一为“物资申请”入口，属于已确认的产品方案调整，不再作为原型缺陷。'),
    review('WB2-017', '2-c', '实习生借用入口', '实习生不展示资产借用。', '当前“资产借用”按钮固定展示，没有员工类型显隐。', 'workbench-audit-shortcuts'),
    review('WB2-018', '3', '待审批页面入口', '工作台提供当前用户待审批列表。', '当前 WORKSPACE_MENU_ITEMS 和 PersonalWorkspace 均没有待审批正式列表页。', 'workbench-audit-todo-pages'),
    review('WB2-019', '3.1-3.3', '待审批查询与列表', '待审批支持PRD规定查询条件、列表字段、分页、倒序和查看流程。', '当前没有待审批正式列表页面，查询和列表能力均无法验证。', 'workbench-audit-todo-pages'),
    review('WB2-020', '4', '已审批页面', '已审批复用待审批结构展示当前用户已处理历史。', '当前没有已审批正式列表页面。', 'workbench-audit-todo-pages'),
    review('WB2-021', '5', '已申请页面入口', '提供员工历史申请统一列表。', '当前没有已申请正式列表页面。', 'workbench-audit-todo-pages'),
    review('WB2-022', '5', '已申请查询/详情/流程', '已申请支持多业务类型、申请号/标签号/日期/状态查询，并按数量决定直接弹流程或进入详情。', '当前没有已申请正式列表页，因此查询、详情和进度查看交互均未实现。', 'workbench-audit-todo-pages'),
    review('WB2-023', '3.3', '待办刷新', '工作台约60秒刷新待办计数，列表加载也刷新。', '当前 pendingTodoCount 为固定 mock 值，没有定时或加载刷新。', 'workbench-audit-refresh'),
  ],
};

const STATUS_OVERRIDES = new Map([
  ['WB-006', { status: 'bound', reason: undefined, annotationId: 'workbench-audit-transfer-route', expectedTargetFragment: '::button::' }],
  ['WB-008', { status: 'skip', reason: '现行产品方案已将资产申请与耗材申请统一为“物资申请”入口，不再要求两个独立快捷按钮。' }],
]);

function cloneMap(map = {}) {
  return Object.fromEntries(Object.entries(map).map(([pageScope, values]) => [pageScope, [...(values || [])]]));
}

export function applyPersonalWorkbenchAnnotationAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(annotations).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export function applyPersonalWorkbenchCoverageAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(next).forEach(([pageScope, values]) => {
    next[pageScope] = values.map((item) => {
      const override = STATUS_OVERRIDES.get(item.id);
      if (!override) return item;
      const updated = { ...item, ...override };
      if (override.reason === undefined) delete updated.reason;
      return updated;
    });
  });
  Object.entries(coverage).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export const personalWorkbenchAuditAnnotationsByScope = annotations;
export const personalWorkbenchAuditCoverageByScope = coverage;
