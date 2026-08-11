import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Radio,
  Space,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { getPendingMisApplications, submitMisDecision } from '../../services/assetReplacementService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const { TextArea } = Input;

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

export default function ReplacementMisPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState('资产更换');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('同意');
  const [submitting, setSubmitting] = useState(false);
  const selectedApplication = useMemo(() => getPendingMisApplications()[0] || null, [version]);

  const submitDecision = (decision) => {
    if (!selectedApplication) return;
    if (!description.trim()) {
      messageApi.warning('请填写鉴定说明');
      return;
    }
    if (decision === '同意' && result !== '资产更换') {
      messageApi.warning('鉴定结果为资产更换时方可同意');
      return;
    }
    if (decision === '驳回' && result === '资产更换') {
      messageApi.warning('资产更换需选择同意');
      return;
    }
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }

    setSubmitting(true);
    try {
      submitMisDecision(selectedApplication.id, {
        result,
        description: description.trim(),
        decision,
        comment: comment.trim(),
      });
      messageApi.success(decision === '同意' ? 'MIS鉴定已通过，单据进入资产更换办理' : '申请已驳回并结束流程');
      setResult('资产更换');
      setDescription('');
      setComment('同意');
      setVersion((value) => value + 1);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedApplication) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待鉴定申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">MIS鉴定</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selectedApplication.id}</Typography.Text>
        </div>

        <Card title={<SectionTitle>申请人信息</SectionTitle>} size="small">
          <DetailGrid>
            <DetailItem label="申请人">
              {selectedApplication.applicant.id}-{selectedApplication.applicant.name}
            </DetailItem>
            <DetailItem label="申请日期">{formatDateText(selectedApplication.applyDate)}</DetailItem>
            <DetailItem label="公司">{selectedApplication.applicant.company || '-'}</DetailItem>
            <DetailItem label="办公区">{selectedApplication.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="联系电话">{selectedApplication.applicant.phone || '-'}</DetailItem>
            <DetailItem label="邮箱">{selectedApplication.applicant.email || '-'}</DetailItem>
            <DetailItem label="部门" span={3}>{formatDepartment(selectedApplication.applicant.department)}</DetailItem>
            <DetailItem label="更换原因" span={3}>{selectedApplication.reason || '-'}</DetailItem>
          </DetailGrid>
        </Card>

        <Card title={<SectionTitle>更换资产信息</SectionTitle>} size="small">
          <DetailGrid>
            <DetailItem label="资产标签号">{selectedApplication.oldAsset.assetTag || '-'}</DetailItem>
            <DetailItem label="资产说明">{selectedApplication.oldAsset.assetDesc || '-'}</DetailItem>
            <DetailItem label="配置">{selectedApplication.oldAsset.config || '-'}</DetailItem>
            <DetailItem label="耗材信息" span={3}>{selectedApplication.oldAsset.consumables || '-'}</DetailItem>
          </DetailGrid>
        </Card>

        <Card title={<SectionTitle>MIS鉴定处理</SectionTitle>} size="small">
          <DetailGrid>
            <DetailItem label={<RequiredLabel>鉴定结果</RequiredLabel>} span={3}>
              <Radio.Group
                value={result}
                options={['资产维修', '资产更换'].map((value) => ({ label: value, value }))}
                onChange={(event) => {
                  setResult(event.target.value);
                  setComment(event.target.value === '资产更换' ? '同意' : '');
                }}
              />
            </DetailItem>
            <DetailItem label={<RequiredLabel>鉴定说明</RequiredLabel>} span={3}>
              <TextArea
                rows={3}
                maxLength={60}
                showCount
                value={description}
                placeholder="请填写鉴定说明（60字以内）"
                onChange={(event) => setDescription(event.target.value)}
              />
            </DetailItem>
          </DetailGrid>
        </Card>

        <ReplacementHistoryCard
          title="审批信息"
          records={selectedApplication.history}
        >
          <Typography.Text strong>审批意见：</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={comment}
            placeholder="同意时默认同意，驳回时必填"
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={submitting} onClick={() => submitDecision('同意')}>同意</Button>
            <Button danger loading={submitting} onClick={() => submitDecision('驳回')}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </ReplacementHistoryCard>
      </Space>
    </>
  );
}
