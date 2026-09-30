import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
jest.mock('./AssetInventoryProjectListV2', () => ({ onOpenPlans, onCreate, onOpenProject }) => {
  const { PROJECT_ROWS } = require('./mockData');
  const review = PROJECT_ROWS.find((row) => row.projectType === '复盘');
  return <><button onClick={() => onOpenPlans(review)}>进入计划</button><button onClick={onCreate}>新建项目</button><button onClick={() => onOpenProject(review)}>查看项目</button></>;
});
jest.mock('./AssetInventoryProjectPage', () => ({ onProjectGenerated }) => {
  const React = require('react');
  const [page, setPage] = React.useState('盘点项目');
  return <div><h4 className="ant-typography">{page}</h4>
    {page === '盘点项目' ? <button onClick={() => setPage('创建盘点项目')}>创建项目</button>
      : <><button onClick={() => { setPage('盘点项目详情'); onProjectGenerated({ projectNo: 'CP-new', projectType: '初盘', status: '快照生成' }); }}>生成快照</button><button onClick={() => setPage('盘点项目')}>返回</button></>}
  </div>;
});
jest.mock('./AssetInventoryPlansV2Refined', () => ({ project, onPlansStarted, onBack }) => <div data-testid="opened-plan-project">
  {project.projectNo}|{project.projectType}
  <button onClick={() => onPlansStarted({ ...project, status: '盘点中' })}>启动计划</button><button onClick={onBack}>退出计划</button>
</div>);
jest.mock('./AssetInventoryCustomPlanBuilder', () => () => null);
jest.mock('./AssetInventoryImageReviewV2', () => () => null);
jest.mock('./AssetInventoryProgressV2', () => () => null);
jest.mock('./AssetInventorySnapshotDetailV2', () => ({ onBack, project }) => <section><h1>快照详情</h1><span>{project.status}</span><button onClick={onBack}>返回列表</button></section>);
jest.mock('./AssetInventoryPlanViewsV2', () => ({ AssetInventoryPlanAssetListV2: () => null }));

test('新版列表点击复盘进入计划时父级旧版点击捕获不会改选 CP 项目', () => {
  render(<AssetInventoryProjectPageV2 />);

  fireEvent.click(screen.getAllByRole('button', { name: '进入计划' })[0]);

  expect(screen.getByTestId('opened-plan-project')).toHaveTextContent('RCP-202608180001|复盘');
});


test('生成快照后返回会退出底层详情，不重复打开快照覆盖层', async () => {
  render(<AssetInventoryProjectPageV2 />);
  fireEvent.click(screen.getByRole('button', { name: '新建项目' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '生成快照' })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: '生成快照' }));
  expect(screen.getByRole('heading', { name: '快照详情' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '返回列表' }));
  await waitFor(() => expect(screen.queryByRole('heading', { name: '快照详情' })).not.toBeInTheDocument());
  await waitFor(() => expect(screen.getByRole('button', { name: '新建项目' })).toBeInTheDocument());
});


test('计划启动后重新打开项目详情保留盘点中状态', () => {
  render(<AssetInventoryProjectPageV2 />);
  fireEvent.click(screen.getAllByRole('button', { name: '进入计划' })[0]);
  fireEvent.click(screen.getByRole('button', { name: '启动计划' }));
  fireEvent.click(screen.getByRole('button', { name: '退出计划' }));
  fireEvent.click(screen.getByRole('button', { name: '查看项目' }));
  expect(screen.getByText('盘点中')).toBeInTheDocument();
});
