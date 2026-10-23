import { inventoryRemark } from './inventoryRemark';
import * as XLSX from 'xlsx';
import { parseSnapshotTransferRows } from './inventorySnapshotTransfer';
import { isSnapshotExecutionAsset, isSnapshotNonExecutionAsset } from './inventorySnapshotAssets';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Modal,
  Space,
  Select,
  Statistic,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { calculateInventorySnapshotStats } from './inventorySnapshotStats';
import { serializeInventoryAssetExport, serializeInventorySnapshotExport } from './inventoryAssetExport';
import { inventoryProjectCloseBlockReason } from './inventoryCloseRules';
import { CheckCircle2, Download, PlayCircle, ScanLine, Trash2, Upload, XCircle } from 'lucide-react';
import InventoryAssetQuery from './InventoryAssetQuery';
import { EMPTY_INVENTORY_ASSET_QUERY, filterInventoryAssets } from './inventoryAssetQuery';
import { formatAssetCategory } from '../../components/AssetQueryControls';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { ASSET_ROWS, UNINCLUDED_ASSET_ROWS } from './mockData';
import { isInventoryRangeAllowed, useAssetInventoryVariant } from './AssetInventoryVariantContext';
import { importInventoryPhotoFiles } from './inventoryPhotoImportStore';

const RANGE_OPTIONS = ['库房', '公共', '机房', '员工'];
const EMPTY_FILTERS = EMPTY_INVENTORY_ASSET_QUERY;
const PRE_INVENTORY_STATUSES = new Set(['快照生成', '生成盘点计划']);

function formatMoney(value) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function normalizeAssetForProjectStage(asset, projectStatus) {
  if (!PRE_INVENTORY_STATUSES.has(projectStatus)) return { ...asset };
  return {
    ...asset,
    inventoryStatus: '未盘',
    counter: '-',
    inventoryDate: '-',
    inventoryNote: '-',
    importMode: '-',
  };
}

function PageTitle({ children }) {
  return <Typography.Title level={4} style={{ margin: 0 }}>{children}</Typography.Title>;
}

function CardTitle({ children }) {
  return <div className="flex items-center gap-2"><span className="h-4 w-1 rounded bg-[#1677ff]" /><span>{children}</span></div>;
}

function ProjectInfoCard({ project }) {
  const showSamplingFields = project?.projectType !== '初盘';
  return (
    <Card size="small" title={<CardTitle>盘点项目信息</CardTitle>}>
      <DetailGrid columns={3}>
        <DetailItem label="项目编号">{project?.projectNo || '-'}</DetailItem>
        <DetailItem label="项目名称">{project?.projectName || '-'}</DetailItem>
        <DetailItem label="项目类型">{project?.projectType || '-'}</DetailItem>
        <DetailItem label="盘点开始时间">{project?.startDate || '-'}</DetailItem>
        <DetailItem label="盘点结束时间">{project?.endDate || '-'}</DetailItem>
        <DetailItem label="项目状态"><StatusTag value={project?.status || '快照生成'} /></DetailItem>
        <DetailItem label="盘点类型">{project?.inventoryType || '-'}</DetailItem>
        <DetailItem label="盘点期间">{project?.period || '-'}</DetailItem>
        <DetailItem label="快照生成日期">{project?.snapshotTime || '-'}</DetailItem>
        {showSamplingFields && <DetailItem label="初盘项目">{project?.initialProjectNo || '-'}</DetailItem>}
        {showSamplingFields && <DetailItem label="抽样方式">{project?.samplingMode || '-'}</DetailItem>}
        {showSamplingFields && <DetailItem label="比例">{project?.samplingRatio || '-'}</DetailItem>}
        {project?.projectType === '复盘' && project?.samplingMode === '百分比' && <><DetailItem label="净值大于多少元必盘">{project.mandatoryNetValueAbove ?? '-'}</DetailItem><DetailItem label="净值前多少百分比必盘">{project.mandatoryNetValueTopPercent == null ? '-' : `${project.mandatoryNetValueTopPercent}%`}</DetailItem></>}
        <DetailItem label="盘点说明" span={3}>{project?.description || '-'}</DetailItem>
      </DetailGrid>
    </Card>
  );
}

