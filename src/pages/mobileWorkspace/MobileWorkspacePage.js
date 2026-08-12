import React, { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  History,
  Home,
  Laptop,
  Package,
  Phone,
  Plus,
  ScanLine,
  Search,
  Smartphone,
  Wrench,
  X,
} from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Empty,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import { MY_EXISTING_ASSETS } from '../../mock/assetApplicationMock';

const { Text } = Typography;
const PRIMARY = '#3370FF';

const CONSUMABLES = [
  {
    id: 'C001',
    name: '罗技 MX Master 3S',
    desc: '办公耗材 · 鼠标',
    quantity: 1,
    relatedAsset: '114122102371',
  },
  {
    id: 'C002',
    name: '绿联 Type-C 多功能转接器',
    desc: '电脑配件 · 转接线',
    quantity: 1,
    relatedAsset: '115083104512',
  },
];

const CONTRACT_NUMBERS = [
  {
    id: 'N001',
    phone: '138 0013 8000',
    carrier: '中国移动',
    packageName: '商务畅享 129 元套餐',
    status: '正常使用',
    owner: '当前员工',
  },
];

const HISTORY_RECORDS = [
  { id: 'MA-202608130001', type: '物资申请', title: 'ThinkPad T14 笔记本', status: '处理中', date: '2026-08-13' },
  { id: 'RP-202608120021', type: '资产更换', title: '微软 Surface Laptop 4', status: '处理中', date: '2026-08-12' },
  { id: 'BR-202608080015', type: '资产借用', title: '戴尔 Latitude 7440', status: '已完成', date: '2026-08-08' },
  { id: 'RT-202608050008', type: '资产退库', title: '戴尔 E2417H显示器', status: '已完成', date: '2026-08-05' },
  { id: 'NR-202608030006', type: '合约号码退库', title: '138 0013 8000', status: '已完成', date: '2026-08-03' },
];

const MATERIAL_OPTIONS = [
  { id: 'M001', type: '资产', name: '联想 ThinkPad T14', config: 'Ultra 7 / 32G / 1T SSD' },
  { id: 'M002', type: '资产', name: '苹果 MacBook Pro 14', config: 'M3 Pro / 18G / 512G SSD' },
  { id: 'M003', type: '耗材', name: '罗技 MX Master 3S', config: '静音 / 无线 / 蓝牙' },
  { id: 'M004', type: '耗材', name: 'Type-C 多功能转接器', config: '转接线.绿联、CELINK、苹果.Type-C转（VGA/以太网/USB/Type-C）' },
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
    Segmented: { trackBg: '#F2F3F5' },
    Card: { paddingLG: 16 },
  },
};

function MobileHeader({ title, onBack, onClose, home = false }) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3">
      <Button
        type="text"
        shape="circle"
        icon={home ? <Home size={20} /> : <ArrowLeft size={20} />}
        onClick={onBack}
      />
      <Text strong className="text-base">{title}</Text>
      {home ? (
        <Avatar size={30} style={{ backgroundColor: '#E8F0FF', color: PRIMARY }}>周</Avatar>
      ) : (
        <Button type="text" shape="circle" icon={<X size={20} />} onClick={onClose} />
      )}
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

