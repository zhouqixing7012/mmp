import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, Settings, User } from 'lucide-react';
import WorkspaceMenu from './WorkspaceMenu';
import { BACKEND_CONFIG_MENU_ITEMS, MAIN_MENU_ITEMS } from '../config/menuConfig';

export default function AdminSidebar({ activeMenu, activeSubMenu, onMenuToggle, onSubMenuSelect }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onMenuToggleRef = useRef(onMenuToggle);
  const onSubMenuSelectRef = useRef(onSubMenuSelect);

  useEffect(() => {
    onMenuToggleRef.current = onMenuToggle;
    onSubMenuSelectRef.current = onSubMenuSelect;
  }, [onMenuToggle, onSubMenuSelect]);

  useEffect(() => {
    const targetMenu = location.state?.workspace;
    if (!targetMenu) return;

    if (activeMenu !== '个人工作台') {
      onMenuToggleRef.current?.('个人工作台', false);
    }
    if (activeSubMenu !== targetMenu) {
      onSubMenuSelectRef.current?.(targetMenu);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [activeMenu, activeSubMenu, location.key, location.pathname, location.state, navigate]);

  return (
    <div className="w-56 min-h-0 bg-[#001529] text-white flex flex-col transition-all duration-300 shadow-xl z-20 relative">
      <div className="h-14 shrink-0 flex items-center gap-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.3)] z-10 bg-[#002140]">
        <div className="w-8 h-8 rounded bg-[#1677ff] text-white flex items-center justify-center font-bold text-lg shadow-sm">E</div>
        <span className="font-semibold text-base tracking-wide text-white">企业资产管理系统</span>
      </div>

      <div className="shrink-0 py-4 px-5 border-b border-white/10 flex flex-col gap-1 text-sm bg-[#001529]">
        <div className="flex items-center gap-2 text-gray-300">
          <User size={14} />
          <span className="font-medium text-white">系统管理员 (admin)</span>
        </div>
        <div className="text-gray-400 text-xs ml-5">2026年05月27日 星期三</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <div>
          <div
            className="flex items-center justify-between px-5 py-3 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => onMenuToggle('个人工作台')}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={16} />
              <span>个人工作台</span>
            </div>
            <ChevronDown size={14} className={`transition-transform ${activeMenu === '个人工作台' ? 'rotate-180' : ''}`} />
          </div>
          {activeMenu === '个人工作台' && (
            <WorkspaceMenu activeSubMenu={activeSubMenu} onSelect={onSubMenuSelect} />
          )}
        </div>

        {MAIN_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const isActive = activeMenu === item.key;

          if (hasChildren) {
            return (
              <div key={item.key}>
                <div
                  className={`flex items-center justify-between px-5 py-3 cursor-pointer text-sm transition-colors hover:text-white ${isActive ? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}
                  onClick={() => onMenuToggle(item.key)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${isActive ? 'rotate-180' : ''}`} />
                </div>
                {isActive && (
                  <div className="bg-[#000c17] py-1">
                    {item.children.map((subMenu) => (
                      <div
                        key={subMenu}
                        className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${activeSubMenu === subMenu ? 'text-white bg-[#1677ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        onClick={() => onSubMenuSelect(subMenu)}
                      >
                        {subMenu}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm transition-colors hover:text-white ${isActive ? 'text-white bg-[#1677ff]' : 'text-gray-300 hover:bg-white/5'}`}
              onClick={() => onMenuToggle(item.key, false)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </div>
          );
        })}

        <div className="mt-1">
          <div
            className="flex items-center justify-between px-5 py-3 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => onMenuToggle('后台基础配置')}
          >
            <div className="flex items-center gap-3">
              <Settings size={16} />
              <span>后台基础配置</span>
            </div>
            <ChevronDown size={14} className={`transition-transform ${activeMenu === '后台基础配置' ? 'rotate-180' : ''}`} />
          </div>
          {activeMenu === '后台基础配置' && (
            <div className="bg-[#000c17] py-1">
              {BACKEND_CONFIG_MENU_ITEMS.map((subMenu) => (
                <div
                  key={subMenu}
                  className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${activeSubMenu === subMenu ? 'text-white bg-[#1677ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  onClick={() => onSubMenuSelect(subMenu)}
                >
                  {subMenu}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
