// 资产退库第二轮 PRD 深审补充。
// 第一轮已有申请/领导/MIS/ES办理/员工确认五个页面基础标注；本层补充真实锁、动态路由、ES鉴定、入库台账、21天超期、通知及核心入库页。

import { ASSET_RETURN_SCOPES } from './employee-self-service-expanded-annotations';

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
const cardTarget = (cardTitle, kind, label) => `card-${stableKey(cardTitle)}::${kind}::${stableKey(label)}`;
const prdItem = (text) => ({ text, source: 'prd' });

function note({ id, pageKey, target, kind = 'business-rule', title, rules, priority = 'P1', availability }) {
  return {
    id,
    pageKey,
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

export const ASSET_RETURN_AUDIT_SCOPES = {
  ...ASSET_RETURN_SCOPES,
  inbound: 'route:/yewurules::库存管理::入库',
};

const annotations = {
  [ASSET_RETURN_SCOPES.apply]: [
    note({
      id: 'asset-return-audit-apply-range',
      pageKey: ASSET_RETURN_SCOPES.apply,
      target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'card', '退库资产明细'),
      title: '可退库范围必须同时满足本人权限、状态、锁与盘点规则',
      priority: 'P0',
      rules: [
        '正式员工、实习生仅可退库本人名下且在“我的资产”具备退库操作权限的资产。',
        '被其他流程锁定的资产不可勾选；处于开启盘点计划且需盘未盘时不得提交。',
        '已加入当前申请的资产不得重复添加。',
      ],
    }),
    note({
      id: 'asset-return-audit-consumable-integrity',
      pageKey: ASSET_RETURN_SCOPES.apply,
      target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'card', '退库资产明细'),
      title: '主资产关联升级耗材必须完整随退库',
      priority: 'P0',
      rules: [
        '选择主资产后自动识别资产卡片“耗材信息”分录中的全部关联耗材。',
        '关联耗材不可单独取消；如存在但未完整纳入退库范围，必须明确提示具体耗材标签号并阻断提交。',
        '关联耗材不单独生成退库申请单，但需与主资产同步锁定、入库和更新台账。',
      ],
    }),
    note({
      id: 'asset-return-audit-selector',
      pageKey: ASSET_RETURN_SCOPES.apply,
      target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'button', '添加资产'),
      kind: 'action-rule',
      title: '资产选择弹窗保留锁定资产查看能力但禁止勾选',
      rules: [
        '查询条件包括资产标签号、资产说明、资产状态、资产用途、是否锁定；默认“是否锁定=否”。',
        '切换为“是”时锁定资产仍可查看，但复选框必须禁用并说明原因。',
        '确认回填前重新校验状态、锁定与盘点条件，避免查询后资产状态变化导致脏回填。',
      ],
    }),
    note({
      id: 'asset-return-audit-submit',
      pageKey: ASSET_RETURN_SCOPES.apply,
      target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交按主资产拆单、持久锁定并动态生成审批链',
      priority: 'P0',
      rules: [
        '一项主资产生成一张独立退库单，每张单独审批、单独锁定、单独生成入库单。',
        '提交时重新校验退库原因、资产状态、盘点、业务锁和关联耗材完整性。',
        '提交成功需对主资产及关联耗材建立真实持久化业务锁。',
        '资产用途=部门公用先走直属5级及以上领导；其余跳过领导。之后按“退库MIS鉴定”配置进入MIS或ES办理。',
      ],
    }),
    note({
      id: 'asset-return-audit-submit-contact',
      pageKey: ASSET_RETURN_SCOPES.apply,
      target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交成功提示必须带出真实办理地点和默认库管员联系人',
      rules: [
        '按申请人部门+公司+办公区匹配默认仓库，再按仓库默认库管员带出联系人、电话和邮箱。',
        '部门公用资产需提示通过5级及以上领导审批后再携带资产到对应办公区办理。',
        '页面提示与服务号通知应使用同一仓库/联系人映射结果。',
      ],
    }),
    note({
      id: 'asset-return-audit-return-action',
      pageKey: ASSET_RETURN_SCOPES.apply,
      target: scopeTarget(ASSET_RETURN_SCOPES.apply, 'button', '返回'),
      kind: 'action-rule',
      title: '返回只退出当前编辑，不应等价于清空草稿',
      rules: ['返回不提交本次修改；如产品保留草稿或未保存确认，应按统一工作台规则处理，不能用“清空所选资产+原因”代替导航。'],
    }),
  ],

  [ASSET_RETURN_SCOPES.leader]: [
    note({
      id: 'asset-return-audit-leader-trigger',
      pageKey: ASSET_RETURN_SCOPES.leader,
      target: scopeTarget(ASSET_RETURN_SCOPES.leader, 'card', '资产信息'),
      title: '只有部门公用资产进入直属5级及以上领导审批',
      priority: 'P0',
      rules: [
        '资产用途=部门公用才生成领导节点；其他用途必须跳过。',
        '审批人从申请人汇报链动态查找直属5级及以上领导，不使用固定mock人员。',
      ],
    }),
    note({
      id: 'asset-return-audit-leader-agree',
      pageKey: ASSET_RETURN_SCOPES.leader,
      target: cardTarget('审批操作', 'button', '同意'),
      kind: 'action-rule',
      title: '领导同意后按物料退库MIS配置真实推进流程',
      priority: 'P0',
      rules: [
        '同意后若“退库MIS鉴定=是”进入MIS，否则直接进入ES退库办理。',
        '操作必须写审批记录、更新当前节点并生成下一处理人待办，不能只提示成功。',
      ],
    }),
    note({
      id: 'asset-return-audit-leader-reject',
      pageKey: ASSET_RETURN_SCOPES.leader,
      target: cardTarget('审批操作', 'button', '驳回'),
      kind: 'action-rule',
      title: '领导驳回整单结束并显式释放主资产与耗材锁',
      priority: 'P0',
      rules: ['驳回意见必填；单据更新为已驳回，结束流程，不生成入库单，并显式释放主资产及关联耗材业务锁。'],
    }),
    note({
      id: 'asset-return-audit-leader-addsign',
      pageKey: ASSET_RETURN_SCOPES.leader,
      target: cardTarget('审批操作', 'button', '加签'),
      kind: 'action-rule',
      title: '加签必须成为真实审批节点而不是页面提示',
      rules: ['加签确认后需增加处理人、待办和审批记录；被加签人处理完成后再回到原审批链。'],
    }),
  ],

  [ASSET_RETURN_SCOPES.mis]: [
    note({
      id: 'asset-return-audit-mis-result',
      pageKey: ASSET_RETURN_SCOPES.mis,
      target: scopeTarget(ASSET_RETURN_SCOPES.mis, 'card', '审批信息'),
      title: 'MIS需独立维护鉴定结果和鉴定说明',
      priority: 'P0',
      rules: [
        '页面应有独立“鉴定结果”：鉴定通过、鉴定不通过。',
        '鉴定不通过时鉴定说明必填且最多400字；鉴定通过时说明可选。',
        '维修记录和附件信息应可查看/上传，并保留节点上传人和时间。',
      ],
    }),
    note({
      id: 'asset-return-audit-mis-agree',
      pageKey: ASSET_RETURN_SCOPES.mis,
      target: cardTarget('审批信息', 'button', '同意'),
      kind: 'action-rule',
      title: '只有鉴定通过允许同意并进入ES办理',
      priority: 'P0',
      rules: ['点击同意时鉴定结果必须为鉴定通过；写入鉴定人/日期后生成ES库管员待办。'],
    }),
    note({
      id: 'asset-return-audit-mis-reject',
      pageKey: ASSET_RETURN_SCOPES.mis,
      target: cardTarget('审批信息', 'button', '驳回'),
      kind: 'action-rule',
      title: '只有鉴定不通过允许驳回并真实解锁',
      priority: 'P0',
      rules: ['点击驳回时鉴定结果必须为鉴定不通过，鉴定说明/审批意见按规则必填；驳回后显式释放主资产及关联耗材锁。'],
    }),
    note({
      id: 'asset-return-audit-mis-notification',
      pageKey: ASSET_RETURN_SCOPES.mis,
      target: scopeTarget(ASSET_RETURN_SCOPES.mis, 'card', '审批信息'),
      title: 'MIS结果需生成库管员待办或驳回通知',
      rules: [
        '鉴定通过后按默认仓库匹配库管员并通知待现场办理。',
        '鉴定不通过后通知申请人退库申请已驳回及原因。',
      ],
    }),
  ],

  [ASSET_RETURN_SCOPES.handling]: [
    note({
      id: 'asset-return-audit-handling-warehouse',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '仓库'),
      kind: 'field-rule',
      title: '仓库按人员组织和办公区映射，并限制当前库管员入库权限',
      priority: 'P0',
      rules: [
        '默认仓库按申请人部门+公司+办公区映射。',
        '可选范围仅为当前公司下、当前库管员拥有入库权限的仓库。',
        '仓库变化后责任人同步带出对应虚拟库管员及虚拟组织。',
      ],
    }),
    note({
      id: 'asset-return-audit-handling-appraisal',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'card', '退库信息维护'),
      title: 'ES办理必须承接或补充最终鉴定结果',
      priority: 'P0',
      rules: [
        '经过MIS时自动带出鉴定结果/说明并只读。',
        '未经过MIS时由ES填写鉴定结果，默认鉴定通过；鉴定不通过时说明必填。',
        '最终鉴定人/鉴定日期需进入退库入库单详情。',
      ],
    }),
    note({
      id: 'asset-return-audit-handling-mark',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '资产标记'),
      kind: 'field-rule',
      title: '资产标记复用真实枚举并影响后续出库',
      rules: ['资产标记使用系统现有真实枚举；入库完成后回写资产台账，已标记资产按既有规则限制再次出库。'],
    }),
    note({
      id: 'asset-return-audit-handling-date',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '退库日期'),
      kind: 'field-rule',
      title: '退库日期默认当前日期且允许ES调整',
      rules: ['退库日期为必填日期控件，默认当前登录日期；员工确认时间用于确认记录，不能直接替代可编辑退库日期。'],
    }),
    note({
      id: 'asset-return-audit-handling-usage',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: cardTarget('退库信息维护', 'detail-field', '使用说明'),
      kind: 'field-rule',
      title: '使用说明作为最终入库台账字段保存',
      rules: ['ES填写的使用说明需随入库结果更新资产台账，并进入退库入库单详情。'],
    }),
    note({
      id: 'asset-return-audit-handling-inventory',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'card', '退库资产信息'),
      title: '盘点信息仅在资产处于开启盘点计划时展示',
      rules: ['只有处于开启盘点计划时才展示盘点执行人和盘点状态；不得用固定mock盘点信息永久占位。'],
    }),
    note({
      id: 'asset-return-audit-handling-tools',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'card', '退库资产信息'),
      title: '办理页需要维修记录、附件和员工名下资产辅助查询',
      rules: [
        '支持查看该资产历史维修记录。',
        '支持当前节点上传附件；历史节点附件只读，不能删除他人/其他节点附件。',
        '申请人姓名后提供“查看员工名下资产”，支持资产/耗材、状态、用途、锁定等条件查询和总量概览。',
      ],
    }),
    note({
      id: 'asset-return-audit-handling-confirm',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'button', '确认'),
      kind: 'action-rule',
      title: '确认动作需区分“发起员工确认”和“执行入库”阶段',
      priority: 'P0',
      rules: [
        '员工确认未发起时，先保存ES维护字段并生成员工退库确认待办。',
        '待确认阶段不得执行入库；确认完成后按最终产品口径自动入库或由库管员执行入库。',
        'PRD同时出现“员工确认成功后系统自动执行入库”和“由库管员执行入库”两种描述，需要统一最终时点。',
      ],
    }),
    note({
      id: 'asset-return-audit-handling-timeout',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'card', '审批意见'),
      title: 'ES确认待办满21天必须自动驳回并解锁',
      priority: 'P0',
      rules: ['从进入ES确认/办理待办的业务时间起计算21天；超期系统自动将单据置已驳回、结束员工确认并释放主资产及关联耗材锁。'],
    }),
    note({
      id: 'asset-return-audit-handling-reject',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'button', '驳回'),
      kind: 'action-rule',
      title: 'ES驳回意见必填、不得生成入库单并真实解锁',
      priority: 'P0',
      rules: ['未完成入库前可驳回；审批意见必填；驳回后单据已驳回、不生成入库单，并显式释放主资产和关联耗材业务锁。'],
    }),
    note({
      id: 'asset-return-audit-handling-inbound',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'button', '确认'),
      kind: 'action-rule',
      title: '正常退库必须生成真实核心入库单并更新主资产/耗材台账',
      priority: 'P0',
      rules: [
        '核心入库页生成“退库入库”单，记录源退库申请单号、制单人和制单时间并支持套打。',
        '主资产状态更新为在库-待处理，仓库/地点取ES最终值，责任人和组织按仓库虚拟库管员规则更新。',
        '资产用途、使用说明、资产标记按ES最终值回写；关联升级耗材同步入库并更新台账。',
        '生成资产事务变更记录和相关报表，全部成功后单据状态为已完成并结束锁定。',
      ],
    }),
    note({
      id: 'asset-return-audit-handling-notification',
      pageKey: ASSET_RETURN_SCOPES.handling,
      target: scopeTarget(ASSET_RETURN_SCOPES.handling, 'card', '审批意见'),
      title: '现场办理、员工确认、完成与驳回均需有真实服务号通知',
      rules: [
        '进入ES办理时通知匹配库管员和申请人办理地点/联系人。',
        '发起员工确认后通知申请人完成扫码/刷卡/工号确认。',
        '正常完成或驳回后通知申请人最终结果；发送失败需记录并可补发。',
      ],
    }),
  ],

  [ASSET_RETURN_SCOPES.confirm]: [
    note({
      id: 'asset-return-audit-confirm-content',
      pageKey: ASSET_RETURN_SCOPES.confirm,
      target: scopeTarget(ASSET_RETURN_SCOPES.confirm, 'card', '退库资产明细'),
      title: '确认页需完整展示退库资产、关联耗材及交还提示',
      rules: [
        '展示资产标签号、说明、配置、数量、退库原因、使用说明和全部关联耗材。',
        '红色提示需明确员工确认已将页面所列资产及附件/相关配件交还库管员。',
      ],
    }),
    note({
      id: 'asset-return-audit-confirm-identity',
      pageKey: ASSET_RETURN_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认退库'),
      kind: 'action-rule',
      title: '扫码、刷卡、手工工号均必须校验真实确认员工',
      priority: 'P0',
      rules: [
        '刷卡读取实际员工卡工号，手工录入使用输入工号；均与当前退库申请人工号比较。',
        '狐小e扫码必须取得实际扫码账号再校验，不能直接用申请人工号模拟成功。',
        '工号不一致统一提示“员工工号不匹配！”。',
      ],
    }),
    note({
      id: 'asset-return-audit-confirm-record',
      pageKey: ASSET_RETURN_SCOPES.confirm,
      target: cardTarget('刷卡/扫码确认', 'button', '确认退库'),
      kind: 'action-rule',
      title: '每张退库单只确认一次并保存完整确认记录',
      rules: ['成功后记录确认方式、确认工号、确认时间和结果；已确认单据禁止再次确认，并将结果回传ES办理/入库链路。'],
    }),
    note({
      id: 'asset-return-audit-confirm-inbound-timing',
      pageKey: ASSET_RETURN_SCOPES.confirm,
      target: scopeTarget(ASSET_RETURN_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '员工确认后的入库执行时点需统一PRD口径',
      priority: 'P0',
      rules: [
        '建设目标写“员工确认后由库管员执行入库”，4.6又写“员工确认成功后系统自动执行入库”。',
        '最终实现必须只保留一种口径，并确保不会出现重复入库或确认成功但长期未入库。',
      ],
    }),
  ],

  [ASSET_RETURN_AUDIT_SCOPES.inbound]: [
    note({
      id: 'asset-return-audit-inbound-list',
      pageKey: ASSET_RETURN_AUDIT_SCOPES.inbound,
      target: scopeTarget(ASSET_RETURN_AUDIT_SCOPES.inbound, 'card', '入库单列表'),
      title: '退库入库单必须与源退库申请建立可追溯关联',
      rules: ['入库列表展示入库单号、来源申请单号、退库入库类型、仓库、制单人/日期和数量，并可按关键字段查询。'],
    }),
    note({
      id: 'asset-return-audit-inbound-detail',
      pageKey: ASSET_RETURN_AUDIT_SCOPES.inbound,
      target: scopeTarget(ASSET_RETURN_AUDIT_SCOPES.inbound, 'card', '入库单列表'),
      title: '退库入库详情需保留鉴定、员工确认和ES最终维护字段',
      priority: 'P0',
      rules: [
        '详情展示资产/关联耗材、仓库地点、鉴定结果/说明、鉴定人/日期。',
        '展示员工确认方式、确认工号、确认时间，以及备注、使用说明、资产标记。',
        '来源申请单号可追溯回员工退库申请。',
      ],
    }),
    note({
      id: 'asset-return-audit-inbound-print',
      pageKey: ASSET_RETURN_AUDIT_SCOPES.inbound,
      target: scopeTarget(ASSET_RETURN_AUDIT_SCOPES.inbound, 'button', '批量打印'),
      kind: 'action-rule',
      title: '打印必须调用真实入库单套打能力',
      rules: ['退库入库单沿用核心入库套打模板；单张/批量打印需生成真实打印结果和打印记录，不能只提示“操作已记录”。'],
    }),
  ],
};

