import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';

const { Text, Title } = Typography;

const AVAILABLE_ASSETS = [
  {
    id: 1,
    category: 'IT设备.笔记本电脑',
    tagNo: 'AST-2023-001',
    assetNo: 'NO-20230001',
    description: '联想ThinkPad T14',
    keyword: '笔记本',
    qty: 1,
    originalValue: '8500.00',
    purchaseDate: '2023-01-15',
    lifeMonths: 36,
    accumulatedDepreciation: '4250.00',
    netValue: '4250.00',
    responsiblePerson: '张三',
    responsiblePersonId: 'EMP001',
    city: '北京',
    location: '朝阳区A座',
    floor: '5F',
    scrapMethod: '全部报废',
    scrapType: '已到报废期',
    reason: '设备老化，性能不达标',
  },
  {
    id: 2,
    category: '办公家具.办公椅',
    tagNo: 'AST-2021-045',
    assetNo: 'NO-20210045',
    description: '人体工学椅',
    keyword: '办公椅',
    qty: 5,
    originalValue: '2500.00',
    purchaseDate: '2021-06-20',
    lifeMonths: 60,
    accumulatedDepreciation: '2000.00',
    netValue: '500.00',
    responsiblePerson: '李四',
    responsiblePersonId: 'EMP002',
    city: '上海',
    location: '浦东新区B座',
    floor: '12F',
    scrapMethod: '部分报废',
    scrapType: '未到报废期',
    reason: '靠背断裂无法修复',
  },
];

const scrapTypeOptions = [
  { label: '已到报废期', value: '已到报废期' },
  { label: '未到报废期', value: '未到报废期' },
  { label: '丢失', value: '丢失' },
];