function CategoryIcon({ type }) {
  const config = {
    asset: { icon: Laptop, bg: '#E8F3FF', color: '#2E7BEF' },
    consumable: { icon: Package, bg: '#FFF4E8', color: '#F07B2D' },
    contract: { icon: Smartphone, bg: '#EAF8F1', color: '#18A058' },
  }[type];
  const Icon = config.icon;
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: config.bg, color: config.color }}>
      <Icon size={22} />
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function HomeScreen({ onOpen, onBottomNav, onPlus }) {
  const [tab, setTab] = useState('asset');
  const [keyword, setKeyword] = useState('');

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

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="资产服务" home onBack={() => {}} />

        <div className="p-4 pb-3">
          <Card bordered={false} className="overflow-hidden shadow-none" styles={{ body: { padding: 18 } }}>
            <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#EEF4FF_0%,#F8FAFF_100%)] p-4">
              <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-[#3370FF]/5" />
              <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-[#3370FF]/5" />
              <div className="relative">
                <div className="text-xs text-slate-500">我的资产服务</div>
                <div className="mt-1 text-xl font-semibold text-slate-900">你好，当前员工</div>
                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200">
                  <Stat value={MY_EXISTING_ASSETS.length} label="资产" />
                  <Stat value={CONSUMABLES.length} label="耗材" />
                  <Stat value={CONTRACT_NUMBERS.length} label="合约号码" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="sticky top-0 z-10 bg-[#F5F6F7] px-4 pb-3">
          <Segmented
            block
            size="large"
            value={tab}
            onChange={(next) => {
              setTab(next);
              setKeyword('');
            }}
            options={[
              { label: '资产', value: 'asset' },
              { label: '耗材', value: 'consumable' },
              { label: '合约号码', value: 'contract' },
            ]}
          />
          <Input
            allowClear
            className="mt-3"
            prefix={<Search size={16} className="text-slate-400" />}
            placeholder={tab === 'contract' ? '搜索号码、运营商或套餐' : '搜索物资说明或标签号'}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>

        <div className="space-y-3 px-4 pb-5">
          {visibleData.map((item) => {
            if (tab === 'contract') {
              return (
                <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
                  <div className="flex items-start gap-3">
                    <CategoryIcon type="contract" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Text strong className="text-[15px]">{item.phone}</Text>
                        <Tag color="success" bordered={false}>{item.status}</Tag>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">{item.carrier}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.packageName}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                    <Button type="link" size="small" onClick={() => onOpen('contractReturn', item)}>号码退库</Button>
                  </div>
                </Card>
              );
            }

            const assetTag = item.assetTag || item.id;
            return (
              <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
                <div className="flex items-start gap-3">
                  <CategoryIcon type={tab} />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => tab === 'asset' && onOpen('assetDetail', { ...item, assetTag })}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Text strong className="truncate text-[15px]">{item.name}</Text>
                      {tab === 'asset' && <ChevronRight size={18} className="shrink-0 text-slate-300" />}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{tab === 'asset' ? assetTag : `数量 ${item.quantity}`}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.assetDesc || item.desc}</div>
                    {tab === 'consumable' && (
                      <div className="mt-2 text-xs text-slate-500">关联主资产：{item.relatedAsset}</div>
                    )}
                  </button>
                </div>
                {tab === 'asset' && (
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <Button size="small" onClick={() => onOpen('return', item)}>退库</Button>
                    <Button size="small" onClick={() => onOpen('replace', item)}>更换</Button>
                  </div>
                )}
              </Card>
            );
          })}
          {visibleData.length === 0 && <Empty className="py-16" description="暂无相关数据" />}
        </div>
      </div>
      <BottomNav active="home" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function HistoryScreen({ onBottomNav, onPlus }) {
  const [status, setStatus] = useState('pending');
  const [type, setType] = useState('全部');
  const types = ['全部', '物资申请', '资产借用', '资产更换', '资产退库', '合约号码退库'];
  const records = HISTORY_RECORDS.filter((item) => (
    (status === 'pending' ? item.status !== '已完成' : item.status === '已完成')
    && (type === '全部' || item.type === type)
  ));

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="我的单据" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="bg-white px-4 py-3">
          <Segmented
            block
            value={status}
            onChange={setStatus}
            options={[{ label: '未完成', value: 'pending' }, { label: '已完成', value: 'done' }]}
          />
          <Select
            className="mt-3 w-full"
            value={type}
            onChange={setType}
            options={types.map((item) => ({ label: item, value: item }))}
          />
        </div>
        <div className="space-y-3 p-4">
          {records.map((item) => (
            <Card key={item.id} bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text strong>{item.type}</Text>
                  <div className="mt-2 truncate text-sm text-slate-600">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.id} · {item.date}</div>
                </div>
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
  const data = MY_EXISTING_ASSETS.filter((asset) => (
    (tab === 'done' ? checkedIds.includes(asset.id) : !checkedIds.includes(asset.id))
    && (!keyword.trim() || `${asset.name} ${asset.assetTag} ${asset.config}`.toLowerCase().includes(keyword.trim().toLowerCase()))
  ));

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="资产盘点" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="bg-white p-4">
          <Segmented block value={tab} onChange={setTab} options={[{ label: '未盘', value: 'todo' }, { label: '已盘', value: 'done' }]} />
          <Input className="mt-3" prefix={<Search size={16} className="text-slate-400" />} placeholder="输入资产说明、标签号、序列号" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
        <div className="px-4 py-3 text-xs text-slate-500">{tab === 'done' ? '已盘' : '未盘'} · 共 {data.length} 条</div>
        <div className="space-y-3 px-4 pb-4">
          {data.map((asset) => (
            <Card key={asset.id} bordered={false} className="shadow-none" styles={{ body: { padding: 0 } }}>
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => onOpen('inventoryDetail', {
                  ...asset,
                  checked: checkedIds.includes(asset.id),
                  onChecked: () => setCheckedIds((ids) => ids.includes(asset.id) ? ids : [...ids, asset.id]),
                })}
              >
                <CategoryIcon type="asset" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">{asset.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{asset.assetTag}</div>
                  <div className="mt-1 truncate text-xs text-slate-400">{asset.config}</div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            </Card>
          ))}
          {data.length === 0 && <Empty className="py-16" description="暂无数据" />}
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
    onOpen('assetDetail', asset);
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
        <MobileHeader title="扫一扫" onBack={() => onBottomNav('home')} onClose={() => onBottomNav('home')} />
        <div className="p-4">
          <Card bordered={false} className="shadow-none" styles={{ body: { padding: 20 } }}>
            <div className="flex flex-col items-center py-8">
              <div className="flex h-48 w-48 items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/60 text-blue-300">
                <ScanLine size={68} />
              </div>
              <div className="mt-5 text-sm text-slate-500">原型使用资产标签号输入模拟扫码</div>
              <Space.Compact className="mt-4 w-full">
                <Input placeholder="输入资产标签号" value={value} onChange={(event) => setValue(event.target.value)} onPressEnter={handleLookup} />
                <Button type="primary" onClick={handleLookup}>查询</Button>
              </Space.Compact>
            </div>
          </Card>
        </div>
      </div>
      <BottomNav active="scan" onChange={onBottomNav} onPlus={onPlus} />
    </>
  );
}

function AssetDetailScreen({ asset, onBack, onOpen }) {
  const rows = [
    ['资产标签号', asset.assetTag || asset.id],
    ['资产说明', asset.assetDesc || asset.name],
    ['配置', asset.config || '-'],
    ['资产用途', asset.purpose || '员工用机'],
    ['资产状态', asset.status || '在用-使用中'],
    ['责任人', '当前员工'],
    ['资产地址', '北京市 · 搜狐媒体大厦 · 17层'],
  ];
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      <MobileHeader title="资产详情" onBack={onBack} onClose={onBack} />
      <div className="p-4">
        <Card bordered={false} className="shadow-none" styles={{ body: { padding: 16 } }}>
          <div className="mb-4 flex items-center gap-3">
            <CategoryIcon type="asset" />
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{asset.name}</div>
              <Tag className="mt-1" color="success" bordered={false}>{asset.status || '在用-使用中'}</Tag>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[86px_1fr] gap-3 py-3 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="break-words text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button size="large" icon={<ArrowDownToLine size={16} />} onClick={() => onOpen('return', asset)}>退库</Button>
          <Button type="primary" size="large" icon={<Wrench size={16} />} onClick={() => onOpen('replace', asset)}>更换</Button>
        </div>
      </div>
    </div>
  );
}

