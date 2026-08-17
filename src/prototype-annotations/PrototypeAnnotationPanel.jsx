import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Download,
  GripHorizontal,
  Link2,
  Plus,
  Save,
  ScanLine,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  Button,
  Divider,
  Input,
  InputNumber,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd';

const { TextArea } = Input;

const SOURCE_LABELS = {
  prd: 'PRD',
  confirmed: '已确认',
  observed: '实际观察',
  inferred: '推测',
};

const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }));
const SIDE_OPTIONS = [
  { value: 'top', label: '上方' },
  { value: 'right', label: '右侧' },
  { value: 'bottom', label: '下方' },
  { value: 'left', label: '左侧' },
];
const ALIGN_OPTIONS = [
  { value: 'start', label: '起始' },
  { value: 'center', label: '居中' },
  { value: 'end', label: '末端' },
];

function FieldLabel({ children }) {
  return <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{children}</div>;
}

function AnnotationEditor({ note, onUpdateNote, onDeleteNote, onStartRebind, onCollapse }) {
  const updatePosition = (field, value) => {
    onUpdateNote(note.id, {
      position: {
        ...(note.position || {}),
        [field]: value,
      },
    });
  };

  const updateSections = (nextSections) => onUpdateNote(note.id, { sections: nextSections });

  const updateSectionTitle = (sectionIndex, value) => {
    const next = (note.sections || []).map((section, index) => (
      index === sectionIndex ? { ...section, title: value } : section
    ));
    updateSections(next);
  };

  const updateItem = (sectionIndex, itemIndex, patch) => {
    const next = (note.sections || []).map((section, index) => {
      if (index !== sectionIndex) return section;
      return {
        ...section,
        items: (section.items || []).map((item, currentIndex) => (
          currentIndex === itemIndex ? { ...item, ...patch } : item
        )),
      };
    });
    updateSections(next);
  };

  const addSection = () => {
    updateSections([...(note.sections || []), { title: '说明', items: [] }]);
  };

  const removeSection = (sectionIndex) => {
    updateSections((note.sections || []).filter((_, index) => index !== sectionIndex));
  };

  const addItem = (sectionIndex) => {
    const next = (note.sections || []).map((section, index) => (
      index === sectionIndex
        ? { ...section, items: [...(section.items || []), { text: '', source: 'confirmed' }] }
        : section
    ));
    updateSections(next);
  };

  const removeItem = (sectionIndex, itemIndex) => {
    const next = (note.sections || []).map((section, index) => (
      index === sectionIndex
        ? { ...section, items: (section.items || []).filter((_, currentIndex) => currentIndex !== itemIndex) }
        : section
    ));
    updateSections(next);
  };

  return (
    <div style={{ padding: '12px 16px', background: '#fafcff', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>编辑当前标注</div>
        <Button type="link" size="small" onClick={onCollapse}>收起编辑</Button>
      </div>

      <FieldLabel>标题</FieldLabel>
      <Input
        size="small"
        value={note.title}
        onChange={(event) => onUpdateNote(note.id, { title: event.target.value })}
      />

      <div style={{ marginTop: 10 }}>
        <FieldLabel>简要说明</FieldLabel>
        <TextArea
          value={note.summary}
          autoSize={{ minRows: 2, maxRows: 5 }}
          onChange={(event) => onUpdateNote(note.id, { summary: event.target.value })}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <div>
          <FieldLabel>来源</FieldLabel>
          <Select
            size="small"
            style={{ width: '100%' }}
            value={note.summarySource}
            options={SOURCE_OPTIONS}
            onChange={(value) => onUpdateNote(note.id, { summarySource: value })}
          />
        </div>
        <div>
          <FieldLabel>类型</FieldLabel>
          <Input
            size="small"
            value={note.kind}
            onChange={(event) => onUpdateNote(note.id, { kind: event.target.value })}
          />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <FieldLabel>绑定区域</FieldLabel>
        <Space.Compact block>
          <Input size="small" value={note.target} readOnly />
          <Button size="small" icon={<Link2 size={14} />} onClick={() => onStartRebind(note.id)}>
            重选
          </Button>
        </Space.Compact>
      </div>

      <div style={{ marginTop: 10 }}>
        <FieldLabel>标注位置</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Select
            size="small"
            value={note.position?.side || 'right'}
            options={SIDE_OPTIONS}
            onChange={(value) => updatePosition('side', value)}
          />
          <Select
            size="small"
            value={note.position?.align || 'center'}
            options={ALIGN_OPTIONS}
            onChange={(value) => updatePosition('align', value)}
          />
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            addonBefore="X"
            value={note.position?.offsetX || 0}
            onChange={(value) => updatePosition('offsetX', value || 0)}
          />
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            addonBefore="Y"
            value={note.position?.offsetY || 0}
            onChange={(value) => updatePosition('offsetY', value || 0)}
          />
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>详细说明</span>
        <Button type="link" size="small" icon={<Plus size={13} />} onClick={addSection}>增加分组</Button>
      </div>

      {(note.sections || []).map((section, sectionIndex) => (
        <div
          key={`${note.id}-section-${sectionIndex}`}
          style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: 8, marginBottom: 8, background: '#fff' }}
        >
          <Space.Compact block>
            <Input
              size="small"
              value={section.title}
              placeholder="分组标题"
              onChange={(event) => updateSectionTitle(sectionIndex, event.target.value)}
            />
            <Popconfirm title="删除这个分组？" onConfirm={() => removeSection(sectionIndex)}>
              <Button size="small" danger icon={<Trash2 size={13} />} />
            </Popconfirm>
          </Space.Compact>

          {(section.items || []).map((item, itemIndex) => (
            <div key={`${note.id}-item-${sectionIndex}-${itemIndex}`} style={{ marginTop: 8 }}>
              <TextArea
                value={item.text}
                autoSize={{ minRows: 1, maxRows: 4 }}
                placeholder="说明内容"
                onChange={(event) => updateItem(sectionIndex, itemIndex, { text: event.target.value })}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Select
                  size="small"
                  style={{ flex: 1 }}
                  value={item.source || 'confirmed'}
                  options={SOURCE_OPTIONS}
                  onChange={(value) => updateItem(sectionIndex, itemIndex, { source: value })}
                />
                <Button
                  size="small"
                  danger
                  type="text"
                  icon={<Trash2 size={13} />}
                  onClick={() => removeItem(sectionIndex, itemIndex)}
                />
              </div>
            </div>
          ))}

          <Button
            type="dashed"
            size="small"
            block
            icon={<Plus size={13} />}
            style={{ marginTop: 8 }}
            onClick={() => addItem(sectionIndex)}
          >
            增加说明
          </Button>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <Popconfirm
          title="删除这条标注？"
          description="删除后需重新导入或重置才能恢复。"
          onConfirm={() => onDeleteNote(note.id)}
        >
          <Button danger size="small" icon={<Trash2 size={14} />}>删除标注</Button>
        </Popconfirm>
      </div>
    </div>
  );
}

export default function PrototypeAnnotationPanel({
  notes,
  noteNumbers,
  matchedIds,
  expandedNoteId,
  onToggleExpand,
  onSelectNote,
  onClose,
  panelRef,
  editMode,
  onToggleEditMode,
  onUpdateNote,
  onDeleteNote,
  onCreateNote,
  onStartRebind,
  bindingMode,
  onCancelBinding,
  onSave,
  onReset,
  onImport,
  onExport,
  onExportAnchors,
  dirty,
}) {
  const [position, setPosition] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedNote = notes.find((note) => note.id === expandedNoteId) || null;
  const matchedCount = notes.filter((note) => matchedIds.has(note.id)).length;
  const panelWidth = editMode ? 440 : 380;

  const clampPanelPosition = useCallback((nextPosition) => {
    const width = editMode ? 440 : 380;
    const currentHeight = panelRef.current?.offsetHeight || Math.min(760, window.innerHeight - 48);
    return {
      x: Math.max(8, Math.min(nextPosition.x, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min(nextPosition.y, window.innerHeight - currentHeight - 8)),
    };
  }, [editMode, panelRef]);

  useEffect(() => {
    setPosition((previous) => {
      if (previous.x === null) {
        return {
          x: Math.max(8, window.innerWidth - panelWidth - 24),
          y: 24,
        };
      }
      return clampPanelPosition(previous);
    });
  }, [clampPanelPosition, panelWidth]);

  useEffect(() => {
    const onResize = () => {
      setPosition((previous) => {
        if (previous.x === null) return previous;
        return clampPanelPosition(previous);
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampPanelPosition]);

  useEffect(() => {
    if (!expandedNoteId) return;
    if (editMode) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const selectedRow = scrollRef.current?.querySelector(`[data-annotation-note-id="${expandedNoteId}"]`);
    selectedRow?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [editMode, expandedNoteId]);

  const onMouseDown = useCallback((event) => {
    setDragging(true);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      posX: position.x,
      posY: position.y,
    };
    event.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (event) => {
      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      setPosition(clampPanelPosition({
        x: dragRef.current.posX + dx,
        y: dragRef.current.posY + dy,
      }));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [clampPanelPosition, dragging]);

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      onImport(text);
      message.success('标注配置已导入');
    } catch (error) {
      message.error(error.message || '导入失败');
    }
  };

  const handleNoteClick = (note) => {
    if (expandedNoteId === note.id) {
      onToggleExpand(note.id);
      return;
    }
    onSelectNote(note.id, note.target);
  };

  return (
    <div
      ref={panelRef}
      className="paf-annotation-panel"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: panelWidth,
        height: 'min(760px, calc(100vh - 48px))',
        zIndex: 10000,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        cursor: dragging ? 'grabbing' : 'default',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .ant-tooltip,
        .ant-popover,
        .ant-select-dropdown {
          z-index: 12050 !important;
        }
        .paf-annotation-scroll {
          scrollbar-gutter: stable;
          overscroll-behavior: contain;
        }
      `}</style>

      <div
        className="paf-panel-header"
        onMouseDown={onMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid #f0f0f0',
          cursor: 'grab',
          userSelect: 'none',
          background: '#fafafa',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GripHorizontal size={16} color="#999" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>产品标注</span>
          {dirty && <Tag color="orange" style={{ marginInlineEnd: 0 }}>未保存</Tag>}
        </div>
        <div
          onMouseDown={(event) => event.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Segmented
            size="small"
            value={editMode ? 'edit' : 'view'}
            options={[{ label: '查看', value: 'view' }, { label: '编辑', value: 'edit' }]}
            onChange={(value) => onToggleEditMode(value === 'edit')}
          />
          <Button type="text" size="small" icon={<X size={16} />} onClick={onClose} />
        </div>
      </div>

      {editMode && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', background: '#fff', flexShrink: 0 }}>
          <Space size={4} wrap>
            <Tooltip title="新增标注后，在页面上点击需要绑定的区域" zIndex={12050}>
              <Button size="small" icon={<Plus size={14} />} onClick={onCreateNote}>新增</Button>
            </Tooltip>
            <Tooltip title="保存当前页面的标注修改" zIndex={12050}>
              <Button size="small" type="primary" icon={<Save size={14} />} onClick={onSave}>保存</Button>
            </Tooltip>
            <Tooltip title="导入标注 JSON" zIndex={12050}>
              <Button size="small" icon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>导入</Button>
            </Tooltip>
            <Tooltip title="导出当前标注配置" zIndex={12050}>
              <Button size="small" icon={<Download size={14} />} onClick={onExport}>导出标注</Button>
            </Tooltip>
            <Tooltip title="导出当前页面可用锚点" zIndex={12050}>
              <Button size="small" icon={<ScanLine size={14} />} onClick={onExportAnchors}>导出锚点</Button>
            </Tooltip>
            <Popconfirm
              title="恢复代码中的默认标注？"
              description="当前页面未导出的本地修改会被清除。"
              onConfirm={onReset}
            >
              <Button size="small">重置</Button>
            </Popconfirm>
          </Space>
          <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleImportFile} />
        </div>
      )}

      {bindingMode && (
        <div
          style={{
            padding: '8px 12px',
            background: '#fffbe6',
            borderBottom: '1px solid #ffe58f',
            fontSize: 12,
            color: '#8c6d1f',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span>{bindingMode.type === 'create' ? '请在页面上点击要新增标注的区域' : '请在页面上点击新的绑定区域'}</span>
          <Button type="link" size="small" onClick={onCancelBinding}>取消</Button>
        </div>
      )}

      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#888',
          display: 'flex',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span>共 {notes.length} 项</span>
        <span style={{ color: '#389e0d' }}>已匹配 {matchedCount}</span>
        <span style={{ color: notes.length - matchedCount > 0 ? '#d46b08' : '#999' }}>
          未匹配 {notes.length - matchedCount}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="paf-annotation-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        {editMode && selectedNote && (
          <AnnotationEditor
            note={selectedNote}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            onStartRebind={onStartRebind}
            onCollapse={() => onToggleExpand(selectedNote.id)}
          />
        )}

        <div style={{ padding: '8px 0' }}>
          {notes.map((note) => {
            const number = noteNumbers.get(note.id);
            const matched = matchedIds.has(note.id);
            const expanded = expandedNoteId === note.id;

            return (
              <div key={note.id} data-annotation-note-id={note.id}>
                <div
                  className="paf-note-item"
                  onClick={() => handleNoteClick(note)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderLeft: expanded ? '3px solid #1677ff' : '3px solid transparent',
                    background: expanded ? '#f0f5ff' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: matched ? '#1677ff' : '#f5f5f5',
                      color: matched ? '#fff' : '#999',
                      border: matched ? 'none' : '1px solid #d9d9d9',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {number || '-'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{note.title}</span>
                      {!matched && <Tag color="orange" style={{ marginInlineEnd: 0 }}>未匹配</Tag>}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', lineHeight: 1.5, marginBottom: 4 }}>
                      {note.summary || '-'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 11,
                          background: '#fff7e6',
                          color: '#d46b08',
                          padding: '1px 6px',
                          borderRadius: 3,
                        }}
                      >
                        {SOURCE_LABELS[note.summarySource] || note.summarySource}
                      </span>
                      <span style={{ fontSize: 11, color: '#bbb' }}>{note.kind}</span>
                      <ChevronDown
                        size={14}
                        color="#bbb"
                        style={{
                          marginLeft: 'auto',
                          transform: expanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (expanded) onToggleExpand(note.id);
                          else onSelectNote(note.id, note.target);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {!editMode && expanded && note.sections?.length > 0 && (
                  <div
                    style={{
                      marginLeft: 50,
                      marginRight: 16,
                      marginBottom: 8,
                      padding: '10px 14px',
                      background: '#fafafa',
                      borderRadius: 6,
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    {note.sections.map((section, sectionIndex) => (
                      <div
                        key={`${note.id}-detail-${sectionIndex}`}
                        style={{ marginBottom: sectionIndex < note.sections.length - 1 ? 10 : 0 }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
                          {section.title}
                        </div>
                        {(section.items || []).map((item, itemIndex) => (
                          <div
                            key={`${note.id}-detail-item-${sectionIndex}-${itemIndex}`}
                            style={{
                              fontSize: 12,
                              color: '#666',
                              lineHeight: 1.7,
                              paddingLeft: 8,
                              borderLeft: '2px solid #e8e8e8',
                              marginBottom: 3,
                            }}
                          >
                            {item.text}
                            <span
                              style={{
                                fontSize: 10,
                                color: '#aaa',
                                marginLeft: 6,
                                background: '#f5f5f5',
                                padding: '0 4px',
                                borderRadius: 2,
                              }}
                            >
                              {SOURCE_LABELS[item.source] || item.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
