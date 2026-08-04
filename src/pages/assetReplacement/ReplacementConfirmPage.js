import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  confirmReplacementByEmployee,
  getAssetReplacementApplications,
} from '../../services/assetReplacementService';

const TAB_OLD = '旧资产退回';
const TAB_NEW = '新资产领取';

export default function ReplacementConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [applications, setApplications] = useState(() => getAssetReplacementApplications());
  const [confirmedResult, setConfirmedResult] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_OLD);

  const pending = useMemo(() => applications.map((application) => {
    if (application.returnProcess.confirmStatus === '待确认') return { application, scene: TAB_OLD };
    if (application.issueProcess.confirmStatus === '待确认') return { application, scene: TAB_NEW };
    return null;
  }).find(Boolean) || null, [applications]);

  const current = pending || confirmedResult;
  const scene = current?.scene;
  const application = current?.application;

  useEffect(() => {
    if (scene) setActiveTab(scene);
  }, [scene]);

  const confirm = (method) => {
    if (!pending) return;
    const { application: pendingApplication, scene: pendingScene } = pending;
    if (activeTab !== pendingScene) {
      messageApi.warning(`当前待确认任务为“${pendingScene === TAB_OLD ? '旧资产退回确认' : '新资产领取确认'}”`);
      return;
    }
    if (pendingApplication.applicant.id !== '213852') {
      messageApi.error('员工工号不匹配！');
      return;
    }
    confirmReplacementByEmployee(pendingApplication.id, pendingScene, method);
    const time = new Date().toLocaleString('zh-CN', { hour12: false });
    setConfirmedResult({ application: pendingApplication, scene: pendingScene, method, time });
    setApplications(getAssetReplacementApplications());
    messageApi.success(pendingScene === TAB_OLD ? '旧资产退回确认成功，可由库管员执行入库' : '新资产领取确认成功，可由库管员执行出库');
  };

  if (!current) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待确认的资产更换任务" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </div>
    );
  }

  const oldAsset = application.oldAsset;
  const newAsset = application.newAsset;

  const oldAssetColumns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '物资说明', dataIndex: 'assetDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 280, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
    { title: '更换原因', width: 220, render: () => application.reason || '-' },
    { title: '使用说明', width: 240, render: () => application.issueProcess.usageNote || '-' },
  ];

  const newAssetColumns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '物资说明', dataIndex: 'assetDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 280, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
    { title: '使用说明', width: 220, render: () => application.issueProcess.usageNote || '-' },
    { title: '借用开始日期', width: 150, render: () => application.issueProcess.startDate || application.applyDate || '-' },
    { title: '借用结束日期', width: 150, render: () => application.issueProcess.returnDate || '-' },
  ];

  const confirmationText = activeTab === TAB_OLD
    ? '我确认已将上述旧资产及相关配件交还 ES。'
    : '我已阅读并确认资产保管职责，确认已领取上述资产及相关配件。';

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
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: TAB_OLD, label: '旧资产退回确认' },
              { key: TAB_NEW, label: '新资产领取确认' },
            ]}
          />
        </Card>

        <Card title="领用人信息" size="small">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="使用人">
              {application.applicant.id}-{application.applicant.name}
            </Descriptions.Item>
            <Descriptions.Item label="部门">{application.applicant.department}</Descriptions.Item>
          </Descriptions>
        </Card>

        {activeTab === TAB_OLD ? (
          <Card title="维修物资明细" size="small">
            <Table
              rowKey="id"
              columns={oldAssetColumns}
              dataSource={oldAsset ? [oldAsset] : []}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 1300 }}
              locale={{ emptyText: <Empty description="暂无旧资产信息" /> }}
            />
          </Card>
        ) : (
          <Card title="待发放物资明细" size="small">
            <Table
              rowKey="id"
              columns={newAssetColumns}
              dataSource={newAsset ? [newAsset] : []}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 1400 }}
              locale={{ emptyText: <Empty description="暂无待发放资产信息" /> }}
            />
          </Card>
        )}

        <Card size="small">
          <Typography.Text type="danger" strong>{confirmationText}</Typography.Text>
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
            <Alert type="success" showIcon message={scene === TAB_OLD ? '确认成功，已返回库管员页面，可执行入库' : '确认成功，已返回库管员页面，可执行出库'} />
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
