import React, { useMemo, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Upload,
  message,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  ACCOUNTING_ASSET_POOL,
  DISPOSAL_ASSET_POOL,
  SCRAP_ASSET_POOL,
  SCRAP_TYPE_OPTIONS,
  filterAssetsForScope,
  money,
} from './scrapPrototypeData';
import {
  mockCostCenters,
  mockPlates,
} from '../../mock/businessRulesMock';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';

const companyOptions = Array.from(
  new Set(warehouseCatalog.map((item) => item.company).filter(Boolean)),
).map((value) => ({ label: value, value }));

const plateOptions = mockPlates.map((item) => ({
  label: item.desc,
  value: item.desc,
}));

const costCenterOptions = mockCostCenters.map((item) => ({
  label: item.desc,
  value: item.desc,
}));

const warehouseOptions = warehouseCatalog.map((item) => ({
  label: `${item.warehouseCode}.${item.warehouseDescription}`,
  value: `${item.warehouseCode}.${item.warehouseDescription}`,
}));

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

function displayValue(value) {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}

export default function ScrapPrototypeAssetTable({
  type,
  assetScope,
  assets,
  readOnly,
  onChange,
  onReplace,
  scrapMethod,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const pickerAssets = useMemo(() => {
    if (type === 'accounting') return ACCOUNTING_ASSET_POOL;
    if (type === 'disposal') return DISPOSAL_ASSET_POOL;
    if (!assetScope || assetScope === '混合') return SCRAP_ASSET_POOL;
    return filterAssetsForScope(assetScope);
  }, [type, assetScope]);

  const addAssets = (selected) => {
    const existing = new Set(assets.map((item) => item.id));
    const selectedScopes = new Set([
      ...assets.map((item) => item.scope),
      ...selected.map((item) => item.scope),
    ].filter(Boolean));

    if (type !== 'accounting' && selectedScopes.size > 1) {
      message.error('同一申请单不能混合机房资产、软件和办公设备');
      return;
    }

    if (type === 'accounting') {
      const methods = new Set([
        ...assets.map((item) => item.scrapMethod),
        ...selected.map((item) => item.scrapMethod),
      ].filter(Boolean));
      if (methods.size > 1) {
        message.error('同一账面报废单的报废方式必须一致');
        return;
      }
    }

    const next = selected
      .filter((item) => !existing.has(item.id))
      .map((item) => ({
        ...item,
        scrapMethod: type === 'crossCompany' ? '调账' : item.scrapMethod || scrapMethod,
        scrapType: item.scrapType || '已到报废期',
        reason: item.reason || '',
        dataCleaning: item.scope === '机房资产' ? item.dataCleaning || '否' : undefined,
        newCompany: item.newCompany || '',
        newPlate: item.newPlate || '',
        newCostCenter: item.newCostCenter || '',
        newResponsiblePerson: item.newResponsiblePerson || '',
        targetWarehouse: item.targetWarehouse || '',
        targetCity: item.targetCity || '',
        targetBuilding: item.targetBuilding || '',
        targetFloor: item.targetFloor || '',
        purpose: item.purpose || '',
        project: item.project || '',
        rowRemark: item.rowRemark || '',
      }));

    onReplace([...assets, ...next]);
  };

  const deleteSelected = () => {
    if (selectedRowKeys.length === 0) return;
    const selectedSet = new Set(selectedRowKeys);
    onReplace(assets.filter((item) => !selectedSet.has(item.id)));
    setSelectedRowKeys([]);
  };

  const downloadTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet([{ 资产标签号: '' }], { header: ['资产标签号'] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, '资产导入模板');
    XLSX.writeFile(workbook, '资产导入模板.xlsx');
  };

  const exportAssets = () => {
    const rows = assets.map((item) => ({
      资产标签号: item.tagNo,
      资产大类: item.majorCategory,
      资产小类: item.minorCategory,
      资产说明: item.description,
      公司: item.company,
      责任人: item.responsiblePerson,
      资产状态: item.status,
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), '资产明细');
    XLSX.writeFile(workbook, '资产明细.xlsx');
  };

  const importAssets = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
        const tags = new Set(rows.map((row) => String(row['资产标签号'] || '').trim()).filter(Boolean));
        const matched = pickerAssets.filter((item) => tags.has(String(item.tagNo)));
        const missingCount = Math.max(0, tags.size - matched.length);
        if (matched.length === 0) {
          message.error('导入文件中没有匹配到可选资产');
          return;
        }
        addAssets(matched);
        if (missingCount > 0) {
          message.warning(`已匹配 ${matched.length} 条，另有 ${missingCount} 条未通过当前资产范围校验`);
        } else {
          message.success(`已导入 ${matched.length} 条资产`);
        }
      } catch (error) {
        message.error('Excel 文件解析失败，请使用下载的模板');
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const baseColumns = [
    { title: '资产标签号', dataIndex: 'tagNo', width: 150, fixed: 'left' },
    { title: '资产序列号', dataIndex: 'serialNumber', width: 160 },
    { title: '资产大类', dataIndex: 'majorCategory', width: 150 },
    { title: '资产小类', dataIndex: 'minorCategory', width: 190, ellipsis: true },
    { title: '资产说明', dataIndex: 'description', width: 220, ellipsis: true },
    { title: '公司', dataIndex: 'company', width: 160 },
    { title: '板块', dataIndex: 'plate', width: 150 },
    { title: '责任人', dataIndex: 'responsiblePerson', width: 160 },
    {
      title: '资产状态',
      dataIndex: 'status',
      width: 130,
      render: (value) => <StatusTag value={value} type="business" />,
    },
  ];

  const crossCompanyColumns = [
    ...baseColumns,
    { title: '原成本中心', dataIndex: 'costCenter', width: 180 },
    { title: '原仓库', dataIndex: 'warehouse', width: 200 },
    { title: '原 City', dataIndex: 'city', width: 120 },
    { title: '原 Building', dataIndex: 'building', width: 150 },
    { title: '原 Floor', dataIndex: 'floor', width: 110 },
    {
      title: '新公司',
      dataIndex: 'newCompany',
      width: 180,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Select
              
              value={value || undefined}
              options={companyOptions}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'newCompany', nextValue || '')}
            />
          )
      ),
    },
    {
      title: '新板块',
      dataIndex: 'newPlate',
      width: 180,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Select
              
              value={value || undefined}
              options={plateOptions}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'newPlate', nextValue || '')}
            />
          )
      ),
    },
    {
      title: '新成本中心',
      dataIndex: 'newCostCenter',
      width: 180,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Select
              
              value={value || undefined}
              options={costCenterOptions}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'newCostCenter', nextValue || '')}
            />
          )
      ),
    },
    {
      title: '新责任人',
      dataIndex: 'newResponsiblePerson',
      width: 160,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              value={value}
              placeholder="请选择/输入新责任人"
              onChange={(event) => onChange(record.id, 'newResponsiblePerson', event.target.value)}
            />
          )
      ),
    },
    {
      title: 'City',
      dataIndex: 'targetCity',
      width: 130,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              value={value}
              onChange={(event) => onChange(record.id, 'targetCity', event.target.value)}
            />
          )
      ),
    },
    {
      title: 'Building',
      dataIndex: 'targetBuilding',
      width: 150,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              value={value}
              onChange={(event) => onChange(record.id, 'targetBuilding', event.target.value)}
            />
          )
      ),
    },
    {
      title: 'Floor',
      dataIndex: 'targetFloor',
      width: 110,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              value={value}
              onChange={(event) => onChange(record.id, 'targetFloor', event.target.value)}
            />
          )
      ),
    },
    {
      title: '调账后仓库',
      dataIndex: 'targetWarehouse',
      width: 210,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Select
              allowClear
              value={value || undefined}
              options={warehouseOptions}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'targetWarehouse', nextValue || '')}
            />
          )
      ),
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      width: 150,
      render: (value, record) => (
        readOnly ? displayValue(value) : <Input value={value} onChange={(event) => onChange(record.id, 'purpose', event.target.value)} />
      ),
    },
    {
      title: '项目',
      dataIndex: 'project',
      width: 150,
      render: (value, record) => (
        readOnly ? displayValue(value) : <Input value={value} onChange={(event) => onChange(record.id, 'project', event.target.value)} />
      ),
    },
    {
      title: '行备注',
      dataIndex: 'rowRemark',
      width: 180,
      render: (value, record) => (
        readOnly ? displayValue(value) : <Input value={value} onChange={(event) => onChange(record.id, 'rowRemark', event.target.value)} />
      ),
    },
    { title: '是否处置', key: 'disposalFlag', width: 100, render: () => '否' },
  ];

  const scrapColumns = [
    ...baseColumns,
    {
      title: '报废数量',
      dataIndex: 'quantity',
      width: 110,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <InputNumber
              min={1}
              max={record.quantity || 1}
              value={value}
              onChange={(nextValue) => onChange(record.id, 'quantity', nextValue)}
            />
          )
      ),
    },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Select
              value={value}
              options={SCRAP_TYPE_OPTIONS}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'scrapType', nextValue)}
            />
          )
      ),
    },
    {
      title: '数据清洗',
      dataIndex: 'dataCleaning',
      width: 110,
      render: (value, record) => (
        record.scope === '机房资产'
          ? (
            readOnly
              ? displayValue(value || '否')
              : (
                <Select
                  value={value || '否'}
                  options={options(['是', '否'])}
                  className="w-full"
                  onChange={(nextValue) => onChange(record.id, 'dataCleaning', nextValue)}
                />
              )
          )
          : '-'
      ),
    },
    {
      title: '报废原因',
      dataIndex: 'reason',
      width: 200,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              value={value}
              onChange={(event) => onChange(record.id, 'reason', event.target.value)}
            />
          )
      ),
    },
  ];

  const accountingColumns = [
    ...baseColumns,
    { title: '资产编号', dataIndex: 'assetNo', width: 150 },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
    {
      title: '原值',
      dataIndex: 'originalValue',
      width: 120,
      align: 'right',
      render: money,
    },
    {
      title: '净值',
      dataIndex: 'netValue',
      width: 120,
      align: 'right',
      render: money,
    },
    { title: '报废方式', dataIndex: 'scrapMethod', width: 120 },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Select
              value={value}
              options={SCRAP_TYPE_OPTIONS}
              className="w-full"
              onChange={(nextValue) => onChange(record.id, 'scrapType', nextValue)}
            />
          )
      ),
    },
    {
      title: '报废原因',
      dataIndex: 'reason',
      width: 200,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : <Input value={value} onChange={(event) => onChange(record.id, 'reason', event.target.value)} />
      ),
    },
    { title: '来源业务类型', dataIndex: 'sourceBusinessType', width: 140 },
    { title: '来源业务单号', dataIndex: 'sourceBusinessNo', width: 170 },
    { title: '新公司', dataIndex: 'newCompany', width: 160, render: (value) => displayValue(value) },
    { title: '新板块', dataIndex: 'newPlate', width: 150, render: (value) => displayValue(value) },
    { title: '新责任人', dataIndex: 'newResponsiblePerson', width: 160, render: (value) => displayValue(value) },
    { title: '调账后仓库', dataIndex: 'targetWarehouse', width: 200, render: (value) => displayValue(value) },
  ];

  const disposalColumns = [
    ...baseColumns,
    {
      title: '原值',
      dataIndex: 'originalValue',
      width: 120,
      align: 'right',
      render: money,
    },
    {
      title: '净值',
      dataIndex: 'netValue',
      width: 120,
      align: 'right',
      render: money,
    },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'Building', dataIndex: 'building', width: 160 },
    { title: 'Floor', dataIndex: 'floor', width: 100 },
    { title: '报废类型', dataIndex: 'scrapType', width: 130 },
    { title: '报废原因', dataIndex: 'reason', width: 180, ellipsis: true },
    { title: '报废申请单号', dataIndex: 'sourceScrapNo', width: 170 },
    { title: '账面报废单号', dataIndex: 'sourceAccountingNo', width: 180 },
    { title: '处置状态', dataIndex: 'disposalStatus', width: 110 },
  ];

  const columns = type === 'crossCompany'
    ? crossCompanyColumns
    : type === 'scrap'
      ? scrapColumns
      : type === 'accounting'
        ? accountingColumns
        : disposalColumns;

  return (
    <>
      {!readOnly && (
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setPickerOpen(true)}>
              添加资产
            </Button>
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={deleteSelected}>
              删除所选
            </Button>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>下载模板</Button>
            <Upload accept=".xls,.xlsx" showUploadList={false} beforeUpload={importAssets}>
              <Button icon={<UploadOutlined />}>Excel导入</Button>
            </Upload>
            <Button icon={<FileExcelOutlined />} disabled={assets.length === 0} onClick={exportAssets}>
              导出明细
            </Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={assets}
        rowSelection={readOnly ? undefined : {
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          fixed: true,
        }}
        scroll={{ x: 'max-content' }}
        pagination={false}
        locale={{ emptyText: '暂无资产明细' }}
      />

      <SelectModal
        open={pickerOpen}
        title="选择资产"
        width={960}
        multiple
        dataSource={pickerAssets}
        initialSelectedKeys={assets.map((item) => item.id)}
        searchFields={[
          { label: '资产标签号', name: 'tagNo', dataIndex: 'tagNo' },
          { label: '序列号', name: 'serialNumber', dataIndex: 'serialNumber' },
          { label: '板块', name: 'plate', dataIndex: 'plate' },
          { label: '资产说明', name: 'description', dataIndex: 'description' },
        ]}
        columns={[
          { title: '资产标签号', dataIndex: 'tagNo', width: 150 },
          { title: '序列号', dataIndex: 'serialNumber', width: 160 },
          { title: '资产大类', dataIndex: 'majorCategory', width: 150 },
          { title: '资产小类', dataIndex: 'minorCategory', width: 190 },
          { title: '资产说明', dataIndex: 'description', width: 220 },
          { title: '公司', dataIndex: 'company', width: 150 },
          { title: '责任人', dataIndex: 'responsiblePerson', width: 150 },
          {
            title: '资产状态',
            dataIndex: 'status',
            width: 130,
            render: (value) => <StatusTag value={value} type="business" />,
          },
        ]}
        onCancel={() => setPickerOpen(false)}
        onConfirm={(selected) => {
          addAssets(selected);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
