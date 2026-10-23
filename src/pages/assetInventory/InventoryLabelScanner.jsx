import React, { useState } from 'react';
import { Alert, Button, Input, Modal, Space, Table, Typography } from 'antd';
import { checkInventoryScannedTag, inventoryScannerBlockReason, uploadInventoryScannedTags } from './inventoryLabelScan';

export default function InventoryLabelScanner({ open, project, plan, operator, assets, onClose, onUploaded }) {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState('');
  const scan = () => {
    const tag = input.trim();
    const reason = inventoryScannerBlockReason(project, plan, operator) || checkInventoryScannedTag(tag, assets, tags);
    setAttempts(current => [...current, { assetTag: tag, reason }]);
    if (!reason) setTags(current => [...current, tag]);
    setError(reason); setInput('');
  };
  const upload = () => {
    try {
      const result = uploadInventoryScannedTags({ project, plan, operator, assets, tags });
      setUploads(result); setError('');
      setTags(current => current.filter(tag => !result.some(item => item.assetTag === tag && item.success)));
      onUploaded(result.filter(item => item.success));
    } catch (failure) { setError(failure.message); }
  };
  return <Modal open={open} title="标签扫描" width={760} onCancel={onClose} footer={<Space>
    <Button onClick={() => { setTags([]); setInput(''); }}>清空</Button>
    <Button type="primary" disabled={!tags.length || Boolean(inventoryScannerBlockReason(project, plan, operator))} onClick={upload}>上传</Button>
    <Button onClick={onClose}>返回</Button>
  </Space>}>
    <Space direction="vertical" className="w-full" size={16}>
      {error && <Alert type="error" showIcon title={error} />}
      <Input aria-label="扫描资产标签" autoFocus value={input} onChange={event => setInput(event.target.value)} onPressEnter={scan} addonAfter={<Button type="text" onClick={scan}>扫描</Button>} />
      <Typography.Text>扫描总次数：{attempts.length}　成功次数：{attempts.filter(item => !item.reason).length}　失败次数：{attempts.filter(item => item.reason).length}</Typography.Text>
      <Typography.Text>全部标签：{tags.join('、') || '—'}</Typography.Text>
      {uploads.length > 0 && <Typography.Text>上传总标签数：{uploads.length}　成功数：{uploads.filter(item => item.success).length}　失败数：{uploads.filter(item => !item.success).length}</Typography.Text>}
      <Table size="small" rowKey={(_, index) => index} pagination={{ pageSize: 5 }} dataSource={[...attempts.filter(item => item.reason), ...uploads.filter(item => !item.success)]} columns={[{ title: '资产标签号', dataIndex: 'assetTag' }, { title: '失败原因', dataIndex: 'reason' }]} />
    </Space>
  </Modal>;
}
