// 已进入标注/覆盖体系的 PRD 来源版本锁。
// reviewedBlobSha 使用 Git blob SHA，而不是提交 SHA：只要对应 PRD 文件内容变化，
// annotation-prd-revisions.test.js 就会失败，提醒重新审计标注与 coverage ledger。
export const ANNOTATION_PRD_REVISIONS = {
  'contract-number': {
    moduleName: '合约号码申请',
    path: 'docs/员工自助功能PRD/04-合约号码申请.md',
    reviewedBlobSha: '4971139118bafb0a66f7d36762e5e6fc2041902b',
    coverageState: 'partial',
  },
  'asset-borrowing': {
    moduleName: '资产借用',
    path: 'docs/员工自助功能PRD/06-资产借用.md',
    reviewedBlobSha: 'f14ee96feb602d11ab7b518a94c6ed612a835009',
    coverageState: 'audited',
  },
};

export function getAnnotationPrdRevision(moduleId) {
  return ANNOTATION_PRD_REVISIONS[moduleId] || null;
}
