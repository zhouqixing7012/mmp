import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import {
  endReplacementApplication,
  executeReplacementInbound,
  executeReplacementOutbound,
  requestReplacementConfirmation,
  updateAssetReplacementApplication,
} from '../../services/assetReplacementService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';
import ReplacementAssetSelectModal from './ReplacementAssetSelectModal';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const { TextArea } = Input;
const WAREHOUSE_OPTIONS = ['北京总部仓', '北京影像器材仓'];
const WAREHOUSE_MANAGER_MAP = {
  北京总部仓: 'SOHU53-库房管理员-搜狐媒体',
  北京影像器材仓: 'SOHU54-库房管理员-新媒体',
};
const ASSET_MARK_OPTIONS = ['无', '限制出库', '待维修', '待数据清理'];
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

export default function ReplacementHandlingDetail({ application, onBack, onUpdated }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [returnWarehouse, setReturnWarehouse] = useState(application.returnProcess.warehouse || '北京总部仓');
  const [returnAssetMark, setReturnAssetMark] = useState(application.returnProcess.assetMark || '');
  const [returnUsageNote, setReturnUsageNote] = useState(application.returnProcess.usageNote || '');
  const [issueWarehouse, setIssueWarehouse] = useState(application.issueProcess.warehouse || '北京总部仓');
  const [newAsset, setNewAsset] = useState(application.newAsset || null);
  const [city, setCity] = useState(application.issueProcess.city || application.oldAsset.city || '北京市');
  const [building, setBuilding] = useState(application.issueProcess.building || application.oldAsset.building || '搜狐媒体大厦');
  const [floor, setFloor] = useState(application.issueProcess.floor || application.oldAsset.floor || '8层');
  const [purpose, setPurpose] = useState(application.issueProcess.purpose || '');
  const [usageNote, setUsageNote] = useState(application.issueProcess.usageNote || '');
  const [opinion, setOpinion] = useState('');
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [addSignOpen, setAddSignOpen] = useState(false);
  const [addSignPerson, setAddSignPerson] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReturnWarehouse(application.returnProcess.warehouse || '北京总部仓');
    setReturnAssetMark(application.returnProcess.assetMark || '');
    setReturnUsageNote(application.returnProcess.usageNote || '');
    setIssueWarehouse(application.issueProcess.warehouse || '北京总部仓');
    setNewAsset(application.newAsset || null);
    setCity(application.issueProcess.city || application.oldAsset.city || '北京市');
    setBuilding(application.issueProcess.building || application.oldAsset.building || '搜狐媒体大厦');
    setFloor(application.issueProcess.floor || application.oldAsset.floor || '8层');
    setPurpose(application.issueProcess.purpose || '');
    setUsageNote(application.issueProcess.usageNote || '');
    setOpinion('');
  }, [application]);

  const oldInboundDone = application.returnProcess.inboundStatus === '已入库';
  const oldConfirmed = application.returnProcess.confirmStatus === '已确认';
  const oldWaitingConfirmation = application.returnProcess.confirmStatus === '待确认';
  const newConfirmed = application.issueProcess.confirmStatus === '已确认';
  const newWaitingConfirmation = application.issueProcess.confirmStatus === '待确认';
  const returnManager = WAREHOUSE_MANAGER_MAP[returnWarehouse] || '-';
  const confirmedReturnDate = application.returnProcess.confirmedAt
    ? formatDateText(application.returnProcess.confirmedAt)
    : '-';

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

  const openEmployeeConfirmation = (scene) => {
    navigate('/yewurules', {
      state: {
        workspace: '员工资产确认',
        replacementConfirmScene: scene,
        replacementApplicationId: application.id,
      },
    });
  };

  const persistReturnData = () => {
    updateAssetReplacementApplication(application.id, (record) => ({
      ...record,
      returnProcess: {
        ...record.returnProcess,
        warehouse: returnWarehouse,
        responsiblePerson: returnManager,
        assetMark: returnAssetMark,
        usageNote: returnUsageNote,
      },
    }));
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
        purpose,
        usageNote,
      },
    }));
  };

  const requestOldConfirmation = () => {
    processUpdate(() => {
      persistReturnData();
      requestReplacementConfirmation(application.id, '旧资产退回', '狐小e扫码确认');
    }, '已发起旧资产退库确认，请员工完成确认');
    openEmployeeConfirmation('旧资产退回');
  };

  const executeInbound = () => {
    if (!oldConfirmed) {
      messageApi.warning('员工未完成旧资产退库确认');
      return;
    }
    processUpdate(() => {
      persistReturnData();
      executeReplacementInbound(application.id, returnWarehouse);
    }, '旧资产退库确认完成，已入库，可继续办理待发放资产');
  };

  const handleReturnConfirm = () => {
    if (oldInboundDone) {
      messageApi.info('旧资产退库已确认完成');
      return;
    }
    if (oldWaitingConfirmation) {
      openEmployeeConfirmation('旧资产退回');
      return;
    }
    if (!oldConfirmed) {
      requestOldConfirmation();
      return;
    }
    executeInbound();
  };

  const requestNewConfirmation = () => {
    if (!oldInboundDone) {
      messageApi.warning('请先完成旧资产退库确认');
      return;
    }
    if (!newAsset) {
      messageApi.warning('请选择待发放资产');
      return;
    }
    if (!issueWarehouse || !city || !building || !floor || !purpose) {
      messageApi.warning('请补齐待发放资产信息');
      return;
    }
    processUpdate(() => {
      persistNewAssetData();
      requestReplacementConfirmation(application.id, '新资产领取', '狐小e扫码确认');
    }, '已发起新资产领用确认，请员工完成确认');
    openEmployeeConfirmation('新资产领取');
  };

  const executeOutbound = () => {
    if (!newAsset) {
      messageApi.warning('请选择待发放资产');
      return;
    }
    if (!newConfirmed) {
      messageApi.warning('员工未完成新资产领用确认');
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
          purpose,
          usageNote,
        },
      }),
      '新资产领用确认完成，已出库，资产更换流程完成',
      true
    );
  };

  const handleIssueConfirm = () => {
    if (!oldInboundDone) {
      messageApi.warning('请先完成旧资产退库确认');
      return;
    }
    if (newWaitingConfirmation) {
      openEmployeeConfirmation('新资产领取');
      return;
    }
    if (!newConfirmed) {
      requestNewConfirmation();
      return;
    }
    executeOutbound();
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
  const applyDate = formatDateText(application.applyDate || application.applyTime);
  const showOldInventory = Boolean(oldAsset.inventoryPerson && oldAsset.inventoryStatus);
  const showNewInventory = Boolean(newAsset?.inventoryPerson && newAsset?.inventoryStatus);

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">资产更换办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>

        <Card title={<SectionTitle>申请人信息</SectionTitle>} size="small">
          <DetailGrid>
            <DetailItem label="申请人">{application.applicant.id}-{application.applicant.name}</DetailItem>
            <DetailItem label="申请日期">{applyDate}</DetailItem>
            <DetailItem label="公司">{application.applicant.company || '-'}</DetailItem>
            <DetailItem label="办公区">{application.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="联系电话">{application.applicant.phone || '-'}</DetailItem>
            <DetailItem label="邮箱">{application.applicant.email || '-'}</DetailItem>
            <DetailItem label="部门" span={3}>{formatDepartment(application.applicant.department)}</DetailItem>
            <DetailItem label="更换原因" span={3}>{application.reason || '-'}</DetailItem>
          </DetailGrid>
        </Card>

        <Card
          title={<SectionTitle>更换物资信息</SectionTitle>}
          size="small"
          extra={(
            <Button type="primary" loading={submitting} onClick={handleReturnConfirm}>
              退库确认
            </Button>
          )}
        >
          <DetailGrid>
            <DetailItem label="资产标签号">{oldAsset.assetTag || '-'}</DetailItem>
            <DetailItem label="SN号">{oldAsset.sn || '-'}</DetailItem>
            <DetailItem label="资产说明">{oldAsset.assetDesc || '-'}</DetailItem>
            <DetailItem label="配置">{oldAsset.config || '-'}</DetailItem>
            <DetailItem label="资产状态"><StatusTag value={oldAsset.status} type="business" /></DetailItem>
            <DetailItem label="部件数量">{componentCount}</DetailItem>
            <DetailItem label="城市">{oldAsset.city || '-'}</DetailItem>
            <DetailItem label="建筑">{oldAsset.building || '-'}</DetailItem>
            <DetailItem label="楼层">{oldAsset.floor || '-'}</DetailItem>
            <DetailItem label="备注" span={3}>{oldAsset.note || '-'}</DetailItem>
            <DetailItem label="耗材信息" span={3}>{oldAsset.consumables || '-'}</DetailItem>
            <DetailItem label={<RequiredLabel>仓库</RequiredLabel>}>
              <Select
                className="w-full"
                value={returnWarehouse}
                disabled={oldInboundDone}
                options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={setReturnWarehouse}
              />
            </DetailItem>
            <DetailItem label="责任人">{returnManager}</DetailItem>
            <DetailItem label="鉴定说明">{application.mis?.description || '-'}</DetailItem>
            <DetailItem label="资产标记">
              <Select
                className="w-full"
                allowClear
                value={returnAssetMark || undefined}
                disabled={oldInboundDone}
                options={ASSET_MARK_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => setReturnAssetMark(value || '')}
              />
            </DetailItem>
            <DetailItem label="退库日期">{confirmedReturnDate}</DetailItem>
            <DetailItem label="使用说明">
              <Input
                maxLength={200}
                value={returnUsageNote}
                disabled={oldInboundDone}
                placeholder="请输入使用说明"
                onChange={(event) => setReturnUsageNote(event.target.value)}
              />
            </DetailItem>
            {showOldInventory && (
              <>
                <DetailItem label="盘点人">{oldAsset.inventoryPerson}</DetailItem>
                <DetailItem label="盘点状态"><StatusTag value={oldAsset.inventoryStatus} type="business" /></DetailItem>
              </>
            )}
          </DetailGrid>
        </Card>

        <Card
          title={<SectionTitle>待发放资产信息</SectionTitle>}
          size="small"
          extra={(
            <Button type="primary" loading={submitting} onClick={handleIssueConfirm}>
              领用确认
            </Button>
          )}
        >
          <DetailGrid>
            <DetailItem label={<RequiredLabel>仓库</RequiredLabel>}>
              <Select
                className="w-full"
                value={issueWarehouse}
                options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setIssueWarehouse(value);
                  if (newAsset?.warehouse !== value) setNewAsset(null);
                }}
              />
            </DetailItem>
            <DetailItem label="资产标签号">
              <Space.Compact className="w-full">
                <Input readOnly value={newAsset?.assetTag || ''} placeholder="请选择待发放资产" />
                <Button icon={<Search size={14} />} onClick={() => setAssetModalOpen(true)} />
              </Space.Compact>
            </DetailItem>
            <DetailItem label="SN号">{newAsset?.sn || '-'}</DetailItem>
            <DetailItem label="公司">{newAsset?.company || '-'}</DetailItem>
            <DetailItem label="板块">{newAsset?.block || '-'}</DetailItem>
            <DetailItem label="启用日期">{formatDateText(newAsset?.enabledDate)}</DetailItem>
            <DetailItem label="资产说明">{newAsset?.assetDesc || '-'}</DetailItem>
            <DetailItem label="配置" span={2}>{newAsset?.config || '-'}</DetailItem>
            <DetailItem label="备注" span={3}>{newAsset?.note || '-'}</DetailItem>
            <DetailItem label="耗材信息" span={3}>{newAsset?.consumables || '-'}</DetailItem>
            <DetailItem label={<RequiredLabel>城市</RequiredLabel>}>
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
            </DetailItem>
            <DetailItem label={<RequiredLabel>建筑</RequiredLabel>}>
              <Select
                className="w-full"
                value={building || undefined}
                options={(BUILDING_OPTIONS[city] || []).map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setBuilding(value);
                  setFloor('');
                }}
              />
            </DetailItem>
            <DetailItem label={<RequiredLabel>楼层</RequiredLabel>}>
              <Select
                className="w-full"
                value={floor || undefined}
                options={(FLOOR_OPTIONS[building] || []).map((value) => ({ label: value, value }))}
                onChange={setFloor}
              />
            </DetailItem>
            <DetailItem label={<RequiredLabel>资产用途</RequiredLabel>}>
              <Select
                className="w-full"
                value={purpose || undefined}
                placeholder="请选择资产用途"
                options={PURPOSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={setPurpose}
              />
            </DetailItem>
            <DetailItem label="使用说明" span={2}>
              <Input
                maxLength={200}
                value={usageNote}
                placeholder="请输入使用说明"
                onChange={(event) => setUsageNote(event.target.value)}
              />
            </DetailItem>
            {showNewInventory && (
              <>
                <DetailItem label="盘点人">{newAsset.inventoryPerson}</DetailItem>
                <DetailItem label="盘点状态"><StatusTag value={newAsset.inventoryStatus} type="business" /></DetailItem>
              </>
            )}
          </DetailGrid>
        </Card>

        <ReplacementHistoryCard records={application.history} title="审批信息">
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={opinion}
            placeholder="驳回时必填"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-3 flex justify-center gap-3">
            <Button danger disabled={submitting} onClick={reject}>驳回</Button>
            <Button onClick={onBack}>返回</Button>
            <Button onClick={() => setAddSignOpen(true)}>加签</Button>
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
        title="加签"
        open={addSignOpen}
        okText="确认加签"
        cancelText="取消"
        onOk={() => {
          if (!addSignPerson.trim()) {
            messageApi.warning('请输入加签人员');
            return;
          }
          messageApi.success(`已加签：${addSignPerson.trim()}`);
          setAddSignOpen(false);
          setAddSignPerson('');
        }}
        onCancel={() => {
          setAddSignOpen(false);
          setAddSignPerson('');
        }}
      >
        <Input value={addSignPerson} placeholder="请输入姓名或工号" onChange={(event) => setAddSignPerson(event.target.value)} />
      </Modal>
    </>
  );
}
