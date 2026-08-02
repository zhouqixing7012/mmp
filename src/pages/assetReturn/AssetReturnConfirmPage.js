import React, { useState } from 'react';
import { CreditCard, ScanLine } from 'lucide-react';
import { Button, Card, Empty, Input, Space, Table, Tag, Typography, message as antdMessage } from 'antd';
import { confirmReturnEmployee, getActiveReturnConfirmation } from '../../services/assetReturnService';

export default function AssetReturnConfirmPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [employeeId, setEmployeeId] = useState('213852');
  const [version, setVersion] = useState(0);
  const application = getActiveReturnConfirmation('asset');

  const confirm = (method) => {
    try {
      confirmReturnEmployee(employeeId.trim(), method);
      messageApi.success('员工退库确认成功，库管员可执行入库');
      setVersion((value) => value + 1);
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  if (!application) {
    return <div className="min-h-screen bg-slate-100 p-4">{contextHolder}<Card><Empty description="暂无待确认的资产退库单" /></Card></div>;
  }

  const confirmed = application.handling.confirmationStatus === '已确认';
  const columns = [
    { title: '资产标签号', width: 150, render: () => application.asset.assetTag },
    { title: '资产说明', width: 250, render: () => application.asset.assetDesc },
    { title: '配置', width: 260, render: () => application.asset.config || '无' },
    { title: '数量', width: 80, align: 'center', render: () => application.asset.quantity },
    { title: '关联耗材', width: 230, render: () => application.relatedConsumables.length ? application.relatedConsumables.map((item) => <Tag key={item.assetTag} color="blue">{item.assetTag}</Tag>) : '无' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm"><Typography.Title level={4} className="mb-0">员工退库确认</Typography.Title><Typography.Text type="secondary">申请单号：{application.id}</Typography.Text></div>
        <Card size="small" title="确认信息">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div><Typography.Text type="secondary">申请人：</Typography.Text>{application.applicant.name}-{application.applicant.id}</div>
            <div><Typography.Text type="secondary">退库类型：</Typography.Text>{application.returnType}</div>
            <div><Typography.Text type="secondary">确认状态：</Typography.Text><Tag color={confirmed ? 'success' : 'processing'}>{application.handling.confirmationStatus}</Tag></div>
            <div><Typography.Text type="secondary">确认时间：</Typography.Text>{application.handling.confirmationTime || '-'}</div>
          </div>
        </Card>
        <Card size="small" title="退库资产">
          <Table rowKey="id" columns={columns} dataSource={[application.asset]} pagination={false} scroll={{ x: 1000 }} />
        </Card>
        <Card size="small" title="退库确认提示">
          <Typography.Paragraph>我确认已将上述资产、关联升级耗材及相关附件交还库管员。</Typography.Paragraph>
          <div className="max-w-md"><Typography.Text strong><span className="text-red-500">*</span> 确认工号</Typography.Text><Input className="mt-2" value={employeeId} disabled={confirmed} placeholder="请输入申请人工号" onChange={(event) => setEmployeeId(event.target.value)} /></div>
          {confirmed && <div className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-green-700">确认成功，识别工号 {application.handling.confirmationEmployeeId}，确认方式：{application.handling.confirmationMethod}。</div>}
        </Card>
        <div className="flex justify-center gap-3 rounded-lg bg-white p-4 shadow-sm">
          <Button type="primary" icon={<ScanLine size={14} />} disabled={confirmed} onClick={() => confirm('狐小e扫码')}>模拟扫码确认</Button>
          <Button type="primary" icon={<CreditCard size={14} />} disabled={confirmed} onClick={() => confirm('刷卡')}>模拟刷卡确认</Button>
          <Button disabled={confirmed} onClick={() => confirm('手工输入工号')}>工号确认</Button>
        </div>
      </Space>
    </div>
  );
}
