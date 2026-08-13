import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, Search, Trash2, Upload, X } from 'lucide-react';
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
import SelectModal from '../../components/SelectModal';
import {
  mockCompanies,
  mockCostCenters,
  mockLocationBasicDataData,
  mockPlates,
  mockWarehouseInfoData,
} from '../../mock/businessRulesMock';

const { Text, Title } = Typography;

// 与账面报废申请页使用同一组演示资产，避免产生另一套数据口径。
const AVAILABLE_ASSETS = [
  {
    id: 1,
    category: 'IT设备.笔记本电脑',
    tagNo: 'AST-2023-001',
    description: '联想ThinkPad T14',
    responsiblePerson: '张三',
    city: '北京',
    floor: '5F',
  },
  {
    id: 2,
    category: '办公家具.办公椅',
    tagNo: 'AST-2021-045',
    description: '人体工学椅',
    responsiblePerson: '李四',
    city: '上海',
    floor: '12F',
  },
];

const transferRequiredFields = [
  ['newResponsiblePerson', '新责任人'],
  ['newCompany', '新公司'],
  ['newPlate', '新板块'],
  ['newCostCenter', '新成本中心'],
  ['city', 'City'],
  ['building', 'Building'],
  ['floor', 'Floor'],
];

const requiredTitle = (text) => (
  <span>
    <span className="mr-1 text-red-500">*</span>
    {text}
  </span>
);

const formatCodeDesc = (record) => {
  if (!record) return '';
  const code = String(record.code || '').trim();
  const desc = String(record.desc || '').trim();
  if (!code) return desc;
  if (!desc) return code;
  if (desc.startsWith(code)) return desc;
  return `${code}.${desc}`;
};

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

