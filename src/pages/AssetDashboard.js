import React, { useState } from 'react';

// --- 图标组件 ---
const InfoIcon = ({ className = "text-blue-200" }) => (
  <svg 
    className={`inline-block ml-1.5 w-3.5 h-3.5 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const LoopIcon = ({ className = "text-gray-400" }) => (
  <svg 
    className={`w-4 h-4 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
  </svg>
);

// --- 环形图组件 ---
const DonutChart = ({ data, totalText, subText }) => {
  const radius = 55;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  
  // 计算总和
  const total = data.reduce((sum, item) => {
    const val = typeof item.value === 'number' ? item.value : parseFloat(item.value.replace(/,/g, ''));
    return sum + val;
  }, 0);

  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center w-36 h-36 shrink-0">
      <svg width="100%" height="100%" viewBox="0 0 160 160">
        {/* 背景底圈 */}
        <circle 
          cx="80" 
          cy="80" 
          r={radius} 
          fill="transparent" 
          stroke="#f3f4f6" 
          strokeWidth={strokeWidth} 
        />
        {/* 数据圆弧 */}
        {data.map((item, i) => {
          const val = typeof item.value === 'number' ? item.value : parseFloat(item.value.replace(/,/g, ''));
          const percent = total > 0 ? val / total : 0;
          const strokeLength = percent * circumference;
          const offset = -currentOffset;
          currentOffset += strokeLength;

          return (
            <circle
              key={i + item.name} // 加入 name 保证切换时动画顺畅
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
              className="transition-all duration-500 ease-in-out"
            />
          );
        })}
      </svg>
      {/* 中心文本 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-gray-500 mb-0.5">{subText}</span>
        <span className="text-sm font-semibold text-[#3b82f6]">{totalText}</span>
      </div>
    </div>
  );
};

// --- 支持切换的图表卡片组件 ---
const ChartCard = ({ title, data, totalText, subText, isToggleable = false }) => {
  const [showSecondary, setShowSecondary] = useState(false);
  
  // 决定渲染的数据集
  const currentData = isToggleable 
    ? (showSecondary ? data.secondary : data.primary) 
    : data;

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-[13px] text-gray-800">
          {title}
        </h3>
        {isToggleable && (
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setShowSecondary(!showSecondary)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors tooltip"
              title="循环切换分类"
            >
              <LoopIcon />
            </button>
            <span className="text-[12px] text-gray-400 font-normal select-none">
              {showSecondary ? '二级分类' : '一级分类'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center flex-1">
        <DonutChart data={currentData} totalText={totalText} subText={subText} />
        
        {/* 图例列表 */}
        <div className="flex-1 ml-8 flex flex-col space-y-2.5 max-h-[140px] overflow-y-auto pr-2">
          {currentData.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="text-gray-400 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 主页面组件 ---
export default function AssetDashboard() {
  // 定义一致的颜色映射
  const C = {
    blue: '#3b82f6',
    orange: '#fbbf24',
    green: '#34d399',
    cyan: '#2dd4bf',
    purple: '#a78bfa',
    pink: '#f472b6',
    indigo: '#818cf8',
  };

  // 图表数据 (机房资产)
  const chartData = {
    // 资产类别 (可切换)
    categoryValue: {
      primary: [
        { name: '服务器', value: '18,000.00', color: C.blue },
        { name: '网络设备', value: '7,600.50', color: C.orange },
      ],
      secondary: [
        // 服务器相关分类
        { name: '服务器主机', value: '12,000.00', color: C.blue },
        { name: '服务器盘柜', value: '3,000.00', color: C.indigo },
        { name: '服务器硬盘', value: '1,000.00', color: C.cyan },
        { name: '服务器内存', value: '800.00', color: C.purple },
        { name: '服务器板卡', value: '500.00', color: C.pink },
        { name: '服务器电源', value: '300.00', color: C.orange },
        { name: '服务器模块', value: '200.00', color: C.green },
        { name: '服务器其他', value: '200.00', color: '#94a3b8' },
        // 网络设备相关分类
        { name: '交换机主机', value: '3,000.00', color: '#f59e0b' },
        { name: '路由器', value: '2,000.00', color: '#ef4444' },
        { name: '防火墙', value: '1,000.00', color: '#8b5cf6' },
        { name: '无线AP', value: '500.00', color: '#10b981' },
        { name: '光猫', value: '300.00', color: '#06b6d4' },
        { name: '网关', value: '200.00', color: '#6366f1' },
        { name: 'KVM', value: '200.00', color: '#3b82f6' },
        { name: '交换机板卡', value: '150.00', color: '#fca5a5' },
        { name: '交换机模块', value: '100.00', color: '#fcd34d' },
        { name: '协议转换器', value: '80.00', color: '#6ee7b7' },
        { name: '电源模块', value: '50.00', color: '#93c5fd' },
        { name: '其他', value: '20.50', color: '#cbd5e1' },
      ]
    },
    categoryCount: {
      primary: [
        { name: '服务器', value: '3,200', color: C.blue },
        { name: '网络设备', value: '2,000', color: C.orange },
      ],
      secondary: [
        // 服务器相关分类
        { name: '服务器主机', value: '1,500', color: C.blue },
        { name: '服务器盘柜', value: '200', color: C.indigo },
        { name: '服务器硬盘', value: '600', color: C.cyan },
        { name: '服务器内存', value: '500', color: C.purple },
        { name: '服务器板卡', value: '100', color: C.pink },
        { name: '服务器电源', value: '100', color: C.orange },
        { name: '服务器模块', value: '100', color: C.green },
        { name: '服务器其他', value: '100', color: '#94a3b8' },
        // 网络设备相关分类
        { name: '交换机主机', value: '400', color: '#f59e0b' },
        { name: '路由器', value: '300', color: '#ef4444' },
        { name: '防火墙', value: '150', color: '#8b5cf6' },
        { name: '无线AP', value: '600', color: '#10b981' },
        { name: '光猫', value: '300', color: '#06b6d4' },
        { name: '网关', value: '50', color: '#6366f1' },
        { name: 'KVM', value: '50', color: '#3b82f6' },
        { name: '交换机板卡', value: '40', color: '#fca5a5' },
        { name: '交换机模块', value: '50', color: '#fcd34d' },
        { name: '协议转换器', value: '30', color: '#6ee7b7' },
        { name: '电源模块', value: '20', color: '#93c5fd' },
        { name: '其他', value: '10', color: '#cbd5e1' },
      ]
    },
    // 使用部门 (不切换)
    deptValue: [
      { name: '研发部', value: '12,000.00', color: C.blue },
      { name: '运维部', value: '8,600.50', color: C.purple },
      { name: '信息技术部', value: '3,000.00', color: C.green },
      { name: '业务架构部', value: '2,000.00', color: C.orange },
    ],
    deptCount: [
      { name: '研发部', value: '2,500', color: C.blue },
      { name: '运维部', value: '1,500', color: C.purple },
      { name: '信息技术部', value: '800', color: C.green },
      { name: '业务架构部', value: '400', color: C.orange },
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-[1000px]">
        
        {/* 顶部导航 */}
        <div className="flex space-x-10 border-b border-gray-200 mb-6 text-sm">
          <div className="pb-3 border-b-[3px] border-[#3b82f6] font-bold text-[#3b82f6]">总览</div>
          {/* <div className="pb-3 text-gray-400 hover:text-gray-800 cursor-pointer">服务器</div>
          <div className="pb-3 text-gray-400 hover:text-gray-800 cursor-pointer">网络设备</div> */}
        </div>

        {/* 顶部核心指标卡片 */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          
          {/* 左侧蓝色主卡片 */}
          <div className="w-full md:w-[260px] shrink-0 bg-gradient-to-br from-[#6a9eff] to-[#4580ff] rounded-[20px] text-white p-7 shadow-sm flex flex-col justify-between h-[200px]">
            <h2 className="text-xl font-semibold mb-6 tracking-wide">总览</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-blue-100 text-xs mb-1">
                  资产总数  <InfoIcon className="text-blue-200/80" />
                </div>
                <div className="text-[28px] font-bold leading-none">5,200</div>
              </div>
              <div>
                <div className="flex items-center text-blue-100 text-xs mb-1">
                  资产净值 (万元) <InfoIcon className="text-blue-200/80" />
                </div>
                <div className="text-[28px] font-bold leading-none">25,600.50</div>
              </div>
            </div>
          </div>

          {/* 右侧指标网格 (2大分类) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-[200px]">
            {/* 卡片 1 - 服务器 */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-6 bg-blue-500 rounded-sm"></div>
                <h3 className="font-bold text-[16px] text-gray-800">服务器</h3>
              </div>
              <div className="flex justify-between items-end pb-2">
                <div>
                  <div className="flex items-center text-gray-400 text-xs mb-1.5">资产总数 <InfoIcon className="text-gray-300" /></div>
                  <div className="text-[26px] font-semibold text-[#3b82f6] leading-none">3,200</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end text-gray-400 text-xs mb-1.5">资产净值 (万元) <InfoIcon className="text-gray-300" /></div>
                  <div className="text-[26px] font-semibold text-[#3b82f6] leading-none">18,000.00</div>
                </div>
              </div>
            </div>
            
            {/* 卡片 2 - 网络设备 */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-6 bg-orange-400 rounded-sm"></div>
                <h3 className="font-bold text-[16px] text-gray-800">网络设备</h3>
              </div>
              <div className="flex justify-between items-end pb-2">
                <div>
                  <div className="flex items-center text-gray-400 text-xs mb-1.5">资产总数 <InfoIcon className="text-gray-300" /></div>
                  <div className="text-[26px] font-semibold text-[#fbbf24] leading-none">2,000</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end text-gray-400 text-xs mb-1.5">资产净值 (万元) <InfoIcon className="text-gray-300" /></div>
                  <div className="text-[26px] font-semibold text-[#fbbf24] leading-none">7,600.50</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 图表区域 (仅留 4 个图表) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Row 1: 资产类别 (带二级切换) */}
          <ChartCard 
            title="资产类别金额分布(万元)" 
            data={chartData.categoryValue} 
            isToggleable={true}
            subText="资产总值(万元)" 
            totalText="25,600.50" 
          />
          <ChartCard 
            title="资产类别数量分布" 
            data={chartData.categoryCount} 
            isToggleable={true}
            subText="资产总数" 
            totalText="5,200" 
          />

          {/* Row 2: 使用部门 */}
          <ChartCard 
            title="使用部门金额分布(万元)" 
            data={chartData.deptValue} 
            subText="资产总值(万元)" 
            totalText="25,600.50" 
          />
          <ChartCard 
            title="使用部门数量分布" 
            data={chartData.deptCount} 
            subText="资产总数" 
            totalText="5,200" 
          />
        </div>

      </div>
    </div>
  );
}