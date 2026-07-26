import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import {
  ASSET_LIBRARY,
  MY_EXISTING_ASSETS,
  REASON_OPTIONS,
  TREE_CATEGORIES,
} from '../mock/assetApplicationMock';
import { addAssetApplication } from '../services/demoStorage';

const DEFAULT_EXPANDED_NODES = ['c-pc', 'c-pc-l2', 'c-pc-l3-nb', 'c-office', 'c-office-l2', 'c-office-l3-acc'];

function buildApplication(cart) {
  const now = new Date();
  const dateText = now.toISOString().slice(0, 10);
  const serial = String(now.getTime()).slice(-6);

  return {
    id: `CA-${dateText.replaceAll('-', '')}${serial}`,
    applyDate: dateText,
    status: 'pending',
    applicant: {
      id: '213852',
      name: '孙志强',
      phone: '010-00000001',
      email: 'demo@sohu-lab.com',
      department: '集团总部-员工服务中心-资产部',
    },
    materials: cart.map((item) => ({
      id: item.id,
      name: item.name,
      desc: item.desc,
      config: item.desc,
      detail: item.customDesc || '-',
      reason: item.reason,
      usage: item.type === 'consumable' ? '耗材补充' : '办公使用',
      relatedAsset: item.relatedAsset || '',
      isOverStandard: false,
      quantity: item.quantity,
    })),
    approvalHistory: [
      { node: '开始', person: '213852-孙志强', agent: '-', status: 'submitted', time: now.toLocaleString('zh-CN', { hour12: false }), comment: '-' },
      { node: '资产管理员-审批', person: '当前用户', agent: '-', status: 'pending', time: '-', comment: '-' },
    ],
  };
}

