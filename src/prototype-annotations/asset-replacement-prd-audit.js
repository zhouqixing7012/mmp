// 资产更换第二轮 PRD 深审补充。
// 第一轮已有申请/MIS/办理/确认四个页面的基础标注；本层重点拆细真实入出库、锁、台账、通知与阶段状态。

import { ASSET_REPLACEMENT_SCOPES } from './employee-self-service-expanded-annotations';

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

export const ASSET_REPLACEMENT_AUDIT_SCOPES = ASSET_REPLACEMENT_SCOPES;

const annotations = {
  [ASSET_REPLACEMENT_SCOPES.apply]: [
    note({
      id: 'replacement-audit-apply-eligibility',
      pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'card', '退回资产信息'),
      title: '可更换范围由人员、物料配置、台账和权限共同决定',
      priority: 'P0',
      rules: [
        '仅正式员工、实习生可申请；外包员工不展示入口。',
        '物料必须在可更换资产配置中启用且允许更换；资产责任人为本人、状态为“在用-使用中”。',
        '资产还必须处于申请人当前公司/板块及跨公司板块领用权限范围内，且未被其他业务锁定。',
        '苹果笔记本、苹果一体机、组装机、工作站始终不得发起更换。',
      ],
    }),
    note({
      id: 'replacement-audit-apply-submit-lock',
      pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交需重校验盘点与业务锁，并真正锁定旧资产',
      priority: 'P0',
      rules: [
        '提交时重新校验资产责任人、状态、权限、可更换配置和业务锁，不能只依赖进入页面时的快照。',
        '旧资产处于开启中的盘点计划且未盘时不得提交。',
        '提交成功后旧资产必须建立持久化业务锁；MIS驳回或旧资产入库完成时按规则解除。',
      ],
    }),
    note({
      id: 'replacement-audit-apply-split-record',
      pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '批量更换按旧资产逐张拆单并保留完整关联号',
      rules: [
        '批量提交时一个旧资产生成一张独立更换申请单，每张单独进入工作流。',
        '单据需持续记录源旧资产标签号、入库单号、待发放新资产标签号、出库单号和完整审批记录。',
      ],
    }),
    note({
      id: 'replacement-audit-apply-mis-routing',
      pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交后按办公区生成MIS待办',
      priority: 'P0',
      rules: [
        '提交成功后状态进入处理中、当前节点为MIS鉴定。',
        'MIS人员按申请人办公区匹配；当地无MIS时统一推送北京MIS。',
      ],
    }),
    note({
      id: 'replacement-audit-apply-notification',
      pageKey: ASSET_REPLACEMENT_SCOPES.apply,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.apply, 'button', '提交'),
      kind: 'action-rule',
      title: '提交成功需发送申请人与MIS通知',
      rules: [
        '向申请人通知申请已提交、申请单号及前往MIS鉴定要求。',
        '向匹配到的MIS发送待办通知，包含申请人、旧资产、办公区和申请单链接。',
      ],
    }),
  ],

  [ASSET_REPLACEMENT_SCOPES.mis]: [
    note({
      id: 'replacement-audit-mis-result',
      pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.mis, 'card', 'MIS鉴定处理'),
      title: 'MIS必须独立维护鉴定结果',
      priority: 'P0',
      rules: [
        '页面必须存在独立“鉴定结果”字段，PRD页面字段定义为资产维修、资产更换。',
        '全局规则同时出现“员工取消”作为驳回结果，与页面字段枚举存在内部口径冲突，需统一最终枚举。',
      ],
    }),
    note({
      id: 'replacement-audit-mis-description-required',
      pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: cardTarget('MIS鉴定处理', 'detail-field', '鉴定说明'),
      kind: 'field-rule',
      title: '鉴定说明为必填固定枚举',
      rules: ['鉴定说明必填；枚举为无、主板故障、键盘故障、屏幕故障、硬盘故障，不应只在同意时校验。'],
    }),
    note({
      id: 'replacement-audit-mis-agree-combination',
      pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.mis, 'button', '同意'),
      kind: 'action-rule',
      title: '只有“资产更换”结果允许同意',
      priority: 'P0',
      rules: [
        'MIS点击同意时鉴定结果必须为“资产更换”，不允许结果为空或为维修/取消。',
        '通过后根据员工信息匹配默认仓库和对应库管员，进入旧资产退回办理。',
      ],
    }),
    note({
      id: 'replacement-audit-mis-reject-combination',
      pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.mis, 'button', '驳回'),
      kind: 'action-rule',
      title: '维修/取消结果才允许驳回并解除旧资产锁',
      priority: 'P0',
      rules: [
        '驳回时审批意见必填，鉴定结果必须满足最终确定的维修/员工取消口径。',
        '驳回后单据已驳回、流程结束，并真正解除旧资产业务锁。',
      ],
    }),
    note({
      id: 'replacement-audit-mis-post-actions',
      pageKey: ASSET_REPLACEMENT_SCOPES.mis,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.mis, 'card', '审批信息'),
      title: 'MIS提交后需写维修历史并发送结果通知',
      rules: [
        '鉴定结果为资产维修或资产更换时，将鉴定结果和说明写入旧资产维修历史。',
        'MIS同意时通知申请人与对应库管员；MIS驳回时通知申请人鉴定结果、驳回原因和流程结束。',
      ],
    }),
  ],

  [ASSET_REPLACEMENT_SCOPES.handling]: [
    note({
      id: 'replacement-audit-handling-employee-assets',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.handling, 'card', '申请人信息'),
      title: '办理页应支持查看申请人名下资产',
      rules: ['申请人旁应提供“查看名下资产”入口，仅用于辅助ES判断，展示总资产数、借用数及多条件筛选明细。'],
    }),
    note({
      id: 'replacement-audit-return-warehouse',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'detail-field', '仓库'),
      kind: 'field-rule',
      title: '退回仓库按人员映射且受库管员入库权限限制',
      priority: 'P0',
      rules: [
        '默认仓库根据申请人HR公司+一级部门+办公区映射。',
        '仅允许选择当前库管员有入库权限的仓库，库管员字段随仓库真实权限关系带出。',
      ],
    }),
    note({
      id: 'replacement-audit-return-asset-mark',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'detail-field', '资产标记'),
      kind: 'field-rule',
      title: '旧资产标记必填且使用更换专用枚举',
      rules: ['资产标记必填；枚举为硬件老化、组件缺失、设备故障、物理损伤。'],
    }),
    note({
      id: 'replacement-audit-return-usage',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'detail-field', '使用说明'),
      kind: 'field-rule',
      title: '旧资产使用说明必填并在入库后回写台账',
      rules: ['退旧阶段使用说明为必填单行文本；员工确认并完成入库后写回旧资产台账。'],
    }),
    note({
      id: 'replacement-audit-return-inventory',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'detail-field', '盘点状态'),
      kind: 'field-rule',
      title: '旧资产盘点信息仅在开启盘点计划时展示',
      rules: ['只有旧资产处于开启中的盘点计划时才展示实际盘点人和盘点状态，盘点状态需用红色文字突出。'],
      availability: 'dynamic',
    }),
    note({
      id: 'replacement-audit-return-inbound',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('更换物资信息', 'button', '退库确认'),
      kind: 'action-rule',
      title: '旧资产确认后必须执行真实入库闭环',
      priority: 'P0',
      rules: [
        '员工第一次确认成功后，库管员才允许执行入库。',
        '入库需生成核心入库单，记录源更换申请单号，并更新旧资产仓库、状态、资产标记、使用说明等台账字段。',
        '同步生成资产操作历史/事务记录；旧资产关联升级耗材需随主资产同步更新耗材台账。',
        '旧资产入库完成后解除旧资产业务锁，并记录入库单号和完成时间。',
      ],
    }),
    note({
      id: 'replacement-audit-issue-stage-gate',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '资产标签号'),
      kind: 'field-rule',
      title: '旧资产入库完成后才允许选择并办理新资产',
      priority: 'P0',
      rules: ['旧资产入库完成前，不应开放待发放资产选择，也不得进入新资产领取确认。'],
    }),
    note({
      id: 'replacement-audit-issue-warehouse',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '仓库'),
      kind: 'field-rule',
      title: '发放仓库按人员映射且受出库权限和公司板块规则限制',
      rules: [
        '默认仓库根据申请人HR公司+一级部门+办公区映射。',
        '仅展示当前库管员有出库权限且满足申请人公司/板块及跨公司领用资产规则的仓库。',
      ],
    }),
    note({
      id: 'replacement-audit-new-asset-range',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '资产标签号'),
      kind: 'field-rule',
      title: '待发放资产需同时满足小类、权限、状态、标记和锁定条件',
      priority: 'P0',
      rules: [
        '全局规则要求新旧资产小类一致；PRD 10.2 又写“PC和NB可互选”，两处存在内部冲突，需确定最终规则。',
        '新资产必须属于当前仓库，满足申请人公司/板块及跨公司领用权限。',
        '资产状态和资产标记需满足资产领用可出库规则，且不得被其他单据锁定。',
      ],
    }),
    note({
      id: 'replacement-audit-new-asset-lock',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '资产标签号'),
      kind: 'field-rule',
      title: '选择新资产需持久化锁定并支持原子换锁',
      rules: [
        '点击确定时再次校验状态和锁定情况，校验通过后立即建立新资产业务锁。',
        '重新选择时先保证新资产可锁，再原子释放原资产并锁定新资产；保存失败不得丢失原锁。',
      ],
    }),
    note({
      id: 'replacement-audit-new-asset-modal',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '资产标签号'),
      kind: 'field-rule',
      title: '待发放资产弹窗字段和查询条件需完整',
      rules: [
        '查询条件包含资产标签号、SN号、资产说明、板块，并按最终公司/板块联动规则过滤。',
        '结果需展示资产责任人等PRD规定字段，不能因原型列表省略而丢失研发字段。',
      ],
    }),
    note({
      id: 'replacement-audit-issue-purpose-usage',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '资产用途'),
      kind: 'field-rule',
      title: '资产用途和使用说明按领用规则回写新资产台账',
      rules: [
        '资产用途使用最终资产领用枚举；PRD写“部门用机”，当前系统其他页面常用“部门公用”，需统一枚举口径。',
        '使用说明按PRD为多行文本，出库后回写新资产台账，不应只停留在更换申请记录。',
      ],
    }),
    note({
      id: 'replacement-audit-issue-inventory',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'detail-field', '盘点状态'),
      kind: 'field-rule',
      title: '新资产盘点信息仅在开启盘点计划时展示',
      rules: ['只有新资产处于开启中的盘点计划时才展示实际盘点人和盘点状态，盘点状态需用红色文字突出。'],
      availability: 'dynamic',
    }),
    note({
      id: 'replacement-audit-issue-outbound',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('待发放资产信息', 'button', '领用确认'),
      kind: 'action-rule',
      title: '第二次确认后必须执行真实出库闭环',
      priority: 'P0',
      rules: [
        '员工第二次确认完成后才允许执行出库。',
        '出库需生成核心出库单并记录源更换申请，更新新资产责任人、部门、成本中心、地点、状态、用途和使用说明。',
        '同步生成资产操作历史/事务记录；升级耗材随主资产同步出库并更新耗材台账。',
        '出库完成后解除新资产业务锁，写回出库单号和完成时间，单据状态已完成。',
      ],
    }),
    note({
      id: 'replacement-audit-handling-reject',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('审批信息', 'button', '驳回'),
      kind: 'action-rule',
      title: '驳回必须按已完成阶段保留结果并释放对应资产锁',
      priority: 'P0',
      rules: [
        '旧资产未入库时驳回：按最终状态口径结束流程并解除旧资产锁。',
        '旧资产已入库、新资产未出库时驳回：保留旧资产退库结果，解除新资产锁，不生成出库单，单据已完成。',
        'PRD同时存在“办理前放弃领用=已完成”和“旧资产未入库驳回=已驳回”两种口径，需统一。',
        'PRD还定义“旧资产未入库但新资产已出库”分支，但4.6要求旧资产入库前不得进入新资产确认，该分支逻辑上不可达，需确认是否删除。',
      ],
    }),
    note({
      id: 'replacement-audit-handling-addsign',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: cardTarget('审批信息', 'button', '加签'),
      kind: 'action-rule',
      title: '加签人员必须有当前仓库出库权限并进入真实工作流',
      rules: ['加签只能选择当前仓库有出库权限的员工，确认后应真正增加流程节点、处理人和审批记录。'],
    }),
    note({
      id: 'replacement-audit-handling-notifications',
      pageKey: ASSET_REPLACEMENT_SCOPES.handling,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.handling, 'card', '审批信息'),
      title: '库管员待办、正常完成和更换驳回均需发送服务号通知',
      rules: [
        'MIS同意后需向对应库管员发送办理待办，包含员工、旧资产、默认仓库和办理链接。',
        '正常完成后通知申请人和库管员旧资产已入库、新资产已出库。',
        '更换被驳回/放弃后通知申请人流程结束及驳回原因。',
      ],
    }),
  ],

  [ASSET_REPLACEMENT_SCOPES.confirm]: [
    note({
      id: 'replacement-audit-confirm-scenes',
      pageKey: ASSET_REPLACEMENT_SCOPES.confirm,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.confirm, 'card', '确认提示及保管职责'),
      title: '退旧和领新必须使用两次独立员工确认',
      priority: 'P0',
      rules: [
        '第一次确认旧资产及相关配件已交还ES，成功后仅允许库管员执行入库。',
        '第二次确认已领取新资产及相关配件并确认资产保管职责，成功后仅允许库管员执行出库。',
      ],
    }),
    note({
      id: 'replacement-audit-confirm-copy',
      pageKey: ASSET_REPLACEMENT_SCOPES.confirm,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.confirm, 'card', '确认提示及保管职责'),
      title: '两种场景的确认文案必须表达真实责任',
      rules: [
        '旧资产退回文案需明确“我确认已将上述旧资产及相关配件交还ES”。',
        '新资产领取文案需明确员工已阅读并确认资产保管职责、已领取新资产及相关配件。',
      ],
    }),
    note({
      id: 'replacement-audit-confirm-identity',
      pageKey: ASSET_REPLACEMENT_SCOPES.confirm,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.confirm, 'card', '刷卡/扫码确认'),
      title: '刷卡和狐小e扫码都必须校验真实确认人',
      priority: 'P0',
      rules: [
        '刷卡需读取实际员工卡身份并与申请人工号一致。',
        '狐小e扫码需取得实际扫码账号并校验与申请人一致，不能用申请人工号直接模拟成功。',
        'PRD字段说明允许管理员手动输入工号，但确认方式章节只定义扫码/刷卡，手工输入最终如何记录确认方式需统一口径。',
      ],
    }),
    note({
      id: 'replacement-audit-confirm-record',
      pageKey: ASSET_REPLACEMENT_SCOPES.confirm,
      target: scopeTarget(ASSET_REPLACEMENT_SCOPES.confirm, 'button', '确认'),
      kind: 'action-rule',
      title: '确认成功需记录确认人、方式和时间并回传办理页',
      rules: ['身份校验成功后记录确认人员、确认方式和确认时间，并将结果返回对应旧资产入库或新资产出库阶段。'],
    }),
  ],
};

