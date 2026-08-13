import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Handshake, Monitor, Hash, PackageOpen,
  Plus, Copy, Laptop, ChevronLeft, ChevronRight,
  Undo2, ArrowRightLeft, Wrench
} from 'lucide-react';
import { mockComprehensiveData } from '../mock/businessRulesMock';
import { EMPLOYEE_CONTRACT_NUMBERS } from '../mock/assetReturnMock';

// --- 模拟数据 ---
const MOCK_DATA = {
  user: {
    name: '周琦星',
    id: '220784',
    department: '集团总部'
  },
  assets: [
    {
      id: 'A2024001234',
      category: '电脑整机-笔记本电脑',
      name: '联想 ThinkPad T14',
      desc: '电脑整机 · 笔记本电脑 · 员工用机',
      config: 'i7-1360P / 16GB / 512GB SSD / Win11 专业版',
      quantity: 1,
      status: 'in-use',
      usage: '员工用机',
      icon: 'laptop',
      materialRuleId: 3,
      borrowed: false,
    },
    {
      id: 'A2024002345',
      category: '显示设备-显示器',
      name: '戴尔 P2422H 显示器',
      desc: '显示设备 · 显示器 · 借用资产',
      config: '24英寸 / 1920×1080 / IPS / HDMI+DP',
      quantity: 1,
      status: 'in-use',
      usage: '员工用机',
      icon: 'monitor',
      materialRuleId: 3,
      borrowed: true,
    },
    {
      id: 'A2024003456',
      category: '电脑配件-鼠标',
      name: '罗技 MX Master 3S',
      desc: '电脑配件 · 鼠标 · 日常办公',
      config: '蓝牙 / 2.4G / 可充电 / 黑色',
      quantity: 1,
      status: 'in-use',
      usage: '日常办公',
      icon: 'package',
      materialRuleId: 2,
      borrowed: false,
    }
  ],
  consumables: [
    {
      id: 'CON-2023001',
      category: '移动设备充电插头',
      name: '苹果 35W 双USB-C 电源适配器',
      desc: '配件 · 充电插头 · 日常办公',
      config: '原装 35W',
      quantity: 1,
      status: 'in-use',
      usage: '日常办公',
      icon: 'package'
    },
    {
      id: 'CON-2023089',
      category: '外设配件',
      name: '罗技 MX Master 3S 无线鼠标',
      desc: '配件 · 无线鼠标 · 日常办公',
      config: '静音版 8K DPI',
      quantity: 1,
      status: 'in-use',
      usage: '日常办公',
      icon: 'package'
    }
  ],
  contracts: EMPLOYEE_CONTRACT_NUMBERS.map((item) => ({
    id: item.number,
    contractNumber: item.number,
    description: item.description,
  })),
};

const isEnabledRule = (value) => value === '1' || value === 1 || value === true || value === '是';

function getAssetActions(asset) {
  if (asset.borrowed) {
    return { canReturn: true, canTransfer: false, canReplace: false };
  }
  const rule = mockComprehensiveData.find((item) => item.id === asset.materialRuleId);
  return {
    canReturn: isEnabledRule(rule?.allowReturn),
    canTransfer: isEnabledRule(rule?.allowTransfer),
    canReplace: isEnabledRule(rule?.allowReplace),
  };
}

