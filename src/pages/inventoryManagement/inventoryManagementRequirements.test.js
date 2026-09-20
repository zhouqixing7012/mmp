import fs from 'fs';
import path from 'path';

const inboundSource = fs.readFileSync(path.join(__dirname, 'InboundPage.js'), 'utf8');
const outboundSource = fs.readFileSync(path.join(__dirname, 'OutboundPage.js'), 'utf8');
const outboundApprovalSource = fs.readFileSync(path.join(__dirname, 'OutboundApprovalPage.js'), 'utf8');
const outboundApprovalHistorySource = fs.readFileSync(path.join(__dirname, 'OutboundApprovalHistoryPage.js'), 'utf8');
const printSource = fs.readFileSync(path.join(__dirname, 'InventoryPrintPreview.jsx'), 'utf8');
const transferSource = fs.readFileSync(path.join(__dirname, 'TransferPage.js'), 'utf8');
const moveReceiveSource = fs.readFileSync(path.join(__dirname, 'MoveReceiveContent.js'), 'utf8');
const assetReceiptSource = fs.readFileSync(path.join(__dirname, 'AssetReceiptPage.js'), 'utf8');
const consumableReceiptSource = fs.readFileSync(path.join(__dirname, 'ConsumableReceiptPage.js'), 'utf8');

test('新增入库的资产标签号和 SN 号必须填写', () => {
  expect(inboundSource).toContain('<EditorField label="资产标签号" required>');
  expect(inboundSource).toContain('<EditorField label="SN号" required>');
  expect(inboundSource).toContain("if (!form.assetTag) return messageApi.warning('请维护资产标签号');");
  expect(inboundSource).toContain("if (!form.sn) return messageApi.warning('请维护SN号');");
});

test('退库入库和借用归还共用一个物资选择字段及选择弹窗', () => {
  expect(inboundSource).toContain('const selectedAssetDisplay = [asset.assetTag, asset.sn, asset.materialDesc].filter(Boolean).join(\' / \');');
  expect(inboundSource).toContain('<EditorField label="入库物资" required span={3}>');
  expect(inboundSource).toContain("title={isBorrow ? '选择借用归还物资' : '选择退库入库物资'}");
});

test('出库单状态点击打开审批记录弹窗', () => {
  expect(outboundSource).toContain('const [approvalHistoryRow, setApprovalHistoryRow] = useState(null);');
  expect(outboundSource).toMatch(/<Modal\s+open=\{Boolean\(approvalHistoryRow\)\}/);
  expect(outboundSource).toContain('title="审批记录"');
  expect(outboundSource).not.toContain("setView('approvalHistory')");
});

test('出库物资新增编辑和只读详情使用相同字段布局', () => {
  expect(outboundSource.match(/<EditorField label="备注" span=\{2\}>/g) || []).toHaveLength(2);
  expect(outboundSource).toContain('<EditorField label="费用账户"><Readonly>{asset?.expenseAccount}</Readonly></EditorField>\n              <EditorField label="总价">');
  expect(outboundSource).toContain('<EditorField label="税金"><Readonly>{asset ? money(asset.tax) : \'-\'}</Readonly></EditorField>\n              <EditorField label="主资产标签号">');
  expect(outboundSource).toContain('<EditorField label="费用账户"><Readonly>{row.expenseAccount}</Readonly></EditorField>\n            <EditorField label="总价">');
  expect(outboundSource).toContain('<EditorField label="税金"><Readonly>{money(row.tax)}</Readonly></EditorField>\n            <EditorField label="主资产标签号">');
});

test('员工退库自动入库打印本次退库确认信息', () => {
  expect(printSource).toContain("title: '员工退库确认信息'");
  expect(printSource).toContain("type: 'return'");
  expect(printSource).toContain("['退库人（工号-姓名）', data.employee]");
  expect(printSource).toContain("['退库确认方式', data.method]");
  expect(printSource).toContain("['退库确认时间', data.time]");
});

