// 已进入标注/覆盖体系的 PRD 来源版本锁。
// reviewedBlobSha 使用 Git blob SHA，而不是提交 SHA：只要对应 PRD 文件内容变化，
// annotation-prd-revisions.test.js 就会失败，提醒重新审计标注与 coverage ledger。
// 资产申请在仓库中拆成 3 个实际规则文件，因此使用 sources 数组逐文件锁定。
export const ANNOTATION_PRD_REVISIONS = {
  'asset-application': {
    moduleName: '资产申请',
    coverageState: 'audited',
    sources: [
      {
        path: 'docs/员工自助功能PRD/02-资产申请/01-申请与业务审批.md',
        reviewedBlobSha: '98293510a0e627d956468745eaa5a1a004bd88ce',
      },
      {
        path: 'docs/员工自助功能PRD/02-资产申请/02-ES配给与统一采购.md',
        reviewedBlobSha: '4342696f1abe816fdbe904e618d5407f2b8b80e7',
      },
      {
        path: 'docs/员工自助功能PRD/02-资产申请/03-资产领用与确认.md',
        reviewedBlobSha: '9c5fb027865b541be2dfc1fcb321fca7d4d70761',
      },
    ],
  },
  'new-employee-claim': {
    moduleName: '新员工与实习生资产领用',
    path: 'docs/员工自助功能PRD/03-新员工与实习生资产领用.md',
    reviewedBlobSha: '0a9853f9c74a65e40c8aee7b5fc3af7cc1473e09',
    coverageState: 'audited',
  },
  'contract-number': {
    moduleName: '合约号码申请',
    path: 'docs/员工自助功能PRD/04-合约号码申请.md',
    reviewedBlobSha: '4971139118bafb0a66f7d36762e5e6fc2041902b',
    coverageState: 'partial',
  },
  'consumables': {
    moduleName: '耗材申请',
    path: 'docs/员工自助功能PRD/05-耗材申请.md',
    reviewedBlobSha: '800427276c25ca2f5439dc36e66351454c8bd7a4',
    coverageState: 'audited',
  },
  'asset-borrowing': {
    moduleName: '资产借用',
    path: 'docs/员工自助功能PRD/06-资产借用.md',
    reviewedBlobSha: 'f14ee96feb602d11ab7b518a94c6ed612a835009',
    coverageState: 'audited',
  },
  'asset-replacement': {
    moduleName: '资产更换',
    path: 'docs/员工自助功能PRD/07-资产更换.md',
    reviewedBlobSha: '6c23c90ab4c4e0a1bdf71ed7ebf0615e235c43d6',
    coverageState: 'audited',
  },
  'asset-transfer': {
    moduleName: '资产转移',
    path: 'docs/员工自助功能PRD/08-资产转移.md',
    reviewedBlobSha: '2632569d30863c3d821347e5cd99421f13005e73',
    coverageState: 'audited',
  },
  'asset-return': {
    moduleName: '资产退库',
    path: 'docs/员工自助功能PRD/09-资产退库.md',
    reviewedBlobSha: 'd9f9440b8280a46c93e46ff13f01fe109e546140',
    coverageState: 'audited',
  },
  'contract-number-return': {
    moduleName: '合约号码退库',
    path: 'docs/员工自助功能PRD/10-合约号码退库.md',
    reviewedBlobSha: '42746acca08e6863715a5332235a7f70b719a044',
    coverageState: 'audited',
  },
};

export function getAnnotationPrdRevision(moduleId) {
  return ANNOTATION_PRD_REVISIONS[moduleId] || null;
}

export function getAnnotationPrdRevisionSources(revision) {
  if (!revision) return [];
  if (Array.isArray(revision.sources)) return revision.sources;
  if (revision.path && revision.reviewedBlobSha) {
    return [{ path: revision.path, reviewedBlobSha: revision.reviewedBlobSha }];
  }
  return [];
}
