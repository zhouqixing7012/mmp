import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import InventoryPhotoRuleEditor from './InventoryPhotoRuleEditor';

jest.mock('antd', () => {
  const React = require('react');
  return {
    Card: ({ title, children }) => <div>{title}{children}</div>,
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    Select: ({ disabled, options }) => <select aria-label="筛选条件" disabled={disabled}>{options.map(option => <option key={option.value}>{option.label}</option>)}</select>,
    InputNumber: ({ disabled, value, onChange }) => <input aria-label="上传比例" disabled={disabled} value={value ?? ''} onChange={event => onChange(event.target.value === '' ? null : Number(event.target.value))} />,
    Switch: ({ checked, onChange, ...props }) => <button role="switch" aria-checked={checked} aria-label={props['aria-label']} onClick={() => onChange(!checked)} />,
    Table: ({ columns, dataSource }) => <div>{dataSource.map(row => <div key={row.key} data-testid={row.key}>{columns.map((column, i) => <div key={i} data-testid={`${row.key}-${column.title}`}>{column.render?.(row[column.dataIndex], row)}</div>)}</div>)}</div>,
    Typography: { Text: ({ children }) => <span>{children}</span> },
  };
});
jest.mock('../../components/AssetQueryControls', () => ({
  AssetCategorySelect: ({ disabled }) => <input aria-label="资产类别" disabled={disabled} />,
  OwnerLevelSelect: ({ disabled }) => <input aria-label="责任人职级" disabled={disabled} />,
}));

test('表格始终显示，每行独立控制配置可编辑性并保留关闭行的值', () => {
  const initial = { rules: [
    { key: 'employee', range: '员工', uploadEnabled: false, percent: 60 },
    { key: 'public', range: '公共', uploadEnabled: true, percent: 90 },
  ] };
  const changed = jest.fn();
  function Harness() {
    const [config, setConfig] = useState(initial);
    return <InventoryPhotoRuleEditor config={config} assets={[]} ranges={['员工', '公共']} onChange={next => { changed(next); setConfig(next); }} />;
  }
  render(<Harness />);
  expect(screen.getAllByRole('switch')).toHaveLength(2);
  expect(within(screen.getByTestId('employee')).getByLabelText('上传比例').disabled).toBe(true);
  expect(within(screen.getByTestId('public')).getByLabelText('上传比例').disabled).toBe(false);
  fireEvent.click(screen.getByRole('switch', { name: '员工图片上传开关' }));
  expect(within(screen.getByTestId('employee-资产类别')).getByLabelText('筛选条件').disabled).toBe(false);
  expect(changed.mock.calls[0][0].rules[1]).toEqual(initial.rules[1]);
  fireEvent.click(screen.getByRole('switch', { name: '员工图片上传开关' }));
  expect(within(screen.getByTestId('employee')).getByLabelText('上传比例').value).toBe('60');
  expect(within(screen.getByTestId('employee')).getByLabelText('责任人职级').disabled).toBe(true);
  expect(screen.getAllByRole('switch')).toHaveLength(2);
  expect(screen.queryByRole('button', { name: '增行' })).toBeNull();
  expect(screen.queryByRole('button', { name: '删除' })).toBeNull();
  expect(within(screen.getByTestId('employee-盘点范围')).queryByRole('combobox')).toBeNull();
  expect(within(screen.getByTestId('employee-资产类别')).getAllByRole('option').map(option => option.textContent)).toEqual(['全部', 'SERVER', 'NET EQUIPMENT', 'NOTEBOOK', 'MONITOR']);
  expect(within(screen.getByTestId('employee-部门')).getAllByRole('option').map(option => option.textContent)).toContain('集团总部.MIS部');
  fireEvent.click(screen.getByRole('switch', { name: '员工图片上传开关' }));
  fireEvent.change(within(screen.getByTestId('employee')).getByLabelText('上传比例'), { target: { value: '' } });
  expect(within(screen.getByTestId('employee')).getByLabelText('上传比例').value).toBe('100');
});