test('员工来源转移单显示申请人为制单人', () => {
  expect(transferSource).not.toContain("creator: 'admin-系统管理员'");
  expect(transferSource).toContain("creator: '206984-何文'");
});

test('转移明细导出统一使用 xlsx', () => {
  expect(transferSource).toContain('XLSX.writeFile(workbook');
  expect(transferSource).toContain("-明细.xlsx`");
  expect(transferSource).not.toContain("type: 'text/csv;charset=utf-8;'");
});

test('移库接收流程结束后同步结束通知和催办状态', () => {
  expect(moveReceiveSource).toContain("{ notificationStatus: '已结束', reminderStatus: '已结束' }");
});


test('资产接收维护页和详情页不展示制单信息且说明字段统一为资产说明', () => {
  const maintenanceStart = assetReceiptSource.indexOf("if (view === 'maintenance' && activeReceipt)");
  const receiptDetailStart = assetReceiptSource.indexOf("if (view === 'receiptDetail' && activeReceipt)");
  const receiptListStart = assetReceiptSource.indexOf("if (view === 'receiptList')");
  const maintenanceSource = assetReceiptSource.slice(maintenanceStart, receiptDetailStart);
  const receiptDetailSource = assetReceiptSource.slice(receiptDetailStart, receiptListStart);

  expect(maintenanceSource).not.toContain('label="制单人"');
  expect(maintenanceSource).not.toContain('label="制单时间"');
  expect(receiptDetailSource).not.toContain('label="制单人"');
  expect(receiptDetailSource).not.toContain('label="制单时间"');
  expect(assetReceiptSource).toContain("{ title: '资产说明', dataIndex: 'materialDesc', width: 240 }");
  expect(assetReceiptSource).toContain("{ title: '资产说明', dataIndex: 'materialDesc', width: 220 }");
  expect(assetReceiptSource).toContain('<DetailItem label="资产说明"><Typography.Text>{scanTargetAsset?.materialDesc || \'\'}</Typography.Text></DetailItem>');
});

test('耗材和低值耐用品接收信息固定15字段且维护页不展示制单信息', () => {
  const cardStart = consumableReceiptSource.indexOf('function ReceiptInfoCard');
  const cardEnd = consumableReceiptSource.indexOf('function readStorageRows');
  const cardSource = consumableReceiptSource.slice(cardStart, cardEnd);
  const labels = [
    '采购接收单号', 'PO单号', 'PO说明', '供应商', '联系人', '供应商联系电话',
    '采购单位', '采购员', '采购员联系电话', '合同主体', '板块', '接收人',
    '接收单状态', '接收时间', '申请批次',
  ];
  let cursor = -1;
  labels.forEach((label) => {
    const next = cardSource.indexOf(`label="${label}"`);
    expect(next).toBeGreaterThan(cursor);
    cursor = next;
  });
  expect(cardSource).not.toContain('label="制单人"');
  expect(cardSource).not.toContain('label="制单时间"');
  expect(consumableReceiptSource.match(/<ReceiptInfoCard receipt=\{activeReceipt\} \/>/g) || []).toHaveLength(2);

  const poDetailStart = consumableReceiptSource.indexOf("if (view === 'poDetail' && activePO)");
  const receiptListStart = consumableReceiptSource.indexOf("if (view === 'receiptList')");
  const poDetailSource = consumableReceiptSource.slice(poDetailStart, receiptListStart);
  expect(poDetailSource.match(/label="采购员联系电话"/g) || []).toHaveLength(1);
  expect(poDetailSource).not.toContain('label="采购单位联系电话"');
});


