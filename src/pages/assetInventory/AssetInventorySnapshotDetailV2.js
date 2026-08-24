import React, { useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { CheckCircle2, Download, PlayCircle, ScanLine, Trash2, Upload } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { ASSET_ROWS, UNINCLUDED_ASSET_ROWS } from './mockData';
import { isInventoryRangeAllowed, useAssetInventoryVariant } from './AssetInventoryVariantContext';
import { importInventoryPhotoFiles } from './inventoryPhotoImportStore';

const RANGE_OPTIONS = ['库房', '公共', '机房', '员工'];
const EMPTY_FILTERS = { assetTag: '', category: '', status: '', owner: '', city: '', range: '' };
const PRE_INVENTORY_STATUSES = new Set(['快照生成', '生成盘点计划']);

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

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
    { title: '资产大类', dataIndex: 'category', width: 110 },
    { title: '资产小类', dataIndex: 'subCategory', width: 180 },
    { title: '资产说明', dataIndex: 'description', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'right' },
    { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: formatMoney },
    { title: 'EBS原值', dataIndex: 'ebsOriginalValue', width: 110, align: 'right', render: formatMoney },
    { title: '净值', dataIndex: 'netValue', width: 100, align: 'right', render: formatMoney },
    { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> },
    { title: 'NO位置', dataIndex: 'noLocation', width: 120 },
    { title: '盘点说明', dataIndex: 'inventoryNote', width: 160 },
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

function SnapshotQuery({ filters, setFilters, onQuery, rangeOptions }) {
  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value || '' }));
  return (
    <QueryBar onQuery={onQuery} onReset={() => { setFilters(EMPTY_FILTERS); onQuery(); }}>
      <QueryItem label="资产标签号"><Input value={filters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => update('assetTag', event.target.value)} /></QueryItem>
      <QueryItem label="资产类别"><Select value={filters.category || undefined} allowClear placeholder="请选择" options={['SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR'].map((value) => ({ label: value, value }))} onChange={(value) => update('category', value)} /></QueryItem>
      <QueryItem label="盘点状态"><Select value={filters.status || undefined} allowClear placeholder="请选择" options={['未盘', '已盘', '代盘', '报失', '盘亏'].map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
      <QueryItem label="资产责任人"><Input value={filters.owner} allowClear placeholder="请输入资产责任人" onChange={(event) => update('owner', event.target.value)} /></QueryItem>
      <QueryItem label="City"><Input value={filters.city} allowClear placeholder="请输入City" onChange={(event) => update('city', event.target.value)} /></QueryItem>
      <QueryItem label="盘点范围"><Select value={filters.range || undefined} allowClear placeholder="请选择" options={rangeOptions.map((value) => ({ label: value, value }))} onChange={(value) => update('range', value)} /></QueryItem>
    </QueryBar>
  );
}

function SnapshotAssetTab({ type, projectStatus, projectNo, rows, setRows, setOtherRows, messageApi }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const rangeOptions = RANGE_OPTIONS.filter((range) => allowedRanges.includes(range));
  const showMachineRoomFeatures = allowedRanges.includes('机房');
  const photoInputRef = useRef(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.assetTag, filters.assetTag)
    && includesText(row.category, filters.category)
    && includesText(row.inventoryStatus, filters.status)
    && includesText(row.owner, filters.owner)
    && includesText(row.city, filters.city)
    && includesText(row.inventoryRange, filters.range)
  )), [rows, filters]);

  const beforeStart = projectStatus === '快照生成';
  const during = projectStatus === '盘点中';
  const currentPageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const moveSelected = (targetExecute) => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择需要转移的资产');
      return;
    }
    const selected = new Set(selectedKeys);
    const moved = rows.filter((row) => selected.has(row.key)).map((row) => ({ ...row, executeInventory: targetExecute }));
    setRows((current) => current.filter((row) => !selected.has(row.key)));
    if (setOtherRows) setOtherRows((current) => [...current, ...moved]);
    setSelectedKeys([]);
    messageApi.success(`已转移 ${moved.length} 条资产`);
  };

  const confirmSelected = () => {
    if (!selectedKeys.length) {
      messageApi.warning('请先选择资产');
      return;
    }
    const selected = new Set(selectedKeys);
    setRows((current) => current.map((row) => selected.has(row.key) ? {
      ...row,
      inventoryStatus: '已盘',
      counter: '系统管理员',
      inventoryDate: dayjs().format('YYYY-MM-DD'),
    } : row));
    setSelectedKeys([]);
    messageApi.success('已批量确认盘点结果');
  };

  const handlePhotoImport = (event) => {
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
      <Button key="importMove" icon={<Upload size={14} />}>模板转移至未执行盘点</Button>,
    );
    if (showMachineRoomFeatures) {
      operations.push(<Button key="no" icon={<ScanLine size={14} />} onClick={() => messageApi.info('NO扫描数据同步逻辑待机房蓝图确认')}>同步NO扫描数据</Button>);
    }
  }
  if (type === 'execution' && during) {
    operations.push(
      <Button key="importResult" icon={<Upload size={14} />}>导入盘点结果</Button>,
      <Button key="importPhoto" icon={<Upload size={14} />} onClick={() => photoInputRef.current?.click()}>导入盘点照片</Button>,
      <Button key="exportResult" icon={<Download size={14} />}>导出盘点结果</Button>,
    );
  }
  if (type === 'notExecution' && beforeStart) {
    operations.push(
      <Button key="move" onClick={() => moveSelected(true)}>转移至执行盘点</Button>,
      <Button key="importMove" icon={<Upload size={14} />}>模板转移至执行盘点</Button>,
    );
  }
  if (type === 'notExecution' && during) {
    operations.push(
      <Button key="confirm" type="primary" icon={<CheckCircle2 size={14} />} onClick={confirmSelected}>批量确认</Button>,
      <Button key="importResult" icon={<Upload size={14} />}>导入盘点结果</Button>,
      <Button key="exportResult" icon={<Download size={14} />}>导出盘点结果</Button>,
    );
  }
  if (type === 'excluded') {
    operations.push(
      <Button key="toExecution">批量转移至执行盘点</Button>,
      <Button key="toNotExecution">批量转移至未执行盘点</Button>,
      <Button key="import" icon={<Upload size={14} />}>批量导入转移</Button>,
    );
  }
  operations.push(<Button key="export" icon={<Download size={14} />}>导出查询结果</Button>);

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
      {type === 'execution' && during && (
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoImport} />
      )}
      <SnapshotQuery filters={filters} setFilters={setFilters} onQuery={() => setCurrentPage(1)} rangeOptions={rangeOptions} />
      <div className="mb-3 flex justify-end"><Space wrap>{operations}</Space></div>
      <Table
        rowKey="key"
        size="small"
        bordered
        columns={makeAssetColumns({ includeNo: showMachineRoomFeatures })}
        dataSource={filteredRows}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, selections: selectionMenu }}
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

