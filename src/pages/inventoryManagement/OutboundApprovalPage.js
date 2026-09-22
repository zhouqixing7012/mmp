import React, { useMemo, useState } from 'react';
import { Button, Card, Input, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';

const { TextArea } = Input;

function money(value) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function displayWarehouseName(value) {
  return String(value || '').replace(/^[^.-]+[.-]/, '');
}

function uniqueText(values) {
  return Array.from(new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))).join('、');
}

function lineLocation(line) {
  return [line?.city, line?.building, line?.floor, line?.room].filter(Boolean).join('.');
}

function approvalRemark(line) {
  return line?.businessLine || line?.newAssetLocation || line?.enabledDate || lineLocation(line) || '-';
}

export default function OutboundApprovalPage({ outbound, onApprove, onReject, onBack }) {
  const source = outbound || {};
  const lines = source.lines || [];
  const [opinion, setOpinion] = useState('');
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const canOperate = source.status === '审批中' && typeof onApprove === 'function';

  const summary = useMemo(() => {
    const users = lines.map((line) => line.issuePerson || line.borrowPerson || line.person);
    const departments = lines.map((line) => line.department);
    const locations = lines.map(lineLocation);
    const prNos = [source.prNo, ...lines.map((line) => line.prNo || line.prLine)];
    const poNos = [source.poNo, ...lines.map((line) => line.poNo)];
    const assetClasses = lines.map((line) => line.assetClass);
    return {
      user: uniqueText(users) || '-',
      department: uniqueText(departments) || '-',
      location: uniqueText(locations) || '-',
      prNo: uniqueText(prNos) || '-',
      poNo: uniqueText(poNos) || '-',
      assetClass: uniqueText(assetClasses) || '-',
      quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
      amount: lines.reduce((sum, line) => sum + Number(line.originalValue || 0), 0),
    };
  }, [lines, source.poNo, source.prNo]);

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

  const assetColumns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 320 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, render: (value) => value || '-' },
    { title: 'SN号', dataIndex: 'sn', width: 170, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'center', render: (value) => value || '-' },
    {
      title: '价值',
      children: [
        {
          title: '单价',
          width: 120,
          align: 'right',
          render: (_, line) => {
            const quantity = Number(line.quantity || 0);
            const unitPrice = line.unitPrice ?? (quantity > 0 ? Number(line.originalValue || 0) / quantity : 0);
            return money(unitPrice);
          },
        },
        { title: '原值', dataIndex: 'originalValue', width: 120, align: 'right', render: money },
      ],
    },
    { title: '备注', width: 220, render: (_, line) => approvalRemark(line) },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key="outbound-approval">
      {contextHolder}
      <div className="flex items-center justify-between gap-4">
        <Typography.Title level={3} className="!mb-0">物资出库申请</Typography.Title>
        <Typography.Text strong>出库单号：{source.documentNo || '-'}</Typography.Text>
      </div>

      <Card size="small" title="基本信息">
        <DetailGrid columns={3} labelWidth={104}>
          <DetailItem label="制单人">{source.creator || '-'}</DetailItem>
          <DetailItem label="制单时间">{source.createdDate || '-'}</DetailItem>
          <DetailItem label="使用人">{summary.user}</DetailItem>
          <DetailItem label="使用部门">{summary.department}</DetailItem>
          <DetailItem label="仓库名称">{displayWarehouseName(source.warehouse) || '-'}</DetailItem>
          <DetailItem label="地点位置">{summary.location}</DetailItem>
          <DetailItem label="PR单号">{summary.prNo}</DetailItem>
          <DetailItem label="PO单号">{summary.poNo}</DetailItem>
          <DetailItem label="资产大类">{summary.assetClass}</DetailItem>
        </DetailGrid>
      </Card>

      <Card
        size="small"
        title="出库资产信息"
        extra={(
          <Space size={24}>
            <Typography.Text>总数量：<Typography.Text strong>{summary.quantity}</Typography.Text></Typography.Text>
            <Typography.Text>总金额：<Typography.Text strong>{money(summary.amount)}</Typography.Text></Typography.Text>
          </Space>
        )}
      >
        <Table
          rowKey={(record, index) => record.id || record.assetTag || `line-${index}`}
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={lines}
          columns={assetColumns}
        />
      </Card>

      {canOperate && (
        <Card size="small" title="审批操作">
          <TextArea
            rows={3}
            value={opinion}
            placeholder="驳回时必填；同意时可选填"
            onChange={(event) => setOpinion(event.target.value)}
          />
        </Card>
      )}

      <div className="flex justify-center gap-3">
        {canOperate && (
          <>
            <Button type="primary" onClick={approve}>同意</Button>
            <Button danger onClick={reject}>驳回</Button>
          </>
        )}
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}
