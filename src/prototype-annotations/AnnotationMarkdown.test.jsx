import React from 'react';
import { render, screen } from '@testing-library/react';
import AnnotationMarkdown, { AnnotationInlineMarkdown, hasBlockMarkdown } from './AnnotationMarkdown';

describe('AnnotationMarkdown', () => {
  test('支持基础行内 Markdown 和转义字符', () => {
    render(<AnnotationInlineMarkdown text={'申请原因**必填**，字段使用 `readonly`，中间位数使用 \\* 隐藏'} />);

    expect(screen.getByText('必填').tagName).toBe('STRONG');
    expect(screen.getByText('readonly').tagName).toBe('CODE');
    expect(screen.getByText(/中间位数使用 \* 隐藏/)).toBeInTheDocument();
    expect(screen.queryByText(/\\\*/)).not.toBeInTheDocument();
  });

  test('支持无序列表', () => {
    render(<AnnotationMarkdown text={'- 第一条规则\n- 第二条规则'} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('第一条规则')).toBeInTheDocument();
    expect(screen.getByText('第二条规则')).toBeInTheDocument();
    expect(hasBlockMarkdown('- 第一条规则')).toBe(true);
  });

  test('支持 Markdown 表格', () => {
    render(<AnnotationMarkdown text={'| 字段 | 规则 |\n| --- | --- |\n| 申请原因 | 必填 |\n| 身份证号 | 只读 |'} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('申请原因')).toBeInTheDocument();
    expect(screen.getByText('只读')).toBeInTheDocument();
  });
});
