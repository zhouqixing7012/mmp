import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssetInventoryProjectPageV2 from './AssetInventoryProjectPageV2';

jest.mock('antd', () => ({
  Card: () => null,
  InputNumber: () => null,
  Modal: { confirm: jest.fn() },
  Select: () => null,
  Switch: () => null,
  Table: () => null,
  Typography: { Text: () => null },
}));
jest.mock('./AssetInventoryProjectListV2', () => ({ onOpenPlans }) => {
  const { PROJECT_ROWS } = require('./mockData');
  const review = PROJECT_ROWS.find((row) => row.projectType === '复盘');
  return <button onClick={() => onOpenPlans(review)}>进入计划</button>;
});
jest.mock('./AssetInventoryProjectPage', () => () => <div>
  <h4 className="ant-typography">盘点项目</h4>
  <table><tbody><tr><td>CP-202608180001</td><td><button>进入计划</button></td></tr></tbody></table>
</div>);
jest.mock('./AssetInventoryPlansV2Refined', () => ({ project }) => <div data-testid="opened-plan-project">
  {project.projectNo}|{project.projectType}
</div>);
jest.mock('./AssetInventoryCustomPlanBuilder', () => () => null);
jest.mock('./AssetInventoryImageReviewV2', () => () => null);
jest.mock('./AssetInventoryProgressV2', () => () => null);
jest.mock('./AssetInventorySnapshotDetailV2', () => () => null);
jest.mock('./AssetInventoryPlanViewsV2', () => ({ AssetInventoryPlanAssetListV2: () => null }));

test('新版列表点击复盘进入计划时父级旧版点击捕获不会改选 CP 项目', () => {
  render(<AssetInventoryProjectPageV2 />);

  fireEvent.click(screen.getAllByRole('button', { name: '进入计划' })[0]);

  expect(screen.getByTestId('opened-plan-project')).toHaveTextContent('RCP-202608180001|复盘');
});
