import fs from 'fs';
import path from 'path';
import {
  getAssetMaintenanceRows,
  getConsumableMaintenanceRows,
  updateAssetMaintenanceRow,
} from '../../services/assetManagementService';

const tagPrintingSource = fs.readFileSync(path.join(__dirname, 'TagPrintingPage.js'), 'utf8');
const employeeQuerySource = fs.readFileSync(path.join(__dirname, 'EmployeeAssetInfoQueryPage.js'), 'utf8');
const assetMaintenanceSource = fs.readFileSync(path.join(__dirname, 'AssetMaintenancePage.js'), 'utf8');
const consumableMaintenanceSource = fs.readFileSync(path.join(__dirname, 'ConsumableMaintenancePage.js'), 'utf8');
const contractMaintenanceSource = fs.readFileSync(path.join(__dirname, 'ContractNumberMaintenancePage.js'), 'utf8');
const scrapListSource = fs.readFileSync(path.join(__dirname, 'ScrapPrototypeList.jsx'), 'utf8');
const scrapEditorSource = fs.readFileSync(path.join(__dirname, 'ScrapPrototypeEditor.jsx'), 'utf8');

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

test('标签打印支持上传资产标签号模板并选择份数批量打印', () => {
  expect(tagPrintingSource).toContain("import * as XLSX from 'xlsx'");
  expect(tagPrintingSource).toContain('标签批量打印模板.xlsx');
  expect(tagPrintingSource).toContain("String(matrix[0]?.[0] || '').trim() !== '资产标签号'");
  expect(tagPrintingSource).toContain('>批量打印</Button>');
  expect(tagPrintingSource).toContain('title="标签批量打印"');
  expect(tagPrintingSource).toContain('value={batchPrintCopies}');
  expect(tagPrintingSource).toContain('tagSet.has(String(row.assetTag))');
});

test('员工资产信息查询按资产维护权限过滤并用状态打开审批记录', () => {
  expect(employeeQuerySource).toContain("import { getAssetMaintenanceRows } from '../../services/assetManagementService';");
  expect(employeeQuerySource).toContain('sameMaintenanceScope(row, maintenanceScopes)');
  const assetColumnsStart = employeeQuerySource.indexOf('const assetColumns = [');
  const contractColumnsStart = employeeQuerySource.indexOf('const contractColumns = [', assetColumnsStart);
  const assetColumns = employeeQuerySource.slice(assetColumnsStart, contractColumnsStart);
  expect(assetColumns).not.toContain("title: '单据申请人'");
  expect(assetColumns).toContain('onClick={() => openApprovalRecord(record)}');
  const documentColumnsStart = employeeQuerySource.indexOf('const documentColumns = [');
  const documentColumnsEnd = employeeQuerySource.indexOf('const tabConfig = {', documentColumnsStart);
  const documentColumns = employeeQuerySource.slice(documentColumnsStart, documentColumnsEnd);
  expect(documentColumns).not.toContain("title: '部门'");
  expect(documentColumns).not.toContain("title: '操作'");
  expect(documentColumns).toContain('onClick={() => openApprovalRecord(record)}');
  expect(employeeQuerySource).toContain('title="审批记录"');
});

test('资产手动维护同步关联耗材位置成本中心和状态', () => {
  const asset = getAssetMaintenanceRows().find((row) => row.tag === 'NE3810');
  const before = getConsumableMaintenanceRows().find((row) => row.mainTag === 'NE3810');
  expect(asset).toBeTruthy();
  expect(before).toBeTruthy();

  updateAssetMaintenanceRow(asset.id, {
    costCenter: 'CC9999.同步测试',
    city: '上海',
    building: '上海新媒体办公区',
    floor: '12F',
    status: '在库-待处理',
  });

  const after = getConsumableMaintenanceRows().find((row) => row.id === before.id);
  expect(after.costCenter).toBe('CC9999.同步测试');
  expect(after.city).toBe('上海');
  expect(after.building).toBe('上海新媒体办公区');
  expect(after.floor).toBe('12F');
  expect(after.status).toBe('待处理');
  expect(after.transactionHistory.length).toBeGreaterThan(before.transactionHistory.length);
});

test('三类维护批量模板统一为空白不变非空覆盖', () => {
  expect(assetMaintenanceSource).toContain('资产标签号必填并用于定位既有资产；除资产标签号外，其余可修改字段不填表示不变，填写后覆盖原值。');
  expect(assetMaintenanceSource).not.toContain('为空时会将原字段覆盖为空');
  expect(assetMaintenanceSource).toContain('async function readAssetBatchFile(file)');
  expect(assetMaintenanceSource).toContain('batchUpdateAssetMaintenanceRows(updates)');
  expect(consumableMaintenanceSource).toContain('耗材标签号必填并用于定位既有卡片；其余可修改字段不填表示不变，填写后覆盖原值。');
  expect(consumableMaintenanceSource).toContain('async function readConsumableBatchFile(file)');
  expect(consumableMaintenanceSource).toContain('batchUpdateConsumableMaintenanceRows(batchValidation.updates || [])');
  expect(consumableMaintenanceSource).not.toContain("'板块', 'City'");
  expect(consumableMaintenanceSource).not.toContain("'耗材说明',");
  expect(contractMaintenanceSource).toContain('除标签号外，其余模板字段空白表示保留原值，不进行覆盖。');
});


test('资产管理菜单UI一致性关键规则保持统一', () => {
  expect(scrapListSource).toContain('<Title level={4} className="!mb-0">{config.title}</Title>');
  expect(scrapListSource).not.toContain('rowSelection={{');
  expect(scrapListSource).not.toContain('确认删除所选草稿');
  expect(scrapListSource).toContain('placeholder="请选择制单人"');
  expect(scrapListSource).toContain('placeholder="请选择公司"');
  expect(scrapListSource).toContain('footer={null}');

  expect(scrapEditorSource).not.toContain('<Steps');
  expect(scrapEditorSource).toContain("const [approvalOpinion, setApprovalOpinion] = useState('');");
  expect(scrapEditorSource).toContain("setApprovalOpinion('');");

  expect(employeeQuerySource).toContain('title={current.title}');
  expect(employeeQuerySource).toContain('extra={<Typography.Text type="secondary">共 {current.rows.length} 条</Typography.Text>}');
  expect(employeeQuerySource).not.toContain('请联系维护人员添加');

  expect(consumableMaintenanceSource).not.toContain('正式落数需接入 Excel 解析');
  expect(consumableMaintenanceSource).not.toContain('（原型）');
  expect(assetMaintenanceSource).not.toContain('（原型）');

  const batchPrintIndex = tagPrintingSource.indexOf("onClick={() => setBatchPrintOpen(true)}");
  const previewIndex = tagPrintingSource.indexOf("onClick={() => setPreviewMode(true)}");
  const exportIndex = tagPrintingSource.indexOf('onClick={handleExport}');
  expect(batchPrintIndex).toBeGreaterThan(-1);
  expect(previewIndex).toBeGreaterThan(batchPrintIndex);
  expect(exportIndex).toBeGreaterThan(previewIndex);
  expect(tagPrintingSource).toContain('disabled={filteredRows.length === 0}');
  expect(tagPrintingSource).toContain('disabled={selectedRowKeys.length === 0 && filteredRows.length === 0}');
});
