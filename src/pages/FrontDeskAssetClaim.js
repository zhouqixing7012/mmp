import React, { useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Select, Space, Tag, Typography, message as antdMessage } from 'antd';
import { Search } from 'lucide-react';
import { assetClaimApplication } from '../mock/assetClaimMock';

const { TextArea } = Input;

export default function FrontDeskAssetClaim() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [form] = Form.useForm();
  const [assetOpen, setAssetOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const application = assetClaimApplication;

  const handleAction = async (action) => {
    if (action === '领用确认') {
      try {
        await form.validateFields();
      } catch {
        messageApi.warning('请完善必填信息');
        return;
      }
    }
    setSubmitLoading(true);
    try {
      messageApi.success(`${action}操作成功`);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Card
        title="ES前台领用"
        extra={<Typography.Text type="secondary">申请单号：{application.applicationNo}</Typography.Text>}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            warehouse: application.warehouse,
            remark: application.remark,
            city: application.asset.city,
            building: application.asset.building,
            floor: application.asset.floor,
            purpose: application.asset.purpose,
            usageDescription: application.asset.usageDescription,
          }}
        >
          <Card type="inner" title="申请人信息" className="mb-4">
            <Form.Item label="当前仓库" name="warehouse" rules={[{ required: true, message: '请选择当前仓库' }]}>
              <Select options={[{ label: application.warehouse, value: application.warehouse }]} />
            </Form.Item>
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label="申请人">{application.applicant}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{application.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{application.email}</Descriptions.Item>
              <Descriptions.Item label="公司">{application.company}</Descriptions.Item>
              <Descriptions.Item label="办公区">{application.officeArea}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{application.applyDate}</Descriptions.Item>
              <Descriptions.Item label="成本中心">{application.costCenter}</Descriptions.Item>
              <Descriptions.Item label="部门" span={2}>{application.department}</Descriptions.Item>
            </Descriptions>
            <Form.Item label="单据备注" name="remark" className="mt-4 mb-0">
              <TextArea rows={2} placeholder="请输入单据备注" />
            </Form.Item>
          </Card>

          <Card type="inner" title="申请资产信息">
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label="资产标签号">
                <Button type="link" icon={<Search size={14} />} onClick={() => setAssetOpen(true)}>
                  {application.asset.tag}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="序列号">{application.asset.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="部件数量">{application.asset.spareQuantity}</Descriptions.Item>
              <Descriptions.Item label="公司">{application.asset.company}</Descriptions.Item>
              <Descriptions.Item label="板块">{application.asset.block}</Descriptions.Item>
              <Descriptions.Item label="启用日期">{application.asset.enabledDate}</Descriptions.Item>
              <Descriptions.Item label="资产说明">{application.asset.description}</Descriptions.Item>
              <Descriptions.Item label="配置" span={2}>{application.asset.configuration}</Descriptions.Item>
            </Descriptions>

            <div className="mt-4 grid grid-cols-3 gap-x-6">
              <Form.Item label="城市" name="city" rules={[{ required: true, message: '请选择城市' }]}>
                <Select options={[{ label: application.asset.city, value: application.asset.city }]} />
              </Form.Item>
              <Form.Item label="建筑" name="building" rules={[{ required: true, message: '请选择建筑' }]}>
                <Select options={[{ label: application.asset.building, value: application.asset.building }]} />
              </Form.Item>
              <Form.Item label="楼层" name="floor" rules={[{ required: true, message: '请选择楼层' }]}>
                <Select options={['6层', '7层', '8层', '9层'].map((value) => ({ label: value, value }))} />
              </Form.Item>
              <Form.Item label="资产用途" name="purpose" rules={[{ required: true, message: '请选择资产用途' }]}>
                <Select options={['办公使用', '研发使用', '其他用途'].map((value) => ({ label: value, value }))} />
              </Form.Item>
              <Form.Item label="使用说明" name="usageDescription" className="col-span-2">
                <Input placeholder="请输入使用说明" />
              </Form.Item>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="实际盘点人">{application.asset.inventoryOwner}</Descriptions.Item>
              <Descriptions.Item label="盘点状态"><Tag color="red">{application.asset.inventoryStatus}</Tag></Descriptions.Item>
              <Descriptions.Item label="申请配置" span={2}>{application.asset.applyConfiguration}</Descriptions.Item>
              <Descriptions.Item label="申请物资说明" span={2}>{application.asset.applyMaterialDescription}</Descriptions.Item>
              <Descriptions.Item label="申请原因" span={2}>{application.asset.applyReason}</Descriptions.Item>
              <Descriptions.Item label="详细说明" span={2}>{application.asset.detailDescription || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <div className="mt-5 flex justify-center">
            <Space>
              <Button type="primary" loading={submitLoading} onClick={() => handleAction('领用确认')}>领用确认</Button>
              <Button onClick={() => handleAction('弃领')}>弃领</Button>
              <Button onClick={() => handleAction('加签')}>加签</Button>
              <Button onClick={() => window.history.back()}>返回</Button>
              <Button onClick={() => handleAction('发送领用通知')}>发送领用通知</Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Modal title="选择资产" open={assetOpen} onCancel={() => setAssetOpen(false)} onOk={() => setAssetOpen(false)} okText="确定" cancelText="取消">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="资产标签号">{application.asset.tag}</Descriptions.Item>
          <Descriptions.Item label="资产说明">{application.asset.description}</Descriptions.Item>
          <Descriptions.Item label="序列号">{application.asset.serialNumber}</Descriptions.Item>
          <Descriptions.Item label="资产状态">在用-使用中</Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
}
