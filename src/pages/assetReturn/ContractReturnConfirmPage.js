import React, { useState } from 'react';
import { CreditCard, ScanLine } from 'lucide-react';
import { Button, Card, Empty, Input, Space, Tag, Typography, message as antdMessage } from 'antd';
import { confirmReturnEmployee, getActiveReturnConfirmation } from '../../services/assetReturnService';

export default function ContractReturnConfirmPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [employeeId, setEmployeeId] = useState('213852');
  const [version, setVersion] = useState(0);
  const application = getActiveReturnConfirmation('contract');

  const confirm = (method) => {
    try {
      confirmReturnEmployee(employeeId.trim(), method);
      messageApi.success('员工号码退库确认成功，库管员可执行入库');
      setVersion((value) => value + 1);
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  if (!application) {
    return <div className="min-h-screen bg-slate-100 p-4">{contextHolder}<Card><Empty description="暂无待确认的合约号码退库单" /></Card></div>;
  }

  const confirmed = application.handling.confirmationStatus === '已确认';
  const number = application.contractNumber;

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm"><Typography.Title level={4} className="mb-0">员工号码退库确认</Typography.Title><Typography.Text type="secondary">申请单号：{application.id}</Typography.Text></div>
        <Card size="small" title="确认信息">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div><Typography.Text type="secondary">申请人：</Typography.Text>{application.applicant.name}-{application.applicant.id}</div>
            <div><Typography.Text type="secondary">确认状态：</Typography.Text><Tag color={confirmed ? 'success' : 'processing'}>{application.handling.confirmationStatus}</Tag></div>
            <div><Typography.Text type="secondary">合约号码：</Typography.Text>{number.number}</div>
            <div><Typography.Text type="secondary">合约机标签号：</Typography.Text>{number.assetTag}</div>
            <div><Typography.Text type="secondary">套餐内容：</Typography.Text>{number.packageContent}</div>
            <div><Typography.Text type="secondary">确认时间：</Typography.Text>{application.handling.confirmationTime || '-'}</div>
          </div>
        </Card>
        <Card size="small" title="退库确认提示">
          <Typography.Paragraph>我确认已将上述合约号码对应的实体电话卡交还库管员。</Typography.Paragraph>
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