function SnapshotStats({ projectStatus, onOpenPlans }) {
  const { allowedRanges } = useAssetInventoryVariant();
  const assets = ASSET_ROWS
    .filter((row) => isInventoryRangeAllowed(row, allowedRanges))
    .map((row) => normalizeAssetForProjectStage(row, projectStatus));
  const total = assets.reduce((sum, row) => sum + row.quantity, 0);
  const execution = assets.filter((row) => row.executeInventory).reduce((sum, row) => sum + row.quantity, 0);
  const notExecution = total - execution;
  const counted = assets.filter((row) => ['已盘', '代盘'].includes(row.inventoryStatus)).reduce((sum, row) => sum + row.quantity, 0);
  const uncounted = assets.filter((row) => row.executeInventory && ['未盘', '报失', '盘亏'].includes(row.inventoryStatus)).reduce((sum, row) => sum + row.quantity, 0);
  const lost = assets.filter((row) => row.inventoryStatus === '盘亏').reduce((sum, row) => sum + row.quantity, 0);
  const rate = execution ? Number(((counted / execution) * 100).toFixed(1)) : 0;
  const generatedPlan = ['生成盘点计划', '盘点中', '盘点关闭'].includes(projectStatus);

  return (
    <Card size="small" title={<CardTitle>快照清单统计</CardTitle>}>
      <div className="grid grid-cols-4 gap-4">
        <Statistic title="盘点资产总量" value={total} />
        <Statistic title="执行盘点数量" value={execution} />
        <Statistic title="未执行盘点数量" value={notExecution} />
        {generatedPlan && <Statistic title="已盘数量" value={counted} />}
        {generatedPlan && <Statistic title="未盘数量" value={uncounted} />}
        {generatedPlan && <Statistic title="盘亏数量" value={lost} />}
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
}) {
  const { allowedRanges } = useAssetInventoryVariant();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const initialProjectStatus = project?.status === '草稿' ? '快照生成' : (project?.status || '快照生成');
  const [projectStatus, setProjectStatus] = useState(initialProjectStatus);
  const [executionRows, setExecutionRows] = useState(() => ASSET_ROWS
    .filter((row) => row.executeInventory && isInventoryRangeAllowed(row, allowedRanges))
    .map((row) => normalizeAssetForProjectStage(row, initialProjectStatus)));
  const [notExecutionRows, setNotExecutionRows] = useState(() => ASSET_ROWS
    .filter((row) => !row.executeInventory && isInventoryRangeAllowed(row, allowedRanges))
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
        messageApi.success('已按子公司、一级部门、City、盘点范围默认拆分生成盘点计划');
        onGenerateDefault?.();
      },
      onCancel: () => onGenerateCustom?.(),
    });
  };

  const handleDeleteSnapshot = () => {
    Modal.confirm({
      title: '删除快照',
      content: '删除快照后项目状态将恢复为草稿，并返回生成快照之前的状态。',
      okText: '删除快照',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        messageApi.success('快照已删除，项目已恢复为草稿状态');
        onBack?.();
      },
    });
  };

  const tabItems = [
    { key: 'summary', label: '快照清单统计', children: <SnapshotStats projectStatus={projectStatus} onOpenPlans={onOpenPlans} /> },
    {
      key: 'execution',
      label: '执行盘点资产清单',
      children: <SnapshotAssetTab type="execution" projectStatus={projectStatus} projectNo={project?.projectNo || ''} rows={executionRows} setRows={setExecutionRows} setOtherRows={setNotExecutionRows} messageApi={messageApi} />,
    },
    {
      key: 'notExecution',
      label: '未执行盘点资产清单',
      children: <SnapshotAssetTab type="notExecution" projectStatus={projectStatus} projectNo={project?.projectNo || ''} rows={notExecutionRows} setRows={setNotExecutionRows} setOtherRows={setExecutionRows} messageApi={messageApi} />,
    },
    {
      key: 'excluded',
      label: '未包含资产清单',
      children: <SnapshotAssetTab type="excluded" projectStatus={projectStatus} projectNo={project?.projectNo || ''} rows={excludedRows} setRows={setExcludedRows} messageApi={messageApi} />,
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
          <Button icon={<Download size={14} />} onClick={() => messageApi.success('快照导出已触发，导出模板包含“是否执行盘点”字段')}>快照导出</Button>
          <Button onClick={onBack}>返回</Button>
        </Space>
      </div>
    </Space>
  );
}