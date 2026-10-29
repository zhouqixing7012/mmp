jest.mock('@rc-component/pagination/locale/en_US', () => jest.requireActual('@rc-component/pagination/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/locale/en_US', () => jest.requireActual('@rc-component/picker/lib/locale/en_US'), { virtual: true });
jest.mock('@rc-component/picker/generate/dayjs', () => jest.requireActual('@rc-component/picker/lib/generate/dayjs'), { virtual: true });
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MovePage from './MovePage';
import { readMoveDocuments, writeMoveDocuments } from '../../mock/inventoryMoveMock';
import { queryApplications } from '../../services/applicationQueryService';
let before;
beforeEach(() => {
  before = readMoveDocuments();
  window.matchMedia = jest.fn().mockImplementation(query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '', content: '', overflow: '', overflowX: '', overflowY: '' });
});
afterEach(() => { writeMoveDocuments(before); });
test('库存移库编辑实时保存到同一源单，申请查询读取备注且组件重开保留修改', () => {
  const source = before.find(row => row.status === '草稿');
  const view = render(<MovePage />);
  fireEvent.click(screen.getByRole('button', { name: source.documentNo }));
  const textarea = screen.getByDisplayValue(source.remark);
  fireEvent.change(textarea, { target: { value: '共享源单备注验证' } });
  expect(Object.fromEntries(queryApplications('storage', { applicationNo: source.documentNo })[0].head)['备注']).toBe('共享源单备注验证');
  view.unmount();
  render(<MovePage />);
  fireEvent.click(screen.getByRole('button', { name: source.documentNo }));
  expect(screen.getByDisplayValue('共享源单备注验证')).toBeInTheDocument();
});
