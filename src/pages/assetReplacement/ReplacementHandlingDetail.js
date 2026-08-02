import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Search, UserPlus } from 'lucide-react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import ApplicantInfoCard from '../employeeSelfService/ApplicantInfoCard';
import {
  endReplacementApplication,
  executeReplacementInbound,
  executeReplacementOutbound,
  requestReplacementConfirmation,
  updateAssetReplacementApplication,
} from '../../services/assetReplacementService';
import ReplacementAssetSelectModal from './ReplacementAssetSelectModal';
import ReplacementEmployeeAssetsModal from './ReplacementEmployeeAssetsModal';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const { TextArea } = Input;
const WAREHOUSE_OPTIONS = ['北京总部仓', '北京影像器材仓'];
const CITY_OPTIONS = ['北京市', '上海市'];
const BUILDING_OPTIONS = {
  北京市: ['搜狐媒体大厦', '中关村园区'],
  上海市: ['上海分公司办公区'],
};
const FLOOR_OPTIONS = {
  搜狐媒体大厦: ['5层', '8层', '12层'],
  中关村园区: ['2层', '3层'],
  上海分公司办公区: ['10层', '11层'],
};

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
  const [oldConfirmMethod, setOldConfirmMethod] = useState(application.returnProcess.confirmMethod || '狐小e扫码确认');
  const [newConfirmMethod, setNewConfirmMethod] = useState(application.issueProcess.confirmMethod || '狐小e扫码确认');
  const [opinion, setOpinion] = useState('');
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [employeeAssetsOpen, setEmployeeAssetsOpen] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');
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
    setOldConfirmMethod(application.returnProcess.confirmMethod || '狐小e扫码确认');
    setNewConfirmMethod(application.issueProcess.confirmMethod || '狐小e扫码确认');
  }, [application]);

  const oldInboundDone = application.returnProcess.inboundStatus === '已入库';
  const oldConfirmed = application.returnProcess.confirmStatus === '已确认';
  const newConfirmed = application.issueProcess.confirmStatus === '已确认';
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

  const requestOldConfirmation = () => {
    processUpdate(() => {
      updateAssetReplacementApplication(application.id, (record) => ({
        ...record,
        returnProcess: { ...record.returnProcess, warehouse: returnWarehouse },
      }));
      requestReplacementConfirmation(application.id, '旧资产退回', oldConfirmMethod);
    }, '已发起旧资产退回确认，请员工扫码或刷卡确认');
  };

  const executeInbound = () => {
    if (!oldConfirmed) {
      messageApi.warning('员工未完成旧资产退回确认');
      return;
    }
    processUpdate(
      () => executeReplacementInbound(application.id, returnWarehouse),
      '旧资产已入库，现可选择待发放新资产'
    );
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
        returnDate,
        purpose,
        usageNote,
      },
    }));
  };

  const requestNewConfirmation = () => {
    if (!newAsset) {
      messageApi.warning('请先选择待发放资产');
      return;
    }
    if (!city || !building || !floor || !returnDate || !purpose) {
      messageApi.warning('请补齐新资产发放信息');
      return;
    }
    processUpdate(() => {
      persistNewAssetData();
      requestReplacementConfirmation(application.id, '新资产领取', newConfirmMethod);
    }, '已发起新资产领取确认，请员工扫码或刷卡确认');
  };

  const executeOutbound = () => {
    if (!newAsset) {
      messageApi.warning('请先选择待发放资产');
      return;
    }
    if (!newConfirmed) {
      messageApi.warning('员工未完成新资产领取确认');
      return;
    }
    processUpdate(
      () => executeReplacementOutbound(application.id, {
        newAsset,
        issueProcess: { warehouse: issueWarehouse, city, building, floor, returnDate, purpose, usageNote },
      }),
      '新资产已出库，资产更换流程完成',
      true
    );
  };

  const endProcess = () => {
    if (!opinion.trim()) {
      messageApi.warning(oldInboundDone ? '放弃领用原因必填' : '驳回意见必填');
      return;
    }
    Modal.confirm({
      title: oldInboundDone ? '确认放弃新资产领用？' : '确认驳回资产更换申请？',
      content: oldInboundDone ? '旧资产退库结果将保留，已选择的新资产会解除锁定。' : '旧资产将解除锁定，流程结束。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => processUpdate(
        () => endReplacementApplication(application.id, opinion.trim()),
        '资产更换流程已结束',
        true
      ),
    });
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

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产更换办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <ApplicantInfoCard applicant={application.applicant} applyDate={application.applyDate} onViewAssets={() => setEmployeeAssetsOpen(true)} />

        <Card title="申请及MIS鉴定信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="更换原因" span={3}>{application.reason}</Descriptions.Item>
            <Descriptions.Item label="MIS鉴定结果"><Tag color="success">{application.mis.result}</Tag></Descriptions.Item>
            <Descriptions.Item label="MIS鉴定说明" span={2}>{application.mis.description}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="旧资产退回" size="small">
          <Space direction="vertical" size={16} className="w-full">
            <div className="flex items-center gap-3">
              <Typography.Text strong><span className="text-red-500">*</span> 当前仓库：</Typography.Text>
              <Select disabled={oldInboundDone} style={{ width: 260 }} value={returnWarehouse} options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={setReturnWarehouse} />
              <Tag color={oldInboundDone ? 'success' : 'processing'}>{application.returnProcess.inboundStatus}</Tag>
              {application.returnProcess.inboundOrderNo && <Typography.Text type="secondary">入库单号：{application.returnProcess.inboundOrderNo}</Typography.Text>}
            </div>
            <Descriptions bordered size="small" column={4}>
              <Descriptions.Item label="资产标签号">{application.oldAsset.assetTag}</Descriptions.Item>
              <Descriptions.Item label="SN号">{application.oldAsset.sn}</Descriptions.Item>
              <Descriptions.Item label="资产说明">{application.oldAsset.assetDesc}</Descriptions.Item>
              <Descriptions.Item label="配置">{application.oldAsset.config}</Descriptions.Item>
              <Descriptions.Item label="资产状态">{application.oldAsset.status}</Descriptions.Item>
              <Descriptions.Item label="部件数量">{application.oldAsset.component === '-' ? 0 : 1}</Descriptions.Item>
              <Descriptions.Item label="城市/建筑/楼层">{application.oldAsset.city} / {application.oldAsset.building} / {application.oldAsset.floor}</Descriptions.Item>
              <Descriptions.Item label="耗材信息">{application.oldAsset.consumables}</Descriptions.Item>
            </Descriptions>
            <div className="flex flex-wrap items-center gap-3">
              <Typography.Text strong>确认方式：</Typography.Text>
              <Radio.Group disabled={oldInboundDone} value={oldConfirmMethod} options={['狐小e扫码确认', '刷卡确认'].map((value) => ({ label: value, value }))} onChange={(event) => setOldConfirmMethod(event.target.value)} />
              <Typography.Text strong>确认状态：</Typography.Text>
              <Tag color={application.returnProcess.confirmStatus === '已确认' ? 'success' : application.returnProcess.confirmStatus === '待确认' ? 'warning' : 'default'}>{application.returnProcess.confirmStatus}</Tag>
              <Button disabled={oldInboundDone || application.returnProcess.confirmStatus === '待确认'} onClick={requestOldConfirmation}>员工退库确认</Button>
              <Button type="primary" disabled={oldInboundDone || !oldConfirmed} onClick={executeInbound}>执行入库</Button>
            </div>
          </Space>
        </Card>

        <Card title="新资产发放" size="small">
          {!oldInboundDone ? (
            <Typography.Text type="secondary">旧资产入库完成后开放新资产发放区。</Typography.Text>
          ) : (
            <Space direction="vertical" size={16} className="w-full">
              <div className="flex flex-wrap items-center gap-3">
                <Typography.Text strong><span className="text-red-500">*</span> 发放仓库：</Typography.Text>
                <Select style={{ width: 240 }} value={issueWarehouse} options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => {
                  setIssueWarehouse(value);
                  if (newAsset?.warehouse !== value) setNewAsset(null);
                }} />
                <Typography.Text strong><span className="text-red-500">*</span> 资产标签号：</Typography.Text>
                <Input readOnly style={{ width: 230 }} value={newAsset?.assetTag || ''} placeholder="请选择待发放资产" addonAfter={<Search size={14} className="cursor-pointer" onClick={() => setAssetModalOpen(true)} />} />
                <Button onClick={() => setAssetModalOpen(true)}>选择资产</Button>
              </div>

              <Descriptions bordered size="small" column={4}>
                <Descriptions.Item label="SN号">{newAsset?.sn || '-'}</Descriptions.Item>
                <Descriptions.Item label="公司">{newAsset?.company || '-'}</Descriptions.Item>
                <Descriptions.Item label="板块">{newAsset?.block || '-'}</Descriptions.Item>
                <Descriptions.Item label="启用日期">{newAsset?.enabledDate || '-'}</Descriptions.Item>
                <Descriptions.Item label="资产说明">{newAsset?.assetDesc || '-'}</Descriptions.Item>
                <Descriptions.Item label="配置">{newAsset?.config || '-'}</Descriptions.Item>
                <Descriptions.Item label="备注">{newAsset?.note || '-'}</Descriptions.Item>
                <Descriptions.Item label="耗材信息">{newAsset?.consumables || '-'}</Descriptions.Item>
                {newAsset?.inventoryStatus && <Descriptions.Item label="盘点状态"><Typography.Text type="danger">{newAsset.inventoryStatus}</Typography.Text></Descriptions.Item>}
              </Descriptions>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div><Typography.Text strong>城市：</Typography.Text><Select className="mt-2 w-full" value={city} options={CITY_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => { setCity(value); setBuilding(''); setFloor(''); }} /></div>
                <div><Typography.Text strong>建筑：</Typography.Text><Select className="mt-2 w-full" value={building || undefined} options={(BUILDING_OPTIONS[city] || []).map((value) => ({ label: value, value }))} onChange={(value) => { setBuilding(value); setFloor(''); }} /></div>
                <div><Typography.Text strong>楼层：</Typography.Text><Select className="mt-2 w-full" value={floor || undefined} options={(FLOOR_OPTIONS[building] || []).map((value) => ({ label: value, value }))} onChange={setFloor} /></div>
                <div><Typography.Text strong>开始日期：</Typography.Text><Input className="mt-2" readOnly value={application.returnProcess.inboundAt?.slice(0, 10) || dayjs().format('YYYY-MM-DD')} /></div>
                <div><Typography.Text strong>归还日期：</Typography.Text><DatePicker className="mt-2 w-full" value={returnDate ? dayjs(returnDate) : null} onChange={(value) => setReturnDate(value ? value.format('YYYY-MM-DD') : '')} /></div>
                <div><Typography.Text strong>资产用途：</Typography.Text><Select className="mt-2 w-full" value={purpose} options={['专业用途', '其他用途', '员工用机', '部门用机'].map((value) => ({ label: value, value }))} onChange={setPurpose} /></div>
                <div className="lg:col-span-3"><Typography.Text strong>使用说明：</Typography.Text><TextArea className="mt-2" rows={3} maxLength={400} showCount value={usageNote} onChange={(event) => setUsageNote(event.target.value)} /></div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Typography.Text strong>确认方式：</Typography.Text>
                <Radio.Group value={newConfirmMethod} options={['狐小e扫码确认', '刷卡确认'].map((value) => ({ label: value, value }))} onChange={(event) => setNewConfirmMethod(event.target.value)} />
                <Typography.Text strong>确认状态：</Typography.Text>
                <Tag color={application.issueProcess.confirmStatus === '已确认' ? 'success' : application.issueProcess.confirmStatus === '待确认' ? 'warning' : 'default'}>{application.issueProcess.confirmStatus}</Tag>
                <Button disabled={!newAsset || application.issueProcess.confirmStatus === '待确认'} onClick={requestNewConfirmation}>员工领用确认</Button>
                <Button type="primary" disabled={!newConfirmed} onClick={executeOutbound}>执行出库</Button>
              </div>
            </Space>
          )}
        </Card>

        <ReplacementHistoryCard records={application.history} />

        <Card title="办理操作" size="small">
          <TextArea rows={3} maxLength={400} showCount value={opinion} placeholder={oldInboundDone ? '放弃领用时必填' : '驳回时必填'} onChange={(event) => setOpinion(event.target.value)} />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={submitting} onClick={proceed}>同意</Button>
            <Button danger onClick={endProcess}>{oldInboundDone ? '放弃领用' : '驳回'}</Button>
            <Button icon={<UserPlus size={14} />} onClick={() => setCountersignOpen(true)}>加签</Button>
            <Button onClick={onBack}>返回</Button>
          </div>
        </Card>
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
      <ReplacementEmployeeAssetsModal open={employeeAssetsOpen} applicant={application.applicant} onCancel={() => setEmployeeAssetsOpen(false)} />
      <Modal
        title="加签"
        open={countersignOpen}
        okText="确认加签"
        cancelText="取消"
        onOk={() => {
          if (!countersignPerson.trim()) {
            messageApi.warning('请输入加签人员');
            return;
          }
          messageApi.success(`已加签：${countersignPerson.trim()}`);
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
        onCancel={() => {
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
      >
        <Input value={countersignPerson} placeholder="请输入姓名或工号" onChange={(event) => setCountersignPerson(event.target.value)} />
      </Modal>
    </div>
  );
}
