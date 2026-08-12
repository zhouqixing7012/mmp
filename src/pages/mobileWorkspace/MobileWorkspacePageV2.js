import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  History,
  Home,
  Laptop,
  Package,
  Plus,
  ScanLine,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Select,
  Statistic,
  Tabs,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import { ASSET_LIBRARY, MY_EXISTING_ASSETS } from '../../mock/assetApplicationMock';

const { Text } = Typography;
const PRIMARY = '#3370FF';
const LEVEL_NAMES = ['大类', '小类', '品牌', '型号', '配置'];

const CATALOG_PATHS = {
  A001: ['电脑整机', '便携式电脑', '联想', 'ThinkPad T14', 'i7-1360P / 16G / 512G SSD'],
  A009: ['电脑整机', '便携式电脑', '联想', 'ThinkPad T14', 'Ultra 7 / 32G / 1T SSD'],
  A010: ['电脑整机', '便携式电脑', '联想', 'ThinkPad X1 Carbon', 'Ultra 7 / 16G / 512G SSD'],
  A011: ['电脑整机', '便携式电脑', '联想', 'ThinkPad X1 Carbon', 'Ultra 7 / 32G / 1T SSD'],
  A002: ['电脑整机', '便携式电脑', '苹果', 'MacBook Pro 14', 'M3 Pro / 18G / 512G SSD'],
  A012: ['电脑整机', '便携式电脑', '苹果', 'MacBook Pro 14', 'M3 Pro / 36G / 1T SSD'],
  A013: ['电脑整机', '便携式电脑', '苹果', 'MacBook Air 13', 'M3 / 16G / 512G SSD'],
  A014: ['电脑整机', '便携式电脑', '苹果', 'MacBook Air 13', 'M3 / 24G / 512G SSD'],
  A004: ['显示设备', '显示器', '戴尔', 'U2723QE', '27英寸 / 4K / Type-C 90W / 银色'],
  A015: ['显示设备', '显示器', '戴尔', 'U2723QE', '27英寸 / 4K / Type-C 90W / 黑色'],
  A016: ['显示设备', '显示器', '戴尔', 'P2425H', '23.8英寸 / FHD / IPS / HDMI+DP'],
  A017: ['显示设备', '显示器', '戴尔', 'P2425H', '23.8英寸 / FHD / IPS / USB Hub'],
  A005: ['电脑整机', '台式电脑', '联想', '启天 M430', 'i5 / 16G / 512G SSD'],
  A006: ['存储耗材', '移动存储', '西部数据', 'Elements Portable', '2TB / 2.5英寸 / USB 3.0'],
  A018: ['存储耗材', '移动存储', '西部数据', 'Elements Portable', '4TB / 2.5英寸 / USB 3.0'],
  A007: ['电脑配件', '电源适配器', '苹果', '双USB-C 电源适配器', '35W / 双USB-C接口'],
  A019: ['电脑配件', '电源适配器', '苹果', 'USB-C 电源适配器', '70W / USB-C接口'],
  A008: ['办公耗材', '鼠标', '罗技', 'MX Master 3S', '静音 / 无线 / 蓝牙 / 黑色'],
  A020: ['办公耗材', '鼠标', '罗技', 'MX Master 3S', '静音 / 无线 / 蓝牙 / 白色'],
  A021: ['电脑配件', '转接线', '绿联', 'Type-C 多功能转接器', '转接线.绿联、CELINK、苹果.Type-C转（VGA/以太网/USB/Type-C）'],
};

const CONSUMABLES = [
  { id: 'C001', name: '罗技 MX Master 3S', desc: '办公耗材 · 鼠标', quantity: 1, relatedAsset: '114122102371' },
  { id: 'C002', name: '绿联 Type-C 多功能转接器', desc: '电脑配件 · 转接线', quantity: 1, relatedAsset: '115083104512' },
];

const CONTRACT_NUMBERS = [
  { id: 'N001', phone: '138 0013 8000', carrier: '中国移动', packageName: '商务畅享 129 元套餐', status: '正常使用' },
];

const HISTORY_RECORDS = [
  { id: 'MA-202608130001', type: '物资申请', title: 'ThinkPad T14 笔记本', status: '处理中', date: '2026-08-13' },
  { id: 'TR-202608120024', type: '资产转移', title: '戴尔 E2417H显示器', status: '处理中', date: '2026-08-12' },
  { id: 'RP-202608120021', type: '资产更换', title: '微软 Surface Laptop 4', status: '处理中', date: '2026-08-12' },
  { id: 'BR-202608080015', type: '资产借用', title: '戴尔 Latitude 7440', status: '已完成', date: '2026-08-08' },
  { id: 'RT-202608050008', type: '资产退库', title: '戴尔 E2417H显示器', status: '已完成', date: '2026-08-05' },
  { id: 'NR-202608030006', type: '合约号码退库', title: '138 0013 8000', status: '已完成', date: '2026-08-03' },
];