function BusinessForm({ mode, asset, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  const isReturn = mode === 'return';
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}
      <MobileHeader title={isReturn ? '资产退库' : '资产更换'} onBack={onBack} onClose={onBack} />
      <div className="space-y-3 p-4">
        <Card bordered={false} className="shadow-none" title={isReturn ? '退库信息' : '更换信息'}>
          <div className="mb-4 text-sm text-slate-500">{isReturn ? '退库类型：资产退库' : '更换类型：故障更换'}</div>
          <div className="mb-2 text-sm"><span className="text-red-500">*</span>{isReturn ? '退库原因' : '更换原因'}</div>
          <Input.TextArea rows={5} maxLength={150} showCount value={reason} placeholder={`请填写${isReturn ? '退库' : '更换'}原因`} onChange={(event) => setReason(event.target.value)} />
        </Card>
        <Card bordered={false} className="shadow-none" title={asset.name}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-[86px_1fr] gap-3"><span className="text-slate-500">资产标签号</span><span>{asset.assetTag || asset.id}</span></div>
            <div className="grid grid-cols-[86px_1fr] gap-3"><span className="text-slate-500">资产说明</span><span>{asset.assetDesc || asset.name}</span></div>
            <div className="grid grid-cols-[86px_1fr] gap-3"><span className="text-slate-500">配置</span><span>{asset.config || '-'}</span></div>
          </div>
        </Card>
        <Button
          block
          type="primary"
          size="large"
          onClick={() => {
            if (!reason.trim()) {
              messageApi.warning(`请填写${isReturn ? '退库' : '更换'}原因`);
              return;
            }
            messageApi.success(`${isReturn ? '退库' : '更换'}申请已提交`);
          }}
        >
          {isReturn ? '提交' : '预览'}
        </Button>
      </div>
    </div>
  );
}