export default function CompanyTransferEditPage({ onBack }) {
  const [formData, setFormData] = useState({
    company: '',
    status: '草稿',
    creator: 'admin-系统管理员',
    createDate: dayjs().format('YYYY-MM-DD'),
    remarks: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [transferDetails, setTransferDetails] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [pickerSelectedKeys, setPickerSelectedKeys] = useState([]);
  const [selectContext, setSelectContext] = useState(null);

  const updateFormField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updateTransferDetail = (assetId, field, value) => {
    setTransferDetails((current) => current.map((item) => (
      item.assetId === assetId ? { ...item, [field]: value } : item
    )));
  };

  const handleAddAssets = () => {
    const existingIds = new Set(transferDetails.map((item) => item.assetId));
    const selectedAssets = AVAILABLE_ASSETS.filter(
      (item) => pickerSelectedKeys.includes(item.id) && !existingIds.has(item.id),
    );
    setTransferDetails((current) => [
      ...current,
      ...selectedAssets.map(createTransferDetail),
    ]);
    setPickerSelectedKeys([]);
    setAssetPickerOpen(false);
  };

  const handleDeleteSelected = () => {
    if (selectedRowKeys.length === 0) return;
    const selectedSet = new Set(selectedRowKeys);
    setTransferDetails((current) => current.filter((item) => !selectedSet.has(item.assetId)));
    setSelectedRowKeys([]);
  };

  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 20 * 1024 * 1024) {
        message.error(`文件“${file.name}”超过 20MB 限制`);
        return false;
      }
      return true;
    });

    setAttachments((current) => [
      ...current,
      ...validFiles.map((file) => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      })),
    ]);
    event.target.value = '';
  };

  const cityData = useMemo(() => (
    mockLocationBasicDataData
      .filter((item) => item.enabled)
      .map((item) => ({ id: item.id, cityName: item.cityName }))
  ), []);

  const buildingData = useMemo(() => {
    const detail = transferDetails.find((item) => item.assetId === selectContext?.assetId);
    const selectedCity = detail?.city || '';
    const matchedCity = mockLocationBasicDataData.find((item) => item.cityName === selectedCity);
    const sourceCities = matchedCity
      ? [matchedCity]
      : mockLocationBasicDataData.filter((item) => item.enabled);

    return sourceCities.flatMap((city) => (
      (city.children || [])
        .filter((building) => building.enabled)
        .map((building) => ({
          id: building.id,
          cityName: city.cityName,
          buildingName: building.buildingName,
        }))
    ));
  }, [selectContext, transferDetails]);

  const warehouseData = useMemo(() => (
    mockWarehouseInfoData
      .filter((item) => item.enabled)
      .map((item) => ({
        id: item.id,
        code: item.code,
        desc: item.desc,
        city: item.city,
      }))
  ), []);

  const floorOptions = useMemo(() => (
    Array.from(new Set(AVAILABLE_ASSETS.map((item) => item.floor).filter(Boolean)))
      .map((value) => ({ label: value, value }))
  ), []);

  const pickerConfig = useMemo(() => {
    if (!selectContext) return null;

    const configs = {
      formCompany: {
        title: '选择公司',
        dataSource: mockCompanies,
        searchFields: [
          { label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入公司编码' },
          { label: '公司名称', name: 'desc', dataIndex: 'desc', placeholder: '请输入公司名称' },
        ],
        columns: [
          { title: '公司编码', dataIndex: 'code' },
          { title: '公司名称', dataIndex: 'desc' },
        ],
      },
      newCompany: {
        title: '选择新公司',
        dataSource: mockCompanies,
        searchFields: [
          { label: '公司编码', name: 'code', dataIndex: 'code', placeholder: '请输入公司编码' },
          { label: '公司名称', name: 'desc', dataIndex: 'desc', placeholder: '请输入公司名称' },
        ],
        columns: [
          { title: '公司编码', dataIndex: 'code' },
          { title: '公司名称', dataIndex: 'desc' },
        ],
      },
      plate: {
        title: '选择板块',
        dataSource: mockPlates,
        searchFields: [
          { label: '板块编码', name: 'code', dataIndex: 'code', placeholder: '请输入板块编码' },
          { label: '板块描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入板块描述' },
        ],
        columns: [
          { title: '板块编码', dataIndex: 'code' },
          { title: '板块描述', dataIndex: 'desc' },
        ],
      },
      costCenter: {
        title: '选择成本中心',
        dataSource: mockCostCenters,
        searchFields: [
          { label: '成本中心编码', name: 'code', dataIndex: 'code', placeholder: '请输入成本中心编码' },
          { label: '成本中心描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入成本中心描述' },
        ],
        columns: [
          { title: '成本中心编码', dataIndex: 'code' },
          { title: '成本中心描述', dataIndex: 'desc' },
        ],
      },
      city: {
        title: '选择 City',
        dataSource: cityData,
        searchFields: [
          { label: '城市名称', name: 'cityName', dataIndex: 'cityName', placeholder: '请输入城市名称' },
        ],
        columns: [
          { title: '城市名称', dataIndex: 'cityName' },
        ],
      },
      building: {
        title: '选择 Building',
        dataSource: buildingData,
        searchFields: [
          { label: '城市名称', name: 'cityName', dataIndex: 'cityName', placeholder: '请输入城市名称' },
          { label: '建筑名称', name: 'buildingName', dataIndex: 'buildingName', placeholder: '请输入建筑名称' },
        ],
        columns: [
          { title: '城市名称', dataIndex: 'cityName' },
          { title: '建筑名称', dataIndex: 'buildingName' },
        ],
      },
      warehouse: {
        title: '选择调账后仓库',
        dataSource: warehouseData,
        searchFields: [
          { label: '仓库编码', name: 'code', dataIndex: 'code', placeholder: '请输入仓库编码' },
          { label: '仓库描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入仓库描述' },
        ],
        columns: [
          { title: '仓库编码', dataIndex: 'code' },
          { title: '仓库描述', dataIndex: 'desc' },
          { title: 'City', dataIndex: 'city' },
        ],
      },
    };

    return configs[selectContext.type] || null;
  }, [buildingData, cityData, selectContext, warehouseData]);

  const handlePickerConfirm = (record) => {
    if (!selectContext) return;

    if (selectContext.type === 'formCompany') {
      updateFormField('company', formatCodeDesc(record));
      setSelectContext(null);
      return;
    }

    const { assetId } = selectContext;
    if (selectContext.type === 'newCompany') {
      updateTransferDetail(assetId, 'newCompany', formatCodeDesc(record));
    }
    if (selectContext.type === 'plate') {
      updateTransferDetail(assetId, 'newPlate', formatCodeDesc(record));
    }
    if (selectContext.type === 'costCenter') {
      updateTransferDetail(assetId, 'newCostCenter', formatCodeDesc(record));
    }
    if (selectContext.type === 'city') {
      setTransferDetails((current) => current.map((item) => (
        item.assetId === assetId
          ? { ...item, city: record.cityName, building: '', floor: '' }
          : item
      )));
    }
    if (selectContext.type === 'building') {
      setTransferDetails((current) => current.map((item) => (
        item.assetId === assetId
          ? { ...item, building: record.buildingName, floor: '' }
          : item
      )));
    }
    if (selectContext.type === 'warehouse') {
      updateTransferDetail(assetId, 'adjustedWarehouse', formatCodeDesc(record));
    }

    setSelectContext(null);
  };

  const renderPickerInput = (value, placeholder, context) => (
    <div
      className="relative cursor-pointer group"
      onClick={() => setSelectContext(context)}
    >
      <Input
        value={value}
        readOnly
        placeholder={placeholder}
        className="pointer-events-none pr-9 group-hover:border-[#1677ff]"
      />
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1677ff] pointer-events-none" />
    </div>
  );

  const transferColumns = useMemo(() => [
    {
      title: requiredTitle('资产标签号'),
      dataIndex: 'tagNo',
      width: 160,
      fixed: 'left',
      render: (value) => (
        <div className="rounded border border-[#e5e7eb] bg-[#f5f7fa] px-2 py-1.5">
          <Text className="font-mono text-[#1677ff]">{value}</Text>
        </div>
      ),
    },
    {
      title: requiredTitle('新责任人'),
      dataIndex: 'newResponsiblePerson',
      width: 160,
      render: (value, record) => (
        <Input
          value={value}
          placeholder="请输入新责任人"
          onChange={(event) => updateTransferDetail(record.assetId, 'newResponsiblePerson', event.target.value)}
        />
      ),
    },
    {
      title: requiredTitle('新公司'),
      dataIndex: 'newCompany',
      width: 200,
      render: (value, record) => renderPickerInput(
        value,
        '请选择新公司',
        { type: 'newCompany', assetId: record.assetId },
      ),
    },
    {
      title: requiredTitle('新板块'),
      dataIndex: 'newPlate',
      width: 180,
      render: (value, record) => renderPickerInput(
        value,
        '请选择新板块',
        { type: 'plate', assetId: record.assetId },
      ),
    },
    {
      title: requiredTitle('新成本中心'),
      dataIndex: 'newCostCenter',
      width: 200,
      render: (value, record) => renderPickerInput(
        value,
        '请选择新成本中心',
        { type: 'costCenter', assetId: record.assetId },
      ),
    },
    {
      title: requiredTitle('City'),
      dataIndex: 'city',
      width: 150,
      render: (value, record) => renderPickerInput(
        value,
        '请选择 City',
        { type: 'city', assetId: record.assetId },
      ),
    },
    {
      title: requiredTitle('Building'),
      dataIndex: 'building',
      width: 180,
      render: (value, record) => renderPickerInput(
        value,
        '请选择 Building',
        { type: 'building', assetId: record.assetId },
      ),
    },
    {
      title: requiredTitle('Floor'),
      dataIndex: 'floor',
      width: 140,
      render: (value, record) => (
        <Select
          value={value || undefined}
          options={floorOptions}
          placeholder="请选择 Floor"
          allowClear
          className="w-full"
          onChange={(nextValue) => updateTransferDetail(record.assetId, 'floor', nextValue || '')}
        />
      ),
    },
    {
      title: '调账后仓库',
      dataIndex: 'adjustedWarehouse',
      width: 210,
      render: (value, record) => renderPickerInput(
        value,
        '请选择调账后仓库',
        { type: 'warehouse', assetId: record.assetId },
      ),
    },
  ], [floorOptions]);

  const handleSubmit = () => {
    if (!formData.company) {
      message.error('请选择公司');
      return;
    }
    if (transferDetails.length === 0) {
      message.error('请至少添加一条物资');
      return;
    }

    for (const detail of transferDetails) {
      const missingField = transferRequiredFields.find(([field]) => !String(detail[field] || '').trim());
      if (missingField) {
        message.error(`资产 ${detail.tagNo} 的${missingField[1]}不能为空`);
        return;
      }
    }

    message.success('公司间转移申请校验通过');
  };

  return (
    <div className="space-y-4 pb-4 text-gray-800">
      <div className="flex items-start justify-between gap-4 px-1">
        <Title level={3} className="!mb-0 !text-[22px]">公司间转移申请单</Title>
        <div className="pt-1 text-right">
          <Text type="secondary" className="mb-1 block text-xs">申请单号</Text>
          <Text type="secondary">保存/提交后生成</Text>
        </div>
      </div>

      <Card size="small" title="基本信息" className="shadow-sm">
        <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
          <Descriptions.Item label="申请单号">
            <Text type="secondary">保存/提交后生成</Text>
          </Descriptions.Item>
          <Descriptions.Item label={requiredTitle('公司')}>
            <div className="max-w-[360px]">
              {renderPickerInput(formData.company, '请选择公司', { type: 'formCompany' })}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="单据状态">{formData.status}</Descriptions.Item>
          <Descriptions.Item label="制单人">{formData.creator}</Descriptions.Item>
          <Descriptions.Item label="制单时间">{formData.createDate}</Descriptions.Item>
          <Descriptions.Item label="" />
          <Descriptions.Item label="备注" span={3}>
            <Input.TextArea
              value={formData.remarks}
              onChange={(event) => updateFormField('remarks', event.target.value)}
              placeholder="请输入备注信息"
              autoSize={{ minRows: 2, maxRows: 4 }}
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
        title="公司间转移明细"
        className="shadow-sm"
        extra={<Text type="secondary">共 {transferDetails.length} 条</Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button type="primary" icon={<Plus size={15} />} onClick={() => setAssetPickerOpen(true)}>
              添加物资
            </Button>
            <Popconfirm
              title="确认删除已选物资？"
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
          rowKey="assetId"
          size="small"
          bordered
          columns={transferColumns}
          dataSource={transferDetails}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
          }}
          scroll={{ x: 1580 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: '暂无物资数据，请点击“添加物资”' }}
        />
      </Card>

      {pickerConfig && (
        <SelectModal
          open={Boolean(selectContext)}
          onCancel={() => setSelectContext(null)}
          onConfirm={handlePickerConfirm}
          title={pickerConfig.title}
          dataSource={pickerConfig.dataSource}
          rowKey="id"
          searchFields={pickerConfig.searchFields}
          columns={pickerConfig.columns}
        />
      )}

      <Modal
        title="选择资产"
        open={assetPickerOpen}
        width={900}
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
          pagination={false}
          dataSource={AVAILABLE_ASSETS}
          columns={[
            { title: '资产类别', dataIndex: 'category', width: 180 },
            { title: '资产标签号', dataIndex: 'tagNo', width: 160 },
            { title: '资产说明', dataIndex: 'description', width: 220 },
            { title: '责任人姓名', dataIndex: 'responsiblePerson', width: 120 },
            { title: '资产所在城市', dataIndex: 'city', width: 120 },
          ]}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: pickerSelectedKeys,
            onChange: setPickerSelectedKeys,
            getCheckboxProps: (record) => ({
              disabled: transferDetails.some((item) => item.assetId === record.id),
            }),
          }}
        />
      </Modal>

      <div className="sticky bottom-0 z-40 flex justify-center gap-3 border-t border-[#e5e7eb] bg-white/95 px-5 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur">
        <Button className="min-w-[88px]" onClick={onBack}>返回</Button>
        <Button className="min-w-[88px]" onClick={() => message.success('保存成功')}>保存</Button>
        <Button type="primary" className="min-w-[104px]" onClick={handleSubmit}>提交</Button>
      </div>
    </div>
  );
}
