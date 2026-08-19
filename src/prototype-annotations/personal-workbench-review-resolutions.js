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
const scope = (menu) => `route:/yewurules::个人工作台::${menu}`;
const prdItem = (text) => ({ text, source: 'prd' });

function note({ id, pageKey, target, kind = 'business-rule', title, rules }) {
  return {
    id,
    pageKey,
    target,
    kind,
    title,
    summary: '',
    summarySource: 'prd',
    position: { side: 'right', align: 'center', gap: 6 },
    sections: [{ title: '研发实现规则', items: (rules || []).map(prdItem) }],
  };
}

const bound = (item, annotationId, expectedTargetFragment) => ({
  ...item,
  status: 'bound',
  annotationId,
  ...(expectedTargetFragment ? { expectedTargetFragment } : {}),
  reviewResolution: 'PRD已确认；按当前结论处理。',
});

export const PERSONAL_WORKBENCH_REVIEW_SCOPES = {
  home: EMPLOYEE_WORKBENCH_SCOPE,
  pending: scope('待审批'),
  approved: scope('已审批'),
  applied: scope('已申请'),
};

const reviewAnnotations = {
  [PERSONAL_WORKBENCH_REVIEW_SCOPES.home]: [
    note({
      id: 'workbench-review-access-scope',
      pageKey: PERSONAL_WORKBENCH_REVIEW_SCOPES.home,
      target: scopeTarget(PERSONAL_WORKBENCH_REVIEW_SCOPES.home, 'card', '卡片区域'),
      title: '个人工作台人员准入由研发按PRD校验',
      rules: [
        '个人工作台仅开放给正式员工及实习生。',
        '该人员类型准入属于研发权限校验规则，当前前端原型无需模拟员工类型与拒绝进入场景。',
      ],
    }),
  ],
  [PERSONAL_WORKBENCH_REVIEW_SCOPES.pending]: [
    note({
      id: 'workbench-review-pending-query',
      pageKey: PERSONAL_WORKBENCH_REVIEW_SCOPES.pending,
      target: scopeTarget(PERSONAL_WORKBENCH_REVIEW_SCOPES.pending, 'card', '查询条件'),
      title: '待审批查询条件按PRD提供',
      rules: [
        '支持按单据类型、单据编号、单据状态、申请人、公司、板块、部门、申请时间、资产标签号查询。',
        '单据编号和资产标签号精准匹配；待审批页面单据状态限定为处理中。',
      ],
    }),
    note({
      id: 'workbench-review-pending-list',
      pageKey: PERSONAL_WORKBENCH_REVIEW_SCOPES.pending,
      target: scopeTarget(PERSONAL_WORKBENCH_REVIEW_SCOPES.pending, 'card', '审批任务列表'),
      title: '待审批列表、分页与流程入口按PRD展示',
      rules: [
        '列表展示单据编号、单据类型、单据状态、审批环节、审批人、申请人、申请时间、公司、板块、部门及查看流程。',
        '列表支持分页并默认按申请/创建时间倒序。',
      ],
    }),
  ],
  [PERSONAL_WORKBENCH_REVIEW_SCOPES.approved]: [
    note({
      id: 'workbench-review-approved-page',
      pageKey: PERSONAL_WORKBENCH_REVIEW_SCOPES.approved,
      target: scopeTarget(PERSONAL_WORKBENCH_REVIEW_SCOPES.approved, 'card', '审批记录列表'),
      title: '已审批复用待审批页面结构',
      rules: [
        '展示当前登录人已经处理过的任务。',
        '查询条件、列表字段、分页、排序和查看流程能力与待审批保持一致。',
      ],
    }),
  ],
  [PERSONAL_WORKBENCH_REVIEW_SCOPES.applied]: [
    note({
      id: 'workbench-review-applied-query',
      pageKey: PERSONAL_WORKBENCH_REVIEW_SCOPES.applied,
      target: scopeTarget(PERSONAL_WORKBENCH_REVIEW_SCOPES.applied, 'card', '查询条件'),
      title: '已申请按业务维度查询历史申请',
      rules: [
        '支持按单据类型、申请单号、资产标签号、申请日期、单据状态查询。',
        '单据类型按个人实际发生业务动态显示；资产标签号支持模糊搜索。',
      ],
    }),
    note({
      id: 'workbench-review-applied-list',
      pageKey: PERSONAL_WORKBENCH_REVIEW_SCOPES.applied,
      target: scopeTarget(PERSONAL_WORKBENCH_REVIEW_SCOPES.applied, 'card', '申请单列表'),
      title: '已申请详情与进度查看按PRD区分',
      rules: [
        '覆盖资产申请、耗材申请、员工借用、员工退库、员工转移、新员工领用、合约号码申请、合约号码退库、资产更换。',
        '点击申请单号打开只读详情；点击单据状态进入审批记录。新员工领用无审批信息。',
        '资产申请、耗材申请通过单据明细查看分录进度；其他有审批流程的单据可直接查看审批记录。',
      ],
    }),
  ],
};

