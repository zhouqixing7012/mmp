import React, { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Database,
  FileText,
  History,
  Home,
  Laptop,
  Monitor,
  Package,
  Plus,
  Repeat2,
  RotateCcw,
  ScanLine,
  Search,
  ShoppingCart,
  Wrench,
  X,
} from 'lucide-react';
import { Input, InputNumber, message as antdMessage } from 'antd';
import { MY_EXISTING_ASSETS } from '../../mock/assetApplicationMock';

const PRIMARY = '#4fb2c5';

const CONSUMABLES = [
  { id: 'C001', name: '罗技 MX Master 3S', desc: '办公耗材-鼠标', quantity: 1 },
  { id: 'C002', name: '绿联 Type-C 多功能转接器', desc: '电脑配件-转接线', quantity: 1 },
];

const BORROWED_ASSETS = [
  {
    id: 'B001',
    name: '戴尔 Latitude 7440',
    assetTag: '114260800188',
    desc: 'NOTEBOOK-笔记本-技术笔记本',
    dueDate: '2026-08-25',
  },
];

const HISTORY_RECORDS = [
  { id: 'MA-202608130001', type: '物资申请', title: 'ThinkPad T14 笔记本', status: '处理中', date: '2026-08-13' },
  { id: 'RP-202608120021', type: '资产更换', title: '微软 Surface Laptop 4', status: '处理中', date: '2026-08-12' },
  { id: 'BR-202608080015', type: '资产借用', title: '戴尔 Latitude 7440', status: '已完成', date: '2026-08-08' },
  { id: 'RT-202608050008', type: '资产退库', title: '戴尔 E2417H显示器', status: '已完成', date: '2026-08-05' },
];

const MATERIAL_OPTIONS = [
  { id: 'M001', type: '资产', name: '联想 ThinkPad T14', config: 'Ultra 7 / 32G / 1T SSD' },
  { id: 'M002', type: '资产', name: '苹果 MacBook Pro 14', config: 'M3 Pro / 18G / 512G SSD' },
  { id: 'M003', type: '耗材', name: '罗技 MX Master 3S', config: '静音 / 无线 / 蓝牙' },
  { id: 'M004', type: '耗材', name: 'Type-C 多功能转接器', config: '转接线.绿联、CELINK、苹果.Type-C转（VGA/以太网/USB/Type-C）' },
];

function MobileHeader({ title, onBack, onClose }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
      <button type="button" className="rounded-full p-2 text-slate-700 hover:bg-slate-50" onClick={onBack}>
        <ArrowLeft size={24} />
      </button>
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <button type="button" className="rounded-full p-2 text-slate-700 hover:bg-slate-50" onClick={onClose}>
        <X size={24} />
      </button>
    </div>
  );
}

