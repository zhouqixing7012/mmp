import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PrototypeAnnotationPanel from './PrototypeAnnotationPanel';
import usePrototypeAnnotations from './usePrototypeAnnotations';
import { computeHotspotPosition } from './annotation-positioning';

// 所有标注数据
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
    item.note.id === next[index].note.id && item.element === next[index].element
  ));
}

function PrototypeAnnotationHotspot({
  note,
  element,
  number,
  selected,
  layoutVersion,
  onSelect,
  onVisibilityChange,
}) {
  const hotspotRef = useRef(null);
  const frameRef = useRef(null);
  const visibleRef = useRef(false);
  const [coordinates, setCoordinates] = useState(null);

  const updatePosition = useCallback(() => {
    const hotspot = hotspotRef.current;
    if (!element || !hotspot || !element.isConnected) return;

    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;

    if (visibleRef.current !== isVisible) {
      visibleRef.current = isVisible;
      onVisibilityChange(note.id, isVisible);
    }

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
  }, [element, note.id, note.position, onVisibilityChange]);

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
      if (visibleRef.current) onVisibilityChange(note.id, false);
    };
  }, [element, note.id, onVisibilityChange, scheduleUpdate]);

  useEffect(() => {
    scheduleUpdate();
  }, [layoutVersion, scheduleUpdate]);

  const showHotspot = coordinates && Number.isInteger(number);

  return (
    <div
      ref={hotspotRef}
      className="paf-hotspot"
      onClick={() => onSelect(note.id, note.target)}
      data-placement-side={coordinates?.side || note.position?.side || 'right'}
      title={note.title}
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
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        color: '#fff',
        fontWeight: 700,
        lineHeight: 1,
        opacity: showHotspot ? 1 : 0,
        pointerEvents: showHotspot ? 'auto' : 'none',
        transition: 'transform 0.15s, background 0.15s, opacity 0.12s',
        transform: selected ? 'scale(1.25)' : 'scale(1)',
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
  const [anchoredNotes, setAnchoredNotes] = useState([]);
  const [visibleNoteIds, setVisibleNoteIds] = useState(() => new Set());
  const [layoutVersion, setLayoutVersion] = useState(0);

  const pageAnnotations = useMemo(() => {
    if (!pageKey) return [];
    return ALL_ANNOTATIONS[pageKey] || [];
  }, [pageKey]);

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
      setVisibleNoteIds(new Set());
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
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [ann.enabled, pageAnnotations, scanAnchors]);

  useEffect(() => {
    const activeIds = new Set(anchoredNotes.map((item) => item.note.id));
    setVisibleNoteIds((previous) => {
      const next = new Set([...previous].filter((id) => activeIds.has(id)));
      if (next.size === previous.size && [...next].every((id) => previous.has(id))) return previous;
      return next;
    });
  }, [anchoredNotes]);

  const handleVisibilityChange = useCallback((noteId, visible) => {
    setVisibleNoteIds((previous) => {
      const alreadyVisible = previous.has(noteId);
      if (alreadyVisible === visible) return previous;
      const next = new Set(previous);
      if (visible) next.add(noteId);
      else next.delete(noteId);
      return next;
    });
  }, []);

  const visibleAnnotations = useMemo(() => (
    pageAnnotations.filter((note) => visibleNoteIds.has(note.id))
  ), [pageAnnotations, visibleNoteIds]);

  const visibleNoteNumbers = useMemo(() => (
    new Map(visibleAnnotations.map((note, index) => [note.id, index + 1]))
  ), [visibleAnnotations]);

  useEffect(() => {
    document.querySelectorAll('.paf-target-highlight').forEach((element) => {
      element.classList.remove('paf-target-highlight');
    });

    if (!ann.enabled || !ann.highlightedTarget) return;
    const target = findAnchor(ann.highlightedTarget);
    if (target) target.classList.add('paf-target-highlight');
  }, [ann.highlightedTarget, ann.enabled, layoutVersion]);

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
          number={visibleNoteNumbers.get(note.id)}
          selected={ann.expandedNoteId === note.id}
          layoutVersion={layoutVersion}
          onSelect={ann.selectNote}
          onVisibilityChange={handleVisibilityChange}
        />
      ))}

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
