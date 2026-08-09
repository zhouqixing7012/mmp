import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { ArrowLeft, Eye, Printer, Search } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const DEFAULT_FILTERS = {
  companyCn: '',
  companyEn: '',
  department: '',
  plateCn: '',
  plateEn: '',
  assetStatus: '',
  assetTag: '',
  printNo: '',
  serialNumber: '',
  userId: '',
  userName: '',
  underEmployee: '',
  assetCategory: '',
  labelType: '',
  city: '',
};

const DEFAULT_ROWS = [
  {
    id: 'tag-print-1',
    assetTag: '132121800162',
    assetName: '戴尔.Latitude E7280',
    department: '华东渠道_广告销售',
    location: '上海市.上海办公室.12层',
    companyCn: '新媒体上海',
    companyEn: 'New Media SH',
    plateCn: '搜狐网-web',
    plateEn: '-',
    printNo: '-',
    serialNumber: '5HF21N2',
    assetCategory: '11217',
    assetStatus: '在用-使用中',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-2',
    assetTag: '132111800605-V',
    assetName: '戴尔.E2417H显示器',
    department: '市场_市场部',
    location: '上海市.上海办公室.12层',
    companyCn: '新媒体上海',
    companyEn: 'New Media SH',
    plateCn: '搜狐网-web',
    plateEn: '-',
    printNo: '-',
    serialNumber: 'CN-03K25V-QDC00-81M-124I-A03',
    assetCategory: '11124',
    assetStatus: '在用-使用中',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-3',
    assetTag: '115121700002',
    assetName: '联想.THINKPAD X260',
    department: '员工服务中心_媒体',
    location: '上海市.上海办公室.12层',
    companyCn: '新媒体上海',
    companyEn: 'New Media SH',
    plateCn: '搜狐网-web',
    plateEn: '-',
    printNo: '-',
    serialNumber: 'PC0J3PJC',
    assetCategory: '11217',
    assetStatus: '在用-使用中',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-4',
    assetTag: '1231400378',
    assetName: '浪潮.Inspur SA5212H2',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023819',
    assetCategory: '11411',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-5',
    assetTag: '1231400378-H1',
    assetName: '其他.10K 300G SAS',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023819-H1',
    assetCategory: '11412',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-6',
    assetTag: '1231400378-H2',
    assetName: '其他.7.2K 2T NL_SAS',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023819-H2',
    assetCategory: '11412',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-7',
    assetTag: '1231400381',
    assetName: '浪潮.Inspur SA5212H2',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023807',
    assetCategory: '11411',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-8',
    assetTag: '1231400381-H1',
    assetName: '其他.10K 300G SAS',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023807-H1',
    assetCategory: '11412',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-9',
    assetTag: '1231400381-H2',
    assetName: '其他.7.2K 2T NL_SAS',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023807-H2',
    assetCategory: '11412',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
  {
    id: 'tag-print-10',
    assetTag: '1231400389',
    assetName: '浪潮.Inspur SA5212H2',
    department: '视频_技术成本',
    location: '上海市.上海长宽.1层',
    companyCn: '飞狐信息',
    companyEn: 'Fox Info',
    plateCn: '视频',
    plateEn: '-',
    printNo: '0',
    serialNumber: '213023826',
    assetCategory: '11411',
    assetStatus: '已报废-已处置',
    userId: '-',
    userName: '-',
    underEmployee: '-',
    labelType: '-',
    city: '上海市',
    printCount: 0,
  },
];

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function includesText(value, query) {
  if (!query) return true;
  return normalizeText(value).includes(normalizeText(query));
}

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter((value) => value && value !== '-'))];
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <Input
      value={value || ''}
      readOnly
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={onOpen}
    />
  );
}

