import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
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
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无资产退库办理待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
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
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">资产退库办理</Typography.Title>
          <Typography.Text type="secondary">申请单号：{selected.id}</Typography.Text>
        </div>

        <Card size="small" title="申请人信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请人">{selected.applicant.id}-{selected.applicant.name}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{formatDateText(selected.applyTime)}</Descriptions.Item>
            <Descriptions.Item label="公司">{selected.applicant.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="板块">{selected.applicant.block || '-'}</Descriptions.Item>
            <Descriptions.Item label="办公区">{selected.applicant.officeArea || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selected.applicant.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selected.applicant.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="退库类型">{selected.returnType || '-'}</Descriptions.Item>
            <Descriptions.Item label="部门">{formatDepartment(selected.applicant.department)}</Descriptions.Item>
            <Descriptions.Item label="退库原因" span={3}>{selected.reason || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="退库资产信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="资产标签号">{asset.assetTag || '-'}</Descriptions.Item>
            <Descriptions.Item label="SN号">{asset.sn || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{asset.assetDesc || '-'}</Descriptions.Item>
            <Descriptions.Item label="配置">{asset.config || '-'}</Descriptions.Item>
            <Descriptions.Item label="资产状态"><StatusTag value={asset.status} type="business" /></Descriptions.Item>
            <Descriptions.Item label="资产用途">{asset.purpose || '-'}</Descriptions.Item>
            <Descriptions.Item label="部件数量">{componentCount}</Descriptions.Item>
            <Descriptions.Item label="城市">{asset.city || '-'}</Descriptions.Item>
            <Descriptions.Item label="建筑">{asset.building || '-'}</Descriptions.Item>
            <Descriptions.Item label="楼层">{asset.floor || '-'}</Descriptions.Item>
            <Descriptions.Item label="盘点状态"><StatusTag value={asset.inventoryStatus} type="business" /></Descriptions.Item>
            <Descriptions.Item label="盘点执行人">{asset.inventoryPerson || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{asset.note || '-'}</Descriptions.Item>
            <Descriptions.Item label="关联耗材" span={3}>
              {selected.relatedConsumables?.length
                ? selected.relatedConsumables.map((item) => (
                  <Tag key={item.assetTag} color="blue">{item.assetTag} {item.assetDesc}</Tag>
                ))
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="退库信息维护">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 仓库</>}>
              <Select
                className="w-full"
                value={warehouse}
                options={RETURN_WAREHOUSES.map((value) => ({ label: value, value }))}
                onChange={setWarehouse}
              />
            </Descriptions.Item>
            <Descriptions.Item label="责任人">
              <Input readOnly value={selected.handling.responsiblePerson || 'SOHU01-库房管理员-SOHU'} />
            </Descriptions.Item>
            <Descriptions.Item label="MIS鉴定">
              <Input readOnly value={asset.returnMisRequired ? '是' : '否'} />
            </Descriptions.Item>
            <Descriptions.Item label="鉴定结果">
              <Input readOnly value={selected.mis.result || '-'} />
            </Descriptions.Item>
            <Descriptions.Item label="资产标记">
              <Select
                className="w-full"
                allowClear
                value={assetMark || undefined}
                options={['无', '限制出库', '待维修', '待数据清理'].map((value) => ({ label: value, value }))}
                onChange={(value) => setAssetMark(value || '')}
              />
            </Descriptions.Item>
            <Descriptions.Item label={<><span className="text-red-500">*</span> 退库日期</>}>
              <DatePicker className="w-full" value={returnDate} onChange={(value) => setReturnDate(value || dayjs())} />
            </Descriptions.Item>
            <Descriptions.Item label="鉴定说明" span={3}>
              <TextArea readOnly rows={2} value={selected.mis.description || '-'} />
            </Descriptions.Item>
            <Descriptions.Item label="使用说明" span={3}>
              <TextArea
                rows={3}
                maxLength={400}
                showCount
                value={usageNote}
                onChange={(event) => setUsageNote(event.target.value)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="维修记录" span={3}>
              <Button type="link" size="small" className="px-0" onClick={() => setRepairOpen(true)}>维修记录</Button>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <ReturnAttachmentCard
          attachments={selected.attachments || []}
          currentNode={HANDLING_NODE}
          currentUploader={HANDLING_UPLOADER}
          onUpload={uploadAttachment}
          onDelete={deleteAttachment}
        />

        <Card size="small" title="审批操作">
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={opinion}
            placeholder="确认时非必填，驳回时必填"
            onChange={(event) => setOpinion(event.target.value)}
          />
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={loading} onClick={confirmHandling}>确认</Button>
            <Button danger onClick={reject}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>

      <Modal
        title={`维修记录（资产标签号：${asset.assetTag}）`}
        open={repairOpen}
        width={980}
        footer={<Button onClick={() => setRepairOpen(false)}>关闭</Button>}
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
    </div>
  );
}
