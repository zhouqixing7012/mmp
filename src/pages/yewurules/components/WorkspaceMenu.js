import React from 'react';
import { WORKSPACE_MENU_ITEMS } from '../config/workspaceMenuConfig';

export default function WorkspaceMenu({ activeSubMenu, onSelect }) {
  return (
    <div className="bg-[#000c17] py-1">
      {WORKSPACE_MENU_ITEMS.map((item) => (
        <div
          key={item.key}
          className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${
            activeSubMenu === item.key
              ? 'text-white bg-[#1677ff]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => onSelect(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
