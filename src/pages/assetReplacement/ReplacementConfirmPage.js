import React, { useMemo, useState } from 'react';
import { CreditCard, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Empty, Space, Tabs, Tag, Typography, message as antdMessage } from 'antd';
import {
  confirmReplacementByEmployee,
  getAssetReplacementApplications,
} from '../../services/assetReplacementService';

export default function ReplacementConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [applications, setApplications] = useState(() => getAssetReplacementApplications());
  const [confirmedResult, setConfirmedResult] = useState(null);

  const pending = useMemo(() => applications.map((application) => {
    if (application.returnProcess.confirmStatus === '待确认') return { application, scene: '旧资产退回' };
    if (application.issueProcess.confirmStatus === '待确认') return { application, scene: '新资产领取' };
    return null;
  }).find(Boolean) || null, [applications]);

  const confirm = (method) => {
    if (!pending) return;
    const { application, scene } = pending;
    if (application.applicant.id !== '213852') {
      messageApi.error('员工工号不匹配！');
      return;
    }
    confirmReplacementByEmployee(application.id, scene, method);
    const time = new Date().toLocaleString('zh-CN', { hour12: false });
    setConfirmedResult({ application, scene, method, time });
    setApplications(getAssetReplacementApplications());
    messageApi.success(scene === '旧资产退回' ? '旧资产退回确认成功，可由库管员执行入库' : '新资产领取确认成功，可由库管员执行出库');
  };

  const current = pending || confirmedResult;
  const scene = current?.scene;
  const application = current?.application;
  const asset = scene === '旧资产退回' ? application?.oldAsset : application?.newAsset;
  const confirmationText = scene === '旧资产退回'
    ? '我确认已将上述旧资产及相关配件交还 ES。'
    : '我已阅读并确认资产保管职责，确认已领取上述资产及相关配件。';

  if (!current) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待确认的资产更换任务" />
          <div className="mt-4 flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">员工资产确认</Typography.Title>
          <Typography.Text type="secondary">确认工号必须与申请人工号一致</Typography.Text>
        </div>

        <Card size="small">
          <Tabs
            activeKey={scene}
            items={[
              { key: '旧资产退回', label: '旧资产退回确认', disabled: scene !== '旧资产退回' },
              { key: '新资产领取', label: '新资产领取确认', disabled: scene !== '新资产领取' },
            ]}
          />
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="确认场景">{scene}</Descriptions.Item>
            <Descriptions.Item label="申请人">{application.applicant.name}（工号：{application.applicant.id}）</Descriptions.Item>
            <Descriptions.Item label="申请单号">{application.id}</Descriptions.Item>
            <Descriptions.Item label="资产标签号">{asset?.assetTag || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{asset?.assetDesc || '-'}</Descriptions.Item>
            <Descriptions.Item label="配置">{asset?.config || '-'}</Descriptions.Item>
            <Descriptions.Item label="确认说明">{confirmationText}</Descriptions.Item>
          </Descriptions>
        </Card>

        {confirmedResult ? (
          <>
            <Card title="刷卡/扫码结果" size="small">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="识别员工工号">213852（孙志强）</Descriptions.Item>
                <Descriptions.Item label="确认时间">{confirmedResult.time}</Descriptions.Item>
                <Descriptions.Item label="确认方式">{confirmedResult.method}</Descriptions.Item>
                <Descriptions.Item label="确认结果"><Tag color="success">确认成功</Tag></Descriptions.Item>
              </Descriptions>
            </Card>
            <Alert type="success" showIcon message={scene === '旧资产退回' ? '确认成功，已返回库管员页面，可执行入库' : '确认成功，已返回库管员页面，可执行出库'} />
          </>
        ) : (
          <Alert type="info" showIcon message="请使用狐小e扫码或刷卡完成身份确认" />
        )}

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button type="primary" icon={<ScanLine size={15} />} disabled={Boolean(confirmedResult)} onClick={() => confirm('狐小e扫码确认')}>模拟扫码确认</Button>
          <Button type="primary" icon={<CreditCard size={15} />} disabled={Boolean(confirmedResult)} onClick={() => confirm('刷卡确认')}>模拟刷卡确认</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '资产更换办理' } })}>返回</Button>
        </div>
      </Space>
    </div>
  );
}
