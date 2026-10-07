import fs from 'fs';
import path from 'path';

const inboundSource = fs.readFileSync(path.join(__dirname, 'InboundPage.js'), 'utf8');
const outboundSource = fs.readFileSync(path.join(__dirname, 'OutboundPage.js'), 'utf8');
const outboundApprovalSource = fs.readFileSync(path.join(__dirname, 'OutboundApprovalPage.js'), 'utf8');
const outboundApprovalHistorySource = fs.readFileSync(path.join(__dirname, 'OutboundApprovalHistoryPage.js'), 'utf8');
const printSource = fs.readFileSync(path.join(__dirname, 'InventoryPrintPreview.jsx'), 'utf8');
const transferSource = fs.readFileSync(path.join(__dirname, 'TransferPage.js'), 'utf8');
const moveReceiveSource = fs.readFileSync(path.join(__dirname, 'MoveReceiveContent.js'), 'utf8');
const moveSource = fs.readFileSync(path.join(__dirname, 'MovePage.js'), 'utf8');
const moveMobileSource = fs.readFileSync(path.join(__dirname, 'MoveMobilePrototype.jsx'), 'utf8');
const movePrintSource = fs.readFileSync(path.join(__dirname, 'MovePrintPreview.jsx'), 'utf8');
const assetReceiptSource = fs.readFileSync(path.join(__dirname, 'AssetReceiptPage.js'), 'utf8');
const consumableReceiptSource = fs.readFileSync(path.join(__dirname, 'ConsumableReceiptPage.js'), 'utf8');
const consumableReceiptMockSource = fs.readFileSync(path.join(__dirname, 'consumableReceiptMock.js'), 'utf8');
const inboundImportSource = fs.readFileSync(path.join(__dirname, 'inboundImport.js'), 'utf8');
const warehouseWorkbenchSource = fs.readFileSync(path.join(__dirname, 'WarehouseWorkbenchPage.js'), 'utf8');
const warehouseWorkbenchMockSource = fs.readFileSync(path.join(__dirname, '../../mock/warehouseWorkbenchMock.js'), 'utf8');
const assetReturnServiceSource = fs.readFileSync(path.join(__dirname, '../../services/assetReturnService.js'), 'utf8');
const assetReturnConfirmSource = fs.readFileSync(path.join(__dirname, '../assetReturn/AssetReturnConfirmPage.js'), 'utf8');
const assetReturnHandlingSource = fs.readFileSync(path.join(__dirname, '../assetReturn/AssetReturnHandlingPage.js'), 'utf8');

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

test('员工退库自动入库改为打印资产退库审批记录', () => {
  expect(printSource).toContain("title: '资产退库审批记录'");
  expect(printSource).toContain("'申请单号'");
  expect(printSource).toContain("'审批节点'");
  expect(printSource).toContain("'审批备注'");
  expect(printSource).toContain("key: 'assetReturnApproval'");
  expect(printSource).not.toContain("title: '员工退库确认信息'");
  expect(assetReturnServiceSource).toContain("appendHistory(application, '员工退库确认', '待确认'");
  expect(assetReturnServiceSource).toContain("row.node === '员工退库确认' && row.status === '待确认'");
  expect(assetReturnServiceSource).toContain("`确认方式：${confirmationMethod}`");
  expect(assetReturnServiceSource).toContain("confirmationMethod === '库管员代确认'");
  expect(assetReturnServiceSource).toContain("const inboundOrderNo = buildNo('RK')");
  expect(printSource).toContain(".filter((row) => row.node !== '执行入库')");
  expect(printSource).toContain("row.node === '申请人退库确认' ? '员工退库确认' : row.node");
  expect(printSource).not.toContain("{ node: '执行入库'");
  expect(printSource).not.toContain("{ node: '申请人退库确认'");
  expect(assetReturnConfirmSource).toContain("confirm('刷卡')");
  expect(assetReturnConfirmSource).toContain("confirm('扫码', application.applicant.id)");
  expect(assetReturnConfirmSource).toContain("confirm('库管员代确认', application.applicant.id)");
  expect(assetReturnConfirmSource).toContain('系统已自动生成入库结果');
  expect(assetReturnHandlingSource).not.toContain('completeAssetReturn(');
  expect(assetReturnHandlingSource).toContain('确认完成后系统将自动生成入库结果');
});

