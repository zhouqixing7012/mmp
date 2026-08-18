import { layoutAnnotationHotspots } from './annotation-hotspot-collision';

beforeEach(() => {
  document.body.innerHTML = `
    <div class="paf-annotation-panel"></div>
    <div id="a" class="paf-hotspot" style="opacity:1"></div>
    <div id="b" class="paf-hotspot" style="opacity:1"></div>
  `;

  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });

  const rect = { left: 100, top: 100, right: 122, bottom: 122, width: 22, height: 22 };
  document.getElementById('a').getBoundingClientRect = () => rect;
  document.getElementById('b').getBoundingClientRect = () => rect;
});

test('两个完全重叠的标注热点会在显示层自动错开', () => {
  const result = layoutAnnotationHotspots(document);
  expect(result).toHaveLength(2);
  expect(result[0].offsetX).toBe(0);
  expect(result[0].offsetY).toBe(0);
  expect(Math.abs(result[1].offsetX) + Math.abs(result[1].offsetY)).toBeGreaterThan(0);
});

test('自动避让只写 CSS 显示偏移，不修改 target 或标注数据', () => {
  document.getElementById('a').setAttribute('data-prototype-anchor', 'card-x::button::a');
  layoutAnnotationHotspots(document);
  expect(document.getElementById('a').getAttribute('data-prototype-anchor')).toBe('card-x::button::a');
});
