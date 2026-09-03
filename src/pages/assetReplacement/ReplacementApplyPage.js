import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Checkbox, Empty, Input, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { CURRENT_REPLACEMENT_APPLICANT, REPLACEMENT_NOTICE } from '../../mock/assetReplacementMock';
import {
  createAssetReplacementApplications,
  getEmployeeReplacementAssets,
  getReplacementDraftAssetIds,
  getReplacementEligibility,
  setReplacementDraftAssetIds,
} from '../../services/assetReplacementService';

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

function formatAssetDescription(asset) {
  return [asset?.brand, asset?.model].filter(Boolean).join('.') || asset?.assetDesc || '-';
}

export default function ReplacementApplyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const assets = useMemo(() => getEmployeeReplacementAssets(), []);
  const selectedAssets = useMemo(() => {
    const prefillAssetTags = location.state?.prefillAssetTags || [];
    if (prefillAssetTags.length) {
      return prefillAssetTags
        .map((assetTag) => assets.find((asset) => asset.assetTag === assetTag))
        .filter(Boolean);
    }
    const draftIds = getReplacementDraftAssetIds();
    const availableDraftAssets = draftIds.map((assetId) => assets.find((asset) => asset.id === assetId)).filter(Boolean);
    if (availableDraftAssets.length > 0) return availableDraftAssets;
    const fallback = assets.find((asset) => getReplacementEligibility(asset).allowed);
    return fallback ? [fallback] : [];
  }, [assets, location.state]);
  const totalQuantity = selectedAssets.reduce((sum, asset) => sum + (asset.quantity || 0), 0);
  const visibleNotices = REPLACEMENT_NOTICE.slice(0, 1);

  const submit = () => {
    if (selectedAssets.length === 0) {
      messageApi.warning('当前没有可提交的更换资产');
      return;
    }
    if (!reason.trim()) {
      messageApi.warning('请填写更换原因');
      return;
    }
    if (!accepted) {
      messageApi.warning('请阅读并勾选更换须知');
      return;
    }

    setSubmitting(true);
    try {
      const created = createAssetReplacementApplications(selectedAssets.map((asset) => asset.id), reason.trim());
      setReplacementDraftAssetIds([]);
      messageApi.success(`提交成功，已生成 ${created.length} 张资产更换申请单`);
      navigate('/yewurules', { state: { workspace: '工作台首页' } });
    } catch (error) {
      messageApi.error(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left' },
    { title: '资产说明', dataIndex: 'assetDesc', width: 250, ellipsis: true, render: (_, record) => formatAssetDescription(record) },
    { title: '配置', dataIndex: 'config', width: 270, ellipsis: true },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '资产用途', dataIndex: 'purpose', width: 110 },
    { title: '部件', dataIndex: 'component', width: 180, ellipsis: true },
    { title: '耗材信息', dataIndex: 'consumables', width: 220, ellipsis: true, render: (value) => value || '-' },
  ];

  const back = () => {
    setReplacementDraftAssetIds([]);
    navigate('/yewurules', { state: { workspace: '工作台首页' } });
  };

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">资产更换申请</Typography.Title>
        </div>

        <Card title={<SectionTitle>更换信息说明</SectionTitle>} size="small">
          <DetailGrid>
            <DetailItem label="申请人">
              {CURRENT_REPLACEMENT_APPLICANT.name}-{CURRENT_REPLACEMENT_APPLICANT.id}
            </DetailItem>
            <DetailItem label="更换类型" span={2}>故障更换</DetailItem>
            <DetailItem label={<RequiredLabel>更换原因</RequiredLabel>} span={3}>
              <TextArea
                rows={4}
                maxLength={150}
                showCount
                value={reason}
                placeholder="请详细描述更换原因，如设备故障现象、影响工作情况等"
                onChange={(event) => setReason(event.target.value)}
              />
            </DetailItem>
          </DetailGrid>
        </Card>

        <Card
          title={<SectionTitle>退回资产信息</SectionTitle>}
          size="small"
          extra={<Typography.Text>总计：{totalQuantity} 项</Typography.Text>}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={selectedAssets}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1400 }}
            locale={{ emptyText: <Empty description="当前没有可更换资产" /> }}
          />
        </Card>

        <Card title={<SectionTitle>更换须知</SectionTitle>} size="small">
          <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-red-500">
            {visibleNotices.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="flex justify-center">
            <Checkbox checked={accepted} onChange={(event) => setAccepted(event.target.checked)}>
              已阅读并同意
            </Checkbox>
          </div>
        </Card>

        <div className="flex justify-center gap-3 py-2">
          <Button type="primary" loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={back}>返回</Button>
        </div>
      </Space>
    </>
  );
}
