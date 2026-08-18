import {
  PROTOTYPE_ANNOTATION_STORAGE_KEY,
  readAnnotationDraft,
  resetAnnotationDraft,
  writeAnnotationDraft,
} from './annotation-storage';

const base = [
  {
    id: 'a', pageKey: 'yewurules', target: 'anchor-a', kind: 'module',
    title: 'A', summary: 'A summary', summarySource: 'prd', sections: [],
  },
  {
    id: 'b', pageKey: 'yewurules', target: 'anchor-b', kind: 'module',
    title: 'B', summary: 'B summary', summarySource: 'prd', sections: [],
  },
];

beforeEach(() => {
  window.localStorage.clear();
});

test('未保存时直接使用代码中的标注', () => {
  const result = readAnnotationDraft('yewurules', base);
  expect(result.map((note) => note.id)).toEqual(['a', 'b']);
});

test('用户修改会覆盖同 id 标注，但代码新增标注仍会出现', () => {
  const current = readAnnotationDraft('yewurules', base).map((note) => (
    note.id === 'a' ? { ...note, title: 'A-用户修改' } : note
  ));
  writeAnnotationDraft('yewurules', current);

  const nextBase = [
    ...base,
    {
      id: 'c', pageKey: 'yewurules', target: 'anchor-c', kind: 'module',
      title: 'C', summary: 'C summary', summarySource: 'prd', sections: [],
    },
  ];

  const result = readAnnotationDraft('yewurules', nextBase);
  expect(result.find((note) => note.id === 'a').title).toBe('A-用户修改');
  expect(result.find((note) => note.id === 'c').title).toBe('C');
});

test('仅编辑内容或位置留下的旧快照会跟随新版基线 target', () => {
  const current = readAnnotationDraft('yewurules', base).map((note) => (
    note.id === 'a'
      ? {
        ...note,
        title: 'A-用户修改',
        position: { ...note.position, offsetX: 24 },
      }
      : note
  ));
  writeAnnotationDraft('yewurules', current);

  const nextBase = base.map((note) => (
    note.id === 'a' ? { ...note, target: 'anchor-a-v2' } : note
  ));
  const result = readAnnotationDraft('yewurules', nextBase);
  const migrated = result.find((note) => note.id === 'a');

  expect(migrated.target).toBe('anchor-a-v2');
  expect(migrated.title).toBe('A-用户修改');
  expect(migrated.position.offsetX).toBe(24);
});

test('v2 历史 context 不能再把旧 target 锁死', () => {
  window.localStorage.setItem(PROTOTYPE_ANNOTATION_STORAGE_KEY, JSON.stringify({
    version: 2,
    pages: {
      yewurules: {
        overrides: {
          a: {
            ...base[0],
            target: 'anchor-a-old-generated',
            title: 'A-历史修改',
            context: {
              pageScope: 'yewurules',
              pageLabel: '测试页',
              generatedTarget: true,
            },
          },
        },
        deletedIds: [],
      },
    },
  }));

  const nextBase = base.map((note) => (
    note.id === 'a' ? { ...note, target: 'anchor-a-v2' } : note
  ));
  const result = readAnnotationDraft('yewurules', nextBase);
  const migrated = result.find((note) => note.id === 'a');

  expect(migrated.target).toBe('anchor-a-v2');
  expect(migrated.title).toBe('A-历史修改');
  expect(migrated.context).toBeUndefined();
});

test('v3 旧 context 即使版本号较新也不能冒充人工重绑', () => {
  window.localStorage.setItem(PROTOTYPE_ANNOTATION_STORAGE_KEY, JSON.stringify({
    version: 3,
    pages: {
      yewurules: {
        overrides: {
          a: {
            ...base[0],
            target: 'anchor-a-stale-v3',
            context: {
              pageScope: 'yewurules',
              pageLabel: '测试页',
              generatedTarget: true,
            },
          },
        },
        deletedIds: [],
      },
    },
  }));

  const nextBase = base.map((note) => (
    note.id === 'a' ? { ...note, target: 'anchor-a-v4' } : note
  ));
  const result = readAnnotationDraft('yewurules', nextBase);
  const migrated = result.find((note) => note.id === 'a');

  expect(migrated.target).toBe('anchor-a-v4');
  expect(migrated.context).toBeUndefined();
});

test('当前版本明确执行过重选的 target 继续优先于新版代码基线', () => {
  const current = readAnnotationDraft('yewurules', base).map((note) => (
    note.id === 'a'
      ? {
        ...note,
        target: 'anchor-a-user-rebound',
        context: {
          pageScope: 'yewurules',
          pageLabel: '测试页',
          generatedTarget: true,
        },
      }
      : note
  ));
  writeAnnotationDraft('yewurules', current);

  const nextBase = base.map((note) => (
    note.id === 'a' ? { ...note, target: 'anchor-a-v2' } : note
  ));
  const result = readAnnotationDraft('yewurules', nextBase);
  const rebound = result.find((note) => note.id === 'a');

  expect(rebound.target).toBe('anchor-a-user-rebound');
  expect(rebound.context.userReboundTarget).toBe(true);
});

test('用户删除与新增标注都可以持久化', () => {
  const current = readAnnotationDraft('yewurules', base)
    .filter((note) => note.id !== 'b')
    .concat({
      id: 'custom', pageKey: 'yewurules', target: 'anchor-custom', kind: 'module',
      title: '自定义', summary: '', summarySource: 'confirmed', sections: [],
    });

  writeAnnotationDraft('yewurules', current);
  const result = readAnnotationDraft('yewurules', base);

  expect(result.some((note) => note.id === 'b')).toBe(false);
  expect(result.some((note) => note.id === 'custom')).toBe(true);
});

test('重置后恢复代码默认标注并清除覆盖层', () => {
  const current = readAnnotationDraft('yewurules', base).map((note) => (
    note.id === 'a' ? { ...note, title: '已修改' } : note
  ));
  writeAnnotationDraft('yewurules', current);

  const result = resetAnnotationDraft('yewurules', base);
  expect(result.find((note) => note.id === 'a').title).toBe('A');
  expect(window.localStorage.getItem(PROTOTYPE_ANNOTATION_STORAGE_KEY)).toBeNull();
});
