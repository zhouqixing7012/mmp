import { computeHotspotPosition, normalizeAnnotationPosition } from './annotation-positioning';

describe('annotation positioning', () => {
  test('defaults to the right center of the anchor', () => {
    const result = computeHotspotPosition(
      { left: 100, top: 100, right: 200, bottom: 140 },
      { width: 800, height: 600 },
      { width: 22, height: 22 }
    );

    expect(result).toEqual({ left: 208, top: 109, side: 'right' });
  });

  test('flips to the opposite side near the viewport edge', () => {
    const result = computeHotspotPosition(
      { left: 760, top: 100, right: 790, bottom: 140 },
      { width: 800, height: 600 },
      { width: 22, height: 22 },
      { side: 'right', gap: 8 }
    );

    expect(result.side).toBe('left');
    expect(result.left).toBe(730);
  });

  test('supports alignment and visual offsets while keeping the hotspot in view', () => {
    const result = computeHotspotPosition(
      { left: 2, top: 4, right: 102, bottom: 44 },
      { width: 320, height: 200 },
      { width: 22, height: 22 },
      { side: 'top', align: 'start', gap: 6, offsetX: -50, viewportPadding: 8 }
    );

    expect(result.side).toBe('bottom');
    expect(result.left).toBe(8);
    expect(result.top).toBe(50);
  });

  test('normalizes invalid configuration', () => {
    expect(normalizeAnnotationPosition({ side: 'diagonal', gap: -3 })).toEqual({
      side: 'right',
      align: 'center',
      gap: 0,
      offsetX: 0,
      offsetY: 0,
      viewportPadding: 8,
    });
  });
});
