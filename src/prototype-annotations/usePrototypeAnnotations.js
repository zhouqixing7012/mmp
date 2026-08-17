import { useState, useRef } from 'react';
import { resolvePrototypeTarget } from './annotation-targeting';

export default function usePrototypeAnnotations() {
  const [enabled, setEnabled] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [highlightedTarget, setHighlightedTarget] = useState(null);
  const panelRef = useRef(null);

  const toggle = () => setEnabled((previous) => {
    if (previous) {
      setExpandedNoteId(null);
      setHighlightedTarget(null);
      document.querySelectorAll('.paf-target-highlight').forEach((element) => {
        element.classList.remove('paf-target-highlight');
      });
      return false;
    }
    return true;
  });

  const updateActiveNotes = (notes) => setActiveNotes(notes);

  const selectNote = (noteId, target) => {
    setExpandedNoteId(noteId);
    setHighlightedTarget(target);
    if (target) {
      const element = resolvePrototypeTarget(target);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  };

  const toggleExpand = (noteId) => {
    setExpandedNoteId((previous) => {
      const closing = previous === noteId;
      if (closing) setHighlightedTarget(null);
      return closing ? null : noteId;
    });
  };

  return {
    enabled,
    toggle,
    activeNotes,
    updateActiveNotes,
    expandedNoteId,
    selectNote,
    toggleExpand,
    highlightedTarget,
    panelRef,
  };
}
