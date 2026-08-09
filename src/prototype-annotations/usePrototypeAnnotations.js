import { useState, useCallback, useRef, useEffect } from 'react';

export default function usePrototypeAnnotations() {
  const [enabled, setEnabled] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [highlightedTarget, setHighlightedTarget] = useState(null);
  const panelRef = useRef(null);

  const toggle = () => setEnabled(prev => {
    if (prev) {
      // 关闭时清理所有状态
      setExpandedNoteId(null);
      setHighlightedTarget(null);
      // 移除所有残留高亮
      document.querySelectorAll('.paf-target-highlight').forEach(el =>
        el.classList.remove('paf-target-highlight')
      );
      return false;
    }
    return true;
  });

  const updateActiveNotes = (notes) => setActiveNotes(notes);

  const selectNote = (noteId, target) => {
    setExpandedNoteId(noteId);
    setHighlightedTarget(target);
    if (target) {
      const el = document.querySelector(`[data-prototype-anchor="${target}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleExpand = (noteId) =>
    setExpandedNoteId(prev => prev === noteId ? null : noteId);

  return { enabled, toggle, activeNotes, updateActiveNotes, expandedNoteId,
    selectNote, toggleExpand, highlightedTarget, panelRef };
}
