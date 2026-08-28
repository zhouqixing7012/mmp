import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { assetClaimSelectableAssets } from '../../mock/assetClaimMock';

const INITIAL_ROWS = [
  {
    id: 'new-employee-claim-1',
    lineNo: 1,
    assetTag: '11216121700480',
    serialNumber: '8RYY3H2',
    category: 'NOTEBOOK',
    subCategory: '笔记本电脑',
    description: '戴尔 Latitude E7450 笔记本电脑',
    inventoryOwner: 'CW013250-莫雨欣',
    inventoryStatus: '已盘',
    applyQuantity: 1,
    claimQuantity: 1,
    assetStatus: '在用-使用中',
    prNo: '',
  },
];

const WAREHOUSE_OPTIONS = [
  'I0013-资产集团前台库（新媒体）',
  'I0020-资产集团备用库',
].map((value) => ({ label: value, value }));

const CITY_OPTIONS = ['北京市', '上海市'].map((value) => ({ label: value, value }));
const BUILDING_OPTIONS = {
  北京市: ['搜狐媒体大厦', '中关村园区'],
  上海市: ['上海分公司办公区'],
};
const FLOOR_OPTIONS = {
  搜狐媒体大厦: ['5层', '8层', '11层', '12层', '16层'],
  中关村园区: ['2层', '3层'],
  上海分公司办公区: ['10层', '11层'],
};

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

function RequiredLabel({ children }) {
  return (
    <span>
      <span className="mr-1 text-red-500">*</span>
      {children}
    </span>
  );
}

export default function NewEmployeeAssetClaimPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [candidateId, setCandidateId] = useState(null);

  const city = Form.useWatch('city', form) || '北京市';
  const building = Form.useWatch('building', form) || '搜狐媒体大厦';
  const floor = Form.useWatch('floor', form) || '11层';

  const buildingOptions = useMemo(
    () => (BUILDING_OPTIONS[city] || []).map((value) => ({ label: value, value })),
    [city]
  );
  const floorOptions = useMemo(
    () => (FLOOR_OPTIONS[building] || []).map((value) => ({ label: value, value })),
    [building]
  );

  const displayRows = rows.map((row) => ({ ...row, city, building, floor }));

  const openAssetSelector = (rowId) => {
    setEditingRowId(rowId);
    const currentRow = rows.find((row) => row.id === rowId);
    const currentCandidate = assetClaimSelectableAssets.find((asset) => asset.tag === currentRow?.assetTag);
    setCandidateId(currentCandidate?.id || null);
    setAssetModalOpen(true);
  };

  const addRow = () => {
    const id = `new-employee-claim-${Date.now()}`;
    setRows((current) => [
      ...current,
      {
        id,
        lineNo: current.length + 1,
        assetTag: '',
        serialNumber: '',
        category: 'NOTEBOOK',
        subCategory: '',
        description: '',
        inventoryOwner: '',
        inventoryStatus: '未盘',
        applyQuantity: 1,
        claimQuantity: 1,
        assetStatus: '待领用',
        prNo: '',
      },
    ]);
    messageApi.success('已新增一行，请选择资产');
  };

  const deleteRows = () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请先选择需要删除的物资');
      return;
    }
    Modal.confirm({
      title: '确认删除所选物资？',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRows((current) => current
          .filter((row) => !selectedRowKeys.includes(row.id))
          .map((row, index) => ({ ...row, lineNo: index + 1 })));
        setSelectedRowKeys([]);
        messageApi.success('已删除所选物资');
      },
    });
  };

  const save = () => {
    setSaving(true);
    try {
      messageApi.success('新员工领用单已保存');
    } finally {
      setSaving(false);
    }
  };

  const confirmClaim = async () => {
    try {
      await form.validateFields(['city', 'building', 'floor']);
    } catch {
      messageApi.warning('请完善 City、Building、Floor 必填信息');
      return;
    }

    if (rows.length === 0 || rows.some((row) => !row.assetTag)) {
      messageApi.warning('请先补齐领用物资明细中的资产标签号');
      return;
    }

    Modal.confirm({
      title: '确认领用所列物资？',
      okText: '领用确认',
      cancelText: '取消',
      onOk: () => {
        setConfirming(true);
        try {
          messageApi.success('领用确认成功');
        } finally {
          setConfirming(false);
        }
      },
    });
  };

  const abandon = () => {
    Modal.confirm({
      title: '确认弃领？',
      content: '弃领后本单据将不再继续办理。',
      okText: '确认弃领',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => messageApi.success('已弃领'),
    });
  };

  const columns = [
    { title: '行号', dataIndex: 'lineNo', width: 70, align: 'center', fixed: 'left' },
    {
      title: '资产标签号',
      dataIndex: 'assetTag',
      width: 170,
      fixed: 'left',
      render: (value, record) => (
        <Space size={4}>
          <Typography.Text>{value || '-'}</Typography.Text>
          <Button
            type="text"
            size="small"
            icon={<Search size={14} />}
            onClick={() => openAssetSelector(record.id)}
          />
        </Space>
      ),
    },
    { title: 'SN序列号', dataIndex: 'serialNumber', width: 130, render: (value) => value || '-' },
    { title: '资产大类', dataIndex: 'category', width: 110 },
    { title: '资产小类', dataIndex: 'subCategory', width: 120, render: (value) => value || '-' },
    { title: '物资说明', dataIndex: 'description', width: 220, ellipsis: true, render: (value) => value || '-' },
    { title: '实际盘点人', dataIndex: 'inventoryOwner', width: 150, render: (value) => value || '-' },
    {
      title: '盘点状态',
      dataIndex: 'inventoryStatus',
      width: 110,
      align: 'center',
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: '申请数量', dataIndex: 'applyQuantity', width: 90, align: 'center' },
    { title: '领用数量', dataIndex: 'claimQuantity', width: 90, align: 'center' },
    { title: 'City', dataIndex: 'city', width: 100 },
    { title: 'Building', dataIndex: 'building', width: 130 },
    { title: 'Floor', dataIndex: 'floor', width: 90 },
    {
      title: '资产状态',
      dataIndex: 'assetStatus',
      width: 130,
      render: (value) => <StatusTag value={value} type="business" />,
    },
    { title: 'PR单号', dataIndex: 'prNo', width: 120, render: (value) => value || '-' },
  ];

  const candidateColumns = [
    { title: '资产标签号', dataIndex: 'tag', width: 150 },
    { title: '序列号', dataIndex: 'serialNumber', width: 150 },
    { title: '资产说明', dataIndex: 'description', width: 220, ellipsis: true },
    { title: '配置', dataIndex: 'configuration', width: 220, ellipsis: true },
    { title: '所在仓库', dataIndex: 'warehouse', width: 220 },
  ];

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        initialValues={{
          warehouse: 'I0013-资产集团前台库（新媒体）',
          city: '北京市',
          building: '搜狐媒体大厦',
          floor: '11层',
        }}
      >
        <Space direction="vertical" size={16} className="w-full">
          <div className="flex items-center justify-between">
            <Typography.Title level={4} className="mb-0">新员工领用单</Typography.Title>
            <Typography.Text type="secondary">领用单号：NE-202608110005</Typography.Text>
          </div>

          <Card title={<SectionTitle>使用人信息</SectionTitle>} size="small">
            <DetailGrid>
              <DetailItem label="当前仓库" span={3}>
                <Form.Item name="warehouse" noStyle>
                  <Select options={WAREHOUSE_OPTIONS} style={{ maxWidth: 520 }} />
                </Form.Item>
              </DetailItem>
              <DetailItem label="使用人">221171-王芷洋</DetailItem>
              <DetailItem label="制单时间">2026-08-11</DetailItem>
              <DetailItem label="单据状态"><StatusTag value="处理中" type="business" /></DetailItem>
              <DetailItem label="公司">114.新媒体</DetailItem>
              <DetailItem label="板块">11.搜狐网-Web</DetailItem>
              <DetailItem label="成本中心">111002.财经中心_大内容</DetailItem>
              <DetailItem label="业务线">-</DetailItem>
              <DetailItem label="部门">搜狐媒体.内容中心.财经中心</DetailItem>
              <div aria-hidden="true" style={{ gridColumn: 'span 2' }} />
              <DetailItem label={<RequiredLabel>City</RequiredLabel>}>
                <Form.Item name="city" rules={[{ required: true, message: '请选择 City' }]} noStyle>
                  <Select
                    options={CITY_OPTIONS}
                    onChange={() => form.setFieldsValue({ building: undefined, floor: undefined })}
                  />
                </Form.Item>
              </DetailItem>
              <DetailItem label={<RequiredLabel>Building</RequiredLabel>}>
                <Form.Item name="building" rules={[{ required: true, message: '请选择 Building' }]} noStyle>
                  <Select
                    disabled={!city}
                    options={buildingOptions}
                    onChange={() => form.setFieldValue('floor', undefined)}
                  />
                </Form.Item>
              </DetailItem>
              <DetailItem label={<RequiredLabel>Floor</RequiredLabel>}>
                <Form.Item name="floor" rules={[{ required: true, message: '请选择 Floor' }]} noStyle>
                  <Select disabled={!building} options={floorOptions} />
                </Form.Item>
              </DetailItem>
              <DetailItem label="单据类型">领用申请</DetailItem>
              <DetailItem label="出库单">-</DetailItem>
              <DetailItem label="资产配置">标准非技术笔记本</DetailItem>
            </DetailGrid>
          </Card>

          <Card title={<SectionTitle>领用物资明细</SectionTitle>} size="small">
            <div className="mb-3 flex items-center gap-2">
              <Button icon={<Plus size={14} />} onClick={addRow}>新增</Button>
              <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
            </div>
            <Table
              rowKey="id"
              size="small"
              bordered
              columns={columns}
              dataSource={displayRows}
              pagination={false}
              scroll={{ x: 1830 }}
              rowSelection={{
                columnTitle: '选择',
                columnWidth: 60,
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
            />
          </Card>

          <div className="flex justify-center gap-3 py-2">
            <Button loading={saving} onClick={save}>保存</Button>
            <Button type="primary" loading={confirming} onClick={confirmClaim}>领用确认</Button>
            <Button danger onClick={abandon}>弃领</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Space>
      </Form>

      <Modal
        title="选择资产"
        open={assetModalOpen}
        width={980}
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setAssetModalOpen(false);
          setEditingRowId(null);
          setCandidateId(null);
        }}
        onOk={() => {
          const candidate = assetClaimSelectableAssets.find((asset) => asset.id === candidateId);
          if (!candidate || !editingRowId) {
            messageApi.warning('请选择资产');
            return;
          }
          setRows((current) => current.map((row) => (
            row.id === editingRowId
              ? {
                ...row,
                assetTag: candidate.tag,
                serialNumber: candidate.serialNumber,
                description: candidate.description,
                inventoryOwner: candidate.inventoryOwner || '-',
                inventoryStatus: candidate.inventoryStatus || '未盘',
                assetStatus: candidate.status || '在用-使用中',
              }
              : row
          )));
          setAssetModalOpen(false);
          setEditingRowId(null);
          setCandidateId(null);
          messageApi.success(`已选择资产：${candidate.tag}`);
        }}
      >
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={candidateColumns}
          dataSource={assetClaimSelectableAssets}
          pagination={false}
          scroll={{ x: 1016 }}
          rowSelection={{
            type: 'radio',
            columnWidth: 56,
            selectedRowKeys: candidateId ? [candidateId] : [],
            onChange: (keys) => setCandidateId(keys[0] || null),
          }}
          onRow={(record) => ({
            onClick: () => setCandidateId(record.id),
            className: candidateId === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer',
          })}
        />
      </Modal>
    </>
  );
}
