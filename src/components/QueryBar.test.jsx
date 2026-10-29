import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QueryBar, { QueryItem, getQueryColumns } from './QueryBar';

beforeAll(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});

test.each([[1440,1000,3],[1180,1000,2],[761,900,2],[760,900,1],[1440,520,1],[1440,600,2]])('视口%s容器%s采用%s列', (viewport, width, expected) => {
  expect(getQueryColumns(viewport, width)).toBe(expected);
});
test('重置在查询左侧，点击保留业务回调，长标签保留完整名称', () => {
  const reset=jest.fn(), query=jest.fn();
  render(<QueryBar onQuery={query} onReset={reset}><QueryItem label="耗材申请是否需要MIS审核"><input aria-label="审核条件" /></QueryItem></QueryBar>);
  const actions=screen.getAllByRole('button');
  expect(actions.map(item=>item.textContent.replace(/\s/g,''))).toEqual(['重置','查询']);
  fireEvent.click(actions[0]); fireEvent.click(actions[1]);
  expect(reset).toHaveBeenCalledTimes(1); expect(query).toHaveBeenCalledTimes(1);
  expect(screen.getByTitle('耗材申请是否需要MIS审核')).toHaveAttribute('tabindex','0');
});
test('展开字段保持原来的输入值和调用者提供的操作', () => {
  function Example() {
    const [expanded,setExpanded]=React.useState(false);
    return <QueryBar buttons={<button onClick={()=>setExpanded(!expanded)}>展开更多</button>}><QueryItem label="编码"><input aria-label="编码" defaultValue="A001" /></QueryItem>{expanded && <QueryItem label="说明"><input /></QueryItem>}</QueryBar>;
  }
  render(<Example />); fireEvent.change(screen.getByRole('textbox', { name: '编码' }),{target:{value:'B002'}});
  fireEvent.click(screen.getByText('展开更多'));
  expect(screen.getByRole('textbox', { name: '编码' })).toHaveValue('B002');
  expect(screen.getByRole('group',{name:'说明'})).toBeInTheDocument();
});
