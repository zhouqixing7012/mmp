import { useCallback, useRef, useState } from 'react';
import { setActiveSemanticActionAnnotations } from './annotation-action-anchor-bridge';

export default function usePrototypeAnnotations() {
  const [enabled, setEnabled] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [highlightedTarget, setHighlightedTarget] = useState(null);
  const panelRef = useRef(null);

  const clearSelection = useCallback(() => {
    setExpandedNoteId(null);
    setHighlightedTarget(null);
    document.querySelectorAll('.paf-target-highlight').forEach((element) => {
      element.classList.remove('paf-target-highlight');
    });
  }, []);

  const toggle = useCallback(() => setEnabled((previous) => {
    if (previous) {
      setExpandedNoteId(null);
      setHighlightedTarget(null);
      document.querySelectorAll('.paf-target-highlight').forEach((element) => {
        element.classList.remove('paf-target-highlight');
      });
      return false;
    }
    return true;
  }), []);

  const updateActiveNotes = useCallback((notes) => {
    const nextNotes = Array.isArray(notes) ? notes : [];
    const pageScope = nextNotes.find((note) => typeof note?.pageKey === 'string')?.pageKey || '';

    // active annotations 是运行时唯一可信的数据源：同步保存给 semantic bridge，
    // 后续即使业务页按钮晚一拍挂载、同一路由切换页面或 React 复用 DOM，
    // MutationObserver 也会基于当前页标注重新挂 anchor，并清掉旧页 stale anchor。
    if (typeof document !== 'undefined') {
      setActiveSemanticActionAnnotations(pageScope, nextNotes, document);
    }

    setActiveNotes(nextNotes);
  }, []);

  const selectNote = useCallback((noteId, target) => {
    setExpandedNoteId(noteId);
    setHighlightedTarget(target);
  }, []);

  const toggleExpand = useCallback((noteId) => {
    setExpandedNoteId((previous) => {
      const closing = previous === noteId;
      if (closing) setHighlightedTarget(null);
      return closing ? null : noteId;
    });
  }, []);

  return {
    enabled,
    toggle,
    activeNotes,
    updateActiveNotes,
    expandedNoteId,
    selectNote,
    clearSelection,
    toggleExpand,
    highlightedTarget,
    panelRef,
  };
}
