import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InventoryPlanImport from './InventoryPlanImport';
jest.mock('antd', () => ({ Button: ({ children, disabled }) => <button disabled={disabled}>{children}</button>, Dropdown: ({ children, menu }) => <>{children}{menu.items.map(item => <button key={item.key} disabled={item.disabled} onClick={() => menu.onClick({ key: item.key })}>{item.label}</button>)}</> }));
jest.mock('./InventoryPersonnelImport', () => props => props.openRequest ? <output>人员:{props.plans.map(plan => plan.planNo).join(',')}</output> : null);
jest.mock('./InventoryScanResultImport', () => props => props.openRequest ? <output>结果:{props.plans.map(plan => plan.planNo).join(',')}</output> : null);
jest.mock('./InventoryUncountedImport', () => props => props.openRequest ? <output>说明:{props.plans.map(plan => plan.planNo).join(',')}</output> : null);
const project = { projectNo: 'P', projectType: '初盘', creator: '甲', status: '盘点中' };
const plans = [{ key: 'a', planNo: 'A', status: '草稿' }, { key: 'b', planNo: 'B', status: '盘点中' }, { key: 'c', planNo: 'C', status: '已审核' }];
const props = { project, plans, operator: '甲', assetsForPlan: plan => [{ key: plan.key, assetTag: plan.key, inventoryRange: '员工' }], onChangePlanAssets: jest.fn() };
test('一个导入按钮，混合状态分别进入对应导入且限定相应计划', () => {
 render(<InventoryPlanImport {...props}/>);
 expect(screen.getAllByRole('button', { name: '导入', exact: true })).toHaveLength(1);
 fireEvent.click(screen.getByRole('button', { name: '导入人员信息' })); expect(screen.getByText('人员:A')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button', { name: '导入盘点结果' })); expect(screen.getByText('结果:B')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button', { name: '导入未盘说明' })); expect(screen.getByText('说明:C')).toBeInTheDocument();
});
test('状态和权限不满足时不可选，关闭不提供入口', () => {
 const view = render(<InventoryPlanImport {...props} plans={[plans[0]]}/>);
 expect(screen.getByRole('button', { name: '导入盘点结果' })).toBeDisabled();
 expect(screen.getByRole('button', { name: '导入未盘说明' })).toBeDisabled();
 view.rerender(<InventoryPlanImport {...props} operator="乙"/>);
 expect(screen.getByRole('button', { name: '导入', exact: true })).toBeDisabled();
 view.rerender(<InventoryPlanImport {...props} project={{ ...project, status: '盘点关闭' }}/>);
 expect(screen.queryByRole('button', { name: '导入', exact: true })).toBeNull();
});
