import { assertInventoryManagementPermission } from './inventoryManagementPermissions';
import { sumInventoryQuantity } from './inventoryQuantity';
import dayjs from 'dayjs';
import { readDemoData, writeDemoData } from '../../services/demoStorage';
import { inventoryResultSource } from './inventoryResultSource';

export const REPLAY_FINANCE_APPROVER = '徐博';
const keyFor = projectNo => `inventory-replay-review-${projectNo}`;
const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
const present = value => Boolean(String(value ?? '').trim()) && value !== '-';
const emptyState = () => ({ version: 2, planReviews: {}, projectReview: null, plans: [], todoLifecycle: [] });

export function getReplaySubmission(projectNo) {
  const saved = readDemoData(keyFor(projectNo), null);
  if (!saved) return null;
  // 旧审批链只留作历史，不把旧ES/NO结论当作新的计划或项目审批。
  if (saved.version !== 2 || (saved.projectNo && saved.projectNo !== projectNo)) return { ...emptyState(), projectNo, legacySubmission: saved };
  return { ...saved, projectNo };
}

function saveState(projectNo, state) {
  const result = { ...state, projectNo, plans: Object.values(state.planReviews).flatMap(review => review.plans), status: state.projectReview?.status || '未提交' };
  writeDemoData(keyFor(projectNo), result);
  return result;
}

function samePlanInstance(saved, plan) {
  if (!saved || saved.planNo !== plan.planNo || ['草稿', '暂存'].includes(plan.status)) return false;
  if ((saved.key || plan.key) && saved.key !== plan.key) return false;
  return !(saved.reviewInstanceKey || plan.reviewInstanceKey) || saved.reviewInstanceKey === plan.reviewInstanceKey;
}

export function getReplayReviewForPlan(state, plan, projectNo = state?.projectNo) {
  if (state?.projectNo && projectNo && state.projectNo !== projectNo) return null;
  const review = state?.planReviews?.[plan.planNo];
  if (!samePlanInstance(review?.plans?.[0], plan) || (review.projectNo && review.projectNo !== projectNo)) return null;
  if (!review.records?.some(record => record.node === '提交计划审批' && record.status === '已提交')) return null;
  return review;
}

export function getReplayProjectReview(state, plans, projectNo = state?.projectNo) {
  if (state?.projectNo && projectNo && state.projectNo !== projectNo) return null;
  const review = state?.projectReview;
  if (!review || (review.projectNo && review.projectNo !== projectNo) || !plans.length || review.plans?.length !== plans.length) return null;
  if (!plans.every(plan => review.plans.some(saved => samePlanInstance(saved, plan)))) return null;
  if (!review.records?.some(record => record.node === '提交项目审批' && record.status === '已提交')) return null;
  return review;
}

export function applyReplayPlanStatuses(plans, submission, projectNo = submission?.projectNo) {
  return plans.map(plan => {
    const saved = getReplayReviewForPlan(submission, plan, projectNo)?.plans[0];
    return saved ? { ...plan, status: saved.status, approvalStatus: saved.approvalStatus } : plan;
  });
}

function projectBlock(project) {
  if (!project.projectNo) return '缺少盘点项目编号';
  if (project.projectType !== '复盘') return '仅复盘项目可以提交复盘审批';
  if (['盘点关闭', '关闭'].includes(project.status)) return '项目已关闭，审批记录只读';
  return '';
}

export function validateReplaySubmission(project, plans, assetsForPlan, photoRows = []) {
  const block = projectBlock(project);
  if (block) throw new Error(block);
  if (plans.length !== 1) throw new Error('每次只能提交一个复盘计划');
  const plan = plans[0];
  if (plan.status !== '盘点中') throw new Error(`计划 ${plan.planNo} 不是盘点中，不能提交审批`);
  const assets = assetsForPlan(plan);
  if (!assets.length) throw new Error(`计划 ${plan.planNo} 没有资产，不能确定计划监督人`);
  if (assets.some(asset => !present(asset.supervisor))) throw new Error(`计划 ${plan.planNo} 存在未配置监督人的资产，请先配置`);
  if (sumInventoryQuantity(assets) === 0) throw new Error(`计划 ${plan.planNo} 资产数量为零，不能提交审批`);
  assets.forEach(asset => {
    if ((asset.inventoryRange || plan.range) === '机房' || ['扫码枪', '人工导入'].includes(inventoryResultSource(asset))) return;
    const review = photoRows.find(row => row.asset.assetTag === asset.assetTag);
    const photos = review?.photos;
    const submitted = photos && (photos.overall || photos.partial || photos.gallery?.length);
    if (submitted && ['待审核', '审核不通过'].includes(review.reviewStatus)) throw new Error(`计划 ${plan.planNo} 资产 ${asset.assetTag} 的照片${review.reviewStatus}，请先完成照片处理`);
  });
  return [];
}

