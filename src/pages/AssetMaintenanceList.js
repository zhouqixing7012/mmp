import React, { useState } from 'react';
import { 
  User, Calendar, CheckSquare, XSquare, 
  ChevronDown, ChevronRight, BarChart2, Search, 
  Edit, Download, AlignLeft, Save, X, Settings,
  UserCog, Archive, ClipboardList, Box, PieChart, Link, FileText,
  MapPin, Server, Hash
} from 'lucide-react';

export default function AssetMaintenanceList() {
  // 修改当前选中标签页为“资产维护”
  const [selectedTab, setSelectedTab] = useState('资产维护');

  // 水印背景样式
  const watermarkStyle = {
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='150'><text x='50' y='100' transform='rotate(-25 50 100)' fill='%23000000' fill-opacity='0.04' font-family='sans-serif' font-size='16'>梁声 111160</text></svg>")`,
    backgroundRepeat: 'repeat',
  };

  // 模拟表格数据 (完全恢复您的19个字段数据)
  const tableData = Array.from({ length: 22 }).map((_, i) => ({
    id: i + 1,
    tag: `ME-00${190 + i * 16}`,
    mainTag: i % 4 === 0 ? `ME-00${180 + i * 16}` : '', // 模拟有时为空，有时有值
    serialNumber: i % 3 === 0 ? `SN${80000 + i * 123}` : '', // 模拟有时为空，有时有值
    company: '新媒体',
    sector: '11.搜狐网-web',
    majorClass: 'SERVER',
    minorClass: '服务器-服务器内存',
    desc: 'Inspur.16G DDR4 2666 RDIMM',
    brand: 'Inspur',
    quantity: 1,
    originalValue: '1,250.00',
    netValue: '0.00',
    ownerId: '111160',
    ownerName: '梁声',
    status: '在用-使用中',
    costCenter: '101001-技术中心',
    warehouse: '亦庄库房',
    enableDate: '2019-12-25'
  }));

  return (
    <div className="flex h-screen w-full bg-white font-['Microsoft_YaHei',_sans-serif] text-[12px] text-gray-800 overflow-hidden">
      
      {}
      {/* 侧边栏 */}
      <div className="w-[180px] bg-[#f5f5f5] flex flex-col flex-shrink-0 border-r border-gray-300">
        {/* 用户信息区 */}
        <div className="p-2 border-b border-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <User size={14} className="text-blue-500" />
            <span className="font-bold">梁声 (111160)</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-red-500" />
            <span>2026年05月11日 Mon</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={14} className="text-gray-400" />
            <span>您有 <span className="text-green-600 font-bold">0</span> 条待办任务</span>
          </div>
          <div className="flex items-center gap-2">
            <XSquare size={14} className="text-red-500" />
            <span>您有 <span className="text-red-600 font-bold">4</span> 条已办任务</span>
          </div>
        </div>

        {}
        {/* 菜单区 */}
        <div className="flex-1 overflow-y-auto pb-4">
          {/* 个人工作台 */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-orange-500" />
              <span className="font-bold">个人工作台</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>

          {/* 资产管理 */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <Archive size={14} className="text-indigo-500" />
              <span className="font-bold">资产管理</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>
          
          {/* 机房资产 (展开) */}
          <div>
            <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer bg-[#e8e8e8]">
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-blue-500" />
                <span className="font-bold text-blue-800">机房资产</span>
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </div>
            {/* 子菜单 */}
            <div className="flex flex-col bg-white">
              <div className="py-1.5 px-6 bg-[#337ab7] text-white cursor-pointer font-bold pl-9">
                资产维护
              </div>
              <div className="py-1.5 px-6 hover:bg-gray-100 cursor-pointer text-gray-700 pl-9">资产报废</div>
              <div className="py-1.5 px-6 hover:bg-gray-100 cursor-pointer text-gray-700 pl-9">资产接收</div>
              <div className="py-1.5 px-6 hover:bg-gray-100 cursor-pointer text-gray-700 pl-9">入库</div>
              <div className="py-1.5 px-6 hover:bg-gray-100 cursor-pointer text-gray-700 pl-9">出库</div>
              <div className="py-1.5 px-6 hover:bg-gray-100 cursor-pointer text-gray-700 pl-9">机房资产大盘</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-green-600" />
              <span className="font-bold">资产盘点</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>

          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <Box size={14} className="text-purple-500" />
              <span className="font-bold">库存管理</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>

          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <PieChart size={14} className="text-red-500" />
              <span className="font-bold">资产报表</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>

          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <Link size={14} className="text-teal-500" />
              <span className="font-bold">接口管理</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>

          <div className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-[#e8e8e8]">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-indigo-500" />
              <span className="font-bold">申请</span>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </div>
        </div>
      </div>

      {}
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f9f9f9]">
        
        {/* 顶部标签页栏 */}
        <div className="h-8 bg-gradient-to-b from-[#fdfdfd] to-[#e6e6e6] border-b border-gray-300 flex items-end px-2 gap-1 flex-shrink-0">
          <div 
            className={`flex items-center gap-2 px-3 py-1 rounded-t-md border border-gray-300 border-b-0 cursor-pointer relative top-[1px]
              ${selectedTab === '我的资产' ? 'bg-white font-bold z-10' : 'bg-[#f0f0f0] text-gray-600 hover:bg-[#e8e8e8]'}`}
            onClick={() => setSelectedTab('我的资产')}
          >
            <span>我的资产</span>
            <X size={12} className="text-red-500 hover:text-red-700" />
          </div>
          <div 
            className={`flex items-center gap-2 px-3 py-1 rounded-t-md border border-gray-300 border-b-0 cursor-pointer relative top-[1px]
              ${selectedTab === '资产维护' ? 'bg-white font-bold z-10' : 'bg-[#f0f0f0] text-gray-600 hover:bg-[#e8e8e8]'}`}
            onClick={() => setSelectedTab('资产维护')}
          >
            <span>资产维护</span>
            <X size={12} className="text-red-500 hover:text-red-700" />
          </div>
        </div>

        {/* 带有水印的工作区 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white relative p-2" style={watermarkStyle}>
          
          {/* 标题栏 */}
          <div className="bg-[#2CA6E0] text-white font-bold p-1.5 pl-3 mb-2 shadow-sm rounded-sm text-sm shrink-0">
            资产查询列表
          </div>

          {}
          {/* 查询条件面板 (完全恢复为无损的四行布局) */}
          <div className="border border-gray-200 mb-2 bg-white/90 shrink-0">
            <div className="flex items-center gap-1 border-b border-gray-200 p-1 bg-[#fcfcfc]">
              <ChevronDown size={12} className="text-blue-500" />
              <span className="text-blue-700 font-bold">查询</span>
            </div>
            
            <div className="p-3 flex items-start gap-4">
              <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-3 items-center">
                {/* 第一行：标签号、主资产标签号、序列号 */}
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">标签号</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">主资产标签号</label>
                  <input type="text" className="w-full min-w-0 flex-1 border border-gray-300 h-6 px-1 outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">序列号</label>
                  <input type="text" className="w-full min-w-0 flex-1 border border-gray-300 h-6 px-1 outline-none focus:border-blue-500" />
                </div>

                {/* 第二行：公司、部门、资产责任人 */}
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">公司</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">部门</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">资产责任人</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>

                {/* 第三行：资产说明、资产类别、资产状态 */}
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">资产说明</label>
                  <input type="text" className="w-full min-w-0 flex-1 border border-gray-300 h-6 px-1 outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">资产类别</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">资产状态</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>

                {/* 第四行：板块、成本中心、仓库 */}
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">板块</label>
                  <select className="w-full min-w-0 flex-1 border border-gray-300 h-6 px-1 outline-none focus:border-blue-500">
                    <option>请选择</option>
                    <option>17.Corporate</option>
                    <option>16.视频</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">成本中心</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="w-24 text-right pr-2 font-bold text-gray-700 whitespace-nowrap">仓库</label>
                  <div className="w-full min-w-0 flex-1 flex items-center relative">
                    <input type="text" className="w-full border border-gray-300 h-6 px-1 pr-6 outline-none focus:border-blue-500" />
                    <Search size={14} className="absolute right-1 text-blue-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 pl-4 border-l border-gray-200 shrink-0 w-24">
                <button className="w-full bg-[#2CA6E0] text-white border border-[#238ec4] px-0 py-1.5 rounded shadow-sm hover:bg-[#2088b9] active:bg-[#1a76a2]">
                  查询
                </button>
                <button className="w-full bg-gradient-to-b from-[#fdfdfd] to-[#e6e6e6] border border-gray-300 px-0 py-1.5 rounded shadow-sm hover:bg-gray-100 active:bg-gray-200 text-gray-700">
                  重置
                </button>
              </div>
            </div>
          </div>

          {}
          {/* 操作按钮栏 - 已把“主备维护”和“序列号变更”放置在“位置变更”前面 */}
          <div className="flex justify-end items-center p-2 bg-white/80 shrink-0">
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium">
                <Server size={14} className="text-teal-500" /> 主备维护
              </button>
              <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium">
                <Hash size={14} className="text-orange-500" /> 序列号变更
              </button>
              <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium">
                <MapPin size={14} className="text-yellow-500" /> 位置变更
              </button>
              <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium">
                <UserCog size={14} className="text-indigo-500" /> 责任人变更
              </button>
              <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium">
                <Save size={14} className="text-blue-600" /> 导出数据
              </button>
            </div>
          </div>

          {}
          {/* 数据表格区 - 已完整保留所有19个字段列，并完全删除原本末尾的“操作”列 */}
          <div className="flex-1 overflow-auto border border-gray-300 bg-white shadow-sm min-h-0 relative">
            <table className="w-full text-center border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                <tr className="bg-[#f2f2f2] text-gray-800">
                  <th className="border border-gray-300 p-1.5 font-bold w-10 bg-[#f2f2f2]">选择</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">标签号</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">主资产标签号</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">序列号</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">公司</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">板块</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">资产大类</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">资产小类</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">资产说明</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">品牌</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">数量</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">原值</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">净值</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">资产责任人编号</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">资产责任人</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">资产状态</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">成本中心</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">仓库</th>
                  <th className="border border-gray-300 p-1.5 font-bold bg-[#f2f2f2]">启用日期</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50 group">
                    <td className="border border-gray-300 p-1"><input type="checkbox" className="cursor-pointer" /></td>
                    <td className="border border-gray-300 p-1 text-blue-600 hover:underline cursor-pointer">{row.tag}</td>
                    <td className="border border-gray-300 p-1">{row.mainTag}</td>
                    <td className="border border-gray-300 p-1">{row.serialNumber}</td>
                    <td className="border border-gray-300 p-1">{row.company}</td>
                    <td className="border border-gray-300 p-1">{row.sector}</td>
                    <td className="border border-gray-300 p-1">{row.majorClass}</td>
                    <td className="border border-gray-300 p-1">{row.minorClass}</td>
                    <td className="border border-gray-300 p-1">{row.desc}</td>
                    <td className="border border-gray-300 p-1">{row.brand}</td>
                    <td className="border border-gray-300 p-1">{row.quantity}</td>
                    <td className="border border-gray-300 p-1 text-right">{row.originalValue}</td>
                    <td className="border border-gray-300 p-1 text-right">{row.netValue}</td>
                    <td className="border border-gray-300 p-1">{row.ownerId}</td>
                    <td className="border border-gray-300 p-1">{row.ownerName}</td>
                    <td className="border border-gray-300 p-1">{row.status}</td>
                    <td className="border border-gray-300 p-1">{row.costCenter}</td>
                    <td className="border border-gray-300 p-1">{row.warehouse}</td>
                    <td className="border border-gray-300 p-1">{row.enableDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {}
          {/* 分页区 */}
          <div className="flex justify-end items-center gap-3 mt-3 pb-2 text-gray-600 pr-2 bg-white/80 shrink-0">
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-gray-300 bg-[#f9f9f9] text-gray-400 cursor-not-allowed">上一页</button>
              <button className="px-2 py-1 border border-gray-300 bg-white text-red-500 font-bold">1</button>
              <button className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-blue-600">2</button>
              <span className="px-1">...</span>
              <button className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-blue-600">909</button>
              <button className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-blue-600">下一页</button>
            </div>
            
            <div className="flex items-center gap-2">
              <span>共909页</span>
              <span>每页 10 条</span>
              <div className="flex items-center gap-1">
                到第 <input type="text" defaultValue="1" className="w-8 h-5 border border-gray-300 text-center outline-none focus:border-blue-500" /> 页
              </div>
              <button className="bg-gradient-to-b from-[#fdfdfd] to-[#e6e6e6] border border-gray-300 px-3 py-0.5 rounded shadow-sm hover:bg-gray-100 font-bold text-gray-700">
                Go
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}