export default function PersonalWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  const selectedAssets = useMemo(
    () => MOCK_DATA.assets.filter((item) => selectedAssetIds.includes(item.id)),
    [selectedAssetIds]
  );

  const batchPermissions = useMemo(() => ({
    canReturn: selectedAssets.length > 1 && selectedAssets.every((item) => getAssetActions(item).canReturn),
    canTransfer: selectedAssets.length > 1 && selectedAssets.every((item) => getAssetActions(item).canTransfer),
    canReplace: selectedAssets.length > 1 && selectedAssets.every((item) => getAssetActions(item).canReplace),
  }), [selectedAssets]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedAssetIds([]);
  };

  const navigateAssetAction = (action, assets) => {
    const assetTags = assets.map((item) => item.id);
    if (!assetTags.length) return;
    if (action === 'return') {
      navigate('/yewurules', { state: { workspace: '资产退库', prefillAssetTags: assetTags, source: 'personal-workspace' } });
      return;
    }
    if (action === 'replace') {
      navigate('/yewurules', { state: { workspace: '资产更换申请', prefillAssetTags: assetTags, source: 'personal-workspace' } });
      return;
    }
    navigate('/People', { state: { prefillAssetTags: assetTags, source: 'personal-workspace' } });
  };

  const navigateContractReturn = (record) => {
    navigate('/yewurules', {
      state: {
        workspace: '合约号码退库',
        prefillContractNumbers: [record.contractNumber],
        source: 'personal-workspace',
      },
    });
  };

  // 动态获取当前日期，格式化为类似 "7月19日 星期日"
  const getTodayString = () => {
    const today = new Date();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${today.getMonth() + 1}月${today.getDate()}日 ${days[today.getDay()]}`;
  };

  const StatusBadge = ({ status }) => {
    if (status === 'in-use') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-600 bg-emerald-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          在用·使用中
        </span>
      );
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-100">未知状态</span>;
  };

  const renderItemIcon = (type) => {
    switch (type) {
      case 'monitor': return <Monitor className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'hash': return <Hash className="w-5 h-5" />;
      default: return <PackageOpen className="w-5 h-5" />;
    }
  };

  const renderTopBanner = () => (
    <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between px-5 py-4 md:px-6 md:py-5 text-white mb-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400 opacity-[0.08] rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>
      <div className="relative z-10 mb-6 md:mb-0">
        <div className="text-blue-100/80 text-sm font-medium tracking-wider mb-2">{getTodayString()}</div>
        <h2 className="text-xl md:text-2xl font-bold mb-1.5 tracking-tight">上午好，{MOCK_DATA.user.name}</h2>
        <p className="text-blue-100/90 text-[14px]">
          您名下共有 <span className="font-bold text-white">{MOCK_DATA.assets.length + MOCK_DATA.consumables.length}</span> 项资产与耗材运行正常，另有 <span className="font-bold text-amber-300">0 条待办</span> 等待处理。
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <button
          className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-[14px] font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95"
          onClick={() => navigate('/employee-self-service/asset-apply')}
        >
          <Plus className="w-4 h-4" />
          物资申请
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-[14px] font-medium transition-all flex items-center gap-2 backdrop-blur-sm active:scale-95">
          <Handshake className="w-4 h-4" />
          资产借用
        </button>
      </div>
    </div>
  );

  const renderAssetOperations = (item) => {
    const actions = getAssetActions(item);
    return (
      <div className="flex items-center justify-end gap-1">
        {actions.canReturn && (
          <button
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            title="退库"
            onClick={() => navigateAssetAction('return', [item])}
          >
            <Undo2 className="w-3.5 h-3.5" /><span>退库</span>
          </button>
        )}
        {actions.canTransfer && (
          <button
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            title="转移"
            onClick={() => navigateAssetAction('transfer', [item])}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /><span>转移</span>
          </button>
        )}
        {actions.canReplace && (
          <button
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            title="更换"
            onClick={() => navigateAssetAction('replace', [item])}
          >
            <Wrench className="w-3.5 h-3.5" /><span>更换</span>
          </button>
        )}
      </div>
    );
  };

  const renderContractTable = (displayData) => (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[720px]">
        <thead>
          <tr className="bg-white text-slate-500 text-[13px] border-b border-slate-100">
            <th className="py-3 px-5 font-medium w-56">合约号码</th>
            <th className="py-3 px-5 font-medium">合约号码说明</th>
            <th className="py-3 px-5 font-medium w-32 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {displayData.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3.5 px-5 font-medium text-slate-700">{item.contractNumber}</td>
              <td className="py-3.5 px-5 text-[13px] text-slate-600">{item.description || '-'}</td>
              <td className="py-3.5 px-5 text-right">
                <button
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                  onClick={() => navigateContractReturn(item)}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>退库</span>
                </button>
              </td>
            </tr>
          ))}
          {displayData.length === 0 && (
            <tr><td colSpan="3" className="py-20 text-center text-slate-400">暂无合约号码</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTableArea = () => {
    let displayData = [];
    if (activeTab === 'assets') displayData = MOCK_DATA.assets;
    if (activeTab === 'consumables') displayData = MOCK_DATA.consumables;
    if (activeTab === 'contracts') displayData = MOCK_DATA.contracts;

    const keyword = searchQuery.trim().toLowerCase();
    if (keyword) {
      displayData = displayData.filter((item) => (
        activeTab === 'contracts'
          ? `${item.contractNumber} ${item.description}`.toLowerCase().includes(keyword)
          : `${item.id} ${item.name} ${item.category} ${item.config}`.toLowerCase().includes(keyword)
      ));
    }

    const allVisibleAssetIds = activeTab === 'assets' ? displayData.map((item) => item.id) : [];
    const allAssetsSelected = allVisibleAssetIds.length > 0 && allVisibleAssetIds.every((id) => selectedAssetIds.includes(id));

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[380px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-2 sm:px-6 bg-white pt-2">
          <div className="flex gap-2">
            <button onClick={() => changeTab('assets')} className={`px-3 py-2.5 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${activeTab === 'assets' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}>
              <Monitor className="w-4 h-4" />
              资产
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${activeTab === 'assets' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{MOCK_DATA.assets.length}</span>
              {activeTab === 'assets' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full"></div>}
            </button>
            <button onClick={() => changeTab('consumables')} className={`px-3 py-2.5 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${activeTab === 'consumables' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}>
              <PackageOpen className="w-4 h-4" />
              耗材
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${activeTab === 'consumables' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{MOCK_DATA.consumables.length}</span>
              {activeTab === 'consumables' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full"></div>}
            </button>
            <button onClick={() => changeTab('contracts')} className={`px-3 py-2.5 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${activeTab === 'contracts' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}>
              <Hash className="w-4 h-4" />
              合约号码
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${activeTab === 'contracts' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{MOCK_DATA.contracts.length}</span>
              {activeTab === 'contracts' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full"></div>}
            </button>
          </div>
          <div className="py-2 px-3 sm:px-0 sm:py-0 w-full sm:w-[260px]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'contracts' ? '搜索合约号码或说明...' : '搜索标签号、名称或分类...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {activeTab === 'assets' && selectedAssets.length > 1 && (
          <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50/50 px-5 py-2.5">
            <span className="text-sm text-slate-600">已选择 {selectedAssets.length} 项资产</span>
            <div className="flex items-center gap-2">
              {batchPermissions.canReturn && <button className="text-sm text-blue-600" onClick={() => navigateAssetAction('return', selectedAssets)}>批量退库</button>}
              {batchPermissions.canTransfer && <button className="text-sm text-blue-600" onClick={() => navigateAssetAction('transfer', selectedAssets)}>批量转移</button>}
              {batchPermissions.canReplace && <button className="text-sm text-blue-600" onClick={() => navigateAssetAction('replace', selectedAssets)}>批量更换</button>}
            </div>
          </div>
        )}

        {activeTab === 'contracts' ? renderContractTable(displayData) : (
          <div className="flex-1 overflow-x-auto">
            <table className={`w-full text-left border-collapse ${activeTab === 'assets' ? 'min-w-[1200px]' : 'min-w-[1050px]'}`}>
              <thead>
                <tr className="bg-white text-slate-500 text-[13px] border-b border-slate-100">
                  {activeTab === 'assets' && (
                    <th className="py-3 px-4 font-medium w-10 sticky left-0 bg-white z-30">
                      <input
                        type="checkbox"
                        checked={allAssetsSelected}
                        onChange={(event) => setSelectedAssetIds(event.target.checked ? allVisibleAssetIds : [])}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className={`py-3 px-2 font-medium w-72 ${activeTab === 'assets' ? 'sticky left-[40px] bg-white z-30' : ''}`}>资产信息</th>
                  <th className="py-3 px-3 font-medium w-44">资产标签号</th>
                  <th className="py-3 px-3 font-medium">资产配置</th>
                  <th className="py-3 px-3 font-medium w-24 text-center">数量</th>
                  <th className="py-3 px-3 font-medium w-36 text-center">状态</th>
                  <th className="py-3 px-4 font-medium w-64 text-right sticky right-0 bg-white z-30 border-l border-slate-200">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    {activeTab === 'assets' && (
                      <td className="py-3.5 px-4 sticky left-0 bg-white z-20 group-hover:bg-slate-50/50">
                        <input
                          type="checkbox"
                          checked={selectedAssetIds.includes(item.id)}
                          onChange={(event) => setSelectedAssetIds((current) => (
                            event.target.checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id)
                          ))}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className={`py-3.5 px-2 ${activeTab === 'assets' ? 'sticky left-[40px] bg-white z-20 group-hover:bg-slate-50/50' : ''}`}>
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">{renderItemIcon(item.icon)}</div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-slate-800 line-clamp-1 mb-0.5">{item.name}</span>
                          <span className="text-[12px] text-slate-400 line-clamp-1">{item.desc}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3"><div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded text-xs font-mono text-slate-600 group/tag cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors">{item.id}<Copy className="w-3 h-3 text-slate-300 group-hover/tag:text-slate-500" /></div></td>
                    <td className="py-3.5 px-3"><span className="text-[13px] text-slate-500 line-clamp-2" title={item.config}>{item.config}</span></td>
                    <td className="py-3 px-3 text-center"><span className="text-[14px] font-semibold text-slate-700">{item.quantity}</span></td>
                    <td className="py-3 px-3 text-center"><StatusBadge status={item.status} /></td>
                    <td className="py-3.5 px-4 sticky right-0 bg-white z-20 border-l border-slate-100 group-hover:bg-slate-50/50">
                      {activeTab === 'assets' ? renderAssetOperations(item) : <span className="block text-right text-slate-400">-</span>}
                    </td>
                  </tr>
                ))}
                {displayData.length === 0 && (
                  <tr><td colSpan={activeTab === 'assets' ? 7 : 6} className="py-20 text-center text-slate-400"><div className="flex flex-col items-center justify-center"><PackageOpen className="w-12 h-12 mb-3 opacity-20" /><p className="text-sm">暂无对应的资产数据</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-sm text-slate-500 mt-auto">
          <span>共 {displayData.length} 条记录</span>
          <div className="flex items-center gap-2">
            <select className="border-slate-200 rounded-md text-[13px] py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-600"><option>10 条/页</option><option>20 条/页</option></select>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-100 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-600 text-white text-[13px] font-medium shadow-sm">1</button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-100 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50/50 text-slate-800 font-sans p-3 md:p-5 min-h-screen w-full">
      <div className="max-w-[1480px] mx-auto w-full">
        {renderTopBanner()}
        {renderTableArea()}
      </div>
    </div>
  );
}
