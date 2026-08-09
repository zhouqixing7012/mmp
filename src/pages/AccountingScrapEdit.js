import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import SelectModal from '../components/SelectModal';
import { mockCompanies } from '../mock/businessRulesMock';

const { Text, Title } = Typography;

// --- 模拟初始数据 ---
const initialData = [
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

const createTransferDetail = (asset) => ({
  assetId: asset.id,
  tagNo: asset.tagNo,
  newResponsiblePerson: '',
  newCompany: '',
  newPlate: '',
  newCostCenter: '',
  city: '',
  building: '',
  floor: '',
  adjustedWarehouse: '',
});

const transferRequiredFields = [
  ['newResponsiblePerson', '新责任人'],
  ['newCompany', '新公司'],
  ['newPlate', '新板块'],
  ['newCostCenter', '新成本中心'],
  ['city', 'City'],
  ['building', 'Building'],
  ['floor', 'Floor'],
];

const scrapTypeOptions = [
  { label: '已到报废期', value: '已到报废期' },
  { label: '未到报废期', value: '未到报废期' },
  { label: '丢失', value: '丢失' },
];

const requiredTitle = (text) => (
  <span>
    <span className="text-red-500 mr-1">*</span>
    {text}
  </span>
);

export default function AccountingScrapEdit() {
  const [formData, setFormData] = useState({
    docNo: 'BF-202309280001',
    company: '114.新媒体',
    status: '草稿',
    creator: 'admin-系统管理员',
    createDate: '2023-09-28',
    intercompanyTransfer: '否',
    expiredReason: '',
    unexpiredReason: '',
    lostReason: '',
    remarks: '',
  });

  const [tableData, setTableData] = useState(initialData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [companySelectContext, setCompanySelectContext] = useState(null);
  const [transferDetails, setTransferDetails] = useState(() => initialData.map(createTransferDetail));

  // 资产明细发生增删时，公司间转移明细严格按资产明细一一同步。
  useEffect(() => {
    setTransferDetails((current) => tableData.map((asset) => {
      const existing = current.find((item) => item.assetId === asset.id);
      return existing
        ? { ...existing, assetId: asset.id, tagNo: asset.tagNo }
        : createTransferDetail(asset);
    }));
  }, [tableData]);

  const updateFormField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      category: '新增资产类别',
      tagNo: `NEW-TAG-${Date.now().toString().slice(-4)}`,
      assetNo: 'NEW-ASSET',
      description: '新增资产说明',
      keyword: '新增',
      qty: 1,
      originalValue: '1000.00',
      purchaseDate: '2023-10-01',
      lifeMonths: 36,
      accumulatedDepreciation: '100.00',
      netValue: '900.00',
      responsiblePerson: '测试员',
      responsiblePersonId: 'EMP999',
      city: '未知',
      location: '未知',
      floor: '1F',
      scrapMethod: '全部报废',
      scrapType: '已到报废期',
      reason: '测试原因',
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setTableData((prev) => prev.filter((row) => !selectedRows.includes(row.id)));
    setSelectedRows([]);
  };

  const handleDeleteRow = (id) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
  };

  const handleTableChange = (id, field, value) => {
    setTableData((prevData) => prevData.map((row) => (
      row.id === id ? { ...row, [field]: value } : row
    )));
  };

  const updateTransferDetail = (assetId, field, value) => {
    setTransferDetails((current) => current.map((item) => (
      item.assetId === assetId ? { ...item, [field]: value } : item
    )));
  };

  const handleCompanyConfirm = (record) => {
    const companyValue = `${record.code}.${record.desc}`;
    if (companySelectContext?.type === 'form') {
      updateFormField('company', companyValue);
    }
    if (companySelectContext?.type === 'transfer') {
      updateTransferDetail(companySelectContext.assetId, 'newCompany', companyValue);
    }
    setCompanySelectContext(null);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 20971520) {
        message.error(`文件“${file.name}”超过 20MB 限制`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setAttachments((prev) => [
        ...prev,
        ...validFiles.map((file) => ({
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        })),
      ]);
    }

    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!formData.company) {
      message.error('请选择公司');
      return;
    }

    if (formData.intercompanyTransfer === '是') {
      for (const detail of transferDetails) {
        const missingField = transferRequiredFields.find(([field]) => !String(detail[field] || '').trim());
        if (missingField) {
          message.error(`资产 ${detail.tagNo} 的${missingField[1]}不能为空`);
          return;
        }
      }
    }

    message.success('账面报废申请校验通过');
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
          description="删除后，公司间转移明细中的对应资产也会同步移除。"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDeleteRow(record.id)}
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
          onChange={(nextValue) => handleTableChange(record.id, 'scrapType', nextValue)}
        />
      ),
    },
    { title: '报废原因', dataIndex: 'reason', width: 180, ellipsis: true },
  ], []);

  const transferColumns = useMemo(() => [
    {
      title: requiredTitle('资产标签号'),
      dataIndex: 'tagNo',
      key: 'tagNo',
      width: 160,
      fixed: 'left',
      render: (value) => (
        <div className="px-2 py-1.5 rounded bg-[#f5f7fa] border border-[#e5e7eb]">
          <Text className="font-mono text-[#1677ff]">{value}</Text>
        </div>
      ),
    },
    {
      title: requiredTitle('新责任人'),
      dataIndex: 'newResponsiblePerson',
      key: 'newResponsiblePerson',
      width: 160,
      render: (value, record) => (
        <Input
          value={value}
          placeholder="请输入新责任人"
          onChange={(e) => updateTransferDetail(record.assetId, 'newResponsiblePerson', e.target.value)}
        />
      ),
    },
    {
      title: requiredTitle('新公司'),
      dataIndex: 'newCompany',
      key: 'newCompany',
      width: 200,
      render: (value, record) => (
        <div
          className="relative cursor-pointer group"
          onClick={() => setCompanySelectContext({ type: 'transfer', assetId: record.assetId })}
        >
          <Input
            value={value}
            readOnly
            placeholder="请选择新公司"
            className="pointer-events-none pr-9 group-hover:border-[#1677ff]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
        </div>
      ),
    },
    {
      title: requiredTitle('新板块'),
      dataIndex: 'newPlate',
      key: 'newPlate',
      width: 160,
      render: (value, record) => (
        <Input value={value} placeholder="请输入新板块" onChange={(e) => updateTransferDetail(record.assetId, 'newPlate', e.target.value)} />
      ),
    },
    {
      title: requiredTitle('新成本中心'),
      dataIndex: 'newCostCenter',
      key: 'newCostCenter',
      width: 180,
      render: (value, record) => (
        <Input value={value} placeholder="请输入新成本中心" onChange={(e) => updateTransferDetail(record.assetId, 'newCostCenter', e.target.value)} />
      ),
    },
    {
      title: requiredTitle('City'),
      dataIndex: 'city',
      key: 'city',
      width: 140,
      render: (value, record) => (
        <Input value={value} placeholder="请输入 City" onChange={(e) => updateTransferDetail(record.assetId, 'city', e.target.value)} />
      ),
    },
    {
      title: requiredTitle('Building'),
      dataIndex: 'building',
      key: 'building',
      width: 160,
      render: (value, record) => (
        <Input value={value} placeholder="请输入 Building" onChange={(e) => updateTransferDetail(record.assetId, 'building', e.target.value)} />
      ),
    },
    {
      title: requiredTitle('Floor'),
      dataIndex: 'floor',
      key: 'floor',
      width: 130,
      render: (value, record) => (
        <Input value={value} placeholder="请输入 Floor" onChange={(e) => updateTransferDetail(record.assetId, 'floor', e.target.value)} />
      ),
    },
    {
      title: '调账后仓库',
      dataIndex: 'adjustedWarehouse',
      key: 'adjustedWarehouse',
      width: 190,
      render: (value, record) => (
        <Input value={value} placeholder="请输入调账后仓库" onChange={(e) => updateTransferDetail(record.assetId, 'adjustedWarehouse', e.target.value)} />
      ),
    },
  ], []);

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-gray-800 pb-24">
      <div className="max-w-[1800px] mx-auto p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 px-1">
          <div>
            <Title level={3} className="!mb-1 !text-[22px]">账面报废申请单</Title>
            <Text type="secondary">填写账面报废信息并维护本次涉及的资产明细。</Text>
          </div>
          <div className="text-right pt-1">
            <Text type="secondary" className="block text-xs mb-1">申请单号</Text>
            <Text strong className="font-mono text-[15px]">{formData.docNo}</Text>
          </div>
        </div>

        <Card size="small" title="基本信息" className="shadow-sm">
          <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
            <Descriptions.Item label="申请单号">
              <Text className="font-mono">{formData.docNo}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={requiredTitle('公司')}>
              <div
                className="relative cursor-pointer group max-w-[360px]"
                onClick={() => setCompanySelectContext({ type: 'form' })}
              >
                <Input
                  value={formData.company}
                  readOnly
                  placeholder="请选择公司"
                  className="pointer-events-none pr-9 group-hover:border-[#1677ff]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="单据状态">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#faad14]" />
                {formData.status}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="制单人">{formData.creator}</Descriptions.Item>
            <Descriptions.Item label="制单时间">{formData.createDate}</Descriptions.Item>
            <Descriptions.Item label={requiredTitle('是否公司间转移')}>
              <Radio.Group
                value={formData.intercompanyTransfer}
                optionType="button"
                buttonStyle="solid"
                onChange={(e) => updateFormField('intercompanyTransfer', e.target.value)}
                options={[
                  { label: '否', value: '否' },
                  { label: '是', value: '是' },
                ]}
              />
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>
              <Input.TextArea
                value={formData.remarks}
                onChange={(e) => updateFormField('remarks', e.target.value)}
                placeholder="请输入备注信息"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="附件" span={3}>
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-block cursor-pointer">
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    <Button icon={<Upload size={15} />} className="pointer-events-none">上传附件</Button>
                  </label>
                  <Text type="secondary" className="text-xs flex items-center gap-1">
                    <AlertCircle size={14} /> 单个文件大小不超过 20MB
                  </Text>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#fafafa] border border-[#e5e7eb] text-sm">
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="max-w-[240px] truncate" title={file.name}>{file.name}</span>
                        <Text type="secondary" className="text-xs">{file.size}</Text>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<X size={14} />}
                          onClick={() => setAttachments((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="报废原因" className="shadow-sm">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#e8eaed] bg-[#fafbfc] p-4">
              <div className="font-medium text-gray-800 mb-2">已到报废期报废原因</div>
              <Input.TextArea
                value={formData.expiredReason}
                onChange={(e) => updateFormField('expiredReason', e.target.value)}
                placeholder="请输入已到报废期报废原因"
                autoSize={{ minRows: 4, maxRows: 6 }}
              />
            </div>
            <div className="rounded-lg border border-[#e8eaed] bg-[#fafbfc] p-4">
              <div className="font-medium text-gray-800 mb-2">未到报废期报废原因</div>
              <Input.TextArea
                value={formData.unexpiredReason}
                onChange={(e) => updateFormField('unexpiredReason', e.target.value)}
                placeholder="请输入未到报废期报废原因"
                autoSize={{ minRows: 4, maxRows: 6 }}
              />
            </div>
            <div className="rounded-lg border border-[#e8eaed] bg-[#fafbfc] p-4">
              <div className="font-medium text-gray-800 mb-2">丢失报废原因</div>
              <Input.TextArea
                value={formData.lostReason}
                onChange={(e) => updateFormField('lostReason', e.target.value)}
                placeholder="请输入丢失报废原因"
                autoSize={{ minRows: 4, maxRows: 6 }}
              />
            </div>
          </div>
        </Card>

        <Card
          size="small"
          title="资产明细"
          className="shadow-sm"
          extra={<Text type="secondary">共 {tableData.length} 条</Text>}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <Space wrap>
              <Button type="primary" icon={<Plus size={15} />} onClick={handleAddRow}>添加物资</Button>
              <Popconfirm
                title="确认删除已选资产？"
                description="删除后，公司间转移明细中的对应资产也会同步移除。"
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                disabled={selectedRows.length === 0}
                onConfirm={handleDeleteSelected}
              >
                <Button danger icon={<Trash2 size={15} />} disabled={selectedRows.length === 0}>
                  删除物资{selectedRows.length > 0 ? `（${selectedRows.length}）` : ''}
                </Button>
              </Popconfirm>
            </Space>
            <Space wrap>
              <Button icon={<FileSpreadsheet size={15} />}>导出明细</Button>
              <Button icon={<Download size={15} />}>下载模板</Button>
              <Button icon={<Upload size={15} />}>Excel导入</Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            size="small"
            bordered
            columns={assetColumns}
            dataSource={tableData}
            rowSelection={{
              selectedRowKeys: selectedRows,
              onChange: setSelectedRows,
              fixed: true,
            }}
            scroll={{ x: 2550 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showTotal: (total) => `共 ${total} 条`,
            }}
            locale={{ emptyText: '暂无物资数据，请点击“添加物资”' }}
          />
        </Card>

        {formData.intercompanyTransfer === '是' && (
          <Card
            size="small"
            title="公司间转移明细"
            className="shadow-sm border-[#adc6ff]"
            extra={<Text type="secondary">与资产明细保持一一对应</Text>}
          >
            <div className="mb-3 px-3 py-2.5 rounded-md bg-[#f0f5ff] border border-[#d6e4ff] text-sm text-[#34558b]">
              资产标签号由上方资产明细自动带入，不能修改，也不能在本区域新增或删除资产。除“调账后仓库”外，其余字段均为必填。
            </div>
            <Table
              rowKey="assetId"
              columns={transferColumns}
              dataSource={transferDetails}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 1480 }}
              locale={{ emptyText: '资产明细暂无资产' }}
            />
          </Card>
        )}
      </div>

      <SelectModal
        open={Boolean(companySelectContext)}
        onCancel={() => setCompanySelectContext(null)}
        onConfirm={handleCompanyConfirm}
        title="选择公司"
        dataSource={mockCompanies}
        rowKey="id"
        searchFields={[
          { label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入公司编码' },
          { label: '公司名称', name: 'desc', dataIndex: 'desc', placeholder: '请输入公司名称' },
        ]}
        columns={[
          { title: '公司编码', dataIndex: 'code' },
          { title: '公司名称', dataIndex: 'desc' },
        ]}
      />

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur border-t border-[#e5e7eb] shadow-[0_-6px_20px_rgba(15,23,42,0.06)] z-40">
        <div className="max-w-[1800px] mx-auto px-5 py-3 flex justify-center gap-3">
          <Button className="min-w-[88px]">返回</Button>
          <Button className="min-w-[88px]">保存</Button>
          <Button type="primary" className="min-w-[104px]" onClick={handleSubmit}>提交</Button>
        </div>
      </div>
    </div>
  );
}