const APP_THEME = {
  token: {
    colorPrimary: PRIMARY,
    borderRadius: 10,
    borderRadiusLG: 14,
    colorBgLayout: '#F5F6F7',
    colorText: '#1F2329',
    colorTextSecondary: '#646A73',
    fontSize: 14,
  },
  components: {
    Button: { controlHeight: 38 },
    Input: { controlHeight: 40 },
    Card: { paddingLG: 16 },
    Tabs: {
      inkBarColor: PRIMARY,
      itemSelectedColor: '#1F2329',
      itemColor: '#8F959E',
      itemHoverColor: PRIMARY,
    },
  },
};

function getCatalogRecords(type, keyword) {
  return ASSET_LIBRARY
    .filter((asset) => asset.type === type)
    .map((asset) => ({ asset, path: CATALOG_PATHS[asset.id] }))
    .filter((item) => item.path)
    .filter((item) => {
      const text = `${item.asset.name} ${item.asset.desc} ${item.path.join(' ')}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
}

function uniqueValues(records, level, selectedPath) {
  return [...new Set(records
    .filter((item) => selectedPath.every((value, index) => item.path[index] === value))
    .map((item) => item.path[level]))];
}

function MobileHeader({ title, onBack, onClose, home = false }) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3">
      <Button type="text" shape="circle" icon={home ? <Home size={20} /> : <ArrowLeft size={20} />} onClick={onBack} />
      <Text strong className="text-base">{title}</Text>
      {home
        ? <Avatar size={30} style={{ backgroundColor: '#E8F0FF', color: PRIMARY }}>周</Avatar>
        : <Button type="text" shape="circle" icon={<X size={20} />} onClick={onClose} />}
    </div>
  );
}

function BottomNav({ active, onChange, onPlus }) {
  const items = [
    { key: 'home', label: '首页', icon: Home },
    { key: 'history', label: '单据', icon: History },
    { key: 'plus', label: '', icon: Plus },
    { key: 'inventory', label: '盘点', icon: Database },
    { key: 'scan', label: '扫一扫', icon: ScanLine },
  ];

  return (
    <div className="grid h-[72px] shrink-0 grid-cols-5 border-t border-slate-100 bg-white px-1 pb-1">
      {items.map((item) => {
        const Icon = item.icon;
        if (item.key === 'plus') {
          return (
            <button key={item.key} type="button" className="flex items-center justify-center" onClick={onPlus}>
              <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#3370FF] text-white shadow-[0_8px_18px_rgba(51,112,255,0.28)]">
                <Icon size={24} />
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
            style={{ color: selected ? PRIMARY : '#8F959E' }}
            onClick={() => onChange(item.key)}
          >
            <Icon size={20} strokeWidth={selected ? 2.4 : 1.9} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CategoryIcon({ type, size = 'normal' }) {
  const config = {
    asset: { icon: Laptop, bg: '#E8F3FF', color: '#2E7BEF' },
    consumable: { icon: Package, bg: '#FFF4E8', color: '#F07B2D' },
    contract: { icon: Smartphone, bg: '#EAF8F1', color: '#18A058' },
  }[type];
  const Icon = config.icon;
  const boxClass = size === 'small' ? 'h-8 w-8 rounded-lg' : 'h-11 w-11 rounded-xl';
  return (
    <span className={`flex ${boxClass} shrink-0 items-center justify-center`} style={{ backgroundColor: config.bg, color: config.color }}>
      <Icon size={size === 'small' ? 17 : 22} />
    </span>
  );
}

function LineTabs({ activeKey, onChange, items }) {
  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      items={items.map((item) => ({ key: item.key, label: item.label, children: null }))}
      tabBarStyle={{ margin: 0 }}
      animated={{ inkBar: true, tabPane: false }}
      className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav]:px-1 [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:justify-center [&_.ant-tabs-tab]:py-3 [&_.ant-tabs-tab-btn]:text-center [&_.ant-tabs-ink-bar]:h-[2px]"
    />
  );
}

function OverviewCard({ activeTab, onTabChange }) {
  const stats = [
    { key: 'asset', label: '资产', value: MY_EXISTING_ASSETS.length, icon: Laptop, bg: '#E8F3FF', color: '#2E7BEF' },
    { key: 'consumable', label: '耗材', value: CONSUMABLES.length, icon: Package, bg: '#FFF4E8', color: '#F07B2D' },
    { key: 'contract', label: '合约号码', value: CONTRACT_NUMBERS.length, icon: Smartphone, bg: '#EAF8F1', color: '#18A058' },
  ];
  const total = stats.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card bordered={false} className="overflow-hidden shadow-[0_6px_22px_rgba(31,35,41,0.05)]" styles={{ body: { padding: 0 } }}>
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#F8FAFF_0%,#EEF4FF_62%,#F9FBFF_100%)] px-4 pb-4 pt-5">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#3370FF]/5" />
        <div className="relative flex items-end justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">物资概览</div>
            <div className="mt-1 text-xs text-slate-500">3 类资源 · 共 {total} 项</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">全部资源</div>
            <div className="mt-0.5 text-xl font-semibold text-slate-800">{total}</div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {stats.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                type="button"
                key={item.key}
                className={`rounded-xl bg-white px-2 py-3 text-left shadow-sm transition ${active ? 'ring-1 ring-[#3370FF]/25' : 'ring-1 ring-black/[0.03]'}`}
                onClick={() => onTabChange(item.key)}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: item.bg, color: item.color }}>
                    <Icon size={15} />
                  </span>
                  <span className="truncate text-[11px] text-slate-500">{item.label}</span>
                </div>
                <Statistic value={item.value} valueStyle={{ fontSize: 22, lineHeight: '26px', color: '#1F2329', fontWeight: 600 }} suffix={<span className="text-[11px] font-normal text-slate-400">项</span>} />
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function BatchActionBar({ count, onCancel, onAction }) {
  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-3 pb-3 pt-2 shadow-[0_-8px_24px_rgba(31,35,41,0.06)]">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs text-slate-500">已选择 <b className="text-slate-800">{count}</b> 项资产</span>
        <Button type="link" size="small" onClick={onCancel}>取消批量操作</Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button icon={<ArrowDownToLine size={15} />} disabled={count === 0} onClick={() => onAction('批量退库')}>批量退库</Button>
        <Button icon={<ArrowRightLeft size={15} />} disabled={count === 0} onClick={() => onAction('批量转移')}>批量转移</Button>
        <Button icon={<Wrench size={15} />} disabled={count === 0} onClick={() => onAction('批量更换')}>批量更换</Button>
      </div>
    </div>
  );
}

function HomeScreen({ onOpen, onBottomNav, onPlus }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [tab, setTab] = useState('asset');
  const [keyword, setKeyword] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const switchTab = (next) => {
    setTab(next);
    setKeyword('');
    setBatchMode(false);
    setSelectedIds([]);
  };

  const data = useMemo(() => {
    if (tab === 'asset') return MY_EXISTING_ASSETS;
    if (tab === 'consumable') return CONSUMABLES;
    return CONTRACT_NUMBERS;
  }, [tab]);

  const visibleData = data.filter((item) => {
    const text = tab === 'contract'
      ? `${item.phone} ${item.carrier} ${item.packageName}`
      : `${item.name || ''} ${item.assetTag || ''} ${item.desc || item.assetDesc || ''}`;
    return !keyword.trim() || text.toLowerCase().includes(keyword.trim().toLowerCase());
  });

  const toggleSelected = (assetId) => {
    setSelectedIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
  };

  const startLongPress = (assetId) => {
    longPressTriggered.current = false;
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      setBatchMode(true);
      setSelectedIds((current) => current.includes(assetId) ? current : [...current, assetId]);
      messageApi.info('已进入批量操作，可继续选择其他资产');
    }, 520);
  };

  const clearLongPress = () => window.clearTimeout(longPressTimer.current);

  const handleAssetCardClick = (item) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    if (batchMode) {
      toggleSelected(item.id);
      return;
    }
    onOpen('assetDetail', { ...item, assetTag: item.assetTag || item.id });
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="资产服务" home onBack={() => {}} />
        <div className="p-4 pb-3"><OverviewCard activeTab={tab} onTabChange={switchTab} /></div>
        <div className="sticky top-0 z-10 bg-[#F5F6F7] px-4 pb-3">
          <Card bordered={false} className="shadow-none" styles={{ body: { padding: '0 12px 12px' } }}>
            <LineTabs activeKey={tab} onChange={switchTab} items={[{ key: 'asset', label: '资产' }, { key: 'consumable', label: '耗材' }, { key: 'contract', label: '合约号码' }]} />
            <Input allowClear className="mt-2" prefix={<Search size={16} className="text-slate-400" />} placeholder={tab === 'contract' ? '搜索号码、运营商或套餐' : '搜索物资说明或标签号'} value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </Card>
        </div>

        <div className="space-y-3 px-4 pb-5">
          {visibleData.map((item) => {
            if (tab === 'contract') {
              return (
                <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
                  <div className="flex items-start gap-3">
                    <CategoryIcon type="contract" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><Text strong className="text-[15px]">{item.phone}</Text><Tag color="success" bordered={false}>{item.status}</Tag></div>
                      <div className="mt-2 text-sm text-slate-500">{item.carrier}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.packageName}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end border-t border-slate-100 pt-3"><Button type="link" size="small" onClick={() => onOpen('contractReturn', item)}>号码退库</Button></div>
                </Card>
              );
            }

            if (tab === 'consumable') {
              return (
                <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
                  <div className="flex items-start gap-3">
                    <CategoryIcon type="consumable" />
                    <div className="min-w-0 flex-1">
                      <Text strong className="text-[15px]">{item.name}</Text>
                      <div className="mt-1 text-sm text-slate-500">数量 {item.quantity}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">{item.desc}</div>
                      <div className="mt-2 text-xs text-slate-500">关联主资产：{item.relatedAsset}</div>
                    </div>
                  </div>
                </Card>
              );
            }

            const selected = selectedIds.includes(item.id);
            return (
              <Card key={item.id} bordered={false} className={`shadow-none transition ${selected ? 'ring-1 ring-[#3370FF]/40' : ''}`} styles={{ body: { padding: 16 } }}>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer items-start gap-3 select-none"
                  onPointerDown={() => startLongPress(item.id)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onClick={() => handleAssetCardClick(item)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') handleAssetCardClick(item); }}
                >
                  <CategoryIcon type="asset" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Text strong className="truncate text-[15px]">{item.name}</Text>
                      {batchMode
                        ? <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#3370FF] bg-[#3370FF] text-white' : 'border-slate-300 bg-white'}`}>{selected && <CheckCircle2 size={14} />}</span>
                        : <ChevronRight size={18} className="shrink-0 text-slate-300" />}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{item.assetTag || item.id}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.assetDesc || item.name}</div>
                  </div>
                </div>
                {!batchMode && (
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
                    <Button size="small" onClick={() => onOpen('return', item)}>退库</Button>
                    <Button size="small" onClick={() => onOpen('transfer', item)}>转移</Button>
                    <Button size="small" onClick={() => onOpen('replace', item)}>更换</Button>
                  </div>
                )}
              </Card>
            );
          })}
          {visibleData.length === 0 && <Empty className="py-16" description="暂无相关数据" />}
        </div>
      </div>
      {batchMode
        ? <BatchActionBar count={selectedIds.length} onCancel={() => { setBatchMode(false); setSelectedIds([]); }} onAction={(action) => messageApi.success(`${action}：已选择 ${selectedIds.length} 项资产`)} />
        : <BottomNav active="home" onChange={onBottomNav} onPlus={onPlus} />}
    </>
  );
}

