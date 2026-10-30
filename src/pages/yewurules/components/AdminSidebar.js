import React, { useEffect, useRef, useState } from 'react';
import { Menu, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useInventoryOperator } from '../../assetInventory/useInventoryOperator';
import { inventoryMenuItemsForOperator } from '../../assetInventory/inventoryReportAccess';
import { BACKEND_CONFIG_MENU_ITEMS, MAIN_MENU_ITEMS } from '../config/menuConfig';
import { WORKSPACE_MENU_ITEMS } from '../config/workspaceMenuConfig';
import './adminSidebar.css';
import sohuLogo from './logo-sohu.png';

export default function AdminSidebar({ activeMenu, activeSubMenu, onMenuToggle, onSubMenuSelect }) {
  const [inventoryOperator] = useInventoryOperator();
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
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null }
    );
  }, [activeMenu, activeSubMenu, location.key, location.pathname, location.search, location.state, navigate]);

  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([activeMenu]);
  useEffect(() => { setOpenKeys([activeMenu]); }, [activeMenu]);

  const groups = [
    { key: '个人工作台', label: '个人工作台', icon: LayoutDashboard, children: WORKSPACE_MENU_ITEMS },
    ...MAIN_MENU_ITEMS.map(item => ({
      ...item,
      children: item.key === '资产盘点'
        ? inventoryMenuItemsForOperator(item.children, inventoryOperator)
        : item.children,
    })),
    { key: '后台基础配置', label: '后台基础配置', icon: Settings, children: BACKEND_CONFIG_MENU_ITEMS },
  ];
  const destinations = new Map();
  const items = groups.map(({ key, label, icon: Icon, children }) => {
    const hasChildren = children?.length > 0;
    if (!hasChildren) destinations.set(key, { parent: key });
    return {
      key, label, 'aria-label': label, icon: <Icon size={16} aria-hidden="true" />,
      children: hasChildren ? children.map(child => {
        const value = typeof child === 'string' ? child : child.key;
        const childKey = key + '::' + value;
        destinations.set(childKey, { parent: key, child: value });
        return { key: childKey, label: typeof child === 'string' ? child : child.label };
      }) : undefined,
    };
  });
  const selectedKey = activeMenu + '::' + activeSubMenu;
  const toggleLabel = collapsed ? '展开侧栏' : '收起侧栏';

  return (
    <aside className={'mmp-admin-sidebar' + (collapsed ? ' is-collapsed' : '')} aria-label="后台侧栏">
      <div className="mmp-admin-sidebar-brand">
        <img className="mmp-admin-sidebar-logo" src={sohuLogo} alt="搜狐" />
        {!collapsed && <span>搜狐资产管理平台</span>}
      </div>
      <nav id="admin-sidebar-navigation" className="mmp-admin-sidebar-nav" aria-label="主导航">
        <Menu
          tooltip={{ trigger: ['hover', 'focus'] }}
          mode="inline"
          inlineCollapsed={collapsed}
          items={items}
          selectedKeys={[destinations.has(selectedKey) ? selectedKey : activeMenu]}
          openKeys={collapsed ? undefined : openKeys}
          onOpenChange={keys => { if (!collapsed) setOpenKeys(keys); }}
          onClick={({ key }) => {
            const destination = destinations.get(key);
            if (!destination) return;
            if (!destination.child || destination.parent !== activeMenu) onMenuToggle(destination.parent, false);
            if (destination.child) onSubMenuSelect(destination.child);
          }}
        />
      </nav>
      <Tooltip title={toggleLabel} trigger={['hover', 'focus']} placement="right">
        <button type="button" className="mmp-admin-sidebar-toggle" aria-label={toggleLabel}
          aria-expanded={!collapsed} aria-controls="admin-sidebar-navigation" onClick={() => setCollapsed(value => !value)}>
          {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          {!collapsed && <span>收起侧栏</span>}
        </button>
      </Tooltip>
    </aside>
  );
}
