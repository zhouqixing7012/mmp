import { useCallback, useRef, useState } from 'react';

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

  const updateActiveNotes = useCallback((notes) => setActiveNotes(notes), []);

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
