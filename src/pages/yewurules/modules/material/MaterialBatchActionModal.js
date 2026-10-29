import React from 'react';
import { CheckCircle, Download, Upload } from 'lucide-react';
import { Modal } from 'antd';

const ACTIONS = [
  { key: 'upload', label: '上传文件', Icon: Upload, iconClassName: 'text-primary' },
  { key: 'download', label: '下载模板', Icon: Download, iconClassName: 'text-primary' },
  { key: 'skip-check', label: '无须盘点设置', Icon: CheckCircle, iconClassName: 'text-success' },
];

const MaterialBatchActionModal = ({ open, onCancel, onAction }) => (
  <Modal centered open={open} onCancel={onCancel} footer={null} title="批量修改" width="400px">
    <div className="flex flex-col gap-3 py-4">
      {ACTIONS.map(({ key, label, Icon, iconClassName }) => (
        <button
          type="button"
          key={key}
          className="mmp-interactive-card flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-primary-bg transition-colors"
          onClick={() => onAction?.(key)}
        >
          <Icon size={18} className={iconClassName} />
          <span className="text-sm text-gray-700">{label}</span>
        </button>
      ))}
    </div>
  </Modal>
);

export default MaterialBatchActionModal;
