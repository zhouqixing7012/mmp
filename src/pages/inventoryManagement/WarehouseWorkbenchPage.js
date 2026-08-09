import React, { useRef, useState } from 'react';
import { Button, Card, Input, Select, Space, Table, Tabs, Typography, message as antdMessage } from 'antd';
import { RefreshCcw, ScanLine, Search, UserRound } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';

const EMPTY_FILTERS = {
  assetTag: '',
  employeeCard: '',
  employeeName: '',
  assetName: '',
  documentNo: '',
  documentType: '',
};

function PageTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-1.5 rounded bg-[#1677ff]" />
      <Typography.Title level={3} className="mb-0">{children}</Typography.Title>
    </div>
  );
}

export default function WarehouseWorkbenchPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const assetTagRef = useRef(null);
  const employeeCardRef = useRef(null);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const columns = [
    { title: '行号', dataIndex: 'index', width: 80, align: 'center' },
    { title: '申请单编号', dataIndex: 'applicationNo', width: 240 },
    { title: '单据类型', dataIndex: 'documentType', width: 180 },
    { title: '审批环节', dataIndex: 'approvalNode', width: 220 },
    { title: '申请人', dataIndex: 'applicant', width: 180 },
    { title: '申请时间', dataIndex: 'applicationTime', width: 200 },
    { title: '操作', key: 'operation', width: 120, fixed: 'right', render: () => '-' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>库管员工作台</PageTitle>

      <div className="flex justify-end">
        <Space wrap>
          <Button icon={<ScanLine size={14} />} onClick={() => assetTagRef.current?.focus()}>扫码</Button>
          <Button onClick={() => employeeCardRef.current?.focus()}>刷卡</Button>
          <Button icon={<UserRound size={14} />} onClick={() => messageApi.info('员工页面字段待确认')}>员工页面</Button>
          <Button icon={<RefreshCcw size={14} />} onClick={() => messageApi.success('员工页面已刷新（原型）')}>刷新员工页面</Button>
        </Space>
      </div>

      <Card size="small">
        <Tabs activeKey="asset-io" items={[{ key: 'asset-io', label: '资产出入库' }]} />

        <QueryBar buttons={null}>
          <QueryItem label="资产标签号">
            <Input
              ref={assetTagRef}
              value={draftFilters.assetTag}
              allowClear
              placeholder="扫描/输入资产标签号"
              onChange={(event) => updateFilter('assetTag', event.target.value)}
            />
          </QueryItem>
          <QueryItem label="员工卡号">
            <Input
              ref={employeeCardRef}
              value={draftFilters.employeeCard}
              allowClear
              placeholder="刷卡/输入员工编号"
              onChange={(event) => updateFilter('employeeCard', event.target.value)}
            />
          </QueryItem>
          <QueryItem label="员工姓名">
            <Input
              value={draftFilters.employeeName}
              allowClear
              placeholder="请输入员工姓名"
              onChange={(event) => updateFilter('employeeName', event.target.value)}
            />
          </QueryItem>
          <QueryItem label="资产名称">
            <Input
              value={draftFilters.assetName}
              allowClear
              placeholder="请输入资产名称"
              onChange={(event) => updateFilter('assetName', event.target.value)}
            />
          </QueryItem>
          <QueryItem label="单据编号">
            <Input
              value={draftFilters.documentNo}
              allowClear
              placeholder="请输入单据编号"
              onChange={(event) => updateFilter('documentNo', event.target.value)}
            />
          </QueryItem>
          <QueryItem label="单据类型">
            <Select
              value={draftFilters.documentType || undefined}
              allowClear
              placeholder="请选择"
              options={[]}
              onChange={(value) => updateFilter('documentType', value)}
            />
          </QueryItem>
        </QueryBar>

        <div className="-mt-2 mb-4 flex justify-center">
          <Button
            type="primary"
            icon={<Search size={14} />}
            onClick={() => setAppliedFilters({ ...draftFilters })}
          >
            查询
          </Button>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={[]}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      <span className="hidden">{JSON.stringify(appliedFilters)}</span>
    </Space>
  );
}
