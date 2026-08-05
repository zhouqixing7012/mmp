import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Empty,
  Input,
  Space,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';
import { confirmConsumableClaim, getConsumableWorkflowState } from '../../services/consumableWorkflowService';

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
  const safeSeed = seed || 'consumable-claim-confirm';
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
        aria-label="扫码确认"
        disabled={disabled}
        className="mt-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onConfirm}
      >
        <div className="grid h-[168px] w-[168px] bg-white" style={{ gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))` }}>
          {cells.map((dark, index) => <span key={index} className={dark ? 'bg-black' : 'bg-white'} />)}
        </div>
      </button>
    </div>
  );
}

export default function ConsumableClaimConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [employeeId, setEmployeeId] = useState('');
  const [read, setRead] = useState(false);
  const [confirmedResult, setConfirmedResult] = useState(null);
  const claim = useMemo(
    () => getConsumableWorkflowState().claims.find((item) => (
      item.status === '处理中'
      && item.currentNode === '员工领用确认'
      && item.confirmationStatus === '待确认'
    )) || null,
    [version]
  );
  const current = claim || confirmedResult;

  const confirm = (method, targetEmployeeId) => {
    if (!claim) return;
    if (!read) {
      messageApi.warning('请先阅读并确认耗材保管职责');
      return;
    }
    if (!targetEmployeeId) {
      messageApi.warning('请输入员工工号');
      return;
    }
    try {
      const updated = confirmConsumableClaim(claim.id, targetEmployeeId, method);
      setConfirmedResult(updated);
      setEmployeeId('');
      setVersion((value) => value + 1);
      messageApi.success('员工耗材领用确认成功');
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  if (!current) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待确认的耗材领用任务" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </Space>
    );
  }

  const confirmed = Boolean(confirmedResult) || current.confirmationStatus === '已确认';
  const responsibility = '领用人确认已收到上述耗材，认同公司耗材仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。领用人应承担妥善保管耗材的责任，除自然损耗外，不得人为损坏或者疏于维护。';

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
        <Typography.Title level={4} className="mb-0">员工耗材领用确认</Typography.Title>
        <Typography.Text type="secondary">领用单号：{current.id}</Typography.Text>
      </div>

      <Card size="small" title="领用确认信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="领用人">{current.applicant.id}-{current.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="部门" span={2}>{formatDepartment(current.applicant.department)}</Descriptions.Item>
          <Descriptions.Item label="耗材说明">{current.item.materialDesc || '-'}</Descriptions.Item>
          <Descriptions.Item label="数量">{current.item.quantity || 1}</Descriptions.Item>
          <Descriptions.Item label="耗材标签号">{current.stock?.assetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="主资产标签号">{current.item.mainAssetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="主资产说明" span={2}>{current.item.mainAssetDesc || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="确认提示及保管职责">
        <Typography.Paragraph type="danger" className="mb-3">
          <strong>保管职责：</strong>{responsibility}
        </Typography.Paragraph>
        <div className="flex justify-center">
          <Checkbox checked={read} disabled={confirmed} onChange={(event) => setRead(event.target.checked)}>
            我已阅读并确认耗材保管职责
          </Checkbox>
        </div>
      </Card>

      <Card size="small" title="刷卡/扫码确认">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div>
            <Typography.Text strong>刷卡领用确认</Typography.Text>
            <Space.Compact className="mt-3 w-full max-w-xl">
              <Input
                value={employeeId}
                disabled={confirmed}
                placeholder="请输入员工工号"
                onPressEnter={() => confirm('刷卡确认', employeeId.trim())}
                onChange={(event) => setEmployeeId(event.target.value)}
              />
              <Button type="primary" disabled={confirmed} onClick={() => confirm('刷卡确认', employeeId.trim())}>确认</Button>
            </Space.Compact>
          </div>
          <ConfirmationQr
            seed={`${current.id}-${current.item.materialDesc}`}
            disabled={confirmed}
            onConfirm={() => confirm('狐小e扫码确认', current.applicant.id)}
          />
        </div>

        {confirmed && (
          <div className="mt-5">
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="识别员工工号">{current.confirmationEmployeeId}（{current.applicant.name}）</Descriptions.Item>
              <Descriptions.Item label="确认时间">{current.confirmationTime || '-'}</Descriptions.Item>
              <Descriptions.Item label="确认方式">{current.confirmationMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="确认结果" span={3}><StatusTag value="已确认" type="business" /></Descriptions.Item>
            </Descriptions>
            <Alert className="mt-4" type="success" showIcon message="确认成功，库管员可继续执行耗材出库" />
          </div>
        )}
      </Card>

      <Card size="small">
        <div className="flex justify-center">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '耗材领用' } })}>返回</Button>
        </div>
      </Card>
    </Space>
  );
}
