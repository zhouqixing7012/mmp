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
import {
  PAGE_LABEL_ATTRIBUTE,
  PAGE_SCOPE_ATTRIBUTE,
  YEWURULES_MATERIAL_COMPREHENSIVE_SCOPE,
  annotationScopeFilename,
  buildRoutePageScope,
  readPrototypePageLabel,
  readPrototypePageScope,
} from './annotation-page-scope';
import {
  findPrototypeBindingElement,
  getPrototypeDisplayAnchor,
  getPrototypeTargetMetadata,
  isPrototypeElementInActiveLayer,
  preparePrototypeTargets,
  resolvePrototypeTarget,
} from './annotation-targeting';

import yewurulesAnnotations from './annotation-data';

const BASE_ANNOTATIONS_BY_SCOPE = {
  [YEWURULES_MATERIAL_COMPREHENSIVE_SCOPE]: yewurulesAnnotations,
};

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
  displayElement,
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
    const positionElement = displayElement?.isConnected ? displayElement : element;
    if (!element || !positionElement || !hotspot || !element.isConnected) {
      setCoordinates(null);
      return;
    }

    // Modal / Drawer 打开时，底层页面目标不再把标注点穿透到业务浮层之上。
    // 只有属于当前顶层业务浮层内部的目标仍继续展示标注。
    if (!isPrototypeElementInActiveLayer(element, document)) {
      setCoordinates(null);
      return;
    }

    const rect = positionElement.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && positionElement.getClientRects().length > 0;

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
        previous
        && Math.abs(previous.left - next.left) < 0.5
        && Math.abs(previous.top - next.top) < 0.5
        && previous.side === next.side
      ) {
        return previous;
      }
      return next;
    });
  }, [displayElement, element, note.position]);

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
      if (displayElement && displayElement !== element) resizeObserver.observe(displayElement);
      if (hotspotRef.current) resizeObserver.observe(hotspotRef.current);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [displayElement, element, scheduleUpdate]);

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
      data-prototype-annotation-ui="true"
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
        zIndex: 19990,
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
  const [pageScope, setPageScope] = useState(() => buildRoutePageScope(location.pathname));
  const [pageLabel, setPageLabel] = useState(() => location.pathname || '/');
  const [pageAnnotations, setPageAnnotations] = useState([]);
  const [anchoredNotes, setAnchoredNotes] = useState([]);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [bindingMode, setBindingMode] = useState(null);

  const baseAnnotations = useMemo(() => BASE_ANNOTATIONS_BY_SCOPE[pageScope] || [], [pageScope]);
  const legacyPageKeys = useMemo(() => (
    pageScope === YEWURULES_MATERIAL_COMPREHENSIVE_SCOPE ? ['yewurules'] : []
  ), [pageScope]);

  useEffect(() => {
    let frame = null;

    const updateScope = () => {
      setPageScope(readPrototypePageScope(location.pathname, document));
      setPageLabel(readPrototypePageLabel(location.pathname, document));
    };

    const scheduleUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        updateScope();
      });
    };

    updateScope();

    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [PAGE_SCOPE_ATTRIBUTE, PAGE_LABEL_ATTRIBUTE],
    });

    return () => {
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [location.key, location.pathname]);

  useEffect(() => {
    setPageAnnotations(readAnnotationDraft(pageScope, baseAnnotations, legacyPageKeys));
    setDirty(false);
    setBindingMode(null);
    ann.clearSelection();
  }, [ann.clearSelection, baseAnnotations, legacyPageKeys, pageScope]);

  const updateAnnotations = useCallback((updater) => {
    setPageAnnotations((previous) => (
      typeof updater === 'function' ? updater(previous) : updater
    ));
    setDirty(true);
  }, []);

  const handleSelectNote = useCallback((noteId, target) => {
    ann.selectNote(noteId, target);
    if (!target) return;

    const element = resolvePrototypeTarget(target, pageScope, document);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, [ann.selectNote, pageScope]);

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
    if (ann.expandedNoteId === noteId) ann.clearSelection();
  }, [ann.clearSelection, ann.expandedNoteId, updateAnnotations]);

  const handleSave = useCallback(() => {
    const saved = writeAnnotationDraft(pageScope, pageAnnotations);
    setPageAnnotations(saved);
    setDirty(false);
  }, [pageAnnotations, pageScope]);

  const handleReset = useCallback(() => {
    setPageAnnotations(resetAnnotationDraft(pageScope, baseAnnotations, legacyPageKeys));
    setDirty(false);
    setBindingMode(null);
    ann.clearSelection();
  }, [ann.clearSelection, baseAnnotations, legacyPageKeys, pageScope]);

  const handleImport = useCallback((text) => {
    const payload = JSON.parse(text);
    const imported = normalizeAnnotationCollection(payload, pageScope);
    setPageAnnotations(imported);
    setDirty(true);
    setBindingMode(null);
  }, [pageScope]);

  const handleExport = useCallback(() => {
    const fileBase = annotationScopeFilename(pageScope);
    downloadTextFile(`${fileBase}-annotations.json`, serializeAnnotationExport(pageScope, pageAnnotations));
  }, [pageAnnotations, pageScope]);

  const handleExportAnchors = useCallback(() => {
    preparePrototypeTargets(pageScope, document);
    const fileBase = annotationScopeFilename(pageScope);
    downloadTextFile(`${fileBase}-anchors.json`, serializePrototypeAnchorContext(pageScope, location.pathname));
  }, [location.pathname, pageScope]);

  const scanAnchors = useCallback(() => {
    if (!ann.enabled) {
      setAnchoredNotes([]);
      return;
    }

    preparePrototypeTargets(pageScope, document);

    const next = pageAnnotations
      .map((note) => ({ note, element: resolvePrototypeTarget(note.target, pageScope, document) }))
      .filter((item) => item.element);

    setAnchoredNotes((previous) => sameAnchors(previous, next) ? previous : next);
    setLayoutVersion((version) => version + 1);
  }, [ann.enabled, pageAnnotations, pageScope]);

  useEffect(() => {
    ann.updateActiveNotes(pageAnnotations);
  }, [ann.updateActiveNotes, pageAnnotations]);

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
  }, [ann.enabled, pageAnnotations, pageScope, scanAnchors]);

  const matchedIds = useMemo(() => (
    new Set(anchoredNotes.map((item) => item.note.id))
  ), [anchoredNotes]);

  const noteNumbers = useMemo(() => buildAnnotationNumberMap(pageAnnotations), [pageAnnotations]);

  useEffect(() => {
    document.querySelectorAll('.paf-target-highlight').forEach((element) => {
      element.classList.remove('paf-target-highlight');
    });

    if (!ann.enabled || !ann.highlightedTarget) return;
    const target = resolvePrototypeTarget(ann.highlightedTarget, pageScope, document);
    if (target && isPrototypeElementInActiveLayer(target, document)) {
      target.classList.add('paf-target-highlight');
    }
  }, [ann.enabled, ann.highlightedTarget, layoutVersion, pageScope]);

  useEffect(() => {
    if (!bindingMode || !editMode) return undefined;

    let candidate = null;

    const clearCandidate = () => {
      candidate?.classList.remove('paf-bind-target-candidate');
      candidate = null;
    };

    const onPointerMove = (event) => {
      const nextCandidate = findPrototypeBindingElement(event.target);
      if (nextCandidate === candidate) return;
      clearCandidate();
      candidate = nextCandidate;
      candidate?.classList.add('paf-bind-target-candidate');
    };

    const onClick = (event) => {
      // 标注选择过程中允许先操作真实页面：按住 Alt/Option 点击只触发原业务交互，
      // 不完成绑定且保持当前 bindingMode，便于先打开选择弹窗/下拉再标注内部内容。
      if (event.altKey) {
        clearCandidate();
        return;
      }

      const targetElement = findPrototypeBindingElement(event.target);
      if (!targetElement) return;

      const metadata = getPrototypeTargetMetadata(targetElement, pageScope, document);
      if (!metadata?.target) return;

      event.preventDefault();
      event.stopPropagation();

      if (bindingMode.type === 'create') {
        const noteId = `annotation-${Date.now().toString(36)}`;
        const newNote = {
          id: noteId,
          pageKey: pageScope,
          target: metadata.target,
          context: {
            pageScope,
            pageLabel,
            generatedTarget: metadata.generated,
          },
          kind: metadata.kind || 'module',
          position: normalizeAnnotationPosition({ side: 'right', align: 'center', gap: 8 }),
          title: metadata.label ? `${metadata.label}标注` : '新标注',
          summary: '',
          summarySource: 'confirmed',
          sections: [],
        };
        updateAnnotations((previous) => [...previous, newNote]);
        handleSelectNote(noteId, metadata.target);
      } else if (bindingMode.type === 'rebind' && bindingMode.noteId) {
        updateAnnotations((previous) => previous.map((note) => (
          note.id === bindingMode.noteId
            ? {
              ...note,
              target: metadata.target,
              kind: metadata.kind || note.kind || 'module',
              context: {
                ...(note.context || {}),
                pageScope,
                pageLabel,
                generatedTarget: metadata.generated,
              },
            }
            : note
        )));
        handleSelectNote(bindingMode.noteId, metadata.target);
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
  }, [bindingMode, editMode, handleSelectNote, pageLabel, pageScope, updateAnnotations]);

  useEffect(() => {
    if (!editMode) setBindingMode(null);
  }, [editMode]);

  return (
    <>
      <div
        data-prototype-annotation-ui="true"
        title={`当前标注页面：${pageLabel}`}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 19995,
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
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ann.enabled ? '#52c41a' : '#d9d9d9', transition: 'background 0.2s' }} />
        标注
      </div>

      {ann.enabled && anchoredNotes.map(({ note, element }) => (
        <PrototypeAnnotationHotspot
          key={`${pageScope}-${note.id}`}
          note={note}
          element={element}
          displayElement={getPrototypeDisplayAnchor(element)}
          number={noteNumbers.get(note.id)}
          selected={ann.expandedNoteId === note.id}
          editMode={editMode}
          layoutVersion={layoutVersion}
          onSelect={handleSelectNote}
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
          onSelectNote={handleSelectNote}
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
          border-radius: 4px;
          cursor: crosshair !important;
          box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.16) !important;
        }
        @keyframes paf-pulse {
          0%, 100% { outline-color: #1677ff; }
          50% { outline-color: #69b1ff; }
        }
      `}</style>
    </>
  );
}
