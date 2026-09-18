import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { Download, Search } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const TRANSIT_WAREHOUSE = 'V00001.集团在途总库';
const CURRENT_RECEIVER = '114111-杨芊';
const RECEIVE_STATUSES = ['出库待接收', '已完成', '已驳回'];
const EMPTY_FILTERS = {
  documentNo: '', status: '', creator: '', createdFrom: '', createdTo: '', assetScan: '',
};

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function inDateRange(value, from, to) {
  if (!value) return !from && !to;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function rowContainsAsset(row, query) {
  if (!query) return true;
  return (row.lines || []).some((asset) => includesText(asset.assetTag, query) || includesText(asset.sn, query));
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function deriveDocumentStatus(lines) {
  const effective = (lines || []).filter((line) => line.moveStatus !== '已取消');
  if (!effective.length) return '已完成';
  if (effective.every((line) => line.moveStatus === '已接收')) return '已完成';
  if (effective.every((line) => line.moveStatus === '已驳回')) return '已驳回';
  if (effective.some((line) => line.moveStatus === '待接收')) return '出库待接收';
  return '已完成';
}

function ReceiveAssetDetailModal({ open, document, asset, onCancel }) {
  if (!document || !asset) return null;
  const snapshot = asset.snapshot || asset;
  return (
    <Modal open={open} title="移库物资信息" width={980} footer={null} onCancel={onCancel} destroyOnHidden>
      <Space direction="vertical" size={16} className="w-full">
        <Card size="small" title="移库单信息">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="移库单号"><Readonly>{document.documentNo}</Readonly></DetailItem>
            <DetailItem label="当前仓库"><Readonly>{document.fromWarehouse}</Readonly></DetailItem>
            <DetailItem label="对方仓库"><Readonly>{document.toWarehouse}</Readonly></DetailItem>
            <DetailItem label="来源移库单号"><Readonly>{document.sourceDocumentNo}</Readonly></DetailItem>
            <DetailItem label="出库仓库管理员"><Readonly>{document.creator}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="资产信息">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="标签号"><Readonly>{snapshot.assetTag}</Readonly></DetailItem>
            <DetailItem label="SN"><Readonly>{snapshot.sn}</Readonly></DetailItem>
            <DetailItem label="物资总类"><Readonly>{snapshot.materialGroup}</Readonly></DetailItem>
            <DetailItem label="原值"><Readonly>{Number(snapshot.originalValue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Readonly></DetailItem>
            <DetailItem label="净值"><Readonly>{Number(snapshot.netValue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Readonly></DetailItem>
            <DetailItem label="资产状态"><Readonly>{snapshot.assetStatus}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{snapshot.plate}</Readonly></DetailItem>
            <DetailItem label="使用公司"><Readonly>{snapshot.company}</Readonly></DetailItem>
            <DetailItem label="使用部门"><Readonly>{snapshot.department}</Readonly></DetailItem>
            <DetailItem label="成本中心"><Readonly>{snapshot.costCenter}</Readonly></DetailItem>
            <DetailItem label="业务线"><Readonly>{snapshot.businessLine}</Readonly></DetailItem>
            <DetailItem label="费用账户"><Readonly>{snapshot.expenseAccount}</Readonly></DetailItem>
            <DetailItem label="管理人"><Readonly>{snapshot.responsiblePerson}</Readonly></DetailItem>
            <DetailItem label="City"><Readonly>{snapshot.city}</Readonly></DetailItem>
            <DetailItem label="Building"><Readonly>{snapshot.building}</Readonly></DetailItem>
            <DetailItem label="Floor"><Readonly>{snapshot.floor}</Readonly></DetailItem>
            <DetailItem label="Room"><Readonly>{snapshot.room}</Readonly></DetailItem>
            <DetailItem label="启用日期"><Readonly>{snapshot.enabledDate}</Readonly></DetailItem>
            <DetailItem label="用途"><Readonly>{snapshot.usage}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="移库结果">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="目标仓"><Readonly>{document.toWarehouse}</Readonly></DetailItem>
            <DetailItem label="数量"><Readonly>{asset.quantity}</Readonly></DetailItem>
            <DetailItem label="资产验证"><Readonly>{asset.verification}</Readonly></DetailItem>
            <DetailItem label="移库状态"><StatusTag value={asset.moveStatus} /></DetailItem>
            <DetailItem label="移库说明" span={3}><Readonly>{asset.moveDesc}</Readonly></DetailItem>
            <DetailItem label="验证说明" span={3}><Readonly>{asset.verificationDesc}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function VerificationModal({ open, asset, onCancel, onConfirm }) {
  const [desc, setDesc] = useState('');
  useEffect(() => setDesc(''), [open, asset?.id]);
  return (
    <Modal
      open={open}
      title="手动验证"
      okText="确认验证"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => onConfirm(desc)}
      destroyOnHidden
    >
      <Space direction="vertical" size={12} className="w-full">
        <Typography.Text>您没有进行验证，请输入备注(最多允许填写60个字):</Typography.Text>
        <TextArea
          maxLength={60}
          showCount
          value={desc}
          onChange={(event) => setDesc(event.target.value)}
          autoSize={{ minRows: 3, maxRows: 5 }}
          placeholder="请输入验证说明"
        />
      </Space>
    </Modal>
  );
}

function RejectModal({ open, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  useEffect(() => setReason(''), [open]);
  return (
    <Modal
      open={open}
      title="移库驳回"
      okText="确认驳回"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      onCancel={onCancel}
      onOk={() => onConfirm(reason)}
      destroyOnHidden
    >
      <Typography.Text>驳回后，该条物资变为“已驳回”，系统自动生成反向移库单。</Typography.Text>
      <div className="mt-3">
        <Typography.Text>驳回原因：</Typography.Text>
        <TextArea maxLength={200} showCount value={reason} onChange={(event) => setReason(event.target.value)} autoSize={{ minRows: 3, maxRows: 5 }} placeholder="必填，最多200字" />
      </div>
    </Modal>
  );
}

function ReceiveDetail({ row, documents, setDocuments, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [scanAsset, setScanAsset] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [detailAsset, setDetailAsset] = useState(null);
  const [verificationAsset, setVerificationAsset] = useState(null);
  const [rejectAsset, setRejectAsset] = useState(null);
  const [lines, setLines] = useState(row.lines || []);

  useEffect(() => {
    setLines(row.lines || []);
  }, [row.id, row.lines]);

  const syncLines = (nextLines, extra = {}) => {
    const nextStatus = deriveDocumentStatus(nextLines);
    setLines(nextLines);
    setDocuments((current) => current.map((document) => document.id === row.id ? { ...document, lines: nextLines, status: nextStatus, ...extra } : document));
    return nextStatus;
  };

  const handleScan = () => {
    const value = scanAsset.trim();
    if (!value) return undefined;

    const asset = lines.find((item) => String(item.assetTag || '').trim() === value);
    setScanAsset('');

    if (!asset) {
      messageApi.warning('该资产不在接收单中，请扫描接收其他资产');
      return undefined;
    }
    if (asset.verification === '已验证') {
      messageApi.info('该资产已扫描，请扫描接收其他资产');
      return undefined;
    }
    if (asset.moveStatus !== '待接收') {
      messageApi.warning('当前资产已处理，不能重复验证');
      return undefined;
    }

    const nextLines = lines.map((line) => line.id === asset.id ? {
      ...line,
      verification: '已验证',
      verificationMethod: '扫码',
      verificationTime: dayjs().format('YYYY-MM-DD HH:mm'),
      verificationDesc: '扫码验证通过',
    } : line);
    syncLines(nextLines);
    setSelectedKeys((current) => [...new Set([...current, asset.id])]);
    messageApi.success('资产验证成功');
    return undefined;
  };

  const manualVerify = (desc) => {
    if (!verificationAsset) return;
    const trimmed = desc.trim();
    if (!trimmed) {
      messageApi.warning('请输入验证说明');
      return;
    }
    if (trimmed.length > 60) {
      messageApi.warning('验证说明最多允许填写60个字');
      return;
    }
    const nextLines = lines.map((line) => line.id === verificationAsset.id ? {
      ...line,
      verification: '已验证',
      verificationMethod: '手工',
      verificationTime: dayjs().format('YYYY-MM-DD HH:mm'),
      verificationDesc: trimmed,
    } : line);
    syncLines(nextLines);
    setVerificationAsset(null);
    messageApi.success('手动验证成功');
  };

  const cancelVerification = (asset) => {
    Modal.confirm({
      title: '确认取消验证？',
      content: `资产 ${asset.assetTag} 将恢复为“未验证”。`,
      okText: '确认取消',
      cancelText: '返回',
      onOk: () => {
        const nextLines = lines.map((line) => line.id === asset.id ? {
          ...line,
          verification: '未验证',
          verificationMethod: '',
          verificationTime: '',
          verificationDesc: '',
        } : line);
        syncLines(nextLines);
        setSelectedKeys((current) => current.filter((key) => key !== asset.id));
      },
    });
  };

  const receive = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要处理的物资');
    const selected = lines.filter((line) => selectedKeys.includes(line.id));
    if (!selected.length || selected.some((line) => line.moveStatus !== '待接收' || line.verification !== '已验证')) {
      return messageApi.warning('无已验证待接收的资产');
    }
    Modal.confirm({
      title: '是否确定执行移库接收？',
      content: `本次将接收 ${selected.length} 条物资。`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const selectedSet = new Set(selectedKeys);
        const now = dayjs().format('YYYY-MM-DD HH:mm');
        const nextLines = lines.map((line) => selectedSet.has(line.id) ? {
          ...line,
          moveStatus: '已接收',
          warehouse: row.toWarehouse,
          receiver: CURRENT_RECEIVER,
          receiveTime: now,
          transactionIn: '25',
        } : line);
        const nextStatus = syncLines(nextLines, nextLines.every((line) => line.moveStatus !== '待接收') ? { reminderStatus: '已结束' } : {});
        setSelectedKeys([]);
        messageApi.success(nextStatus === '出库待接收' ? '所选物资已接收，单据仍有待接收物资' : `移库单已更新为${nextStatus}`);
      },
    });
    return undefined;
  };

  const reject = (reason) => {
    if (!rejectAsset) return;
    const trimmed = reason.trim();
    if (!trimmed) return messageApi.warning('请填写驳回原因');
    if (trimmed.length > 200) return messageApi.warning('驳回原因最多允许填写200个字');
    if (rejectAsset.moveStatus !== '待接收') return messageApi.warning('仅待接收物资允许驳回');

    const selected = [rejectAsset];
    const nextLines = lines.map((line) => line.id === rejectAsset.id ? {
      ...line,
      moveStatus: '已驳回',
      rejectReason: trimmed,
      rejectTime: dayjs().format('YYYY-MM-DD HH:mm'),
    } : line);
    const nextStatus = deriveDocumentStatus(nextLines);

    setDocuments((current) => {
      const maxId = Math.max(0, ...current.map((item) => Number(item.id) || 0));
      const reverseId = maxId + 1;
      const sameDayReverseCount = current.filter((item) => String(item.documentNo || '').startsWith(`TS-R${dayjs().format('YYYYMMDD')}`)).length + 1;
      const reverseDocumentNo = `TS-R${dayjs().format('YYYYMMDD')}${String(sameDayReverseCount).padStart(4, '0')}`;
      const reverseLines = selected.map((line, index) => ({
        ...line,
        id: `reverse-${reverseId}-${index + 1}`,
        lineNo: index + 1,
        moveStatus: '待接收',
        verification: '未验证',
        verificationMethod: '',
        verificationTime: '',
        verificationDesc: '',
        receiveDesc: '',
        receiver: '',
        receiveTime: '',
        warehouse: TRANSIT_WAREHOUSE,
        transactionIn: '',
        reverseReason: trimmed,
      }));
      const reverseDocument = {
        id: reverseId,
        documentNo: reverseDocumentNo,
        status: '出库待接收',
        fromWarehouse: row.toWarehouse,
        toWarehouse: row.fromWarehouse,
        createdDate: dayjs().format('YYYY-MM-DD'),
        creator: 'system-系统',
        quantity: reverseLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
        remark: trimmed,
        reverseMove: true,
        sourceDocumentNo: row.documentNo,
        notificationStatus: '已通知',
        reminderStatus: '未超期',
        lines: reverseLines,
      };
      return [
        reverseDocument,
        ...current.map((document) => document.id === row.id ? {
          ...document,
          lines: nextLines,
          status: nextStatus,
          reverseDocumentNos: [...(document.reverseDocumentNos || []), reverseDocumentNo],
          reminderStatus: nextStatus === '出库待接收' ? document.reminderStatus : '已结束',
        } : document),
      ];
    });

    setLines(nextLines);
    setSelectedKeys((current) => current.filter((key) => key !== rejectAsset.id));
    setRejectAsset(null);
    messageApi.success(`该物资已驳回，已生成反向移库单；原单状态为${nextStatus}`);
    return undefined;
  };

  const columns = [
    {
      title: '资产标签号',
      dataIndex: 'assetTag',
      width: 170,
      fixed: 'left',
      render: (value, asset) => <Button type="link" className="px-0 select-text" onClick={() => setDetailAsset(asset)}>{value}</Button>,
    },
    { title: 'SN', dataIndex: 'sn', width: 150 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 220 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 130 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'right', render: (value) => value ?? 0 },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '板块', dataIndex: 'plate', width: 110 },
    { title: '资产标记', dataIndex: 'assetMark', width: 120, render: (value) => value || '-' },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120, render: (value, asset) => value || asset.snapshot?.enabledDate || '-' },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130, render: (value, asset) => value || asset.snapshot?.assetStatus || '-' },
    { title: '验证说明', dataIndex: 'verificationDesc', width: 180, render: (value) => value || '-' },
    {
      title: '资产验证',
      dataIndex: 'verification',
      width: 110,
      render: (value) => value === '未验证' ? <Typography.Text type="danger">未验证</Typography.Text> : <StatusTag value="已验证" />,
    },
    { title: '移库状态', dataIndex: 'moveStatus', width: 110, render: (value) => <StatusTag value={value} /> },
    {
      title: '操作',
      key: 'operation',
      width: 190,
      fixed: 'right',
      render: (_, asset) => {
        if (asset.moveStatus !== '待接收') return '-';
        return (
          <Space size={8}>
            {asset.verification === '未验证' ? (
              <Button type="link" className="px-0" onClick={() => setVerificationAsset(asset)}>手动验证</Button>
            ) : (
              <Button type="link" className="px-0" onClick={() => cancelVerification(asset)}>取消验证</Button>
            )}
            <Button type="link" danger className="px-0" onClick={() => setRejectAsset(asset)}>移库驳回</Button>
          </Space>
        );
      },
    },
  ];

  const waiting = row.status === '出库待接收';

  return (
    <div data-page-view-key={`move-receive-${row.id}`}>
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Typography.Title level={3} className="mb-0">移库接收</Typography.Title>

        <Card size="small" title="移库单信息">
          <DetailGrid columns={3} labelWidth={100}>
            <DetailItem label="移库单号"><Readonly>{row.documentNo}</Readonly></DetailItem>
            <DetailItem label="单据类型"><Readonly>移库单</Readonly></DetailItem>
            <DetailItem label="单据状态"><StatusTag value={row.status} /></DetailItem>
            <DetailItem label="移出仓库"><Readonly>{row.fromWarehouse}</Readonly></DetailItem>
            <DetailItem label="接收仓库"><Readonly>{row.toWarehouse}</Readonly></DetailItem>
            <DetailItem label="制单人"><Readonly>{row.creator}</Readonly></DetailItem>
            <DetailItem label="制单日期"><Readonly>{row.createdDate}</Readonly></DetailItem>
            {row.sourceDocumentNo && <DetailItem label="来源移库单号"><Readonly>{row.sourceDocumentNo}</Readonly></DetailItem>}
            <DetailItem label="通知状态"><Readonly>{row.notificationStatus}</Readonly></DetailItem>
            <DetailItem label="催办状态"><Readonly>{row.reminderStatus}</Readonly></DetailItem>
            <DetailItem label="备注" span={3}><Readonly>{row.remark}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="接收物资" extra={<Typography.Text type="secondary">共 {lines.length} 条</Typography.Text>}>
          {waiting && (
            <div className="mb-3 rounded-md bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Typography.Text className="shrink-0">资产扫描</Typography.Text>
                <Input
                  value={scanAsset}
                  allowClear
                  autoFocus
                  placeholder="扫描或输入资产标签号，回车自动验证"
                  onChange={(event) => setScanAsset(event.target.value)}
                  onPressEnter={handleScan}
                />
              </div>
            </div>
          )}
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={columns}
            dataSource={lines}
            rowSelection={waiting ? {
              selectedRowKeys: selectedKeys,
              onChange: setSelectedKeys,
              fixed: true,
              columnTitle: '选择',
              getCheckboxProps: (record) => ({ disabled: record.moveStatus !== '待接收' }),
            } : undefined}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>

        <div className="flex justify-center gap-3">
          {waiting && <Button type="primary" onClick={receive}>移库接收确认</Button>}
          {!waiting && <Button onClick={() => messageApi.info('移库单打印已生成')}>打印</Button>}
          {!waiting && <Button onClick={() => messageApi.success('移库明细已导出')}>导出</Button>}
          <Button onClick={onBack}>返回</Button>
        </div>

        <ReceiveAssetDetailModal open={Boolean(detailAsset)} document={row} asset={detailAsset} onCancel={() => setDetailAsset(null)} />
        <VerificationModal open={Boolean(verificationAsset)} asset={verificationAsset} onCancel={() => setVerificationAsset(null)} onConfirm={manualVerify} />
        <RejectModal open={Boolean(rejectAsset)} onCancel={() => setRejectAsset(null)} onConfirm={reject} />
      </Space>
    </div>
  );
}

export default function MoveReceiveContent({ documents, setDocuments, onDetailChange }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const receiveRows = useMemo(() => documents.filter((row) => row.status !== '草稿'), [documents]);
  const creators = useMemo(
    () => [...new Set(receiveRows.map((row) => row.creator))].map((name, index) => ({ id: index + 1, name })),
    [receiveRows]
  );

  const activeRow = documents.find((row) => row.id === activeRowId) || null;
  const filteredRows = useMemo(() => receiveRows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && (!filters.status || row.status === filters.status)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
    && rowContainsAsset(row, filters.assetScan)
  )), [receiveRows, filters]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const openDetail = (row) => {
    setActiveRowId(row.id);
    onDetailChange?.(true);
  };

  const closeDetail = () => {
    setActiveRowId(null);
    onDetailChange?.(false);
  };

  if (activeRow) {
    return <ReceiveDetail row={activeRow} documents={documents} setDocuments={setDocuments} onBack={closeDetail} />;
  }

  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => (page - 1) * pageSize + index + 1 },
    { title: '移库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0 select-text" onClick={() => openDetail(row)}>{value}</Button> },
    { title: '单据状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} /> },
    { title: '移出仓库', dataIndex: 'fromWarehouse', width: 320 },
    { title: '移入仓库', dataIndex: 'toWarehouse', width: 320 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 170 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right', render: (value) => value ?? 0 },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <QueryBar
        onQuery={() => { setFilters({ ...draft }); setPage(1); }}
        onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setPage(1); }}
      >
        <QueryItem label="移库单号"><Input value={draft.documentNo} allowClear placeholder="请输入移库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={RECEIVE_STATUSES.map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
        <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setCreatorModalOpen(true)} /></QueryItem>
        <QueryItem label="制单日期">
          <RangePicker
            className="w-full"
            value={[draft.createdFrom ? dayjs(draft.createdFrom) : null, draft.createdTo ? dayjs(draft.createdTo) : null]}
            onChange={(dates) => {
              update('createdFrom', dates?.[0]?.format('YYYY-MM-DD') || '');
              update('createdTo', dates?.[1]?.format('YYYY-MM-DD') || '');
            }}
          />
        </QueryItem>
        <QueryItem label="资产扫描">
          <Input value={draft.assetScan} allowClear placeholder="扫码或手输标签号/SN" onChange={(event) => update('assetScan', event.target.value)} onPressEnter={() => { setFilters({ ...draft }); setPage(1); }} />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title="接收单列表"
        extra={<Space><Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text><Button icon={<Download size={14} />} onClick={() => messageApi.success('当前查询结果已导出')}>导出</Button></Space>}
      >
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize); },
          }}
        />
      </Card>

      <SelectModal
        open={creatorModalOpen}
        title="选择制单人"
        dataSource={creators}
        columns={[{ title: '名称', dataIndex: 'name' }]}
        searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]}
        onCancel={() => setCreatorModalOpen(false)}
        onConfirm={(record) => { update('creator', record.name); setCreatorModalOpen(false); }}
      />
    </Space>
  );
}
