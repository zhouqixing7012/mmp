import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import LookupInput from '../../components/LookupInput';
import StatusTag from '../../components/StatusTag';
import OutboundApprovalHistoryPage from '../inventoryManagement/OutboundApprovalHistoryPage';
import { ASSET_SCOPE_OPTIONS } from './scrapPrototypeData';
import { getScrapPrototypeApprovalRecords } from './scrapPrototypeApproval';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const EMPTY_FILTERS = {
  applicationNo: '',
  assetTag: '',
  serialNumber: '',
  documentStatus: '',
  assetScope: '',
  company: '',
  creator: '',
  scrapMethod: '',
  region: '',
  dateRange: null,
};

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

const maintenanceRows = getAssetMaintenanceRows();

const companyLookupRecords = [...maintenanceRows, ...warehouseCatalog.map((item) => {
  const [companyCode, ...parts] = String(item.company || '').split('.');
  return { companyCode, company: parts.join('.') };
})].reduce((records, row) => {
  const code = String(row.companyCode || '').trim();
  const name = String(row.company || '').trim();
  if (code && name && !records.some((item) => item.code === code)) {
    records.push({ id: `company-${code}`, code, name });
  }
  return records;
}, []);

export default function ScrapPrototypeList({
  type,
  config,
  records,
  onCreate,
  onOpen,
  onCopy,
  onExecute,
  onDeleteDrafts,
  onApprove,
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [lookupKey, setLookupKey] = useState('');

  const filteredRows = useMemo(() => records.filter((row) => {
    const textFields = [
      'applicationNo',
      'company',
      'creator',
    ];

    for (const field of textFields) {
      const query = String(appliedFilters[field] || '').trim();
      if (query && !String(row[field] || '').includes(query)) return false;
    }

    const assetTagQuery = String(appliedFilters.assetTag || '').trim();
    const rowAssetTags = row.assetsSnapshot?.length
      ? row.assetsSnapshot.map((asset) => asset.tagNo)
      : row.assetTags || [];
    if (assetTagQuery && !rowAssetTags.some(
      (tagNo) => String(tagNo || '').includes(assetTagQuery),
    )) return false;

    const serialNumberQuery = String(appliedFilters.serialNumber || '').trim();
    const rowSerialNumbers = row.assetsSnapshot?.length
      ? row.assetsSnapshot.map((asset) => asset.serialNumber)
      : row.serialNumbers || [];
    if (serialNumberQuery && !rowSerialNumbers.some(
      (serialNumber) => String(serialNumber || '').includes(serialNumberQuery),
    )) return false;

    if (appliedFilters.documentStatus && row.documentStatus !== appliedFilters.documentStatus) return false;
    if (appliedFilters.assetScope && row.assetScope !== appliedFilters.assetScope) return false;
    if (appliedFilters.scrapMethod && row.scrapMethod !== appliedFilters.scrapMethod) return false;

    if (appliedFilters.dateRange?.length === 2) {
      const value = dayjs(row.createdAt);
      if (
        value.isBefore(appliedFilters.dateRange[0], 'day')
        || value.isAfter(appliedFilters.dateRange[1], 'day')
      ) {
        return false;
      }
    }

    return true;
  }), [records, appliedFilters]);

  const operationColumn = {
    title: '操作',
    key: 'operation',
    width: 120,
    fixed: 'right',
    render: (_, record) => (
      <Button type="link" size="small" onClick={() => setApprovalRecord(record)}>查看进度</Button>
    ),
  };

  const applicationColumn = {
    title: '申请单号',
    dataIndex: 'applicationNo',
    width: 180,
    render: (value, record) => (
      <Button type="link" size="small" onClick={() => onOpen(record, false, false)}>
        {value}
      </Button>
    ),
  };

  const statusColumn = {
    title: '单据状态',
    dataIndex: 'documentStatus',
    width: 120,
    render: (value) => <StatusTag value={value} type="business" />,
  };

  const columnsByType = {
    crossCompany: [
      applicationColumn,
      { title: '制单人', dataIndex: 'creator', width: 130 },
      { title: '原公司', dataIndex: 'company', width: 160, ellipsis: true },
      {
        title: '新公司',
        dataIndex: 'targetCompany',
        width: 220,
        ellipsis: true,
        render: (value, row) => {
          const companies = Array.from(new Set(
            (row.assetsSnapshot || []).map((asset) => asset.newCompany).filter(Boolean),
          ));
          return companies.length ? companies.join('、') : value || '-';
        },
      },
      { title: '制单时间', dataIndex: 'createdAt', width: 120 },
      statusColumn,
      operationColumn,
    ],
    scrap: [
      applicationColumn,
      { title: '制单人', dataIndex: 'creator', width: 130 },
      { title: '公司', dataIndex: 'company', width: 160, ellipsis: true },
      { title: '制单时间', dataIndex: 'createdAt', width: 120 },
      statusColumn,
      operationColumn,
    ],
    accounting: [
      applicationColumn,
      { title: '制单人', dataIndex: 'creator', width: 130 },
      { title: '公司', dataIndex: 'company', width: 160, ellipsis: true },
      { title: '报废方式', dataIndex: 'scrapMethod', width: 120 },
      { title: '制单时间', dataIndex: 'createdAt', width: 120 },
      statusColumn,
      operationColumn,
    ],
    disposal: [
      applicationColumn,
      { title: '制单人', dataIndex: 'creator', width: 150 },
      { title: '公司', dataIndex: 'company', width: 190, ellipsis: true },
      {
        title: '板块',
        dataIndex: 'plate',
        width: 180,
        ellipsis: true,
        render: (value, row) => value || Array.from(new Set(
          (row.assetsSnapshot || []).map((asset) => asset.plate).filter(Boolean),
        )).join('、') || '-',
      },
      {
        title: '资产数量',
        dataIndex: 'assetCount',
        width: 110,
        align: 'right',
        render: (value, row) => row.assetsSnapshot?.length
          ? row.assetsSnapshot.reduce((sum, asset) => sum + Number(asset.quantity || 0), 0)
          : value || 0,
      },
      { title: '制单时间', dataIndex: 'createdAt', width: 150 },
      statusColumn,
      operationColumn,
    ],
  };

  const renderQueries = () => {
    if (type === 'crossCompany') {
      return (
        <>
          <QueryItem label="申请单号">
            <Input value={filters.applicationNo} allowClear onChange={(event) => setFilters((c) => ({ ...c, applicationNo: event.target.value }))} />
          </QueryItem>
          <QueryItem label="资产标签号">
            <Input value={filters.assetTag} allowClear onChange={(event) => setFilters((c) => ({ ...c, assetTag: event.target.value }))} />
          </QueryItem>
          <QueryItem label="序列号">
            <Input value={filters.serialNumber} allowClear onChange={(event) => setFilters((c) => ({ ...c, serialNumber: event.target.value }))} />
          </QueryItem>
          <QueryItem label="单据状态">
            <Select value={filters.documentStatus || undefined} allowClear options={options(config.statuses)} onChange={(value) => setFilters((c) => ({ ...c, documentStatus: value || '' }))} />
          </QueryItem>
          <QueryItem label="制单人">
            <LookupInput
              value={filters.creator}
              placeholder="请选择制单人"
              onOpen={() => setLookupKey('creator')}
              onClear={() => setFilters((current) => ({ ...current, creator: '' }))}
            />
          </QueryItem>
          <QueryItem label="原公司">
            <LookupInput
              value={filters.company}
              placeholder="请选择原公司"
              onOpen={() => setLookupKey('company')}
              onClear={() => setFilters((current) => ({ ...current, company: '' }))}
            />
          </QueryItem>
          <QueryItem label="制单日期">
            <RangePicker value={filters.dateRange} className="w-full" onChange={(value) => setFilters((c) => ({ ...c, dateRange: value }))} />
          </QueryItem>
        </>
      );
    }

    if (type === 'disposal') {
      return (
        <>
          <QueryItem label="申请单号"><Input value={filters.applicationNo} allowClear onChange={(event) => setFilters((c) => ({ ...c, applicationNo: event.target.value }))} /></QueryItem>
          <QueryItem label="资产标签号">
            <Input value={filters.assetTag} allowClear onChange={(event) => setFilters((c) => ({ ...c, assetTag: event.target.value }))} />
          </QueryItem>
          <QueryItem label="序列号">
            <Input value={filters.serialNumber} allowClear onChange={(event) => setFilters((c) => ({ ...c, serialNumber: event.target.value }))} />
          </QueryItem>
          <QueryItem label="单据状态"><Select value={filters.documentStatus || undefined} allowClear options={options(config.statuses)} onChange={(value) => setFilters((c) => ({ ...c, documentStatus: value || '' }))} /></QueryItem>
          <QueryItem label="制单人"><Input value={filters.creator} allowClear onChange={(event) => setFilters((c) => ({ ...c, creator: event.target.value }))} /></QueryItem>
          <QueryItem label="制单时间"><RangePicker value={filters.dateRange} className="w-full" onChange={(value) => setFilters((c) => ({ ...c, dateRange: value }))} /></QueryItem>
          <QueryItem label="公司">
            <Input value={filters.company} allowClear onChange={(event) => setFilters((c) => ({ ...c, company: event.target.value }))} />
          </QueryItem>
        </>
      );
    }

    if (type === 'accounting') {
      return (
        <>
          <QueryItem label="申请单号">
            <Input value={filters.applicationNo} allowClear onChange={(event) => setFilters((c) => ({ ...c, applicationNo: event.target.value }))} />
          </QueryItem>
          <QueryItem label="资产标签号">
            <Input value={filters.assetTag} allowClear onChange={(event) => setFilters((c) => ({ ...c, assetTag: event.target.value }))} />
          </QueryItem>
          <QueryItem label="序列号">
            <Input value={filters.serialNumber} allowClear onChange={(event) => setFilters((c) => ({ ...c, serialNumber: event.target.value }))} />
          </QueryItem>
          <QueryItem label="单据状态">
            <Select value={filters.documentStatus || undefined} allowClear options={options(config.statuses)} onChange={(value) => setFilters((c) => ({ ...c, documentStatus: value || '' }))} />
          </QueryItem>
          <QueryItem label="公司">
            <Input value={filters.company} allowClear onChange={(event) => setFilters((c) => ({ ...c, company: event.target.value }))} />
          </QueryItem>
          <QueryItem label="制单人">
            <Input value={filters.creator} allowClear onChange={(event) => setFilters((c) => ({ ...c, creator: event.target.value }))} />
          </QueryItem>
          <QueryItem label="报废方式">
            <Select value={filters.scrapMethod || undefined} allowClear options={options(['调账', '非调账'])} onChange={(value) => setFilters((c) => ({ ...c, scrapMethod: value || '' }))} />
          </QueryItem>
          <QueryItem label="制单时间">
            <RangePicker value={filters.dateRange} className="w-full" onChange={(value) => setFilters((c) => ({ ...c, dateRange: value }))} />
          </QueryItem>
        </>
      );
    }

    return (
      <>
        <QueryItem label="申请单号">
          <Input value={filters.applicationNo} allowClear onChange={(event) => setFilters((c) => ({ ...c, applicationNo: event.target.value }))} />
        </QueryItem>
        <QueryItem label="资产标签号">
          <Input value={filters.assetTag} allowClear onChange={(event) => setFilters((c) => ({ ...c, assetTag: event.target.value }))} />
        </QueryItem>
        <QueryItem label="序列号">
          <Input value={filters.serialNumber} allowClear onChange={(event) => setFilters((c) => ({ ...c, serialNumber: event.target.value }))} />
        </QueryItem>
        <QueryItem label="单据状态">
          <Select value={filters.documentStatus || undefined} allowClear options={options(config.statuses)} onChange={(value) => setFilters((c) => ({ ...c, documentStatus: value || '' }))} />
        </QueryItem>
        <QueryItem label="资产范围">
          <Select value={filters.assetScope || undefined} allowClear options={ASSET_SCOPE_OPTIONS} onChange={(value) => setFilters((c) => ({ ...c, assetScope: value || '' }))} />
        </QueryItem>
        <QueryItem label="公司">
          <Input value={filters.company} allowClear onChange={(event) => setFilters((c) => ({ ...c, company: event.target.value }))} />
        </QueryItem>
        {type === 'scrap' ? (
          <QueryItem label="制单人">
            <Input value={filters.creator} allowClear onChange={(event) => setFilters((c) => ({ ...c, creator: event.target.value }))} />
          </QueryItem>
        ) : (
          <QueryItem label="区域">
            <Select value={filters.region || undefined} allowClear options={options(['北京', '非北京'])} onChange={(value) => setFilters((c) => ({ ...c, region: value || '' }))} />
          </QueryItem>
        )}
        <QueryItem label="制单时间">
          <RangePicker value={filters.dateRange} className="w-full" onChange={(value) => setFilters((c) => ({ ...c, dateRange: value }))} />
        </QueryItem>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <Title level={3} className="!mb-0 !text-[22px]">{config.title}</Title>

      <QueryBar
        onQuery={() => setAppliedFilters({ ...filters })}
        onReset={() => {
          setFilters(EMPTY_FILTERS);
          setAppliedFilters(EMPTY_FILTERS);
        }}
      >
        {renderQueries()}
      </QueryBar>

      <Card
        size="small"
        title="申请单列表"
        extra={<Text type="secondary">共 {filteredRows.length} 条</Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            {type === 'accounting' ? <Dropdown menu={{ items: ['调账', '非调账'].map((method) => ({ key: method, label: method, onClick: () => onCreate(method) })) }}>
              <Button type="primary" icon={<PlusOutlined />}>创建</Button>
            </Dropdown> : <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                onCreate();
              }}
            >
              创建
            </Button>}
            {(
              <Popconfirm
                title="确认删除所选草稿？"
                disabled={selectedKeys.length === 0}
                onConfirm={() => {
                  onDeleteDrafts(selectedKeys);
                  setSelectedKeys([]);
                }}
              >
                <Button danger icon={<DeleteOutlined />} disabled={selectedKeys.length === 0}>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columnsByType[type]}
          dataSource={filteredRows}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
            fixed: true,
            getCheckboxProps: (record) => ({
              disabled: record.documentStatus !== '草稿',
            }),
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
      {type === 'crossCompany' && lookupKey && (
        <SelectModal
          open
          title={lookupKey === 'company' ? '选择原公司' : '选择制单人'}
          dataSource={lookupKey === 'company'
            ? companyLookupRecords
            : Array.from(new Map([
                ...maintenanceRows
                  .filter((row) => row.ownerId && row.ownerName)
                  .map((row) => [String(row.ownerId), {
                    id: `employee-${row.ownerId}`,
                    code: String(row.ownerId),
                    name: row.ownerName,
                    department: row.department || '',
                  }]),
                ...records
                  .map((record) => String(record.creator || ''))
                  .filter((value) => /^\d+-/.test(value))
                  .map((value) => {
                    const [code, ...nameParts] = value.split('-');
                    return [code, { id: `employee-${code}`, code, name: nameParts.join('-'), department: '' }];
                  }),
              ]).values())}
          searchFields={lookupKey === 'company'
            ? [
                { label: '公司编码', name: 'code', dataIndex: 'code' },
                { label: '公司名称', name: 'name', dataIndex: 'name' },
              ]
            : [
                { label: '员工编码', name: 'code', dataIndex: 'code' },
                { label: '姓名', name: 'name', dataIndex: 'name' },
                { label: '部门名称', name: 'department', dataIndex: 'department' },
              ]}
          columns={lookupKey === 'company'
            ? [
                { title: '公司编码', dataIndex: 'code' },
                { title: '公司名称', dataIndex: 'name' },
              ]
            : [
                { title: '员工编码', dataIndex: 'code' },
                { title: '姓名', dataIndex: 'name' },
                { title: '部门名称', dataIndex: 'department' },
              ]}
          onCancel={() => setLookupKey('')}
          onConfirm={(record) => {
            if (lookupKey === 'company') {
              setFilters((current) => ({ ...current, company: `${record.code}.${record.name}` }));
            } else {
              setFilters((current) => ({ ...current, creator: `${record.code}-${record.name}` }));
            }
            setLookupKey('');
          }}
        />
      )}
      {['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type) && (
        <Modal
          open={Boolean(approvalRecord)}
          title="审批记录"
          width={960}
          onCancel={() => setApprovalRecord(null)}
          footer={<Button onClick={() => setApprovalRecord(null)}>关闭</Button>}
          destroyOnHidden
        >
          <OutboundApprovalHistoryPage outbound={{ approvalHistory: getScrapPrototypeApprovalRecords(approvalRecord || {}, type).map((item) => ({
            node: item.node,
            handler: item.person || '-',
            action: item.status,
            time: item.time,
            opinion: item.comment,
          })) }} />
        </Modal>
      )}
    </div>
  );
}