function HistoryScreen({ onBottomNav, onPlus }) {
  const [status, setStatus] = useState('pending');
  const [type, setType] = useState('全部');
  const types = ['全部', '物资申请', '资产借用', '资产转移', '资产更换', '资产退库', '合约号码退库'];
  const records = HISTORY_RECORDS.filter((item) => (status === 'pending' ? item.status !== '已完成' : item.status === '已完成') && (type === '全部' || item.type === type));
  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="我的单据" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="bg-white px-4 pb-3">
          <LineTabs activeKey={status} onChange={setStatus} items={[{ key: 'pending', label: '未完成' }, { key: 'done', label: '已完成' }]} />
          <Select className="mt-3 w-full" value={type} onChange={setType} options={types.map((item) => ({ label: item, value: item }))} />
        </div>
        <div className="space-y-3 p-4">
          {records.map((item) => (
            <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><Text strong>{item.type}</Text><div className="mt-2 text-sm text-slate-600">{item.title}</div><div className="mt-1 text-xs text-slate-400">{item.id} · {item.date}</div></div>
                <Tag color={item.status === '已完成' ? 'success' : 'processing'} bordered={false}>{item.status}</Tag>
              </div>
            </Card>
          ))}
          {records.length === 0 && <Empty className="py-20" description="暂无相关单据" />}
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
  const data = MY_EXISTING_ASSETS.filter((asset) => (tab === 'done' ? checkedIds.includes(asset.id) : !checkedIds.includes(asset.id)) && (!keyword.trim() || `${asset.name} ${asset.assetTag} ${asset.config}`.toLowerCase().includes(keyword.trim().toLowerCase())));
  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="我的资产" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="bg-white px-4 pb-3">
          <LineTabs activeKey={tab} onChange={setTab} items={[{ key: 'todo', label: '未盘' }, { key: 'done', label: '已盘' }]} />
          <Input className="mt-3" prefix={<Search size={16} className="text-slate-400" />} placeholder="输入资产说明、标签号、序列号" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
        <div className="px-4 py-3 text-xs text-slate-500">{tab === 'done' ? '已盘' : '未盘'} · 共 {data.length} 条</div>
        <div className="space-y-3 px-4 pb-4">
          {data.map((asset) => (
            <Card key={asset.id} bordered={false} className="shadow-none" styles={{ body: { padding: 0 } }}>
              <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={() => onOpen('inventoryDetail', { ...asset, checked: checkedIds.includes(asset.id), onChecked: () => setCheckedIds((ids) => ids.includes(asset.id) ? ids : [...ids, asset.id]) })}>
                <CategoryIcon type="asset" />
                <div className="min-w-0 flex-1"><div className="truncate font-medium text-slate-900">{asset.name}</div><div className="mt-1 text-sm text-slate-500">{asset.assetTag}</div><div className="mt-1 truncate text-xs text-slate-400">{asset.config}</div></div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            </Card>
          ))}
          {data.length === 0 && <Empty className="py-20" description="暂无数据" />}
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
    if (!asset) return messageApi.warning('未找到该资产标签号');
    onOpen('assetDetail', { ...asset, source: 'asset' });
  };
  return (
    <>
      {contextHolder}
      <div className="min-h-0 flex-1 overflow-auto bg-slate-950 text-white">
        <MobileHeader title="扫一扫" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="flex min-h-[520px] flex-col items-center justify-center px-8">
          <div className="relative h-60 w-60 rounded-3xl border-2 border-white/70"><div className="absolute left-6 right-6 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" /><ScanLine size={68} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" /></div>
          <div className="mt-7 text-sm text-white/70">原型中使用资产标签号输入模拟扫码</div>
          <div className="mt-4 flex w-full gap-2"><Input placeholder="输入资产标签号" value={value} onChange={(event) => setValue(event.target.value)} onPressEnter={handleLookup} /><Button type="primary" onClick={handleLookup}>查询</Button></div>
        </div>
      </div>
      <BottomNav active="scan" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function AssetDetailScreen({ asset, onBack, onOpen }) {
  const rows = [['标签号', asset.assetTag || asset.id], ['数量', 1], ['用途', asset.purpose || '员工用机'], ['使用状态', asset.status || '在用-使用中'], ['说明', asset.assetDesc || asset.name], ['配置', asset.config || '-'], ['责任人', '当前员工'], ['资产地址', '北京市-搜狐媒体大厦-17层']];
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      <MobileHeader title="资产详情" onBack={onBack} onClose={onBack} />
      <Card bordered={false} className="m-4 shadow-none" styles={{ body: { padding: 0 } }}>
        <div className="flex items-center gap-3 border-b border-slate-100 p-4"><CategoryIcon type="asset" /><div><Text strong>{asset.name}</Text><div className="mt-1 text-xs text-slate-400">{asset.assetTag || asset.id}</div></div></div>
        {rows.map(([label, value]) => <div key={label} className="grid grid-cols-[88px_1fr] gap-3 border-b border-slate-100 px-4 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="break-words text-slate-900">{value}</span></div>)}
      </Card>
      <div className="grid grid-cols-3 gap-2 px-4 pb-4"><Button onClick={() => onOpen('return', asset)}>退库</Button><Button onClick={() => onOpen('transfer', asset)}>转移</Button><Button onClick={() => onOpen('replace', asset)}>更换</Button></div>
    </div>
  );
}

function AssetBusinessForm({ mode, asset, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  const [receiver, setReceiver] = useState('');
  const isReturn = mode === 'return';
  const isTransfer = mode === 'transfer';
  const title = isReturn ? '退库信息填写' : isTransfer ? '转移信息填写' : '更换信息填写';
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}<MobileHeader title={title} onBack={onBack} onClose={onBack} />
      <Card bordered={false} className="m-4 shadow-none" styles={{ body: { padding: 16 } }}>
        {isTransfer && <div className="mb-4"><div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>接收人</div><Input placeholder="请选择接收人" value={receiver} onChange={(event) => setReceiver(event.target.value)} /></div>}
        <div className="text-sm text-slate-600"><span className="text-red-500">*</span>{isReturn ? '退库原因' : isTransfer ? '转出原因' : '更换原因'}</div>
        <Input.TextArea className="mt-2" rows={5} maxLength={150} showCount value={reason} onChange={(event) => setReason(event.target.value)} placeholder={`请填写${isReturn ? '退库' : isTransfer ? '转出' : '更换'}原因（150字以内）`} />
      </Card>
      <Card bordered={false} className="m-4 mt-0 shadow-none" styles={{ body: { padding: 16 } }}><Text strong>{asset.name}</Text><div className="mt-3 space-y-3 text-sm">{[['资产标签号', asset.assetTag || asset.id], ['资产说明', asset.assetDesc || asset.name], ['资产用途', asset.purpose || '员工用机'], ['资产状态', asset.status || '在用-使用中'], ['配置', asset.config || '-']].map(([label, value]) => <div key={label} className="grid grid-cols-[86px_1fr] gap-3"><span className="text-slate-500">{label}</span><span>{value}</span></div>)}</div></Card>
      <div className="p-4 pt-0"><Button block type="primary" onClick={() => { if ((isTransfer && !receiver.trim()) || !reason.trim()) return messageApi.warning('请补充必填信息'); messageApi.success(`${isReturn ? '退库' : isTransfer ? '转移' : '更换'}申请已提交`); }}>{isReturn || isTransfer ? '提交' : '预览'}</Button></div>
    </div>
  );
}

function InventoryDetailScreen({ asset, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white">
      {contextHolder}<MobileHeader title="资产盘点" onBack={onBack} onClose={onBack} />
      {[['标签号', asset.assetTag], ['数量', 1], ['用途', asset.purpose || '员工用机'], ['使用状态', asset.status || '在用-使用中'], ['说明', asset.assetDesc || asset.name], ['责任人', '当前员工'], ['盘点状态', asset.checked ? '已盘' : '未盘'], ['资产地址', '北京市-搜狐媒体大厦-17层']].map(([label, value]) => <div key={label} className="grid grid-cols-[88px_1fr] gap-3 border-b border-slate-100 px-5 py-4 text-sm"><span className="text-slate-500">{label}</span><span className="text-slate-900">{value}</span></div>)}
      <div className="p-4"><Button block type="primary" onClick={() => { asset.onChecked?.(); messageApi.success('盘点完成'); }}>盘点</Button></div>
    </div>
  );
}

function MaterialApplyScreen({ onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [activeType, setActiveType] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState([]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [stage, setStage] = useState('catalog');
  const [cartOpen, setCartOpen] = useState(false);
  const [relatedAssetOpen, setRelatedAssetOpen] = useState(false);
  const [relatedMaterialId, setRelatedMaterialId] = useState(null);
  const keyword = searchQuery.trim().toLowerCase();
  const records = useMemo(() => getCatalogRecords(activeType, keyword), [activeType, keyword]);
  const options = useMemo(() => uniqueValues(records, activeLevel, selectedPath.slice(0, activeLevel)), [records, activeLevel, selectedPath]);

  const setType = (next) => {
    setActiveType(next);
    setSelectedPath([]);
    setActiveLevel(0);
    setSearchQuery('');
  };

  const selectLevel = (level, value) => {
    setSelectedPath((current) => [...current.slice(0, level), value]);
    setActiveLevel(Math.min(level + 1, 4));
  };

  const toggleConfiguration = (config) => {
    const path = [...selectedPath.slice(0, 4), config];
    const matched = records.find((item) => item.path.every((value, index) => value === path[index]));
    if (!matched) return;
    setSelectedMaterials((current) => {
      if (current.some((item) => item.id === matched.asset.id)) return current.filter((item) => item.id !== matched.asset.id);
      return [...current, {
        id: matched.asset.id,
        type: matched.asset.type,
        materialType: matched.asset.type === 'consumable' ? '耗材' : '资产',
        assetDesc: `${matched.path[1]}.${matched.path[2]}.${matched.path[3]}`,
        config: matched.path[4],
        quantity: 1,
        purpose: '',
        reason: '',
        relatedAsset: '',
      }];
    });
  };

  const updateMaterial = (id, field, value) => setSelectedMaterials((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));

  const currentPath = selectedPath.slice(0, Math.min(activeLevel, 4));

  if (stage === 'form') {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col bg-[#F5F6F7]">
        {contextHolder}
        <MobileHeader title="填写申请信息" onBack={() => setStage('catalog')} onClose={onBack} />
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          {selectedMaterials.map((item, index) => (
            <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
              <div className="mb-4 flex items-start gap-3">
                <CategoryIcon type={item.type === 'consumable' ? 'consumable' : 'asset'} />
                <div className="min-w-0 flex-1"><div className="text-xs text-slate-400">申请物资 {index + 1}</div><Text strong className="mt-1 block">{item.assetDesc}</Text><div className="mt-1 break-words text-xs leading-5 text-slate-500">{item.config}</div></div>
              </div>
              <div className="grid grid-cols-[78px_1fr] items-center gap-3"><span className="text-sm text-slate-600">数量</span><InputNumber min={1} precision={0} value={item.quantity} onChange={(value) => updateMaterial(item.id, 'quantity', value || 1)} /></div>
              <div className="mt-4"><div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>申请用途</div><Select className="w-full" placeholder="请选择申请用途" value={item.purpose || undefined} onChange={(value) => updateMaterial(item.id, 'purpose', value)} options={['员工用机', '部门公用', '其他用途', '专业用途'].map((value) => ({ label: value, value }))} /></div>
              {item.type === 'consumable' && (
                <div className="mt-4"><div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>关联主资产</div><Button block className="text-left" onClick={() => { setRelatedMaterialId(item.id); setRelatedAssetOpen(true); }}>{item.relatedAsset || '请选择本人名下资产'}</Button></div>
              )}
              <div className="mt-4"><div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>申请原因</div><Input.TextArea rows={4} maxLength={400} showCount value={item.reason} placeholder="请填写申请原因" onChange={(event) => updateMaterial(item.id, 'reason', event.target.value)} /></div>
            </Card>
          ))}
        </div>
        <div className="grid shrink-0 grid-cols-[120px_1fr] gap-2 border-t border-slate-100 bg-white p-3"><Button onClick={() => setStage('catalog')}>返回选物资</Button><Button type="primary" onClick={() => {
          const invalid = selectedMaterials.some((item) => !item.purpose || !item.reason.trim() || (item.type === 'consumable' && !item.relatedAsset));
          if (invalid) return messageApi.warning('请补充全部物资的必填信息');
          messageApi.success(`已提交 ${selectedMaterials.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} 件物资申请`);
        }}>预览并提交</Button></div>
        <Drawer title="选择关联主资产" placement="bottom" height="58%" open={relatedAssetOpen} onClose={() => setRelatedAssetOpen(false)} getContainer={false} rootStyle={{ position: 'absolute' }}>
          <div className="space-y-2">{MY_EXISTING_ASSETS.map((asset) => {
            const checked = selectedMaterials.find((item) => item.id === relatedMaterialId)?.relatedAsset === asset.assetTag;
            return <button key={asset.id} type="button" className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${checked ? 'border-[#3370FF] bg-[#F5F8FF]' : 'border-slate-100'}`} onClick={() => { updateMaterial(relatedMaterialId, 'relatedAsset', asset.assetTag); setRelatedAssetOpen(false); }}><CategoryIcon type="asset" size="small" /><div className="min-w-0 flex-1"><div className="text-sm font-medium text-slate-800">{asset.assetTag}</div><div className="mt-1 text-xs text-slate-500">{asset.assetDesc}</div><div className="mt-1 truncate text-xs text-slate-400">{asset.config}</div></div>{checked && <CheckCircle2 size={18} style={{ color: PRIMARY }} />}</button>;
          })}</div>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#F5F6F7]">
      {contextHolder}
      <MobileHeader title="物资申请" onBack={onBack} onClose={onBack} />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="bg-white px-4 pb-3">
          <LineTabs activeKey={activeType} onChange={setType} items={[{ key: 'main', label: '资产' }, { key: 'consumable', label: '耗材' }]} />
          <Input allowClear className="mt-3" prefix={<Search size={16} className="text-slate-400" />} placeholder="搜索大类、小类、品牌、型号或配置" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setSelectedPath([]); setActiveLevel(0); }} />
        </div>

        <div className="border-y border-slate-100 bg-white px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LEVEL_NAMES.map((name, index) => {
              const selected = selectedPath[index];
              const active = activeLevel === index;
              return (
                <button key={name} type="button" className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${active ? 'border-[#3370FF] bg-[#F2F6FF] text-[#3370FF]' : selected ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`} onClick={() => { if (index === 0 || selectedPath[index - 1]) setActiveLevel(index); }}>
                  <span>{name}</span>{selected && <span className="ml-1 max-w-[110px] truncate align-bottom">· {selected}</span>}
                </button>
              );
            })}
          </div>
          {currentPath.length > 0 && <div className="mt-2 flex items-center gap-1 overflow-x-auto text-[11px] text-slate-400">{currentPath.map((value, index) => <React.Fragment key={`${value}-${index}`}><button type="button" className="shrink-0 text-slate-500" onClick={() => setActiveLevel(index)}>{value}</button>{index < currentPath.length - 1 && <ChevronRight size={12} className="shrink-0" />}</React.Fragment>)}</div>}
        </div>

        <div className="p-4">
          <Card bordered={false} className="shadow-none" styles={{ body: { padding: 12 } }}>
            <div className="mb-2 flex items-center justify-between px-1"><Text strong>请选择{LEVEL_NAMES[activeLevel]}</Text><span className="text-xs text-slate-400">{options.length} 项</span></div>
            <div className="divide-y divide-slate-100">
              {options.length === 0 ? <Empty className="py-12" description={activeLevel === 0 ? '暂无数据' : '请选择上一级'} /> : options.map((option) => {
                const isConfig = activeLevel === 4;
                const path = [...selectedPath.slice(0, 4), option];
                const matched = isConfig ? records.find((item) => item.path.every((value, index) => value === path[index])) : null;
                const checked = matched && selectedMaterials.some((item) => item.id === matched.asset.id);
                return (
                  <button key={option} type="button" className={`flex w-full items-start gap-3 px-2 py-3 text-left ${checked ? 'bg-[#F7F9FF]' : ''}`} onClick={() => isConfig ? toggleConfiguration(option) : selectLevel(activeLevel, option)}>
                    <div className="min-w-0 flex-1 break-words text-sm leading-5 text-slate-700">{option}</div>
                    {isConfig ? <Checkbox checked={Boolean(checked)} onChange={() => {}} /> : <ChevronRight size={17} className="mt-0.5 shrink-0 text-slate-300" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-[1fr_132px] items-center gap-2 border-t border-slate-100 bg-white p-3">
        <button type="button" className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-left" onClick={() => setCartOpen(true)}>
          <Badge count={selectedMaterials.length} size="small"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#3370FF]"><ShoppingCart size={20} /></span></Badge>
          <span className="min-w-0"><span className="block text-sm font-medium text-slate-800">购物车</span><span className="block text-[11px] text-slate-400">已选 {selectedMaterials.length} 项</span></span>
        </button>
        <Button type="primary" disabled={selectedMaterials.length === 0} onClick={() => setStage('form')}>下一步填写</Button>
      </div>

      <Drawer title={`已选物资（${selectedMaterials.length}）`} placement="bottom" height="62%" open={cartOpen} onClose={() => setCartOpen(false)} getContainer={false} rootStyle={{ position: 'absolute' }} extra={<Button type="link" size="small" disabled={selectedMaterials.length === 0} onClick={() => setSelectedMaterials([])}>清空</Button>}>
        {selectedMaterials.length === 0 ? <Empty className="py-16" description="暂未选择物资" /> : <div className="space-y-3">{selectedMaterials.map((item) => <Card key={item.id} size="small" bordered={false} className="bg-slate-50" styles={{ body: { padding: 12 } }}><div className="flex items-start gap-3"><CategoryIcon type={item.type === 'consumable' ? 'consumable' : 'asset'} size="small" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Tag color={item.type === 'consumable' ? 'orange' : 'blue'} bordered={false}>{item.materialType}</Tag><Text strong>{item.assetDesc}</Text></div><div className="mt-1 break-words text-xs leading-5 text-slate-500">{item.config}</div></div><Button danger type="text" size="small" icon={<Trash2 size={15} />} onClick={() => setSelectedMaterials((current) => current.filter((record) => record.id !== item.id))} /></div></Card>)}</div>}
      </Drawer>
    </div>
  );
}

function BorrowApplyScreen({ onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}<MobileHeader title="资产借用" onBack={onBack} onClose={onBack} />
      <Card bordered={false} className="m-4 shadow-none" styles={{ body: { padding: 16 } }}>
        <div className="mb-3 text-sm font-medium text-slate-700">借用资产</div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><CategoryIcon type="asset" /><div><div className="font-medium">戴尔 Latitude 7440</div><div className="mt-1 text-xs text-slate-400">NOTEBOOK · 标准借用资产</div></div></div>
        <div className="mt-4 grid grid-cols-2 gap-3"><div><div className="mb-1 text-xs text-slate-500">开始日期</div><input type="date" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></div><div><div className="mb-1 text-xs text-slate-500">归还日期</div><input type="date" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></div></div>
        <div className="mt-4 text-sm text-slate-600"><span className="text-red-500">*</span>需求说明</div><Input.TextArea className="mt-2" rows={5} maxLength={150} showCount value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请填写借用需求说明" />
        <Button block type="primary" className="mt-5" onClick={() => reason.trim() ? messageApi.success('借用申请已提交') : messageApi.warning('请填写需求说明')}>提交</Button>
      </Card>
    </div>
  );
}

function ContractReturnScreen({ number, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}<MobileHeader title="合约号码退库" onBack={onBack} onClose={onBack} />
      <Card bordered={false} className="m-4 shadow-none" styles={{ body: { padding: 16 } }}><div className="flex items-center gap-3"><CategoryIcon type="contract" /><div><div className="font-medium text-slate-900">{number.phone}</div><div className="mt-1 text-xs text-slate-400">{number.carrier} · {number.packageName}</div></div></div><div className="mt-5 text-sm text-slate-600"><span className="text-red-500">*</span>退库原因</div><Input.TextArea className="mt-2" rows={5} maxLength={150} showCount value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请填写号码退库原因" /><Button block type="primary" className="mt-5" onClick={() => reason.trim() ? messageApi.success('合约号码退库申请已提交') : messageApi.warning('请填写退库原因')}>提交</Button></Card>
    </div>
  );
}

function QuickActions({ onClose, onOpen }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/20 backdrop-blur-[1px]" onClick={onClose}>
      <Card bordered={false} className="w-full rounded-b-none rounded-t-[22px] shadow-2xl" styles={{ body: { padding: '18px 18px 24px' } }} onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><Text strong>发起申请</Text><Button type="text" shape="circle" icon={<X size={18} />} onClick={onClose} /></div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="flex items-center gap-3 rounded-xl bg-[#F5F7FF] p-4 text-left" onClick={() => onOpen('material')}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FF] text-[#3370FF]"><ClipboardList size={20} /></span><span><span className="block text-sm font-medium text-slate-800">物资申请</span><span className="mt-1 block text-[11px] text-slate-400">资产 / 耗材</span></span></button>
          <button type="button" className="flex items-center gap-3 rounded-xl bg-[#F7F8FA] p-4 text-left" onClick={() => onOpen('borrow')}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#646A73] shadow-sm"><FileText size={20} /></span><span><span className="block text-sm font-medium text-slate-800">资产借用</span><span className="mt-1 block text-[11px] text-slate-400">临时借用资产</span></span></button>
        </div>
      </Card>
    </div>
  );
}

export default function MobileWorkspacePageV2() {
  const [screen, setScreen] = useState('home');
  const [payload, setPayload] = useState(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const openScreen = (next, nextPayload = null) => { setPayload(nextPayload); setScreen(next); setQuickOpen(false); };
  const bottomNav = (next) => { setPayload(null); setScreen(next); setQuickOpen(false); };
  const backHome = () => bottomNav('home');

  let content;
  if (screen === 'history') content = <HistoryScreen onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} />;
  else if (screen === 'inventory') content = <InventoryScreen onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} onOpen={openScreen} />;
  else if (screen === 'scan') content = <ScanScreen onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} onOpen={openScreen} />;
  else if (screen === 'assetDetail') content = <AssetDetailScreen asset={payload || {}} onBack={backHome} onOpen={openScreen} />;
  else if (screen === 'return') content = <AssetBusinessForm mode="return" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'transfer') content = <AssetBusinessForm mode="transfer" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'replace') content = <AssetBusinessForm mode="replace" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'contractReturn') content = <ContractReturnScreen number={payload || {}} onBack={backHome} />;
  else if (screen === 'inventoryDetail') content = <InventoryDetailScreen asset={payload || {}} onBack={() => bottomNav('inventory')} />;
  else if (screen === 'material') content = <MaterialApplyScreen onBack={backHome} />;
  else if (screen === 'borrow') content = <BorrowApplyScreen onBack={backHome} />;
  else content = <HomeScreen onOpen={openScreen} onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} />;

  return (
    <ConfigProvider theme={APP_THEME}>
      <div className="flex w-full justify-center py-2">
        <div className="relative flex h-[820px] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-[#F5F6F7] shadow-[0_18px_48px_rgba(31,35,41,0.16)]">
          {content}
          {quickOpen && <QuickActions onClose={() => setQuickOpen(false)} onOpen={openScreen} />}
        </div>
      </div>
    </ConfigProvider>
  );
}
