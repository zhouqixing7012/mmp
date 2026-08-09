import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import {
  confirmReplacementByEmployee,
  getAssetReplacementApplications,
} from '../../services/assetReplacementService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';

const TAB_OLD = '旧资产退回';
const TAB_NEW = '新资产领取';
const QR_SIZE = 21;

function isFinderCell(row, column, startRow, startColumn) {
  const localRow = row - startRow;
  const localColumn = column - startColumn;
  if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) return false;
  const border = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
  const core = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;
  return border || core;
}

function buildQrCells(seed = '') {
  const safeSeed = seed || 'asset-confirm';
  return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const row = Math.floor(index / QR_SIZE);
    const column = index % QR_SIZE;
    const finder = isFinderCell(row, column, 0, 0)
      || isFinderCell(row, column, 0, QR_SIZE - 7)
      || isFinderCell(row, column, QR_SIZE - 7, 0);
    if (finder) return true;
    if (row === 6 || column === 6) return (row + column) % 2 === 0;
    const code = safeSeed.charCodeAt((row * QR_SIZE + column) % safeSeed.length);
    return ((row * 11) + (column * 7) + code) % 9 < 4;
  });
}

function ConfirmationQr({ seed, disabled, onConfirm }) {
  const cells = useMemo(() => buildQrCells(seed), [seed]);

  return (
    <div className="flex flex-col items-center">
      <Typography.Text strong>扫码确认</Typography.Text>
      <button
        type="button"
        className="mt-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        aria-label="扫码确认"
        onClick={onConfirm}
      >
        <div
          className="grid h-[168px] w-[168px] bg-white"
          style={{ gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))` }}
        >
          {cells.map((dark, index) => (
            <span key={index} className={dark ? 'bg-black' : 'bg-white'} />
          ))}
        </div>
      </button>
    </div>
  );
}

export default function ReplacementConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [applications, setApplications] = useState(() => getAssetReplacementApplications());
  const [confirmedResult, setConfirmedResult] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_OLD);
  const [employeeId, setEmployeeId] = useState('');

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
    setEmployeeId('');
  }, [scene, application?.id]);

  const confirm = (method, confirmedEmployeeId) => {
    if (!pending) return;
    const { application: pendingApplication, scene: pendingScene } = pending;
    if (activeTab !== pendingScene) {
      messageApi.warning(`当前待确认任务为“${pendingScene === TAB_OLD ? '旧资产退回确认' : '新资产领取确认'}”`);
      return;
    }
    if (confirmedEmployeeId !== pendingApplication.applicant.id) {
      messageApi.error('员工工号不匹配！');
      return;
    }
    confirmReplacementByEmployee(pendingApplication.id, pendingScene, method);
    const time = new Date().toLocaleString('zh-CN', { hour12: false });
    setConfirmedResult({ application: pendingApplication, scene: pendingScene, method, time });
    setApplications(getAssetReplacementApplications());
    messageApi.success(pendingScene === TAB_OLD ? '旧资产退回确认成功，可由库管员执行入库' : '新资产领取确认成功，可由库管员执行出库');
  };

  const confirmByEmployeeId = () => {
    const value = employeeId.trim();
    if (!value) {
      messageApi.warning('请输入员工工号');
      return;
    }
    confirm('刷卡确认', value);
  };

  if (!current) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待确认的资产更换任务" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
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
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 280, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
    { title: '更换原因', width: 220, render: () => application.reason || '-' },
    { title: '使用说明', width: 240, render: () => application.issueProcess.usageNote || '-' },
  ];

  const newAssetColumns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 280, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
    { title: '使用说明', width: 220, render: () => application.issueProcess.usageNote || '-' },
    { title: '借用开始日期', width: 150, render: () => formatDateText(application.issueProcess.startDate || application.applyDate) },
    { title: '借用结束日期', width: 150, render: () => formatDateText(application.issueProcess.returnDate) },
  ];

  const responsibilityText = '领用人须承担妥善保管资产的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应的赔偿责任。应公司需要，领用人应当配合及时调换或归还资产；如延迟甚至拒绝交还公司资产，公司保留采取进一步处理措施的权利。';
  const cardLabel = activeTab === TAB_OLD ? '刷卡退回确认' : '刷卡领用确认';

  const tabItems = [
    {
      key: TAB_OLD,
      label: <span className="text-sm">旧资产退回确认</span>,
      children: (
        <div className="pt-1">
          <div className="mb-3 text-sm font-medium text-slate-700">维修资产明细</div>
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
        </div>
      ),
    },
    {
      key: TAB_NEW,
      label: <span className="text-sm">新资产领取确认</span>,
      children: (
        <div className="pt-1">
          <div className="mb-3 text-sm font-medium text-slate-700">待发放资产明细</div>
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
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">员工资产确认</Typography.Title>
        </div>

        <Card title="资产确认信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="使用人">
              {application.applicant.id}-{application.applicant.name}
            </Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{formatDepartment(application.applicant.department)}</Descriptions.Item>
          </Descriptions>
          <Tabs
            size="small"
            className="mt-3"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>

        <Card title="确认提示及保管职责" size="small">
          <Typography.Paragraph type="danger" strong className="mb-3">
            提示：我已阅读并确认保管职责说明，特此刷卡确认！
          </Typography.Paragraph>
          <Typography.Paragraph type="danger" className="mb-0">
            <strong>保管职责：</strong>{responsibilityText}
          </Typography.Paragraph>
        </Card>

        <Card title="刷卡/扫码确认" size="small">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>{cardLabel}</Typography.Text>
              <Space.Compact className="mt-3 w-full max-w-xl">
                <Input
                  value={employeeId}
                  disabled={Boolean(confirmedResult)}
                  placeholder="请输入员工工号"
                  onPressEnter={confirmByEmployeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                />
                <Button
                  type="primary"
                  disabled={Boolean(confirmedResult)}
                  onClick={confirmByEmployeeId}
                >
                  确认
                </Button>
              </Space.Compact>
            </div>

            <ConfirmationQr
              seed={`${application.id}-${activeTab}`}
              disabled={Boolean(confirmedResult)}
              onConfirm={() => confirm('狐小e扫码确认', application.applicant.id)}
            />
          </div>

          {confirmedResult && (
            <div className="mt-5">
              <Descriptions bordered size="small" column={3}>
                <Descriptions.Item label="识别员工工号">{application.applicant.id}（{application.applicant.name}）</Descriptions.Item>
                <Descriptions.Item label="确认时间">{confirmedResult.time}</Descriptions.Item>
                <Descriptions.Item label="确认方式">{confirmedResult.method}</Descriptions.Item>
                <Descriptions.Item label="确认结果" span={3}><StatusTag value="已确认" type="business" /></Descriptions.Item>
              </Descriptions>
              <Alert
                className="mt-4"
                type="success"
                showIcon
                message={scene === TAB_OLD ? '确认成功，已返回库管员页面，可执行入库' : '确认成功，已返回库管员页面，可执行出库'}
              />
            </div>
          )}
        </Card>

        <div className="flex justify-center rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '资产更换办理' } })}>返回</Button>
        </div>
      </Space>
    </div>
  );
}
