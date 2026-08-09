import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, GripHorizontal, ChevronDown } from 'lucide-react';

const SOURCE_LABELS = {
  prd: 'PRD',
  confirmed: '已确认',
  observed: '实际观察',
  inferred: '推测',
};

export default function PrototypeAnnotationPanel({
  notes, expandedNoteId, onToggleExpand, onSelectNote, onClose, panelRef
}) {
  const [position, setPosition] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const scrollRef = useRef(null);

  // 初始化位置：右侧顶部
  useEffect(() => {
    if (position.x === null) {
      setPosition({ x: window.innerWidth - 420, y: 80 });
    }
  }, []);

  const onMouseDown = useCallback((e) => {
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      let nx = dragRef.current.posX + dx;
      let ny = dragRef.current.posY + dy;
      // 限制在视口内
      const pw = panelRef.current?.offsetWidth || 380;
      const ph = panelRef.current?.offsetHeight || 400;
      nx = Math.max(0, Math.min(nx, window.innerWidth - pw));
      ny = Math.max(0, Math.min(ny, window.innerHeight - ph));
      setPosition({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, panelRef]);

  return (
    <div
      ref={panelRef}
      className="paf-annotation-panel"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 380,
        maxHeight: 'calc(100vh - 40px)',
        zIndex: 10000,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        cursor: dragging ? 'grabbing' : 'default',
      }}
    >
      {/* 头部 */}
      <div
        className="paf-panel-header"
        onMouseDown={onMouseDown}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
          cursor: 'grab', userSelect: 'none',
          background: '#fafafa', borderRadius: '8px 8px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GripHorizontal size={16} color="#999" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>产品标注</span>
          <span style={{ fontSize: 12, color: '#999', background: '#f0f0f0', padding: '2px 8px', borderRadius: 10 }}>
            {notes.length} 项
          </span>
        </div>
        <div
          onClick={onClose}
          style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
          className="hover:bg-gray-200"
        >
          <X size={16} color="#666" />
        </div>
      </div>

      {/* 列表 */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {notes.map((note, idx) => (
          <div key={note.id}>
            <div
              className="paf-note-item"
              onClick={() => onSelectNote(note.id, note.target)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 16px', cursor: 'pointer',
                borderLeft: expandedNoteId === note.id ? '3px solid #1677ff' : '3px solid transparent',
                background: expandedNoteId === note.id ? '#f0f5ff' : 'transparent',
              }}
            >
              {/* 序号 */}
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#1677ff', color: '#fff',
                fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>{idx + 1}</span>
              {/* 内容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 2 }}>
                  {note.title}
                </div>
                <div style={{ fontSize: 12, color: '#999', lineHeight: 1.5, marginBottom: 4 }}>
                  {note.summary}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, background: '#fff7e6', color: '#d46b08',
                    padding: '1px 6px', borderRadius: 3,
                  }}>
                    {SOURCE_LABELS[note.summarySource] || note.summarySource}
                  </span>
                  <span style={{ fontSize: 11, color: '#bbb' }}>{note.kind}</span>
                  <ChevronDown
                    size={14}
                    color="#bbb"
                    style={{
                      marginLeft: 'auto',
                      transform: expandedNoteId === note.id ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(note.id); }}
                  />
                </div>
              </div>
            </div>

            {/* 展开详情 */}
            {expandedNoteId === note.id && note.sections && (
              <div style={{
                marginLeft: 50, marginRight: 16, marginBottom: 8,
                padding: '10px 14px', background: '#fafafa',
                borderRadius: 6, border: '1px solid #f0f0f0',
              }}>
                {note.sections.map((sec, si) => (
                  <div key={si} style={{ marginBottom: si < note.sections.length - 1 ? 10 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
                      {sec.title}
                    </div>
                    {sec.items.map((item, ii) => (
                      <div key={ii} style={{
                        fontSize: 12, color: '#666', lineHeight: 1.7,
                        paddingLeft: 8, borderLeft: '2px solid #e8e8e8',
                        marginBottom: 3,
                      }}>
                        {item.text}
                        <span style={{
                          fontSize: 10, color: '#aaa', marginLeft: 6,
                          background: '#f5f5f5', padding: '0 4px', borderRadius: 2,
                        }}>{SOURCE_LABELS[item.source] || item.source}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
