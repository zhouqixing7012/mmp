import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectModal from './SelectModal';
import {
  findPrototypeBindingElement,
  getActivePrototypeOverlay,
  getPrototypeTargetMetadata,
} from '../prototype-annotations/annotation-targeting';

const PAGE_SCOPE = 'route:/selection-modal-test';

describe('SelectModal annotation semantics', () => {
  test('选择弹窗声明业务浮层并可按弹窗、搜索条件和结果列表标注', () => {
    render(
      <SelectModal
        open
        title="选择资产"
        onCancel={() => {}}
        onSelect={() => {}}
        searchFields={[{ name: 'tag', label: '资产标签号', dataIndex: 'tag' }]}
        columns={[{ title: '资产标签号', dataIndex: 'tag' }]}
        dataSource={[{ id: '1', tag: 'A001' }]}
      />
    );

    const overlay = document.querySelector('[data-prototype-overlay="select-modal"]');
    expect(overlay).toBeInTheDocument();
    expect(getActivePrototypeOverlay()).toBe(overlay);

    const title = screen.getByText('选择资产');
    const modalTarget = findPrototypeBindingElement(title);
    const modalMetadata = getPrototypeTargetMetadata(modalTarget, PAGE_SCOPE);
    expect(modalMetadata.kind).toBe('selection-modal');
    expect(modalMetadata.label).toBe('选择资产');

    const searchLabel = screen.getByText('资产标签号:');
    const searchTarget = findPrototypeBindingElement(searchLabel);
    const searchMetadata = getPrototypeTargetMetadata(searchTarget, PAGE_SCOPE);
    expect(searchMetadata.kind).toBe('selection-search-field');
    expect(searchMetadata.label).toBe('资产标签号');

    const resultCell = screen.getByText('A001');
    const tableTarget = findPrototypeBindingElement(resultCell);
    const tableMetadata = getPrototypeTargetMetadata(tableTarget, PAGE_SCOPE);
    expect(tableMetadata.kind).toBe('selection-table');
    expect(tableMetadata.label).toBe('选择资产列表');
  });
});
