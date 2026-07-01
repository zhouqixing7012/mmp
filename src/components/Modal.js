import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer, width = 'max-w-[520px]', confirmText = '确定', onConfirm, confirmDisabled = false }) => {
  if (!isOpen) return null;

  const defaultFooter = (
    <div className="px-6 py-3.5 border-t border-border flex justify-end gap-2 bg-[#fafafa]">
      <button
        onClick={onClose}
        className="h-8 px-4 border border-border-input rounded-md hover:text-primary-hover hover:border-primary-hover transition-all bg-white text-[14px]"
      >
        取消
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`h-8 px-4 rounded-md shadow-sm transition-all text-[14px] ${
          confirmDisabled
            ? 'bg-[#f5f5f5] text-text-disabled border border-border-input cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-hover'
        }`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full ${width} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-[16px] font-semibold text-text-primary">{title}</h3>
          <X
            size={16}
            className="text-text-tertiary hover:text-text-primary cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="p-6">{children}</div>
        {footer !== undefined ? footer : defaultFooter}
      </div>
    </div>
  );
};

export default Modal;
