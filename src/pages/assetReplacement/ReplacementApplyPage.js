import React, { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Checkbox, Descriptions, Empty, Input, Space, Table, Tag, Typography, message as antdMessage } from 'antd';
import { CURRENT_REPLACEMENT_APPLICANT, REPLACEMENT_NOTICE } from '../../mock/assetReplacementMock';
import {
  createAssetReplacementApplications,
  getEmployeeReplacementAssets,
  getReplacementDraftAssetIds,
  getReplacementEligibility,
  setReplacementDraftAssetIds,
} from '../../services/assetReplacementService';

const { TextArea } = Input;

export default function ReplacementApplyPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const assets = useMemo(() => getEmployeeReplacementAssets(), []);
  const selectedAssets = useMemo(() => {
    const draftIds = getReplacementDraftAssetIds();
    const availableDraftAssets = draftIds.map((assetId) => assets.find((asset) => asset.id === assetId)).filter(Boolean);
    if (availableDraftAssets.length > 0) return availableDraftAssets;
    const fallback = assets.find((asset) => getReplacementEligibility(asset).allowed);
    return fallback ? [fallback] : [];
  }, [assets]);

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
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 250 },
    { title: '配置', dataIndex: 'config', width: 270 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '资产状态', dataIndex: 'status', width: 130, render: (value) => <Tag color="success">{value}</Tag> },
    { title: '资产用途', dataIndex: 'purpose', width: 110 },
    { title: '部件', dataIndex: 'component', width: 180 },
    { title: '耗材信息', dataIndex: 'consumables', width: 220 },
  ];

  const back = () => {
    setReplacementDraftAssetIds([]);
    navigate('/yewurules', { state: { workspace: '工作台首页' } });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产更换申请</Typography.Title>
          <Typography.Text type="secondary">批量提交时，一个旧资产生成一张申请单</Typography.Text>
        </div>

        <Card title="更换信息说明" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请人">{CURRENT_REPLACEMENT_APPLICANT.name}-{CURRENT_REPLACEMENT_APPLICANT.id}</Descriptions.Item>
            <Descriptions.Item label="更换类型">故障更换</Descriptions.Item>
            <Descriptions.Item label="更换数量">{selectedAssets.length} 项</Descriptions.Item>
            <Descriptions.Item label="更换原因" span={3}>
              <TextArea
                rows={4}
                maxLength={150}
                showCount
                value={reason}
                placeholder="请详细描述更换原因，如设备故障现象、影响工作情况等"
                onChange={(event) => setReason(event.target.value)}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="退回物资说明" size="small">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={selectedAssets}
            pagination={false}
            scroll={{ x: 1400 }}
            locale={{ emptyText: <Empty description="当前没有可更换资产" /> }}
          />
        </Card>

        <Card title="更换须知" size="small">
          <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {REPLACEMENT_NOTICE.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Checkbox checked={accepted} onChange={(event) => setAccepted(event.target.checked)}>
            已阅读并同意
          </Checkbox>
        </Card>

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button type="primary" icon={<Send size={14} />} loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={back}>返回</Button>
        </div>
      </Space>
    </div>
  );
}
