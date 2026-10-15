// 只绑定 PRD 明确的状态编码；缺少运行字典的名称不猜测。
const stateOptions = [{ value: '0', label: '草稿' }, { value: '1', label: '状态1' }, { value: '3', label: '处理中' }, { value: '5', label: '状态5' }];
const filter = (label, key, kind = 'text', match = 'contains', extra = {}) => ({ label, key, kind, match, ...extra });
const column = (label, key, extra = {}) => ({ label, key, ...extra });
export const legacyDefinitions = [
  {
    id: 'storage', title: '移库单', sortable: true, sortKey: 'createdAt', actions: { export: true },
    filters: [filter('移库单号', 'applicationNo'), filter('单据状态', 'status', 'select', 'contains', { options: stateOptions }), filter('制单人', 'applicant', 'lookup'), filter('制单日期', 'createdAt', 'date', 'date'), filter('资产标签号', 'assetTag')],
    columns: [column('移库单号', 'applicationNo', { action: 'detail' }), column('单据状态', 'status', { format: 'status' }), column('移出仓库', 'fromWarehouse'), column('移入仓库', 'toWarehouse'), column('制单日期', 'createdAt', { format: 'date' }), column('制单人', 'applicant'), column('物资数量', 'quantity', { format: 'number' }), column('接收人', 'receiver')],
    exportColumns: [column('移库单号', 'applicationNo'), column('状态', 'status'), column('移出仓库', 'fromWarehouse'), column('移入仓库', 'toWarehouse'), column('制单日期', 'createdAt'), column('制单人', 'exportApplicant'), column('物资数量', 'quantity'), column('接收人', 'exportReceiver')],
  },
  {
    id: 'return', title: '退库单', sortKey: 'createdAt', actions: { export: true, remove: true },
    filters: [filter('申请单号', 'applicationNo'), filter('退库类型', 'returnType', 'select', 'exact', { options: [{ value: '资产退库', label: '资产退库' }, { value: '离职归还', label: '离职归还' }] }), filter('单据状态', 'status', 'select', 'exact', { options: stateOptions }), filter('资产标签号', 'assetTag', 'text', 'prefix'), filter('申请人', 'applicant', 'lookup'), filter('仓库', 'warehouse', 'lookup'), filter('退库单号', 'inboundNo'), filter('申请时间', 'createdAt', 'date', 'date')],
    columns: [column('申请单号', 'applicationNo', { action: 'detail' }), column('退库单号', 'inboundNo'), column('单据状态', 'status', { format: 'status' }), column('退库类型', 'returnType'), column('审批人', 'approver'), column('申请人', 'applicant'), column('申请时间', 'applyDate', { format: 'date' }), column('资产标签号', 'assetTag'), column('退库原因', 'reason'), column('物资数量', 'quantity', { format: 'number' }), column('是否赔偿', 'compensation'), column('进度查看', 'progress', { action: 'progress' })],
    exportColumns: [column('申请单号', 'applicationNo'), column('退库单号', 'inboundNo'), column('状态', 'status'), column('业务类型', 'returnType'), column('审批人', 'approver'), column('申请人', 'applicant'), column('申请时间', 'createdAt', { format: 'date' }), column('标签号', 'assetTag'), column('退库原因', 'reason'), column('数量', 'quantity'), column('是否赔偿', 'compensation')],
  },
  {
    id: 'borrow', title: '借用单', sortKey: 'applicationNo', actions: {},
    filters: [filter('申请单号', 'applicationNo'), filter('借用出库单号', 'outboundNo', 'text', 'prefix'), filter('单据状态', 'status', 'select', 'exact', { options: stateOptions.filter(option => option.value !== '0') }), filter('资产标签号', 'assetTag', 'text', 'prefix'), filter('资产说明', 'description', 'text', 'prefix'), filter('单据类型', 'documentType', 'select', 'exact', { options: [{ value: 'EBA', label: '借用' }, { value: 'ERB', label: '续借' }] }), filter('申请人', 'applicant', 'lookup', 'exact'), filter('制单时间', 'createdAt', 'date', 'date')],
    columns: [column('申请单号', 'applicationNo', { action: 'detail' }), column('借用出库单号', 'outboundNo'), column('单据类型', 'documentType'), column('单据状态', 'status', { format: 'status' }), column('申请人', 'applicant'), column('申请时间', 'createdAt', { format: 'date' }), column('审批人', 'approver'), column('部门', 'department'), column('数量', 'quantity', { format: 'number' }), column('查看', 'progress', { action: 'progress' })],
  },
];