test('新增入库责任人弹窗固定员工和公司两列且部门固定虚拟组织', () => {
  const start = inboundSource.indexOf("selector === 'responsible'");
  const end = inboundSource.indexOf("selector === 'originalAsset'", start);
  const source = inboundSource.slice(start, end);
  expect(inboundSource).toContain("const VIRTUAL_RESPONSIBLE_DEPARTMENT = 'SOHU0001.虚拟组织'");
  expect(source).toContain('title="选择责任人"');
  expect(source).toContain("{ title: '员工', dataIndex: 'employee'");
  expect(source).toContain("{ title: '公司', dataIndex: 'company'");
  expect(source).not.toContain("{ title: '所在部门', dataIndex: 'department'");
  expect(inboundSource).toContain('department: VIRTUAL_RESPONSIBLE_DEPARTMENT');
  expect(inboundSource).toContain('<EditorField label="所在部门"><Readonly>{form.department}</Readonly></EditorField>');
});


test('新增入库报废新增才允许选择原资产且资产选择条件统一', () => {
  expect(inboundSource).toContain("form.addType === '报废新增'");
  expect(inboundSource).toContain("setSelector('originalAsset')");
  expect(inboundSource).toContain("{ label: '标签号', name: 'assetTag', dataIndex: 'assetTag' }");
  expect(inboundSource).toContain("{ label: 'SN号', name: 'sn', dataIndex: 'sn' }");
  expect(inboundSource).toContain("{ label: '板块', name: 'plate', dataIndex: 'plate' }");
  expect(inboundSource).toContain("{ label: '资产说明', name: 'materialDesc', dataIndex: 'materialDesc' }");
});

test('新增入库费用账户使用九段编码组成', () => {
  const start = inboundSource.indexOf('function composeExpenseAccount(form)');
  const end = inboundSource.indexOf('function buildEnableDateFromPurchaseDate');
  const source = inboundSource.slice(start, end);
  ['form.company', 'form.plate', 'form.costCenter', 'form.expenseSubject', 'form.expenseSubSubject', 'form.businessLine', 'form.project', 'form.tradingCompany', 'form.spareSegment'].forEach((segment) => {
    expect(source).toContain(segment);
  });
  expect(source).toContain("segments.join('.')");
  expect(inboundSource).toContain('<EditorField label="费用账户"><Readonly>{expenseAccount}</Readonly></EditorField>');
});

test('新增入库购买日期自动计算启用日期且允许单独调整', () => {
  expect(inboundSource).toContain('date.date() <= 25');
  expect(inboundSource).toContain("date.add(1, 'month').startOf('month').format('YYYY-MM-DD')");
  expect(inboundSource).toContain('enableDate: buildEnableDateFromPurchaseDate(purchaseDate)');
  expect(inboundSource).toContain("onChange={(d) => set('enableDate', d?.format('YYYY-MM-DD') || '')}");
});

test('新增入库申请人部件主资产供应商均按选择规则维护', () => {
  expect(inboundSource).toContain('title="选择申请人"');
  expect(inboundSource).toContain("{ title: '工号', dataIndex: 'employeeNo'");
  expect(inboundSource).toContain("{ label: '部门', name: 'department', dataIndex: 'department' }");
  expect(inboundSource).toContain('title="维护部件说明"');
  expect(inboundSource).toContain("partSn: current[index]?.partSn || '缺省'");
  expect(inboundSource).toContain("setSelector('mainAsset')");
  expect(inboundSource).toContain("setSelector('supplier')");
  const supplierIndex = inboundSource.indexOf('<EditorField label="供应商"><LookupInput');
  const serviceIndex = inboundSource.indexOf('<EditorField label="服务"><Input', supplierIndex);
  const noLocationIndex = inboundSource.indexOf('<EditorField label="NO位置"><Input', serviceIndex);
  expect(supplierIndex).toBeGreaterThan(-1);
  expect(serviceIndex).toBeGreaterThan(supplierIndex);
  expect(noLocationIndex).toBeGreaterThan(serviceIndex);
});


