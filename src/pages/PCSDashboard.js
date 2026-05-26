import React, { useState } from 'react';
import { HelpCircle, Calendar, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// ==========================================
// 1. 数据部分 (Data)
// ==========================================

// 原有域名数据
const mockData = [
  { id: 1, name: 'sohu-inc.net', regDate: '2001-06-15 06:28:09', expDate: '2026-06-15 06:28:09', cost: ' 120.00', status: '即将过期' },
  { id: 2, name: 'sohu-inc.net.cn', regDate: '2001-06-23 00:00:00', expDate: '2026-06-23 00:00:00', cost: ' 60.00', status: '正常' },
  { id: 3, name: 'sohu-inc.com.cn', regDate: '2001-06-23 00:00:00', expDate: '2026-06-23 00:00:00', cost: ' 60.00', status: '即将过期' },
  { id: 4, name: '56img.net', regDate: '2011-06-29 13:42:53', expDate: '2026-06-29 13:42:53', cost: ' 85.00', status: '正常' },
  { id: 5, name: 'soq.com.cn', regDate: '2000-06-30 00:00:00', expDate: '2026-06-30 00:00:00', cost: ' 60.00', status: '正常' },
  { id: 6, name: 'soicq.com.cn', regDate: '2000-06-30 00:00:00', expDate: '2026-06-30 00:00:00', cost: ' 60.00', status: '正常' },
  { id: 7, name: 'sohuicq.com.cn', regDate: '2000-06-30 00:00:00', expDate: '2026-06-30 00:00:00', cost: ' 60.00', status: '即将过期' },
  { id: 8, name: 'sohu-icq.com.cn', regDate: '2000-06-30 00:00:00', expDate: '2026-06-30 00:00:00', cost: ' 60.00', status: '正常' },
  { id: 9, name: 'so-icq.com.cn', regDate: '2000-06-30 00:00:00', expDate: '2026-06-30 00:00:00', cost: ' 60.00', status: '正常' },
  { id: 10, name: 'scq.com.cn', regDate: '2000-06-30 00:00:00', expDate: '2026-06-30 00:00:00', cost: ' 60.00', status: '即将过期' },
];

// 新增 HTTPS 证书数据
const mockCertData = [
  {
    id: 'SHZS-M-00259',
    name: 'q.fund.sohu.com',
    department: '大数据中心',
    cost: ' 4,500.00',
    subItems: [
      { domain: '*.biz.itc.cn', user: '姜新荣' },
      { domain: '*.stock.sohu.com', user: '姜新荣' },
      { domain: 'q.fund.sohu.com', user: '姜新荣' }
    ],
    provider: '天威诚信',
    brand: 'GeoTrust',
    effectiveTime: '2025-12-31\n08:00:00',
    expireTime: '2027-02-01\n07:59:59',
    status: '正常'
  },
  {
    id: 'SHZS-M-00266',
    name: '*.mail.sohu.com',
    department: '网络运营部',
    cost: ' 12,800.00',
    subItems: [
      { domain: 'm.score.mail.sohu.com', user: '王错' },
      { domain: 'm.vip.sohu.com', user: '王错' },
      { domain: '*.mail.sohu.com', user: '王错' },
      { domain: 'smtp.vip.sohu.com', user: '王错' },
      { domain: 'pop3.vip.sohu.com', user: '王错' },
      { domain: 'imap.vip.sohu.com', user: '王错' }
    ],
    provider: '天威诚信',
    brand: 'GeoTrust',
    effectiveTime: '2025-12-12\n08:00:00',
    expireTime: '2027-01-05\n07:59:59',
    status: '即将过期'
  },
  {
    id: 'SHZS-M-00276',
    name: '*.itc.cn',
    department: '大数据中心',
    cost: ' 8,600.00',
    subItems: [
      { domain: '*.itc.cn', user: '司树刚' },
      { domain: 'itc.cn', user: '司树刚' }
    ],
    provider: '天威诚信',
    brand: 'Symantec',
    effectiveTime: '2025-06-19\n08:00:00',
    expireTime: '2026-07-21\n07:59:59',
    status: '正常'
  },
  {
    id: 'SHZS-M-00277',
    name: '*.go.sohu.com',
    department: '人力资源中心',
    cost: ' 3,200.00',
    subItems: [
      { domain: 'go.sohu.com', user: '刘丙凯' },
      { domain: '*.go.sohu.com', user: '刘丙凯' }
    ],
    provider: '天威诚信',
    brand: 'Symantec',
    effectiveTime: '2025-06-19\n08:00:00',
    expireTime: '2026-07-21\n07:59:59',
    status: '正常'
  },
  {
    id: 'SHZS-S-00278',
    name: '*.k.sohu.com',
    department: '网络运营部',
    cost: ' 1,500.00',
    subItems: [
      { domain: '*.k.sohu.com', user: '马春' }
    ],
    provider: '天威诚信',
    brand: 'Symantec',
    effectiveTime: '2025-08-27\n08:00:00',
    expireTime: '2026-09-24\n07:59:59',
    status: '正常'
  }
];

// 图表颜色常量
const THEME_COLORS = ['#4080FF', '#FFB240', '#45D9A1', '#B56DFF', '#36CBCB', '#F2637B'];

// 核心指标数据
const summaryData = {
  totalCount: 664,
  totalCost: 333820.00,
  domain: { count: 364, cost: 120000.00 },
  cert: { count: 300, cost: 213820.00 },
  normal: { count: 640, cost: 320000.00 },
  alerting: { expiringCount: 20, expiredCount: 4 }
};

// 域名资产状态分布
const domainStatusData = [
  { name: '正常', value: 345 },
  { name: '即将过期', value: 16 },
];

// HTTPS证书状态分布
const certStatusData = [
  { name: '正常', value: 295 },
  { name: '即将过期', value: 4 },
];

// 部门归属金额分布
const deptCostData = [
  { name: '产品技术中心', value: 85000.00 },
  { name: '网络运营部', value: 72000.00 },
  { name: '大数据中心', value: 65000.00 },
  { name: '内容中心', value: 45000.00 },
  { name: '汽车部门', value: 32000.00 },
  { name: '人力资源中心', value: 19820.00 },
  { name: 'ERP', value: 15000.00 },
];

// 部门归属数量分布
const deptCountData = [
  { name: '网络运营部', value: 156 },
  { name: '产品技术中心', value: 142 },
  { name: '大数据中心', value: 110 },
  { name: '内容中心', value: 88 },
  { name: '汽车部门', value: 65 },
  { name: '人力资源中心', value: 58 },
  { name: 'ERP', value: 45 },
];

// ==========================================
// 2. 组件及渲染函数部分 (Components)
// ==========================================

// SVG Info Icon helper
const InfoIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-400 inline-block ml-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// 统一的健康状态标签渲染函数
const renderStatusBadge = (status) => {
  if (status === '即将过期') {
    return (
      <span className="inline-flex px-2 py-0.5 text-[12px] text-[#D88A1A] bg-[#FFF8E6] border border-[#FBE6C4] rounded-[2px]">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 text-[12px] text-[#16A34A] bg-[#DCFCE7] border border-[#bbf7d0] rounded-[2px]">
      {status}
    </span>
  );
};

// 自定义环形图组件
const CustomDonutChart = ({ title, data, centerLabel, centerValue }) => {
  return (
    <div className="flex-1">
      <h3 className="text-sm font-bold text-gray-800 mb-6">{title}</h3>
      <div className="flex items-center">
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500 mb-1">{centerLabel}</span>
            <span className="text-lg font-bold text-blue-500">{centerValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="ml-8 flex-1 flex flex-col items-end space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center w-36 text-xs mb-3 last:mb-0">
              <div className="flex items-center">
                <span 
                  className="w-2.5 h-2.5 rounded-full mr-2" 
                  style={{ backgroundColor: THEME_COLORS[index % THEME_COLORS.length] }}
                ></span>
                <span className="text-gray-600 ">{item.name}</span>
              </div>
              <span className="text-gray-400 ">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 自定义柱状图组件
const CustomBarChart = ({ title, data }) => {
  return (
    <div className="flex-1 flex flex-col h-full w-full">
      <h3 className="text-sm font-bold text-gray-800 mb-6">{title}</h3>
      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#8c8c8c' }} 
              dy={15}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#8c8c8c' }} 
              width={65}
            />
            <Tooltip 
              cursor={{ fill: '#f5f5f5' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => `${value.toLocaleString()}`}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==========================================
// 3. 主应用 (Main App)
// ==========================================

export default function PCSDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'domain' | 'cert'

  const isOverview = activeTab === 'overview';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isOverview ? 'bg-[#F5F7FA] text-gray-800 p-8' : 'bg-[#F8F9FA] p-6 flex flex-col'}`}>
      <div className={`${isOverview ? 'max-w-[1200px]' : 'max-w-[1440px] flex-1'} mx-auto w-full transition-all duration-300`}>
        
        {/* 全局统一 Tabs Header */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: '总览' },
              { id: 'domain', label: '顶级域名' },
              { id: 'cert', label: 'HTTPS证书' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-3 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ---------------- 模块一：总览看板 ---------------- */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-300">
            {/* 顶部核心指标卡片区域 */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="bg-[#5185FA] rounded-xl p-4 text-white w-full lg:w-1/5 shadow-sm flex flex-col justify-between h-[180px]">
                <div>
                  <h2 className="text-xl font-bold mb-4">总览</h2>
                  <div className="mb-2">
                    <p className="text-blue-100 text-xs mb-1 flex items-center">
                      资产总数 <InfoIcon />
                    </p>
                    <p className="text-3xl font-bold">{summaryData.totalCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-100 text-xs mb-1 flex items-center">
                      年度总费用 (元) <InfoIcon />
                    </p>
                    <p className="text-xl font-semibold">{summaryData.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 flex flex-col justify-between w-full lg:w-2/5 h-[180px]">
                <h3 className="text-base font-bold text-gray-800">顶级域名</h3>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">域名总数 <InfoIcon /></p>
                    <p className="text-2xl font-medium text-blue-500">{summaryData.domain.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">年度总费用 (元) <InfoIcon /></p>
                    <p className="text-2xl font-medium text-blue-500">{summaryData.domain.cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 flex flex-col justify-between w-full lg:w-2/5 h-[180px]">
                <h3 className="text-base font-bold text-gray-800">HTTPS 证书</h3>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">证书总数 <InfoIcon /></p>
                    <p className="text-2xl font-medium text-blue-500">{summaryData.cert.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">年度总费用 (元) <InfoIcon /></p>
                    <p className="text-2xl font-medium text-blue-500">{summaryData.cert.cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 资产状态分布 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-x divide-gray-100">
                <div className="pr-4">
                  <CustomDonutChart 
                    title="顶级域名状态分布" 
                    data={domainStatusData} 
                    centerLabel="域名总数" 
                    centerValue={summaryData.domain.count} 
                  />
                </div>
                <div className="pl-4">
                  <CustomDonutChart 
                    title="HTTPS证书状态分布" 
                    data={certStatusData} 
                    centerLabel="证书总数" 
                    centerValue={summaryData.cert.count} 
                  />
                </div>
              </div>
            </div>

            {/* 部门分布 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-x divide-gray-100">
                <div className="pr-4">
                  <CustomBarChart 
                    title="年度费用部门分布" 
                    data={deptCostData} 
                  />
                </div>
                <div className="pl-4">
                  <CustomBarChart 
                    title="证书数量部门分布" 
                    data={deptCountData} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 模块二：域名 内容面板 ---------------- */}
        {activeTab === 'domain' && (
          <div className="animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 bg-white border border-gray-200 rounded-md mb-6 shadow-sm">
              <div className="p-5 border-r border-gray-200">
                <div className="text-gray-500 text-sm mb-2">域名总数</div>
                <div className="text-[28px] text-[#1E5EFF] font-semibold leading-none">186</div>
              </div>
              <div className="p-5 border-r border-gray-200">
                <div className="text-gray-500 text-sm mb-2">年度总费用（元）</div>
                <div className="text-[28px] text-[#1E5EFF] font-semibold leading-none"> ¥12,500</div>
              </div>
              <div className="p-5">
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  即将过期 <HelpCircle className="w-3.5 h-3.5 ml-1 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <div className="text-[28px] text-[#D88A1A] font-semibold leading-none">16</div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-5 rounded-md border border-gray-200 mb-6 shadow-sm flex items-start gap-8">
              <div className="grid grid-cols-3 gap-y-4 gap-x-8 flex-1">
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">域名名称：</label>
                  <input 
                    type="text" 
                    placeholder="请输入" 
                    className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300" 
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">注册时间：</label>
                  <div className="flex items-center border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full bg-white group hover:border-blue-400 transition-colors cursor-text">
                    <input type="text" placeholder="开始日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent placeholder:text-gray-300" />
                    <span className="text-gray-300 mx-2 select-none shrink-0">→</span>
                    <input type="text" placeholder="结束日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent text-right placeholder:text-gray-300" />
                    <Calendar className="w-4 h-4 text-gray-300 ml-2 group-hover:text-gray-400 shrink-0" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">到期时间：</label>
                  <div className="flex items-center border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full bg-white group hover:border-blue-400 transition-colors cursor-text">
                    <input type="text" placeholder="开始日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent placeholder:text-gray-300" />
                    <span className="text-gray-300 mx-2 select-none shrink-0">→</span>
                    <input type="text" placeholder="结束日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent text-right placeholder:text-gray-300" />
                    <Calendar className="w-4 h-4 text-gray-300 ml-2 group-hover:text-gray-400 shrink-0" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">健康状态：</label>
                  <div className="relative w-full">
                    <select className="appearance-none border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white text-gray-400 cursor-pointer">
                      <option value="">请选择</option>
                      <option value="normal" className="text-gray-700">正常</option>
                      <option value="expiring" className="text-gray-700">即将过期</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button className="bg-[#1E5EFF] hover:bg-blue-700 text-white w-[80px] h-[32px] flex items-center justify-center rounded-[4px] text-sm transition-colors border border-transparent">查询</button>
                <button className="bg-white hover:bg-gray-50 text-gray-600 w-[80px] h-[32px] flex items-center justify-center rounded-[4px] text-sm border border-gray-300 transition-colors">重置</button>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col relative">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-gray-200">
                      <th className="px-6 py-3.5 text-sm font-semibold text-gray-800 w-[20%]">域名名称</th>
                      <th className="px-6 py-3.5 text-sm font-semibold text-gray-800 w-[20%]">注册时间</th>
                      <th className="px-6 py-3.5 text-sm font-semibold text-gray-800 w-[20%]">到期时间</th>
                      <th className="px-6 py-3.5 text-sm font-semibold text-gray-800 w-[15%]">费用金额（CNY）</th>
                      <th className="px-6 py-3.5 text-sm font-semibold text-gray-800 w-[15%]">健康状态</th>
                      <th className="px-6 py-3.5 text-sm font-semibold text-gray-800 w-[10%]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FBFF] transition-colors group">
                        <td className="px-6 py-4 text-[13px] text-gray-700">{item.name}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-700">{item.regDate}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-700">{item.expDate}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-700">{item.cost}</td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-[#1E5EFF] text-[13px] hover:text-blue-700 hover:underline transition-colors">变更记录</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end px-6 py-3 border-t border-gray-200 bg-white">
                <span className="text-[13px] text-gray-500 mr-4">共 186 条</span>
                <div className="flex items-center gap-1.5">
                  <button className="p-1 min-w-[28px] h-[28px] flex items-center justify-center border border-gray-200 rounded-[2px] text-gray-400 hover:border-gray-300 hover:text-gray-600 bg-white cursor-not-allowed" disabled>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button className="min-w-[28px] h-[28px] flex items-center justify-center border border-[#1E5EFF] bg-white text-[#1E5EFF] rounded-[2px] text-[13px]">1</button>
                  <button className="min-w-[28px] h-[28px] flex items-center justify-center border border-transparent hover:bg-gray-100 text-gray-600 rounded-[2px] text-[13px] transition-colors">2</button>
                  <button className="min-w-[28px] h-[28px] flex items-center justify-center border border-transparent hover:bg-gray-100 text-gray-600 rounded-[2px] text-[13px] transition-colors">3</button>
                  <span className="text-gray-400 px-1">•••</span>
                  <button className="min-w-[28px] h-[28px] flex items-center justify-center border border-transparent hover:bg-gray-100 text-gray-600 rounded-[2px] text-[13px] transition-colors">19</button>
                  <button className="p-1 min-w-[28px] h-[28px] flex items-center justify-center border border-gray-200 rounded-[2px] text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white">
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
                <div className="ml-4 flex items-center gap-2 text-[13px] text-gray-600">
                  <div className="relative cursor-pointer">
                    <select className="appearance-none border border-gray-200 rounded-[2px] pl-2 pr-6 py-1 h-[28px] focus:outline-none focus:border-blue-500 bg-white">
                      <option>10 条/页</option>
                      <option>20 条/页</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span>跳至</span>
                    <input type="text" className="w-10 h-[28px] border border-gray-200 rounded-[2px] px-1 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                    <span>页</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 模块三：HTTPS证书 内容面板 ---------------- */}
        {activeTab === 'cert' && (
          <div className="animate-in fade-in duration-300">
            {/* 证书指标卡片 */}
            <div className="grid grid-cols-3 bg-white border border-gray-200 rounded-md mb-6 shadow-sm">
              <div className="p-5 border-r border-gray-200">
                <div className="text-gray-500 text-sm mb-2">证书总数</div>
                <div className="text-[28px] text-[#1E5EFF] font-semibold leading-none">156</div>
              </div>
              <div className="p-5 border-r border-gray-200">
                <div className="text-gray-500 text-sm mb-2">年度总费用（元）</div>
                <div className="text-[28px] text-[#1E5EFF] font-semibold leading-none"> ¥358,400</div>
              </div>
              <div className="p-5">
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  即将过期 <HelpCircle className="w-3.5 h-3.5 ml-1 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <div className="text-[28px] text-[#D88A1A] font-semibold leading-none">3</div>
              </div>
            </div>

            {/* 证书查询过滤区 */}
            <div className="bg-white p-5 rounded-md border border-gray-200 mb-6 shadow-sm flex items-start gap-8">
              <div className="grid grid-cols-3 gap-y-4 gap-x-8 flex-1">
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">证书名称：</label>
                  <input 
                    type="text" 
                    placeholder="请输入" 
                    className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300" 
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">使用人：</label>
                  <input 
                    type="text" 
                    placeholder="请输入" 
                    className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-300" 
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">使用部门：</label>
                  <div className="relative w-full">
                    <select className="appearance-none border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white text-gray-400 cursor-pointer">
                      <option value="">全部部门</option>
                      <option value="erp" className="text-gray-700">ERP</option>
                      <option value="hr" className="text-gray-700">人力资源中心</option>
                      <option value="net" className="text-gray-700">网络运营部</option>
                      <option value="data" className="text-gray-700">大数据中心</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">生效时间：</label>
                  <div className="flex items-center border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full bg-white group hover:border-blue-400 transition-colors cursor-text">
                    <input type="text" placeholder="开始日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent placeholder:text-gray-300" />
                    <span className="text-gray-300 mx-2 select-none shrink-0">→</span>
                    <input type="text" placeholder="结束日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent text-right placeholder:text-gray-300" />
                    <Calendar className="w-4 h-4 text-gray-300 ml-2 group-hover:text-gray-400 shrink-0" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">到期时间：</label>
                  <div className="flex items-center border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full bg-white group hover:border-blue-400 transition-colors cursor-text">
                    <input type="text" placeholder="开始日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent placeholder:text-gray-300" />
                    <span className="text-gray-300 mx-2 select-none shrink-0">→</span>
                    <input type="text" placeholder="结束日期" className="w-full min-w-0 outline-none text-gray-600 bg-transparent text-right placeholder:text-gray-300" />
                    <Calendar className="w-4 h-4 text-gray-300 ml-2 group-hover:text-gray-400 shrink-0" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 w-20 text-right mr-2 shrink-0">健康状态：</label>
                  <div className="relative w-full">
                    <select className="appearance-none border border-gray-300 rounded-[4px] px-3 py-1.5 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-white text-gray-400 cursor-pointer">
                      <option value="">请选择</option>
                      <option value="normal" className="text-gray-700">正常</option>
                      <option value="expiring" className="text-gray-700">即将过期</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button className="bg-[#1E5EFF] hover:bg-blue-700 text-white w-[80px] h-[32px] flex items-center justify-center rounded-[4px] text-sm transition-colors border border-transparent">查询</button>
                <button className="bg-white hover:bg-gray-50 text-gray-600 w-[80px] h-[32px] flex items-center justify-center rounded-[4px] text-sm border border-gray-300 transition-colors">重置</button>
              </div>
            </div>

            {/* 证书数据表格 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-gray-200">
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">证书名称 <ArrowUpDown className="w-3 h-3 inline text-gray-400 ml-0.5" /></th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">涵盖域名</th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">使用人</th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">使用部门</th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">费用金额（CNY）） <ArrowUpDown className="w-3 h-3 inline text-gray-400 ml-0.5" /></th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">供应商 <ArrowUpDown className="w-3 h-3 inline text-gray-400 ml-0.5" /></th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">证书品牌 <ArrowUpDown className="w-3 h-3 inline text-gray-400 ml-0.5" /></th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">生效时间 <ArrowUpDown className="w-3 h-3 inline text-gray-400 ml-0.5" /></th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">到期时间</th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-100">健康状态</th>
                      <th className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockCertData.map((cert) => (
                      <React.Fragment key={cert.id}>
                        {cert.subItems.map((sub, subIdx) => (
                          <tr key={`${cert.id}-${subIdx}`}>
                            {subIdx === 0 && (
                              <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-700 bg-white">
                                <a href="#" className="text-[#1E5EFF] hover:text-blue-700 hover:underline transition-colors font-medium">{cert.name}</a>
                              </td>
                            )}
                            <td className={`px-4 py-3 border-r border-gray-100 text-gray-700 bg-white ${subIdx !== cert.subItems.length - 1 ? 'border-b border-gray-50' : 'border-b border-gray-100'}`}>
                              {sub.domain}
                            </td>
                            <td className={`px-4 py-3 border-r border-gray-100 bg-white ${subIdx !== cert.subItems.length - 1 ? 'border-b border-gray-50' : 'border-b border-gray-100'}`}>
                              <button className="text-[#1E5EFF] hover:underline transition-colors">{sub.user}</button>
                            </td>
                            {subIdx === 0 && (
                              <>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-600 bg-white">{cert.department}</td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-700 bg-white">{cert.cost}</td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-700 bg-white">{cert.provider}</td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-700 bg-white">{cert.brand}</td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-700 bg-white whitespace-pre-line leading-relaxed">{cert.effectiveTime}</td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 text-gray-700 bg-white whitespace-pre-line leading-relaxed">{cert.expireTime}</td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-r border-b border-gray-100 bg-white">
                                  {renderStatusBadge(cert.status)}
                                </td>
                                <td rowSpan={cert.subItems.length} className="px-4 py-4 border-b border-gray-100 bg-white">
                                  <button className="text-[#1E5EFF] hover:text-blue-700 hover:underline transition-colors">变更记录</button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 证书分页器 */}
              <div className="flex items-center justify-end px-6 py-3 border-t border-gray-200 bg-white">
                <span className="text-[13px] text-gray-500 mr-4">共 156 条</span>
                <div className="flex items-center gap-1.5">
                  <button className="p-1 min-w-[28px] h-[28px] flex items-center justify-center border border-gray-200 rounded-[2px] text-gray-400 hover:border-gray-300 hover:text-gray-600 bg-white cursor-not-allowed" disabled>
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                  <button className="min-w-[28px] h-[28px] flex items-center justify-center border border-[#1E5EFF] bg-white text-[#1E5EFF] rounded-[2px] text-[13px]">1</button>
                  <button className="min-w-[28px] h-[28px] flex items-center justify-center border border-transparent hover:bg-gray-100 text-gray-600 rounded-[2px] text-[13px] transition-colors">2</button>
                  <span className="text-gray-400 px-1">•••</span>
                  <button className="p-1 min-w-[28px] h-[28px] flex items-center justify-center border border-gray-200 rounded-[2px] text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white">
                    <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 列表页 Footer（仅在域名或证书面板下显示）
      {!isOverview && (
        <div className="text-center text-gray-400 text-[13px] mt-8 mb-2">
          Copyright © 2018–2026 PCS All Rights Reserved.
        </div>
      )} */}
    </div>
  );
}