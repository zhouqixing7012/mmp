import React, { useMemo, useEffect, useState, useCallback } from 'react';
import PrototypeAnnotationPanel from './PrototypeAnnotationPanel';
import usePrototypeAnnotations from './usePrototypeAnnotations';

// 所有标注数据
import yewurulesAnnotations from './annotation-data';

// 按页面 key 组织的数据
const ALL_ANNOTATIONS = {
  yewurules: yewurulesAnnotations,
};

// 从 DOM 中检测当前页面 key
function detectPageKey() {
  const path = window.location.pathname;
  if (path === '/yewurules' || path.startsWith('/yewurules')) return 'yewurules';
  return null;
}

export default function PrototypeAnnotationLayer() {
  const ann = usePrototypeAnnotations();
  const [pageKey, setPageKey] = useState(detectPageKey);
  const [hotspots, setHotspots] = useState([]);

  // 监听路由变化
  useEffect(() => {
    const check = () => setPageKey(detectPageKey());
    window.addEventListener('popstate', check);
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function(...args) {
      origPush.apply(this, args);
      check();
    };
    window.history.replaceState = function(...args) {
      origReplace.apply(this, args);
      check();
    };
    return () => {
      window.removeEventListener('popstate', check);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  // 根据 pageKey 获取当前页面的所有标注
  const pageAnnotations = useMemo(() => {
    if (!pageKey) return [];
    return ALL_ANNOTATIONS[pageKey] || [];
  }, [pageKey]);

  // 刷新：扫描 DOM 中实际存在的 anchor，生成热点位置
  const refresh = useCallback(() => {
    if (!ann.enabled) { setHotspots([]); return; }
    const hs = pageAnnotations.map(note => {
      const el = document.querySelector(`[data-prototype-anchor="${note.target}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        id: note.id,
        target: note.target,
        title: note.title,
        x: rect.right + 8,
        y: rect.top + rect.height / 2,
      };
    }).filter(Boolean);
    setHotspots(hs);
  }, [ann.enabled, pageAnnotations]);

  // 从 hotspots 推导当前可见的标注列表
  const visibleAnnotations = useMemo(() => {
    const ids = new Set(hotspots.map(h => h.id));
    return pageAnnotations.filter(n => ids.has(n.id));
  }, [pageAnnotations, hotspots]);

  // 更新活跃标注列表
  useEffect(() => {
    ann.updateActiveNotes(pageAnnotations);
  }, [pageAnnotations]);

  // 标注模式开启时：初始化 + 监听 DOM 变化
  useEffect(() => {
    if (!ann.enabled) return;
    // 用 rAF 确保 React 渲染完再查 DOM
    requestAnimationFrame(() => refresh());
    const onUpdate = () => requestAnimationFrame(() => refresh());
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    const mo = new MutationObserver(onUpdate);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
      mo.disconnect();
    };
  }, [ann.enabled, pageAnnotations, refresh]);

  // 高亮目标元素
  useEffect(() => {
    document.querySelectorAll('.paf-target-highlight').forEach(el => {
      el.classList.remove('paf-target-highlight');
    });
    if (!ann.enabled || !ann.highlightedTarget) return;
    const targetEl = document.querySelector(`[data-prototype-anchor="${ann.highlightedTarget}"]`);
    if (!targetEl) return;
    targetEl.classList.add('paf-target-highlight');
  }, [ann.highlightedTarget, ann.enabled]);

  if (!pageKey) return null;

  return (
    <>
      {/* 标注开关 */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 8,
        background: ann.enabled ? '#1677ff' : '#fff',
        color: ann.enabled ? '#fff' : '#333',
        border: '1px solid #d9d9d9',
        borderRadius: 20, padding: '6px 16px',
        cursor: 'pointer', fontSize: 13, fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        userSelect: 'none',
      }} onClick={ann.toggle}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: ann.enabled ? '#52c41a' : '#d9d9d9',
          transition: 'background 0.2s',
        }} />
        标注
      </div>

      {/* 热点覆盖层 */}
      {ann.enabled && hotspots.map((hs, idx) => (
        <div
          key={hs.id}
          className="paf-hotspot"
          onClick={() => ann.selectNote(hs.id, hs.target)}
          style={{
            position: 'fixed',
            left: hs.x - 11,
            top: hs.y - 11,
            width: 22, height: 22,
            borderRadius: '50%',
            background: ann.expandedNoteId === hs.id ? '#1677ff' : '#ff7a00',
            border: '2px solid #fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 9998,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', fontWeight: 700,
            lineHeight: 1,
            transition: 'transform 0.15s, background 0.15s',
            transform: ann.expandedNoteId === hs.id ? 'scale(1.25)' : 'scale(1)',
          }}
          title={hs.title}
        >{idx + 1}</div>
      ))}

      {/* 说明面板 */}
      {ann.enabled && (
        <PrototypeAnnotationPanel
          notes={visibleAnnotations}
          expandedNoteId={ann.expandedNoteId}
          onToggleExpand={ann.toggleExpand}
          onSelectNote={ann.selectNote}
          onClose={ann.toggle}
          panelRef={ann.panelRef}
        />
      )}

      <style>{`
        .paf-target-highlight {
          outline: 3px solid #1677ff !important;
          outline-offset: 2px;
          border-radius: 4px;
          position: relative;
          z-index: 1;
          animation: paf-pulse 1.5s ease-in-out infinite;
        }
        @keyframes paf-pulse {
          0%, 100% { outline-color: #1677ff; }
          50% { outline-color: #69b1ff; }
        }
      `}</style>
    </>
  );
}
