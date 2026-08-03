import React, { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCcw, Search, Send, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  getBorrowingIssueApplication,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import AssetMatchModal from './AssetMatchModal';
import { nowText } from './utils';

const { TextArea } = Input;
const WAREHOUSE_OPTIONS = ['北京总部仓', '北京影像器材仓'];
const PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途', '借用'];
const LOCATION_OPTIONS = {
  北京市: {
    搜狐媒体大厦: ['5层', '8层', '12层'],
    中关村园区: ['2层', '3层'],
  },
  上海市: {
    上海分公司办公区: ['10层', '11层'],
  },
};

function createOutOrderNo() {
  return `CK-JY-${String(Date.now()).slice(-10)}`;
}

function hydrateDetails(application) {
  return (application?.details || []).map((item) => ({
    ...item,
    issueCity: item.issueCity || item.matchedAsset?.city || application?.city || '北京市',
    issueBuilding: item.issueBuilding || item.matchedAsset?.building || application?.building || '搜狐媒体大厦',
    issueFloor: item.issueFloor || item.matchedAsset?.floor || application?.floor || '8层',
    issuePurpose: item.issuePurpose || application?.purpose || '借用',
    issueUsageNote: item.issueUsageNote || application?.usageNote || '',
  }));
}

export default function BorrowingIssuePage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingIssueApplication());
  const [details, setDetails] = useState(() => hydrateDetails(application));
  const [warehouse, setWarehouse] = useState(() => application?.warehouse || '北京总部仓');
  const [documentNote, setDocumentNote] = useState(() => application?.issueNote || '');
  const [confirmMethod] = useState(() => application?.confirmMethod || '狐小e扫码确认');
  const [matchDetailId, setMatchDetailId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const currentDetail = useMemo(
    () => details.find((item) => item.id === matchDetailId) || null,
    [details, matchDetailId]
  );
  const confirmationStatus = application?.confirmation?.status || '未发起';

  const updateDetail = (detailId, changes) => {
    setDetails((current) => current.map((item) => (
      item.id === detailId ? { ...item, ...changes } : item
    )));
  };

  const refresh = () => {
    const next = getBorrowingIssueApplication();
    setApplication(next);
    setDetails(hydrateDetails(next));
    setWarehouse(next?.warehouse || '北京总部仓');
    setDocumentNote(next?.issueNote || '');
  };

  const validateIssueData = () => {
    if (!warehouse) {
      messageApi.warning('请选择当前仓库');
      return false;
    }
    const missingAsset = details.find((item) => !item.matchedAsset);
    if (missingAsset) {
      messageApi.warning(`请为“${missingAsset.assetDesc}”匹配实物资产`);
      return false;
    }
    const invalidLocation = details.find((item) => (
      !item.issueCity || !item.issueBuilding || !item.issueFloor || !item.issuePurpose
    ));
    if (invalidLocation) {
      messageApi.warning('请完善全部资产的城市、建筑、楼层和资产用途');
      return false;
    }
    const invalidAsset = details.find((item) => (
      item.matchedAsset.warehouse !== warehouse
      || item.matchedAsset.materialId !== item.materialId
      || !['在库-新增', '在库-待处理', '在库-再利用'].includes(item.matchedAsset.status)
      || item.matchedAsset.locked
    ));
    if (invalidAsset) {
      messageApi.error(`资产（资产标签号：${invalidAsset.matchedAsset.assetTag}）不满足出库条件，请重新选择。`);
      return false;
    }
    return true;
  };

  const requestConfirmation = () => {
    if (!application || !validateIssueData()) return;
    setSubmitting(true);
    try {
      const firstDetail = details[0];
      updateAssetBorrowingApplication(application.id, (record) => ({
        ...record,
        warehouse,
        city: firstDetail?.issueCity || record.city,
        building: firstDetail?.issueBuilding || record.building,
        floor: firstDetail?.issueFloor || record.floor,
        purpose: firstDetail?.issuePurpose || record.purpose,
        usageNote: firstDetail?.issueUsageNote || '',
        issueNote: documentNote,
        confirmMethod,
        details,
        currentNode: '员工确认',
        confirmation: {
          status: '待确认',
          method: confirmMethod,
          confirmedBy: '',
          confirmedAt: '',
        },
        approvalHistory: [
          ...record.approvalHistory,
          { node: '库管员发放', person: 'SOHU01-库房管理员', status: '等待员工确认', time: nowText(), comment: `确认方式：${confirmMethod}` },
        ],
      }));
      messageApi.success('已发起员工借用确认，请等待申请人操作。');
      setApplication(null);
    } finally {
      setSubmitting(false);
    }
  };

  const executeOut = () => {
    if (!application || confirmationStatus !== '已确认' || !validateIssueData()) return;
    Modal.confirm({
      title: '确认执行出库？',
      content: '出库后将生成借用出库单，并更新资产台账状态为“在用-借用中”。',
      okText: '执行出库',
      cancelText: '取消',
      onOk: () => {
        const outOrderNo = createOutOrderNo();
        updateAssetBorrowingApplication(application.id, (record) => ({
          ...record,
          status: '已处理',
          result: '正常出库',
          currentNode: '已完成',
          outOrderNo,
          completedAt: nowText(),
          details,
          issueNote: documentNote,
          approvalHistory: [
            ...record.approvalHistory,
            { node: '执行出库', person: 'SOHU01-库房管理员', status: '已出库', time: nowText(), comment: `出库单号：${outOrderNo}` },
          ],
        }));
        messageApi.success(`出库成功，出库单号：${outOrderNo}`);
        refresh();
      },
    });
  };

  const abandon = () => {
    if (!application) return;
    Modal.confirm({
      title: '取消本次借用发放？',
      content: '取消后本次借用流程结束，已匹配资产将解除锁定。',
      okText: '确认取消',
      cancelText: '继续办理',
      onOk: () => {
        updateAssetBorrowingApplication(application.id, (record) => ({
          ...record,
          status: '已处理',
          result: '放弃领用',
          currentNode: '已完成',
          completedAt: nowText(),
          details: record.details.map((item) => ({ ...item, matchedAsset: null })),
          approvalHistory: [
            ...record.approvalHistory,
            { node: '库管员发放', person: 'SOHU01-库房管理员', status: '已结束', time: nowText(), comment: '放弃领用' },
          ],
        }));
        messageApi.success('借用流程已取消。');
        refresh();
      },
    });
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无待发放的资产借用单，员工确认后可点击刷新状态" />
          <div className="mt-4 flex justify-center gap-3">
            <Button icon={<RefreshCcw size={14} />} onClick={refresh}>刷新状态</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">借用发放</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <Card title="借用人信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 当前仓库</>} span={3}>
              <Select
                className="w-full"
                value={warehouse}
                options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setWarehouse(value);
                  setDetails((current) => current.map((item) => ({
                    ...item,
                    matchedAsset: item.matchedAsset?.warehouse === value ? item.matchedAsset : null,
                  })));
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="申请人">{application.applicant.id}-{application.applicant.name}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{application.applicant.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{application.applicant.email}</Descriptions.Item>
            <Descriptions.Item label="公司">{application.applicant.company}</Descriptions.Item>
            <Descriptions.Item label="办公区">{application.applicant.officeArea}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{application.applyDate}</Descriptions.Item>
            <Descriptions.Item label="成本中心">{application.applicant.costCenter}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{application.applicant.department}</Descriptions.Item>
            <Descriptions.Item label="单据备注" span={3}>
              <TextArea rows={2} maxLength={400} showCount value={documentNote} onChange={(event) => setDocumentNote(event.target.value)} />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="借用物资明细" size="small">
          <Space direction="vertical" size={16} className="w-full">
            {details.map((detail, index) => {
              const asset = detail.matchedAsset;
              const buildingOptions = Object.keys(LOCATION_OPTIONS[detail.issueCity] || {});
              const floorOptions = LOCATION_OPTIONS[detail.issueCity]?.[detail.issueBuilding] || [];
              const componentCount = asset?.upgradeConsumables?.length || 0;
              const inventoryStatus = asset?.inventoryStatus || '未盘';

              return (
                <div key={detail.id} className={index > 0 ? 'border-t border-amber-300 pt-4' : ''}>
                  <Descriptions bordered size="small" column={3}>
                    <Descriptions.Item label="资产标签号">
                      <Space.Compact className="w-full">
                        <Input readOnly value={asset?.assetTag || ''} placeholder="请选择资产" />
                        <Button icon={<Search size={14} />} onClick={() => setMatchDetailId(detail.id)} />
                        <Button danger icon={<XCircle size={14} />} disabled={!asset} onClick={() => updateDetail(detail.id, { matchedAsset: null })} />
                      </Space.Compact>
                    </Descriptions.Item>
                    <Descriptions.Item label="序列号">{asset?.sn || '-'}</Descriptions.Item>
                    <Descriptions.Item label="部件数量">{componentCount}</Descriptions.Item>
                    <Descriptions.Item label="公司">{asset?.company || '-'}</Descriptions.Item>
                    <Descriptions.Item label="板块">{asset?.block || '-'}</Descriptions.Item>
                    <Descriptions.Item label="启用日期">{asset?.enabledDate || '-'}</Descriptions.Item>
                    <Descriptions.Item label="资产说明">{asset?.assetDesc || detail.assetDesc}</Descriptions.Item>
                    <Descriptions.Item label="配置" span={2}>{asset?.config || detail.config || '-'}</Descriptions.Item>
                    <Descriptions.Item label="备注" span={3}>{asset?.note || '-'}</Descriptions.Item>
                    <Descriptions.Item label={<><span className="text-red-500">*</span> 城市</>}>
                      <Select
                        className="w-full"
                        value={detail.issueCity}
                        options={Object.keys(LOCATION_OPTIONS).map((value) => ({ label: value, value }))}
                        onChange={(value) => updateDetail(detail.id, { issueCity: value, issueBuilding: '', issueFloor: '' })}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label={<><span className="text-red-500">*</span> 建筑</>}>
                      <Select
                        className="w-full"
                        value={detail.issueBuilding || undefined}
                        options={buildingOptions.map((value) => ({ label: value, value }))}
                        onChange={(value) => updateDetail(detail.id, { issueBuilding: value, issueFloor: '' })}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label={<><span className="text-red-500">*</span> 楼层</>}>
                      <Select
                        className="w-full"
                        value={detail.issueFloor || undefined}
                        options={floorOptions.map((value) => ({ label: value, value }))}
                        onChange={(value) => updateDetail(detail.id, { issueFloor: value })}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label={<><span className="text-red-500">*</span> 资产用途</>}>
                      <Select
                        className="w-full"
                        value={detail.issuePurpose}
                        options={PURPOSE_OPTIONS.map((value) => ({ label: value, value }))}
                        onChange={(value) => updateDetail(detail.id, { issuePurpose: value })}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="使用说明" span={2}>
                      <TextArea
                        rows={2}
                        maxLength={400}
                        showCount
                        value={detail.issueUsageNote}
                        onChange={(event) => updateDetail(detail.id, { issueUsageNote: event.target.value })}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="实际盘点人">{asset?.inventoryPerson || '-'}</Descriptions.Item>
                    <Descriptions.Item label="盘点状态" span={2}><Tag color="error">{inventoryStatus}</Tag></Descriptions.Item>
                    <Descriptions.Item label="资产类别" span={3}>{[detail.category, detail.subCategory].filter(Boolean).join('.') || detail.assetDesc}</Descriptions.Item>
                    <Descriptions.Item label="借用开始时间">{detail.startDate}</Descriptions.Item>
                    <Descriptions.Item label="借用归还时间">{detail.endDate}</Descriptions.Item>
                    <Descriptions.Item label="借用原因">{detail.reason}</Descriptions.Item>
                    <Descriptions.Item label="需求说明" span={3}>{detail.detail || '-'}</Descriptions.Item>
                  </Descriptions>
                </div>
              );
            })}
          </Space>
        </Card>

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          {confirmationStatus === '已确认' ? (
            <Button type="primary" icon={<CheckCircle2 size={14} />} onClick={executeOut}>执行出库</Button>
          ) : (
            <Button type="primary" icon={<Send size={14} />} loading={submitting} onClick={requestConfirmation}>借用确认</Button>
          )}
          <Button danger onClick={abandon}>取消</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
        </div>
      </Space>

      <AssetMatchModal
        open={Boolean(currentDetail)}
        materialId={currentDetail?.materialId}
        warehouse={warehouse}
        currentAsset={currentDetail?.matchedAsset}
        onCancel={() => setMatchDetailId(null)}
        onConfirm={(asset) => {
          updateDetail(matchDetailId, {
            matchedAsset: asset,
            issueCity: asset.city || currentDetail.issueCity,
            issueBuilding: asset.building || currentDetail.issueBuilding,
            issueFloor: asset.floor || currentDetail.issueFloor,
          });
          setMatchDetailId(null);
          messageApi.success(`已匹配资产：${asset.assetTag}`);
        }}
      />
    </div>
  );
}
