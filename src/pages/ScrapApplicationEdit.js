import React, { useMemo, useState } from 'react';
import { Download, Plus, Search, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import SelectModal from '../components/SelectModal';

const { Text, Title } = Typography;

const emptyRow = (id) => ({
  id,
  tagNo: '',
  serialNo: '',
  quantity: 1,
  category: '',
  subCategory: '',
  description: '',
  status: '',
  originalValue: '',
  netValue: '',
  startDate: '',
  scrapReason: '',
});

const mockFinancialCompanies = [
  { id: '1', code: 'CW-001', name: '新媒体财务公司', taxNo: '91110108MA...' },
  { id: '2', code: 'CW-002', name: '科技财务公司', taxNo: '91110105MA...' },
  { id: '3', code: 'CW-003', name: '文化财务公司', taxNo: '91110115MA...' },
];

const requiredTitle = (text) => (
  <span>
    <span className="mr-1 text-red-500">*</span>
    {text}
  </span>
);

export default function ScrapApplicationEdit({ embedded = false, onBack }) {
  const [activeTab, setActiveTab] = useState('assets');
  const [description, setDescription] = useState('');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [company, setCompany] = useState('');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [assetCategory, setAssetCategory] = useState(undefined);
  const [assetLocation, setAssetLocation] = useState(undefined);
  const [errors, setErrors] = useState({});

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(Date.now())]);
    setActiveTab('assets');
  };

  const deleteRows = () => {
    if (!selected.length) {
      message.warning('请先选择要删除的行');
      return;
    }
    setRows((prev) => prev.filter((item) => !selected.includes(item.id)));
    setSelected([]);
    message.success('已删除所选行');
  };

  const updateRow = (id, key, value) => {
    setRows((prev) => prev.map((row) => (
      row.id === id ? { ...row, [key]: value } : row
    )));
  };

  const handleExit = () => {
    if (embedded && onBack) {
      onBack();
      return;
    }
    window.history.back();
  };

  const validateRequired = () => {
    const newErrors = {};
    if (!company) newErrors.company = true;
    if (!assetCategory) newErrors.assetCategory = true;
    if (!assetLocation) newErrors.assetLocation = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateRequired()) {
      message.error('请填写所有必填字段');
      return;
    }
    message.success('保存成功');
  };

  const handleSubmit = () => {
    if (!validateRequired()) {
      message.error('请填写所有必填字段');
      return;
    }
    message.success('提交成功');
  };

  const tableColumns = useMemo(() => {
    const editableColumns = [
      ['tagNo', '资产标签号', 180],
      ['serialNo', '资产序列号', 170],
      ['quantity', '数量', 80],
      ['category', '资产大类', 130],
      ['subCategory', '资产小类', 130],
      ['description', '资产说明', 180],
      ['status', '资产状态', 130],
      ['originalValue', '原值', 120],
      ['netValue', '净值', 120],
      ['startDate', '启用日期', 145],
      ['scrapReason', '报废原因', 180],
    ];

    return [
      {
        title: '行号',
        key: 'index',
        width: 64,
        fixed: 'left',
        align: 'center',
        render: (_, __, index) => index + 1,
      },
      ...editableColumns.map(([key, title, width]) => ({
        title,
        dataIndex: key,
        key,
        width,
        render: (value, record) => (
          <Input
            type={key === 'quantity' ? 'number' : key === 'startDate' ? 'date' : 'text'}
            value={value}
            onChange={(event) => updateRow(record.id, key, event.target.value)}
          />
        ),
      })),
    ];
  }, []);

  const renderCompanyPicker = () => (
    <div
      className="group relative cursor-pointer"
      onClick={() => setCompanyModalOpen(true)}
    >
      <Input
        value={company}
        readOnly
        status={errors.company ? 'error' : undefined}
        placeholder="请选择财务公司"
        className="pointer-events-none pr-9 group-hover:border-[#1677ff]"
      />
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1677ff]" />
    </div>
  );

  return (
    <div className={embedded ? 'pb-4 text-gray-800' : 'min-h-screen bg-[#f5f7fa] pb-24 text-gray-800'}>
      <div className="mx-auto max-w-[1800px] space-y-4 p-5">
        <div className="flex items-start justify-between gap-4 px-1">
          <Title level={3} className="!mb-0 !text-[22px]">报废申请单</Title>
          <div className="pt-1 text-right">
            <Text type="secondary" className="mb-1 block text-xs">单据编号</Text>
            <Text className="font-mono text-[15px] text-gray-400">保存/提交后生成</Text>
          </div>
        </div>

        <Card size="small" title="基本信息" className="shadow-sm">
          <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
            <Descriptions.Item label="单据编号">
              <Text type="secondary">保存/提交后生成</Text>
            </Descriptions.Item>
            <Descriptions.Item label="单据状态">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#faad14]" />
                草稿
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="资产责任人">陈才慧</Descriptions.Item>

            <Descriptions.Item label={requiredTitle('公司')}>
              <div className="max-w-[360px]">
                {renderCompanyPicker()}
                {errors.company && <div className="mt-1 text-xs text-[#ff4d4f]">请选择公司</div>}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={requiredTitle('资产大类')}>
              <div className="max-w-[360px]">
                <Select
                  status={errors.assetCategory ? 'error' : undefined}
                  placeholder="请选择"
                  value={assetCategory}
                  options={[
                    { value: '服务器', label: '服务器' },
                    { value: '网络设备', label: '网络设备' },
                  ]}
                  className="w-full"
                  onChange={(value) => {
                    setAssetCategory(value);
                    setErrors((prev) => ({ ...prev, assetCategory: false }));
                  }}
                />
                {errors.assetCategory && <div className="mt-1 text-xs text-[#ff4d4f]">请选择资产大类</div>}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={requiredTitle('资产所在地')}>
              <div className="max-w-[360px]">
                <Select
                  status={errors.assetLocation ? 'error' : undefined}
                  placeholder="请选择"
                  value={assetLocation}
                  options={[
                    { value: '北京', label: '北京' },
                    { value: '非北京', label: '非北京' },
                  ]}
                  className="w-full"
                  onChange={(value) => {
                    setAssetLocation(value);
                    setErrors((prev) => ({ ...prev, assetLocation: false }));
                  }}
                />
                {errors.assetLocation && <div className="mt-1 text-xs text-[#ff4d4f]">请选择资产所在地</div>}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="申请日期">2026-04-15</Descriptions.Item>
            <Descriptions.Item label="报废说明" span={3}>
              <Input.TextArea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="请详细描述报废原因..."
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          size="small"
          title="报废资产明细"
          className="shadow-sm"
          extra={<Text type="secondary">共 {rows.length} 条</Text>}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: 'assets', label: '报废资产' },
                { key: 'parts', label: '关联配件' },
              ]}
            />
            <Space wrap>
              <Button
                icon={<Download size={15} />}
                onClick={() => message.info('Excel 导入功能已预留')}
              >
                导入Excel
              </Button>
              <Button type="primary" icon={<Plus size={15} />} onClick={addRow}>
                增行
              </Button>
              <Button danger icon={<Trash2 size={15} />} onClick={deleteRows}>
                删行{selected.length > 0 ? `（${selected.length}）` : ''}
              </Button>
            </Space>
          </div>

          {activeTab === 'assets' ? (
            <Table
              rowKey="id"
              size="small"
              bordered
              columns={tableColumns}
              dataSource={rows}
              rowSelection={{
                selectedRowKeys: selected,
                onChange: setSelected,
                fixed: true,
              }}
              scroll={{ x: 1600 }}
              pagination={false}
              locale={{ emptyText: '暂无报废资产，请点击“增行”添加' }}
            />
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded border border-[#f0f0f0] text-gray-400">
              暂无关联配件
            </div>
          )}
        </Card>
      </div>

      <SelectModal
        open={companyModalOpen}
        title="选择财务公司"
        dataSource={mockFinancialCompanies}
        columns={[
          { title: '编码', dataIndex: 'code' },
          { title: '名称', dataIndex: 'name' },
          { title: '税号', dataIndex: 'taxNo' },
        ]}
        searchFields={[
          { label: '编码', name: 'code', dataIndex: 'code' },
          { label: '名称', name: 'name', dataIndex: 'name' },
        ]}
        onCancel={() => setCompanyModalOpen(false)}
        onConfirm={(record) => {
          setCompany(record.name);
          setErrors((prev) => ({ ...prev, company: false }));
          setCompanyModalOpen(false);
        }}
      />

      <div className={`${embedded ? 'sticky' : 'fixed left-0'} bottom-0 z-40 w-full border-t border-[#e5e7eb] bg-white/95 shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur`}>
        <div className="mx-auto flex max-w-[1800px] justify-center gap-3 px-5 py-3">
          <Button className="min-w-[88px]" onClick={handleExit}>退出</Button>
          <Button className="min-w-[88px]" onClick={handleSave}>保存</Button>
          <Button type="primary" className="min-w-[104px]" onClick={handleSubmit}>提交</Button>
        </div>
      </div>
    </div>
  );
}
