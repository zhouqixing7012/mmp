import React, { useState, useMemo } from 'react';
import { 
  Search, ShoppingCart, Plus, Trash2, Check, 
  ChevronDown, ChevronRight, LayoutGrid, AlertCircle
} from 'lucide-react';

// --- Mock Data (支持4层树形结构) ---
const TREE_CATEGORIES = [
  {
    id: 'c-pc',
    name: 'IT终端设备',
    children: [
      {
        id: 'c-pc-l2',
        name: '电脑整机',
        children: [
          {
            id: 'c-pc-l3-nb',
            name: '便携式电脑',
            children: [
              { id: 'cat-nb-win', name: 'Windows 笔记本' },
              { id: 'cat-nb-mac', name: 'MacBook' }
            ]
          },
          {
            id: 'c-pc-l3-dt',
            name: '台式电脑',
            children: [
              { id: 'cat-host', name: '标准主机' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c-office',
    name: '办公与耗材',
    children: [
      {
         id: 'c-office-l2',
         name: '外设及配件',
         children: [
           {
             id: 'c-office-l3-disp',
             name: '显示设备',
             children: [
               { id: 'cat-monitor', name: '桌面显示器' }
             ]
           },
           {
             id: 'c-office-l3-acc',
             name: '耗材配件',
             children: [
               { id: 'cat-consumable', name: '键鼠与线材' }
             ]
           }
         ]
      }
    ]
  }
];

const ASSET_LIBRARY = [
  { id: 'A001', name: 'ThinkPad T14 笔记本', categoryId: 'cat-nb-win', type: 'main', desc: '14英寸 / i7 / 16G / 512G' },
  { id: 'A002', name: 'MacBook Pro 14', categoryId: 'cat-nb-mac', type: 'main', desc: 'M3 Pro / 18G / 512G' },
  { id: 'A004', name: '戴尔 U2723QE 显示器', categoryId: 'cat-monitor', type: 'main', desc: '27英寸 4K Type-C' },
  { id: 'A005', name: '联想 启天 M430', categoryId: 'cat-host', type: 'main', desc: '商用台式主机 i5' },
  { id: 'A006', name: '西部数据 4TB 移动硬盘', categoryId: 'cat-consumable', type: 'consumable', desc: '2.5英寸 USB 3.0' },
  { id: 'A007', name: '苹果 35W 双USB-C 电源适配器', categoryId: 'cat-consumable', type: 'consumable', desc: '原装充电头' },
  { id: 'A008', name: '罗技 MX Master 3S', categoryId: 'cat-consumable', type: 'consumable', desc: '静音办公无线鼠标' },
];

const MY_EXISTING_ASSETS = [
  { id: 'AST-2023-089', name: 'MacBook Pro 14 (已领用)' },
  { id: 'AST-2022-102', name: '戴尔 U2720Q 显示器 (已领用)' }
];

const REASON_OPTIONS = [
  '新员入职',
  '设备损坏',
  '项目测试',
  '日常补充',
  '其他原因'
];

export default function AssetApplicationPrototype() {
  // UI 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('cat-nb-win'); // 默认选中叶子节点
  const [expandedNodes, setExpandedNodes] = useState(['c-pc', 'c-pc-l2', 'c-pc-l3-nb', 'c-office', 'c-office-l2', 'c-office-l3-acc']); // 默认展开4层
  const [topFilter, setTopFilter] = useState('all'); // 顶部过滤按钮状态
  const [message, setMessage] = useState('');
  
  // 业务状态
  const [cart, setCart] = useState([]);
  const [batchReason, setBatchReason] = useState('');

  // 安全的全局提示
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  // 过滤左侧资产列表
  const filteredAssets = useMemo(() => {
    return ASSET_LIBRARY.filter(asset => {
      const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 顶部筛选器联动
      const matchTopFilter = topFilter === 'all' || asset.type === topFilter;
      // 如果选了耗材快捷筛选，则全局搜索耗材；否则按树形菜单分类查找
      const matchCategory = topFilter === 'consumable' ? true : (activeCategoryId === 'all' || asset.categoryId === activeCategoryId);

      return matchSearch && matchTopFilter && matchCategory;
    });
  }, [searchQuery, activeCategoryId, topFilter]);

  const addToCart = (asset) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === asset.id);
      if (existing) {
        return prev.map(item => item.id === asset.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        ...asset, 
        quantity: 1, 
        reason: '', 
        customDesc: '', 
        relatedAsset: '' 
      }];
    });
    // 选品后给个小提示
    showMessage(`已将 ${asset.name} 添加到右侧明细`);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
  // 新增：处理复选框的切换逻辑
  const handleToggleAsset = (asset) => {
    const isSelected = cart.some(item => item.id === asset.id);
    if (isSelected) {
      removeFromCart(asset.id);
    } else {
      addToCart(asset);
    }
  };

  const updateCartItem = (id, field, value) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const applyBatchReason = () => {
    if (!batchReason) return;
    setCart(prev => prev.map(item => ({ ...item, reason: batchReason })));
    showMessage("已批量应用申请原因");
  };

  const handleSafeSubmit = () => {
    if (cart.length === 0) {
      showMessage("申请明细不能为空");
      return;
    }
    const invalidItem = cart.find(item => !item.reason);
    if (invalidItem) {
      showMessage("请确保右侧所有资产都已填写「申请原因」");
      return;
    }
    showMessage("✅ 资产申请提交成功！审批流程已发起。");
    setTimeout(() => {
      setCart([]);
    }, 2000);
  };

  // 递归渲染树形节点 (完美支持4层及以上)
  const renderTreeNodes = (nodes, level = 0) => {
    return nodes.map(node => {
      const isLeaf = !node.children || node.children.length === 0;
      const isExpanded = expandedNodes.includes(node.id);
      const isSelected = activeCategoryId === node.id;

      return (
        <div key={node.id} className="mb-0.5">
          <div 
            className={`flex items-center py-1.5 cursor-pointer select-none group transition-colors pr-2
              ${isLeaf && isSelected && topFilter === 'all' ? 'bg-blue-100 text-blue-700 font-medium border-r-2 border-blue-600' : 'hover:bg-slate-200/50 text-slate-700'}`}
            style={{ paddingLeft: `${0.75 + level * 0.8}rem` }} // 动态缩进，每层增加 0.8rem
            onClick={() => {
              if (isLeaf) {
                setActiveCategoryId(node.id);
                setTopFilter('all'); // 点击树节点自动切换回"全部资产"联动模式
              } else {
                toggleNode(node.id);
              }
            }}
          >
            {!isLeaf ? (
              <span className="mr-1 text-slate-400 group-hover:text-slate-600 shrink-0">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : <span className="w-4.5 shrink-0" />} {/* 叶子节点无图标占位对齐 */}
            <span className="text-[13px] truncate">{node.name}</span>
          </div>
          {!isLeaf && isExpanded && (
            <div className="flex flex-col">
              {renderTreeNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderLeftPanel = () => (
    <div className="w-[32%] min-w-[360px] max-w-[420px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
      {/* 搜索头与顶部快捷按钮 */}
      <div className="pt-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
        <h2 className="px-4 font-semibold text-slate-800 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-blue-600" />
          资产商城
        </h2>
        
        <div className="px-4 relative">
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="搜索物资名称或型号..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 顶部快捷过滤按钮 */}
        <div className="flex gap-2 px-4 pb-3">
          <button 
            onClick={() => setTopFilter('all')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-colors font-medium border ${topFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            全部资产
          </button>
          <button 
            onClick={() => setTopFilter('consumable')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-colors font-medium border ${topFilter === 'consumable' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            申请耗材
          </button>
        </div>
      </div>

      {/* 下半部分：树 + 列表 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左半区：树形菜单 (定宽以保证4层展示完整) */}
        <div className="w-[160px] min-w-[160px] shrink-0 bg-slate-50 border-r border-slate-200 overflow-y-auto py-2">
          {renderTreeNodes(TREE_CATEGORIES)}
        </div>

        {/* 右半区：紧凑型资产列表 */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col">
          <div className="text-xs font-semibold text-slate-400 p-3 pb-2 uppercase tracking-wider flex justify-between border-b border-slate-100 shrink-0">
            <span>{topFilter === 'consumable' ? '耗材列表' : '可选物资'}</span>
            <span>{filteredAssets.length} 项</span>
          </div>
          
          <div className="flex flex-col">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                无匹配物资
              </div>
            ) : (
              filteredAssets.map(asset => {
                const isSelected = cart.some(item => item.id === asset.id);
                return (
                  <div 
                    key={asset.id} 
                    onClick={() => handleToggleAsset(asset)}
                    className={`flex items-start gap-3 p-3 border-b border-slate-50 cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      readOnly
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[13px] leading-tight line-clamp-2 ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'}`} title={asset.name}>
                          {asset.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate mt-1" title={asset.desc}>{asset.desc}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRightPanel = () => (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-w-[600px]">
      {/* 头部与批量操作 */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          本次申请明细
          {cart.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </h2>
        
        {cart.length > 1 && (
          <div className="flex items-center gap-2 bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-xs font-medium text-blue-800">批量设置原因:</span>
            <select 
              className="text-xs border-slate-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              value={batchReason}
              onChange={(e) => setBatchReason(e.target.value)}
            >
              <option value="">选择原因...</option>
              {REASON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <button 
              onClick={applyBatchReason}
              disabled={!batchReason}
              className="text-xs bg-blue-600 disabled:bg-slate-400 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
              应用
            </button>
          </div>
        )}
      </div>

      {/* 表格区 */}
      <div className="flex-1 overflow-y-auto p-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-30 text-slate-300" />
            <p className="text-sm">请从左侧选择资产添加到申请清单</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 font-semibold w-1/4">资产名称</th>
                <th className="py-3 px-3 font-semibold w-20 text-center">数量</th>
                <th className="py-3 px-3 font-semibold w-28"><span className="text-red-500 mr-1">*</span>申请原因</th>
                <th className="py-3 px-3 font-semibold w-48">关联主资产 (耗材必填)</th>
                <th className="py-3 px-3 font-semibold">详细说明 (选填)</th>
                <th className="py-3 px-3 font-semibold w-12 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, index) => (
                <tr key={`${item.id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800 line-clamp-1" title={item.name}>{item.name}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm h-8 w-20">
                      <button 
                        className="px-2 h-full text-slate-500 hover:bg-slate-100 border-r border-slate-200 transition-colors"
                        onClick={() => updateCartItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                      >-</button>
                      <input 
                        type="text" 
                        value={item.quantity} 
                        readOnly 
                        className="w-full text-center text-xs outline-none font-medium text-slate-700 bg-transparent"
                      />
                      <button 
                        className="px-2 h-full text-slate-500 hover:bg-slate-100 border-l border-slate-200 transition-colors"
                        onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)}
                      >+</button>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <select 
                      className={`w-full text-xs border rounded-md shadow-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all
                        ${!item.reason ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      value={item.reason}
                      onChange={(e) => updateCartItem(item.id, 'reason', e.target.value)}
                    >
                      <option value="">请选择...</option>
                      {REASON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    {item.type === 'consumable' ? (
                      <select 
                        className="w-full text-xs border border-slate-300 rounded-md shadow-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                        value={item.relatedAsset}
                        onChange={(e) => updateCartItem(item.id, 'relatedAsset', e.target.value)}
                      >
                        <option value="">关联主资产...</option>
                        <optgroup label="您名下的资产">
                          {MY_EXISTING_ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </optgroup>
                        {cart.filter(c => c.type === 'main').length > 0 && (
                          <optgroup label="✨ 本次新申请主资产">
                            {cart.filter(c => c.type === 'main').map(a => (
                              <option key={`new-${a.id}`} value={`new-${a.id}`}>[新申请] {a.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    ) : (
                      <div className="w-full text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-md text-center">
                        无需关联
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <input 
                      type="text"
                      placeholder="补充说明..."
                      className="w-full text-xs border border-slate-300 rounded-md shadow-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      value={item.customDesc}
                      onChange={(e) => updateCartItem(item.id, 'customDesc', e.target.value)}
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors inline-flex"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 底部操作区 */}
      <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
        <div className="text-sm text-slate-600 flex items-center gap-2">
          已选 <span className="font-bold text-blue-600 text-lg">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span> 件物资
        </div>
        <button 
          onClick={handleSafeSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Check className="w-4 h-4" />
          提交审批
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full font-sans bg-slate-100 flex p-4 gap-4 overflow-hidden relative">
      {/* 全局 Toast 提示 */}
      {message && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-fade-in-down">
          <span>{message}</span>
        </div>
      )}
      
      {/* 左右分栏布局 */}
      {renderLeftPanel()}
      {renderRightPanel()}
    </div>
  );
}