const coverage = {
  [ASSET_RETURN_SCOPES.apply]: [
    bound('RT2-AP-001', '2/6', '申请角色', '正式员工、实习生可对本人有权限资产发起退库。', 'asset-return-audit-apply-range'),
    review('RT2-AP-002', '4.2/6.3', '本人退库权限', '仅本人名下且在“我的资产”具备退库操作权限。', '当前资产来源是 EMPLOYEE_REPLACEMENT_ASSETS mock，没有可验证的“我的资产退库权限”字段。', 'asset-return-audit-apply-range'),
    bound('RT2-AP-003', '6.1', '退库类型', '资产退库/离职退还，默认资产退库。', 'asset-return-reason'),
    bound('RT2-AP-004', '6.1', '退库原因', '必填且最多400字。', 'asset-return-reason'),
    bound('RT2-AP-005', '6.1', '部门公用提示', '页面提示部门公用需直属5级及以上领导审批。', 'asset-return-audit-apply-range'),
    bound('RT2-AP-006', '6.1', '退库资产总数', '统计主资产数量，关联耗材不重复计入。', 'asset-return-assets'),
    bound('RT2-AP-007', '6.1', '申请明细字段', '标签号、说明、配置、数量、状态、用途、部件数量。', 'asset-return-assets'),
    bound('RT2-AP-008', '4.3/6.3', '关联耗材自动带出', '选择主资产时自动识别关联升级耗材并展示。', 'asset-return-audit-consumable-integrity'),
    review('RT2-AP-009', '4.3', '关联耗材真实来源', '关联耗材来自资产卡片耗材信息分录。', '当前 assetConsumables() 根据 asset.consumables 动态伪造一条 QT-* 记录，不是实际耗材台账分录。', 'asset-return-audit-consumable-integrity'),
    review('RT2-AP-010', '4.3/6.2', '关联耗材完整性阻断', '缺任一子耗材需列出标签号并阻断提交。', '当前关联耗材由页面自动附带，service 没有对真实耗材分录做完整性比对或专门提示。', 'asset-return-audit-consumable-integrity'),
    bound('RT2-AP-011', '6.3', '选择弹窗查询条件', '支持标签号、说明、状态、用途、是否锁定查询。', 'asset-return-audit-selector'),
    bound('RT2-AP-012', '6.3', '锁定资产查看', '是否锁定切换为是时可查看但不可勾选。', 'asset-return-audit-selector'),
    review('RT2-AP-013', '4.2/6.3', '盘点未盘限制', '开启盘点计划且需盘未盘不得提交。', 'getAssetReturnEligibility 只校验状态和锁，没有盘点计划/未盘判断。', 'asset-return-audit-apply-range'),
    bound('RT2-AP-014', '6.3', '已选去重', '已加入申请的资产不重复展示为可选。', 'asset-return-audit-selector'),
    bound('RT2-AP-015', '4.1/6.2', '一主资产一单拆分', '批量提交按主资产分别生成退库单。', 'asset-return-audit-submit', '::button::'),
    review('RT2-AP-016', '4.2', '主资产及耗材持久业务锁', '提交后锁定主资产及全部关联耗材并阻断冲突业务。', '当前 returnBusinessLocked 仅通过是否存在处理中退库单动态推导，且只基于主资产标签，没有独立耗材锁。', 'asset-return-audit-submit'),
    review('RT2-AP-017', '6.2', '提交成功联系人提示', '提示默认仓库、库管员、电话、邮箱和办理办公区。', '当前只提示生成多少张退库单，没有仓库/库管员联系人映射结果。', 'asset-return-audit-submit-contact'),
    review('RT2-AP-018', '6.2', '返回行为', '返回不保存本次未提交修改。', '当前“返回”按钮只清空 selectedIds 和 reason，并没有导航返回；行为与按钮语义不一致。', 'asset-return-audit-return-action'),
  ],

  [ASSET_RETURN_SCOPES.leader]: [
    bound('RT2-LD-001', '4.4/7', '触发条件', '只有部门公用资产进入领导审批。', 'asset-return-audit-leader-trigger'),
    review('RT2-LD-002', '7', '动态领导', '从申请人汇报链查找直属5级及以上领导。', '当前领导页审批人固定为 110127-国庆临，且页面未读取真实退库申请。', 'asset-return-audit-leader-trigger'),
    bound('RT2-LD-003', '7', '申请人信息展示', '展示申请人、时间、部门、电话、邮箱、类型、原因。', 'asset-return-leader-info'),
    bound('RT2-LD-004', '7', '资产字段展示', '单据仅一项主资产并展示配置、状态、用途、部件。', 'asset-return-leader-info'),
    review('RT2-LD-005', '7', '关联耗材展示', '主资产有耗材时展示耗材明细。', '当前 LeaderAssetReturnApprovalPage 的 ASSET_ROWS 没有关联耗材区域。', 'asset-return-audit-leader-trigger'),
    bound('RT2-LD-006', '7', '审批意见规则', '同意可选，驳回必填，最多400字。', 'asset-return-leader-reject'),
    review('RT2-LD-007', '4.4/7', '领导同意真实路由', '同意后按退库MIS配置进入MIS或ES。', '当前 handleDecision 仅 message.success，没有调用 submitAssetReturnLeaderDecision 或更新真实工作流。', 'asset-return-audit-leader-agree'),
    review('RT2-LD-008', '4.7/7', '领导驳回终态', '驳回后已驳回、不生成入库单并释放主资产/耗材锁。', '当前驳回仅toast，不修改退库申请或锁。', 'asset-return-audit-leader-reject'),
    review('RT2-LD-009', '7', '加签真实节点', '加签应生成真实流程节点和待办。', '当前加签只输入字符串并提示“已加签”，不写流程。', 'asset-return-audit-leader-addsign'),
    bound('RT2-LD-010', '7', '返回', '返回待办列表不改变流程状态。', 'asset-return-leader-info'),
    review('RT2-LD-011', '7', '页面绑定真实单据', '领导页应打开当前待办对应的真实退库申请。', '当前 RETURN_ORDER/ASSET_ROWS/APPROVAL_ROWS 全部为静态常量，与 assetReturnService 脱节。', 'asset-return-audit-leader-trigger'),
  ],

  [ASSET_RETURN_SCOPES.mis]: [
    bound('RT2-MI-001', '4.4/8', 'MIS触发', '仅退库MIS鉴定=是进入MIS。', 'asset-return-mis-assets'),
    review('RT2-MI-002', '4.4', 'MIS配置来源', '路由直接使用物料编码“退库MIS鉴定”配置。', '当前 returnMisRequired 由 subCategory 是否在固定数组中推导，不是真实物料配置。', 'asset-return-mis-assets'),
    bound('RT2-MI-003', '8', '申请人信息', '展示申请人、日期、电话、邮箱、部门、退库原因。', 'asset-return-mis-assets'),
    bound('RT2-MI-004', '8', '资产基础信息', '展示标签、SN、说明、配置、状态、数量、大/小类、启用日期、地点、备注。', 'asset-return-mis-assets'),
    review('RT2-MI-005', '8', '关联耗材', 'MIS页展示关联耗材。', '当前退库资产信息Card没有 selected.relatedConsumables 展示。', 'asset-return-audit-mis-result'),
    review('RT2-MI-006', '8', '维修记录', '支持查看资产历史维修记录。', '当前 MIS 页面没有维修记录入口。', 'asset-return-audit-mis-result'),
    review('RT2-MI-007', '8', '附件上传', 'MIS可上传不限格式附件并保留节点信息。', 'assetReturnService有附件API，但当前 MIS 页面没有附件区域。', 'asset-return-audit-mis-result'),
    review('RT2-MI-008', '4.5/8', '独立鉴定结果', '页面可先选择鉴定通过/不通过。', '当前页面通过点击同意/驳回直接反推鉴定结果，没有独立结果控件。', 'asset-return-audit-mis-result'),
    review('RT2-MI-009', '4.5/8', '鉴定说明', '鉴定不通过时说明必填且最多400字。', '当前只有“审批意见”一个输入框，驳回时同时当作鉴定说明和审批意见，字段未独立。', 'asset-return-audit-mis-result'),
    bound('RT2-MI-010', '4.5/8', '同意结果', '同意写鉴定通过并进入ES办理。', 'asset-return-audit-mis-agree', '::button::'),
    review('RT2-MI-011', '4.5/8', '驳回解锁', '鉴定不通过驳回后显式释放主资产/耗材锁。', '状态会改已驳回，但当前锁只是处理中单动态推导，没有显式释放动作。', 'asset-return-audit-mis-reject'),
    review('RT2-MI-012', '8/11', '鉴定人日期留痕', '鉴定人、鉴定日期进入后续入库单详情。', 'service记录MIS person/time，但当前没有真实入库详情对象承接。', 'asset-return-audit-mis-agree'),
    review('RT2-MI-013', '通知', 'MIS通过生成库管员待办，驳回通知申请人。', '当前只有页面success提示，无真实服务号通知或失败补发。', 'asset-return-audit-mis-notification'),
  ],

  [ASSET_RETURN_SCOPES.handling]: [
    bound('RT2-HD-001', '9.1', '申请人信息', '展示申请单号、人员、公司/板块/部门/办公区、电话、类型、原因。', 'asset-return-handling-confirm'),
    bound('RT2-HD-002', '9.2', '资产基础信息', '展示标签、SN、说明、配置、状态、部件、地点、备注和关联耗材。', 'asset-return-confirm-result'),
    review('RT2-HD-003', '9.2', '盘点信息条件展示', '只有开启盘点计划时展示盘点执行人/状态。', '当前页面始终渲染盘点状态和盘点执行人字段。', 'asset-return-audit-handling-inventory'),
    review('RT2-HD-004', '9.3', '默认仓库映射', '按申请人部门+公司+办公区匹配默认仓库。', '当前默认固定“北京总部资产仓”。', 'asset-return-audit-handling-warehouse'),
    review('RT2-HD-005', '9.3', '仓库权限', '只允许当前公司下当前库管员有入库权限的仓库。', 'RETURN_WAREHOUSES 是固定三项列表，没有动态公司/权限过滤。', 'asset-return-audit-handling-warehouse'),
    review('RT2-HD-006', '9.3', '虚拟库管员联动', '仓库改变后带出对应虚拟库管员及虚拟组织。', '责任人固定 SOHU01-库房管理员-SOHU，不随仓库变化。', 'asset-return-audit-handling-warehouse'),
    review('RT2-HD-007', '4.4/9.3', '经过MIS的鉴定结果', '经过MIS时结果/说明自动带出且不可编辑。', '当前退库信息维护Card没有鉴定结果/说明字段。', 'asset-return-audit-handling-appraisal'),
    review('RT2-HD-008', '4.4/9.3', '未经过MIS由ES补鉴定', 'ES填写鉴定结果，默认通过，不通过时说明必填。', '当前 ES 办理页完全没有ES补充鉴定字段。', 'asset-return-audit-handling-appraisal'),
    review('RT2-HD-009', '9.3', '鉴定人/日期', '最终鉴定人和日期写入入库单。', '当前 handling 模型没有最终 appraisal person/date 字段。', 'asset-return-audit-handling-appraisal'),
    review('RT2-HD-010', '9.3', '资产标记真实枚举', '复用系统现有资产标记并限制后续出库。', '当前页面使用“无/限制出库/待维修/待数据清理”演示枚举，未证明与现有配置一致。', 'asset-return-audit-handling-mark'),
    review('RT2-HD-011', '9.3', '退库日期', '必填、默认当前日期且允许编辑。', '当前页面只读展示员工确认日期，不能由ES调整。', 'asset-return-audit-handling-date'),
    bound('RT2-HD-012', '9.3', '使用说明输入', '最多400字并用于台账更新。', 'asset-return-audit-handling-usage'),
    review('RT2-HD-013', '9.3', '维修记录入口', '查看历史维修记录。', '当前页面没有维修记录按钮。', 'asset-return-audit-handling-tools'),
    review('RT2-HD-014', '9.3', '附件区域', 'ES可上传不限格式附件并按节点控制删除权限。', 'service有附件API，但页面没有附件组件。', 'asset-return-audit-handling-tools'),
    review('RT2-HD-015', '9.4/9.5', '查看员工名下资产', '办理页提供员工名下资产查询与总量/借用数概览。', '当前页面没有“查看员工名下资产”入口。', 'asset-return-audit-handling-tools'),
    bound('RT2-HD-016', '4.6/9.4', '发起员工确认', '未发起时可进入员工退库确认。', 'asset-return-audit-handling-confirm', '::button::'),
    bound('RT2-HD-017', '4.6/9.4', '待确认阻断', '员工未确认前禁止完成入库。', 'asset-return-audit-handling-confirm'),
    review('RT2-HD-018', '4.6/9.4', '确认后执行时点', '员工确认后自动入库或由库管员执行需统一口径。', 'PRD内部存在两种描述；当前实现需要库管员再次点击确认后 completeAssetReturn。', 'asset-return-audit-handling-confirm'),
    review('RT2-HD-019', '4.7/9', '21天自动驳回', 'ES确认待办满21天系统自动驳回并解锁。', '当前 service 没有进入节点时间、定时任务或超期处理。', 'asset-return-audit-handling-timeout'),
    review('RT2-HD-020', '4.7/9.4', 'ES驳回真实解锁', '驳回不生成入库单并显式释放主资产/耗材锁。', 'finishAssetReturn会改已驳回，但没有真实锁对象或显式耗材解锁。', 'asset-return-audit-handling-reject'),
    review('RT2-HD-021', '4.8/11', '真实核心入库单', '生成退库入库单并记录源申请单号、制单人、制单时间。', 'completeAssetReturn只生成 RK-* 字符串写回退库申请，没有创建核心入库单对象。', 'asset-return-audit-handling-inbound'),
    review('RT2-HD-022', '4.8', '资产状态台账', '主资产状态更新为在库-待处理。', 'completeAssetReturn没有更新 EMPLOYEE_REPLACEMENT_ASSETS 或其他资产台账。', 'asset-return-audit-handling-inbound'),
    review('RT2-HD-023', '4.8', '仓库地点台账', '仓库及City/Building/Floor更新为ES最终值。', 'handling只保存 warehouse 等申请字段，不更新真实资产台账。', 'asset-return-audit-handling-inbound'),
    review('RT2-HD-024', '4.8', '虚拟责任人组织', '责任人/组织按仓库虚拟库管员规则更新。', '没有资产台账更新，也没有虚拟组织联动。', 'asset-return-audit-handling-inbound'),
    review('RT2-HD-025', '4.8', '用途说明标记', '资产用途、使用说明、资产标记按ES最终值更新。', '当前仅在 handling 内存储使用说明/标记，不写资产台账。', 'asset-return-audit-handling-inbound'),
    review('RT2-HD-026', '4.8', '关联耗材同步入库', '全部升级耗材同步入库并更新耗材台账。', '没有耗材入库单明细或耗材台账更新。', 'asset-return-audit-handling-inbound'),
    review('RT2-HD-027', '4.8', '事务报表与完成状态', '生成事务/报表后单据已完成并结束锁。', '当前 completeAssetReturn 状态写“已处理”而PRD终态为“已完成”，且没有事务/报表更新。', 'asset-return-audit-handling-inbound'),
  ],

  [ASSET_RETURN_SCOPES.confirm]: [
    bound('RT2-CF-001', '10', '申请人', '展示申请人姓名-工号。', 'asset-return-audit-confirm-content'),
    review('RT2-CF-002', '10', '申请单号字段', '确认页显式展示当前退库申请单号。', '当前单号只在页面顶部标题区展示，不在PRD字段区；功能信息存在但结构需确认是否接受。', 'asset-return-audit-confirm-content'),
    bound('RT2-CF-003', '10', '主资产字段', '展示标签号、说明、配置、数量、退库原因、使用说明。', 'asset-return-audit-confirm-content'),
    review('RT2-CF-004', '10', '关联耗材明细', '确认页展示随主资产退库的全部关联耗材。', '当前 rows 只包含 application.asset，没有 selected.relatedConsumables。', 'asset-return-audit-confirm-content'),
    review('RT2-CF-005', '10', '交还确认文案', '明确员工已将资产及附件/相关配件交还库管员。', '当前提示仅“核对以上退库资产信息”，没有明确交还承诺。', 'asset-return-audit-confirm-content'),
    bound('RT2-CF-006', '4.6/10', '刷卡/手工工号校验', '工号必须与申请人工号一致。', 'asset-return-audit-confirm-identity'),
    review('RT2-CF-007', '4.6/10', '狐小e真实扫码身份', '取得真实扫码账号并与申请人一致。', '点击“模拟扫码确认”直接传 application.applicant.id，无法验证实际扫码人。', 'asset-return-audit-confirm-identity'),
    bound('RT2-CF-008', '4.6/10', '一次确认', '每张退库单只确认一次。', 'asset-return-audit-confirm-record'),
    bound('RT2-CF-009', '4.6/10', '确认记录', '记录确认方式、确认工号、确认时间和结果。', 'asset-return-audit-confirm-record'),
    review('RT2-CF-010', '4.6', '确认后入库时点', '自动执行入库或由库管员执行需保持唯一口径。', 'PRD内部冲突；当前实现采用“回到ES办理再点确认执行入库”。', 'asset-return-audit-confirm-inbound-timing'),
    skip('RT2-CF-011', '4.6/10', 'Pad签字', '下线Pad手写签字和签名图片保存。', '明确下线能力，无需恢复。'),
  ],

  [ASSET_RETURN_AUDIT_SCOPES.inbound]: [
    bound('RT2-IN-001', '11', '入库列表', '核心库存管理已存在入库页。', 'asset-return-audit-inbound-list'),
    bound('RT2-IN-002', '11', '退库入库类型', '列表存在退库入库单并展示来源申请单号。', 'asset-return-audit-inbound-list'),
    bound('RT2-IN-003', '11', '列表基础字段', '展示入库单号、来源申请号、状态、仓库、制单日期/人、数量。', 'asset-return-audit-inbound-list'),
    review('RT2-IN-004', '11', '真实退库入库创建', '退库完成后动态创建核心入库单。', '当前 INBOUND_ROWS 是静态mock，assetReturnService 未向库存入库数据写入新记录。', 'asset-return-audit-inbound-list'),
    review('RT2-IN-005', '11', '退库入库详情', '详情展示资产/耗材、鉴定、员工确认、备注/说明/标记等完整字段。', '当前入库页只有列表，没有退库入库详情页面/弹窗。', 'asset-return-audit-inbound-detail'),
    review('RT2-IN-006', '11', '鉴定与确认记录', '入库详情保留鉴定人/日期、确认方式/工号/时间。', '当前入库数据模型没有这些字段。', 'asset-return-audit-inbound-detail'),
    review('RT2-IN-007', '11', '真实套打', '沿用现有入库单模板查看/打印。', '当前批量打印按钮只 message.success 提示“操作已记录（原型）”。', 'asset-return-audit-inbound-print'),
    review('RT2-IN-008', '11', '来源申请追溯', '来源申请单号可追溯到具体退库申请及完整审批记录。', '列表虽有 applicationNo，但没有点击/详情关联或真实退库service数据。', 'asset-return-audit-inbound-detail'),
  ],
};