export default function AssetApplicationPrototype() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('cat-nb-win');
  const [expandedNodes, setExpandedNodes] = useState(DEFAULT_EXPANDED_NODES);
  const [topFilter, setTopFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [batchReason, setBatchReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const showMessage = (msg) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const filteredAssets = useMemo(() => {
    return ASSET_LIBRARY.filter((asset) => {
      const keyword = searchQuery.trim().toLowerCase();
      const matchSearch = !keyword || asset.name.toLowerCase().includes(keyword) || asset.desc.toLowerCase().includes(keyword);
      const matchTopFilter = topFilter === 'all' || asset.type === topFilter;
      const matchCategory = topFilter === 'consumable' || activeCategoryId === 'all' || asset.categoryId === activeCategoryId;
      return matchSearch && matchTopFilter && matchCategory;
    });
  }, [searchQuery, activeCategoryId, topFilter]);

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]));
  };

  const addToCart = (asset) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === asset.id);
      if (existing) {
        return prev.map((item) => (item.id === asset.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          ...asset,
          quantity: 1,
          reason: '',
          customDesc: '',
          relatedAsset: '',
        },
      ];
    });
    showMessage(`已将 ${asset.name} 添加到右侧明细`);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleToggleAsset = (asset) => {
    const isSelected = cart.some((item) => item.id === asset.id);
    if (isSelected) {
      removeFromCart(asset.id);
      return;
    }
    addToCart(asset);
  };

  const updateCartItem = (id, field, value) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const applyBatchReason = () => {
    if (!batchReason) return;
    setCart((prev) => prev.map((item) => ({ ...item, reason: batchReason })));
    showMessage('已批量应用申请原因');
  };

  const handleSafeSubmit = () => {
    if (cart.length === 0) {
      showMessage('申请明细不能为空');
      return;
    }

    if (cart.some((item) => !item.reason)) {
      showMessage('请确保右侧所有资产都已填写「申请原因」');
      return;
    }

    if (cart.some((item) => item.type === 'consumable' && !item.relatedAsset)) {
      showMessage('耗材类物资必须关联主资产');
      return;
    }

    addAssetApplication(buildApplication(cart));
    setCart([]);
    setBatchReason('');
    showMessage('✅ 资产申请提交成功！审批流程已发起。');
  };

  const renderTreeNodes = (nodes, level = 0) => {
    return nodes.map((node) => {
      const isLeaf = !node.children || node.children.length === 0;
      const isExpanded = expandedNodes.includes(node.id);
      const isSelected = activeCategoryId === node.id;

      return (
        <div key={node.id} className="mb-0.5">
          <div
            className={`flex items-center py-1.5 cursor-pointer select-none group transition-colors pr-2 ${
              isLeaf && isSelected && topFilter === 'all'
                ? 'bg-blue-100 text-blue-700 font-medium border-r-2 border-blue-600'
                : 'hover:bg-slate-200/50 text-slate-700'
            }`}
            style={{ paddingLeft: `${0.75 + level * 0.8}rem` }}
            onClick={() => {
              if (isLeaf) {
                setActiveCategoryId(node.id);
                setTopFilter('all');
              } else {
                toggleNode(node.id);
              }
            }}
          >
            {!isLeaf ? (
              <span className="mr-1 text-slate-400 group-hover:text-slate-600 shrink-0">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : (
              <span className="w-4.5 shrink-0" />
            )}
            <span className="text-[13px] truncate">{node.name}</span>
          </div>
          {!isLeaf && isExpanded && <div className="flex flex-col">{renderTreeNodes(node.children, level + 1)}</div>}
        </div>
      );
    });
  };

  const renderLeftPanel = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="pt-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
        <div className="px-4 relative">
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索物资名称或型号..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm outline-none transition-all"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="flex border-b border-slate-200 mx-4">
          <button
            onClick={() => setTopFilter('all')}
            className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${topFilter === 'all' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            全部资产
            {topFilter === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setTopFilter('consumable')}
            className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${topFilter === 'consumable' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            耗材配件
            {topFilter === 'consumable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[200px] min-w-[200px] shrink-0 bg-slate-50 border-r border-slate-200 overflow-y-auto py-2">{renderTreeNodes(TREE_CATEGORIES)}</div>
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
              filteredAssets.map((asset) => {
                const isSelected = cart.some((item) => item.id === asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleToggleAsset(asset)}
                    className={`flex items-start gap-3 p-3 border-b border-slate-50 cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                  >
                    <input type="checkbox" checked={isSelected} readOnly className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0" />
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <span className={`text-[13px] leading-tight line-clamp-2 ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'}`} title={asset.name}>
                        {asset.name}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate mt-1" title={asset.desc}>
                        {asset.desc}
                      </span>
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

  const renderAssetModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-5xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              资产商城
            </h2>
            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex overflow-hidden min-h-0">{renderLeftPanel()}</div>
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-sm text-slate-500">
              已选 <span className="font-bold text-blue-600">{selectedCount}</span> 件
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                返回
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRightPanel = () => (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-w-[600px]">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            本次申请明细
            {cart.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{selectedCount}</span>}
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            添加物资
          </button>
        </div>

        {cart.length > 1 && (
          <div className="flex items-center gap-2 bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-xs font-medium text-blue-800">批量设置原因:</span>
            <select className="text-xs border-slate-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none" value={batchReason} onChange={(event) => setBatchReason(event.target.value)}>
              <option value="">选择原因...</option>
              {REASON_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button onClick={applyBatchReason} disabled={!batchReason} className="text-xs bg-blue-600 disabled:bg-slate-400 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm">
              应用
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-30 text-slate-300" />
            <p className="text-sm">请点击上方「添加物资」按钮选择资产</p>
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
                      <button className="px-2 h-full text-slate-500 hover:bg-slate-100 border-r border-slate-200 transition-colors" onClick={() => updateCartItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}>-</button>
                      <input type="text" value={item.quantity} readOnly className="w-full text-center text-xs outline-none font-medium text-slate-700 bg-transparent" />
                      <button className="px-2 h-full text-slate-500 hover:bg-slate-100 border-l border-slate-200 transition-colors" onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)}>+</button>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      className={`w-full text-xs border rounded-md shadow-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all ${!item.reason ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      value={item.reason}
                      onChange={(event) => updateCartItem(item.id, 'reason', event.target.value)}
                    >
                      <option value="">请选择...</option>
                      {REASON_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    {item.type === 'consumable' ? (
                      <select className="w-full text-xs border border-slate-300 rounded-md shadow-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all bg-white" value={item.relatedAsset} onChange={(event) => updateCartItem(item.id, 'relatedAsset', event.target.value)}>
                        <option value="">关联主资产...</option>
                        <optgroup label="您名下的资产">
                          {MY_EXISTING_ASSETS.map((asset) => (
                            <option key={asset.id} value={asset.id}>{asset.name}</option>
                          ))}
                        </optgroup>
                        {cart.filter((current) => current.type === 'main').length > 0 && (
                          <optgroup label="✨ 本次新申请主资产">
                            {cart.filter((current) => current.type === 'main').map((asset) => (
                              <option key={`new-${asset.id}`} value={`new-${asset.id}`}>[新申请] {asset.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    ) : (
                      <div className="w-full text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-md text-center">无需关联</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <input type="text" placeholder="补充说明..." className="w-full text-xs border border-slate-300 rounded-md shadow-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all" value={item.customDesc} onChange={(event) => updateCartItem(item.id, 'customDesc', event.target.value)} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors inline-flex" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
        <div className="text-sm text-slate-600 flex items-center gap-2">
          已选 <span className="font-bold text-blue-600 text-lg">{selectedCount}</span> 件物资
        </div>
        <button onClick={handleSafeSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-all shadow-sm">
          <Check className="w-4 h-4" />
          提交审批
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full font-sans bg-slate-100 flex p-4 gap-4 overflow-hidden relative">
      {message && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-fade-in-down">
          <span>{message}</span>
        </div>
      )}
      {renderAssetModal()}
      {renderRightPanel()}
    </div>
  );
}