function SegmentedTabs({ items, value, onChange }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
      {items.map((item) => (
        <button
          type="button"
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`rounded-xl px-2 py-2 text-sm transition ${value === item.value ? 'font-medium text-white' : 'text-slate-500'}`}
          style={value === item.value ? { backgroundColor: PRIMARY } : undefined}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function BottomNav({ active, onChange, onPlus }) {
  const items = [
    { key: 'home', label: '首页', icon: Home },
    { key: 'history', label: '历史单据', icon: History },
    { key: 'plus', label: '', icon: Plus },
    { key: 'inventory', label: '盘点', icon: Database },
    { key: 'scan', label: '扫一扫', icon: ScanLine },
  ];

  return (
    <div className="grid h-[76px] shrink-0 grid-cols-5 border-t border-slate-100 bg-white px-1">
      {items.map((item) => {
        const Icon = item.icon;
        if (item.key === 'plus') {
          return (
            <button key={item.key} type="button" className="flex items-center justify-center" onClick={onPlus}>
              <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: PRIMARY }}>
                <Icon size={28} />
              </span>
            </button>
          );
        }
        const selected = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            className="flex flex-col items-center justify-center gap-1 text-[11px]"
            style={{ color: selected ? PRIMARY : '#7b8494' }}
            onClick={() => onChange(item.key)}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AssetIcon({ kind = 'asset' }) {
  const Icon = kind === 'consumable' ? Package : kind === 'borrow' ? Clock3 : Laptop;
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-sky-100" style={{ color: PRIMARY }}>
      <Icon size={28} />
    </div>
  );
}

function HomeScreen({ onOpen, onBottomNav, onPlus }) {
  const [tab, setTab] = useState('asset');
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  const data = useMemo(() => {
    if (tab === 'asset') return MY_EXISTING_ASSETS;
    if (tab === 'consumable') return CONSUMABLES;
    return BORROWED_ASSETS;
  }, [tab]);

  const visibleData = data.filter((item) => {
    const text = `${item.name || ''} ${item.assetTag || ''} ${item.desc || item.assetDesc || ''}`.toLowerCase();
    return !keyword.trim() || text.includes(keyword.trim().toLowerCase());
  });

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
        <div className="bg-white">
          <MobileHeader title="资产管理" onBack={() => {}} onClose={() => {}} />
          <div className="relative h-36 overflow-hidden bg-gradient-to-br from-cyan-400 via-cyan-500 to-sky-500 px-6 py-5 text-white">
            <div className="absolute -right-8 top-1 h-36 w-36 rounded-full border-[22px] border-white/10" />
            <div className="absolute bottom-2 right-16 h-20 w-32 rotate-[-8deg] rounded-2xl border border-white/20 bg-white/10" />
            <Repeat2 size={58} className="absolute bottom-9 right-28 text-white/60" />
            <div className="relative z-10 pt-2">
              <div className="text-sm text-white/80">个人资产服务</div>
              <div className="mt-2 text-2xl font-semibold">资产管理</div>
              <div className="mt-2 text-xs text-white/80">申请 · 借用 · 更换 · 退库</div>
            </div>
          </div>
        </div>

        <div className="mx-4 -mt-4 relative z-10 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
          <div className="min-w-0 flex-1">
            <SegmentedTabs
              value={tab}
              onChange={(next) => {
                setTab(next);
                setKeyword('');
              }}
              items={[
                { value: 'asset', label: '资产' },
                { value: 'consumable', label: '耗材' },
                { value: 'borrow', label: '借用' },
              ]}
            />
          </div>
          <button type="button" className="p-2 text-slate-400" onClick={() => setSearching((value) => !value)}>
            <Search size={24} />
          </button>
        </div>

        {searching && (
          <div className="mx-4 mt-3">
            <Input
              allowClear
              prefix={<Search size={16} className="text-slate-400" />}
              placeholder="搜索资产说明或标签号"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        )}

        <div className="space-y-3 p-4">
          {visibleData.map((item) => {
            const assetTag = item.assetTag || item.id;
            const description = item.desc || item.assetDesc || `数量：${item.quantity}`;
            return (
              <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex gap-3">
                  <AssetIcon kind={tab === 'borrow' ? 'borrow' : tab === 'consumable' ? 'consumable' : 'asset'} />
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen('assetDetail', { ...item, assetTag, description, source: tab })}>
                    <div className="truncate font-medium text-slate-900">{item.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{assetTag}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-400">{description}</div>
                  </button>
                  <ChevronRight size={20} className="mt-4 shrink-0 text-slate-300" />
                </div>
                {tab === 'asset' && (
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: PRIMARY, color: PRIMARY }} onClick={() => onOpen('return', item)}>退库</button>
                    <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: PRIMARY, color: PRIMARY }} onClick={() => onOpen('replace', item)}>更换</button>
                  </div>
                )}
                {tab === 'borrow' && item.dueDate && (
                  <div className="mt-3 border-t border-slate-100 pt-3 text-right text-xs text-slate-400">借用到期：{item.dueDate}</div>
                )}
              </div>
            );
          })}
          {visibleData.length === 0 && (
            <div className="py-20 text-center text-sm text-slate-400">暂无相关数据</div>
          )}
        </div>
      </div>
      <BottomNav active="home" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function HistoryScreen({ onBottomNav, onPlus }) {
  const [status, setStatus] = useState('pending');
  const [filterOpen, setFilterOpen] = useState(false);
  const [type, setType] = useState('全部');
  const types = ['全部', '物资申请', '资产借用', '资产更换', '资产退库'];
  const records = HISTORY_RECORDS.filter((item) => (
    (status === 'pending' ? item.status !== '已完成' : item.status === '已完成')
    && (type === '全部' || item.type === type)
  ));

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
        <MobileHeader title="历史单据" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <SegmentedTabs
              value={status}
              onChange={setStatus}
              items={[
                { value: 'pending', label: '未完成' },
                { value: 'done', label: '已完成' },
              ]}
            />
          </div>
          <button type="button" className="p-2 text-slate-400" onClick={() => setFilterOpen((value) => !value)}><Search size={24} /></button>
        </div>

        {filterOpen && (
          <div className="border-b border-slate-100 bg-white p-4">
            <div className="mb-3 text-sm font-medium text-slate-700">单据类型</div>
            <div className="grid grid-cols-3 gap-2">
              {types.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setType(item)}
                  className={`rounded-lg px-2 py-2 text-xs ${type === item ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
                  style={type === item ? { backgroundColor: PRIMARY } : undefined}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 p-4">
          {records.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{item.type}</div>
                  <div className="mt-2 text-sm text-slate-600">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.id} · {item.date}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${item.status === '已完成' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
              </div>
            </div>
          ))}
          {records.length === 0 && <div className="py-24 text-center text-sm text-slate-400">暂无相关单据</div>}
        </div>
      </div>
      <BottomNav active="history" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function InventoryScreen({ onBottomNav, onPlus, onOpen }) {
  const [tab, setTab] = useState('todo');
  const [keyword, setKeyword] = useState('');
  const [checkedIds, setCheckedIds] = useState(['112161100271-V']);
  const data = MY_EXISTING_ASSETS.filter((asset) => (
    (tab === 'done' ? checkedIds.includes(asset.id) : !checkedIds.includes(asset.id))
    && (!keyword.trim() || `${asset.name} ${asset.assetTag} ${asset.config}`.toLowerCase().includes(keyword.trim().toLowerCase()))
  ));

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
        <MobileHeader title="我的资产" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="bg-white p-4">
          <SegmentedTabs value={tab} onChange={setTab} items={[{ value: 'todo', label: '未盘' }, { value: 'done', label: '已盘' }]} />
          <Input className="mt-3" prefix={<Search size={16} className="text-slate-400" />} placeholder="输入资产说明、标签号、序列号" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
        <div className="px-4 py-3 text-sm font-medium text-slate-600">{tab === 'done' ? '已盘' : '未盘'} · 共 {data.length} 条</div>
        <div className="space-y-3 px-4 pb-4">
          {data.map((asset) => (
            <button
              type="button"
              key={asset.id}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"
              onClick={() => onOpen('inventoryDetail', { ...asset, checked: checkedIds.includes(asset.id), onChecked: () => setCheckedIds((ids) => ids.includes(asset.id) ? ids : [...ids, asset.id]) })}
            >
              <AssetIcon />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-900">{asset.name}</div>
                <div className="mt-1 text-sm text-slate-500">{asset.assetTag}</div>
                <div className="mt-1 truncate text-xs text-slate-400">{asset.config}</div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          ))}
          {data.length === 0 && <div className="py-20 text-center text-sm text-slate-400">暂无数据</div>}
        </div>
      </div>
      <BottomNav active="inventory" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function ScanScreen({ onBottomNav, onPlus, onOpen }) {
  const [value, setValue] = useState('');
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const handleLookup = () => {
    const asset = MY_EXISTING_ASSETS.find((item) => item.assetTag === value.trim());
    if (!asset) {
      messageApi.warning('未找到该资产标签号');
      return;
    }
    onOpen('assetDetail', { ...asset, source: 'asset' });
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-0 flex-1 overflow-auto bg-slate-950 text-white">
        <MobileHeader title="扫一扫" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="flex min-h-[520px] flex-col items-center justify-center px-8">
          <div className="relative h-64 w-64 rounded-3xl border-2 border-white/70">
            <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
            <ScanLine size={72} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
          </div>
          <div className="mt-8 text-sm text-white/70">摄像头扫码在原型中以标签号输入模拟</div>
          <div className="mt-4 flex w-full gap-2">
            <Input placeholder="输入资产标签号" value={value} onChange={(event) => setValue(event.target.value)} onPressEnter={handleLookup} />
            <button type="button" className="shrink-0 rounded-lg px-4 text-sm text-white" style={{ backgroundColor: PRIMARY }} onClick={handleLookup}>查询</button>
          </div>
        </div>
      </div>
      <BottomNav active="scan" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function AssetDetailScreen({ asset, onBack, onOpen }) {
  const rows = [
    ['标签号', asset.assetTag || asset.id],
    ['数量', asset.quantity || 1],
    ['用途', asset.purpose || '员工用机'],
    ['使用状态', asset.status || '在用-使用中'],
    ['说明', asset.assetDesc || asset.name],
    ['配置', asset.config || asset.description || '-'],
    ['责任人', '当前员工'],
    ['资产地址', '北京市-搜狐媒体大厦-17层'],
  ];

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
      <MobileHeader title={asset.name || '资产详情'} onBack={onBack} onClose={onBack} />
      <div className="bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[92px_1fr] gap-3 border-b border-slate-100 px-5 py-4 text-sm">
            <div className="text-slate-500">{label}</div>
            <div className="break-words text-slate-900">{value}</div>
          </div>
        ))}
      </div>
      {(asset.source === 'asset' || !asset.source) && (
        <div className="grid grid-cols-2 gap-3 p-4">
          <button type="button" className="rounded-xl border py-3 text-sm" style={{ borderColor: PRIMARY, color: PRIMARY }} onClick={() => onOpen('return', asset)}><ArrowDownToLine size={16} className="mr-1 inline" />退库</button>
          <button type="button" className="rounded-xl py-3 text-sm text-white" style={{ backgroundColor: PRIMARY }} onClick={() => onOpen('replace', asset)}><Wrench size={16} className="mr-1 inline" />更换</button>
        </div>
      )}
    </div>
  );
}

function SimpleBusinessForm({ mode, asset, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  const isReturn = mode === 'return';
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
      {contextHolder}
      <MobileHeader title={isReturn ? '退库信息填写' : '更换信息填写'} onBack={onBack} onClose={onBack} />
      <div className="bg-white p-5">
        <div className="mb-4 text-base font-medium text-slate-900">{isReturn ? '退库信息' : '更换信息'}</div>
        <div className="mb-4 grid grid-cols-[90px_1fr] items-center gap-3 text-sm">
          <div className="text-slate-500">{isReturn ? '退库类型' : '更换类型'}</div>
          <div>{isReturn ? '资产退库' : '故障更换'}</div>
        </div>
        <div className="text-sm text-slate-600"><span className="text-red-500">*</span>{isReturn ? '退库原因' : '更换原因'}</div>
        <Input.TextArea className="mt-2" rows={5} maxLength={150} showCount value={reason} placeholder={`请填写${isReturn ? '退库' : '更换'}原因（150字以内）`} onChange={(event) => setReason(event.target.value)} />
      </div>
      <div className="mt-3 bg-white p-5">
        <div className="mb-4 font-medium text-slate-900">{asset.name}</div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[90px_1fr] gap-3"><span className="text-slate-500">资产标签号</span><span>{asset.assetTag || asset.id}</span></div>
          <div className="grid grid-cols-[90px_1fr] gap-3"><span className="text-slate-500">资产说明</span><span>{asset.assetDesc || asset.name}</span></div>
          <div className="grid grid-cols-[90px_1fr] gap-3"><span className="text-slate-500">资产用途</span><span>{asset.purpose || '员工用机'}</span></div>
          <div className="grid grid-cols-[90px_1fr] gap-3"><span className="text-slate-500">资产状态</span><span>{asset.status || '在用-使用中'}</span></div>
          <div className="grid grid-cols-[90px_1fr] gap-3"><span className="text-slate-500">配置</span><span>{asset.config || '-'}</span></div>
        </div>
      </div>
      <div className="p-4">
        <button
          type="button"
          className="w-full rounded-xl py-3 text-sm font-medium text-white"
          style={{ backgroundColor: PRIMARY }}
          onClick={() => {
            if (!reason.trim()) {
              messageApi.warning(`请填写${isReturn ? '退库' : '更换'}原因`);
              return;
            }
            messageApi.success(`${isReturn ? '退库' : '更换'}申请已提交`);
          }}
        >
          {isReturn ? '提交' : '预览'}
        </button>
      </div>
    </div>
  );
}

function InventoryDetailScreen({ asset, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white">
      {contextHolder}
      <MobileHeader title={asset.name || '资产盘点'} onBack={onBack} onClose={onBack} />
      <div className="h-1" style={{ backgroundColor: PRIMARY }} />
      {[
        ['标签号', asset.assetTag], ['数量', 1], ['用途', asset.purpose || '员工用机'], ['使用状态', asset.status || '在用-使用中'],
        ['说明', asset.assetDesc || asset.name], ['责任人', '当前员工'], ['盘点状态', asset.checked ? '已盘' : '未盘'], ['资产地址', '北京市-搜狐媒体大厦-17层'],
      ].map(([label, value]) => (
        <div key={label} className="grid grid-cols-[92px_1fr] gap-3 border-b border-slate-100 px-5 py-4 text-sm">
          <span className="text-slate-500">{label}</span><span className="text-slate-900">{value}</span>
        </div>
      ))}
      <div className="grid grid-cols-2 border-t border-slate-100">
        <button type="button" className="py-4 text-sm text-red-500" onClick={() => messageApi.info('已登记报失')}>报失</button>
        <button
          type="button"
          className="py-4 text-sm text-white"
          style={{ backgroundColor: PRIMARY }}
          onClick={() => {
            asset.onChecked?.();
            messageApi.success('盘点完成');
          }}
        >盘点</button>
      </div>
    </div>
  );
}

function MaterialApplyScreen({ onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [tab, setTab] = useState('资产');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [reason, setReason] = useState('');
  const [relatedAsset, setRelatedAsset] = useState('');

  const options = MATERIAL_OPTIONS.filter((item) => item.type === tab);
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
      {contextHolder}
      <MobileHeader title="物资申请" onBack={onBack} onClose={onBack} />
      <div className="bg-white p-4">
        <SegmentedTabs value={tab} onChange={(next) => { setTab(next); setSelected(null); }} items={[{ value: '资产', label: '资产' }, { value: '耗材', label: '耗材' }]} />
        <div className="mt-3 space-y-2">
          {options.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${selected?.id === item.id ? 'border-cyan-400 bg-cyan-50' : 'border-slate-100 bg-white'}`}
              onClick={() => setSelected(item)}
            >
              <AssetIcon kind={tab === '耗材' ? 'consumable' : 'asset'} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="mt-1 break-words text-xs leading-5 text-slate-500">{item.config}</div>
              </div>
              {selected?.id === item.id && <CheckCircle2 size={20} style={{ color: PRIMARY }} />}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="mt-3 space-y-4 bg-white p-4">
          <div>
            <div className="mb-2 text-sm text-slate-600">数量</div>
            <InputNumber min={1} precision={0} value={quantity} onChange={(value) => setQuantity(value || 1)} />
          </div>
          <div>
            <div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>申请用途</div>
            <Input value={purpose} placeholder="例如：员工用机 / 专业用途" onChange={(event) => setPurpose(event.target.value)} />
          </div>
          {tab === '耗材' && (
            <div>
              <div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>关联主资产</div>
              <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={relatedAsset} onChange={(event) => setRelatedAsset(event.target.value)}>
                <option value="">请选择本人名下资产</option>
                {MY_EXISTING_ASSETS.map((asset) => <option key={asset.id} value={asset.assetTag}>{asset.assetTag}</option>)}
              </select>
            </div>
          )}
          <div>
            <div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>申请原因</div>
            <Input.TextArea rows={4} maxLength={400} showCount value={reason} placeholder="请填写申请原因" onChange={(event) => setReason(event.target.value)} />
          </div>
          <button
            type="button"
            className="w-full rounded-xl py-3 text-sm font-medium text-white"
            style={{ backgroundColor: PRIMARY }}
            onClick={() => {
              if (!purpose.trim() || !reason.trim() || (tab === '耗材' && !relatedAsset)) {
                messageApi.warning('请补充必填信息');
                return;
              }
              messageApi.success(`已提交 ${quantity} 件物资申请`);
            }}
          >
            预览并提交
          </button>
        </div>
      )}
    </div>
  );
}

function BorrowApplyScreen({ onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f7f9fb]">
      {contextHolder}
      <MobileHeader title="资产借用" onBack={onBack} onClose={onBack} />
      <div className="bg-white p-4">
        <div className="mb-3 text-sm font-medium text-slate-700">借用资产</div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
          <AssetIcon />
          <div><div className="font-medium">戴尔 Latitude 7440</div><div className="mt-1 text-xs text-slate-400">NOTEBOOK · 标准借用资产</div></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div><div className="mb-1 text-xs text-slate-500">开始日期</div><input type="date" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></div>
          <div><div className="mb-1 text-xs text-slate-500">归还日期</div><input type="date" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></div>
        </div>
        <div className="mt-4 text-sm text-slate-600"><span className="text-red-500">*</span>需求说明</div>
        <Input.TextArea className="mt-2" rows={5} maxLength={150} showCount value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请填写借用需求说明" />
        <button type="button" className="mt-5 w-full rounded-xl py-3 text-sm font-medium text-white" style={{ backgroundColor: PRIMARY }} onClick={() => reason.trim() ? messageApi.success('借用申请已提交') : messageApi.warning('请填写需求说明')}>提交</button>
      </div>
    </div>
  );
}

