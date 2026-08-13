import React, { useMemo, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Radio, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import { BellRing, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QueryBar, { QueryItem } from '../components/QueryBar';
import StatusTag from '../components/StatusTag';
import {
  assetClaimApplication,
  assetClaimLocationData,
  assetClaimSelectableAssets,
} from '../mock/assetClaimMock';

const { TextArea } = Input;
const EMPTY_QUERY = { assetTag: '', serialNumber: '', block: '', description: '' };

export default function FrontDeskAssetClaim() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [form] = Form.useForm();
  const [assetOpen, setAssetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(assetClaimApplication.asset);
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [submitLoading, setSubmitLoading] = useState(false);
  const application = assetClaimApplication;

  const city = Form.useWatch('city', form);
  const building = Form.useWatch('building', form);

  const cityOptions = useMemo(
    () => assetClaimLocationData.map((item) => ({ label: item.city, value: item.city })),
    []
  );

  const buildingOptions = useMemo(() => {
    const cityRecord = assetClaimLocationData.find((item) => item.city === city);
    return (cityRecord?.buildings || []).map((item) => ({ label: item.building, value: item.building }));
  }, [city]);

  const floorOptions = useMemo(() => {
    const cityRecord = assetClaimLocationData.find((item) => item.city === city);
    const buildingRecord = cityRecord?.buildings.find((item) => item.building === building);
    return (buildingRecord?.floors || []).map((value) => ({ label: value, value }));
  }, [city, building]);

  const filteredAssets = useMemo(() => assetClaimSelectableAssets.filter((asset) => (
    (!appliedQuery.assetTag || asset.tag.toLowerCase().includes(appliedQuery.assetTag.toLowerCase()))
    && (!appliedQuery.serialNumber || asset.serialNumber.toLowerCase().includes(appliedQuery.serialNumber.toLowerCase()))
    && (!appliedQuery.block || asset.block.toLowerCase().includes(appliedQuery.block.toLowerCase()))
    && (!appliedQuery.description || asset.description.toLowerCase().includes(appliedQuery.description.toLowerCase()))
  )), [appliedQuery]);

  const confirmClaim = async () => {
    try {
      await form.validateFields();
    } catch {
      messageApi.warning('请完善必填信息');
      return;
    }

    const currentWarehouse = form.getFieldValue('warehouse');
    if (selectedAsset.warehouse !== currentWarehouse) {
      messageApi.error('资产不在当前库，请进行移库操作！');
      return;
    }

    Modal.confirm({
      title: '是否确认领用',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setSubmitLoading(true);
        try {
          navigate('/EmployeeAssetClaimConfirm');
        } finally {
          setSubmitLoading(false);
        }
      },
    });
  };

  const handleAction = (action) => {
    messageApi.success(`${action}操作成功`);
  };

  const assetColumns = [
    { title: '选择', width: 60, render: (_, record) => <Radio checked={selectedAsset.id === record.id} /> },
    { title: '资产标签号', dataIndex: 'tag', width: 160 },
    { title: '序列号', dataIndex: 'serialNumber', width: 160 },
    { title: '板块', dataIndex: 'block', width: 100 },
    { title: '资产说明', dataIndex: 'description', width: 220 },
    { title: '配置', dataIndex: 'configuration', width: 220 },
    { title: '所在仓库', dataIndex: 'warehouse', width: 240 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          warehouse: application.warehouse,
          assetTag: application.asset.tag,
          remark: application.remark,
          city: application.asset.city,
          building: application.asset.building,
          floor: application.asset.floor,
          purpose: application.asset.purpose,
          usageDescription: application.asset.usageDescription,
        }}
      >
        <Space direction="vertical" size={16} className="w-full">
          <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
            <Typography.Title level={4} className="mb-0">ES前台领用</Typography.Title>
            <Typography.Text type="secondary">申请单号：{application.applicationNo}</Typography.Text>
          </div>

          <Card title="申请人信息" size="small">
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label={<><span className="text-red-500">*</span> 当前仓库</>} span={3}>
                <Form.Item name="warehouse" rules={[{ required: true, message: '请选择当前仓库' }]} noStyle>
                  <Select options={[
                    { label: application.warehouse, value: application.warehouse },
                    { label: 'I0020-资产集团备用库', value: 'I0020-资产集团备用库' },
                  ]} />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{application.applicant}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{application.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{application.email}</Descriptions.Item>
              <Descriptions.Item label="公司">{application.company}</Descriptions.Item>
              <Descriptions.Item label="办公区">{application.officeArea}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{application.applyDate}</Descriptions.Item>
              <Descriptions.Item label="成本中心">{application.costCenter}</Descriptions.Item>
              <Descriptions.Item label="部门" span={2}>{application.department}</Descriptions.Item>
              <Descriptions.Item label="单据备注" span={3}>
                <Form.Item name="remark" noStyle>
                  <TextArea rows={2} placeholder="请输入单据备注" />
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="申请资产信息" size="small">
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label={<><span className="text-red-500">*</span> 资产标签号</>}>
                <Form.Item name="assetTag" rules={[{ required: true, message: '请选择资产标签号' }]} noStyle>
                  <Space.Compact className="w-full">
                    <Input readOnly value={selectedAsset?.tag || ''} placeholder="请选择资产标签号" />
                    <Button icon={<Search size={14} />} onClick={() => setAssetOpen(true)} />
                  </Space.Compact>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="序列号">{selectedAsset.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="所在仓库">{selectedAsset.warehouse}</Descriptions.Item>
              <Descriptions.Item label="资产说明">{selectedAsset.description}</Descriptions.Item>
              <Descriptions.Item label="配置">{selectedAsset.configuration}</Descriptions.Item>
              <Descriptions.Item label="部件数量">{selectedAsset.spareQuantity}</Descriptions.Item>
              <Descriptions.Item label="公司">{selectedAsset.company}</Descriptions.Item>
              <Descriptions.Item label="板块">{selectedAsset.block}</Descriptions.Item>
              <Descriptions.Item label="启用日期">{selectedAsset.enabledDate}</Descriptions.Item>
              <Descriptions.Item label={<><span className="text-red-500">*</span> 城市</>}>
                <Form.Item name="city" rules={[{ required: true, message: '请选择城市' }]} noStyle>
                  <Select allowClear options={cityOptions} onChange={() => form.setFieldsValue({ building: undefined, floor: undefined })} />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label={<><span className="text-red-500">*</span> 建筑</>}>
                <Form.Item name="building" rules={[{ required: true, message: '请选择建筑' }]} noStyle>
                  <Select allowClear disabled={!city} options={buildingOptions} onChange={() => form.setFieldsValue({ floor: undefined })} />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label={<><span className="text-red-500">*</span> 楼层</>}>
                <Form.Item name="floor" rules={[{ required: true, message: '请选择楼层' }]} noStyle>
                  <Select allowClear disabled={!building} options={floorOptions} />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label={<><span className="text-red-500">*</span> 资产用途</>}>
                <Form.Item name="purpose" rules={[{ required: true, message: '请选择资产用途' }]} noStyle>
                  <Select options={['办公使用', '研发使用', '其他用途'].map((value) => ({ label: value, value }))} />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="使用说明" span={2}>
                <Form.Item name="usageDescription" noStyle>
                  <Input placeholder="请输入使用说明" />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="实际盘点人">{selectedAsset.inventoryOwner}</Descriptions.Item>
              <Descriptions.Item label="盘点状态"><StatusTag value={selectedAsset.inventoryStatus} type="business" /></Descriptions.Item>
              <Descriptions.Item label="申请配置">{selectedAsset.applyConfiguration}</Descriptions.Item>
              <Descriptions.Item label="申请物资说明" span={2}>{selectedAsset.applyMaterialDescription}</Descriptions.Item>
              <Descriptions.Item label="详细说明">{selectedAsset.detailDescription || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card size="small">
            <div className="flex justify-center gap-3">
              <Button type="primary" loading={submitLoading} onClick={confirmClaim}>领用确认</Button>
              <Button onClick={() => handleAction('弃领')}>弃领</Button>
              <Button onClick={() => handleAction('加签')}>加签</Button>
              <Button onClick={() => window.history.back()}>返回</Button>
              <Button icon={<BellRing size={14} />} onClick={() => handleAction('发送领用通知')}>发送领用通知</Button>
            </div>
          </Card>
        </Space>
      </Form>

      <Modal title="选择资产" open={assetOpen} width={1180} footer={null} onCancel={() => setAssetOpen(false)}>
        <QueryBar
          onQuery={() => setAppliedQuery(query)}
          onReset={() => {
            setQuery(EMPTY_QUERY);
            setAppliedQuery(EMPTY_QUERY);
          }}
        >
          <QueryItem label="标签号"><Input allowClear value={query.assetTag} onChange={(event) => setQuery({ ...query, assetTag: event.target.value })} /></QueryItem>
          <QueryItem label="序列号"><Input allowClear value={query.serialNumber} onChange={(event) => setQuery({ ...query, serialNumber: event.target.value })} /></QueryItem>
          <QueryItem label="板块"><Input allowClear value={query.block} onChange={(event) => setQuery({ ...query, block: event.target.value })} /></QueryItem>
          <QueryItem label="资产说明"><Input allowClear value={query.description} onChange={(event) => setQuery({ ...query, description: event.target.value })} /></QueryItem>
        </QueryBar>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={assetColumns}
          dataSource={filteredAssets}
          pagination={{ pageSize: 10, showTotal: (total) => `共${total}项` }}
          scroll={{ x: 1200, y: 380 }}
          onRow={(record) => ({
            onClick: () => setSelectedAsset(record),
            className: selectedAsset.id === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer',
          })}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Button
            type="primary"
            disabled={!selectedAsset}
            onClick={() => {
              form.setFieldValue('assetTag', selectedAsset.tag);
              setAssetOpen(false);
            }}
          >确定</Button>
          <Button onClick={() => setAssetOpen(false)}>取消</Button>
        </div>
      </Modal>
    </div>
  );
}