const coverage = {
  [ASSET_REPLACEMENT_SCOPES.apply]: [
    review('AR2-AP-001', '2/4.2', '申请人角色', '仅正式员工、实习生可发起，外包不展示入口。', '当前 eligibility 只显式排除外包，未按正式员工/实习生白名单校验。', 'replacement-audit-apply-eligibility'),
    review('AR2-AP-002', '1.2/4.2', '可更换资产后台配置', '物料需在可更换资产配置中启用且允许更换。', '当前原型使用 mock 字段 replaceEnabled，没有可验证的后台配置数据源及启停链路。', 'replacement-audit-apply-eligibility'),
    review('AR2-AP-003', '4.2', '责任人/状态重校验', '责任人为当前员工且状态为在用-使用中。', '当前资产数据来自员工名下 mock 列表，但 getReplacementEligibility 未再次校验 responsiblePerson 是否等于当前员工。', 'replacement-audit-apply-submit-lock'),
    review('AR2-AP-004', '4.2', '公司板块权限', '资产需在当前公司/板块及跨公司板块领用权限范围。', '当前 eligibility 没有公司/板块及跨公司领用权限判断。', 'replacement-audit-apply-eligibility'),
    bound('AR2-AP-005', '4.2', '禁用小类', '苹果笔记本、苹果一体机、组装机、工作站始终不允许更换。', 'replacement-audit-apply-eligibility'),
    bound('AR2-AP-006', '4.1/6.2', '批量拆单', '一个旧资产生成一张独立更换单。', 'replacement-audit-apply-split-record', '::button::'),
    review('AR2-AP-007', '4.1', '单据关联号', '持续记录旧标签号、入库单号、新标签号、出库单号和完整审批记录。', '申请模型能记录这些字段的一部分，但真实入/出库业务单及完整关联仍未实现。', 'replacement-audit-apply-split-record'),
    bound('AR2-AP-008', '6.1', '退回资产字段', '申请页展示标签号、资产说明、配置、数量、状态、用途、部件和耗材信息。', 'replacement-apply-assets'),
    review('AR2-AP-009', '6.2', '盘点校验', '开启盘点计划且未盘的旧资产不得提交。', 'createAssetReplacementApplications/getReplacementEligibility 没有盘点计划或未盘校验。', 'replacement-audit-apply-submit-lock'),
    review('AR2-AP-010', '4.4/6.2', '旧资产业务锁', '提交成功建立持久化锁，MIS驳回或入库完成按规则解锁。', '当前 businessLocked 由“是否存在处理中更换单”动态推导，不是资产级持久化锁。', 'replacement-audit-apply-submit-lock'),
    review('AR2-AP-011', '8', 'MIS处理人匹配', '按办公区匹配MIS，无本地MIS时统一北京MIS。', '提交 service 只把 currentNode 设为 MIS鉴定，没有处理人匹配或北京兜底。', 'replacement-audit-apply-mis-routing'),
    review('AR2-AP-012', '12', '申请提交通知', '通知申请人申请单号和前往MIS鉴定要求。', '当前提交只有页面 success message，没有服务号通知记录。', 'replacement-audit-apply-notification'),
    review('AR2-AP-013', '12', 'MIS待办通知', '向MIS发送申请人、旧资产、办公区和单据链接。', '当前没有真实MIS待办通知或失败重试记录。', 'replacement-audit-apply-notification'),
    skip('AR2-AP-014', '5', '我的资产更换申请列表', 'PRD列出员工查询列表/详情。', '现行产品口径已下线该独立列表，不作为当前工作台正式页面补建。'),
    skip('AR2-AP-015', '5', 'MIS/办理待办列表', 'PRD页面清单包含独立待办列表。', '现行产品口径已下线独立待办列表，直接保留工作台审批/办理页面。'),
  ],

  [ASSET_REPLACEMENT_SCOPES.mis]: [
    review('AR2-MI-001', '8', 'MIS处理人', '按申请人办公区匹配MIS，无本地MIS推北京MIS。', '当前MIS页面直接固定人员 CW003379-李木勇，没有办公区路由。', 'replacement-audit-apply-mis-routing'),
    review('AR2-MI-002', '8.1', '鉴定结果', '页面必须有独立鉴定结果。', '当前 ReplacementMisPage 没有鉴定结果控件，submitMisDecision 传 result 为空。', 'replacement-audit-mis-result'),
    review('AR2-MI-003', '4.5/8.1', '鉴定结果枚举', '全局规则出现员工取消，页面字段只列资产维修/资产更换。', 'PRD内部枚举冲突，需要先确定最终业务口径。', 'replacement-audit-mis-result'),
    review('AR2-MI-004', '8.1', '鉴定说明必填', '鉴定说明固定枚举且必填。', '当前只在点击同意时要求 description，驳回可在未选择鉴定说明时提交。', 'replacement-audit-mis-description-required'),
    bound('AR2-MI-005', '8.1', '审批意见', '同意默认同意，驳回意见必填。', 'replacement-mis-reject'),
    review('AR2-MI-006', '4.5/8.2', '同意组合', '只有资产更换允许同意。', '当前没有 result 字段，任何已选鉴定说明都可以点同意。', 'replacement-audit-mis-agree-combination'),
    review('AR2-MI-007', '4.5/8.2', '驳回组合', '维修/取消结果才允许驳回。', '当前驳回只校验审批意见，没有鉴定结果组合校验。', 'replacement-audit-mis-reject-combination'),
    review('AR2-MI-008', '4.4/8.2', 'MIS驳回解锁', 'MIS驳回后真实解除旧资产锁。', '当前旧资产锁为处理中单动态推导，状态改已驳回后自然消失，不是显式资产锁释放。', 'replacement-audit-mis-reject-combination'),
    review('AR2-MI-009', '8.3', '维修历史', '资产维修/资产更换结果和说明写入旧资产维修历史。', 'assetReplacementService 未维护资产维修历史。', 'replacement-audit-mis-post-actions'),
    review('AR2-MI-010', '8.2/12', '库管员待办', 'MIS同意后匹配默认仓库/库管员并生成待办。', '当前只把 currentNode 改为旧资产退回，未按人员和仓库权限生成处理人。', 'replacement-audit-mis-agree-combination'),
    review('AR2-MI-011', '8.3/12', 'MIS结果通知', '同意通知申请人+库管员，驳回通知申请人。', '当前只有页面 message，没有服务号通知、状态或失败补发。', 'replacement-audit-mis-post-actions'),
  ],

  [ASSET_REPLACEMENT_SCOPES.handling]: [
    bound('AR2-HD-001', '9.2', '申请人信息', '展示申请人、日期、公司、办公区、电话、邮箱、部门和更换原因。', 'replacement-audit-handling-employee-assets'),
    review('AR2-HD-002', '9.3', '查看名下资产', '申请人旁提供名下资产查询弹窗。', '当前资产更换办理页没有“查看名下资产”按钮及弹窗。', 'replacement-audit-handling-employee-assets'),
    review('AR2-HD-003', '9.4', '退回仓库默认值', '按HR公司+一级部门+办公区映射默认仓库。', '当前直接取申请单仓库或北京总部仓，没有组织/办公区映射。', 'replacement-audit-return-warehouse'),
    review('AR2-HD-004', '9.4', '退回仓库权限', '仅当前库管员有入库权限的仓库。', '当前 WAREHOUSE_OPTIONS 为固定两个仓库。', 'replacement-audit-return-warehouse'),
    review('AR2-HD-005', '9.4', '库管员', '编号-名称根据所选仓库及真实权限关系带出。', '当前使用静态 WAREHOUSE_MANAGER_MAP。', 'replacement-audit-return-warehouse'),
    bound('AR2-HD-006', '9.4', '鉴定说明', 'MIS选择的鉴定说明带入办理页只读展示。', 'replacement-handling-return'),
    review('AR2-HD-007', '9.4', '资产标记必填', '旧资产标记为必填。', '当前 Select allowClear，发起确认和执行入库均未校验资产标记。', 'replacement-audit-return-asset-mark'),
    review('AR2-HD-008', '9.4', '资产标记枚举', '硬件老化/组件缺失/设备故障/物理损伤。', '当前枚举为无/限制出库/待维修/待数据清理。', 'replacement-audit-return-asset-mark'),
    bound('AR2-HD-009', '9.4', '退库日期', '由员工退还确认日期自动生成。', 'replacement-handling-return'),
    review('AR2-HD-010', '9.4', '旧资产使用说明', '必填并在入库后更新资产台账。', '当前输入框允许为空，执行入库未回写真实资产台账。', 'replacement-audit-return-usage'),
    review('AR2-HD-011', '4.8/9.4', '旧资产盘点展示条件', '仅开启中的盘点计划展示盘点人/状态。', 'ReplacementHandlingPage 会给旧资产强行补演示盘点人和已盘状态，无法反映真实展示条件。', 'replacement-audit-return-inventory'),
    review('AR2-HD-012', '4.8', '旧资产盘点状态样式', '盘点状态用红色文字突出。', '当前使用通用 StatusTag，且数据本身为强制演示值。', 'replacement-audit-return-inventory'),
    bound('AR2-HD-013', '4.8/9.4', '旧资产耗材展示', '有升级耗材时展示耗材信息。', 'replacement-handling-return'),
    bound('AR2-HD-014', '4.6/9.6', '旧资产确认顺序', '员工第一次确认完成后才允许执行入库。', 'replacement-audit-return-inbound', '::button::'),
    review('AR2-HD-015', '4.6/9.6', '真实入库单', '旧资产确认后生成核心入库单并关联源更换单。', 'executeReplacementInbound 仅生成 RK-* 字符串写回更换申请，没有核心入库单对象。', 'replacement-audit-return-inbound'),
    review('AR2-HD-016', '1.2/4.8', '旧资产台账更新', '入库后按退库规则更新仓库、状态、标记、使用说明等字段。', '当前 service 只更新 returnProcess，不修改真实旧资产台账。', 'replacement-audit-return-inbound'),
    review('AR2-HD-017', '1.2', '旧资产事务记录', '生成资产操作历史、事务和报表记录。', '当前只有申请 history 的“执行入库”文本记录。', 'replacement-audit-return-inbound'),
    review('AR2-HD-018', '4.8', '旧资产升级耗材同步', '升级耗材随主资产入库并更新耗材台账。', '当前没有耗材台账写操作。', 'replacement-audit-return-inbound'),
    review('AR2-HD-019', '4.4', '旧资产解锁', '旧资产入库完成解除业务锁。', '当前没有资产级持久化锁对象及显式解锁。', 'replacement-audit-return-inbound'),
    review('AR2-HD-020', '9.5', '新资产仓库默认值', '按HR公司+一级部门+办公区映射默认仓库。', '当前直接使用申请单/旧资产仓库或北京总部仓。', 'replacement-audit-issue-warehouse'),
    review('AR2-HD-021', '9.5', '新资产仓库权限', '仅当前库管员有出库权限且满足公司板块规则的仓库。', '当前 WAREHOUSE_OPTIONS 为固定仓库列表。', 'replacement-audit-issue-warehouse'),
    review('AR2-HD-022', '9.6', '选择资产展示时机', '只有旧资产已入库时才开放选择新资产。', '当前资产标签号搜索按钮始终可点击，只在领用确认时阻止未入库场景。', 'replacement-audit-issue-stage-gate'),
    review('AR2-HD-023', '4.3/10.2', '新旧小类规则', '全局要求同小类，10.2又写PC/NB可互选。', 'PRD内部冲突；当前实现严格 subCategory 相等，需要产品统一口径。', 'replacement-audit-new-asset-range'),
    review('AR2-HD-024', '4.3/10.2', '新资产公司板块权限', '满足申请人公司/板块及跨公司领用权限。', 'getAvailableReplacementAssets 仅校验小类、仓库、状态和 locked。', 'replacement-audit-new-asset-range'),
    bound('AR2-HD-025', '10.2', '新资产在库状态', '仅资产领用可出库状态。', 'replacement-audit-new-asset-range'),
    review('AR2-HD-026', '10.2', '新资产资产标记', '资产标记需满足领用可出库规则。', '可选资产 mock/service 没有 assetMark 过滤。', 'replacement-audit-new-asset-range'),
    review('AR2-HD-027', '10.2', '新资产锁定', '候选不得被其他单据锁定且确定后建立业务锁。', 'service 会过滤 locked/处理中已选标签，但选择后只是页面 state/newAsset 字段，没有资产级持久化锁。', 'replacement-audit-new-asset-lock'),
    review('AR2-HD-028', '10.4', '重新选择原子换锁', '释放旧锁与新锁建立需原子执行，失败保留原锁。', '当前 setNewAsset 直接替换页面对象，不存在真实锁事务。', 'replacement-audit-new-asset-lock'),
    review('AR2-HD-029', '10.1', '弹窗公司板块联动', '板块需按公司联动查询。', '当前弹窗没有公司查询条件，板块直接从候选数据生成。', 'replacement-audit-new-asset-modal'),
    review('AR2-HD-030', '10.3', '资产责任人字段', '结果列表展示资产责任人。', 'ReplacementAssetSelectModal 当前未展示资产责任人列。', 'replacement-audit-new-asset-modal'),
    bound('AR2-HD-031', '9.5', 'City/Building/Floor', 'City改变清空Building/Floor并按层级联动。', 'replacement-handling-location'),
    review('AR2-HD-032', '9.5', '资产用途枚举', '沿用最终资产领用枚举。', 'PRD写“部门用机”，当前代码枚举为“部门公用”；需统一口径。', 'replacement-audit-issue-purpose-usage'),
    review('AR2-HD-033', '9.5', '新资产使用说明', '多行文本并在出库后回写台账。', '当前为单行 Input maxLength=200，且出库 service 不更新真实资产台账。', 'replacement-audit-issue-purpose-usage'),
    review('AR2-HD-034', '4.8/9.5', '新资产盘点展示条件', '仅开启中的盘点计划展示盘点人/状态。', 'ReplacementHandlingPage 会给候选新资产强行补演示盘点人和状态。', 'replacement-audit-issue-inventory'),
    review('AR2-HD-035', '4.8', '新资产盘点状态样式', '盘点状态红色突出。', '当前使用通用 StatusTag，并且盘点数据可能是演示注入。', 'replacement-audit-issue-inventory'),
    bound('AR2-HD-036', '4.8/9.5', '新资产耗材展示', '存在升级耗材时展示。', 'replacement-handling-new-asset'),
    bound('AR2-HD-037', '4.6/9.6', '领用确认顺序', '旧资产入库且选择新资产后才能进入第二次确认。', 'replacement-handling-issue', '::button::'),
    review('AR2-HD-038', '4.6/9.6', '真实出库单', '第二次确认后生成核心出库单并关联源更换单。', 'executeReplacementOutbound 仅生成 CK-* 字符串写回更换申请。', 'replacement-audit-issue-outbound'),
    review('AR2-HD-039', '1.2/4.8', '新资产台账更新', '出库后更新责任人、部门、成本中心、地点、状态、用途、使用说明。', '当前 service 仅更新 issueProcess/newAsset 快照，没有真实资产台账写入。', 'replacement-audit-issue-outbound'),
    review('AR2-HD-040', '1.2', '新资产事务记录', '生成资产操作历史、事务和报表记录。', '当前只有更换申请 history 文本。', 'replacement-audit-issue-outbound'),
    review('AR2-HD-041', '4.8', '新资产升级耗材同步', '升级耗材随主资产出库并更新耗材台账。', '当前没有耗材台账写操作。', 'replacement-audit-issue-outbound'),
    review('AR2-HD-042', '4.4', '新资产出库解锁', '正常出库后解除新资产业务锁。', '当前没有资产级业务锁或显式解锁。', 'replacement-audit-issue-outbound'),
    review('AR2-HD-043', '4.7/9.6', '办理前结束状态', '办理前放弃/驳回最终状态需统一。', 'PRD 4.7写“库管员办理前放弃领用=已完成”，9.6写“旧资产未入库驳回=已驳回”，内部冲突。', 'replacement-audit-handling-reject'),
    bound('AR2-HD-044', '9.6', '退旧后发新驳回', '旧资产已入库、新资产未出库时保留退库结果并以已完成结束。', 'replacement-audit-handling-reject', '::button::'),
    review('AR2-HD-045', '9.6/4.6', '旧未入库新已出库分支', 'PRD定义保留新资产出库结果的驳回分支。', '4.6同时规定旧资产入库前不得进入新资产确认，导致该分支按正常流程不可达。', 'replacement-audit-handling-reject'),
    review('AR2-HD-046', '9.6', '驳回资产解锁', '按阶段释放旧资产或新资产真实业务锁。', 'endReplacementApplication 仅清 newAsset/改状态，没有资产级锁操作。', 'replacement-audit-handling-reject'),
    review('AR2-HD-047', '9.6', '加签权限', '仅可加签当前仓库有出库权限的员工。', '当前加签只输入任意姓名/工号并 toast，不校验仓库权限，也不写工作流。', 'replacement-audit-handling-addsign'),
    review('AR2-HD-048', '12', '库管员待办通知', '通知对应库管员员工、旧资产、默认仓库和办理链接。', '当前无真实服务号通知。', 'replacement-audit-handling-notifications'),
    review('AR2-HD-049', '12', '正常完成通知', '正常完成通知申请人和库管员旧资产已入库、新资产已出库。', '当前只有页面成功提示。', 'replacement-audit-handling-notifications'),
    review('AR2-HD-050', '12', '更换结束通知', '驳回/放弃通知申请人流程结束和原因。', '当前只有页面成功提示。', 'replacement-audit-handling-notifications'),
  ],

  [ASSET_REPLACEMENT_SCOPES.confirm]: [
    bound('AR2-CF-001', '4.6/11', '两次确认', '旧资产退回和新资产领取分别确认。', 'replacement-audit-confirm-scenes'),
    skip('AR2-CF-002', '1.3/11', 'Pad签字', '下线Pad手写签字和签名图片。', '明确下线能力，不应重新加入页面。'),
    review('AR2-CF-003', '11.3', '旧资产确认文案', '明确确认旧资产及相关配件已交还ES。', '当前仅显示“请核对退库资产明细后完成刷卡或扫码确认”，未表达PRD确认承诺。', 'replacement-audit-confirm-copy'),
    review('AR2-CF-004', '11.3', '新资产保管职责', '明确已阅读保管职责并领取资产及配件。', '当前新资产场景只有通用核对提示，没有资产保管职责正文。', 'replacement-audit-confirm-copy'),
    bound('AR2-CF-005', '11', '刷卡工号校验', '刷卡/录入工号与申请人工号不一致时阻断。', 'replacement-audit-confirm-identity'),
    review('AR2-CF-006', '11', '狐小e真实身份校验', '扫码账号必须与申请人工号一致。', '当前点击二维码直接把 application.applicant.id 传入 confirm，无法验证实际扫码账号。', 'replacement-audit-confirm-identity'),
    review('AR2-CF-007', '11.1/11.2', '手工录入确认方式', '手工录入工号是否作为独立确认方式需统一。', 'PRD页面字段允许手工输入，但确认方式章节只定义扫码/刷卡；当前手工录入统一记录为“刷卡确认”。', 'replacement-audit-confirm-identity'),
    bound('AR2-CF-008', '11.2', '确认记录', '确认成功记录确认方式和确认时间。', 'replacement-audit-confirm-record', '::button::'),
    bound('AR2-CF-009', '11.3', '旧资产确认回传', '旧资产确认成功后返回办理页并允许执行入库。', 'replacement-audit-confirm-record'),
    bound('AR2-CF-010', '11.3', '新资产确认回传', '新资产确认成功后返回办理页并允许执行出库。', 'replacement-audit-confirm-record'),
  ],
};

