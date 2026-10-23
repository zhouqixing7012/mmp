import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetInventoryFieldPolicy from './AssetInventoryFieldPolicy';

test('复盘审核及其他页面均不再保留内审列', () => {
 render(<AssetInventoryFieldPolicy><table aria-label="原计划"><thead><tr><th>内审监督人</th></tr></thead><tbody><tr><td>甲</td></tr></tbody></table><div data-inventory-review><table aria-label="复盘审核"><thead><tr><th>内审监督人</th></tr></thead><tbody><tr><td>-</td></tr></tbody></table></div></AssetInventoryFieldPolicy>);
 const headers=screen.getAllByText('内审监督人');
 expect(headers[0]).not.toBeVisible();
 expect(headers[1]).not.toBeVisible();
});

test('计划人员及City由业务列配置展示，不再被公共策略移除', () => {
 render(<AssetInventoryFieldPolicy><section className="ant-card"><div className="ant-card-head-title">盘点计划明细</div><table><thead><tr><th>计划监督人</th><th>盘点执行人</th><th>City</th></tr></thead><tbody><tr><td>甲</td><td>乙</td><td>北京</td></tr></tbody></table></section></AssetInventoryFieldPolicy>);
 expect(screen.getByText('计划监督人')).toBeVisible();
 expect(screen.getByText('盘点执行人')).toBeVisible();
 expect(screen.getByText('City')).toBeVisible();
});
