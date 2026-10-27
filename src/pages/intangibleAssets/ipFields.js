export const basicFields = [
  ['名称', 'name'], ['类型', 'type'], ['IP来源', 'source'], ['题材', 'subject'], ['作者', 'author'],
  ['地区', 'region'], ['当前进度', 'progress'], ['市场反应', 'market'],
  ['故事亮点或标签', 'tags', 3], ['一句话故事', 'story', 3], ['内容简介', 'introduction', 3],
];
export const relatedSections = [
  { key: 'purchases', title: '采购信息', fields: [['PR单号', 'prNumber'], ['费用名称', 'name'], ['费用类型', 'expenseType'], ['金额', 'amount'], ['币种', 'currency'], ['采购类型', 'purchaseType'], ['授权形式', 'authorization'], ['供应商', 'supplier'], ['申请人', 'applicant'], ['申请时间', 'date'], ['状态', 'status']] },
  { key: 'contracts', title: '合同基本信息', fields: [['合同单号', 'number'], ['合同名称', 'name'], ['合同类型', 'type'], ['金额', 'amount'], ['币种', 'currency'], ['采购类型', 'purchaseType'], ['授权形式', 'authorization'], ['供应商', 'supplier'], ['申请人', 'applicant'], ['申请时间', 'date'], ['状态', 'status']] },
  { key: 'payments', title: '付款信息', fields: [['付款单号', 'number'], ['合同名称', 'contractName'], ['付款金额', 'amount'], ['供应商名称', 'supplier'], ['发票状态', 'invoiceStatus'], ['申请人', 'applicant'], ['申请时间', 'date'], ['状态', 'status']] },
];
export function displayIPValue(value, field) {
  if (value === undefined || value === null || value === '') return '—';
  return field === 'amount' ? Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
}
