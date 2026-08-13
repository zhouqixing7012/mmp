import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { RETURN_WAREHOUSES } from '../../mock/assetReturnMock';
import {
  addAssetReturnAttachment,
  completeAssetReturn,
  finishAssetReturn,
  getAssetReturnApplications,
  removeAssetReturnAttachment,
  requestAssetReturnConfirmation,
} from '../../services/assetReturnService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';
import ReturnAttachmentCard from './ReturnAttachmentCard';

const { TextArea } = Input;
const HANDLING_NODE = 'ES退库办理';
const HANDLING_UPLOADER = { id: '119039', name: '119039-刘建' };

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
  const [returnDate, setReturnDate] = useState(dayjs());
  const [usageNote, setUsageNote] = useState('');
  const [opinion, setOpinion] = useState('');
  const [repairOpen, setRepairOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setWarehouse(selected.handling.warehouse || '北京总部资产仓');
    setAssetMark(selected.handling.assetMark || '');
    setReturnDate(selected.handling.returnDate ? dayjs(selected.handling.returnDate) : dayjs());
    setUsageNote(selected.handling.usageNote || '');
    setOpinion(selected.handling.opinion || '');
  }, [selected?.id]);

  const refresh = () => setVersion((value) => value + 1);

  const handlingValues = () => ({
    warehouse,
    responsiblePerson: selected.handling.responsiblePerson || 'SOHU01-库房管理员-SOHU',
    assetMark,
    returnDate: returnDate.format('YYYY-MM-DD'),
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

  const uploadAttachment = (file) => {
    if (!selected) return;
    addAssetReturnAttachment(selected.id, {
      ...file,
      node: HANDLING_NODE,
      uploaderId: HANDLING_UPLOADER.id,
      uploaderName: HANDLING_UPLOADER.name,
    });
    messageApi.success(`附件“${file.name}”上传成功`);
    refresh();
  };

  const deleteAttachment = (attachmentId) => {
    if (!selected) return;
    try {
      removeAssetReturnAttachment(selected.id, attachmentId, {
        node: HANDLING_NODE,
        uploaderId: HANDLING_UPLOADER.id,
      });
      messageApi.success('附件已删除');
      refresh();
    } catch (error) {
      messageApi.error(error.message);
    }
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

  const repairColumns = [
    { title: '维修单号', dataIndex: 'orderNo', width: 170 },
    { title: '维修时间', dataIndex: 'repairTime', width: 170 },
    { title: '故障描述', dataIndex: 'faultDescription', width: 240 },
    { title: '维修结果', dataIndex: 'repairResult', width: 240 },
    { title: '维修状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} type="business" /> },
  ];

  const repairRecords = [
    {
      id: 'repair-1',
      orderNo: 'WX-202607180021',
      repairTime: '2026-07-18 10:30:00',
      faultDescription: '设备间歇性蓝屏、无法稳定启动。',
      repairResult: '更换硬盘并完成系统检测。',
      status: '已完成',
    },
    {
      id: 'repair-2',
      orderNo: 'WX-202601120008',
      repairTime: '2026-01-12 15:20:00',
      faultDescription: '设备运行卡顿，启动时间较长。',
      repairResult: '完成系统清理及硬件检测。',
      status: '已完成',
    },
  ];

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
            <DetailItem label="申请人">{selected.applicant.id}-{selected.applicant.name}</DetailItem>
            <DetailItem label="申请日期">{formatDateText(selected.applyTime)}</DetailItem>
            <DetailItem label="公司">{selected.applicant.company || '-'}</DetailItem>
            <DetailItem label="板块">{selected.applicant.block || '-'}</DetailItem>
            <DetailItem label="办公区">{selected.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="联系电话">{selected.applicant.phone || '-'}</DetailItem>
            <DetailItem label="邮箱">{selected.applicant.email || '-'}</DetailItem>
            <DetailItem label="退库类型">{selected.returnType || '-'}</DetailItem>
            <DetailItem label="部门">{formatDepartment(selected.applicant.department)}</DetailItem>
            <DetailItem label="退库原因" span={3}>{selected.reason || '-'}</DetailItem>
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
            <DetailItem label="城市">{asset.city || '-'}</DetailItem>
            <DetailItem label="建筑">{asset.building || '-'}</DetailItem>
            <DetailItem label="楼层">{asset.floor || '-'}</DetailItem>
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
            <DetailItem label="MIS鉴定">{asset.returnMisRequired ? '是' : '否'}</DetailItem>
            <DetailItem label="鉴定结果">{selected.mis.result || '-'}</DetailItem>
            <DetailItem label="资产标记">
              <Select
                className="w-full"
                allowClear
                value={assetMark || undefined}
                options={['无', '限制出库', '待维修', '待数据清理'].map((value) => ({ label: value, value }))}
                onChange={(value) => setAssetMark(value || '')}
              />
            </DetailItem>
            <DetailItem label={<><span className="text-red-500">*</span> 退库日期</>}>
              <DatePicker
                className="w-full"
                value={returnDate}
                format="YYYY-MM-DD"
                onChange={(value) => setReturnDate(value || dayjs())}
              />
            </DetailItem>
            <DetailItem label="鉴定说明" span={3}>{selected.mis.description || '-'}</DetailItem>
            <DetailItem label="使用说明" span={3}>
              <TextArea
                rows={3}
                maxLength={400}
                showCount
                value={usageNote}
                onChange={(event) => setUsageNote(event.target.value)}
              />
            </DetailItem>
            <DetailItem label="维修记录" span={3}>
              <Button type="link" size="small" className="px-0" onClick={() => setRepairOpen(true)}>维修记录</Button>
            </DetailItem>
          </DetailGrid>
        </Card>

        <ReturnAttachmentCard
          attachments={selected.attachments || []}
          currentNode={HANDLING_NODE}
          currentUploader={HANDLING_UPLOADER}
          onUpload={uploadAttachment}
          onDelete={deleteAttachment}
        />

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

      <Modal
        title={`维修记录（资产标签号：${asset.assetTag}）`}
        open={repairOpen}
        width={980}
        footer={<div className="flex justify-center"><Button onClick={() => setRepairOpen(false)}>关闭</Button></div>}
        onCancel={() => setRepairOpen(false)}
      >
        <Table
          rowKey="id"
          columns={repairColumns}
          dataSource={repairRecords}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 920 }}
        />
      </Modal>
    </>
  );
}
