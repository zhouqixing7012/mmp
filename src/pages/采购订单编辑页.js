import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

export default function App() {
  const [isExpanded, setIsExpanded] = useState(true);

  // 完整表头数据
  const headers = [
    "物料名称", "物料类别", "配置", "申请单号", "单位", 
    "数量", "拆分比例", "含税单价", "不含税单价", "税率", "税额", 
    "不含税金额", "含税金额", "收货公司", "备注", "机房名称", 
    "机房缩写", "收货地址", "联系人", "联系方式", "操作"
  ];

  // 子节点数据
  const subItems = [
    {
      id: 1,
      name: "Inspur.SA5212 M5",
      category: "服务器-硬盘",
      config: "S4520_SSD_SATA_2.5寸_480GB",
      unit: "块",
      qty: 60,
      price: "6,000.00",
      total: "360,000.00",
    },
    {
      id: 2,
      name: "Inspur.SA5212 M5",
      category: "服务器-内存",
      config: "Inspur.16G DDR4 2666 RDIMM",
      unit: "块",
      qty: 40,
      price: "900.00",
      total: "36,000.00",
    },
    {
      id: 3,
      name: "Inspur.SA5212 M5",
      category: "服务器-其他",
      config: "750W 白金电源*1,2.5寸8盘位机箱*1",
      unit: "套",
      qty: 1,
      price: "0.00",
      total: "0.00",
    }
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans text-sm">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 标题部分 */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center bg-white">
          <div className="w-1 h-4 bg-green-500 mr-2 rounded-sm"></div>
          <h2 className="text-base font-bold text-gray-800">订单明细</h2>
        </div>

        {/* 表格容器 - 允许横向滚动 */}
        <div className="overflow-x-auto">
          <table className="min-w-max w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" />
                </th>
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 bg-white">
              
              {/* ====== 父节点：主机行 ====== */}
              <tr className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-4 py-3 text-center">
                  <input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" />
                </td>
                <td className="px-4 py-3 flex items-center gap-1.5 font-medium text-gray-800">
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-gray-400 hover:text-gray-700 focus:outline-none p-0.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  Inspur.SA5212 M5
                </td>
                <td className="px-4 py-3 text-gray-600">服务器-主机</td>
                <td className="px-4 py-3 text-gray-600">Intel Gold5318Y*2, DDR4_2933MH</td>
                <td className="px-4 py-3 text-gray-600">SA1812140004</td>
                <td className="px-4 py-3 text-gray-600">台</td>
                <td className="px-4 py-3">
                  <input type="number" defaultValue={20} className="w-20 border border-gray-300 px-2 py-1.5 rounded text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </td>
                <td className="px-4 py-3 text-gray-400 text-center">100%</td>
                <td className="px-4 py-3">
                  <input type="text" defaultValue="40,000.00" className="w-24 border border-gray-300 px-2 py-1.5 rounded text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                </td>
                <td className="px-4 py-3 text-gray-400"></td>
                <td className="px-4 py-3 text-gray-400"></td>
                <td className="px-4 py-3 text-gray-400"></td>
                <td className="px-4 py-3 text-gray-400"></td>
                <td className="px-4 py-3 font-medium text-gray-800">800,000.00</td>
                <td className="px-4 py-3 text-gray-600">飞狐信息技术（天津）有限公司</td>
                <td className="px-4 py-3">
                  <input type="text" className="w-24 border border-gray-300 px-2 py-1.5 rounded outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-4 py-3">
                  <input type="text" defaultValue="搜狐媒体大厦" className="w-28 border border-gray-300 px-2 py-1.5 rounded outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-4 py-3">
                  <input type="text" defaultValue="MTDS" className="w-16 border border-gray-300 px-2 py-1.5 rounded outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-4 py-3">
                  <input type="text" defaultValue="北京市海淀区..." className="w-32 border border-gray-300 px-2 py-1.5 rounded outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-4 py-3">
                  <input type="text" defaultValue="邓崇伟" className="w-20 border border-gray-300 px-2 py-1.5 rounded outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-4 py-3">
                  <input type="text" defaultValue="18911208028" className="w-28 border border-gray-300 px-2 py-1.5 rounded outline-none focus:border-blue-500 transition-all" />
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                    <X size={18} />
                  </button>
                </td>
              </tr>

              {/* ====== 子节点：备件行 ====== */}
              {isExpanded && subItems.map((item, index) => {
                const isLast = index === subItems.length - 1;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors text-gray-500">
                    <td className="px-4 py-3 text-center">
                      {/* 去除复选框，留空 */}
                    </td>
                    <td className="px-4 py-3 relative pl-10 text-gray-400 flex items-center h-full min-h-[52px]">
                      {/* 树形结构连接线 */}
                      <div className={`absolute left-[28px] top-0 border-l border-dashed border-gray-300 ${isLast ? 'bottom-1/2' : 'bottom-0'}`}></div>
                      <div className="absolute left-[28px] top-1/2 w-4 border-t border-dashed border-gray-300"></div>
                      <span className="ml-1">{item.name}</span>
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{item.config}</td>
                    <td className="px-4 py-3">SA1812140004</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3 text-center">{item.qty}</td>
                    <td className="px-4 py-3">
                      <input type="text" className="w-16 border border-gray-300 px-2 py-1.5 rounded text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.price}
                      <span className="text-gray-400 text-xs ml-1">（预估）</span>
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-gray-800">{item.total}</td>
                    <td className="px-4 py-3">飞狐信息技术（天津）有限公司</td>
                    <td className="px-4 py-3 text-center">-</td>
                    <td className="px-4 py-3">搜狐媒体大厦</td>
                    <td className="px-4 py-3">MTDS</td>
                    <td className="px-4 py-3">北京市海淀区...</td>
                    <td className="px-4 py-3">邓崇伟</td>
                    <td className="px-4 py-3">18911208028</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}