
const column = (label, key, extra = {}) => ({ label, key, ...extra });
const filter = (label, key, kind = 'text', match = 'contains', extra = {}) => ({ label, key, kind, match, ...extra });
const status = filter('单据状态', 'status', 'select', 'exact', { options: ['处理中', '已完成', '已驳回'].map(value => ({ value, label: value })) });
const common = { sortKey: 'createdAt', actions: { export: true }, detailType: 'employee' };
const lineColumns = [column('申请单号', 'applicationNo'), column('资产标签号', 'tag'), column('SN号', 'sn'), column('资产说明', 'description'), column('配置', 'config'), column('数量', 'quantity', { format: 'number' }), column('资产状态', 'status'), column('资产用途', 'purpose'), column('公司', 'company'), column('City', 'city'), column('Building', 'building'), column('Floor', 'floor'), column('仓库', 'warehouse'), column('启用日期', 'enabledDate'), column('模块', 'module'), column('备注', 'note'), column('耗材信息', 'consumableInfo'), column('物资说明', 'materialNote')];
const flatLines = (records, key) => records.flatMap(record => record[key].map(line => ({ ...line, applicationNo: record.values.applicationNo, description: line.material.materialDescription, config: line.material.config })));
const historySheet = { name: '审批记录', columns: [column('申请单号', 'applicationNo'), column('审批环节', 'node'), column('审批人', 'approver'), column('代理人', 'agent'), column('审批状态', 'status'), column('审批时间', 'time'), column('审批意见', 'opinion')], records: rows => rows.flatMap(record => record.history.map(item => ({ ...item, applicationNo: record.values.applicationNo }))) };
const accessorySheet = { name: '部件明细', columns: [column('申请单号', 'applicationNo'), column('主资产标签号', 'parentTag'), column('部件标签号', 'tag'), column('物料说明', 'description'), column('配置', 'config'), column('数量', 'quantity', { format: 'number' })], records: rows => rows.flatMap(record => [...record.lines, ...record.pendingLines].flatMap(line => line.accessories.map(item => ({ ...item, applicationNo: record.values.applicationNo, parentTag: line.tag, description: item.material.materialDescription, config: item.material.config })))) };
export const employeeTransferDefinition = {
  ...common, id: 'transfer', title: '转移单',
  filters: [filter('申请单号', 'applicationNo'), filter('转移单号', 'transferNo'), status, filter('转出人', 'sender', 'lookup', 'exact'), filter('接收人', 'receiver', 'lookup', 'exact'), filter('转出人子公司', 'sourceSubsidiary', 'lookup', 'exact'), filter('转出人部门', 'sourceDepartment', 'lookup', 'exact'), filter('制单时间', 'createdAt', 'date', 'date')],
  columns: [column('申请单号', 'applicationNo', { action: 'detail' }), column('转移单号', 'transferNo'), column('单据状态', 'status', { format: 'status' }), column('转出人', 'sender'), column('转出公司', 'sourceCompany'), column('接收人', 'receiver'), column('接收公司', 'targetCompany'), column('申请时间', 'createdAt', { format: 'date' }), column('转移类型', 'transferType'), column('物资数量', 'quantity', { format: 'number' }), column('进度查看', 'progress', { action: 'progress' })],
  exportSheets: [
    { name: '申请单头', columns: [column('申请单号', 'applicationNo'), column('转移单号', 'transferNo'), column('单据状态', 'status'), column('转出人', 'sender'), column('转出公司', 'sourceCompany'), column('转出部门', 'sourceDepartment'), column('转出联系电话', 'sourcePhone'), column('转出邮箱', 'sourceEmail'), column('接收人', 'receiver'), column('接收公司', 'targetCompany'), column('接收部门', 'targetDepartment'), column('接收联系电话', 'targetPhone'), column('接收邮箱', 'targetEmail'), column('申请时间', 'createdAt'), column('转移类型', 'transferType'), column('物资数量', 'quantity'), column('转出原因', 'reason'), column('使用用途', 'usage')], records: rows => rows.map(record => ({ ...record.values, sourceDepartment: record.sourcePerson.department, sourcePhone: record.sourcePerson.phone, sourceEmail: record.sourcePerson.email, targetDepartment: record.targetPerson.department, targetPhone: record.targetPerson.phone, targetEmail: record.targetPerson.email })) },
    { name: '转移资产', columns: lineColumns, records: rows => flatLines(rows, 'lines') }, accessorySheet, historySheet,
  ],
};
export const replacementDefinition = {
  ...common, id: 'replacement', title: '更换单',
  filters: [filter('申请单号', 'applicationNo'), filter('更换单号', 'replacementNo'), status, filter('申请人', 'applicant', 'lookup', 'exact'), filter('制单时间', 'createdAt', 'date', 'date'), filter('资产标签号', 'assetTag'), filter('子公司', 'subsidiary', 'lookup', 'exact'), filter('部门', 'department', 'lookup', 'exact')],
  columns: [column('申请单号', 'applicationNo', { action: 'detail' }), column('更换单号', 'replacementNo'), column('单据状态', 'status', { format: 'status' }), column('申请人', 'applicant'), column('公司', 'company'), column('申请时间', 'createdAt', { format: 'date' }), column('更换类型', 'replacementType'), column('资产数量', 'quantity', { format: 'number' }), column('进度查看', 'progress', { action: 'progress' })],
  exportSheets: [
    { name: '申请单头', columns: [column('申请单号', 'applicationNo'), column('更换单号', 'replacementNo'), column('单据状态', 'status'), column('申请人', 'applicant'), column('公司', 'company'), column('部门', 'department'), column('申请时间', 'createdAt'), column('联系电话', 'phone'), column('邮箱', 'email'), column('更换类型', 'replacementType'), column('更换原因', 'reason'), column('资产数量', 'quantity'), column('鉴定结果', 'identificationResult'), column('鉴定说明', 'identificationExplanation')], records: rows => rows.map(record => ({ ...record.values, phone: record.sourcePerson.phone, email: record.sourcePerson.email, identificationResult: record.identification.result, identificationExplanation: record.identification.explanation })) },
    { name: '退回物资', columns: lineColumns, records: rows => flatLines(rows, 'lines') },
    { name: '待发放物资', columns: lineColumns, records: rows => flatLines(rows, 'pendingLines') }, accessorySheet, historySheet,
  ],
};
export const employeeApplicationDefinitions = [employeeTransferDefinition, replacementDefinition];
