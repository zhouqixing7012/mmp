import React, { useState } from 'react';
import { PROJECT_INFO } from './mockData';
import ProjectListView from './AssetInventoryProjectV2List';
import CreateProjectView from './AssetInventoryProjectV2Create';
import SnapshotView from './AssetInventoryProjectV2Snapshot';
import { ImageReviewView, PlansView, ProgressView } from './AssetInventoryProjectV2Views';

export default function AssetInventoryProjectPageV2() {
  const [view, setView] = useState('list');
  const [activeProject, setActiveProject] = useState({ ...PROJECT_INFO, status: '快照生成' });

  if (view === 'create') {
    return <CreateProjectView initialProject={activeProject?.status === '暂存' ? activeProject : null} onBack={() => setView('list')} onGenerated={(project) => { setActiveProject(project); setView('snapshot'); }} />;
  }
  if (view === 'snapshot') {
    return <SnapshotView project={activeProject} onBack={() => setView('list')} onDeleteSnapshot={() => { setActiveProject((current) => ({ ...current, status: '暂存', snapshotTime: '-' })); setView('create'); }} onGeneratePlans={() => { setActiveProject((current) => ({ ...current, status: '生成盘点计划' })); setView('plans'); }} />;
  }
  if (view === 'plans') return <PlansView project={activeProject} onBack={() => setView('list')} />;
  if (view === 'progress') return <ProgressView project={activeProject} onBack={() => setView('list')} />;
  if (view === 'image-review') return <ImageReviewView project={activeProject} onBack={() => setView('list')} />;

  return (
    <ProjectListView
      onCreate={() => { setActiveProject({ ...PROJECT_INFO, status: '暂存', snapshotTime: '-' }); setView('create'); }}
      onOpenProject={(project) => { setActiveProject({ ...PROJECT_INFO, ...project }); setView(project.status === '暂存' ? 'create' : 'snapshot'); }}
      onOpenPlans={(project) => { setActiveProject({ ...PROJECT_INFO, ...project }); setView('plans'); }}
      onOpenProgress={(project) => { setActiveProject({ ...PROJECT_INFO, ...project }); setView('progress'); }}
      onOpenImageReview={(project) => { setActiveProject({ ...PROJECT_INFO, ...project }); setView('image-review'); }}
    />
  );
}
