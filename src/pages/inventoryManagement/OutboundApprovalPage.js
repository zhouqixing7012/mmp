import React, { useState } from 'react';
import { Button, Input, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { FileText } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;

function displayWarehouseName(value) {
  return String(value || '').replace(/^[^.\-]+[-.]/, '');
}

function formatApprovalLocation(line) {
  const parts = [line?.city, line?.building, line?.floor || line?.room || '缺省'].filter(Boolean);
  return parts.join('.');
}

function formatApprovalDate(value) {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY.MM.DD') : value;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCount(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function OutboundApprovalPage({ outbound, onApprove, onReject, onBack }) {
  const source = outbound || {};
  const lines = source.lines || [];
  const firstLine = lines[0] || {};
  const [opinion, setOpinion] = useState('');
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const currentStep = source.approvalSteps?.[source.currentApprovalIndex || 0];
  const history = source.approvalHistory || [];
  const canOperate = source.status === '审批中' && typeof onApprove === 'function';
  const totalQty = lines.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const totalAmount = lines.reduce((sum, row) => sum + Number(row.originalValue || 0), 0);

  const approve = () => {
    onApprove(opinion.trim() || '同意');
    setOpinion('');
  };

  const reject = () => {
    if (!opinion.trim()) {
      messageApi.warning('驳回意见不能为空');
      return;
    }
    onReject?.(opinion.trim());
    setOpinion('');
  };

  const approvalColumns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '审批节点', dataIndex: 'node', width: 220 },
    { title: '申请人/审批人', dataIndex: 'handler', width: 180 },
    { title: '审批状态', dataIndex: 'action', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
    { title: '审批时间', dataIndex: 'time', width: 180 },
    { title: '审批意见', dataIndex: 'opinion', render: (value) => value || '-' },
  ];

  const assetColumns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 330 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: 'SN号', dataIndex: 'sn', width: 170, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'center', render: formatCount },
    {
      title: '价值',
      children: [
        {
          title: '单价',
          width: 110,
          align: 'right',
          render: (_, row) => formatMoney(Number(row.originalValue || 0) / Math.max(1, Number(row.quantity || 1))),
        },
        { title: '原值', dataIndex: 'originalValue', width: 115, align: 'right', render: formatMoney },
      ],
    },
    {
      title: (
        <div className="leading-tight">
          <div>备注</div>
          <Typography.Text type="secondary" className="text-xs">（业务线或新资产地点或启用日期）</Typography.Text>
        </div>
      ),
      key: 'remark',
      width: 220,
      render: (_, row) => row.issueDate || row.businessLine || formatApprovalLocation(row) || '-',
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white" data-page-view-key="outbound-approval">
        <div className="bg-[#145CFF] px-5 py-3 text-xl font-semibold text-white">物资出库审批</div>
        <div className="px-8 pb-8 pt-4">
          <div className="mb-6 flex justify-end">
            <Typography.Text strong>出库单号：{source.documentNo || '-'}</Typography.Text>
          </div>

          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg font-semibold text-[#145CFF]">
              <FileText size={22} />
              <span>基本信息</span>
            </div>
            <DetailGrid columns={2} labelWidth={96}>
              <DetailItem label="制单人">{source.creator || '-'}</DetailItem>
              <DetailItem label="制单时间">{formatApprovalDate(source.createdDate)}</DetailItem>
              <DetailItem label="使用人">{firstLine.issuePerson || firstLine.person || '-'}</DetailItem>
              <DetailItem label="使用部门">{firstLine.department || '-'}</DetailItem>
              <DetailItem label="仓库名称">{displayWarehouseName(source.warehouse)}</DetailItem>
              <DetailItem label="地点位置">{formatApprovalLocation(firstLine)}</DetailItem>
              <DetailItem label="PR单号">{firstLine.prNo || source.prNo || '-'}</DetailItem>
              <DetailItem label="PO单号">{firstLine.poNo || source.poNo || '-'}</DetailItem>
              <DetailItem label="资产大类">{firstLine.assetClass || '-'}</DetailItem>
            </DetailGrid>
          </section>

          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-lg font-semibold text-[#145CFF]">
                <FileText size={22} />
                <span>审批信息</span>
              </div>
              <StatusTag value={source.status || '待审批'} type="business" />
            </div>
            <DetailGrid columns={3} labelWidth={96}>
              <DetailItem label="审批路线">{source.approvalRoute || '-'}</DetailItem>
              <DetailItem label="当前节点">{currentStep?.name || (source.status === '已完成' ? '审批完成' : '-')}</DetailItem>
              <DetailItem label="当前处理人">{currentStep?.approver || '-'}</DetailItem>
              <DetailItem label="发起人">{source.approvalInitiator || source.creator || '-'}</DetailItem>
              <DetailItem label="发起时间">{source.approvalStartedAt || '-'}</DetailItem>
              <DetailItem label="审批意见" span={3}>
                {canOperate
                  ? <TextArea value={opinion} onChange={(event) => setOpinion(event.target.value)} autoSize={{ minRows: 2, maxRows: 4 }} placeholder="驳回时必填；同意时可选填" />
                  : history[history.length - 1]?.opinion || '-'}
              </DetailItem>
            </DetailGrid>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-lg font-semibold text-[#145CFF]">
                <FileText size={22} />
                <span>出库资产信息</span>
              </div>
              <Space size={24}>
                <Typography.Text>总数量：<Typography.Text strong className="text-[#145CFF]">{formatCount(totalQty)}</Typography.Text></Typography.Text>
                <Typography.Text>总金额：<Typography.Text strong className="text-[#145CFF]">{formatMoney(totalAmount)}</Typography.Text></Typography.Text>
              </Space>
            </div>
            <Table rowKey={(row) => row.id || row.assetTag} size="small" bordered columns={assetColumns} dataSource={lines} pagination={false} scroll={{ x: 'max-content' }} />
          </section>

          {history.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg font-semibold text-[#145CFF]">
                <FileText size={22} />
                <span>审批记录</span>
              </div>
              <Table rowKey={(_, index) => index} size="small" bordered pagination={false} dataSource={history} columns={approvalColumns} />
            </section>
          )}

          <div className="mt-10 flex justify-center gap-3 border-t border-slate-200 pt-6">
            {canOperate && <Button type="primary" size="large" className="min-w-32" onClick={approve}>同意</Button>}
            {canOperate && <Button danger size="large" className="min-w-32" onClick={reject}>驳回</Button>}
            {onBack && <Button size="large" onClick={onBack}>返回</Button>}
          </div>
        </div>
      </div>
    </>
  );
}
