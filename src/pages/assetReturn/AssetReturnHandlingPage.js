import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { RETURN_WAREHOUSES } from '../../mock/assetReturnMock';
import {
  completeAssetReturn,
  finishAssetReturn,
  getAssetReturnApplications,
  requestAssetReturnConfirmation,
} from '../../services/assetReturnService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';
import AssetReturnEmployeeAssetsModal from './AssetReturnEmployeeAssetsModal';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function AssetReturnHandlingPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const applications = useMemo(() => getAssetReturnApplications(), [version]);
  const selected = applications.find((item) => (
    item.status === '处理中' && ['ES退库办理', '员工退库确认'].includes(item.currentNode)
  )) || null;
  const [warehouse, setWarehouse] = useState('北京总部资产仓');
  const [assetMark, setAssetMark] = useState('');
  const [usageNote, setUsageNote] = useState('');
  const [opinion, setOpinion] = useState('');
  const [employeeAssetsOpen, setEmployeeAssetsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setWarehouse(selected.handling.warehouse || '北京总部资产仓');
    setAssetMark(selected.handling.assetMark || '');
    setUsageNote(selected.handling.usageNote || '');
    setOpinion(selected.handling.opinion || '');
  }, [selected?.id]);

  const refresh = () => setVersion((value) => value + 1);
  const confirmedReturnDate = selected?.handling?.confirmationTime
    ? formatDateText(selected.handling.confirmationTime)
    : '-';

  const handlingValues = () => ({
    warehouse,
    responsiblePerson: selected.handling.responsiblePerson || 'SOHU01-库房管理员-SOHU',
    assetMark,
    returnDate: selected.handling.confirmationTime ? formatDateText(selected.handling.confirmationTime) : '',
    usageNote,
    opinion: opinion.trim(),
  });

  const confirmHandling = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      if (selected.handling.confirmationStatus === '未发起') {
        requestAssetReturnConfirmation(selected.id, handlingValues());
        messageApi.success('已发起员工退库确认，请在“员工退库确认”完成确认后再次提交');
        refresh();
        return;
      }
      if (selected.handling.confirmationStatus === '待确认') {
        messageApi.warning('员工退库确认尚未完成');
        return;
      }
      completeAssetReturn(selected.id, handlingValues());
      messageApi.success('退库确认完成，已生成入库单并更新资产台账');
      setOpinion('');
      refresh();
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reject = () => {
    if (!selected) return;
    if (!opinion.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }
    finishAssetReturn(selected.id, '驳回', opinion.trim());
    messageApi.success('退库申请已驳回');
    setOpinion('');
    refresh();
  };

  if (!selected) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无资产退库办理待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const asset = selected.asset;
  const componentCount = asset.component && asset.component !== '-' ? 1 : 0;

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">资产退库办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selected.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">
              <Space size={8}>
                <span>{selected.applicant.id}-{selected.applicant.name}</span>
                <Button
                  type="link"
                  size="small"
                  className="px-0"
                  icon={<Eye size={14} />}
                  onClick={() => setEmployeeAssetsOpen(true)}
                >
                  查看名下资产
                </Button>
              </Space>
            </DetailItem>
            <DetailItem label="申请日期">{formatDateText(selected.applyTime)}</DetailItem>
            <DetailItem label="公司">114.新媒体</DetailItem>
            <DetailItem label="办公区">{selected.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="联系电话">{selected.applicant.phone || '-'}</DetailItem>
            <DetailItem label="邮箱">{selected.applicant.email || '-'}</DetailItem>
            <DetailItem label="部门" span={3}>{formatDepartment(selected.applicant.department)}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>退库资产信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="资产标签号">{asset.assetTag || '-'}</DetailItem>
            <DetailItem label="SN号">{asset.sn || '-'}</DetailItem>
            <DetailItem label="资产说明">{asset.assetDesc || '-'}</DetailItem>
            <DetailItem label="资产状态"><StatusTag value={asset.status} type="business" /></DetailItem>
            <DetailItem label="资产用途">{asset.purpose || '-'}</DetailItem>
            <DetailItem label="部件数量">{componentCount}</DetailItem>
            <DetailItem label="city">{asset.city || '-'}</DetailItem>
            <DetailItem label="building">{asset.building || '-'}</DetailItem>
            <DetailItem label="floor">{asset.floor || '-'}</DetailItem>
            <DetailItem label="配置" span={3}>{asset.config || '-'}</DetailItem>
            <DetailItem label="备注" span={3}>{asset.note || '-'}</DetailItem>
            <DetailItem label="关联耗材" span={3}>
              {selected.relatedConsumables?.length
                ? selected.relatedConsumables.map((item) => (
                  <Tag key={item.assetTag}>{item.assetTag} {item.assetDesc}</Tag>
                ))
                : '-'}
            </DetailItem>
            <DetailItem label="盘点状态"><StatusTag value={asset.inventoryStatus} type="business" /></DetailItem>
            <DetailItem label="盘点执行人">{asset.inventoryPerson || '-'}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>退库信息维护</SectionTitle>}>
          <DetailGrid>
            <DetailItem label={<><span className="text-red-500">*</span> 仓库</>}>
              <Select
                className="w-full"
                value={warehouse}
                options={RETURN_WAREHOUSES.map((value) => ({ label: value, value }))}
                onChange={setWarehouse}
              />
            </DetailItem>
            <DetailItem label="责任人">{selected.handling.responsiblePerson || 'SOHU01-库房管理员-SOHU'}</DetailItem>
            <DetailItem label="资产标记">
              <Select
                className="w-full"
                allowClear
                value={assetMark || undefined}
                options={['无', '限制出库', '待维修', '待数据清理'].map((value) => ({ label: value, value }))}
                onChange={(value) => setAssetMark(value || '')}
              />
            </DetailItem>
            <DetailItem label="退库日期">{confirmedReturnDate}</DetailItem>
            <DetailItem label="使用说明" span={2}>
              <Input
                maxLength={400}
                value={usageNote}
                placeholder="请输入使用说明"
                onChange={(event) => setUsageNote(event.target.value)}
              />
            </DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>审批意见</SectionTitle>}>
          <TextArea
            rows={3}
            maxLength={400}
            showCount
            value={opinion}
            placeholder="确认时非必填，驳回时必填"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={loading} onClick={confirmHandling}>确认</Button>
            <Button danger disabled={loading} onClick={reject}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>

      <AssetReturnEmployeeAssetsModal
        open={employeeAssetsOpen}
        applicant={selected.applicant}
        onCancel={() => setEmployeeAssetsOpen(false)}
      />
    </>
  );
}
