import fs from 'fs';
import path from 'path';

const inboundSource = fs.readFileSync(path.join(__dirname, 'InboundPage.js'), 'utf8');
const outboundSource = fs.readFileSync(path.join(__dirname, 'OutboundPage.js'), 'utf8');

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
