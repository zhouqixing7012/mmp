import { readDemoData, resetDemoData, writeDemoData } from '../services/demoStorage';
import { normalizeAnnotationPosition } from './annotation-positioning';

export const PROTOTYPE_ANNOTATION_STORAGE_KEY = 'prototype_annotation_drafts_v1';

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

function normalizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map((section) => ({
    title: typeof section?.title === 'string' ? section.title : '',
    items: Array.isArray(section?.items)
      ? section.items.map((item) => ({
        text: typeof item?.text === 'string' ? item.text : '',
        source: typeof item?.source === 'string' ? item.source : 'confirmed',
      }))
      : [],
  }));
}

export function normalizeAnnotation(note, pageKey) {
  if (!note || typeof note !== 'object') {
    throw new Error('标注项必须是对象');
  }
  if (typeof note.id !== 'string' || !note.id.trim()) {
    throw new Error('标注项缺少有效 id');
  }
  if (typeof note.target !== 'string' || !note.target.trim()) {
    throw new Error(`标注 ${note.id} 缺少有效 target`);
  }

  return {
    ...cloneValue(note),
    id: note.id.trim(),
    pageKey: pageKey || note.pageKey || '',
    target: note.target.trim(),
    kind: typeof note.kind === 'string' && note.kind.trim() ? note.kind.trim() : 'module',
    title: typeof note.title === 'string' && note.title.trim() ? note.title : '未命名标注',
    summary: typeof note.summary === 'string' ? note.summary : '',
    summarySource: typeof note.summarySource === 'string' ? note.summarySource : 'confirmed',
    position: normalizeAnnotationPosition(note.position),
    sections: normalizeSections(note.sections),
  };
}

export function normalizeAnnotationCollection(payload, pageKey) {
  let annotations = payload;
  if (!Array.isArray(annotations)) {
    annotations = payload?.annotations;
  }
  if (!Array.isArray(annotations) && payload?.pages?.[pageKey]) {
    annotations = payload.pages[pageKey].annotations;
  }
  if (!Array.isArray(annotations)) {
    throw new Error('标注配置必须是数组，或包含 annotations 数组');
  }

  const ids = new Set();
  return annotations.map((note) => {
    const normalized = normalizeAnnotation(note, pageKey);
    if (ids.has(normalized.id)) {
      throw new Error(`标注 id 重复：${normalized.id}`);
    }
    ids.add(normalized.id);
    return normalized;
  });
}

export function readAnnotationDraft(pageKey, defaultAnnotations = []) {
  const store = readDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, { version: 1, pages: {} });
  const saved = store?.pages?.[pageKey]?.annotations;
  if (!Array.isArray(saved)) {
    return cloneValue(defaultAnnotations);
  }

  try {
    return normalizeAnnotationCollection(saved, pageKey);
  } catch (error) {
    console.error(`读取标注草稿失败：${pageKey}`, error);
    return cloneValue(defaultAnnotations);
  }
}

export function writeAnnotationDraft(pageKey, annotations) {
  const normalized = normalizeAnnotationCollection(annotations, pageKey);
  const store = readDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, { version: 1, pages: {} });
  const nextStore = {
    ...store,
    version: 1,
    pages: {
      ...(store.pages || {}),
      [pageKey]: {
        annotations: normalized,
        updatedAt: new Date().toISOString(),
      },
    },
  };
  writeDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, nextStore);
  return normalized;
}

export function resetAnnotationDraft(pageKey, defaultAnnotations = []) {
  const store = readDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, { version: 1, pages: {} });
  if (!store?.pages?.[pageKey]) {
    return cloneValue(defaultAnnotations);
  }

  const pages = { ...(store.pages || {}) };
  delete pages[pageKey];

  if (Object.keys(pages).length === 0) {
    resetDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY);
  } else {
    writeDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, { ...store, pages });
  }

  return cloneValue(defaultAnnotations);
}

export function serializeAnnotationExport(pageKey, annotations) {
  return JSON.stringify({
    version: 1,
    pageKey,
    exportedAt: new Date().toISOString(),
    annotations: normalizeAnnotationCollection(annotations, pageKey),
  }, null, 2);
}