function makeAssetColumns({ includeNo = true } = {}) {
  const columns = [
    { title: '盘点范围', dataIndex: 'inventoryRange', width: 100, fixed: 'left' },
    { title: '盘点状态', dataIndex: 'inventoryStatus', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '资产盘点人', dataIndex: 'counter', width: 130 },
    { title: '盘点日期', dataIndex: 'inventoryDate', width: 120 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '序列号', dataIndex: 'serialNo', width: 140 },
    { title: '资产类别', key: 'assetCategory', width: 240, render: (_, row) => formatAssetCategory(row) },
    { title: '资产说明', dataIndex: 'description', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'right' },
    { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: formatMoney },
    { title: 'EBS原值', dataIndex: 'ebsOriginalValue', width: 110, align: 'right', render: formatMoney },
    { title: '净值', dataIndex: 'netValue', width: 100, align: 'right', render: formatMoney },
    { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> },
    { title: 'NO位置', dataIndex: 'noLocation', width: 120 },
    { title: '盘点备注', key: 'inventoryRemark', width: 160, render: (_, row) => inventoryRemark(row) },
    { title: '使用说明', dataIndex: 'useDescription', width: 160 },
    { title: '备注', dataIndex: 'remark', width: 130 },
    { title: '资产责任人', dataIndex: 'owner', width: 150 },
    { title: '责任人部门', dataIndex: 'ownerDept', width: 200 },
    { title: '责任人职级', dataIndex: 'ownerLevel', width: 110 },
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: 'Building', dataIndex: 'building', width: 170 },
    { title: 'Floor', dataIndex: 'floor', width: 90 },
    { title: '子公司', dataIndex: 'organization', width: 120 },
    { title: '成本中心', dataIndex: 'costCenter', width: 180 },
    { title: '启用日期', dataIndex: 'enableDate', width: 120 },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 140 },
  ];

  if (includeNo) {
    columns.push(
      { title: 'NO扫描资产标签号', dataIndex: 'noScanAssetTag', width: 160 },
      { title: 'NO扫描序列号', dataIndex: 'noScanSerialNo', width: 150 },
      { title: 'NO扫描品牌', dataIndex: 'noScanBrand', width: 120 },
      { title: 'NO扫描型号', dataIndex: 'noScanModel', width: 140 },
      { title: 'NO扫描位置', dataIndex: 'noScanLocation', width: 190 },
      { title: 'NO扫描数据差异', dataIndex: 'noScanDiff', width: 240 },
    );
  }

  return columns;
}