export default function TagPrintingPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [lookupKey, setLookupKey] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.companyCn, appliedFilters.companyCn)
    && includesText(row.companyEn, appliedFilters.companyEn)
    && includesText(row.department, appliedFilters.department)
    && includesText(row.plateCn, appliedFilters.plateCn)
    && includesText(row.plateEn, appliedFilters.plateEn)
    && includesText(row.assetStatus, appliedFilters.assetStatus)
    && includesText(row.assetTag, appliedFilters.assetTag)
    && includesText(row.printNo, appliedFilters.printNo)
    && includesText(row.serialNumber, appliedFilters.serialNumber)
    && includesText(row.userId, appliedFilters.userId)
    && includesText(row.userName, appliedFilters.userName)
    && includesText(row.underEmployee, appliedFilters.underEmployee)
    && includesText(row.assetCategory, appliedFilters.assetCategory)
    && includesText(row.labelType, appliedFilters.labelType)
    && includesText(row.city, appliedFilters.city)
  )), [rows, appliedFilters]);

  const statusOptions = useMemo(() => uniqueValues(rows, 'assetStatus').map((value) => ({ label: value, value })), [rows]);
  const cityOptions = useMemo(() => uniqueValues(rows, 'city').map((value) => ({ label: value, value })), [rows]);

  const activeLookup = lookupKey === 'department' || lookupKey === 'assetCategory' ? lookupKey : '';
  const lookupLabel = activeLookup === 'department' ? '部门' : '资产类别';
  const lookupData = useMemo(() => {
    if (!activeLookup) return [];
    return uniqueValues(rows, activeLookup).map((value, index) => ({ id: `${activeLookup}-${index}`, value }));
  }, [activeLookup, rows]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handlePrint = (targetIds, actionName) => {
    if (targetIds.length === 0) {
      messageApi.warning(actionName === '打印所选' ? '请至少选择一条资产' : '当前没有可打印的数据');
      return;
    }
    const idSet = new Set(targetIds);
    setRows((current) => current.map((row) => (
      idSet.has(row.id) ? { ...row, printCount: Number(row.printCount || 0) + 1 } : row
    )));
    setSelectedRowKeys([]);
    messageApi.success(`${actionName}已提交，共 ${targetIds.length} 条`);
  };

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left', render: displayText },
    { title: '资产名称', dataIndex: 'assetName', width: 220, render: displayText },
    { title: '部门', dataIndex: 'department', width: 190, render: displayText },
    { title: '地点', dataIndex: 'location', width: 210, render: displayText },
    { title: '公司中文名', dataIndex: 'companyCn', width: 140, render: displayText },
    { title: '公司英文名', dataIndex: 'companyEn', width: 150, render: displayText },
    { title: '版块中文名', dataIndex: 'plateCn', width: 140, render: displayText },
    { title: '版块英文名', dataIndex: 'plateEn', width: 140, render: displayText },
    { title: '印刷号', dataIndex: 'printNo', width: 110, render: displayText },
    { title: '序列号', dataIndex: 'serialNumber', width: 220, render: displayText },
    { title: '资产类别', dataIndex: 'assetCategory', width: 110, render: displayText },
    {
      title: '资产状态',
      dataIndex: 'assetStatus',
      width: 140,
      render: (value) => value && value !== '-' ? <StatusTag value={value} type="business" /> : '-',
    },
    { title: '使用人', dataIndex: 'userName', width: 140, render: displayText },
    { title: '打印次数', dataIndex: 'printCount', width: 100, align: 'right' },
  ];

  if (previewMode) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft size={14} />} onClick={() => setPreviewMode(false)}>返回标签打印</Button>
          <Typography.Title level={4} className="mb-0">预打印</Typography.Title>
        </div>
        <Card size="small">
          <Empty description="预打印页面字段待确认" />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}

      <Typography.Title level={4} className="mb-0">标签打印</Typography.Title>

      <QueryBar
        onQuery={() => {
          setAppliedFilters({ ...draftFilters });
          setSelectedRowKeys([]);
        }}
        onReset={() => {
          setDraftFilters(DEFAULT_FILTERS);
          setAppliedFilters(DEFAULT_FILTERS);
          setSelectedRowKeys([]);
        }}
      >
        <QueryItem label="公司中文名称">
          <Input value={draftFilters.companyCn} allowClear placeholder="请输入公司中文名称" onChange={(event) => updateFilter('companyCn', event.target.value)} />
        </QueryItem>
        <QueryItem label="公司英文名称">
          <Input value={draftFilters.companyEn} allowClear placeholder="请输入公司英文名称" onChange={(event) => updateFilter('companyEn', event.target.value)} />
        </QueryItem>
        <QueryItem label="部门">
          <LookupInput value={draftFilters.department} placeholder="请选择部门" onOpen={() => setLookupKey('department')} />
        </QueryItem>
        <QueryItem label="版块中文名称">
          <Input value={draftFilters.plateCn} allowClear placeholder="请输入版块中文名称" onChange={(event) => updateFilter('plateCn', event.target.value)} />
        </QueryItem>
        <QueryItem label="版块英文名称">
          <Input value={draftFilters.plateEn} allowClear placeholder="请输入版块英文名称" onChange={(event) => updateFilter('plateEn', event.target.value)} />
        </QueryItem>
        <QueryItem label="资产状态">
          <Select value={draftFilters.assetStatus || undefined} allowClear placeholder="全部" options={statusOptions} onChange={(value) => updateFilter('assetStatus', value)} />
        </QueryItem>
        <QueryItem label="资产标签号">
          <Input value={draftFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => updateFilter('assetTag', event.target.value)} />
        </QueryItem>
        <QueryItem label="印刷号">
          <Input value={draftFilters.printNo} allowClear placeholder="请输入印刷号" onChange={(event) => updateFilter('printNo', event.target.value)} />
        </QueryItem>
        <QueryItem label="序列号">
          <Input value={draftFilters.serialNumber} allowClear placeholder="请输入序列号" onChange={(event) => updateFilter('serialNumber', event.target.value)} />
        </QueryItem>
        <QueryItem label="使用人编号">
          <Input value={draftFilters.userId} allowClear placeholder="请输入使用人编号" onChange={(event) => updateFilter('userId', event.target.value)} />
        </QueryItem>
        <QueryItem label="使用人姓名">
          <Input value={draftFilters.userName} allowClear placeholder="请输入使用人姓名" onChange={(event) => updateFilter('userName', event.target.value)} />
        </QueryItem>
        <QueryItem label="是否在员工名下">
          <Select
            value={draftFilters.underEmployee || undefined}
            allowClear
            placeholder="全部"
            options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]}
            onChange={(value) => updateFilter('underEmployee', value)}
          />
        </QueryItem>
        <QueryItem label="资产类别">
          <LookupInput value={draftFilters.assetCategory} placeholder="请选择资产类别" onOpen={() => setLookupKey('assetCategory')} />
        </QueryItem>
        <QueryItem label="标签类型">
          <Select value={draftFilters.labelType || undefined} allowClear placeholder="全部" options={[]} onChange={(value) => updateFilter('labelType', value)} />
        </QueryItem>
        <QueryItem label="城市">
          <Select value={draftFilters.city || undefined} allowClear placeholder="全部" options={cityOptions} onChange={(value) => updateFilter('city', value)} />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title="标签打印列表"
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button icon={<Printer size={14} />} onClick={() => handlePrint(selectedRowKeys, '打印所选')}>打印所选</Button>
            <Button icon={<Printer size={14} />} onClick={() => handlePrint(filteredRows.map((row) => row.id), '打印全部')}>打印全部</Button>
            <Button type="primary" icon={<Eye size={14} />} onClick={() => setPreviewMode(true)}>预打印</Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{
            type: 'checkbox',
            columnTitle: '选择',
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      <SelectModal
        open={Boolean(activeLookup)}
        title={`选择${lookupLabel}`}
        rowKey="id"
        dataSource={lookupData}
        searchFields={activeLookup ? [{ name: 'value', label: lookupLabel, dataIndex: 'value' }] : []}
        columns={activeLookup ? [{ title: lookupLabel, dataIndex: 'value' }] : []}
        onCancel={() => setLookupKey('')}
        onConfirm={(record) => {
          updateFilter(activeLookup, record.value);
          setLookupKey('');
        }}
      />
    </Space>
  );
}