const STATUS_OVERRIDES = new Map([
  ['AR-AP-001', { status: 'review', reason: '当前 eligibility 缺公司/板块及跨公司领用权限，同时未重新核验责任人工号，原 bound 过于乐观。' }],
  ['AR-AP-004', { status: 'review', reason: '拆单已实现，但旧资产锁仅通过处理中申请动态推导，且没有盘点未盘校验，不能整体判定 bound。' }],
  ['AR-MI-003', { status: 'review', reason: '当前没有鉴定结果字段，无法证明“资产更换+同意”组合校验。' }],
  ['AR-MI-004', { status: 'review', reason: '当前驳回未校验维修/取消结果，旧资产也没有真实持久化锁的显式释放。' }],
  ['AR-HD-003', { status: 'review', reason: '候选仅实现同小类/仓库/状态/locked过滤，缺公司板块权限、资产标记和真实选择锁。' }],
  ['AR-HD-007', { status: 'review', reason: '阶段状态部分实现，但没有真实资产锁释放，且PRD本身存在办理前结束状态冲突。' }],
  ['AR-CF-001', { status: 'review', reason: '手工工号能校验，但狐小e扫码直接使用申请人工号模拟成功，不能整体判定所有确认方式均真实校验。' }],
  ['AR-CF-002', { status: 'review', reason: '页面能区分退旧/领新场景，但确认文案未按PRD表达旧资产交还承诺和新资产保管职责。' }],
]);

function cloneMap(map = {}) {
  return Object.fromEntries(Object.entries(map).map(([pageScope, values]) => [pageScope, [...(values || [])]]));
}

export function applyAssetReplacementAnnotationAudit(base = {}) {
  const next = cloneMap(base);
  Object.entries(annotations).forEach(([pageScope, values]) => {
    next[pageScope] = [...(next[pageScope] || []), ...values];
  });
  return next;
}

export function applyAssetReplacementCoverageAudit(base = {}) {
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

export const assetReplacementAuditAnnotationsByScope = annotations;
export const assetReplacementAuditCoverageByScope = coverage;