const STATUS_OVERRIDES = new Map([
  ['RT-AP-003', { status: 'review', reason: '弹窗基础过滤已实现，但 getAssetReturnEligibility 没有盘点未盘判断，也没有可验证的“我的资产退库权限”数据源。' }],
  ['RT-AP-004', { status: 'review', reason: '按主资产拆单已实现，但主资产/耗材没有真实持久化业务锁，且提交缺盘点重校验。' }],
  ['RT-LD-002', { status: 'review', reason: '当前领导页同意只显示toast，没有调用真实退库service推进MIS/ES节点。' }],
  ['RT-LD-003', { status: 'review', reason: '当前领导页驳回只显示toast，没有更新单据终态或显式解锁。' }],
  ['RT-MI-001', { status: 'review', reason: 'MIS路由当前由固定资产小类数组模拟物料配置，且页面没有独立鉴定结果控件，不能整体判定bound。' }],
  ['RT-MI-004', { status: 'review', reason: '驳回会改终态，但当前资产锁是处理中单动态推导，没有主资产/耗材显式锁释放。' }],
  ['RT-HD-001', { status: 'review', reason: '仓库字段存在，但固定列表未实现组织映射和当前库管员动态入库权限。' }],
  ['RT-HD-004', { status: 'review', reason: '员工确认阶段存在，但最终仅生成RK字符串并写退库申请，不是真实核心入库/台账闭环，且PRD入库时点口径冲突。' }],
  ['RT-HD-005', { status: 'review', reason: 'ES驳回能改单据状态，但没有真实资产/耗材锁对象的显式释放。' }],
  ['RT-CF-001', { status: 'review', reason: '刷卡/手工工号能校验，但狐小e直接用申请人工号模拟成功，不能整体判定三种方式都真实校验。' }],
  ['RT-CF-002', { status: 'review', reason: '确认后当前并不会自动完成真实核心入库、台账和事务更新；仍需库管员再次操作且service只写演示单号。' }],
]);

function cloneMap(map = {}) {
  return Object.fromEntries(Object.entries(map).map(([pageScope, values]) => [pageScope, [...(values || [])]]));
}

export function applyAssetReturnAnnotationAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(annotations).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export function applyAssetReturnCoverageAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(next).forEach(([pageScope, values]) => {
    next[pageScope] = values.map((item) => {
      const override = STATUS_OVERRIDES.get(item.id);
      return override ? { ...item, ...override } : item;
    });
  });
  Object.entries(coverage).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export const assetReturnAuditAnnotationsByScope = annotations;
export const assetReturnAuditCoverageByScope = coverage;
