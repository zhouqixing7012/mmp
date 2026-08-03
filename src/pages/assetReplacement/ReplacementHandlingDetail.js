import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Search, Trash2, UserPlus } from 'lucide-react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  endReplacementApplication,
  executeReplacementInbound,
  executeReplacementOutbound,
  requestReplacementConfirmation,
  updateAssetReplacementApplication,
} from '../../services/assetReplacementService';
import ReplacementAssetSelectModal from './ReplacementAssetSelectModal';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const { TextArea } = Input;
const WAREHOUSE_OPTIONS = ['北京总部仓', '北京影像器材仓'];
const CITY_OPTIONS = ['北京市', '上海市'];
const BUILDING_OPTIONS = {
  北京市: ['搜狐媒体大厦', '中关村园区'],
  上海市: ['上海分公司办公区'],
};
const FLOOR_OPTIONS = {
  搜狐媒体大厦: ['5层', '8层', '12层', '16层'],
  中关村园区: ['2层', '3层'],
  上海分公司办公区: ['10层', '11层'],
};
const PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途'];

export default function ReplacementHandlingDetail({ application, onBack, onUpdated }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [returnWarehouse, setReturnWarehouse] = useState(application.returnProcess.warehouse || '北京总部仓');
  const [issueWarehouse, setIssueWarehouse] = useState(application.issueProcess.warehouse || '北京总部仓');
  const [newAsset, setNewAsset] = useState(application.newAsset || null);
  const [city, setCity] = useState(application.issueProcess.city || application.oldAsset.city || '北京市');
  const [building, setBuilding] = useState(application.issueProcess.building || application.oldAsset.building || '搜狐媒体大厦');
  const [floor, setFloor] = useState(application.issueProcess.floor || application.oldAsset.floor || '8层');
  const [returnDate, setReturnDate] = useState(application.issueProcess.returnDate || dayjs().add(30, 'day').format('YYYY-MM-DD'));
  const [purpose, setPurpose] = useState(application.issueProcess.purpose || '员工用机');
  const [usageNote, setUsageNote] = useState(application.issueProcess.usageNote || '');
  const [opinion, setOpinion] = useState('同意');
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferPerson, setTransferPerson] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReturnWarehouse(application.returnProcess.warehouse || '北京总部仓');
    setIssueWarehouse(application.issueProcess.warehouse || '北京总部仓');
    setNewAsset(application.newAsset || null);
    setCity(application.issueProcess.city || application.oldAsset.city || '北京市');
    setBuilding(application.issueProcess.building || application.oldAsset.building || '搜狐媒体大厦');
    setFloor(application.issueProcess.floor || application.oldAsset.floor || '8层');
    setReturnDate(application.issueProcess.returnDate || dayjs().add(30, 'day').format('YYYY-MM-DD'));
    setPurpose(application.issueProcess.purpose || '员工用机');
    setUsageNote(application.issueProcess.usageNote || '');
    setOpinion('同意');
  }, [application]);

  const oldInboundDone = application.returnProcess.inboundStatus === '已入库';
  const oldConfirmed = application.returnProcess.confirmStatus === '已确认';
  const newConfirmed = application.issueProcess.confirmStatus === '已确认';
  const startDate = application.issueProcess.startDate
    || application.returnProcess.inboundAt?.slice(0, 10)
    || application.applyDate;

  const processUpdate = (action, successText, closeAfter = false) => {
    setSubmitting(true);
    try {
      action();
      messageApi.success(successText);
      onUpdated(application.id, closeAfter);
    } finally {
      setSubmitting(false);
    }
  };

  const persistNewAssetData = () => {
    updateAssetReplacementApplication(application.id, (record) => ({
      ...record,
      newAsset,
      issueProcess: {
        ...record.issueProcess,
        warehouse: issueWarehouse,
        city,
        building,
        floor,
        startDate,
        returnDate,
        purpose,
        usageNote,
      },
    }));
  };

  const requestOldConfirmation = () => {
    processUpdate(() => {
      persistNewAssetData();
      updateAssetReplacementApplication(application.id, (record) => ({
        ...record,
        returnProcess: { ...record.returnProcess, warehouse: returnWarehouse },
      }));
      requestReplacementConfirmation(application.id, '旧资产退回', '狐小e扫码确认');
    }, '已发起旧资产退回确认，请员工完成确认');
  };

  const executeInbound = () => {
    if (!oldConfirmed) {
      messageApi.warning('员工未完成旧资产退回确认');
      return;
    }
    processUpdate(
      () => executeReplacementInbound(application.id, returnWarehouse),
      '旧资产已入库，可继续办理待发放资产'
    );
  };

  const requestNewConfirmation = () => {
    if (!newAsset) {
      messageApi.warning('请选择待发放资产');
      return;
    }
    if (!issueWarehouse || !city || !building || !floor || !returnDate || !purpose) {
      messageApi.warning('请补齐待发放物资信息');
      return;
    }
    processUpdate(() => {
      persistNewAssetData();
      requestReplacementConfirmation(application.id, '新资产领取', '狐小e扫码确认');
    }, '已发起新资产领取确认，请员工完成确认');
  };

  const executeOutbound = () => {
    if (!newAsset) {
      messageApi.warning('请选择待发放资产');
      return;
    }
    if (!newConfirmed) {
      messageApi.warning('员工未完成新资产领取确认');
      return;
    }
    processUpdate(
      () => executeReplacementOutbound(application.id, {
        newAsset,
        issueProcess: {
          warehouse: issueWarehouse,
          city,
          building,
          floor,
          startDate,
          returnDate,
          purpose,
          usageNote,
        },
      }),
      '新资产已出库，资产更换流程完成',
      true
    );
  };

  const proceed = () => {
    if (!oldInboundDone) {
      if (!oldConfirmed) requestOldConfirmation();
      else executeInbound();
      return;
    }
    if (!newConfirmed) requestNewConfirmation();
    else executeOutbound();
  };

  const reject = () => {
    if (!opinion.trim()) {
      messageApi.warning('驳回意见必填');
      return;
    }
    Modal.confirm({
      title: '确认驳回资产更换申请？',
      content: oldInboundDone
        ? '旧资产入库结果将保留，已选择的新资产会解除锁定。'
        : '旧资产将解除锁定，流程结束。',
      okText: '确认驳回',
      cancelText: '取消',
      onOk: () => processUpdate(
        () => endReplacementApplication(application.id, opinion.trim()),
        '资产更换流程已结束',
        true
      ),
    });
  };

  const oldAsset = application.oldAsset;
  const componentCount = oldAsset.component && oldAsset.component !== '-' ? 1 : 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产更换办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card title="申请人信息" size="small">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="申请人">{application.applicant.id}-{application.applicant.name}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{application.applyTime || application.applyDate}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{application.applicant.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{application.applicant.email}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{application.applicant.department}</Descriptions.Item>
            <Descriptions.Item label="更换原因" span={2}>{application.reason}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="更换物资信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="资产标签号">{oldAsset.assetTag}</Descriptions.Item>
            <Descriptions.Item label="SN号">{oldAsset.sn || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{oldAsset.assetDesc}</Descriptions.Item>
            <Descriptions.Item label="配置">{oldAsset.config || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产状态">{oldAsset.status || '-'}</Descriptions.Item>
            <Descriptions.Item label="部件数量">{componentCount}</Descriptions.Item>
            <Descriptions.Item label="城市">{oldAsset.city || '-'}</Descriptions.Item>
            <Descriptions.Item label="建筑">{oldAsset.building || '-'}</Descriptions.Item>
            <Descriptions.Item label="楼层">{oldAsset.floor || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{oldAsset.note || '-'}</Descriptions.Item>
            <Descriptions.Item label="耗材信息" span={3}>{oldAsset.consumables || '无'}</Descriptions.Item>
            <Descriptions.Item label="鉴定结果">
              <Tag color="success">{application.mis.result || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="业务类型" span={2}>{application.mis.result || application.replacementType || '-'}</Descriptions.Item>
            <Descriptions.Item label="鉴定说明" span={3}>{application.mis.description || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title="待发放物资信息"
          size="small"
          extra={newAsset ? (
            <Button danger type="text" icon={<Trash2 size={14} />} onClick={() => setNewAsset(null)}>删除</Button>
          ) : null}
        >
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 仓库</>}>
              <Select
                className="w-full"
                value={issueWarehouse}
                options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setIssueWarehouse(value);
                  if (newAsset?.warehouse !== value) setNewAsset(null);
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="资产标签号">
              <Space.Compact className="w-full">
                <Input readOnly value={newAsset?.assetTag || ''} placeholder="请选择待发放资产" />
                <Button icon={<Search size={14} />} onClick={() => setAssetModalOpen(true)} />
              </Space.Compact>
            </Descriptions.Item>
            <Descriptions.Item label="SN号">{newAsset?.sn || '-'}</Descriptions.Item>
            <Descriptions.Item label="公司">{newAsset?.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="板块">{newAsset?.block || '-'}</Descriptions.Item>
            <Descriptions.Item label="启用日期">{newAsset?.enabledDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{newAsset?.assetDesc || '-'}</Descriptions.Item>
            <Descriptions.Item label="配置" span={2}>{newAsset?.config || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{newAsset?.note || '-'}</Descriptions.Item>
            <Descriptions.Item label="耗材信息" span={3}>{newAsset?.consumables || '无'}</Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 城市</>}>
              <Select
                className="w-full"
                value={city}
                options={CITY_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setCity(value);
                  setBuilding('');
                  setFloor('');
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 建筑</>}>
              <Select
                className="w-full"
                value={building || undefined}
                options={(BUILDING_OPTIONS[city] || []).map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setBuilding(value);
                  setFloor('');
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 楼层</>}>
              <Select
                className="w-full"
                value={floor || undefined}
                options={(FLOOR_OPTIONS[building] || []).map((value) => ({ label: value, value }))}
                onChange={setFloor}
              />
            </Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 开始日期</>}>
              <Input readOnly value={startDate} />
            </Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 归还日期</>} span={2}>
              <DatePicker
                className="w-full"
                value={returnDate ? dayjs(returnDate) : null}
                onChange={(value) => setReturnDate(value ? value.format('YYYY-MM-DD') : '')}
              />
            </Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 资产用途</>}>
              <Select
                className="w-full"
                value={purpose}
                options={PURPOSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={setPurpose}
              />
            </Descriptions.Item>
            <Descriptions.Item label="使用说明" span={2}>
              <TextArea
                rows={2}
                maxLength={400}
                showCount
                value={usageNote}
                onChange={(event) => setUsageNote(event.target.value)}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <ReplacementHistoryCard records={application.history} title="审批信息">
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={opinion}
            placeholder="同意时非必填，驳回时必填"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-3 flex justify-center gap-3">
            <Button type="primary" loading={submitting} onClick={proceed}>同意</Button>
            <Button danger onClick={reject}>驳回</Button>
            <Button onClick={onBack}>返回</Button>
            <Button icon={<UserPlus size={14} />} onClick={() => setTransferOpen(true)}>转签</Button>
          </div>
        </ReplacementHistoryCard>
      </Space>

      <ReplacementAssetSelectModal
        open={assetModalOpen}
        oldAsset={application.oldAsset}
        warehouse={issueWarehouse}
        currentAsset={newAsset}
        onCancel={() => setAssetModalOpen(false)}
        onConfirm={(asset) => {
          setNewAsset(asset);
          setAssetModalOpen(false);
          messageApi.success(`已选择资产：${asset.assetTag}`);
        }}
      />

      <Modal
        title="转签"
        open={transferOpen}
        okText="确认转签"
        cancelText="取消"
        onOk={() => {
          if (!transferPerson.trim()) {
            messageApi.warning('请输入转签人员');
            return;
          }
          messageApi.success(`已转签：${transferPerson.trim()}`);
          setTransferOpen(false);
          setTransferPerson('');
        }}
        onCancel={() => {
          setTransferOpen(false);
          setTransferPerson('');
        }}
      >
        <Input value={transferPerson} placeholder="请输入姓名或工号" onChange={(event) => setTransferPerson(event.target.value)} />
      </Modal>
    </div>
  );
}
