import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Archive, BadgeCheck, Ban, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, DatePicker, Empty, Input, Select, Space, Tag, Typography, message as antdMessage } from 'antd';
import { CONTRACT_WAREHOUSES } from '../../mock/assetReturnMock';
import {
  completeContractReturn,
  finishContractReturn,
  getContractReturnApplications,
  requestContractReturnConfirmation,
} from '../../services/assetReturnService';

const { TextArea } = Input;

export default function ContractReturnHandlingPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const applications = useMemo(() => getContractReturnApplications(), [version]);
  const selected = applications.find((item) => (
    item.status === '处理中' && ['号码退库办理', '员工号码退库确认'].includes(item.currentNode)
  )) || null;
  const [warehouse, setWarehouse] = useState('北京总部号码仓');
  const [returnDate, setReturnDate] = useState(dayjs());
  const [opinion, setOpinion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setWarehouse(selected.handling.warehouse || '北京总部号码仓');
    setReturnDate(selected.handling.returnDate ? dayjs(selected.handling.returnDate) : dayjs());
    setOpinion(selected.handling.opinion || '');
  }, [selected?.id, selected?.handling.confirmationStatus]);

  const refresh = () => setVersion((value) => value + 1);

  const executeInbound = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      completeContractReturn(selected.id, { warehouse, returnDate: returnDate.format('YYYY-MM-DD HH:mm:ss') });
      messageApi.success('号码入库成功，号码状态已更新为“在库（旧）”');
      refresh();
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const finish = (result) => {
    if (!selected) return;
    if (!opinion.trim()) {
      messageApi.warning(`${result === '驳回' ? '驳回' : '放弃退还'}时请填写处理意见`);
      return;
    }
    finishContractReturn(selected.id, result, opinion.trim());
    messageApi.success(result === '驳回' ? '号码退库申请已驳回' : '已放弃退还，号码原状态保持不变');
    refresh();
  };

  if (!selected) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无合约号码退库办理待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const number = selected.contractNumber;

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">合约号码退库办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selected.id}</Typography.Text>
        </div>

        <Card size="small" title="申请人及申请信息">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div><Typography.Text type="secondary">单据状态：</Typography.Text><Tag color="processing">{selected.status}</Tag></div>
            <div><Typography.Text type="secondary">申请人：</Typography.Text>{selected.applicant.name}-{selected.applicant.id}</div>
            <div><Typography.Text type="secondary">联系电话：</Typography.Text>{selected.applicant.phone}</div>
            <div><Typography.Text type="secondary">公司/板块：</Typography.Text>{selected.applicant.company} / {selected.applicant.block}</div>
            <div><Typography.Text type="secondary">部门/办公区：</Typography.Text>{selected.applicant.department} / {selected.applicant.officeArea}</div>
            <div><Typography.Text type="secondary">申请时间：</Typography.Text>{selected.applyTime}</div>
          </div>
          <div className="mt-4"><Typography.Text type="secondary">退库原因：</Typography.Text>{selected.reason}</div>
          {selected.attachment && <div className="mt-2"><Typography.Text type="secondary">申请附件：</Typography.Text><Button type="link" className="px-0">{selected.attachment}</Button></div>}
        </Card>

        <Card size="small" title="合约号码及办理信息">
          <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-sm">
            <div><Typography.Text type="secondary">合约号码：</Typography.Text>{number.number}</div>
            <div><Typography.Text type="secondary">标签号：</Typography.Text>{number.assetTag}</div>
            <div><Typography.Text type="secondary">资产小类：</Typography.Text>{number.category}</div>
            <div><Typography.Text type="secondary">品牌：</Typography.Text>{number.brand}</div>
            <div className="col-span-2"><Typography.Text type="secondary">说明：</Typography.Text>{number.description}</div>
            <div className="col-span-2"><Typography.Text type="secondary">套餐：</Typography.Text>{number.packageContent}</div>
            <div><Typography.Text type="secondary">金额：</Typography.Text>¥{number.amount}</div>
            <div><Typography.Text type="secondary">当前状态：</Typography.Text><Tag color="success">{number.status}</Tag></div>
            <div><Typography.Text type="secondary">确认状态：</Typography.Text><Tag color={selected.handling.confirmationStatus === '已确认' ? 'success' : 'processing'}>{selected.handling.confirmationStatus}</Tag></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div><Typography.Text strong><span className="text-red-500">*</span> 仓库</Typography.Text><Select className="mt-2 w-full" value={warehouse} options={CONTRACT_WAREHOUSES.map((value) => ({ label: value, value }))} onChange={setWarehouse} /></div>
            <div><Typography.Text strong><span className="text-red-500">*</span> 退库日期</Typography.Text><DatePicker showTime className="mt-2 w-full" value={returnDate} onChange={(value) => setReturnDate(value || dayjs())} /></div>
          </div>
          <div className="mt-4"><Typography.Text strong>处理意见</Typography.Text><TextArea className="mt-2" rows={3} maxLength={400} showCount value={opinion} placeholder="放弃退还或驳回时必填" onChange={(event) => setOpinion(event.target.value)} /></div>
        </Card>

        <Card size="small" title="办理操作">
          <div className="flex justify-center gap-3">
            <Button type="primary" icon={<BadgeCheck size={14} />} disabled={selected.handling.confirmationStatus === '已确认'} onClick={() => { requestContractReturnConfirmation(selected.id); messageApi.success('已发起员工号码退库确认，请前往“员工号码退库确认”完成确认'); refresh(); }}>申请人退库确认</Button>
            <Button type="primary" icon={<Archive size={14} />} loading={loading} disabled={selected.handling.confirmationStatus !== '已确认'} onClick={executeInbound}>执行入库</Button>
            <Button danger icon={<XCircle size={14} />} onClick={() => finish('驳回')}>驳回</Button>
            <Button icon={<Ban size={14} />} onClick={() => finish('放弃退还')}>放弃退还</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>
    </div>
  );
}
