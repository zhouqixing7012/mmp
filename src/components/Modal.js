import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const EXIT_DURATION = 140;

const Modal = ({ isOpen, onClose, title, children, footer, width = 'max-w-[520px]', confirmText = '确定', onConfirm, confirmDisabled = false }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameId;
    let exitTimer;

    if (isOpen) {
      setShouldRender(true);
      frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      if (shouldRender) {
        exitTimer = window.setTimeout(() => {
          setShouldRender(false);
        }, EXIT_DURATION);
      }
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      if (exitTimer) window.clearTimeout(exitTimer);
    };
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const defaultFooter = (
    <div className="px-6 py-3.5 border-t border-border flex justify-end gap-2 bg-[#fafafa]">
      <button
        onClick={onClose}
        className="h-8 px-4 border border-border-input rounded-md hover:text-primary-hover hover:border-primary-hover transition-colors bg-white text-[14px]"
      >
        取消
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`h-8 px-4 rounded-md shadow-sm transition-colors text-[14px] ${
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
    <div
      className={`fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4 mmp-motion-overlay ${isVisible ? 'is-visible' : ''}`}
      data-prototype-overlay="modal"
    >
      <div className={`bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full ${width} overflow-hidden mmp-motion-dialog ${isVisible ? 'is-visible' : ''}`}>
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-[16px] font-semibold text-text-primary">{title}</h3>
          <X
            size={16}
            className="text-text-tertiary hover:text-text-primary cursor-pointer transition-colors"
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
