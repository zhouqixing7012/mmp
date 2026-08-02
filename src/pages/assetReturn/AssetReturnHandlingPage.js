import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Archive, BadgeCheck, Ban, Eye, XCircle } from 'lucide-react';
import { Button, Card, DatePicker, Empty, Input, Modal, Select, Space, Table, Tag, Typography, message as antdMessage } from 'antd';
import { RETURN_WAREHOUSES } from '../../mock/assetReturnMock';
import {
  completeAssetReturn,
  finishAssetReturn,
  getAssetReturnApplications,
  getAssetReturnAssets,
  requestAssetReturnConfirmation,
} from '../../services/assetReturnService';

const { TextArea } = Input;

export default function AssetReturnHandlingPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [warehouse, setWarehouse] = useState('北京总部资产仓');
  const [assetMark, setAssetMark] = useState('');
  const [returnDate, setReturnDate] = useState(dayjs());
  const [usageNote, setUsageNote] = useState('');
  const [opinion, setOpinion] = useState('');
  const [employeeAssetsOpen, setEmployeeAssetsOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const applications = useMemo(() => getAssetReturnApplications(), [version]);
  const list = applications.filter((item) => item.status === '处理中' && ['ES退库办理', '员工退库确认'].includes(item.currentNode));
  const selected = applications.find((item) => item.id === selectedId) || null;

  const openDetail = (application) => {
    setSelectedId(application.id);
    setWarehouse(application.handling.warehouse || '北京总部资产仓');
    setAssetMark(application.handling.assetMark || '');
    setReturnDate(dayjs(application.handling.returnDate));
    setUsageNote(application.handling.usageNote || '');
    setOpinion(application.handling.opinion || '');
  };

  const refresh = () => setVersion((value) => value + 1);

  const executeInbound = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      completeAssetReturn(selected.id, {
        warehouse,
        assetMark,
        returnDate: returnDate.format('YYYY-MM-DD'),
        usageNote,
      });
      messageApi.success('入库成功，已生成退库入库单并更新资产台账');
      setSelectedId('');
      refresh();
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const finish = (result) => {
    if (!opinion.trim()) {
      messageApi.warning(`${result === '驳回' ? '驳回' : '放弃退库'}时请填写处理意见`);
      return;
    }
    finishAssetReturn(selected.id, result, opinion.trim());
    messageApi.success(result === '驳回' ? '退库申请已驳回' : '已放弃退库并解除资产锁定');
    setSelectedId('');
    refresh();
  };

  const listColumns = [
    { title: '申请单号', dataIndex: 'id', width: 180 },
    { title: '申请人', width: 120, render: (_, record) => `${record.applicant.name}-${record.applicant.id}` },
    { title: '资产标签号', width: 150, render: (_, record) => record.asset.assetTag },
    { title: '资产说明', width: 250, render: (_, record) => record.asset.assetDesc },
    { title: '退库类型', dataIndex: 'returnType', width: 100 },
    { title: '当前节点', dataIndex: 'currentNode', width: 130 },
    { title: '确认状态', width: 100, render: (_, record) => <Tag color={record.handling.confirmationStatus === '已确认' ? 'success' : record.handling.confirmationStatus === '待确认' ? 'processing' : 'default'}>{record.handling.confirmationStatus}</Tag> },
    { title: '申请时间', dataIndex: 'applyTime', width: 170 },
    { title: '操作', width: 90, fixed: 'right', render: (_, record) => <Button type="link" onClick={() => openDetail(record)}>办理</Button> },
  ];

  if (!selected) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card size="small" title="资产退库办理">
          <Table rowKey="id" columns={listColumns} dataSource={list} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 1250 }} locale={{ emptyText: <Empty description="暂无资产退库办理待办" /> }} />
        </Card>
      </div>
    );
  }

  const assetColumns = [
    { title: '资产标签号', width: 150, render: () => selected.asset.assetTag },
    { title: 'SN号', width: 130, render: () => selected.asset.sn },
    { title: '资产说明', width: 240, render: () => selected.asset.assetDesc },
    { title: '配置', width: 230, render: () => selected.asset.config || '无' },
    { title: '资产状态', width: 130, render: () => <Tag color="success">{selected.asset.status}</Tag> },
    { title: '部件数量', width: 90, align: 'center', render: () => (selected.asset.component && selected.asset.component !== '-' ? 1 : 0) },
    { title: '城市', width: 100, render: () => selected.asset.city },
    { title: '建筑', width: 140, render: () => selected.asset.building },
    { title: '楼层', width: 80, render: () => selected.asset.floor },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm"><Typography.Title level={4} className="mb-0">资产退库办理</Typography.Title><Typography.Text type="secondary">申请单号：{selected.id}</Typography.Text></div>
        <Card size="small" title="申请人信息" extra={<Button icon={<Eye size={14} />} onClick={() => setEmployeeAssetsOpen(true)}>查看员工名下资产</Button>}>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div><Typography.Text type="secondary">申请人：</Typography.Text>{selected.applicant.name}-{selected.applicant.id}</div>
            <div><Typography.Text type="secondary">公司/板块：</Typography.Text>{selected.applicant.company} / {selected.applicant.block}</div>
            <div><Typography.Text type="secondary">部门：</Typography.Text>{selected.applicant.department}</div>
            <div><Typography.Text type="secondary">办公区：</Typography.Text>{selected.applicant.officeArea}</div>
            <div><Typography.Text type="secondary">联系电话：</Typography.Text>{selected.applicant.phone}</div>
            <div><Typography.Text type="secondary">退库类型：</Typography.Text>{selected.returnType}</div>
          </div>
          <div className="mt-4"><Typography.Text type="secondary">退库原因：</Typography.Text>{selected.reason}</div>
        </Card>

        <Card size="small" title="退库资产信息" extra={<Button type="link" onClick={() => setRepairOpen(true)}>查看维修记录</Button>}>
          <Table rowKey="id" columns={assetColumns} dataSource={[selected.asset]} pagination={false} scroll={{ x: 1300 }} />
          {selected.relatedConsumables.length > 0 && <div className="mt-3"><Typography.Text strong>关联耗材：</Typography.Text>{selected.relatedConsumables.map((item) => <Tag key={item.assetTag} color="blue">{item.assetTag} {item.assetDesc}</Tag>)}</div>}
        </Card>

        <Card size="small" title="仓库及鉴定信息">
          <div className="grid grid-cols-3 gap-4">
            <div><Typography.Text strong><span className="text-red-500">*</span> 仓库</Typography.Text><Select className="mt-2 w-full" value={warehouse} options={RETURN_WAREHOUSES.map((value) => ({ label: value, value }))} onChange={setWarehouse} /></div>
            <div><Typography.Text strong>责任人</Typography.Text><Input className="mt-2" value="SOHU01-库房管理员-SOHU" disabled /></div>
            <div><Typography.Text strong><span className="text-red-500">*</span> 退库日期</Typography.Text><DatePicker className="mt-2 w-full" value={returnDate} onChange={(value) => setReturnDate(value || dayjs())} /></div>
            <div><Typography.Text strong>鉴定结果</Typography.Text><Input className="mt-2" value={selected.mis.result || '鉴定通过'} disabled={Boolean(selected.mis.result)} /></div>
            <div><Typography.Text strong>资产标记</Typography.Text><Select className="mt-2 w-full" allowClear value={assetMark || undefined} options={['无', '限制出库', '待维修', '待数据清理'].map((value) => ({ label: value, value }))} onChange={(value) => setAssetMark(value || '')} /></div>
            <div><Typography.Text strong>确认状态</Typography.Text><div className="mt-2"><Tag color={selected.handling.confirmationStatus === '已确认' ? 'success' : 'processing'}>{selected.handling.confirmationStatus}</Tag>{selected.handling.confirmationTime && <span className="ml-2 text-sm text-slate-500">{selected.handling.confirmationMethod} / {selected.handling.confirmationTime}</span>}</div></div>
          </div>
          <div className="mt-4"><Typography.Text strong>使用说明</Typography.Text><TextArea className="mt-2" rows={3} maxLength={400} showCount value={usageNote} onChange={(event) => setUsageNote(event.target.value)} /></div>
          <div className="mt-4"><Typography.Text strong>处理意见</Typography.Text><TextArea className="mt-2" rows={3} maxLength={400} showCount value={opinion} placeholder="驳回或放弃退库时必填" onChange={(event) => setOpinion(event.target.value)} /></div>
        </Card>

        <Card size="small" title="办理操作">
          <div className="flex justify-center gap-3">
            <Button type="primary" icon={<BadgeCheck size={14} />} disabled={selected.handling.confirmationStatus === '已确认'} onClick={() => { requestAssetReturnConfirmation(selected.id); messageApi.success('已发起员工退库确认，请前往“员工退库确认”完成扫码、刷卡或工号确认'); refresh(); openDetail(getAssetReturnApplications().find((item) => item.id === selected.id)); }}>申请人退库确认</Button>
            <Button type="primary" icon={<Archive size={14} />} loading={loading} disabled={selected.handling.confirmationStatus !== '已确认'} onClick={executeInbound}>执行入库</Button>
            <Button danger icon={<XCircle size={14} />} onClick={() => finish('驳回')}>驳回</Button>
            <Button icon={<Ban size={14} />} onClick={() => finish('放弃退库')}>放弃退库</Button>
            <Button onClick={() => setSelectedId('')}>返回</Button>
          </div>
        </Card>
      </Space>

      <Modal title="员工名下资产" open={employeeAssetsOpen} width={1000} footer={null} onCancel={() => setEmployeeAssetsOpen(false)}>
        <Typography.Paragraph>{selected.applicant.name}同学，名下共有资产 {getAssetReturnAssets().length} 条，其中借用资产 0 条。</Typography.Paragraph>
        <Table rowKey="id" columns={[
          { title: '物资总类', dataIndex: 'materialType' },
          { title: '资产大类', dataIndex: 'category' },
          { title: '资产小类', dataIndex: 'subCategory' },
          { title: '资产标签号', dataIndex: 'assetTag' },
          { title: '资产说明', dataIndex: 'assetDesc' },
          { title: '配置', dataIndex: 'config' },
          { title: '资产状态', dataIndex: 'status' },
        ]} dataSource={getAssetReturnAssets()} pagination={{ pageSize: 5 }} scroll={{ x: 1000 }} />
      </Modal>

      <Modal title="资产维修信息" open={repairOpen} footer={<Button onClick={() => setRepairOpen(false)}>关闭</Button>} onCancel={() => setRepairOpen(false)}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>资产标签号：{selected.asset.assetTag}</div><div>已维修次数：2</div>
          <div>维修单号：WX-202607180021</div><div>维修状态：已完成</div>
          <div className="col-span-2">故障描述：设备间歇性蓝屏、无法稳定启动。</div>
          <div className="col-span-2">诊断说明：硬件老化，已更换硬盘并完成系统检测。</div>
        </div>
      </Modal>
    </div>
  );
}
