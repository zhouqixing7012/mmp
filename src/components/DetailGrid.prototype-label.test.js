import React from 'react';
import { toPrototypeLabel } from './DetailGrid';

function RequiredLabel({ children }) {
  return <span><span className="text-red-500">*</span> {children}</span>;
}

describe('DetailGrid prototype label normalization', () => {
  test('必填 JSX label 提取业务字段名并去掉星号', () => {
    const label = <><span className="text-red-500">*</span> 退库原因</>;
    expect(toPrototypeLabel(label)).toBe('退库原因');
  });

  test('自定义 RequiredLabel 组件也保留 children 作为业务字段名', () => {
    expect(toPrototypeLabel(<RequiredLabel>电话号码</RequiredLabel>)).toBe('电话号码');
  });

  test('普通字符串和冒号保持兼容', () => {
    expect(toPrototypeLabel('审批意见：')).toBe('审批意见');
  });
});
