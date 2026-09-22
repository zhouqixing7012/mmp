import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import { ASSET_SCOPE_OPTIONS, money } from './scrapPrototypeData';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const EMPTY_FILTERS = {
  applicationNo: '',
  tagNo: '',
  documentStatus: '',
  disposalStatus: '',
  assetScope: '',
  company: '',
  targetCompany: '',
  creator: '',
  plate: '',
  scrapMethod: '',
  region: '',
  dateRange: null,
};

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

export default function ScrapPrototypeList({
  type,
  config,
  records,
  onCreate,
  onOpen,
  onCopy,
  onExecute,
  onDirectComplete,
  onDeleteDrafts,
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const filteredRows = useMemo(() => records.filter((row) => {
    if (type === 'disposal') {
      if (appliedFilters.tagNo && !String(row.tagNo || '').includes(appliedFilters.tagNo.trim())) return false;
      if (appliedFilters.assetScope && row.scope !== appliedFilters.assetScope) return false;
      if (appliedFilters.company && !String(row.company || '').includes(appliedFilters.company.trim())) return false;
      if (appliedFilters.region && row.region !== appliedFilters.region) return false;
      if (appliedFilters.disposalStatus && row.disposalStatus !== appliedFilters.disposalStatus) return false;
      return true;
    }

    const textFields = [
      'applicationNo',
      'company',
      'targetCompany',
      'creator',
      'plate',
    ];

    for (const field of textFields) {
      const query = String(appliedFilters[field] || '').trim();
      if (query && !String(row[field] || '').includes(query)) return false;
    }

    if (appliedFilters.documentStatus && row.documentStatus !== appliedFilters.documentStatus) return false;
    if (appliedFilters.assetScope && row.assetScope !== appliedFilters.assetScope) return false;
    if (appliedFilters.scrapMethod && row.scrapMethod !== appliedFilters.scrapMethod) return false;
    if (appliedFilters.region && row.region !== appliedFilters.region) return false;

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
  }), [records, appliedFilters, type]);

  const operationColumn = {
    title: '操作',
    key: 'operation',
    width: type === 'scrap' ? 240 : 210,
    fixed: 'right',
    render: (_, record) => (
      type === 'disposal'
        ? (
          <Space size={2} wrap>
            <Button type="link" size="small" onClick={() => onCreate([record])}>
              发起处置
            </Button>
            <Popconfirm
              title="确认按无实物报废处理？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => onDirectComplete(record, '无实物报废')}
            >
              <Button type="link" size="small">无实物报废</Button>
            </Popconfirm>
            <Popconfirm
              title="确认该资产已完成处置？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => onDirectComplete(record, '确认已处置')}
            >
              <Button type="link" size="small">确认已处置</Button>
            </Popconfirm>
          </Space>
        )
        : (
      <Space size={2} wrap>
        <Button type="link" size="small" onClick={() => onOpen(record, false)}>
          查看
        </Button>
        {['草稿', '已驳回'].includes(record.documentStatus) && (
          <Button type="link" size="small" onClick={() => onOpen(record, true)}>
            编辑
          </Button>
        )}
        {type === 'scrap' && (
          <Button type="link" size="small" onClick={() => onCopy(record)}>
            复制
          </Button>
        )}
        {!['草稿', '已驳回'].includes(record.documentStatus) && (
          <Button type="link" size="small" onClick={() => onOpen(record, false)}>
            查看进度
          </Button>
        )}
        {type === 'accounting' && record.documentStatus === '待提单人确认' && (
          <Popconfirm
            title="确认执行账面报废？"
            description="确认后将完成账面报废并结束流程。"
            okText="确认并执行"
            cancelText="取消"
            onConfirm={() => onExecute(record)}
          >
            <Button type="link" size="small">
              执行账面报废
            </Button>
          </Popconfirm>
        )}
      </Space>
        )
    ),
  };

  const applicationColumn = {
    title: '申请单号',
    dataIndex: 'applicationNo',
    width: 180,
    render: (value, record) => (
      <Button type="link" size="small" onClick={() => onOpen(record, false)}>
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
      statusColumn,
      { title: '业务类型', key: 'businessType', width: 120, render: () => '跨公司转移' },
      { title: '资产范围', dataIndex: 'assetScope', width: 120 },
      { title: '发起人', dataIndex: 'creator', width: 130 },
      { title: '原公司', dataIndex: 'company', width: 160, ellipsis: true },
      { title: '新公司', dataIndex: 'targetCompany', width: 160, ellipsis: true },
      { title: '资产数量', dataIndex: 'assetCount', width: 100, align: 'right' },
      { title: '制单时间', dataIndex: 'createdAt', width: 120 },
      { title: '最后修改时间', dataIndex: 'lastModifiedAt', width: 170 },
      { title: '当前节点', dataIndex: 'currentNode', width: 190, ellipsis: true },
      operationColumn,
    ],
    scrap: [
      applicationColumn,
      statusColumn,
      { title: '资产范围', dataIndex: 'assetScope', width: 120 },
      { title: '报废方式', dataIndex: 'scrapMethod', width: 120 },
      { title: '公司', dataIndex: 'company', width: 160, ellipsis: true },
      { title: '制单人', dataIndex: 'creator', width: 130 },
      { title: '制单时间', dataIndex: 'createdAt', width: 120 },
      { title: '资产数量', dataIndex: 'assetCount', width: 100, align: 'right' },
      { title: '备注', dataIndex: 'remark', width: 220, ellipsis: true },
      { title: '当前节点', dataIndex: 'currentNode', width: 190, ellipsis: true },
      operationColumn,
    ],
    accounting: [
      applicationColumn,
      statusColumn,
      { title: '公司', dataIndex: 'company', width: 160, ellipsis: true },
      { title: '板块', dataIndex: 'plate', width: 150, ellipsis: true },
      { title: '报废方式', dataIndex: 'scrapMethod', width: 120 },
      { title: '制单人', dataIndex: 'creator', width: 130 },
      { title: '制单时间', dataIndex: 'createdAt', width: 120 },
      { title: '资产数量', dataIndex: 'assetCount', width: 100, align: 'right' },
      { title: '原值合计', dataIndex: 'originalValueTotal', width: 130, align: 'right', render: money },
      { title: '净值合计', dataIndex: 'netValueTotal', width: 130, align: 'right', render: money },
      { title: '当前节点', dataIndex: 'currentNode', width: 190, ellipsis: true },
      operationColumn,
    ],
    disposal: [
      { title: '资产范围', dataIndex: 'scope', width: 110, fixed: 'left' },
      { title: '资产大类', dataIndex: 'majorCategory', width: 150 },
      { title: '资产小类', dataIndex: 'minorCategory', width: 190, ellipsis: true },
      { title: '资产标签号', dataIndex: 'tagNo', width: 160, fixed: 'left' },
      { title: '资产说明', dataIndex: 'description', width: 220, ellipsis: true },
      { title: '资产状态', dataIndex: 'status', width: 140, render: (value) => <StatusTag value={value} type="business" /> },
      { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
      { title: '原值', dataIndex: 'originalValue', width: 120, align: 'right', render: money },
      { title: '净值', dataIndex: 'netValue', width: 120, align: 'right', render: money },
      { title: '责任人', dataIndex: 'responsiblePerson', width: 160, ellipsis: true },
      { title: 'City', dataIndex: 'city', width: 120 },
      { title: 'Building', dataIndex: 'building', width: 150 },
      { title: 'Floor', dataIndex: 'floor', width: 100 },
      { title: '公司', dataIndex: 'company', width: 160, ellipsis: true },
      { title: '板块', dataIndex: 'plate', width: 150, ellipsis: true },
      { title: '报废日期', dataIndex: 'scrapDate', width: 120 },
      { title: '报废类型', dataIndex: 'scrapType', width: 130 },
      { title: '报废原因', dataIndex: 'reason', width: 180, ellipsis: true },
      { title: '报废申请单号', dataIndex: 'sourceScrapNo', width: 170 },
      { title: '账面报废单号', dataIndex: 'sourceAccountingNo', width: 180 },
      { title: '处置状态', dataIndex: 'disposalStatus', width: 110 },
      { title: '进入处置池时间', dataIndex: 'enteredAt', width: 140 },
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
          <QueryItem label="单据状态">
            <Select value={filters.documentStatus || undefined} allowClear options={options(config.statuses)} onChange={(value) => setFilters((c) => ({ ...c, documentStatus: value || '' }))} />
          </QueryItem>
          <QueryItem label="发起人">
            <Input value={filters.creator} allowClear onChange={(event) => setFilters((c) => ({ ...c, creator: event.target.value }))} />
          </QueryItem>
          <QueryItem label="原公司">
            <Input value={filters.company} allowClear onChange={(event) => setFilters((c) => ({ ...c, company: event.target.value }))} />
          </QueryItem>
          <QueryItem label="新公司">
            <Input value={filters.targetCompany} allowClear onChange={(event) => setFilters((c) => ({ ...c, targetCompany: event.target.value }))} />
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
          <QueryItem label="资产标签号">
            <Input value={filters.tagNo} allowClear onChange={(event) => setFilters((c) => ({ ...c, tagNo: event.target.value }))} />
          </QueryItem>
          <QueryItem label="资产范围">
            <Select
              value={filters.assetScope || undefined}
              allowClear
              options={ASSET_SCOPE_OPTIONS.filter((item) => item.value !== '软件')}
              onChange={(value) => setFilters((c) => ({ ...c, assetScope: value || '' }))}
            />
          </QueryItem>
          <QueryItem label="公司">
            <Input value={filters.company} allowClear onChange={(event) => setFilters((c) => ({ ...c, company: event.target.value }))} />
          </QueryItem>
          <QueryItem label="区域">
            <Select value={filters.region || undefined} allowClear options={options(['北京', '非北京'])} onChange={(value) => setFilters((c) => ({ ...c, region: value || '' }))} />
          </QueryItem>
          <QueryItem label="处置状态">
            <Select value={filters.disposalStatus || undefined} allowClear options={options(['待处置', '处理中', '已处置'])} onChange={(value) => setFilters((c) => ({ ...c, disposalStatus: value || '' }))} />
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
          <QueryItem label="单据状态">
            <Select value={filters.documentStatus || undefined} allowClear options={options(config.statuses)} onChange={(value) => setFilters((c) => ({ ...c, documentStatus: value || '' }))} />
          </QueryItem>
          <QueryItem label="公司">
            <Input value={filters.company} allowClear onChange={(event) => setFilters((c) => ({ ...c, company: event.target.value }))} />
          </QueryItem>
          <QueryItem label="板块">
            <Input value={filters.plate} allowClear onChange={(event) => setFilters((c) => ({ ...c, plate: event.target.value }))} />
          </QueryItem>
          <QueryItem label="制单人">
            <Input value={filters.creator} allowClear onChange={(event) => setFilters((c) => ({ ...c, creator: event.target.value }))} />
          </QueryItem>
          <QueryItem label="报废方式">
            <Select value={filters.scrapMethod || undefined} allowClear options={options(['全部报废', '部分报废', '调账'])} onChange={(value) => setFilters((c) => ({ ...c, scrapMethod: value || '' }))} />
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
        title={type === 'disposal' ? '待处置池' : '申请单列表'}
        extra={<Text type="secondary">共 {filteredRows.length} 条</Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={type === 'disposal' && selectedKeys.length === 0}
              onClick={() => {
                if (type === 'disposal') {
                  onCreate(records.filter((item) => selectedKeys.includes(item.id)));
                  return;
                }
                onCreate();
              }}
            >
              {type === 'disposal' ? '发起处置' : config.createLabel}
            </Button>
            {type !== 'disposal' && (
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
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}
