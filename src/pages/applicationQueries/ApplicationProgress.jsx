import React from 'react';
import { Alert, Modal, Table, Typography } from 'antd';
import { applicationProgressRecords, formatApplicationValue } from '../../services/applicationQueryService';

const columns = [
  { title: '审批环节', dataIndex: 'node', width: 160 }, { title: '审批人', dataIndex: 'approver', width: 180 },
  { title: '审批状态', dataIndex: 'status', width: 120 },
  { title: '审批时间', dataIndex: 'time', width: 130, render: value => formatApplicationValue(value, 'date') },
  { title: '审批意见', dataIndex: 'opinion', width: 220, render: value => <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value}</span> },
];
export default function ApplicationProgress({ record, onClose }) {
  if (!record) return null;
  const history = record.historySegments ? record.historySegments.flatMap(segment => applicationProgressRecords(segment.records))
    : record.historyPrepared ? record.history : applicationProgressRecords(record.history);
  const external = (record.progressSections || []).filter(section => section.records?.length);
  return <Modal title="审批信息" open onCancel={onClose} footer={null} width={900} destroyOnHidden>
    <div className="flex flex-col gap-4">
      {record.progressTitle && <Typography.Text strong>{record.progressTitle}</Typography.Text>}
      <Table size="small" bordered rowKey="id" columns={columns} dataSource={history} pagination={false} scroll={{ x: 800 }} />
      {external.length > 0 && <Alert type="info" title="以下为关联流程演示记录，未连接外部系统。" />}
      {external.map(section => <div key={section.title}>
        <Typography.Text strong>{section.title}</Typography.Text>
        <Table size="small" bordered rowKey="id" columns={columns} dataSource={section.records} pagination={false} scroll={{ x: 800 }} />
      </div>)}
    </div>
  </Modal>;
}
