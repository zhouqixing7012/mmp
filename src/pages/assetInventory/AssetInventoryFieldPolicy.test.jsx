import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetInventoryFieldPolicy from './AssetInventoryFieldPolicy';

test('复盘审核按最新截图保留内审列，其他页面沿用原字段策略', () => {
 render(<AssetInventoryFieldPolicy><table aria-label="原计划"><thead><tr><th>内审监督人</th></tr></thead><tbody><tr><td>甲</td></tr></tbody></table><div data-inventory-review><table aria-label="复盘审核"><thead><tr><th>内审监督人</th></tr></thead><tbody><tr><td>-</td></tr></tbody></table></div></AssetInventoryFieldPolicy>);
 const headers=screen.getAllByText('内审监督人');
 expect(headers[0]).not.toBeVisible();
 expect(headers[1]).toBeVisible();
});
