import React from 'react';
import { act, render, screen } from '@testing-library/react';
import AutoWidthTable from './AutoWidthTable';
jest.mock('antd', () => ({
  theme: { useToken: () => ({ token: { fontSize: 14, fontFamily: 'sans-serif' } }) },
  Table: ({ columns }) => <table><thead><tr>{columns.map(column => <th key={column.key} style={{ width: column.width }}>{column.title}</th>)}</tr></thead><tbody><tr><td>正文</td></tr></tbody></table>,
}));
let resize;
let fontLoaded;
let factor;
let originalCanvas;
let originalFonts;
beforeEach(() => {
  factor = 8;
  originalCanvas = window.CanvasRenderingContext2D;
  window.CanvasRenderingContext2D = function Canvas() {};
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({ measureText: text => ({ width: String(text).length * factor }) }));
  jest.spyOn(window, 'getComputedStyle').mockImplementation(element => ({ fontSize: '14px', fontFamily: 'sans-serif', borderRightWidth: '1px', fontWeight: element.tagName === 'TH' ? '600' : '400', paddingLeft: element.dataset.outer ? '16px' : '8px', paddingRight: element.dataset.outer ? '16px' : '8px' }));
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
  window.ResizeObserver = class { constructor(callback) { resize = callback; } observe() {} disconnect() {} };
  originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: new Promise(() => {}), addEventListener: (_, callback) => { fontLoaded = callback; }, removeEventListener: jest.fn() } });
});
afterEach(() => {
  jest.restoreAllMocks();
  window.CanvasRenderingContext2D = originalCanvas;
  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts);
  else Reflect.deleteProperty(document, 'fonts');
});
const columns = [{ title: '名称', key: 'name', dataIndex: 'name', sizing: { type: 'description' } }];
test('可用宽度扣除父级padding，resize不会把上次容器伸展宽度当成固有宽度', () => {
  render(<div data-outer="true"><AutoWidthTable columns={columns} dataSource={[]} /></div>);
  // 内容宽368；左右边框预留2，名称上限360。
  expect(screen.getByRole('columnheader').style.width).toBe('360px');
  const getter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth').get;
  getter.mockReturnValue(250);
  act(() => resize());
  expect(screen.getByRole('columnheader').style.width).toBe('216px');
});
test('字体CSS名称不变但字形变宽后重新实测，紧凑表和分页缓存有效', () => {
  const code = [{ title: '标签', key: 'tag', dataIndex: 'tag', sizing: { type: 'code' } }];
  const view = render(<AutoWidthTable compact columns={code} dataSource={[{ tag: '123456789012345678' }]} />);
  expect(screen.getByRole('columnheader').style.width).toBe('165px');
  view.rerender(<AutoWidthTable compact columns={code} dataSource={[]} />);
  expect(screen.getByRole('columnheader').style.width).toBe('165px');
  view.rerender(<AutoWidthTable compact columns={code} dataSource={[{ tag: '123456789012345678' }]} />);
  factor = 12;
  act(() => fontLoaded());
  expect(screen.getByRole('columnheader').style.width).toBe('237px');
});