function ContractReturnScreen({ contract, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}
      <MobileHeader title="合约号码退库" onBack={onBack} onClose={onBack} />
      <div className="space-y-3 p-4">
        <Card bordered={false} className="shadow-none">
          <div className="flex items-center gap-3">
            <CategoryIcon type="contract" />
            <div>
              <div className="font-semibold">{contract.phone}</div>
              <div className="mt-1 text-xs text-slate-500">{contract.carrier} · {contract.packageName}</div>
            </div>
          </div>
        </Card>
        <Card bordered={false} className="shadow-none" title="退库信息">
          <div className="mb-2 text-sm"><span className="text-red-500">*</span>退库原因</div>
          <Input.TextArea rows={5} maxLength={150} showCount value={reason} placeholder="请填写合约号码退库原因" onChange={(event) => setReason(event.target.value)} />
        </Card>
        <Button block type="primary" size="large" onClick={() => reason.trim() ? messageApi.success('合约号码退库申请已提交') : messageApi.warning('请填写退库原因')}>提交</Button>
      </div>
    </div>
  );
}

function InventoryDetailScreen({ asset, onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}
      <MobileHeader title="资产盘点" onBack={onBack} onClose={onBack} />
      <div className="p-4">
        <Card bordered={false} className="shadow-none">
          <div className="mb-4 flex items-center gap-3">
            <CategoryIcon type="asset" />
            <div><div className="font-semibold">{asset.name}</div><div className="mt-1 text-xs text-slate-500">{asset.assetTag}</div></div>
          </div>
          {[
            ['用途', asset.purpose || '员工用机'],
            ['使用状态', asset.status || '在用-使用中'],
            ['说明', asset.assetDesc || asset.name],
            ['责任人', '当前员工'],
            ['盘点状态', asset.checked ? '已盘' : '未盘'],
            ['资产地址', '北京市 · 搜狐媒体大厦 · 17层'],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[86px_1fr] gap-3 border-t border-slate-100 py-3 text-sm">
              <span className="text-slate-500">{label}</span><span>{value}</span>
            </div>
          ))}
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button danger size="large" onClick={() => messageApi.info('已登记报失')}>报失</Button>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              asset.onChecked?.();
              messageApi.success('盘点完成');
            }}
          >盘点</Button>
        </div>
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
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}
      <MobileHeader title="物资申请" onBack={onBack} onClose={onBack} />
      <div className="space-y-3 p-4">
        <Card bordered={false} className="shadow-none">
          <Segmented block value={tab} onChange={(next) => { setTab(next); setSelected(null); }} options={['资产', '耗材']} />
          <div className="mt-3 space-y-2">
            {options.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${selected?.id === item.id ? 'border-blue-300 bg-blue-50' : 'border-slate-100 bg-white'}`}
                onClick={() => setSelected(item)}
              >
                <CategoryIcon type={tab === '耗材' ? 'consumable' : 'asset'} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="mt-1 break-words text-xs leading-5 text-slate-500">{item.config}</div>
                </div>
                {selected?.id === item.id && <CheckCircle2 size={20} color={PRIMARY} />}
              </button>
            ))}
          </div>
        </Card>

        {selected && (
          <Card bordered={false} className="shadow-none" title="申请信息">
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm text-slate-600">数量</div>
                <InputNumber min={1} precision={0} value={quantity} onChange={(value) => setQuantity(value || 1)} />
              </div>
              <div>
                <div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>申请用途</div>
                <Select
                  className="w-full"
                  value={purpose || undefined}
                  placeholder="请选择申请用途"
                  onChange={setPurpose}
                  options={['员工用机', '部门公用', '其他用途', '专业用途'].map((item) => ({ label: item, value: item }))}
                />
              </div>
              {tab === '耗材' && (
                <div>
                  <div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>关联主资产</div>
                  <Select
                    className="w-full"
                    value={relatedAsset || undefined}
                    placeholder="请选择本人名下资产"
                    onChange={setRelatedAsset}
                    options={MY_EXISTING_ASSETS.map((asset) => ({ label: asset.assetTag, value: asset.assetTag }))}
                  />
                </div>
              )}
              <div>
                <div className="mb-2 text-sm text-slate-600"><span className="text-red-500">*</span>申请原因</div>
                <Input.TextArea rows={4} maxLength={400} showCount value={reason} placeholder="请填写申请原因" onChange={(event) => setReason(event.target.value)} />
              </div>
              <Button
                block
                type="primary"
                size="large"
                onClick={() => {
                  if (!purpose || !reason.trim() || (tab === '耗材' && !relatedAsset)) {
                    messageApi.warning('请补充必填信息');
                    return;
                  }
                  messageApi.success(`已提交 ${quantity} 件物资申请`);
                }}
              >预览并提交</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function BorrowApplyScreen({ onBack }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [reason, setReason] = useState('');
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#F5F6F7]">
      {contextHolder}
      <MobileHeader title="资产借用" onBack={onBack} onClose={onBack} />
      <div className="space-y-3 p-4">
        <Card bordered={false} className="shadow-none" title="借用资产">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <CategoryIcon type="asset" />
            <div><div className="font-medium">戴尔 Latitude 7440</div><div className="mt-1 text-xs text-slate-400">NOTEBOOK · 标准借用资产</div></div>
          </div>
        </Card>
        <Card bordered={false} className="shadow-none" title="借用信息">
          <div className="grid grid-cols-2 gap-3">
            <div><div className="mb-1 text-xs text-slate-500">开始日期</div><input type="date" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></div>
            <div><div className="mb-1 text-xs text-slate-500">归还日期</div><input type="date" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></div>
          </div>
          <div className="mt-4 text-sm text-slate-600"><span className="text-red-500">*</span>需求说明</div>
          <Input.TextArea className="mt-2" rows={5} maxLength={150} showCount value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请填写借用需求说明" />
        </Card>
        <Button block type="primary" size="large" onClick={() => reason.trim() ? messageApi.success('借用申请已提交') : messageApi.warning('请填写需求说明')}>提交</Button>
      </div>
    </div>
  );
}

function QuickActions({ onClose, onOpen }) {
  const actions = [
    { key: 'material', label: '物资申请', desc: '申请资产或耗材', icon: ClipboardList, bg: '#E8F3FF', color: '#2E7BEF' },
    { key: 'borrow', label: '资产借用', desc: '发起临时借用', icon: FileText, bg: '#F2EDFF', color: '#7B61FF' },
    { key: 'contractReturn', label: '号码退库', desc: '退回本人合约号码', icon: Phone, bg: '#EAF8F1', color: '#18A058' },
  ];
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/25" onClick={onClose}>
      <div className="w-full rounded-t-[22px] bg-white p-4 pb-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <Text strong className="text-base">快捷发起</Text>
          <Button type="text" shape="circle" icon={<X size={18} />} onClick={onClose} />
        </div>
        <div className="space-y-2">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50"
                onClick={() => onOpen(item.key, item.key === 'contractReturn' ? CONTRACT_NUMBERS[0] : null)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: item.bg, color: item.color }}><Icon size={20} /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium text-slate-900">{item.label}</span><span className="mt-0.5 block text-xs text-slate-400">{item.desc}</span></span>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            );
          })}
        </div>
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
  else if (screen === 'return') content = <BusinessForm mode="return" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'replace') content = <BusinessForm mode="replace" asset={payload || {}} onBack={backHome} />;
  else if (screen === 'contractReturn') content = <ContractReturnScreen contract={payload || CONTRACT_NUMBERS[0]} onBack={backHome} />;
  else if (screen === 'inventoryDetail') content = <InventoryDetailScreen asset={payload || {}} onBack={() => bottomNav('inventory')} />;
  else if (screen === 'material') content = <MaterialApplyScreen onBack={backHome} />;
  else if (screen === 'borrow') content = <BorrowApplyScreen onBack={backHome} />;
  else content = <HomeScreen onOpen={openScreen} onBottomNav={bottomNav} onPlus={() => setQuickOpen(true)} />;

  return (
    <ConfigProvider theme={APP_THEME}>
      <div className="flex w-full justify-center py-2">
        <div className="relative flex h-[820px] w-full max-w-[430px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-[#F5F6F7] shadow-xl">
          {content}
          {quickOpen && <QuickActions onClose={() => setQuickOpen(false)} onOpen={openScreen} />}
        </div>
      </div>
    </ConfigProvider>
  );
}
