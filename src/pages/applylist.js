import React, { useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const dataSource = [
  {
    key: '1',
    index: 1,
    applyNo: 'ERA-202512250002',
    billType: '员工退库',
    applyTime: '2025-12-25',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '2',
    index: 2,
    applyNo: 'CA-202512220002',
    billType: '资产申请单',
    applyTime: '2025-12-22',
    materialCount: 6,
    status: '已驳回',
  },
  {
    key: '3',
    index: 3,
    applyNo: 'CA-202512220001',
    billType: '资产申请单',
    applyTime: '2025-12-22',
    materialCount: 7,
    status: '已驳回',
  },
  {
    key: '4',
    index: 4,
    applyNo: 'CA-202511260002',
    billType: '耗材申请单',
    applyTime: '2025-11-26',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '5',
    index: 5,
    applyNo: 'ERB-202511210001',
    billType: '员工续借',
    applyTime: '2025-11-21',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '6',
    index: 6,
    applyNo: 'EBA-202511180001',
    billType: '员工借用',
    applyTime: '2025-11-18',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '7',
    index: 7,
    applyNo: 'EBA-202511120001',
    billType: '员工借用',
    applyTime: '2025-11-12',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '8',
    index: 8,
    applyNo: 'EBA-202510280001',
    billType: '员工借用',
    applyTime: '2025-10-28',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '9',
    index: 9,
    applyNo: 'CA-2025102300021',
    billType: '资产申请单',
    applyTime: '2025-10-23',
    materialCount: 1,
    status: '已完成',
  },
  {
    key: '10',
    index: 10,
    applyNo: 'CA-2025102100021',
    billType: '资产申请单',
    applyTime: '2025-10-21',
    materialCount: 1,
    status: '已完成',
  },
];

export default function ApplyListPage() {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    console.log('查询参数：', values);
  };

  const handleReset = () => {
    form.resetFields();
  };

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const handleOpenApply = (record) => {
    console.log('打开申请单：', record);
  };

  const handleOpenStatus = (record) => {
    console.log('查看单据状态：', record);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      align: 'center',
    },
    {
      title: '申请单号',
      dataIndex: 'applyNo',
      width: 220,
      render: (text, record) => (
        <Link onClick={() => handleOpenApply(record)}>{text}</Link>
      ),
    },
    {
      title: '单据类型',
      dataIndex: 'billType',
      width: 180,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      width: 180,
    },
    {
      title: '物资数量',
      dataIndex: 'materialCount',
      width: 120,
      align: 'center',
    },
    {
      title: '单据状态',
      dataIndex: 'status',
      width: 140,
      align: 'center',
      render: (text, record) => (
        <Link onClick={() => handleOpenStatus(record)}>{text}</Link>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        background: '#f5f7fb',
      }}
    >
      <Card
        title="查询"
        bordered={false}
        style={{
          marginBottom: 16,
          borderRadius: 8,
        }}
        bodyStyle={{
          paddingBottom: 8,
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ flex: '88px' }}
          wrapperCol={{ flex: 1 }}
          colon={false}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 96px',
              columnGap: 24,
              alignItems: 'start',
            }}
          >
            <div>
              <Form.Item label="申请类型" name="applyType">
                <Select
                  allowClear
                  placeholder="请选择"
                  options={[
                    { label: '资产申请单', value: 'assetApply' },
                    { label: '耗材申请单', value: 'materialApply' },
                    { label: '员工借用', value: 'borrow' },
                    { label: '员工续借', value: 'renew' },
                    { label: '员工退库', value: 'return' },
                  ]}
                />
              </Form.Item>

              <Form.Item label="资产标签号" name="assetTagNo">
                <Input allowClear placeholder="请输入资产标签号" />
              </Form.Item>
            </div>

            <div>
              <Form.Item label="申请单号" name="applyNo">
                <Input allowClear placeholder="请输入单据编号" />
              </Form.Item>

              <Form.Item label="申请日期" name="applyDate">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div>
              <Form.Item label="单据状态" name="status">
                <Select
                  allowClear
                  placeholder="请选择"
                  options={[
                    { label: '审批中', value: 'approving' },
                    { label: '已完成', value: 'completed' },
                    { label: '已驳回', value: 'rejected' },
                    { label: '已撤回', value: 'withdrawn' },
                  ]}
                />
              </Form.Item>
            </div>

            <Space
              direction="vertical"
              size={12}
              style={{
                width: 96,
              }}
            >
              <Button type="primary" block onClick={handleSearch}>
                查询
              </Button>
              <Button block onClick={handleReset}>
                重置
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Card
        title="申请单列表"
        bordered={false}
        style={{
          borderRadius: 8,
        }}
      >
        <Table
          rowKey="key"
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 1000 }}
          pagination={{
            ...pagination,
            total: dataSource.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (current, pageSize) => setPagination({ current, pageSize }),
          }}
        />
      </Card>
    </div>
  );
}