function QuickActions({ onClose, onOpen }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-white/85 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full pb-24" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-center gap-16">
          <button type="button" className="flex w-24 flex-col items-center gap-3 text-sm text-slate-800" onClick={() => onOpen('material')}>
            <span className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow" style={{ backgroundColor: PRIMARY }}><ClipboardList size={28} /></span>
            <span>物资申请</span>
          </button>
          <button type="button" className="flex w-24 flex-col items-center gap-3 text-sm text-slate-800" onClick={() => onOpen('borrow')}>
            <span className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow" style={{ backgroundColor: PRIMARY }}><FileText size={28} /></span>
            <span>资产借用</span>
          </button>
        </div>
        <button type="button" className="mx-auto mt-10 flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 text-white" onClick={onClose}><X size={24} /></button>
      </div>
    </div>
  );
}

export default function MobileWorkspacePage() {
  const [screen, setScreen] = useState('home');
  const [payload, setPayload] = useState(null);
  const [quickOpen, setQuickOpen] = useState(false);

  const openScreen = (next, nextPayload = null) => {
    setPayload(nextPayload);
    setScreen(next);
    setQuickOpen(false);
  };

  const bottomNav = (next) => {
    setPayload(null);
    setScreen(next);
    setQuickOpen(false);
  };

  const backHome = () => bottomNav('home');

  let content;
  if (screen === 'history') content = <HistoryScreen onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} />;
  else if (screen === 'inventory') content = <InventoryScreen onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} onOpen={openScreen} />;
  else if (screen === 'scan') content = <ScanScreen onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} onOpen={openScreen} />;
  else if (screen === 'assetDetail') content = <AssetDetailScreen asset={payload || {}} onBack={backHome} onOpen={openScreen} />;
  else if (screen === 'return') content = <SimpleBusinessForm mode="return" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'replace') content = <SimpleBusinessForm mode="replace" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'inventoryDetail') content = <InventoryDetailScreen asset={payload || {}} onBack={() => bottomNav('inventory')} />;
  else if (screen === 'material') content = <MaterialApplyScreen onBack={backHome} />;
  else if (screen === 'borrow') content = <BorrowApplyScreen onBack={backHome} />;
  else content = <HomeScreen onOpen={openScreen} onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} />;

  return (
    <div className="flex w-full justify-center py-2">
      <div className="relative flex h-[820px] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
        {content}
        {quickOpen && <QuickActions onClose={() => setQuickOpen(false)} onOpen={openScreen} />}
      </div>
    </div>
  );
}
