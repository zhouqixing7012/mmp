import React from 'react';
import { Select } from 'antd';

export default function TableDensityControl({ value = 40, onChange }) {
  return (
    <Select
      aria-label="表格行高"
      value={value}
      onChange={onChange}
      style={{ width: 112 }}
      options={[32, 40, 44, 48].map(height => ({ value: height, label: `行高 ${height}px` }))}
    />
  );
}