test('出库是否自购出库使用是否单选且默认否', () => {
  expect(outboundSource).toContain('<Radio.Group value={isSelfPurchase ? \'是\' : \'否\'}');
  expect(outboundSource).toContain("{ label: '否', value: '否' }");
  expect(outboundSource).toContain("{ label: '是', value: '是' }");
  expect(outboundSource).not.toContain('<Checkbox checked={isSelfPurchase}');
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

test('耗材和低值耐用品接收信息固定14字段且不展示申请批次和制单信息', () => {
  const cardStart = consumableReceiptSource.indexOf('function ReceiptInfoCard');
  const cardEnd = consumableReceiptSource.indexOf('function readStorageRows');
  const cardSource = consumableReceiptSource.slice(cardStart, cardEnd);
  const labels = [
    '采购接收单号', 'PO单号', 'PO说明', '供应商', '联系人', '供应商联系电话',
    '采购单位', '采购员', '采购员联系电话', '合同主体', '板块', '接收人',
    '接收单状态', '接收时间',
  ];
  let cursor = -1;
  labels.forEach((label) => {
    const next = cardSource.indexOf(`label="${label}"`);
    expect(next).toBeGreaterThan(cursor);
    cursor = next;
  });
  expect(cardSource).not.toContain('label="申请批次"');
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
  expect(inboundSource).toContain('<PurchasePendingModal open={lineModal === \'purchase\'}');
  expect(inboundSource).toContain('warehouse={warehouse} editRow=');
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

test('新增退库借用归还按类型下载xls模板并执行原子批量导入', () => {
  expect(inboundSource).toContain("const supportsExcelImport = ['新增入库', '退库入库', '借用归还'].includes(inboundType)");
  expect(inboundSource).toContain('downloadInboundImportTemplate(inboundType)');
  expect(inboundSource).toContain('beforeUpload={handleExcelBeforeUpload}');
  expect(inboundSource).toContain('readInboundImportFile(file, inboundType)');
  expect(inboundSource).toContain('validateInboundImportRows(matrix');
  expect(inboundSource).toContain('downloadInboundImportErrors(inboundType, matrix, result.errors)');
  expect(inboundSource).toContain('本批数据未保存');
  expect(inboundSource).toContain('执行入库后才更新资产或库存');

  expect(inboundImportSource).toContain("'借用归还数据导入模板.xls'");
  expect(inboundImportSource).toContain("'退库入库数据导入模板.xls'");
  expect(inboundImportSource).toContain("'新增入库数据导入模板.xls'");
  expect(inboundImportSource).toContain("'错误提示', '资产标签号*', 'SN号', '责任人(员工编号)*'");
  expect(inboundImportSource).toContain("'错误提示', '资产标签号*', 'SN号', '退库数量', '责任人(员工编号)*'");
  expect(inboundImportSource).toContain("'错误提示', '资产标签号*', '物资编码*'");
  expect(inboundImportSource).toContain("bookType: 'xls'");
  expect(inboundImportSource).toContain("asset.assetStatus !== '在用-借用中'");
  expect(inboundImportSource).toContain("asset.assetStatus !== '在用-使用中'");
  expect(inboundImportSource).toContain("rowErrors.push('资产标签号已存在或在当前导入中重复')");
  expect(inboundImportSource).toContain("rowErrors.push('税金不能小于0')");
  expect(inboundImportSource).toContain("assetStatus: '在库-新增'");
});




test('新增入库部件说明只保留维护入口不显示维护数量摘要', () => {
  expect(inboundSource).not.toContain('partSummary');
  expect(inboundSource).not.toContain('已维护 ${parts.length} 个部件');
  expect(inboundSource).toContain('<EditorField label="部件说明">\n                <Button disabled=');
});

test('出库单仓库位于信息Card右上角，自购为是才进入审批且不展示Room', () => {
  const start = outboundSource.indexOf('title="出库单信息"');
  const end = outboundSource.indexOf('title="出库物资"', start);
  const source = outboundSource.slice(start, end);
  expect(source).toContain('当前仓库');
  expect(source).toContain('extra={<Space>');
  expect(source).not.toContain('<EditorField label="当前仓库">');
  expect(outboundSource).toContain('<EditorField label="是否刷卡领用"><Readonly>{cardClaim}</Readonly></EditorField>');
  expect(outboundSource).toContain("<Radio.Group value={isSelfPurchase ? '是' : '否'}");
  expect(outboundSource).not.toContain('<Checkbox checked={isSelfPurchase}');
  expect(outboundSource).toContain("if (!payload.isSelfPurchase)");
  expect(outboundSource).not.toContain('label="Room"');
  expect(outboundSource).not.toContain('const exportRows = () =>');
  expect(outboundSource).not.toContain('>导出</Button>');
});

test('退库入库与借用归还不再展示鉴定人、鉴定日期、鉴定单号', () => {
  expect(inboundSource).not.toContain('label="鉴定单号"');
  expect(inboundSource).not.toContain('label="鉴定人"');
  expect(inboundSource).not.toContain('label="鉴定日期"');
  expect(inboundImportSource).not.toContain('鉴定单号');
  expect(inboundImportSource).not.toContain('鉴定人(员工编号)');
  expect(inboundImportSource).not.toContain('鉴定日期(YYYY-MM-DD)');
});

test('库管员工作台类型包含合约号码申请和合约号码退库', () => {
  expect(warehouseWorkbenchMockSource).toContain("'合约号码申请'");
  expect(warehouseWorkbenchMockSource).toContain("'合约号码退库'");
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


test('耗材接收链路不再包含部件字段且PO页面不展示申请批次', () => {
  ['partQuantity', 'partDesc', 'isPart', '部件数量', '部件说明', '是否部件', '部件信息'].forEach((value) => {
    expect(consumableReceiptSource).not.toContain(value);
  });
  ['partQuantity', 'partDesc', 'isPart'].forEach((value) => {
    expect(consumableReceiptMockSource).not.toContain(value);
  });
  const poMockStart = consumableReceiptMockSource.indexOf('export const INITIAL_PO_ROWS = [');
  const poMockEnd = consumableReceiptMockSource.indexOf('export const INITIAL_PO_ITEMS', poMockStart);
  expect(consumableReceiptMockSource.slice(poMockStart, poMockEnd)).not.toContain('applicationBatch');

  const poDetailStart = consumableReceiptSource.indexOf("if (view === 'poDetail' && activePO)");
  const receiptListStart = consumableReceiptSource.indexOf("if (view === 'receiptList')", poDetailStart);
  const poDetailSource = consumableReceiptSource.slice(poDetailStart, receiptListStart);
  expect(poDetailSource).not.toContain('label="申请批次"');

  expect(consumableReceiptSource).not.toContain('applicationBatch');
  expect(consumableReceiptMockSource).not.toContain('applicationBatch');
});

test('资产和耗材PO行仅有剩余可接收数量时展示编辑且草稿引用锁定基础字段', () => {
  expect(assetReceiptSource).toContain('const getDraftReceiptItemReference = (poNo, itemId)');
  expect(assetReceiptSource).toContain("row.receiptStatus === '待接收' && availableQty(row) > 0");
  expect(assetReceiptSource).not.toContain('(availableQty(row) > 0 || draftReference)');
  expect(assetReceiptSource).toContain('const locked = Boolean(draftReference)');
  expect(assetReceiptSource).toContain('const delta = qty - previousQty');
  expect(assetReceiptSource).toContain('reconcileMaintenanceForReceipt(nextReceipt)');
  expect(assetReceiptSource).toContain("? <div className=\"mt-1\"><Readonly>{editDraft.config}</Readonly></div>");

  expect(consumableReceiptSource).toContain('const getDraftReceiptLineReference = (poNo, itemId)');
  expect(consumableReceiptSource).toContain("activePO?.receiptStatus !== '已入库' && remainingQty(row) > 0");
  expect(consumableReceiptSource).not.toContain("(remainingQty(row) > 0 || getDraftReceiptLineReference(activePO?.poNo, row.id))");
  expect(consumableReceiptSource).toContain('const locked = Boolean(draftReference)');
  expect(consumableReceiptSource).toContain('const delta = qty - previousDraftQty');
  expect(consumableReceiptSource).toContain('actualReceiveQty: qty');
  expect(consumableReceiptSource).toContain("editingPoItemLocked\n                  ? <div className=\"mt-1\"><Readonly>{editDraft.config}</Readonly></div>");
});

test('耗材接收 activeReceipt 在面包屑 effect 前初始化避免白屏', () => {
  const activeReceiptIndex = consumableReceiptSource.indexOf('const activeReceipt = useMemo(');
  const breadcrumbEffectIndex = consumableReceiptSource.indexOf("const moduleItem = { label: '耗材接收'");
  expect(activeReceiptIndex).toBeGreaterThan(-1);
  expect(breadcrumbEffectIndex).toBeGreaterThan(-1);
  expect(activeReceiptIndex).toBeLessThan(breadcrumbEffectIndex);
});


test('移库仅支持资产并统一资产命名', () => {
  expect(moveSource).toContain("const SUPPORTED_MATERIAL_GROUPS = new Set(['1.资产']);");
  expect(moveMobileSource).toContain("asset.materialGroup === '1.资产'");
  [moveSource, moveReceiveSource, moveMobileSource, movePrintSource].forEach((source) => {
    expect(source).not.toContain('物资');
    expect(source).not.toContain('2.低值耐用品');
  });
});

test('移库跨页面返回保留查询条件', () => {
  expect(moveSource).toContain("const MOVE_LIST_STATE_KEY = 'mmp.inventory.move.list-state.v1'");
  expect(moveSource).toContain('window.sessionStorage.setItem(MOVE_LIST_STATE_KEY');
  expect(moveReceiveSource).toContain("const MOVE_RECEIVE_LIST_STATE_KEY = 'mmp.inventory.move.receive-list-state.v1'");
  expect(moveReceiveSource).toContain('window.sessionStorage.setItem(MOVE_RECEIVE_LIST_STATE_KEY');
  expect(moveMobileSource).toContain("onClick={() => navigate(-1)}");
});

test('移库未勾选时默认驳回全部未接收资产', () => {
  expect(moveReceiveSource).toContain("lines.filter((line) => line.moveStatus === '待接收').map((line) => line.id)");
  expect(moveReceiveSource).toContain('onClick={() => setRejectAsset({ bulk: true })}>移库驳回</Button>');
  expect(moveMobileSource).toContain("&& (!selectedLineIds.length || selectedLineIds.includes(line.id))");
  expect(moveMobileSource).toContain('const selectedSet = new Set(selected.map((line) => line.id))');
  expect(moveMobileSource).toContain('selectedSet.has(line.id)');
  expect(moveMobileSource).toContain('当前未勾选资产，将默认驳回整单剩余');
});

test('移动端我的接收展示待接收数量且扫码后定位资产卡片', () => {
  expect(moveMobileSource).toContain('const pendingReceiveDocumentCount = useMemo(');
  expect(moveMobileSource).toContain('<Badge count={pendingReceiveDocumentCount} size="small" />');
  expect(moveMobileSource).toContain("scrollIntoView({ behavior: 'smooth', block: 'center' })");
  expect(moveMobileSource).toContain('scrollToAssetCard(line.id)');
  expect(moveMobileSource).toContain('验证成功，已定位到对应移库资产');
});


test('资产和耗材接收页面遵循统一UI层级与操作状态', () => {
  expect(assetReceiptSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(assetReceiptSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(assetReceiptSource).toContain("<PageTitle>PO单详情</PageTitle>");
  expect(assetReceiptSource).toContain("<PageTitle>接收单列表</PageTitle>");
  expect(assetReceiptSource).toContain("<PageTitle>接收单详情</PageTitle>");
  expect(assetReceiptSource).toContain("title=\"PO资产明细\"");
  expect(assetReceiptSource).toContain("title=\"接收资产明细\"");
  expect(assetReceiptSource).toContain("{ title: '资产总类', dataIndex: 'materialGroup'");
  expect(assetReceiptSource).not.toContain("title=\"PO物资明细\"");
  expect(assetReceiptSource).not.toContain("title=\"接收物资明细\"");
  expect(assetReceiptSource).not.toContain("{ title: '物资总类', dataIndex: 'materialGroup'");
  expect(assetReceiptSource).toContain("plate: { title: '选择板块'");
  expect(assetReceiptSource).toContain("detailPlate: { title: '选择板块'");
  expect(assetReceiptSource).toContain("disabled={!selectedReceiptKeys.length}");
  expect(assetReceiptSource).toContain("disabled={!selectedReceiptLineKeys.length}");
  expect(assetReceiptSource).not.toContain('text-[#1677ff]');

  expect(consumableReceiptSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(consumableReceiptSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(consumableReceiptSource).toContain("<PageTitle>PO单详情</PageTitle>");
  expect(consumableReceiptSource).toContain("<PageTitle>接收单列表</PageTitle>");
  expect(consumableReceiptSource).toContain("<PageTitle>接收单详情</PageTitle>");
  expect(consumableReceiptSource).toContain('title="PO耗材明细"');
  expect(consumableReceiptSource).toContain('title="接收耗材明细"');
  expect(consumableReceiptSource).toContain("disabled={!selectedReceipts.length}");
  expect(consumableReceiptSource).toContain("disabled={!selectedLines.length}");
  expect(consumableReceiptSource).not.toContain('text-[#1677ff]');
});


test('电子设备和低值耐用品维护操作常显不可用时置灰', () => {
  expect(assetReceiptSource).toContain("disabled={!isDraft || !selectedMaintenanceKeys.length}");
  expect(assetReceiptSource).toContain("disabled={!isDraft || !maintenanceRows.length || !hasBlankMaintenanceTags}");
  expect(assetReceiptSource).toContain("disabled={!isDraft || !maintenanceRows.length || !hasBlankMaintenanceSn}");
  expect(assetReceiptSource).toContain("disabled={!maintenanceRows.length || !allMaintenanceTagsReady}");

  expect(consumableReceiptSource).toContain("disabled={!isDraft || !selectedDetails.length}");
  expect(consumableReceiptSource).toContain("disabled={!isDraft || !details.length || allTagsGenerated}");
  expect(consumableReceiptSource).toContain("disabled={!isDraft || !details.length || allSnMaintained}");
  expect(consumableReceiptSource).toContain("disabled={!details.length || !allTagsGenerated}");
});

test('入库单当前仓库位于入库单信息Card右上角', () => {
  const start = inboundSource.indexOf('title="入库单信息"');
  const end = inboundSource.indexOf('title="入库物资"', start);
  const source = inboundSource.slice(start, end);
  expect(source).toContain('extra={(');
  expect(source).toContain('当前仓库</Typography.Text>');
  expect(source).toContain('style={{ width: 280 }}');
  expect(source).not.toContain('<EditorField label="当前仓库">');
});


test('入库和出库页面遵循统一层级、面包屑和勾选操作状态', () => {
  expect(inboundSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(inboundSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(inboundSource).toContain("!source ? '创建入库单' : editable ? '编辑入库单' : '入库单详情'");
  expect(inboundSource).toContain("disabled={!selectedKeys.length} onClick={deleteLines}");
  expect(inboundSource).toContain("disabled={!selectedKeys.length || rows.filter((row) => selectedKeys.includes(row.id)).some((row) => row.status !== '草稿')}");
  expect(inboundSource).toContain("disabled={!selectedKeys.length || rows.filter((row) => selectedKeys.includes(row.id)).some((row) => row.status !== '已完成')} onClick={batchPrint}");

  expect(outboundSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(outboundSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(outboundSource).toContain("!source ? '创建出库单' : editable ? '编辑出库单' : '出库单详情'");
  expect(outboundSource).toContain("disabled={!selectedKeys.length} onClick={deleteLines}");
  expect(outboundSource).toContain('title="选择资产责任人"');
  expect(outboundSource).toContain('placeholder="请选择资产责任人"');
  expect(outboundSource).toContain("disabled={!selectedKeys.length || rows.filter((row) => selectedKeys.includes(row.id)).some((row) => row.status !== '草稿')}");
  expect(outboundSource.match(/row\.status !== '已完成'/g) || []).toHaveLength(3);
});


test('耗材接收生成的低值耐用品进入入库后继续剔除部件字段', () => {
  const seedStart = inboundSource.indexOf("id: 'pending-durable-1'");
  const seedEnd = inboundSource.indexOf("];", seedStart);
  const durableSeed = inboundSource.slice(seedStart, seedEnd);
  expect(durableSeed).not.toContain('partQuantity');
  expect(durableSeed).not.toContain('partDesc');
  expect(inboundSource).toContain('delete withoutParts.partQuantity;');
  expect(inboundSource).toContain('delete withoutParts.partDesc;');
  expect(inboundSource).toContain('delete withoutParts.parts;');
  expect(inboundSource).toContain('delete withoutParts.isPart;');
  expect(inboundSource).toContain("{!consumable && <EditorField label=\"部件数量\">");
  expect(inboundSource).toContain("{!consumable && <EditorField label=\"部件说明\">");
});


test('耗材板块按使用部门自动带出且人工调整后不再被自动覆盖', () => {
  expect(consumableReceiptSource).toContain('const resolveDepartmentAccounting = (department, fallbackPlate = \'\')');
  expect(consumableReceiptSource).toContain('mockDeptCostCenterMappingData');
  expect(consumableReceiptSource).toContain('mockCostCenterPlateMappingData');
  expect(consumableReceiptSource).toContain("const usageDepartment = sourceItems.find((item) => item.department)?.department || ''");
  expect(consumableReceiptSource).toContain('const accounting = resolveDepartmentAccounting(usageDepartment, row.plate)');
  expect(consumableReceiptSource).toContain('row.plateManuallyAdjusted');
  expect(consumableReceiptSource).toContain('{ plate: value, plateManuallyAdjusted: true }');
  expect(consumableReceiptSource).toContain("costCenter: activePO.costCenter || ''");
});


test('库管员工作台单条查询结果不自动跳转且申请单编号为唯一办理入口', () => {
  expect(warehouseWorkbenchSource).not.toContain('if (filtered.length === 1)');
  expect(warehouseWorkbenchSource).toContain("title: '申请单编号'");
  expect(warehouseWorkbenchSource).toContain('onClick={() => handleTask(row)}');
  expect(warehouseWorkbenchSource).not.toContain("title: '操作'");
  expect(warehouseWorkbenchSource).not.toContain('>处理</Button>');
});

test('库管员工作台刷新员工页面保持当前办理信息并强制刷新展示', () => {
  expect(warehouseWorkbenchSource).toContain('const currentContext = readWarehouseEmployeePageContext();');
  expect(warehouseWorkbenchSource).toContain('writeWarehouseEmployeePageContext(currentContext);');
  expect(warehouseWorkbenchSource).not.toContain('clearWarehouseEmployeePageContext();');
  expect(warehouseWorkbenchSource).toContain("messageApi.success('已刷新')");
});

test('库管员工作台员工页面按业务场景展示保管职责或退回说明', () => {
  expect(warehouseWorkbenchMockSource).toContain("task?.documentType === '员工借用'");
  expect(warehouseWorkbenchMockSource).toContain("title: '保管职责', text: BORROW_CUSTODY_TEXT");
  expect(warehouseWorkbenchMockSource).toContain("task?.documentType === '员工退库'");
  expect(warehouseWorkbenchMockSource).toContain("title: '退回确认说明'");
});


test('PC移库列表不提供导出按钮，接收详情保留明细导出', () => {
  expect(moveSource).not.toContain("当前查询结果已导出");
  expect(moveReceiveSource).not.toContain("当前查询结果已导出");
  expect(moveReceiveSource).toContain("移库明细已导出");
});

test('转移手工创建仅使用资产命名并统一资产类别', () => {
  expect(transferSource).toContain(".filter((item) => item.materialGroup === '1.资产')");
  expect(transferSource).not.toContain('转移物资');
  expect(transferSource).not.toContain('物资大类');
  expect(transferSource).not.toContain('物资小类');
  expect(transferSource).toContain("title: '资产类别'");
  expect(transferSource).toContain('title="添加转移资产"');
});


test('库存管理剩余页面遵循统一UI层级与已确认字段口径', () => {
  expect(moveSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(moveSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(moveSource).toContain("!source ? '创建移库单' : editable ? '编辑移库单' : '移库单详情'");
  expect(moveSource).not.toContain('>保存草稿</Button>');
  expect(moveSource).toContain('const persistDraftState = (overrides = {}) =>');
  expect(moveSource).toContain('persistDraftState({ lines: nextLines })');
  expect(moveSource).toContain('label={<RequiredLabel>移出仓库</RequiredLabel>}');
  expect(moveSource).toContain('label={<RequiredLabel>移入仓库</RequiredLabel>}');
  expect(moveSource).not.toContain('label={<RequiredLabel>当前仓库</RequiredLabel>}');
  expect(moveSource).not.toContain('label={<RequiredLabel>对方仓库</RequiredLabel>}');
  expect(moveSource).toContain('disabled={!selectedLineKeys.length} onClick={deleteLines}');
  expect(moveSource).toContain('disabled={!selectedRowKeys.length} onClick={deleteRows}');
  expect(moveSource).toContain("getCheckboxProps: (record) => ({ disabled: record.status !== '草稿' })");

  expect(moveReceiveSource).toContain('<Typography.Title level={4} className="mb-0">移库接收</Typography.Title>');
  expect(moveReceiveSource).toContain('<DetailItem label="移入仓库"><Readonly>{row.toWarehouse}</Readonly></DetailItem>');
  expect(moveReceiveSource).toContain("title: '接收说明'");
  expect(moveReceiveSource).toContain("title: '接收仓管员'");
  expect(moveReceiveSource).toContain("title: '接收时间'");
  expect(moveReceiveSource).toContain("updateReceiveField(asset.id, 'assetMark'");
  expect(moveReceiveSource).toContain("updateReceiveField(asset.id, 'receiveDesc'");
  expect(moveReceiveSource).toContain('disabled={!selectedKeys.length} onClick={receive}');

  expect(transferSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(transferSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(transferSource).toContain("<PageTitle>{initialDocument ? '编辑转移单' : '创建转移单'}</PageTitle>");
  expect(transferSource).not.toContain('财务公司');
  expect(transferSource).toContain('<Button onClick={saveDraft}>保存草稿</Button>');
  expect(transferSource).toContain('disabled={!selectedRowKeys.length} onClick={deleteRows}');
  expect(transferSource).toContain("getCheckboxProps: (record) => ({ disabled: record.status !== '草稿' })");

  expect(warehouseWorkbenchSource).toContain('return <Typography.Title level={4} className="mb-0">{children}</Typography.Title>;');
  expect(warehouseWorkbenchSource).toContain("window.dispatchEvent(new CustomEvent('mmp:breadcrumb-change'");
  expect(warehouseWorkbenchSource).toContain('data-page-view-key="warehouse-workbench"');
  expect(warehouseWorkbenchSource).not.toContain('bg-[#1677ff]');
});
