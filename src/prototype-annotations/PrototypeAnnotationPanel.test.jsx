import React, { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PrototypeAnnotationPanel from './PrototypeAnnotationPanel';

const NOTE = {
  id: 'note-1',
  target: 'material-query-bar',
  title: '测试标注',
  summary: '用于测试面板交互',
  summarySource: 'prd',
  kind: 'module',
  position: { side: 'right', align: 'center', gap: 8, offsetX: 0, offsetY: 0 },
  sections: [
    {
      title: '字段说明',
      items: [{ text: '详细字段内容', source: 'confirmed' }],
    },
  ],
};

function PanelHarness({ editMode = false, initiallyExpanded = false }) {
  const [expandedNoteId, setExpandedNoteId] = useState(initiallyExpanded ? NOTE.id : null);
  const panelRef = createRef();

  const toggleExpand = (noteId) => {
    setExpandedNoteId((previous) => previous === noteId ? null : noteId);
  };

  return (
    <PrototypeAnnotationPanel
      notes={[NOTE]}
      noteNumbers={new Map([[NOTE.id, 1]])}
      matchedIds={new Set([NOTE.id])}
      expandedNoteId={expandedNoteId}
      onToggleExpand={toggleExpand}
      onSelectNote={(noteId) => setExpandedNoteId(noteId)}
      onClose={() => {}}
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

  test('查看态展开后可以通过显式收起按钮关闭', () => {
    render(<PanelHarness />);

    fireEvent.click(screen.getByText('测试标注'));
    expect(screen.getByText('详细字段内容')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '收起' }));
    expect(screen.queryByText('详细字段内容')).not.toBeInTheDocument();
  });

  test('编辑态可以显式收起编辑区', () => {
    render(<PanelHarness editMode initiallyExpanded />);

    expect(screen.getByText('编辑当前标注')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '收起编辑' }));
    expect(screen.queryByText('编辑当前标注')).not.toBeInTheDocument();
  });
});
