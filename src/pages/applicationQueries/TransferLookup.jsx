import React, { useState } from 'react';
import LookupInput from '../../components/LookupInput';
import SelectModal from '../../components/SelectModal';
export const transferChoices = (values) => [...new Set(values.filter(Boolean))].map(value => ({ id: value, label: value }));
export default function TransferLookup({ title, value, options, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  if (disabled) return <span>{options.find(row => row.id === value)?.label || value}</span>;
  return <><LookupInput value={options.find(row => row.id === value)?.label || value} placeholder={'请选择' + title} onOpen={() => setOpen(true)} onClear={() => onChange('')} />
    <SelectModal open={open} title={'选择' + title} onCancel={() => setOpen(false)} onSelect={row => onChange(row.id)} dataSource={options} columns={[{ title, dataIndex: 'label', width: 260 }]} searchFields={[{ name: 'label', label: title, dataIndex: 'label' }]} />
  </>;
}
