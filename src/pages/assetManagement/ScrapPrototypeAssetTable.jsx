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
  SCRAP_ASSET_POOL,
  SCRAP_TYPE_OPTIONS,
  filterAssetsForScope,
  money,
} from './scrapPrototypeData';
import {
  getAccountingCandidates,
  getDisposalCandidates,
  getScrapPrototypeRecords,
} from '../../services/scrapPrototypeService';
import {
  mockPlates,
} from '../../mock/businessRulesMock';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';

const plateOptions = mockPlates.map((item) => ({
  label: item.desc,
  value: item.desc,
}));

const warehouseOptions = warehouseCatalog.map((item) => ({
  label: `${item.warehouseCode}.${item.warehouseDescription}`,
  value: `${item.warehouseCode}.${item.warehouseDescription}`,
}));

const maintenanceRows = getAssetMaintenanceRows();
const transferLookupRecords = {
  owners: maintenanceRows
    .filter((row) => row.ownerId && row.ownerName)
    .reduce((records, row) => {
      const code = String(row.ownerId).trim();
      if (!records.some((item) => item.code === code)) {
        records.push({ id: `owner-${code}`, code, name: row.ownerName, department: row.department || '' });
      }
      return records;
    }, []),
  companies: maintenanceRows
    .filter((row) => row.companyCode && row.company)
    .reduce((records, row) => {
      const code = String(row.companyCode).trim();
      if (!records.some((item) => item.code === code)) {
        records.push({ id: `company-${code}`, code, name: row.company });
      }
      return records;
    }, []),
  costCenters: maintenanceRows
    .filter((row) => row.costCenter)
    .reduce((records, row) => {
      const name = String(row.costCenter).trim();
      const code = name.split('.')[0];
      if (code && !records.some((item) => item.code === code)) {
        records.push({ id: `cc-${code}`, code, name });
      }
      return records;
    }, []),
};

const transferLookupConfig = {
  newResponsiblePerson: {
    title: '选择新责任人',
    values: transferLookupRecords.owners,
    searchFields: [
      { label: '员工编码', name: 'code', dataIndex: 'code' },
      { label: '姓名', name: 'name', dataIndex: 'name' },
      { label: '部门名称', name: 'department', dataIndex: 'department' },
    ],
    columns: [
      { title: '员工编码', dataIndex: 'code' },
      { title: '姓名', dataIndex: 'name' },
      { title: '部门名称', dataIndex: 'department' },
    ],
  },
  newCompany: {
    title: '选择新公司',
    values: transferLookupRecords.companies,
    searchFields: [
      { label: '公司编码', name: 'code', dataIndex: 'code' },
      { label: '公司名称', name: 'name', dataIndex: 'name' },
    ],
    columns: [
      { title: '公司编码', dataIndex: 'code' },
      { title: '公司名称', dataIndex: 'name' },
    ],
  },
  newCostCenter: {
    title: '选择新成本中心',
    values: transferLookupRecords.costCenters,
    searchFields: [
      { label: '成本中心编码', name: 'code', dataIndex: 'code' },
      { label: '成本中心', name: 'name', dataIndex: 'name' },
    ],
    columns: [
      { title: '成本中心编码', dataIndex: 'code' },
      { title: '成本中心', dataIndex: 'name' },
    ],
  },
};

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

function displayValue(value) {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}

function requiredTitle(label) {
  return (
    <span>
      <span className="mr-1 text-red-500">*</span>
      {label}
    </span>
  );
}

