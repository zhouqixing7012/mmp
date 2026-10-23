import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as XLSX from 'xlsx';
import InventoryLocationChangeFlow, { createInventoryLocationPoolWorkbook } from './InventoryLocationChangeFlow';
import { recordInventoryLocationChange } from './inventoryLocationChangeStore';

jest.mock('antd', () => ({
 Card: ({ children, title, extra }) => <section>{title}{extra}{children}</section>,
 Space: ({ children }) => <div>{children}</div>, Typography: { Title: ({ children }) => <h1>{children}</h1> },
 Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
 Table: ({ columns, dataSource }) => <table><thead><tr>{columns.map(column => <th key={column.key}>{column.title}</th>)}</tr></thead><tbody>{dataSource.map(row => <tr key={row.id}>{columns.map(column => <td key={column.key}>{column.render(undefined, row)}</td>)}</tr>)}</tbody></table>,
 message: { useMessage: () => [{ error: jest.fn() }, null] },
}));
const project = { projectNo: 'R-POOL', projectType: '复盘', projectName: '位置池演示' };
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
function seed() { return recordInventoryLocationChange({ projectNo: project.projectNo, projectType: '复盘', assetTag: '114121801802', before: { city: '北京市', building: '搜狐媒体大厦', floor: '9层' }, after: { city: '北京市', building: '搜狐媒体大厦', floor: '8层' }, operator: '冯丽婷' }); }

test('PC仅查看位置变更池和导出，任何操作人均无新增编辑和审批入口', () => {
 seed(); const back = jest.fn();
 const view = render(<InventoryLocationChangeFlow project={project} currentOperator="冯丽婷" onBack={back} />);
 expect(screen.getByRole('heading', { name: '位置变更池' })).toBeInTheDocument();
 expect(screen.getByText('114121801802')).toBeInTheDocument();
 expect(screen.getByText('9层')).toBeInTheDocument(); expect(screen.getByText('8层')).toBeInTheDocument();
 expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['导出', '返回']);
 expect(view.container.querySelector('input,textarea')).toBeNull();
 view.rerender(<InventoryLocationChangeFlow project={{ ...project, status: '盘点关闭' }} currentOperator="206984-何文" onBack={back} />);
 expect(screen.queryByRole('button', { name: '同意' })).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button', { name: '返回' })); expect(back).toHaveBeenCalledTimes(1);
});

test('导出生成真实工作表，包含原地点、拟地点和未实际处理状态', () => {
 const change = seed();
 const book = createInventoryLocationPoolWorkbook([change]);
 const rows = XLSX.utils.sheet_to_json(book.Sheets['位置变更池'], { header: 1 });
 expect(rows[0]).toEqual(expect.arrayContaining(['资产标签号', '原楼层/机房', '拟楼层/机房', '处理状态']));
 expect(rows[1]).toEqual(expect.arrayContaining(['114121801802', '9层', '8层', '待变更']));
});
