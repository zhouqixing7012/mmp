import React, { useEffect, useMemo, useState } from 'react';
import { Input, Modal, Radio, Table, Typography } from 'antd';
import StatusTag from '../../components/StatusTag';
import { MY_EXISTING_ASSETS } from '../../mock/assetApplicationMock';

export default function RelatedAssetSelectModal({ open, value, onCancel, onConfirm }) {
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState(value || null);

  useEffect(() => {
    if (open) {
      setSelectedId(value || null);
      setKeyword('');
    }
  }, [open, value]);

  const dataSource = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return MY_EXISTING_ASSETS;
    return MY_EXISTING_ASSETS.filter((asset) => (
      `${asset.assetTag || ''} ${asset.assetDesc || ''} ${asset.config || ''} ${asset.name || ''}`
        .toLowerCase()
        .includes(normalizedKeyword)
    ));
  }, [keyword]);

  const columns = [
    {
      title: '选择',
      width: 60,
      align: 'center',
      render: (_, record) => <Radio checked={selectedId === record.id} />,
    },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, render: (value) => value || '-' },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220, render: (value, record) => value || record.name || '-' },
    { title: '配置', dataIndex: 'config', width: 260, render: (value) => value || '-' },
    { title: '资产状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value || '-'} type="business" /> },
    { title: '资产用途', dataIndex: 'purpose', width: 120, render: (value) => value || '-' },
  ];

  const handleCancel = () => {
    setKeyword('');
    setSelectedId(value || null);
    onCancel();
  };

  const handleConfirm = () => {
    const asset = MY_EXISTING_ASSETS.find((item) => item.id === selectedId);
    if (!asset) return;
    onConfirm(asset);
    setKeyword('');
  };

  return (
    <Modal
      title="选择关联主资产"
      open={open}
      width={980}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ disabled: !selectedId }}
      onCancel={handleCancel}
      onOk={handleConfirm}
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary" className="mb-3">
        仅展示当前员工个人工作台中本人名下已有资产。
      </Typography.Paragraph>
      <Input.Search
        allowClear
        className="mb-3"
        value={keyword}
        placeholder="搜索资产标签号、资产说明或配置"
        onChange={(event) => setKeyword(event.target.value)}
      />
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 930 }}
        onRow={(record) => ({
          onClick: () => setSelectedId(record.id),
          className: selectedId === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer',
        })}
      />
    </Modal>
  );
}
