import React from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import { Button, Card, Popconfirm, Table, Typography, Upload } from 'antd';

function formatSize(size = 0) {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function ReturnAttachmentCard({
  attachments = [],
  currentNode,
  currentUploader,
  onUpload,
  onDelete,
}) {
  const columns = [
    { title: '附件名称', dataIndex: 'name', render: (value) => value || '-' },
    { title: '附件大小', dataIndex: 'size', width: 140, render: formatSize },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const canDelete = record.node === currentNode && record.uploaderId === currentUploader.id;
        if (!canDelete) return <Typography.Text type="secondary">不可删除</Typography.Text>;
        return (
          <Popconfirm
            title="确认删除该附件吗？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger type="link" icon={<Trash2 size={14} />}>删除</Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      size="small"
      title="附件信息"
      extra={(
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            onUpload({ name: file.name, size: file.size, type: file.type });
            return Upload.LIST_IGNORE;
          }}
        >
          <Button type="primary" icon={<UploadCloud size={14} />}>上传附件</Button>
        </Upload>
      )}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={attachments}
        pagination={false}
        size="small"
        bordered
        locale={{ emptyText: '暂无附件' }}
      />
    </Card>
  );
}