test('入库草稿操作列编辑复用原有选择和添加弹窗并回显当前行', () => {
  expect(inboundSource).toContain("onClick={() => openEditLine(row)}>编辑</Button>");
  expect(inboundSource).not.toContain('function InboundLineEditModal');
  expect(inboundSource).toContain("initialLine={inboundType === '新增入库' ? editingLine : null}");
  expect(inboundSource).toContain('initialLine={editingLine}');
  expect(inboundSource).toContain("editRow={inboundType === '采购接收' ? editingLine : null}");
  expect(inboundSource).toContain("title={initialLine ? '编辑新增入库物资' : '添加新增入库物资'}");
});


test('手工采购接收先选仓库并按仓库公司过滤待入库物资', () => {
  expect(inboundSource).toContain('const warehouseCompany = WAREHOUSE_CONTEXT[warehouse]?.company ||');
  expect(inboundSource).toContain('row.company === warehouseCompany');
  expect(inboundSource).toContain("messageApi.warning('请先选择当前仓库')");
  expect(inboundSource).toContain('warehouse={warehouse} onCancel');
  expect(inboundSource).not.toContain("待选择物资后自动匹配");
});

test('待入库物资已选择区域使用紧凑宽度', () => {
  expect(inboundSource).toContain('className="w-[220px] shrink-0"');
  expect(inboundSource).not.toContain('className="w-[280px] shrink-0"');
});

test('借用归还候选固定为在用借用中并复用资产维护真实枚举', () => {
  expect(inboundSource).toContain("DEFAULT_ASSET_MAINTENANCE_ROWS");
  expect(inboundSource).toContain(".filter((row) => row.status === '在用-借用中')");
  expect(inboundSource).toContain("const INBOUND_PURPOSE_OPTIONS = ['部门公用', '员工用机', '其他用途', '专业用途']");
  expect(inboundSource).toContain("const INBOUND_ASSET_MARK_OPTIONS = ['硬件老化', '组件缺失', '设备故障', '物理损伤']");
  expect(inboundSource).toContain("dataSource={candidateAssets}");
  expect(inboundSource).not.toContain("assetStatus: '借出'");
  expect(inboundSource).not.toContain("usage: '办公'");
});

test('新增退库借用归还均保留Excel导入入口且不伪造模板数据', () => {
  expect(inboundSource).toContain("const supportsExcelImport = ['新增入库', '退库入库', '借用归还'].includes(inboundType)");
  expect(inboundSource).toContain('beforeUpload={handleExcelBeforeUpload}');
  expect(inboundSource).toContain('模板字段待确认后再执行解析和导入校验');
  expect(inboundSource).not.toContain("AST-IMP-");
});




test('新增入库部件说明只保留维护入口不显示维护数量摘要', () => {
  expect(inboundSource).not.toContain('partSummary');
  expect(inboundSource).not.toContain('已维护 ${parts.length} 个部件');
  expect(inboundSource).toContain('<EditorField label="部件说明">\n                <Button disabled=');
});

test('手工出库是否刷卡领用固定为否且列表保留导出按钮', () => {
  expect(outboundSource).toContain("const cardClaim = source?.autoGenerated ? (source?.cardClaim || '否') : '否'");
  expect(outboundSource).toContain('<EditorField label="是否刷卡领用"><Readonly>{cardClaim}</Readonly></EditorField>');
  expect(outboundSource).toContain('<Button icon={<Download size={14} />} onClick={exportRows}>导出</Button>');
});

test('出库物资选择弹窗查询条件和结果列按统一资产选择规则展示', () => {
  const start = outboundSource.indexOf('title="选择出库物资"');
  const end = outboundSource.indexOf("title={isBorrow ? '选择借用人' : '选择领用人'}", start);
  const source = outboundSource.slice(start, end);
  ["label: '标签号'", "label: 'SN号'", "label: '板块'", "label: '资产说明'"].forEach((value) => expect(source).toContain(value));
  ['标签号', 'SN号', '公司', '板块', '资产大类', '资产小类', '资产说明', '品牌', '数量', '原值', '资产责任人', '资产状态', '成本中心', '启用日期'].forEach((title) => expect(source).toContain(`title: '${title}'`));
  expect(source).not.toContain("label: '资产大类'");
  expect(source).not.toContain("label: '资产小类'");
  expect(source).not.toContain("label: '责任人'");
});

