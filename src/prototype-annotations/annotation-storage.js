import { readDemoData, resetDemoData, writeDemoData } from '../services/demoStorage';
import { getBuiltInPrototypeAnnotations } from './annotation-base-registry';
import { normalizeAnnotationPosition } from './annotation-positioning';

export const PROTOTYPE_ANNOTATION_STORAGE_KEY = 'prototype_annotation_overrides_v2';
const LEGACY_STORAGE_KEY = 'prototype_annotation_drafts_v1';

const baseAnnotationRegistry = new Map();
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

function readOverrideStore() {
  return readDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, { version: 2, pages: {} });
}

function annotationEquals(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildOverrideRecord(pageKey, baseAnnotations, currentAnnotations) {
  const base = normalizeAnnotationCollection(baseAnnotations, pageKey);
  const current = normalizeAnnotationCollection(currentAnnotations, pageKey);
  const baseById = new Map(base.map((note) => [note.id, note]));
  const currentIds = new Set(current.map((note) => note.id));
  const overrides = {};

  current.forEach((note) => {
    const baseNote = baseById.get(note.id);
    if (!baseNote || !annotationEquals(baseNote, note)) {
      overrides[note.id] = note;
    }
  });

  const deletedIds = base
    .filter((note) => !currentIds.has(note.id))
    .map((note) => note.id);

  return {
    overrides,
    deletedIds,
    updatedAt: new Date().toISOString(),
  };
}

function hasExplicitTargetBinding(note) {
  const context = note?.context;
  if (!context || typeof context !== 'object') return false;

  // 旧版“重选”流程已经会写入 pageScope / pageLabel / generatedTarget；
  // 普通文字编辑或拖动位置不会补这些字段。因此可以用它兼容识别历史人工重绑，
  // 避免基线 target 更新时把用户真正选择过的目标覆盖掉。
  return typeof context.pageScope === 'string'
    && typeof context.pageLabel === 'string'
    && Object.prototype.hasOwnProperty.call(context, 'generatedTarget');
}

function mergeBaseNoteWithOverride(baseNote, overrideNote, pageKey) {
  const normalizedOverride = normalizeAnnotation(overrideNote, pageKey);
  if (normalizedOverride.target === baseNote.target || hasExplicitTargetBinding(normalizedOverride)) {
    return normalizedOverride;
  }

  // 历史覆盖层保存的是整条 note 快照：用户即使只改文字或位置，也会把当时的 target 一并锁住。
  // 当 Agent 后续修正代码基线 target 时，这类非人工重绑的旧 target 应自动跟随当前基线，
  // 同时继续保留用户已经修改过的标题、内容、位置等字段。
  return {
    ...normalizedOverride,
    target: baseNote.target,
  };
}

function mergeOverrideRecord(pageKey, baseAnnotations, record) {
  const base = normalizeAnnotationCollection(baseAnnotations, pageKey);
  if (!record) return cloneValue(base);

  const deletedIds = new Set(Array.isArray(record.deletedIds) ? record.deletedIds : []);
  const overrides = record.overrides && typeof record.overrides === 'object'
    ? record.overrides
    : {};
  const baseIds = new Set(base.map((note) => [note.id, note]));

  const merged = base
    .filter((note) => !deletedIds.has(note.id))
    .map((note) => (
      overrides[note.id]
        ? mergeBaseNoteWithOverride(note, overrides[note.id], pageKey)
        : note
    ));

  Object.values(overrides).forEach((note) => {
    const normalized = normalizeAnnotation(note, pageKey);
    if (!baseIds.has(normalized.id) && !deletedIds.has(normalized.id)) {
      merged.push(normalized);
    }
  });

  return merged;
}

function removePageFromStore(storageKey, pageKey) {
  const store = readDemoData(storageKey, { version: 2, pages: {} });
  if (!store?.pages?.[pageKey]) return;

  const pages = { ...(store.pages || {}) };
  delete pages[pageKey];

  if (Object.keys(pages).length === 0) {
    resetDemoData(storageKey);
  } else {
    writeDemoData(storageKey, { ...store, pages });
  }
}

function findFallbackRecord(store, fallbackPageKeys = []) {
  for (const key of fallbackPageKeys) {
    if (store?.pages?.[key]) return store.pages[key];
  }
  return null;
}

function resolveBaseAnnotations(pageKey, defaultAnnotations = []) {
  if (Array.isArray(defaultAnnotations) && defaultAnnotations.length > 0) {
    return defaultAnnotations;
  }

  const builtInAnnotations = getBuiltInPrototypeAnnotations(pageKey);
  if (builtInAnnotations.length > 0) return builtInAnnotations;

  return defaultAnnotations;
}

export function readAnnotationDraft(pageKey, defaultAnnotations = [], fallbackPageKeys = []) {
  const base = normalizeAnnotationCollection(resolveBaseAnnotations(pageKey, defaultAnnotations), pageKey);
  baseAnnotationRegistry.set(pageKey, cloneValue(base));

  const store = readOverrideStore();
  const record = store?.pages?.[pageKey] || findFallbackRecord(store, fallbackPageKeys);
  return mergeOverrideRecord(pageKey, base, record);
}

export function writeAnnotationDraft(pageKey, annotations) {
  const current = normalizeAnnotationCollection(annotations, pageKey);
  const base = baseAnnotationRegistry.get(pageKey) || [];
  const record = buildOverrideRecord(pageKey, base, current);
  const hasOverrides = Object.keys(record.overrides).length > 0;
  const hasDeleted = record.deletedIds.length > 0;

  if (!hasOverrides && !hasDeleted) {
    removePageFromStore(PROTOTYPE_ANNOTATION_STORAGE_KEY, pageKey);
    return cloneValue(base);
  }

  const store = readOverrideStore();
  const nextStore = {
    ...store,
    version: 2,
    pages: {
      ...(store.pages || {}),
      [pageKey]: record,
    },
  };
  writeDemoData(PROTOTYPE_ANNOTATION_STORAGE_KEY, nextStore);
  return mergeOverrideRecord(pageKey, base, record);
}

export function resetAnnotationDraft(pageKey, defaultAnnotations = [], fallbackPageKeys = []) {
  const base = normalizeAnnotationCollection(resolveBaseAnnotations(pageKey, defaultAnnotations), pageKey);
  baseAnnotationRegistry.set(pageKey, cloneValue(base));
  removePageFromStore(PROTOTYPE_ANNOTATION_STORAGE_KEY, pageKey);
  removePageFromStore(LEGACY_STORAGE_KEY, pageKey);
  fallbackPageKeys.forEach((fallbackKey) => {
    removePageFromStore(PROTOTYPE_ANNOTATION_STORAGE_KEY, fallbackKey);
    removePageFromStore(LEGACY_STORAGE_KEY, fallbackKey);
  });
  return cloneValue(base);
}

export function serializeAnnotationExport(pageKey, annotations) {
  return JSON.stringify({
    version: 1,
    pageKey,
    exportedAt: new Date().toISOString(),
    annotations: normalizeAnnotationCollection(annotations, pageKey),
  }, null, 2);
}
