import React, { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PrototypeAnnotationPanel from './PrototypeAnnotationPanel';

const NOTE = {
  id: 'note-1',
  target: 'material-query-bar',
  title: '测试标注',
  summary: '用于测试**面板交互**',
  summarySource: 'prd',
  kind: 'module',
  position: { side: 'right', align: 'center', gap: 8, offsetX: 0, offsetY: 0 },
  sections: [
    {
      title: '字段说明',
      items: [
        { text: '第一条详细字段内容', source: 'confirmed' },
        { text: '第二条详细字段内容', source: 'prd' },
      ],
    },
  ],
};

const DYNAMIC_NOTE = {
  ...NOTE,
  id: 'borrowing-apply-notice-read',
  target: 'modal-button',
  title: '弹窗标注',
  context: { targetLifecycle: 'overlay' },
};

function PanelHarness({
  editMode = false,
  initiallyExpanded = false,
  onClose = () => {},
  notes = [NOTE],
  matchedIds = new Set([NOTE.id]),
}) {
  const [expandedNoteId, setExpandedNoteId] = useState(initiallyExpanded ? notes[0]?.id : null);
  const panelRef = createRef();

  const toggleExpand = (noteId) => {
    setExpandedNoteId((previous) => previous === noteId ? null : noteId);
  };

  return (
    <PrototypeAnnotationPanel
      notes={notes}
      noteNumbers={new Map(notes.map((note, index) => [note.id, index + 1]))}
      matchedIds={matchedIds}
      expandedNoteId={expandedNoteId}
      onToggleExpand={toggleExpand}
      onSelectNote={(noteId) => setExpandedNoteId(noteId)}
      onClose={onClose}
      panelRef={panelRef}
      editMode={editMode}
      onToggleEditMode={() => {}}
      onUpdateNote={() => {}}
      onDeleteNote={() => {}}
      onCreateNote={() => {}}
      onStartRebind={() => {}}
      bindingMode={null}
      onCancelBinding={() => {}}
      onSave={() => {}}
      onReset={() => {}}
      onImport={() => {}}
      onExport={() => {}}
      onExportAnchors={() => {}}
      dirty={false}
    />
  );
}

describe('PrototypeAnnotationPanel', () => {
  test('面板 Portal 到 body 且内容区始终可滚动', () => {
    render(<PanelHarness />);

    const panel = document.body.querySelector('.paf-annotation-panel');
    const scrollArea = document.body.querySelector('.paf-annotation-scroll');

    expect(panel).toBeInTheDocument();
    expect(panel.parentElement).toBe(document.body);
    expect(scrollArea).toBeInTheDocument();
    expect(scrollArea).toHaveStyle('overflow-y: scroll');
    expect(scrollArea).toHaveStyle('min-height: 0');
  });

  test('查看态点击同一条标注即可展开并再次点击收起，不显示额外收起按钮', () => {
    render(<PanelHarness />);

    const title = screen.getByText('测试标注');
    fireEvent.click(title);
    expect(screen.getByText('第一条详细字段内容')).toBeInTheDocument();
    expect(screen.getByText('第二条详细字段内容')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '收起' })).not.toBeInTheDocument();

    fireEvent.click(title);
    expect(screen.queryByText('第一条详细字段内容')).not.toBeInTheDocument();
  });

  test('查看态普通条目默认按项目符号展示且保留来源', () => {
    render(<PanelHarness initiallyExpanded />);

    expect(screen.getAllByText('•')).toHaveLength(2);
    expect(screen.getAllByText('PRD').length).toBeGreaterThan(0);
  });

  test('弹窗关闭造成的动态目标不计入真未匹配', () => {
    render(<PanelHarness notes={[NOTE, DYNAMIC_NOTE]} matchedIds={new Set([NOTE.id])} />);

    expect(screen.getByText('已匹配 1')).toBeInTheDocument();
    expect(screen.getByText('动态目标 1')).toBeInTheDocument();
    expect(screen.getByText('真未匹配 0')).toBeInTheDocument();
    expect(screen.getByText('需打开弹窗')).toBeInTheDocument();
    expect(screen.queryByText(/^未匹配$/)).not.toBeInTheDocument();
  });

  test('编辑态可以显式收起编辑区', () => {
    render(<PanelHarness editMode initiallyExpanded />);

    expect(screen.getByText('编辑当前标注')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '收起编辑' }));
    expect(screen.queryByText('编辑当前标注')).not.toBeInTheDocument();
  });

  test('最小化只收起面板，不退出标注模式，并可恢复', () => {
    const onClose = jest.fn();
    render(<PanelHarness onClose={onClose} />);

    const collapseButton = screen.getByRole('button', { name: '收起产品标注面板' });
    expect(collapseButton).toHaveTextContent('收起');
    fireEvent.click(collapseButton);

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.querySelector('.paf-annotation-panel-minimized')).toBeInTheDocument();
    expect(screen.queryByText('测试标注')).not.toBeInTheDocument();
    expect(screen.getByText('产品标注')).toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: '展开产品标注面板' });
    expect(expandButton).toHaveTextContent('展开');
    fireEvent.click(expandButton);

    expect(document.body.querySelector('.paf-annotation-panel-minimized')).not.toBeInTheDocument();
    expect(screen.getByText('测试标注')).toBeInTheDocument();
  });
});