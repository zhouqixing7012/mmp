import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import {
  confirmContractNumberReceipt,
  getEmployeeContractNumberConfirmation,
} from '../../services/contractNumberAllocationService';
import { formatDepartment } from '../../utils/displayFormat';

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
  const safeSeed = seed || 'contract-number-confirm';
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

export default function ContractNumberReceiptConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getEmployeeContractNumberConfirmation());
  const [confirmedResult, setConfirmedResult] = useState(null);
  const [employeeId, setEmployeeId] = useState('');

  const current = application || confirmedResult;

  const confirm = (method, confirmedEmployeeId) => {
    if (!application) return;
    try {
      const updated = confirmContractNumberReceipt(application.id, confirmedEmployeeId, method);
      setConfirmedResult(updated);
      setApplication(getEmployeeContractNumberConfirmation());
      setEmployeeId('');
      messageApi.success('合约号码领取确认成功');
    } catch (error) {
      messageApi.error(error.message);
    }
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
        <Card size="small">
          <Empty description="暂无待确认的合约号码领取任务" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const applicant = current.applicant;
  const number = current.assignedNumber;
  const handling = current.warehouseHandling || {};
  const confirmed = Boolean(confirmedResult);

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">员工合约号码领取确认</Typography.Title>
          <Typography.Text type="secondary">申请单号：{current.id}</Typography.Text>
        </div>

        <Card size="small" title="领取信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="使用人">{applicant.id}-{applicant.name}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{formatDepartment(applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="电话号码">{number?.phoneNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="标签号">{number?.assetTag || '-'}</Descriptions.Item>
            <Descriptions.Item label="话费套餐">{number?.packageName || '-'}</Descriptions.Item>
            <Descriptions.Item label="当前仓库">{handling.warehouse || '-'}</Descriptions.Item>
            <Descriptions.Item label="领用原因">{handling.usageReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="数量">{handling.quantity || 1}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="领取确认提示">
          <Typography.Paragraph type="danger" strong className="mb-0">
            提示：我已核对并确认领取上述合约号码及电话卡，特此刷卡确认！
          </Typography.Paragraph>
        </Card>

        <Card size="small" title="刷卡/扫码确认">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡领取确认</Typography.Text>
              <Space.Compact className="mt-3 w-full max-w-xl">
                <Input
                  value={employeeId}
                  disabled={confirmed}
                  placeholder="请输入员工工号"
                  onPressEnter={confirmByEmployeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                />
                <Button type="primary" disabled={confirmed} onClick={confirmByEmployeeId}>确认</Button>
              </Space.Compact>
            </div>

            <ConfirmationQr
              seed={`${current.id}-${number?.phoneNumber || ''}`}
              disabled={confirmed}
              onConfirm={() => confirm('狐小e扫码确认', applicant.id)}
            />
          </div>

          {confirmedResult && (
            <div className="mt-5">
              <Descriptions bordered size="small" column={3}>
                <Descriptions.Item label="识别员工工号">{applicant.id}（{applicant.name}）</Descriptions.Item>
                <Descriptions.Item label="确认时间">{confirmedResult.warehouseHandling?.confirmationTime || '-'}</Descriptions.Item>
                <Descriptions.Item label="确认方式">{confirmedResult.warehouseHandling?.confirmationMethod || '-'}</Descriptions.Item>
                <Descriptions.Item label="确认结果" span={3}>
                  <StatusTag value="已确认" type="business" />
                </Descriptions.Item>
              </Descriptions>
              <Alert className="mt-4" type="success" showIcon message="确认成功，合约号码领取流程已完成" />
            </div>
          )}
        </Card>

        <div className="flex justify-center rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '合约号码库管员待办' } })}>返回</Button>
        </div>
      </Space>
    </div>
  );
}
