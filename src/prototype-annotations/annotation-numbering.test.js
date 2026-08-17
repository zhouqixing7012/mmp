import { buildAnnotationNumberMap } from './annotation-numbering';

describe('buildAnnotationNumberMap', () => {
  test('按标注数据顺序生成稳定序号', () => {
    const numbers = buildAnnotationNumberMap([
      { id: 'first' },
      { id: 'second' },
      { id: 'third' },
    ]);

    expect(numbers.get('first')).toBe(1);
    expect(numbers.get('second')).toBe(2);
    expect(numbers.get('third')).toBe(3);
  });

  test('序号不依赖锚点可见状态', () => {
    const annotations = [
      { id: 'visible' },
      { id: 'hidden' },
    ];

    const numbers = buildAnnotationNumberMap(annotations);

    expect(numbers.get('visible')).toBe(1);
    expect(numbers.get('hidden')).toBe(2);
  });
});
