import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Table } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';

export default function ContractNumberSelectModal({
  open,
  candidates = [],
  value,
  onCancel,
  onConfirm,
}) {
  const [imei, setImei] = useState('');
  const [query, setQuery] = useState('');
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  useEffect(() => {
    if (!open) return;
    setImei('');
    setQuery('');
    setSelectedRowKey(value?.id || null);
  }, [open, value?.id]);

  const dataSource = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return candidates;
    return candidates.filter((item) => (
      item.imei.includes(keyword)
      || item.assetTag.includes(keyword)
      || item.phoneNumber.includes(keyword)
    ));
  }, [candidates, query]);

  const selectedRecord = candidates.find((item) => item.id === selectedRowKey) || null;

  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '标签号', dataIndex: 'assetTag', width: 160 },
    { title: '电话号码', dataIndex: 'phoneNumber', width: 190 },
    { title: '话费套餐', dataIndex: 'packageName', width: 180 },
  ];

  return (
    <Modal
      title="选择合约号码"
      open={open}
      width={820}
      destroyOnHidden
      onCancel={onCancel}
      footer={(
        <div className="flex justify-center gap-3">
          <Button
            type="primary"
            disabled={!selectedRecord}
            onClick={() => onConfirm(selectedRecord)}
          >
            确定
          </Button>
          <Button onClick={onCancel}>关闭</Button>
        </div>
      )}
    >
      <QueryBar
        onQuery={() => setQuery(imei)}
        onReset={() => {
          setImei('');
          setQuery('');
        }}
      >
        <QueryItem label="IMEI">
          <Input
            value={imei}
            allowClear
            placeholder="请输入IMEI、标签号或电话号码"
            onPressEnter={() => setQuery(imei)}
            onChange={(event) => setImei(event.target.value)}
          />
        </QueryItem>
      </QueryBar>

      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={dataSource}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
          onChange: (keys) => setSelectedRowKey(keys[0] || null),
        }}
        onRow={(record) => ({ onClick: () => setSelectedRowKey(record.id) })}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </Modal>
  );
}