export function SnapshotAssetTab({ project, type, projectStatus, projectNo, rows, setRows, setOtherRows, onMoveRows, onConfirmRows, messageApi, machineRoomProject = false }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const rangeOptions = RANGE_OPTIONS.filter((range) => allowedRanges.includes(range));
  const showMachineRoomFeatures = machineRoomProject && allowedRanges.includes('机房');
  const photoInputRef = useRef(null);
  const transferInputRef = useRef(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredRows = useMemo(() => filterInventoryAssets(rows, filters), [rows, filters]);

  const exportFilteredRows = () => {
    const { csv, missingFields } = serializeInventoryAssetExport(filteredRows, { project });
    if (missingFields.length) messageApi.warning(`演示数据缺少${missingFields.join('、')}，对应单元格为空`);
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectNo}-${type === 'execution' ? '执行盘点资产清单' : type === 'notExecution' ? '未执行盘点资产清单' : '未包含资产清单'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const projectClosed = projectStatus === '盘点关闭';
  const beforeStart = PRE_INVENTORY_STATUSES.has(projectStatus);
  const during = projectStatus === '盘点中';
  const currentPageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const latestStatus = useRef(projectStatus);
  latestStatus.current = projectStatus;
  const latestRows = useRef(rows);
  latestRows.current = rows;
  const transferAllowed = () => {
    if (PRE_INVENTORY_STATUSES.has(latestStatus.current)) return true;
    messageApi.warning(latestStatus.current === '盘点关闭' ? '项目已关闭，不能转移资产' : '计划已启动，不能调整盘点范围');
    return false;
  };

  const moveRows = (sourceRows, targetExecute) => {
    if (!transferAllowed()) return;
    if (!sourceRows.length) { messageApi.warning('当前查询没有可转移的资产'); return; }
    const selected = new Set(sourceRows.map(row => row.key));
    const moved = sourceRows.map(row => ({ ...row, executeInventory: targetExecute }));
    if (onMoveRows) onMoveRows(selected, moved, targetExecute);
    else {
      setRows(current => current.filter(row => !selected.has(row.key)));
      if (setOtherRows) setOtherRows(current => [...current.filter(row => !selected.has(row.key)), ...moved]);
    }
    setSelectedKeys([]);
    messageApi.success(`已转移 ${moved.length} 条资产`);
  };

  const moveSelected = (targetExecute) => {
    if (!transferAllowed()) return;
    if (!selectedKeys.length) { messageApi.warning('请先选择需要转移的资产'); return; }
    const selected = new Set(selectedKeys);
    moveRows(rows.filter(row => selected.has(row.key)), targetExecute);
  };
  // 查询转移使用已生效条件下的完整结果，分页和勾选不改变处理范围。
  const moveByQuery = (targetExecute) => moveRows(filteredRows, targetExecute);
  const openTransferImport = (target) => {
    if (!transferAllowed()) return;
    setTransferTarget(target); setTransferOpen(true);
  };
  const downloadTransferTemplate = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['资产标签号']]), '转移资产');
    XLSX.writeFile(workbook, '快照资产转移模板.xlsx');
  };
  const importTransfers = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || !transferAllowed()) return;
    setTransferring(true);
    try {
      if (!onMoveRows) throw new Error('当前资产清单缺少转移上下文');
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('请上传xlsx、xls或csv文件');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '', raw: false });
      if (!transferAllowed()) return;
      const matched = parseSnapshotTransferRows(matrix, latestRows.current);
      const moved = matched.map(row => ({ ...row, executeInventory: transferTarget }));
      onMoveRows?.(new Set(matched.map(row => row.key)), moved, transferTarget);
      setSelectedKeys([]); setTransferOpen(false);
      messageApi.success(`已转移 ${matched.length} 条资产`);
    } catch (error) { messageApi.warning(error.message); }
    finally { setTransferring(false); }
  };

  const confirmSelected = () => {
    if (projectClosed) { messageApi.info('项目已关闭，内容只读'); return; }
    if (!selectedKeys.length) {
      messageApi.warning('请先选择资产');
      return;
    }
    const selected = new Set(selectedKeys);
    const updated = rows.map((row) => selected.has(row.key) ? {
      ...row,
      inventoryStatus: '已盘',
      counter: '系统管理员',
      inventoryDate: dayjs().format('YYYY-MM-DD'),
    } : row);
    setRows(updated);
    onConfirmRows?.(updated);
    setSelectedKeys([]);
    messageApi.success('已批量确认盘点结果');
  };

  const handlePhotoImport = (event) => {
    if (!showMachineRoomFeatures || latestStatus.current !== '盘点中') { event.target.value = ''; messageApi.warning('当前项目或状态不允许导入盘点照片'); return; }
    if (projectClosed) { event.target.value = ''; messageApi.info('项目已关闭，内容只读'); return; }
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const result = importInventoryPhotoFiles({ projectNo, files, assets: rows });
    if (!result.matched.length) {
      if (result.unmatched.length) {
        const tags = result.unmatched.map((item) => item.assetTag).filter(Boolean);
        Modal.warning({
          title: '资产标签号未匹配',
          content: (
            <Space direction="vertical" size={6}>
              <Typography.Text>文件名格式已识别，但其中的资产标签号未在当前“执行盘点资产清单”中找到，请核对标签号是否正确。</Typography.Text>
              {!!tags.length && <Typography.Text type="secondary">未匹配标签号：{tags.slice(0, 5).join('、')}{tags.length > 5 ? ' 等' : ''}</Typography.Text>}
              <Typography.Text type="secondary">支持：资产标签号.jpg、资产标签号_整体.jpg、资产标签号_部分.jpg、资产标签号_局部.jpg。</Typography.Text>
            </Space>
          ),
        });
      } else {
        Modal.warning({
          title: '未识别到可导入的图片',
          content: '请选择 JPG、PNG、WEBP 等图片文件后重新导入。',
        });
      }
      return;
    }

    if (!result.unmatched.length && !result.invalid.length) {
      messageApi.success(`已导入 ${result.matched.length} 张盘点照片，并按资产标签号完成匹配，可前往图片审核处理`);
      return;
    }

    Modal.info({
      title: '盘点照片导入完成',
      content: (
        <Space direction="vertical" size={6}>
          <Typography.Text>成功匹配：{result.matched.length} 张</Typography.Text>
          {!!result.unmatched.length && <Typography.Text type="warning">未匹配：{result.unmatched.length} 张（文件名中的资产标签号不在当前执行盘点资产清单）</Typography.Text>}
          {!!result.invalid.length && <Typography.Text type="warning">非图片文件：{result.invalid.length} 个</Typography.Text>}
          <Typography.Text type="secondary">命名支持：资产标签号.jpg、资产标签号_整体.jpg、资产标签号_部分.jpg、资产标签号_局部.jpg。</Typography.Text>
        </Space>
      ),
    });
  };

  const operations = [];
  if (type === 'execution' && beforeStart) {
    operations.push(
      <Button key="move" onClick={() => moveSelected(false)}>转移至未执行盘点</Button>,
      <Button key="queryMove" onClick={() => moveByQuery(false)}>按查询条件转移至未执行盘点</Button>,
      <Button key="importMove" icon={<Upload size={14} />} onClick={() => openTransferImport(false)}>模板转移至未执行盘点</Button>,
    );
    if (showMachineRoomFeatures) {
      operations.push(<Button key="no" icon={<ScanLine size={14} />} onClick={() => messageApi.info('NO扫描数据同步逻辑待机房蓝图确认')}>同步NO扫描数据</Button>);
    }
  }
  if (type === 'execution' && during) {
    operations.push(
      <Button key="importResult" icon={<Upload size={14} />} onClick={() => messageApi.warning('盘点结果导入模板尚未配置，暂不能导入')}>导入盘点结果</Button>,
    );
  }
  if (type === 'execution' && during && showMachineRoomFeatures) {
    operations.push(<Button key="importPhoto" icon={<Upload size={14} />} onClick={() => photoInputRef.current?.click()}>导入盘点照片</Button>);
  }
  if (type === 'notExecution' && beforeStart) {
    operations.push(
      <Button key="move" onClick={() => moveSelected(true)}>转移至执行盘点</Button>,
      <Button key="queryMove" onClick={() => moveByQuery(true)}>按查询条件转移至执行盘点</Button>,
      <Button key="importMove" icon={<Upload size={14} />} onClick={() => openTransferImport(true)}>模板转移至执行盘点</Button>,
    );
  }
  if (type === 'notExecution' && during) {
    operations.push(
      <Button key="confirm" type="primary" icon={<CheckCircle2 size={14} />} onClick={confirmSelected}>批量确认</Button>,
      <Button key="importResult" icon={<Upload size={14} />} onClick={() => messageApi.warning('盘点结果导入模板尚未配置，暂不能导入')}>导入盘点结果</Button>,
    );
  }
  if (type === 'excluded' && beforeStart) {
    operations.push(
      <Button key="toExecution" onClick={() => moveSelected(true)}>批量转移至执行盘点</Button>,
      <Button key="toNotExecution" onClick={() => moveSelected(false)}>批量转移至未执行盘点</Button>,
      <Button key="queryToExecution" onClick={() => moveByQuery(true)}>按查询条件转移至执行盘点</Button>,
      <Button key="queryToNotExecution" onClick={() => moveByQuery(false)}>按查询条件转移至未执行盘点</Button>,
      <Button key="import" icon={<Upload size={14} />} onClick={() => openTransferImport(true)}>批量导入转移</Button>,
    );
  }
  operations.push(<Button key="export" icon={<Download size={14} />} onClick={exportFilteredRows}>导出</Button>);

  const selectionMenu = [
    {
      key: 'current-page',
      text: '选中当页',
      onSelect: () => setSelectedKeys(currentPageRows.map((row) => row.key)),
    },
    {
      key: 'all',
      text: '选中全部',
      onSelect: () => setSelectedKeys(filteredRows.map((row) => row.key)),
    },
  ];

  return (
    <Card size="small">
      <input aria-label="转移资产文件" ref={transferInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={importTransfers} />
      <Modal open={transferOpen} title="批量导入转移" onCancel={() => setTransferOpen(false)} footer={<Button onClick={() => setTransferOpen(false)}>返回</Button>}>
        <Space direction="vertical">
          {type === 'excluded' && <Select value={transferTarget} onChange={setTransferTarget} options={[{ value: true, label: '执行盘点资产清单' }, { value: false, label: '未执行盘点资产清单' }]} />}
          <Space><Button onClick={downloadTransferTemplate}>下载模板</Button><Button type="primary" loading={transferring} onClick={() => transferInputRef.current?.click()}>选择文件并转移</Button></Space>
        </Space>
      </Modal>
      {type === 'execution' && during && showMachineRoomFeatures && (
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoImport} />
      )}
      <InventoryAssetQuery rows={rows} filters={draftFilters} onChange={setDraftFilters} started={!PRE_INVENTORY_STATUSES.has(projectStatus)} onQuery={() => { setFilters({ ...draftFilters }); setSelectedKeys([]); setCurrentPage(1); }} onReset={() => { setDraftFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedKeys([]); setCurrentPage(1); }} rangeOptions={rangeOptions} />
      <div className="mb-3 flex justify-end"><Space wrap>{operations}</Space></div>
      <Table
        rowKey="key"
        size="small"
        bordered
        columns={makeAssetColumns({ includeNo: showMachineRoomFeatures })}
        dataSource={filteredRows}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, selections: projectClosed ? false : selectionMenu, getCheckboxProps: () => ({ disabled: projectClosed }) }}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: currentPage,
          pageSize,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />
    </Card>
  );
}

