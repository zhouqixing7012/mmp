export const REVIEW_RELEASE = {
  version: '2026.08.19-01',
  title: '研发评审基线',
  publishedAt: '2026-08-19',
  prdChanges: [
    '员工自助 10 个主要业务模块已完成 PRD 深审并进入 Coverage Ledger，共 854 条研发规则。',
    'Coverage 中的 review 保留为研发评审项：表示 PRD、原型或当前演示实现存在真实差异，不按已完成处理。',
  ],
  prototypeChanges: [
    '评审分支首次从当前 main 建立，当前已确认的员工自助、资产管理、库存管理和资产盘点原型作为本次评审基线。',
    '修正“号码控制 → 发送通知”标注：规则直接落在行内“发送通知”按钮，不再标注整个“授权人员列表”模块。',
  ],
  note: '本分支不会自动跟随 main。后续仅在产品确认后手动同步 PRD/原型变化，并更新此版本说明。',
};
