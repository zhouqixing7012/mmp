import { useCallback, useRef, useState } from 'react';
import { applySemanticActionAnchors } from './annotation-action-anchor-bridge';

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
    const pageScope = nextNotes.find((note) => typeof note?.pageKey === 'string')?.pageKey;

    // 以“当前真正活动的标注集合”为审批动作语义绑定的数据源。
    // 这样无论标注来自代码基线、本地覆盖、导入还是刚创建的内存态，
    // 都会在 PrototypeAnnotationLayer 的 scanAnchors 运行前先把唯一同名动作按钮挂成稳定 anchor。
    if (pageScope && typeof document !== 'undefined') {
      applySemanticActionAnchors(pageScope, nextNotes, document);
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
