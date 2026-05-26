import React, { useState } from 'react';

// --- 图标组件 ---
const InfoIcon = ({ className = "text-gray-300" }) => (
  <svg 
    className={`inline-block ml-1 w-3.5 h-3.5 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ArrowLeftIcon = ({ className = "text-gray-800" }) => (
  <svg 
    className={`w-5 h-5 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
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

// --- 移动端环形图组件 ---
const DonutChart = ({ data, totalText, subText }) => {
  const radius = 64; // 增大半径使圈更大
  const strokeWidth = 16; // 稍微调细一点给内部文字留出充足空间
  const circumference = 2 * Math.PI * radius;
  
  const total = data.reduce((sum, item) => {
    const val = typeof item.value === 'number' ? item.value : parseFloat(item.value.replace(/,/g, ''));
    return sum + val;
  }, 0);

  let currentOffset = 0;

  return (
    // 增大了容器宽高，使图表整体变大
    <div className="relative flex items-center justify-center w-[140px] h-[140px] shrink-0">
      <svg width="100%" height="100%" viewBox="0 0 160 160">
        <circle 
          cx="80" 
          cy="80" 
          r={radius} 
          fill="transparent" 
          stroke="#f3f4f6" 
          strokeWidth={strokeWidth} 
        />
        {data.map((item, i) => {
          const val = typeof item.value === 'number' ? item.value : parseFloat(item.value.replace(/,/g, ''));
          const percent = total > 0 ? val / total : 0;
          const strokeLength = percent * circumference;
          const offset = -currentOffset;
          currentOffset += strokeLength;

          return (
            <circle
              key={i + item.name}
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
      {/* 居中文字移除了 truncate，确保完整漏出文字不被截断 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none w-full px-1 text-center">
        <span className="text-[11px] text-gray-500 leading-tight mb-1">{subText}</span>
        <span className="text-[13px] font-bold text-[#3b82f6]">{totalText}</span>
      </div>
    </div>
  );
};

// --- 单个图表模块 (图 + 右侧图例) ---
const ChartSection = ({ subTitle, data, totalText, centerLabel }) => {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-[12px] text-gray-500 mb-3">{subTitle}</h3>
      <div className="flex items-center px-1">
        <DonutChart data={data} totalText={totalText} subText={centerLabel} />
        
        {/* 缩小 max-w 限制，让两端对齐的文字和数字靠近一点 */}
        <div className="ml-5 flex flex-col space-y-2.5 max-h-[130px] overflow-y-auto no-scrollbar flex-1 max-w-[130px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-[11px]">
              <div className="flex items-center space-x-1.5 truncate pr-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>
              <span className="text-gray-400 font-medium shrink-0 ml-2">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 图表分组卡片 ---
const ChartGroupCard = ({ title, dataValue, dataCount, totalValue, totalCount, isToggleable = false }) => {
  const [showSecondary, setShowSecondary] = useState(false);
  
  const currentDataValue = isToggleable ? (showSecondary ? dataValue.secondary : dataValue.primary) : dataValue;
  const currentDataCount = isToggleable ? (showSecondary ? dataCount.secondary : dataCount.primary) : dataCount;

  return (
    <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-bold text-[15px] text-gray-800">{title}</h2>
        {isToggleable && (
          <button 
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-50 text-gray-500 active:bg-gray-100 transition-colors"
          >
            <LoopIcon className="w-3.5 h-3.5" />
            <span className="text-[11px]">{showSecondary ? '一级分类' : '二级分类'}</span>
          </button>
        )}
      </div>
      
      {/* 金额分布图表 */}
      <ChartSection 
        subTitle="金额分布(万元)" 
        data={currentDataValue} 
        totalText={totalValue} 
        centerLabel="资产总额(万元)" 
      />

      {/* 分割线 */}
      <div className="h-px bg-gray-50 w-full my-4"></div>

      {/* 数量分布图表 */}
      <ChartSection 
        subTitle="数量分布" 
        data={currentDataCount} 
        totalText={totalCount} 
        centerLabel="资产总数" 
      />
    </div>
  );
};

// --- 主页面组件 ---
export default function AssetDashboardMobile() {
  const C = {
    blue: '#3b82f6',
    orange: '#fbbf24',
    green: '#34d399',
    cyan: '#2dd4bf',
    purple: '#a78bfa',
    pink: '#f472b6',
    indigo: '#818cf8',
  };

  const chartData = {
    categoryValue: {
      primary: [
        { name: '服务器', value: '18,000.00', color: C.blue },
        { name: '网络设备', value: '7,600.50', color: C.orange },
      ],
      secondary: [
        { name: '服务器主机', value: '12,000.00', color: C.blue },
        { name: '交换机', value: '3,000.00', color: '#f59e0b' },
        { name: '盘柜', value: '3,000.00', color: C.indigo },
        { name: '路由器', value: '2,000.00', color: '#ef4444' },
        { name: '防火墙', value: '1,000.00', color: '#8b5cf6' },
        { name: '硬盘', value: '1,000.00', color: C.cyan },
        { name: '其他', value: '3,600.50', color: '#cbd5e1' },
      ]
    },
    categoryCount: {
      primary: [
        { name: '服务器', value: '3,200', color: C.blue },
        { name: '网络设备', value: '2,000', color: C.orange },
      ],
      secondary: [
        { name: '服务器主机', value: '1,500', color: C.blue },
        { name: '无线AP', value: '600', color: '#10b981' },
        { name: '硬盘', value: '600', color: C.cyan },
        { name: '内存', value: '500', color: C.purple },
        { name: '交换机', value: '400', color: '#f59e0b' },
        { name: '其他', value: '1,600', color: '#cbd5e1' },
      ]
    },
    deptValue: [
      { name: '研发部', value: '12,000.00', color: C.blue },
      { name: '运维部', value: '8,600.50', color: C.purple },
      { name: '信息技术', value: '3,000.00', color: C.green },
      { name: '业务架构', value: '2,000.00', color: C.orange },
    ],
    deptCount: [
      { name: '研发部', value: '2,500', color: C.blue },
      { name: '运维部', value: '1,500', color: C.purple },
      { name: '信息技术', value: '800', color: C.green },
      { name: '业务架构', value: '400', color: C.orange },
    ]
  };

  return (
    // 模拟手机视口宽度并居中
    <div className="min-h-screen bg-gray-800 flex justify-center font-sans">
      <div className="w-full max-w-[400px] bg-[#f5f6f8] min-h-screen shadow-2xl relative overflow-hidden">
        
        {/* 顶部导航区 (固定在顶部) */}
        <div className="bg-white px-4 pt-10 pb-0 sticky top-0 z-10 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-center relative mb-4">
            <button className="absolute left-0 p-1">
              <ArrowLeftIcon />
            </button>
            <h1 className="text-[17px] font-medium text-gray-800">机房资产</h1>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto no-scrollbar text-[14px]">
            <div className="pb-2.5 border-b-[3px] border-[#3b82f6] text-[#3b82f6] font-semibold whitespace-nowrap">
              总览
            </div>
            {/* <div className="pb-2.5 text-gray-500 whitespace-nowrap">服务器</div>
            <div className="pb-2.5 text-gray-500 whitespace-nowrap">网络设备</div>
            <div className="pb-2.5 text-gray-500 whitespace-nowrap">存储设备</div> */}
          </div>
        </div>

        {/* 内容滚动区 */}
        <div className="p-4 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pb-10">
          
          {/* 数据概况卡片 */}
          <div className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">数据概况</h2>
            
            {/* 顶层核心指标 */}
            <div className="flex justify-between mb-5">
              <div className="flex-1">
                <div className="text-[12px] text-gray-500 mb-1 flex items-center">
                  资产总数 <InfoIcon />
                </div>
                <div className="text-[20px] font-semibold text-[#3b82f6] leading-none">
                  5,200
                </div>
              </div>
              <div className="flex-1 pl-4">
                <div className="text-[12px] text-gray-500 mb-1 flex items-center">
                  资产净值 (万元) <InfoIcon />
                </div>
                <div className="text-[20px] font-semibold text-[#3b82f6] leading-none">
                  25,600.50
                </div>
              </div>
            </div>

            {/* 宫格分类指标 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 服务器块 */}
              <div className="bg-[#f8faff] rounded-[10px] p-4 border border-[#eff4ff]">
                <div className="text-[13px] font-bold text-gray-800 mb-3.5">
                  服务器
                </div>
                <div className="mb-3.5">
                  <div className="text-[11px] text-gray-500 mb-1.5 flex items-center">
                    资产总数 <InfoIcon />
                  </div>
                  <div className="text-[16px] font-bold text-[#3b82f6] leading-none">
                    3,200
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 mb-1.5 flex items-center">
                    资产净值(万元) <InfoIcon />
                  </div>
                  <div className="text-[16px] font-bold text-[#3b82f6] leading-none">
                    18,000.00
                  </div>
                </div>
              </div>
              
              {/* 网络设备块 */}
              <div className="bg-[#fffdf8] rounded-[10px] p-4 border border-[#fff7ea]">
                <div className="text-[13px] font-bold text-gray-800 mb-3.5">
                  网络设备
                </div>
                <div className="mb-3.5">
                  <div className="text-[11px] text-gray-500 mb-1.5 flex items-center">
                    资产总数 <InfoIcon />
                  </div>
                  <div className="text-[16px] font-bold text-[#3b82f6] leading-none">
                    2,000
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 mb-1.5 flex items-center">
                    资产净值(万元) <InfoIcon />
                  </div>
                  <div className="text-[16px] font-bold text-[#3b82f6] leading-none">
                    7,600.50
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 图表组 1：资产类别 */}
          <ChartGroupCard 
            title="资产类别"
            dataValue={chartData.categoryValue}
            dataCount={chartData.categoryCount}
            totalValue="25,600.50"
            totalCount="5,200"
            isToggleable={true}
          />

          {/* 图表组 2：使用部门 */}
          <ChartGroupCard 
            title="使用部门"
            dataValue={chartData.deptValue}
            dataCount={chartData.deptCount}
            totalValue="25,600.50"
            totalCount="5,200"
            isToggleable={false}
          />

        </div>
      </div>

      {/* 隐藏系统自带滚动条的 CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}