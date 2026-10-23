import dayjs from 'dayjs';
import { readDemoData, writeDemoData } from '../../services/demoStorage';
import { inventoryResultSource } from './inventoryResultSource';

export const REPLAY_ES_APPROVER = '206984-何文';
export const REPLAY_FINANCE_APPROVER = '徐博';
const keyFor = projectNo => `inventory-replay-review-${projectNo}`;
const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

export function getReplaySubmission(projectNo) {
  const saved = readDemoData(keyFor(projectNo), null);
  if (!saved) return null;
  // 接续既有真实提交记录；仅补齐已明确的节点人员，不制造审批结果。
  return { ...saved, round: saved.round || 1, status: saved.status || '审核中', records: saved.records.map(record => ({ ...record,
    person: record.node === 'ES主管审批' ? REPLAY_ES_APPROVER : record.node === '财务经理审批' ? REPLAY_FINANCE_APPROVER : record.person,
  })) };
}

export function applyReplayPlanStatuses(plans, submission) {
  return plans.map(plan => {
    const saved = submission?.plans?.find(item => item.planNo === plan.planNo);
    return saved ? { ...plan, status: saved.status, approvalStatus: saved.approvalStatus || submission.status } : plan;
  });
}

export function validateReplaySubmission(project, plans, assetsForPlan, photoRows = []) {
  if (!project.projectNo) throw new Error('缺少盘点项目编号');
  if (project.projectType !== '复盘') throw new Error('仅复盘项目可以提交复盘审批');
  if (project.status === '盘点关闭') throw new Error('项目已关闭，不能提交审批');
  if (!plans.length) throw new Error('没有可提交的复盘计划');
  const warnings = [];
  plans.forEach(plan => {
    if (plan.status !== '盘点中') throw new Error(`计划 ${plan.planNo} 不是盘点中，不能提交审批`);
    const assets = assetsForPlan(plan);
    assets.forEach(asset => {
      if ((asset.inventoryRange || plan.range) === '机房' || ['扫码枪', '人工导入'].includes(inventoryResultSource(asset))) return;
      const review = photoRows.find(row => row.asset.assetTag === asset.assetTag);
      const photos = review?.photos;
      const submitted = photos && (photos.overall || photos.partial || photos.gallery?.length);
      if (submitted && ['待审核', '审核不通过'].includes(review.reviewStatus)) throw new Error(`计划 ${plan.planNo} 资产 ${asset.assetTag} 的照片${review.reviewStatus}，请先完成照片处理`);
    });
    if (project.samplingMode !== '百分比') return;
    const target = Number(project.samplingRatio);
    if (project.samplingRatio === '' || project.samplingRatio == null || !Number.isFinite(target) || target < 0 || target > 100) throw new Error('请填写有效的复盘比例');
    if (!assets.length) throw new Error(`计划 ${plan.planNo} 没有资产，零资产比例校验规则尚未明确`);
    const ratio = assets.filter(asset => ['已盘', '代盘'].includes(asset.inventoryStatus)).length / assets.length * 100;
    if (ratio < target) warnings.push(`计划 ${plan.planNo} 当前盘点比例${ratio.toFixed(2)}%，未达到审核比例${target}%`);
  });
  return warnings;
}

export function submitReplayReview({ project, plans, assetsForPlan, photoRows, operator, allowBelowRatio = false }) {
  const previous = getReplaySubmission(project.projectNo);
  if (previous && previous.status !== '已驳回') throw new Error('当前复盘结果已提交审批，不能重复提交');
  if (!operator) throw new Error('缺少当前操作人');
  const warnings = validateReplaySubmission(project, plans, assetsForPlan, photoRows);
  if (warnings.length && !allowBelowRatio) throw new Error(warnings.join('；'));
  const round = (previous?.round || (previous ? 1 : 0)) + 1;
  const machine = plans.every(plan => plan.range === '机房');
  if (!machine && plans.some(plan => plan.range === '机房')) throw new Error('机房与非机房审批路径不同，不能合并提交');
  const submission = {
    round, status: '审核中',
    plans: plans.map(plan => ({ ...plan, status: '审核中', approvalStatus: '审核中', financialSupervisor: REPLAY_FINANCE_APPROVER })),
    assetsByPlan: Object.fromEntries(plans.map(plan => [plan.planNo, assetsForPlan(plan)])),
    records: [...(previous?.records || []),
      { key: `start-${round}`, node: '开始', person: operator, status: '已提交', time: now() },
      { key: `review-${round}`, node: machine ? 'NO领导审批' : 'ES主管审批', person: machine ? '' : REPLAY_ES_APPROVER, status: '待审批' },
      { key: `finance-${round}`, node: '财务经理审批', person: REPLAY_FINANCE_APPROVER, status: '待流转' },
    ],
  };
  writeDemoData(keyFor(project.projectNo), submission);
  return submission;
}

export function replayDecisionBlockReason(project, submission, operator) {
  if (project.status === '盘点关闭') return '项目已关闭，审批记录只读';
  if (!submission || submission.status !== '审核中') return '当前申请不在审批中';
  const pending = submission.records.find(record => record.status === '待审批');
  if (!pending) return '缺少当前待审批节点';
  if (!pending.person) return `${pending.node}人未配置，无法继续审批`;
  if (pending.person !== operator) return '仅当前节点审批人可以操作';
  return '';
}

export function decideReplayReview({ project, operator, decision, opinion = '', round }) {
  const submission = getReplaySubmission(project.projectNo);
  const block = replayDecisionBlockReason(project, submission, operator);
  if (block) throw new Error(block);
  if (round !== submission.round) throw new Error('审批记录已变化，请重新打开申请');
  if (!['同意', '驳回'].includes(decision)) throw new Error('请选择有效审批结果');
  const index = submission.records.findIndex(record => record.status === '待审批');
  const records = submission.records.map((record, i) => i === index ? { ...record, status: decision === '同意' ? '已通过' : '已驳回', time: now(), opinion } : { ...record });
  let status = '已驳回';
  if (decision === '同意') {
    const next = records.findIndex((record, i) => i > index && record.status === '待流转');
    status = next < 0 ? '已审核' : '审核中';
    if (next >= 0) records[next].status = '待审批';
  } else {
    records.forEach((record, i) => { if (i > index && record.status === '待流转') record.status = '未流转'; });
  }
  const result = { ...submission, status, records, plans: submission.plans.map(plan => ({ ...plan, status: status === '已驳回' ? '盘点中' : status, approvalStatus: status })) };
  writeDemoData(keyFor(project.projectNo), result);
  return result;
}