export function submitReplayReview({ project, plans, assetsForPlan, photoRows, operator }) {
  assertInventoryManagementPermission(project, operator);
  let state = getReplaySubmission(project.projectNo) || emptyState();
  if (!operator) throw new Error('缺少当前操作人');
  validateReplaySubmission(project, plans, assetsForPlan, photoRows);
  const plan = plans[0];
  const stored = state.planReviews[plan.planNo];
  const previous = getReplayReviewForPlan(state, plan, project.projectNo);
  if (stored && !previous) {
    const planReviews = { ...state.planReviews };
    delete planReviews[plan.planNo];
    state = { ...state, planReviews, planReviewHistory: [...(state.planReviewHistory || []), stored],
      projectReviewHistory: [...(state.projectReviewHistory || []), ...(state.projectReview ? [state.projectReview] : [])], projectReview: null };
  }
  if (state.projectReview && !state.projectReview.plans?.some(saved => samePlanInstance(saved, plan))) {
    state = { ...state, projectReviewHistory: [...(state.projectReviewHistory || []), state.projectReview], projectReview: null };
  }
  if (state.projectReview && state.projectReview.status !== '已驳回') throw new Error('项目已提交审批，不能重新提交计划');
  if (previous && previous.status !== '已驳回') throw new Error('该计划已提交审批，不能重复提交');
  const assets = assetsForPlan(plan);
  const supervisors = [...new Set(assets.map(asset => asset.supervisor))];
  const round = (previous?.round || 0) + 1;
  const review = {
    scope: 'plan', projectNo: project.projectNo, planNo: plan.planNo, round, status: '审核中',
    plans: [{ ...plan, status: '审核中', approvalStatus: '审核中' }],
    assetsByPlan: { [plan.planNo]: assets },
    records: [...(previous?.records || []), { key: `start-${round}`, node: '提交计划审批', person: operator, status: '已提交', time: now() },
      ...supervisors.map((person, index) => ({ key: `supervisor-${round}-${index}`, node: '计划监督人审批', person, status: '待审批' }))],
  };
  return saveState(project.projectNo, { ...state, planReviews: { ...state.planReviews, [plan.planNo]: review } });
}

export function replayProjectSubmissionBlockReason(project, plans, state) {
  const block = projectBlock(project);
  if (block) return block;
  if (!plans.length) return '没有可提交的复盘计划';
  if (plans.some(plan => getReplayReviewForPlan(state, plan, project.projectNo)?.status !== '已审核')) return '全部复盘计划审批通过后才能提交项目审批';
  try {
    if (plans.some(plan => sumInventoryQuantity(getReplayReviewForPlan(state, plan, project.projectNo).assetsByPlan?.[plan.planNo] || []) === 0)) return '存在零资产计划，不能提交项目审批';
  } catch (error) { return error.message; }
  const current = getReplayProjectReview(state, plans, project.projectNo);
  if (current && current.status !== '已驳回') return '项目已提交审批，不能重复提交';
  return '';
}

