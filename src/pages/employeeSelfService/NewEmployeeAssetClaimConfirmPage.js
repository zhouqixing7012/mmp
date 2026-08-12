import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Input,
  QRCode,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';

const CLAIM = {
  claimNo: 'NE-202608110005',
  applicant: {
    id: '221171',
    name: '王芷洋',
    department: '搜狐媒体.内容中心.财经中心',
  },
  assets: [
    {
      id: 'new-employee-confirm-1',
      lineNo: 1,
      assetTag: '11216121700480',
      description: '戴尔 Latitude E7450 笔记本电脑',
      configuration: 'i5-5300U / 8G / 500G / 14英寸',
      applyQuantity: 1,
      claimQuantity: 1,
      purpose: '员工用机',
      usageDescription: '-',
    },
  ],
};

const RESPONSIBILITY_TEXT = '领用人确认已收到上述资产及相关配件，认同公司资产仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。领用人应承担妥善保管资产的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应的赔偿责任。应公司需要，领用人应当配合及时调换或归还领用资产。如领用人延迟甚至拒绝交还公司资产，公司保留采取进一步手段的权利，包括但不限于留置领用人工资、奖金或者其他个人资产。';

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function NewEmployeeAssetClaimConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [employeeId, setEmployeeId] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  const rows = useMemo(() => CLAIM.assets, []);

  const columns = [
    { title: '行号', dataIndex: 'lineNo', width: 70, align: 'center' },
    { title: '资产标签号', dataIndex: 'assetTag', width: 170 },
    { title: '物资说明', dataIndex: 'description', width: 240, ellipsis: true },
    { title: '配置', dataIndex: 'configuration', width: 260, ellipsis: true },
    { title: '申请数量', dataIndex: 'applyQuantity', width: 100, align: 'center' },
    { title: '领用数量', dataIndex: 'claimQuantity', width: 100, align: 'center' },
    { title: '用途', dataIndex: 'purpose', width: 130 },
    { title: '使用说明', dataIndex: 'usageDescription', width: 180, render: (value) => value || '-' },
  ];

  const finishConfirm = (method) => {
    const time = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
    setConfirmed({ method, time });
    messageApi.success('新员工领用确认成功');
  };

  const confirmByEmployeeId = () => {
    const value = employeeId.trim();
    if (!value) {
      messageApi.warning('请输入员工工号');
      return;
    }
    if (value !== CLAIM.applicant.id) {
      messageApi.error('员工工号与领用人不一致');
      return;
    }
    finishConfirm('刷卡/工号确认');
  };

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">新员工领用员工确认</Typography.Title>
          <Typography.Text type="secondary">领用单号：{CLAIM.claimNo}</Typography.Text>
        </div>

        <Card title={<SectionTitle>领用人信息</SectionTitle>} size="small">
          <DetailGrid>
            <DetailItem label="使用人">{CLAIM.applicant.id}-{CLAIM.applicant.name}</DetailItem>
            <DetailItem label="部门" span={2}>{CLAIM.applicant.department}</DetailItem>
          </DetailGrid>
        </Card>

        <Card title={<SectionTitle>领用物资明细</SectionTitle>} size="small">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1250 }}
          />
        </Card>

        <Card title={<SectionTitle>确认提示及保管职责</SectionTitle>} size="small">
          <Typography.Paragraph type="danger" strong className="mb-3">
            提示：我已阅读并确认保管职责说明，特此刷卡或扫码确认！
          </Typography.Paragraph>
          <Typography.Paragraph type="danger" className="mb-0 leading-7">
            <strong>保管职责：</strong>{RESPONSIBILITY_TEXT}
          </Typography.Paragraph>
        </Card>

        <Card title={<SectionTitle>刷卡/扫码确认</SectionTitle>} size="small">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡领用确认</Typography.Text>
              <Typography.Paragraph type="secondary" className="mt-1 mb-3">
                请刷员工卡，或由管理员录入领用人员工工号后确认。
              </Typography.Paragraph>
              <Space.Compact className="w-full max-w-xl">
                <Input
                  value={employeeId}
                  disabled={Boolean(confirmed)}
                  placeholder="请输入员工工号"
                  onPressEnter={confirmByEmployeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                />
                <Button
                  type="primary"
                  disabled={Boolean(confirmed)}
                  onClick={confirmByEmployeeId}
                >
                  确认领用
                </Button>
              </Space.Compact>
            </div>

            <div className="flex flex-col items-center justify-center">
              <QRCode value={`new-employee-claim:${CLAIM.claimNo}:${CLAIM.applicant.id}`} size={156} />
              <Typography.Text strong className="mt-3">狐小 e 扫码确认</Typography.Text>
              <Button
                className="mt-3"
                disabled={Boolean(confirmed)}
                onClick={() => finishConfirm('狐小 e 扫码确认')}
              >
                模拟扫码确认
              </Button>
            </div>
          </div>

          {confirmed && (
            <div className="mt-5">
              <DetailGrid>
                <DetailItem label="识别员工">{CLAIM.applicant.id}-{CLAIM.applicant.name}</DetailItem>
                <DetailItem label="确认时间">{confirmed.time}</DetailItem>
                <DetailItem label="确认方式">{confirmed.method}</DetailItem>
                <DetailItem label="确认结果" span={3}>
                  <StatusTag value="已确认" type="business" />
                </DetailItem>
              </DetailGrid>
            </div>
          )}
        </Card>

        <div className="flex justify-center py-2">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '新员工领用单' } })}>返回</Button>
        </div>
      </Space>
    </>
  );
}