export default function ScrapPrototypeAssetTable({
  type,
  assetScope,
  sourceCompany,
  assets,
  readOnly,
  onChange,
  onReplace,
  scrapMethod,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [transferLookup, setTransferLookup] = useState(null);

  const pickerAssets = useMemo(() => {
    const pool = type === 'accounting'
      ? getAccountingCandidates()
      : type === 'disposal'
        ? getDisposalCandidates()
        : !assetScope || assetScope === '混合'
          ? SCRAP_ASSET_POOL
          : filterAssetsForScope(assetScope);
    const relevantTypes = type === 'accounting'
      ? ['accounting']
      : type === 'disposal'
        ? ['disposal']
        : ['crossCompany', 'scrap'];
    const occupiedTags = new Set(relevantTypes.flatMap((businessType) => (
      getScrapPrototypeRecords(businessType)
        .filter((record) => record.documentStatus !== '已驳回')
        .flatMap((record) => record.assetsSnapshot || [])
        .map((item) => item.tagNo)
    )));
    return pool.filter((item) => (
      (type !== 'crossCompany' || (sourceCompany && item.company === sourceCompany))
      &&
      !occupiedTags.has(item.tagNo)
      && (
        ['accounting', 'disposal'].includes(type)
        || (!String(item.status || '').startsWith('已报废') && item.status !== '在库-待报废')
      )
    ));
  }, [type, assetScope, sourceCompany]);

  const addAssets = (selected) => {
    if (type === 'crossCompany' && !sourceCompany) {
      message.error('请先选择公司');
      return false;
    }

    if (type === 'crossCompany' && selected.some((item) => item.company !== sourceCompany)) {
      message.error('只能选择所选公司的资产');
      return false;
    }

    const existing = new Set(assets.map((item) => item.id));
    const selectedScopes = new Set([
      ...assets.map((item) => item.scope),
      ...selected.map((item) => item.scope),
    ].filter(Boolean));

    if (type !== 'accounting' && selectedScopes.size > 1) {
      message.error('同一申请单不能混合机房资产、软件和办公设备');
      return false;
    }

    const officePaths = new Set([...assets, ...selected]
      .filter((item) => item.scope === '办公设备')
      .map((item) => ['PC', 'NOTEBOOK'].includes(item.majorCategory)));
    if (type === 'scrap' && officePaths.size > 1) {
      message.error('电脑类与其他办公设备的鉴定流程不同，请分别建单');
      return false;
    }

    if (type === 'accounting') {
      const methods = new Set([
        ...assets.map((item) => item.scrapMethod),
        ...selected.map((item) => item.scrapMethod),
      ].filter(Boolean));
      if (methods.size > 1) {
        message.error('同一账面报废单的报废方式必须一致');
        return false;
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
        newCompany: type === 'crossCompany' ? item.company || '' : item.newCompany || '',
        newPlate: type === 'crossCompany' ? item.plate || '' : item.newPlate || '',
        newCostCenter: type === 'crossCompany' ? item.costCenter || '' : item.newCostCenter || '',
        newResponsiblePerson: type === 'crossCompany'
          ? item.responsiblePerson || ''
          : item.newResponsiblePerson || '',
        targetWarehouse: type === 'crossCompany' ? item.warehouse || '' : item.targetWarehouse || '',
        targetCity: type === 'crossCompany' ? item.city || '' : item.targetCity || '',
        targetBuilding: type === 'crossCompany' ? item.building || '' : item.targetBuilding || '',
        targetFloor: type === 'crossCompany' ? item.floor || '' : item.targetFloor || '',
        purpose: item.purpose || '',
        project: item.project || '',
        rowRemark: item.rowRemark || '',
      }));

    onReplace([...assets, ...next]);
    return true;
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
    const rows = assets.map((item) => (type === 'crossCompany'
      ? {
          资产标签号: item.tagNo,
          资产序列号: item.serialNumber,
          资产类别: `${item.majorCategory}.${item.minorCategory}`,
          资产说明: item.description,
          新责任人: item.newResponsiblePerson,
          新公司: item.newCompany,
          新板块: item.newPlate,
          新成本中心: item.newCostCenter,
          City: item.targetCity,
          Building: item.targetBuilding,
          Floor: item.targetFloor,
          调账后仓库: item.targetWarehouse,
        }
      : {
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
      let workbook;
      try {
        workbook = XLSX.read(event.target.result, { type: 'array' });
      } catch (error) {
        message.error('Excel 文件解析失败，请使用下载的模板');
        return;
      }
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const header = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })[0] || [];
      if (header.length !== 1 || String(header[0]).trim() !== '资产标签号') {
        message.error('导入表头与下载模板不一致');
        return;
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, blankrows: false });
      if (rows.length === 0) {
        message.error('导入文件没有资产明细');
        return;
      }

      const selectedIds = new Set(assets.map((item) => item.id));
      const seenTags = new Set();
      const matched = [];
      const result = rows.map((row) => {
        const tag = String(row['资产标签号'] || '').trim();
        const asset = pickerAssets.find((item) => String(item.tagNo) === tag);
        let error = '';
        if (!tag) error = '资产标签号不能为空';
        else if (seenTags.has(tag)) error = '导入文件中的资产标签号重复';
        else if (!asset) error = '资产不存在或不符合当前资产范围';
        else if (selectedIds.has(asset.id)) error = '资产已在当前单据中';
        seenTags.add(tag);
        if (!error) matched.push(asset);
        return { 错误原因: error, 资产标签号: tag };
      });

      const selectedScopes = new Set([...assets, ...matched].map((item) => item.scope).filter(Boolean));
      const methods = new Set([...assets, ...matched].map((item) => item.scrapMethod).filter(Boolean));
      const officePaths = new Set([...assets, ...matched]
        .filter((item) => item.scope === '办公设备')
        .map((item) => ['PC', 'NOTEBOOK'].includes(item.majorCategory)));
      if (type !== 'accounting' && selectedScopes.size > 1) {
        result.forEach((row) => { if (!row.错误原因) row.错误原因 = '同一单据不能混合资产范围'; });
      }
      if (type === 'accounting' && methods.size > 1) {
        result.forEach((row) => { if (!row.错误原因) row.错误原因 = '同一账面报废单的报废方式必须一致'; });
      }
      if (type === 'scrap' && officePaths.size > 1) {
        result.forEach((row) => { if (!row.错误原因) row.错误原因 = '电脑类与其他办公设备的鉴定流程不同，需分别建单'; });
      }

      const errorCount = result.filter((row) => row.错误原因).length;
      if (errorCount > 0) {
        const errorBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(errorBook, XLSX.utils.json_to_sheet(result, { header: ['错误原因', '资产标签号'] }), '导入结果');
        XLSX.writeFile(errorBook, '资产导入错误结果.xlsx');
        message.error(`${errorCount} 行校验失败，已下载错误结果，整批未导入`);
        return;
      }

      if (addAssets(matched)) message.success(`已导入 ${matched.length} 条资产`);
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
    { title: '资产标签号', dataIndex: 'tagNo', width: 150, fixed: 'left' },
    { title: '资产序列号', dataIndex: 'serialNumber', width: 160 },
    {
      title: '资产类别',
      key: 'assetCategory',
      width: 210,
      render: (_, record) => [record.majorCategory, record.minorCategory].filter(Boolean).join('.'),
    },
    { title: '资产说明', dataIndex: 'description', width: 220, ellipsis: true },
    {
      title: requiredTitle('新责任人'),
      dataIndex: 'newResponsiblePerson',
      width: 160,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              readOnly
              value={value}
              placeholder="请选择新责任人"
              suffix={<span className="text-[#1677ff]">选择</span>}
              className="cursor-pointer"
              onClick={() => setTransferLookup({ row: record, field: 'newResponsiblePerson' })}
            />
          )
      ),
    },
    {
      title: requiredTitle('新公司'),
      dataIndex: 'newCompany',
      width: 180,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              readOnly
              value={value}
              placeholder="请选择新公司"
              suffix={<span className="text-[#1677ff]">选择</span>}
              className="cursor-pointer"
              onClick={() => setTransferLookup({ row: record, field: 'newCompany' })}
            />
          )
      ),
    },
    {
      title: requiredTitle('新板块'),
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
      title: requiredTitle('新成本中心'),
      dataIndex: 'newCostCenter',
      width: 180,
      render: (value, record) => (
        readOnly
          ? displayValue(value)
          : (
            <Input
              readOnly
              value={value}
              placeholder="请选择新成本中心"
              suffix={<span className="text-[#1677ff]">选择</span>}
              className="cursor-pointer"
              onClick={() => setTransferLookup({ row: record, field: 'newCostCenter' })}
            />
          )
      ),
    },
    {
      title: requiredTitle('City'),
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
      title: requiredTitle('Building'),
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
      title: requiredTitle('Floor'),
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

  const assetPickerSearchFields = type === 'crossCompany'
    ? [
        { label: '资产标签号', name: 'tagNo', dataIndex: 'tagNo' },
        { label: '序列号', name: 'serialNumber', dataIndex: 'serialNumber' },
        { label: '资产说明', name: 'description', dataIndex: 'description' },
      ]
    : [
        { label: '资产标签号', name: 'tagNo', dataIndex: 'tagNo' },
        { label: '序列号', name: 'serialNumber', dataIndex: 'serialNumber' },
        { label: '板块', name: 'plate', dataIndex: 'plate' },
        { label: '资产说明', name: 'description', dataIndex: 'description' },
      ];

  const assetPickerColumns = type === 'crossCompany'
    ? [
        { title: '资产标签号', dataIndex: 'tagNo', width: 150 },
        { title: '序列号', dataIndex: 'serialNumber', width: 160 },
        {
          title: '资产类别',
          key: 'assetCategory',
          width: 210,
          render: (_, record) => [record.majorCategory, record.minorCategory].filter(Boolean).join('.'),
        },
        { title: '资产说明', dataIndex: 'description', width: 220 },
      ]
    : [
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
      ];

  return (
    <>
      {type === 'crossCompany' && transferLookup && (() => {
        const lookup = transferLookupConfig[transferLookup.field];
        const display = (item) => transferLookup.field === 'newResponsiblePerson'
          ? `${item.code}-${item.name}`
          : transferLookup.field === 'newCompany'
            ? `${item.code}.${item.name}`
            : item.name;
        return (
          <SelectModal
            open
            title={lookup.title}
            dataSource={lookup.values}
            searchFields={lookup.searchFields}
            columns={lookup.columns}
            onCancel={() => setTransferLookup(null)}
            onConfirm={(item) => {
              onChange(transferLookup.row.id, transferLookup.field, display(item));
              setTransferLookup(null);
            }}
          />
        );
      })()}
      {!readOnly && (
      <div className="mb-3 flex justify-end">
        <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={type === 'crossCompany' && !sourceCompany}
              onClick={() => setPickerOpen(true)}
            >
              添加资产
            </Button>
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={deleteSelected}>
              删除所选
            </Button>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>下载模板</Button>
            <Upload
              accept=".xls,.xlsx"
              showUploadList={false}
              beforeUpload={importAssets}
              disabled={type === 'crossCompany' && !sourceCompany}
            >
              <Button disabled={type === 'crossCompany' && !sourceCompany} icon={<UploadOutlined />}>
                Excel导入
              </Button>
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
        searchFields={assetPickerSearchFields}
        columns={assetPickerColumns}
        onCancel={() => setPickerOpen(false)}
        onConfirm={(selected) => {
          addAssets(selected);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