test('领用人使用员工选择弹窗且用途使用正式枚举', () => {
  expect(outboundSource).toContain("const OUTBOUND_PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途']");
  expect(outboundSource).toContain("placeholder={isBorrow ? '请选择借用人' : '请选择领用人'}");
  expect(outboundSource).toContain("{ label: '工号', name: 'employeeNo', dataIndex: 'employeeNo' }");
  expect(outboundSource).toContain("{ label: '姓名', name: 'name', dataIndex: 'name' }");
  expect(outboundSource).toContain("{ label: '部门', name: 'department', dataIndex: 'department' }");
  expect(outboundSource).toContain('options={OUTBOUND_PURPOSE_OPTIONS.map');
});


test('出库审批页按物资出库申请字段展示且不再混入旧审批信息卡片', () => {
  expect(outboundApprovalSource).toContain('物资出库申请');
  expect(outboundApprovalSource).toContain('title="基本信息"');
  ['制单人', '制单时间', '使用人', '使用部门', '仓库名称', '地点位置', 'PR单号', 'PO单号', '资产大类'].forEach((label) => {
    expect(outboundApprovalSource).toContain(`label="${label}"`);
  });
  expect(outboundApprovalSource).toContain('title="出库资产信息"');
  ['物资说明', '资产标签号', 'SN号', '数量', '单价', '原值', '备注'].forEach((title) => {
    expect(outboundApprovalSource).toContain(`title: '${title}'`);
  });
  expect(outboundApprovalSource).toContain("title: '价值'");
  expect(outboundApprovalSource).toContain('总数量');
  expect(outboundApprovalSource).toContain('总金额');
  expect(outboundApprovalSource).not.toContain('title="出库单信息"');
  expect(outboundApprovalSource).not.toContain('title="审批信息"');
  expect(outboundApprovalSource).not.toContain('title="历史审批记录"');
});

test('出库单状态点击只展示审批记录不展示单据信息或物资', () => {
  expect(outboundApprovalHistorySource).toContain('locale={{ emptyText: \'暂无审批记录\' }}');
  expect(outboundApprovalHistorySource).not.toContain('出库单信息');
  expect(outboundApprovalHistorySource).not.toContain('出库物资');
  expect(outboundApprovalHistorySource).not.toContain('审批操作');
  expect(outboundSource).toContain('title="审批记录"');
  expect(outboundSource).toContain('width={960}');
  expect(outboundSource).toContain('<OutboundApprovalHistoryPage outbound={approvalHistoryRow} />');
});


test('转移资产选择弹窗与父弹窗同级且字段对齐入库出库资产选择', () => {
  const start = transferSource.indexOf("function TransferItemModal");
  const end = transferSource.indexOf("function TransferImportModal", start);
  const source = transferSource.slice(start, end);
  expect(source).toContain("<Modal open={open && !selectorType}");
  expect(source).toContain("</Modal>\n      <SelectorModal config={selectorConfig}");
  expect(source).not.toContain("<SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />\n    </Modal>");
  ["label: '标签号'", "label: 'SN号'", "label: '板块'", "label: '资产说明'"].forEach((value) => expect(source).toContain(value));
  ['标签号', 'SN号', '公司', '板块', '资产大类', '资产小类', '资产说明', '品牌', '数量', '原值', '资产责任人', '资产状态', '成本中心', '启用日期'].forEach((title) => {
    expect(source).toContain(`title: '${title}'`);
  });
});
