import React from 'react';
import { Input } from 'antd';
import { Search } from 'lucide-react';

export default function LookupInput({ value, placeholder, onOpen, onClear, disabled = false }) {
  const handleOpen = (event) => {
    if (event?.target?.closest?.('.ant-input-clear-icon')) return;
    onOpen?.();
  };

  return (
    <Input
      value={value || ''}
      readOnly
      allowClear={Boolean(onClear)}
      disabled={disabled}
      placeholder={placeholder}
      suffix={<Search size={14} className="pointer-events-none text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
      onChange={(event) => {
        if (!event.target.value) onClear?.();
      }}
    />
  );
}
