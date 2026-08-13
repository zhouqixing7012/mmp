import React from 'react';
import { getWorkspacePage } from '../config/workspaceMenuConfig';

export default function WorkspaceContent({ activeSubMenu }) {
  const Page = getWorkspacePage(activeSubMenu);

  if (!Page) return null;

  return (
    <div
      className="workspace-content flex-1 flex flex-col relative"
      data-workspace-page={activeSubMenu}
    >
      <Page />
    </div>
  );
}