function SnapshotStats({ projectStatus, onOpenPlans, executionRows, notExecutionRows }) {
  const { total, execution, notExecution, counted, uncounted, rate } = calculateInventorySnapshotStats(executionRows, notExecutionRows);
  const generatedPlan = ['生成盘点计划', '盘点中', '盘点关闭'].includes(projectStatus);

  return (
    <Card size="small" title={<CardTitle>快照清单统计</CardTitle>}>
      <div className="grid grid-cols-4 gap-4">
        <Statistic title="盘点资产总量" value={total} />
        <Statistic title="执行盘点数量" value={execution} />
        <Statistic title="未执行盘点数量" value={notExecution} />
        {generatedPlan && <Statistic title="已盘数量" value={counted} />}
        {generatedPlan && <Statistic title="未盘数量" value={uncounted} />}
        {generatedPlan && <Statistic title="盘到率（%）" value={rate} suffix="%" />}
      </div>
      {generatedPlan && <div className="mt-4 flex justify-end"><Button type="link" onClick={onOpenPlans}>查看计划清单</Button></div>}
    </Card>
  );
}

export default function AssetInventorySnapshotDetailV2({
  project,
  onBack,
  onOpenPlans,
  onGenerateDefault,
  onGenerateCustom,
  onCloseProject,
  onDeleteSnapshot,
  assets = ASSET_ROWS,
  onSnapshotRowsChange,
  getCloseBlockReason = inventoryProjectCloseBlockReason,
}) {
  const { allowedRanges: configuredRanges } = useAssetInventoryVariant();
  const allowedRanges = project?.scopeRanges?.length ? project.scopeRanges : configuredRanges;
  const machineRoomProject = allowedRanges.includes('机房') && (project?.scopeRanges?.includes('机房') || assets.some(asset => asset.inventoryRange === '机房'));
  const isSystemRoomInitial = project?.projectType === '初盘' && project?.generationSource === '系统生成' && project?.scopeRanges?.includes('机房');
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const initialProjectStatus = project?.status === '草稿' ? '快照生成' : (project?.status || '快照生成');
  const [projectStatus, setProjectStatus] = useState(initialProjectStatus);
  useEffect(() => setProjectStatus(initialProjectStatus), [initialProjectStatus]);
  const canManuallyClose = !['盘点关闭', '关闭'].includes(projectStatus);
  const handleCloseProject = () => {
    const closeBlockReason = getCloseBlockReason(project);
    if (closeBlockReason) { messageApi.warning(closeBlockReason); return; }
    Modal.confirm({
      title: '确认关闭盘点项目？',
      content: `项目关闭后，移动端待办将结束，不能继续扫码或提交。未盘资产 ${project?.unscannedCount ?? '待计算'} 项，待提交结果 ${project?.pendingSubmissionCount ?? '待计算'} 项；两者不阻止关闭。`,
      okText: '关闭项目',
      cancelText: '取消',
      onOk: () => {
        const latestBlock = getCloseBlockReason({ ...project, status: projectStatus });
        if (latestBlock) { messageApi.warning(latestBlock); return; }
        setProjectStatus('盘点关闭');
        onCloseProject?.({ ...project, status: '盘点关闭', closedBy: '手动' });
        messageApi.success(project?.projectType === '初盘' ? '初盘项目已关闭，并通过服务号通知财务人员' : '盘点项目已关闭');
      },
    });
  };
  useEffect(() => {
    if (!isSystemRoomInitial || projectStatus !== '盘点中' || !(Number(project?.progress) >= 100)) return;
    setProjectStatus('盘点关闭');
    onCloseProject?.({ ...project, status: '盘点关闭', closedBy: '系统' });
    messageApi.success('机房初盘进度达到100%，项目已自动关闭，并通过服务号通知财务人员');
  }, [isSystemRoomInitial, projectStatus, project?.progress, onCloseProject, project]);
  const [executionRows, setExecutionRows] = useState(() => assets
    .filter((row) => isInventoryRangeAllowed(row, allowedRanges) && isSnapshotExecutionAsset(row, project))
    .map((row) => normalizeAssetForProjectStage(row, initialProjectStatus)));
  const [notExecutionRows, setNotExecutionRows] = useState(() => assets
    .filter((row) => isInventoryRangeAllowed(row, allowedRanges) && isSnapshotNonExecutionAsset(row, project))
    .map((row) => normalizeAssetForProjectStage(row, initialProjectStatus)));
  const [excludedRows, setExcludedRows] = useState(() => UNINCLUDED_ASSET_ROWS
    .filter((row) => isInventoryRangeAllowed(row, allowedRanges))
    .map((row) => normalizeAssetForProjectStage(row, initialProjectStatus)));

  const generatePlans = () => {
    Modal.confirm({
      title: '提示',
      content: '是否按照默认方式生成盘点计划？',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        setProjectStatus('生成盘点计划');
        messageApi.success('已按子公司、盘点范围默认分组生成盘点计划');
        onGenerateDefault?.();
      },
      onCancel: () => onGenerateCustom?.(),
    });
  };

  const exportSnapshot = () => {
    const rows = [...executionRows.map((asset) => ({ ...asset, executeInventory: true })), ...notExecutionRows.map((asset) => ({ ...asset, executeInventory: false }))];
    const { csv, missingFields } = serializeInventorySnapshotExport(rows, { project });
    if (missingFields.length) messageApi.warning(`演示数据缺少${missingFields.join('、')}，对应单元格为空`);
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.projectNo}-快照.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSnapshot = () => {
    if (!['快照生成', '生成盘点计划'].includes(projectStatus)) return;
    if (!onDeleteSnapshot) return;
    Modal.confirm({
      title: '删除快照',
      content: '删除快照并撤销未启动的草稿计划，项目恢复为草稿编辑状态。',
      okText: '删除快照',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        if (onDeleteSnapshot({ ...project, status: projectStatus }) === false) {
          messageApi.warning('计划已启动或已有后续结果，不能删除快照');
          return;
        }
        messageApi.success('快照已撤销，项目已恢复为草稿状态');
      },
    });
  };

  const moveSnapshotRows = (fromExecution, selected, moved) => {
    if (!PRE_INVENTORY_STATUSES.has(projectStatus)) throw new Error('计划已启动或项目关闭，不能调整盘点范围');
    const nextExecution = fromExecution ? executionRows.filter(row => !selected.has(row.key)) : [...executionRows, ...moved];
    const nextNotExecution = fromExecution ? [...notExecutionRows, ...moved] : notExecutionRows.filter(row => !selected.has(row.key));
    setExecutionRows(nextExecution); setNotExecutionRows(nextNotExecution);
    onSnapshotRowsChange?.(nextExecution, nextNotExecution);
  };

  const moveExcludedRows = (selected, moved, targetExecute) => {
    if (!PRE_INVENTORY_STATUSES.has(projectStatus)) throw new Error('计划已启动或项目关闭，不能调整盘点范围');
    const nextExcluded = excludedRows.filter(row => !selected.has(row.key));
    const nextExecution = targetExecute ? [...executionRows, ...moved] : executionRows;
    const nextNotExecution = targetExecute ? notExecutionRows : [...notExecutionRows, ...moved];
    setExcludedRows(nextExcluded); setExecutionRows(nextExecution); setNotExecutionRows(nextNotExecution);
    onSnapshotRowsChange?.(nextExecution, nextNotExecution);
  };

  const tabItems = [
    { key: 'summary', label: '快照清单统计', children: <SnapshotStats projectStatus={projectStatus} onOpenPlans={onOpenPlans} executionRows={executionRows} notExecutionRows={notExecutionRows} /> },
    {
      key: 'execution',
      label: '执行盘点资产清单',
      children: <SnapshotAssetTab project={project} machineRoomProject={machineRoomProject} type="execution" projectStatus={projectStatus} projectNo={project?.projectNo || ''} rows={executionRows} setRows={setExecutionRows} setOtherRows={setNotExecutionRows} onMoveRows={(selected, moved) => moveSnapshotRows(true, selected, moved)} messageApi={messageApi} />,
    },
    {
      key: 'notExecution',
      label: '未执行盘点资产清单',
      children: <SnapshotAssetTab project={project} machineRoomProject={machineRoomProject} type="notExecution" projectStatus={projectStatus} projectNo={project?.projectNo || ''} rows={notExecutionRows} setRows={setNotExecutionRows} setOtherRows={setExecutionRows} onMoveRows={(selected, moved) => moveSnapshotRows(false, selected, moved)} onConfirmRows={(updated) => onSnapshotRowsChange?.(executionRows, updated)} messageApi={messageApi} />,
    },
    {
      key: 'excluded',
      label: '未包含资产清单',
      children: <SnapshotAssetTab project={project} machineRoomProject={machineRoomProject} type="excluded" projectStatus={projectStatus} projectNo={project?.projectNo || ''} rows={excludedRows} setRows={setExcludedRows} onMoveRows={moveExcludedRows} messageApi={messageApi} />,
    },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>盘点项目详情</PageTitle>
      <ProjectInfoCard project={{ ...project, status: projectStatus }} />
      <Tabs items={tabItems} defaultActiveKey="summary" />

      <div className="flex justify-center pb-2">
        <Space wrap>
          {projectStatus === '快照生成' && <Button type="primary" icon={<PlayCircle size={14} />} onClick={generatePlans}>生成盘点计划</Button>}
          {['快照生成', '生成盘点计划'].includes(projectStatus) && <Button danger icon={<Trash2 size={14} />} onClick={handleDeleteSnapshot}>删除快照</Button>}
          <Button icon={<Download size={14} />} onClick={exportSnapshot}>快照导出</Button>
          {canManuallyClose && <Button danger icon={<XCircle size={14} />} onClick={handleCloseProject}>关闭项目</Button>}
          <Button onClick={onBack}>返回</Button>
        </Space>
      </div>
    </Space>
  );
}
