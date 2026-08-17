import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PrototypeAnnotationPanel from './PrototypeAnnotationPanel';
import usePrototypeAnnotations from './usePrototypeAnnotations';
import { computeHotspotPosition, normalizeAnnotationPosition } from './annotation-positioning';
import { buildAnnotationNumberMap } from './annotation-numbering';
import {
  normalizeAnnotationCollection,
  readAnnotationDraft,
  resetAnnotationDraft,
  serializeAnnotationExport,
  writeAnnotationDraft,
} from './annotation-storage';
import { serializePrototypeAnchorContext } from './annotation-anchor-scanner';

import yewurulesAnnotations from './annotation-data';

const ALL_ANNOTATIONS = {
  yewurules: yewurulesAnnotations,
};

function detectPageKey(pathname) {
  if (pathname === '/yewurules' || pathname.startsWith('/yewurules')) return 'yewurules';
  return null;
}

function findAnchor(target) {
  return document.querySelector(`[data-prototype-anchor="${target}"]`);
}

function sameAnchors(previous, next) {
  if (previous.length !== next.length) return false;
  return previous.every((item, index) => (
    item.note === next[index].note && item.element === next[index].element
  ));
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function PrototypeAnnotationHotspot({
  note,
  element,
  number,
  selected,
  editMode,
  layoutVersion,
  onSelect,
  onMove,
}) {
  const hotspotRef = useRef(null);
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [coordinates, setCoordinates] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    const hotspot = hotspotRef.current;
    if (!element || !hotspot || !element.isConnected) {
      setCoordinates(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;

    if (!isVisible) {
      setCoordinates(null);
      return;
    }

    const hotspotRect = hotspot.getBoundingClientRect();
    const next = computeHotspotPosition(
      rect,
      { width: window.innerWidth, height: window.innerHeight },
      { width: hotspotRect.width || 22, height: hotspotRect.height || 22 },
      note.position
    );

    setCoordinates((previous) => {
      if (
        previous &&
        Math.abs(previous.left - next.left) < 0.5 &&
        Math.abs(previous.top - next.top) < 0.5 &&
        previous.side === next.side
      ) {
        return previous;
      }
      return next;
    });
  }, [element, note.position]);

  const scheduleUpdate = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  useEffect(() => {
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleUpdate);

    if (resizeObserver) {
      resizeObserver.observe(element);
      if (hotspotRef.current) resizeObserver.observe(hotspotRef.current);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [element, scheduleUpdate]);

  useEffect(() => {
    scheduleUpdate();
  }, [layoutVersion, scheduleUpdate]);

  const handlePointerDown = (event) => {
    if (!editMode || event.button !== 0) return;
    const position = normalizeAnnotationPosition(note.position);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: position.offsetX,
      offsetY: position.offsetY,
    };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const x = event.clientX - drag.startX;
    const y = event.clientY - drag.startY;
    if (Math.abs(x) > 2 || Math.abs(y) > 2) suppressClickRef.current = true;
    setDragOffset({ x, y });
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const x = event.clientX - drag.startX;
    const y = event.clientY - drag.startY;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
    setDragOffset({ x: 0, y: 0 });

    if (suppressClickRef.current) {
      onMove(note.id, {
        offsetX: drag.offsetX + x,
        offsetY: drag.offsetY + y,
      });
    }
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelect(note.id, note.target);
  };

  const showHotspot = Boolean(coordinates) && Number.isInteger(number);
  const scale = selected ? 1.25 : 1;

  return (
    <div
      ref={hotspotRef}
      className="paf-hotspot"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      data-placement-side={coordinates?.side || note.position?.side || 'right'}
      title={editMode ? `${note.title}（拖动可调整位置）` : note.title}
      style={{
        position: 'fixed',
        left: coordinates?.left ?? -9999,
        top: coordinates?.top ?? -9999,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: selected ? '#1677ff' : '#ff7a00',
        border: '2px solid #fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        zIndex: 9998,
        cursor: editMode ? 'grab' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        color: '#fff',
        fontWeight: 700,
        lineHeight: 1,
        opacity: showHotspot ? 1 : 0,
        pointerEvents: showHotspot ? 'auto' : 'none',
        transition: dragRef.current ? 'none' : 'transform 0.15s, background 0.15s, opacity 0.12s',
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${scale})`,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {number}
    </div>
  );
}

export default function PrototypeAnnotationLayer() {
  const location = useLocation();
  const ann = usePrototypeAnnotations();
  const pageKey = useMemo(() => detectPageKey(location.pathname), [location.pathname]);
  const baseAnnotations = useMemo(() => (pageKey ? ALL_ANNOTATIONS[pageKey] || [] : []), [pageKey]);
  const [pageAnnotations, setPageAnnotations] = useState([]);
  const [anchoredNotes, setAnchoredNotes] = useState([]);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [bindingMode, setBindingMode] = useState(null);

  useEffect(() => {
    if (!pageKey) {
      setPageAnnotations([]);
      setDirty(false);
      setBindingMode(null);
      return;
    }
    setPageAnnotations(readAnnotationDraft(pageKey, baseAnnotations));
    setDirty(false);
    setBindingMode(null);
  }, [baseAnnotations, pageKey]);

  const updateAnnotations = useCallback((updater) => {
    setPageAnnotations((previous) => (
      typeof updater === 'function' ? updater(previous) : updater
    ));
    setDirty(true);
  }, []);

  const handleUpdateNote = useCallback((noteId, patch) => {
    updateAnnotations((previous) => previous.map((note) => (
      note.id === noteId ? { ...note, ...patch } : note
    )));
  }, [updateAnnotations]);

  const handleMoveNote = useCallback((noteId, offsetPatch) => {
    updateAnnotations((previous) => previous.map((note) => {
      if (note.id !== noteId) return note;
      return {
        ...note,
        position: {
          ...normalizeAnnotationPosition(note.position),
          ...offsetPatch,
        },
      };
    }));
  }, [updateAnnotations]);

  const handleDeleteNote = useCallback((noteId) => {
    updateAnnotations((previous) => previous.filter((note) => note.id !== noteId));
    if (ann.expandedNoteId === noteId) ann.selectNote(null, null);
  }, [ann, updateAnnotations]);

  const handleSave = useCallback(() => {
    if (!pageKey) return;
    const saved = writeAnnotationDraft(pageKey, pageAnnotations);
    setPageAnnotations(saved);
    setDirty(false);
  }, [pageAnnotations, pageKey]);

  const handleReset = useCallback(() => {
    if (!pageKey) return;
    setPageAnnotations(resetAnnotationDraft(pageKey, baseAnnotations));
    setDirty(false);
    setBindingMode(null);
    ann.selectNote(null, null);
  }, [ann, baseAnnotations, pageKey]);

  const handleImport = useCallback((text) => {
    const payload = JSON.parse(text);
    const imported = normalizeAnnotationCollection(payload, pageKey);
    setPageAnnotations(imported);
    setDirty(true);
    setBindingMode(null);
  }, [pageKey]);

  const handleExport = useCallback(() => {
    if (!pageKey) return;
    downloadTextFile(`${pageKey}-annotations.json`, serializeAnnotationExport(pageKey, pageAnnotations));
  }, [pageAnnotations, pageKey]);

  const handleExportAnchors = useCallback(() => {
    if (!pageKey) return;
    downloadTextFile(`${pageKey}-anchors.json`, serializePrototypeAnchorContext(pageKey, location.pathname));
  }, [location.pathname, pageKey]);

  const scanAnchors = useCallback(() => {
    if (!ann.enabled) {
      setAnchoredNotes([]);
      return;
    }

    const next = pageAnnotations
      .map((note) => ({ note, element: findAnchor(note.target) }))
      .filter((item) => item.element);

    setAnchoredNotes((previous) => sameAnchors(previous, next) ? previous : next);
    setLayoutVersion((version) => version + 1);
  }, [ann.enabled, pageAnnotations]);

  useEffect(() => {
    ann.updateActiveNotes(pageAnnotations);
  }, [pageAnnotations]);

  useEffect(() => {
    if (!ann.enabled) {
      setAnchoredNotes([]);
      return undefined;
    }

    let frame = null;
    const scheduleScan = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        scanAnchors();
      });
    };

    scheduleScan();

    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [ann.enabled, pageAnnotations, scanAnchors]);

  const matchedIds = useMemo(() => (
    new Set(anchoredNotes.map((item) => item.note.id))
  ), [anchoredNotes]);

  const noteNumbers = useMemo(() => (
    buildAnnotationNumberMap(pageAnnotations)
  ), [pageAnnotations]);

  useEffect(() => {
    document.querySelectorAll('.paf-target-highlight').forEach((element) => {
      element.classList.remove('paf-target-highlight');
    });

    if (!ann.enabled || !ann.highlightedTarget) return;
    const target = findAnchor(ann.highlightedTarget);
    if (target) target.classList.add('paf-target-highlight');
  }, [ann.highlightedTarget, ann.enabled, layoutVersion]);

  useEffect(() => {
    if (!bindingMode || !editMode) return undefined;

    let candidate = null;
    const clearCandidate = () => {
      candidate?.classList.remove('paf-bind-target-candidate');
      candidate = null;
    };

    const findCandidate = (eventTarget) => {
      if (!(eventTarget instanceof Element)) return null;
      if (eventTarget.closest('.paf-annotation-panel') || eventTarget.closest('.paf-hotspot')) return null;
      return eventTarget.closest('[data-prototype-anchor]');
    };

    const onPointerMove = (event) => {
      const nextCandidate = findCandidate(event.target);
      if (nextCandidate === candidate) return;
      clearCandidate();
      candidate = nextCandidate;
      candidate?.classList.add('paf-bind-target-candidate');
    };

    const onClick = (event) => {
      const targetElement = findCandidate(event.target);
      if (!targetElement) return;
      const target = targetElement.getAttribute('data-prototype-anchor');
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();

      if (bindingMode.type === 'create') {
        const noteId = `annotation-${Date.now().toString(36)}`;
        const newNote = {
          id: noteId,
          pageKey,
          target,
          context: {},
          kind: 'module',
          position: normalizeAnnotationPosition({ side: 'right', align: 'center', gap: 8 }),
          title: '新标注',
          summary: '',
          summarySource: 'confirmed',
          sections: [],
        };
        updateAnnotations((previous) => [...previous, newNote]);
        ann.selectNote(noteId, target);
      } else if (bindingMode.type === 'rebind' && bindingMode.noteId) {
        handleUpdateNote(bindingMode.noteId, { target });
        ann.selectNote(bindingMode.noteId, target);
      }

      clearCandidate();
      setBindingMode(null);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        clearCandidate();
        setBindingMode(null);
      }
    };

    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearCandidate();
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ann, bindingMode, editMode, handleUpdateNote, pageKey, updateAnnotations]);

  useEffect(() => {
    if (!editMode) setBindingMode(null);
  }, [editMode]);

  if (!pageKey) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: ann.enabled ? '#1677ff' : '#fff',
          color: ann.enabled ? '#fff' : '#333',
          border: '1px solid #d9d9d9',
          borderRadius: 20,
          padding: '6px 16px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          userSelect: 'none',
        }}
        onClick={ann.toggle}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: ann.enabled ? '#52c41a' : '#d9d9d9',
            transition: 'background 0.2s',
          }}
        />
        标注
      </div>

      {ann.enabled && anchoredNotes.map(({ note, element }) => (
        <PrototypeAnnotationHotspot
          key={note.id}
          note={note}
          element={element}
          number={noteNumbers.get(note.id)}
          selected={ann.expandedNoteId === note.id}
          editMode={editMode}
          layoutVersion={layoutVersion}
          onSelect={ann.selectNote}
          onMove={handleMoveNote}
        />
      ))}

      {ann.enabled && (
        <PrototypeAnnotationPanel
          notes={pageAnnotations}
          noteNumbers={noteNumbers}
          matchedIds={matchedIds}
          expandedNoteId={ann.expandedNoteId}
          onToggleExpand={ann.toggleExpand}
          onSelectNote={ann.selectNote}
          onClose={ann.toggle}
          panelRef={ann.panelRef}
          editMode={editMode}
          onToggleEditMode={setEditMode}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onCreateNote={() => { setEditMode(true); setBindingMode({ type: 'create' }); }}
          onStartRebind={(noteId) => setBindingMode({ type: 'rebind', noteId })}
          bindingMode={bindingMode}
          onCancelBinding={() => setBindingMode(null)}
          onSave={handleSave}
          onReset={handleReset}
          onImport={handleImport}
          onExport={handleExport}
          onExportAnchors={handleExportAnchors}
          dirty={dirty}
        />
      )}

      <style>{`
        .paf-target-highlight {
          outline: 3px solid #1677ff !important;
          outline-offset: 2px;
          border-radius: 4px;
          animation: paf-pulse 1.5s ease-in-out infinite;
        }
        .paf-bind-target-candidate {
          outline: 3px solid #faad14 !important;
          outline-offset: 3px;
          cursor: crosshair !important;
        }
        @keyframes paf-pulse {
          0%, 100% { outline-color: #1677ff; }
          50% { outline-color: #69b1ff; }
        }
      `}</style>
    </>
  );
}