export default function AssetDisposalEditPage({ onBack }) {
  const [disposalDescription, setDisposalDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [pickerSelectedKeys, setPickerSelectedKeys] = useState([]);

  const updateAsset = (id, field, value) => {
    setTableData((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const deleteAsset = (id) => {
    setTableData((current) => current.filter((item) => item.id !== id));
    setSelectedRowKeys((current) => current.filter((key) => key !== id));
  };

  const handleDeleteSelected = () => {
    const selectedSet = new Set(selectedRowKeys);
    setTableData((current) => current.filter((item) => !selectedSet.has(item.id)));
    setSelectedRowKeys([]);
  };

  const handleAddAssets = () => {
    const existingIds = new Set(tableData.map((item) => item.id));
    const selectedAssets = AVAILABLE_ASSETS.filter(
      (item) => pickerSelectedKeys.includes(item.id) && !existingIds.has(item.id),
    );
    setTableData((current) => [...current, ...selectedAssets]);
    setPickerSelectedKeys([]);
    setAssetPickerOpen(false);
  };

  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);
    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      })),
    ]);
    event.target.value = '';
  };

  const assetColumns = useMemo(() => [
    {
      title: '行号',
      key: 'index',
      width: 64,
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '操作',
      key: 'action',
      width: 72,
      fixed: 'left',
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="确认删除该资产？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteAsset(record.id)}
        >
          <Button type="text" danger size="small" icon={<Trash2 size={15} />} />
        </Popconfirm>
      ),
    },
    { title: '资产类别', dataIndex: 'category', width: 150, fixed: 'left', ellipsis: true },
    {
      title: '资产标签号',
      dataIndex: 'tagNo',
      width: 150,
      fixed: 'left',
      ellipsis: true,
      render: (value) => <Text className="font-mono text-[#1677ff]">{value}</Text>,
    },
    { title: '资产编号', dataIndex: 'assetNo', width: 130, ellipsis: true },
    { title: '资产说明', dataIndex: 'description', width: 180, ellipsis: true },
    { title: '资产关键字', dataIndex: 'keyword', width: 130, ellipsis: true },
    { title: '数量', dataIndex: 'qty', width: 80, align: 'right' },
    { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right' },
    { title: '购买日期', dataIndex: 'purchaseDate', width: 120, align: 'center' },
    { title: '资产寿命（月）', dataIndex: 'lifeMonths', width: 120, align: 'right' },
    { title: '累计折旧', dataIndex: 'accumulatedDepreciation', width: 110, align: 'right' },
    { title: '净值', dataIndex: 'netValue', width: 110, align: 'right' },
    { title: '责任人姓名', dataIndex: 'responsiblePerson', width: 110, ellipsis: true },
    { title: '责任人工号', dataIndex: 'responsiblePersonId', width: 110, ellipsis: true },
    { title: '资产所在城市', dataIndex: 'city', width: 110, ellipsis: true },
    { title: '资产所在地点', dataIndex: 'location', width: 140, ellipsis: true },
    { title: '资产所在楼层', dataIndex: 'floor', width: 110, ellipsis: true },
    { title: '报废方式', dataIndex: 'scrapMethod', width: 110, ellipsis: true },
    {
      title: '报废类型',
      dataIndex: 'scrapType',
      width: 140,
      render: (value, record) => (
        <Select
          value={value}
          options={scrapTypeOptions}
          size="small"
          className="w-full"
          onChange={(nextValue) => updateAsset(record.id, 'scrapType', nextValue)}
        />
      ),
    },
    { title: '报废原因', dataIndex: 'reason', width: 180, ellipsis: true },
  ], []);

  const pickerColumns = [
    { title: '资产类别', dataIndex: 'category', width: 160 },
    { title: '资产标签号', dataIndex: 'tagNo', width: 160 },
    { title: '资产说明', dataIndex: 'description', width: 220 },
    { title: '责任人姓名', dataIndex: 'responsiblePerson', width: 120 },
    { title: '资产所在城市', dataIndex: 'city', width: 120 },
  ];

  return (
    <div className="space-y-4 pb-4 text-gray-800">
      <div className="flex items-center justify-between gap-4 px-1">
        <Title level={3} className="!mb-0 !text-[22px]">资产处置申请单</Title>
      </div>

      <Card size="small" title="基本信息" className="shadow-sm">
        <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
          <Descriptions.Item label="制单人">admin-系统管理员</Descriptions.Item>
          <Descriptions.Item label="制单时间">{dayjs().format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="" />
          <Descriptions.Item label="处置说明" span={3}>
            <Input.TextArea
              value={disposalDescription}
              onChange={(event) => setDisposalDescription(event.target.value)}
              placeholder="请输入处置说明"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="附件" span={3}>
            <div className="space-y-2">
              <label className="inline-block cursor-pointer">
                <input type="file" multiple className="hidden" onChange={handleAttachmentChange} />
                <Button icon={<Upload size={15} />} className="pointer-events-none">上传附件</Button>
              </label>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="inline-flex items-center gap-2 rounded-md border border-[#e5e7eb] bg-[#fafafa] px-3 py-1.5 text-sm"
                    >
                      <span className="max-w-[260px] truncate" title={file.name}>{file.name}</span>
                      <Text type="secondary" className="text-xs">{file.size}</Text>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<X size={14} />}
                        onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        size="small"
        title="资产明细"
        className="shadow-sm"
        extra={<Text type="secondary">共 {tableData.length} 条</Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button type="primary" icon={<Plus size={15} />} onClick={() => setAssetPickerOpen(true)}>
              添加物资
            </Button>
            <Popconfirm
              title="确认删除已选资产？"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              disabled={selectedRowKeys.length === 0}
              onConfirm={handleDeleteSelected}
            >
              <Button danger icon={<Trash2 size={15} />} disabled={selectedRowKeys.length === 0}>
                删除物资{selectedRowKeys.length > 0 ? `（${selectedRowKeys.length}）` : ''}
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={assetColumns}
          dataSource={tableData}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
          }}
          scroll={{ x: 2550 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: '暂无资产数据，请点击“添加物资”' }}
        />
      </Card>

      <div className="sticky bottom-0 z-40 flex justify-center gap-3 border-t border-[#e5e7eb] bg-white/95 px-5 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur">
        <Button className="min-w-[88px]" onClick={onBack}>返回</Button>
        <Button className="min-w-[88px]" onClick={() => message.success('保存成功')}>保存</Button>
        <Button type="primary" className="min-w-[104px]" onClick={() => message.success('提交成功')}>提交</Button>
      </div>

      <Modal
        title="选择资产"
        open={assetPickerOpen}
        width={860}
        okText="确定"
        cancelText="取消"
        onOk={handleAddAssets}
        onCancel={() => {
          setAssetPickerOpen(false);
          setPickerSelectedKeys([]);
        }}
      >
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={pickerColumns}
          dataSource={AVAILABLE_ASSETS}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: pickerSelectedKeys,
            onChange: setPickerSelectedKeys,
            getCheckboxProps: (record) => ({
              disabled: tableData.some((item) => item.id === record.id),
            }),
          }}
        />
      </Modal>
    </div>
  );
}
