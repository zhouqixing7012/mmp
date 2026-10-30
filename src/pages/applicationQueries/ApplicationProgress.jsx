import React from 'react';
import { renderApplicationStatus } from './ApplicationStatus';
import { Modal, Typography } from 'antd';
import Table from '../../components/businessQuery/BusinessTable';
import { applicationProgressRecords, formatApplicationValue } from '../../services/applicationQueryService';

const readOnlyValue = value => value == null || (typeof value === 'string' && !value.trim()) ? '-' : value;
const columns = [
  { title: '审批环节', dataIndex: 'node', width: 160, render: readOnlyValue }, { title: '审批人', dataIndex: 'approver', width: 180, render: readOnlyValue },
  { title: '审批状态', dataIndex: 'status', width: 120, render: renderApplicationStatus },
  { title: '审批时间', dataIndex: 'time', width: 130, render: value => value ? formatApplicationValue(value, 'date') : '-' },
  { title: '审批意见', dataIndex: 'opinion', width: 220, render: value => <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{readOnlyValue(value)}</span> },
];
export default function ApplicationProgress({ record, onClose }) {
  if (!record) return null;
  const history = record.historySegments ? record.historySegments.flatMap(segment => applicationProgressRecords(segment.records))
    : record.historyPrepared ? record.history : applicationProgressRecords(record.history);
  const external = (record.progressSections || []).filter(section => section.records?.length);
  return <Modal className="mmp-application-modal" title="审批信息" open onCancel={onClose} footer={null} width={900} destroyOnHidden>
    <div className="flex flex-col gap-4">
      {record.progressTitle && <Typography.Text strong>{record.progressTitle}</Typography.Text>}
      <Table size="small" bordered rowKey="id" columns={columns} dataSource={history} pagination={false} scroll={{ x: 'max-content' }} />
      {external.map(section => <div key={section.title}>
        <Typography.Text strong>{section.title}</Typography.Text>
        <Table size="small" bordered rowKey="id" columns={columns} dataSource={section.records} pagination={false} scroll={{ x: 'max-content' }} />
      </div>)}
    </div>
  </Modal>;
}
