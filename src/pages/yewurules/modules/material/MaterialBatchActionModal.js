import React from 'react';
import { CheckCircle, Download, Upload } from 'lucide-react';
import { Modal } from 'antd';

const ACTIONS = [
  { key: 'upload', label: '上传文件', Icon: Upload, iconClassName: 'text-[#1677ff]' },
  { key: 'download', label: '下载模板', Icon: Download, iconClassName: 'text-[#1677ff]' },
  { key: 'skip-check', label: '无须盘点设置', Icon: CheckCircle, iconClassName: 'text-[#52c41a]' },
];

const MaterialBatchActionModal = ({ open, onCancel, onAction }) => (
  <Modal open={open} onCancel={onCancel} footer={null} title="批量修改" width="400px">
    <div className="flex flex-col gap-3 py-4">
      {ACTIONS.map(({ key, label, Icon, iconClassName }) => (
        <div
          key={key}
          className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors"
          onClick={() => onAction?.(key)}
        >
          <Icon size={18} className={iconClassName} />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
      ))}
    </div>
  </Modal>
);

export default MaterialBatchActionModal;