const RESOLVED_HOME = new Map([
  ['WB-001', ['workbench-review-access-scope']],
  ['WB-003', ['workbench-audit-tab-visibility', '::tab::']],
  ['WB-005', ['workbench-audit-lock-recheck', '::table-column::']],
  ['WB-010', ['workbench-audit-shortcuts', '::button::']],
  ['WB-012', ['workbench-audit-todo-pages']],
  ['WB-013', ['workbench-audit-refresh']],
  ['WB2-001', ['workbench-review-access-scope']],
  ['WB2-006', ['workbench-audit-lock-recheck', '::table-column::']],
  ['WB2-009', ['workbench-audit-lock-recheck', '::table-column::']],
  ['WB2-011', ['workbench-audit-tab-visibility', '::tab::']],
  ['WB2-012', ['workbench-audit-tab-visibility', '::tab::']],
  ['WB2-017', ['workbench-audit-shortcuts', '::button::']],
  ['WB2-023', ['workbench-audit-refresh']],
]);

const MOVED = new Map([
  ['WB2-018', [PERSONAL_WORKBENCH_REVIEW_SCOPES.pending, 'workbench-review-pending-query']],
  ['WB2-019', [PERSONAL_WORKBENCH_REVIEW_SCOPES.pending, 'workbench-review-pending-list']],
  ['WB2-020', [PERSONAL_WORKBENCH_REVIEW_SCOPES.approved, 'workbench-review-approved-page']],
  ['WB2-021', [PERSONAL_WORKBENCH_REVIEW_SCOPES.applied, 'workbench-review-applied-query']],
  ['WB2-022', [PERSONAL_WORKBENCH_REVIEW_SCOPES.applied, 'workbench-review-applied-list']],
]);

function cloneMap(map = {}) {
  return Object.fromEntries(Object.entries(map).map(([pageScope, values]) => [pageScope, [...(values || [])]]));
}

export function applyPersonalWorkbenchReviewAnnotations(base = {}) {
  const next = cloneMap(base);
  Object.entries(reviewAnnotations).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export function applyPersonalWorkbenchReviewCoverage(base = {}) {
  const next = cloneMap(base);
  const home = next[PERSONAL_WORKBENCH_REVIEW_SCOPES.home] || [];
  const kept = [];

  home.forEach((item) => {
    const moved = MOVED.get(item.id);
    if (moved) {
      const [targetScope, annotationId] = moved;
      next[targetScope] = [...(next[targetScope] || []), bound(item, annotationId)];
      return;
    }

    const resolved = RESOLVED_HOME.get(item.id);
    if (resolved) {
      const [annotationId, expectedTargetFragment] = resolved;
      kept.push(bound(item, annotationId, expectedTargetFragment));
      return;
    }

    kept.push(item);
  });

  next[PERSONAL_WORKBENCH_REVIEW_SCOPES.home] = kept;
  return next;
}
