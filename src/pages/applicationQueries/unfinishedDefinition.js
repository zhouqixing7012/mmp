export const unfinishedDefinition = {
  id: 'unfinished', title: '未完成单据', sortKey: 'createdAt', actions: { export: true, pageExport: true },
  filters: [
    { label: '单据类型', key: 'type', kind: 'select', match: 'exact' },
    { label: '单据编号', key: 'number', kind: 'text', match: 'contains' },
    ...[['申请人', 'applicant'], ['公司', 'company'], ['板块', 'plate'], ['部门', 'department']].map(([label, key]) => ({ label, key, kind: 'lookup', match: 'exact' })),
    { label: '申请时间', key: 'createdAt', kind: 'date', match: 'date' },
    { label: '是否离职', key: 'resigned', kind: 'select', match: 'exact', options: [{ value: 'N', label: '是' }, { value: 'Y', label: '否' }] },
  ],
  columns: [
    ['单据编号', 'number'], ['单据类型', 'type'], ['业务类型', 'businessType'], ['单据状态', 'status', 'status'],
    ['审批环节', 'node'], ['审批人', 'approver'], ['申请人', 'applicant'], ['申请时间', 'createdAt', 'date'],
    ['公司', 'company'], ['板块', 'plate'], ['部门', 'department'], ['是否离职', 'resigned'],
  ].map(([label, key, format]) => ({ label, key, format })),
  exportColumns: [
    ['单据编号', 'number'], ['单据类型', 'type'], ['业务类型', 'businessType'], ['状态', 'status'],
    ['审批环节', 'node'], ['审批人', 'approver'], ['申请人', 'applicant'], ['申请时间', 'createdAt'],
    ['公司', 'company'], ['板块', 'plate'], ['部门', 'department'], ['是否离职', 'resigned'],
  ].map(([label, key]) => ({ label, key })),
};
