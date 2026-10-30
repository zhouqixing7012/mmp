import React from 'react';
import { render, screen } from '@testing-library/react';
import ApplicationStatus from './ApplicationStatus';

test('单据状态复用同一业务标签，数字编码不翻成是或否，未知名称保留', () => {
  const { rerender } = render(<ApplicationStatus value="处理中" />);
  const processingStyle = screen.getByText('处理中').closest('.ant-tag').getAttribute('style');
  rerender(<ApplicationStatus value="已完成" />);
  expect(screen.getByText('已完成').closest('.ant-tag').getAttribute('style')).not.toBe(processingStyle);
  rerender(<ApplicationStatus value={0} />);
  expect(screen.getByText('0').closest('.ant-tag')).not.toBeNull();
  expect(screen.queryByText('否')).not.toBeInTheDocument();
  rerender(<ApplicationStatus value="未定义名称" />);
  expect(screen.getByText('未定义名称').closest('.ant-tag')).not.toBeNull();
});
test.each([null, undefined, '', ' ', '-'])('空状态%s显示缺省而非状态标签', value => {
  const { container } = render(<ApplicationStatus value={value} />);
  expect(container).toHaveTextContent('-');
  expect(container.querySelector('.ant-tag')).toBeNull();
});
