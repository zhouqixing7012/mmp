import fs from 'fs';
import path from 'path';

const inboundSource = fs.readFileSync(path.join(__dirname, 'InboundPage.js'), 'utf8');
const outboundSource = fs.readFileSync(path.join(__dirname, 'OutboundPage.js'), 'utf8');
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


test('资产接收维护页和详情页保留制单信息且说明字段统一为资产说明', () => {
  const maintenanceStart = assetReceiptSource.indexOf('const maintenanceColumns = [');
  const receiptDetailStart = assetReceiptSource.indexOf("if (view === 'receiptDetail' && activeReceipt)");
  const maintenanceSource = assetReceiptSource.slice(maintenanceStart, receiptDetailStart);
  const receiptDetailSource = assetReceiptSource.slice(receiptDetailStart);

  expect(maintenanceSource).toContain('<DetailItem label="制单人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>');
  expect(maintenanceSource).toContain('<DetailItem label="制单时间"><Readonly>{activeReceipt.createdAt}</Readonly></DetailItem>');
  expect(receiptDetailSource).toContain('<DetailItem label="制单人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>');
  expect(receiptDetailSource).toContain('<DetailItem label="制单时间"><Readonly>{activeReceipt.createdAt}</Readonly></DetailItem>');
  expect(assetReceiptSource).toContain("{ title: '资产说明', dataIndex: 'materialDesc', width: 240 }");
  expect(assetReceiptSource).toContain("{ title: '资产说明', dataIndex: 'materialDesc', width: 220 }");
  expect(assetReceiptSource).toContain('<DetailItem label="资产说明"><Typography.Text>{scanTargetAsset?.materialDesc || \'\'}</Typography.Text></DetailItem>');
  expect(assetReceiptSource).not.toContain("{ title: '物料说明', dataIndex: 'materialDesc'");
  expect(assetReceiptSource).not.toContain("{ title: '物资说明', dataIndex: 'materialDesc'");
  expect(assetReceiptSource).not.toContain('label="物资说明"');
});

test('耗材接收详情按固定15字段展示且低值耐用品维护页追加制单信息', () => {
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

  expect(cardSource).toContain('{showCreationInfo && (');
  expect(cardSource.indexOf('label="制单人"')).toBeGreaterThan(cardSource.indexOf('label="申请批次"'));
  expect(consumableReceiptSource.match(/<ReceiptInfoCard receipt=\{activeReceipt\} \/>/g) || []).toHaveLength(1);
  expect(consumableReceiptSource.match(/<ReceiptInfoCard receipt=\{activeReceipt\} showCreationInfo \/>/g) || []).toHaveLength(1);

  const poDetailStart = consumableReceiptSource.indexOf("if (view === 'poDetail' && activePO)");
  const receiptListStart = consumableReceiptSource.indexOf("if (view === 'receiptList')");
  const poDetailSource = consumableReceiptSource.slice(poDetailStart, receiptListStart);
  expect(poDetailSource.match(/label="采购员联系电话"/g) || []).toHaveLength(1);
  expect(poDetailSource).not.toContain('label="采购单位联系电话"');
});