export function submitReplayProjectReview({ project, plans, operator }) {
  assertInventoryManagementPermission(project, operator);
  const state = getReplaySubmission(project.projectNo) || emptyState();
  const block = replayProjectSubmissionBlockReason(project, plans, state);
  if (block) throw new Error(block);
  if (!operator) throw new Error('缺少当前操作人');
  const previous = getReplayProjectReview(state, plans, project.projectNo);
  const projectReviewHistory = [...(state.projectReviewHistory || []), ...(state.projectReview && !previous ? [state.projectReview] : [])];
  const round = (previous?.round || 0) + 1;
  const reviews = plans.map(plan => state.planReviews[plan.planNo]);
  const review = { scope: 'project', projectNo: project.projectNo, round, status: '审核中', plans: reviews.flatMap(item => item.plans),
    assetsByPlan: Object.assign({}, ...reviews.map(item => item.assetsByPlan)),
    records: [...(previous?.records || []), { key: `project-start-${round}`, node: '提交项目审批', person: operator, status: '已提交', time: now() },
      { key: `finance-${round}`, node: '财务经理审批', person: REPLAY_FINANCE_APPROVER, status: '待审批' }],
  };
  return saveState(project.projectNo, { ...state, projectReviewHistory, projectReview: review });
}

export function replayDecisionBlockReason(project, review, operator) {
  const block = projectBlock(project);
  if (block) return block;
  if (!review || review.status !== '审核中') return '当前申请不在审批中';
  if (!review.records.some(record => record.status === '待审批' && record.person === operator)) return '仅当前待审批人可以操作';
  return '';
}

export function decideReplayReview({ project, operator, decision, opinion = '', round, planNo, planKey, reviewInstanceKey, plans, scope = 'plan' }) {
  const state = getReplaySubmission(project.projectNo);
  const review = scope === 'project' ? state?.projectReview : state?.planReviews?.[planNo];
  const block = replayDecisionBlockReason(project, review, operator);
  if (block) throw new Error(block);
  if (scope === 'plan' && ((review.plans[0].key && review.plans[0].key !== planKey) || (review.plans[0].reviewInstanceKey && review.plans[0].reviewInstanceKey !== reviewInstanceKey))) throw new Error('计划实例已变化，请重新打开申请');
  if (scope === 'project' && plans && !getReplayProjectReview(state, plans, project.projectNo)) throw new Error('项目计划实例已变化，请重新打开申请');
  if (round !== review.round) throw new Error('审批记录已变化，请重新打开申请');
  if (!['同意', '驳回'].includes(decision)) throw new Error('请选择有效审批结果');
  if (decision === '驳回' && !String(opinion || '').trim()) throw new Error('请填写驳回意见');
  opinion = String(opinion || '').trim();
  const records = review.records.map(record => record.status === '待审批' && record.person === operator
    ? { ...record, status: decision === '同意' ? '已通过' : '已驳回', time: now(), opinion } : { ...record });
  const status = decision === '驳回' ? '已驳回' : records.some(record => record.status === '待审批') ? '审核中' : '已审核';
  if (decision === '驳回') records.forEach(record => { if (record.status === '待审批') record.status = '未处理'; });
  const result = { ...review, status, records };
  if (scope === 'project') {
    if (status !== '已驳回') return saveState(project.projectNo, { ...state, projectReview: result });
    // 项目驳回后恢复关联计划执行，修改后的结果重新走计划审批。
    const planReviews = { ...state.planReviews };
    review.plans.forEach(plan => {
      const previous = planReviews[plan.planNo];
      if (!previous) return;
      planReviews[plan.planNo] = { ...previous, status: '已驳回', plans: previous.plans.map(item => ({ ...item, status: '盘点中', approvalStatus: '已驳回' })) };
    });
    return saveState(project.projectNo, { ...state, projectReview: result, planReviews });
  }
  result.plans = review.plans.map(plan => ({ ...plan, status: status === '已驳回' ? '盘点中' : status, approvalStatus: status }));
  const todoLifecycle = [...state.todoLifecycle];
  if (status === '已审核') {
    const executors = [...new Set(review.assetsByPlan[planNo].map(asset => asset.executor).filter(present))];
    executors.forEach(person => todoLifecycle.push({ id: `${project.projectNo}:${review.plans[0].reviewInstanceKey || review.plans[0].key || planNo}:${round}:${person}:clear`, planNo, planKey: review.plans[0].key, reviewInstanceKey: review.plans[0].reviewInstanceKey, round, person, channel: '狐小e', action: '清除盘点待办', status: '演示已清除', serviceStatus: '正式服务未接入', time: now() }));
  }
  return saveState(project.projectNo, { ...state, planReviews: { ...state.planReviews, [planNo]: result }, todoLifecycle });
}
