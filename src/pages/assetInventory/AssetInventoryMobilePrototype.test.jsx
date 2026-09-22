import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('antd', () => {
  const React = require('react');
  const Button = ({ children, icon, onClick, disabled, type: _type, shape: _shape, danger: _danger, block: _block, size: _size, ...props }) => (
    <button type="button" disabled={disabled} onClick={onClick} {...props}>{icon}{children}</button>
  );
  const Input = ({ value, onChange, bordered: _bordered, ...props }) => <input value={value || ''} onChange={onChange} {...props} />;
  Input.TextArea = ({ value, onChange, showCount: _showCount, ...props }) => <textarea value={value || ''} onChange={onChange} {...props} />;
  const Modal = ({ open, title, children }) => open ? <div role="dialog"><h2>{title}</h2>{children}</div> : null;
  const Tag = ({ children }) => <span>{children}</span>;
  const message = { useMessage: () => [{ warning: jest.fn(), success: jest.fn() }, null] };
  return { Button, Input, Modal, Tag, message };
});

import AssetInventoryMobilePrototype from './AssetInventoryMobilePrototype';

describe('AssetInventoryMobilePrototype', () => {
  test('工作台按状态分组并可进入资产详情', () => {
    render(<AssetInventoryMobilePrototype />);

    expect(screen.getAllByText('未盘').length).toBeGreaterThan(0);
    expect(screen.getAllByText('报失').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /戴尔\.Latitude E7280/ }));

    expect(screen.getByText('资产标签号')).toBeInTheDocument();
    expect(screen.getByText('114121801802')).toBeInTheDocument();
  });

  test('搜索会同步过滤资产和分组数量', () => {
    render(<AssetInventoryMobilePrototype />);

    fireEvent.change(screen.getByLabelText('搜索资产'), { target: { value: 'iphone' } });

    expect(screen.getByText('苹果.iphone 17')).toBeInTheDocument();
    expect(screen.queryByText('戴尔.Latitude E7280')).not.toBeInTheDocument();
    expect(screen.getByText('1 条')).toBeInTheDocument();
  });

  test('本人扫码提交后资产进入已盘', () => {
    render(<AssetInventoryMobilePrototype />);

    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描本人资产' }));
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    fireEvent.click(screen.getByRole('button', { name: '再接再厉' }));
    fireEvent.click(screen.getByRole('button', { name: '返回' }));

    expect(screen.getByText('已盘')).toBeInTheDocument();
    expect(screen.getByText('盘点人')).toBeInTheDocument();
  });

  test('报失必须填写原因并经过二次确认', () => {
    render(<AssetInventoryMobilePrototype />);

    fireEvent.click(screen.getByRole('button', { name: /苹果\.iphone 17/ }));
    fireEvent.click(screen.getByRole('button', { name: '报失' }));
    fireEvent.click(screen.getByRole('button', { name: '提交' }));

    expect(screen.queryByText('确认提交报失')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('报失原因'), { target: { value: '未在工位找到' } });
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('资产丢失需履行赔偿责任哟！确定不再继续寻找了吗？')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确定报失' }));

    expect(screen.getAllByText('报失').length).toBeGreaterThan(0);
  });

  test('快速扫描提交显示成功和失败数量', () => {
    render(<AssetInventoryMobilePrototype />);

    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    fireEvent.click(screen.getByRole('button', { name: '提交盘点结果' }));

    expect(screen.getByText('快速扫描结果')).toBeInTheDocument();
    expect(screen.getByText(/其中1条资产信息错误/)).toBeInTheDocument();
  });
});
