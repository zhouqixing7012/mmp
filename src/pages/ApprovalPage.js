import React, { useState, useMemo } from 'react';
import { 
  Paperclip, Check, X as CloseIcon, Info, Edit3, Building, FileText, Server, Briefcase, Download
} from 'lucide-react';

// --- 模拟丰富的审批数据 ---
const approvalData = {
  docNo: 'BF-202310250088',
  company: '北京搜狐新媒体信息技术有限公司',
  status: '待审批',
  creator: '李四 (系统管理员)',
  createDate: '2023-10-25 10:30:00',
  remarks: '该批次设备已无法满足各频道及业务线的日常办公需求，部分设备已严重损坏或丢失，特申请报废处理。',
  attachments: [
    { name: '资产鉴定报告_2023Q4.pdf', size: '2.4 MB' },
    { name: '设备损坏照片汇总_搜狐网.zip', size: '15.1 MB' }
  ],
  items: [
    // === 已到报废期 ===
    // 服务器
    { 
      id: 1, group: '服务器', sector: '搜狐网', category: 'Server', tagNo: 'SOHU-SRV-001', assetNo: 'SN-100239', 
      description: 'DELL PowerEdge R740 数据库服务器', keyword: 'DELL, 服务器, 数据库', 
      qty: 2, originalValue: 85000.00, purchaseDate: '2018-05-10', lifeMonths: 60, accDepreciation: 85000.00, netValue: 0.00, 
      responsiblePerson: '王五', responsiblePersonId: 'SH00231', city: '北京', location: '搜狐媒体大厦', floor: 'B2机房', 
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '设备老化，性能已无法支撑核心业务'
    },
    { 
      id: 6, group: '服务器', sector: '搜狐网', category: 'Server', tagNo: 'SOHU-SRV-002', assetNo: 'SN-100240', 
      description: 'HP ProLiant DL380 Gen10', keyword: 'HP, 服务器, 计算', 
      qty: 3, originalValue: 75000.00, purchaseDate: '2017-08-11', lifeMonths: 60, accDepreciation: 75000.00, netValue: 0.00, 
      responsiblePerson: '张三', responsiblePersonId: 'SH00111', city: '北京', location: '搜狐媒体大厦', floor: 'B2机房', 
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '超出使用寿命，已淘汰退网'
    },
    // 服务器（配件）
    { 
      id: 2, group: '服务器（配件）', sector: '汽车', category: 'Server', tagNo: 'AUTO-ACC-102', assetNo: 'AC-300412', 
      description: '64GB DDR4 ECC 内存条', keyword: '三星, 内存, 配件', 
      qty: 8, originalValue: 12800.00, purchaseDate: '2018-05-10', lifeMonths: 60, accDepreciation: 12800.00, netValue: 0.00, 
      responsiblePerson: '赵六', responsiblePersonId: 'SH01542', city: '北京', location: '搜狐媒体大厦', floor: 'B2机房', 
      scrapMethod: '部分报废', scrapType: '已到报废期', reason: '随主服务器一同淘汰报废'
    },
    { 
      id: 7, group: '服务器（配件）', sector: '游戏', category: 'Server', tagNo: 'GAME-ACC-015', assetNo: 'GM-500120', 
      description: '1.2TB 10K RPM SAS 硬盘', keyword: '硬盘, SAS, 配件', 
      qty: 10, originalValue: 15000.00, purchaseDate: '2018-02-20', lifeMonths: 60, accDepreciation: 15000.00, netValue: 0.00, 
      responsiblePerson: '李梅', responsiblePersonId: 'SH04105', city: '北京', location: '搜狐畅游大厦', floor: '15层机房', 
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '坏道过多，SMART告警，无法继续使用'
    },
    // 网络设备
    { 
      id: 8, group: '网络设备', sector: '搜狐网', category: 'Net Equipment', tagNo: 'SOHU-NET-001', assetNo: 'SN-200101', 
      description: 'Cisco 2960 接入层交换机', keyword: 'Cisco, 交换机, 接入', 
      qty: 5, originalValue: 25000.00, purchaseDate: '2016-11-05', lifeMonths: 60, accDepreciation: 25000.00, netValue: 0.00, 
      responsiblePerson: '刘工', responsiblePersonId: 'SH00255', city: '北京', location: '搜狐媒体大厦', floor: '各楼层弱电间', 
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '端口老化，频繁导致局部断网'
    },
    { 
      id: 9, group: '网络设备', sector: '汽车', category: 'Net Equipment', tagNo: 'AUTO-NET-012', assetNo: 'AC-200112', 
      description: 'H3C 路由器', keyword: 'H3C, 路由器', 
      qty: 2, originalValue: 18000.00, purchaseDate: '2017-04-10', lifeMonths: 60, accDepreciation: 18000.00, netValue: 0.00, 
      responsiblePerson: '陈明', responsiblePersonId: 'SH01566', city: '北京', location: '搜狐媒体大厦', floor: '8层弱电间', 
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '性能不足，背板带宽无法满足需求，已替换'
    },
    // 网络设备（配件）
    { 
      id: 10, group: '网络设备（配件）', sector: '房产', category: 'Net Equipment', tagNo: 'PROP-NAC-001', assetNo: 'PM-200201', 
      description: '千兆多模光模块', keyword: '光模块, 配件', 
      qty: 12, originalValue: 4800.00, purchaseDate: '2016-11-05', lifeMonths: 60, accDepreciation: 4800.00, netValue: 0.00, 
      responsiblePerson: '王磊', responsiblePersonId: 'SH02899', city: '上海', location: '上海分公司办公区', floor: '12层机房', 
      scrapMethod: '部分报废', scrapType: '已到报废期', reason: '随老旧交换机一同报废处理'
    },
    { 
      id: 11, group: '网络设备（配件）', sector: '家居', category: 'Net Equipment', tagNo: 'HOME-NAC-002', assetNo: 'HN-800902', 
      description: 'CAT6 屏蔽跳线 3米', keyword: '网线, 跳线, 配件', 
      qty: 50, originalValue: 1500.00, purchaseDate: '2017-01-15', lifeMonths: 60, accDepreciation: 1500.00, netValue: 0.00, 
      responsiblePerson: '张强', responsiblePersonId: 'SH03422', city: '广州', location: '广州研发中心', floor: '5层机房', 
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '线缆老化严重，水晶头弹片大面积损坏'
    },

    // === 未到报废期 ===
    { 
      id: 3, group: '网络设备', sector: '房产', category: 'Net Equipment', tagNo: 'PROP-NET-045', assetNo: 'PM-202201', 
      description: 'Cisco Catalyst 9300 核心交换机', keyword: 'Cisco, 交换机, 网络', 
      qty: 1, originalValue: 45000.00, purchaseDate: '2022-03-15', lifeMonths: 60, accDepreciation: 20000.00, netValue: 25000.00, 
      responsiblePerson: '孙七', responsiblePersonId: 'SH02888', city: '上海', location: '上海分公司办公区', floor: '12层机房', 
      scrapMethod: '全部报废', scrapType: '未到报废期', reason: '机房漏水导致设备短路烧毁，无法维修'
    },
    { 
      id: 4, group: '网络设备（配件）', sector: '家居', category: 'Net Equipment', tagNo: 'HOME-NAC-008', assetNo: 'HN-889901', 
      description: '万兆单模光模块 SFP+', keyword: '华为, 光模块, 配件', 
      qty: 4, originalValue: 3200.00, purchaseDate: '2021-08-10', lifeMonths: 60, accDepreciation: 1600.00, netValue: 1600.00, 
      responsiblePerson: '周八', responsiblePersonId: 'SH03411', city: '广州', location: '广州研发中心', floor: '5层机房', 
      scrapMethod: '部分报废', scrapType: '未到报废期', reason: '接口老化导致频繁丢包，影响业务稳定性'
    },

    // === 丢失 ===
    { 
      id: 5, group: '服务器（配件）', sector: '游戏', category: 'Server', tagNo: 'GAME-ACC-012', assetNo: 'GM-500112', 
      description: 'PERC H740P 阵列卡', keyword: 'DELL, 阵列卡, 配件', 
      qty: 1, originalValue: 4500.00, purchaseDate: '2022-01-10', lifeMonths: 60, accDepreciation: 2000.00, netValue: 2500.00, 
      responsiblePerson: '吴九', responsiblePersonId: 'SH04102', city: '北京', location: '搜狐畅游大厦', floor: '15层机房', 
      scrapMethod: '全部报废', scrapType: '丢失', reason: '机房资产盘点时确认丢失，已按流程上报'
    },
  ]
};

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState('已到报废期');
  const [approvalComment, setApprovalComment] = useState('');

  // 1. 获取所有存在数据的“报废类型”作为标签页
  const availableTabs = useMemo(() => {
    return [...new Set(approvalData.items.map(item => item.scrapType))];
  }, []);

  // 2. 筛选当前标签页的数据
  const activeTabItems = useMemo(() => {
    return approvalData.items.filter(item => item.scrapType === activeTab);
  }, [activeTab]);

  // 3. 计算当前标签页的合计值 (Total)
  const tabTotals = useMemo(() => {
    return {
      qty: activeTabItems.reduce((sum, item) => sum + item.qty, 0),
      originalValue: activeTabItems.reduce((sum, item) => sum + item.originalValue, 0).toFixed(2),
      netValue: activeTabItems.reduce((sum, item) => sum + item.netValue, 0).toFixed(2)
    };
  }, [activeTabItems]);

  // 4. 对筛选后的数据按“分组标题(group)”进行分组
  const groupedData = useMemo(() => {
    return activeTabItems.reduce((acc, item) => {
      const groupKey = item.group || '其他';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});
  }, [activeTabItems]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans text-sm text-gray-800 pb-28">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[95%] xl:max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">资产报废审批单</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
              <Download className="w-4 h-4 mr-2" /> 导出
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 font-semibold border border-amber-200 rounded-full text-sm shadow-sm">
                状态：{approvalData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="flex-1 p-4 space-y-6 max-w-[95%] xl:max-w-[1800px] mx-auto w-full mt-4">
        
        {/* 基本信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden transition-all hover:shadow-md">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800 text-base">基本信息</h3>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-8">
              <div className="flex flex-col space-y-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">报废单号</label>
                <div className="text-gray-900 font-mono font-medium text-base">{approvalData.docNo}</div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">所属公司</label>
                <div className="text-gray-900 font-medium">{approvalData.company}</div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">制单人</label>
                <div className="text-gray-900">{approvalData.creator}</div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">制单时间</label>
                <div className="text-gray-900">{approvalData.createDate}</div>
              </div>
              
              <div className="col-span-1 lg:col-span-4 flex flex-col space-y-2 mt-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">申请备注</label>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-5 py-4 text-gray-700 leading-relaxed text-[15px]">
                  {approvalData.remarks || <span className="text-gray-400">无备注信息</span>}
                </div>
              </div>
              
              {/* 附件 */}
              <div className="col-span-1 lg:col-span-4 flex flex-col space-y-2 mt-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">附件资料</label>
                {approvalData.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {approvalData.attachments.map((file, idx) => (
                      <div key={idx} className="group flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all">
                        <div className="bg-gray-100 group-hover:bg-blue-50 p-1.5 rounded-md mr-3 transition-colors">
                          <Paperclip className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 group-hover:text-blue-600">{file.name}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{file.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 py-1">未上传附件</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 报废资产明细表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden flex flex-col transition-all hover:shadow-md">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-gray-800 text-base">报废资产明细</h3>
            </div>
          </div>

          {/* 现代化分段标签页 (Tabs) - iOS 风格 */}
          <div className="px-6 pt-5 pb-4">
            <div className="inline-flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
              {availableTabs.map(tab => {
                const count = approvalData.items.filter(i => i.scrapType === tab).reduce((sum, item) => sum + item.qty, 0);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center px-6 py-2.5 font-medium text-sm rounded-lg transition-all duration-200 ${
                      activeTab === tab 
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 border border-transparent'
                    }`}
                  >
                    {tab}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 当前标签页合计栏 */}
          {activeTabItems.length > 0 && (
            <div className="bg-blue-50/50 border-y border-blue-100/60 px-6 py-3 flex items-center justify-between">
              <span className="text-gray-600 font-medium flex items-center text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                当前【{activeTab}】合计统计
              </span>
              <div className="flex items-center space-x-8 text-[14px]">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">总数量:</span>
                  <span className="text-gray-900 font-bold text-base">{tabTotals.qty}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">原值合计:</span>
                  <span className="text-orange-600 font-bold text-base">{tabTotals.originalValue}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">净值合计:</span>
                  <span className="text-green-600 font-bold text-base">{tabTotals.netValue}</span>
                </div>
              </div>
            </div>
          )}

          {/* 表格容器 */}
          <div className="p-6 space-y-8">
            {Object.keys(groupedData).length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <Info className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">该类型下暂无资产数据</p>
              </div>
            ) : (
              Object.entries(groupedData).map(([groupName, items]) => {
                // 计算当前大类的统计数据
                const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
                const totalOrigVal = items.reduce((sum, item) => sum + item.originalValue, 0).toFixed(2);
                const totalNetVal = items.reduce((sum, item) => sum + item.netValue, 0).toFixed(2);

                return (
                  <div key={groupName} className="border border-gray-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
                    {/* 表格头部 & 统计 */}
                    <div className="bg-gray-50/80 border-b border-gray-200/80 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-indigo-100 rounded-md">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-base">
                          {groupName}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-5 text-[13px] font-medium bg-white px-4 py-1.5 rounded-lg border border-gray-200/60 shadow-sm">
                        <span className="text-gray-500">数量: <strong className="text-gray-900 ml-1">{totalQty}</strong></span>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <span className="text-gray-500">原值合计: <strong className="text-orange-600 ml-1">{totalOrigVal}</strong></span>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <span className="text-gray-500">净值合计: <strong className="text-green-600 ml-1">{totalNetVal}</strong></span>
                      </div>
                    </div>

                    {/* 超宽精美表格带自定义横向滚动条 */}
                    <div className="overflow-x-auto w-full custom-scrollbar">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-white border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="p-4 text-center border-r border-gray-100 w-16">行号</th>
                            <th className="p-4 border-r border-gray-100">板块</th>
                            <th className="p-4 border-r border-gray-100">资产类别</th>
                            <th className="p-4 border-r border-gray-100">资产标签号</th>
                            <th className="p-4 border-r border-gray-100">资产编号</th>
                            <th className="p-4 border-r border-gray-100 min-w-[180px]">资产说明</th>
                            <th className="p-4 border-r border-gray-100 min-w-[150px]">资产关键字</th>
                            <th className="p-4 border-r border-gray-100 text-right w-20">数量</th>
                            <th className="p-4 border-r border-gray-100 text-right">原值(元)</th>
                            <th className="p-4 border-r border-gray-100 text-center">购买日期</th>
                            <th className="p-4 border-r border-gray-100 text-right">资产寿命(月)</th>
                            <th className="p-4 border-r border-gray-100 text-right">累计折旧</th>
                            <th className="p-4 border-r border-gray-100 text-right bg-green-50/30">净值(元)</th>
                            <th className="p-4 border-r border-gray-100">责任人姓名</th>
                            <th className="p-4 border-r border-gray-100">责任人工号</th>
                            <th className="p-4 border-r border-gray-100">资产所在城市</th>
                            <th className="p-4 border-r border-gray-100">资产所在地点</th>
                            <th className="p-4 border-r border-gray-100">资产所在楼层</th>
                            <th className="p-4 border-r border-gray-100">报废方式</th>
                            <th className="p-4 min-w-[200px]">报废原因</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-[13px]">
                          {items.map((row, index) => (
                            <tr key={row.id} className="hover:bg-blue-50/40 transition-colors text-gray-700 group">
                              <td className="p-4 text-center text-gray-400 font-medium border-r border-gray-100 transition-colors">{index + 1}</td>
                              <td className="p-4 text-gray-900 border-r border-gray-100 transition-colors">{row.sector}</td>
                              <td className="p-4 border-r border-gray-100">
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">{row.category}</span>
                              </td>
                              <td className="p-4 border-r border-gray-100 font-mono text-gray-900 font-medium">{row.tagNo}</td>
                              <td className="p-4 border-r border-gray-100 font-mono text-gray-500">{row.assetNo}</td>
                              <td className="p-4 border-r border-gray-100 font-medium">{row.description}</td>
                              <td className="p-4 border-r border-gray-100 text-gray-500">{row.keyword}</td>
                              <td className="p-4 border-r border-gray-100 text-right font-bold text-gray-900">{row.qty}</td>
                              <td className="p-4 border-r border-gray-100 text-right font-medium">{row.originalValue.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
                              <td className="p-4 border-r border-gray-100 text-center text-gray-500">{row.purchaseDate}</td>
                              <td className="p-4 border-r border-gray-100 text-right">{row.lifeMonths}</td>
                              <td className="p-4 border-r border-gray-100 text-right text-gray-500">{row.accDepreciation.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
                              <td className="p-4 border-r border-gray-100 text-right font-bold text-green-600 bg-green-50/10">{row.netValue.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</td>
                              <td className="p-4 border-r border-gray-100">{row.responsiblePerson}</td>
                              <td className="p-4 border-r border-gray-100 font-mono text-xs">{row.responsiblePersonId}</td>
                              <td className="p-4 border-r border-gray-100 text-gray-600">{row.city}</td>
                              <td className="p-4 border-r border-gray-100 text-gray-600">{row.location}</td>
                              <td className="p-4 border-r border-gray-100 text-gray-600">{row.floor}</td>
                              <td className="p-4 border-r border-gray-100">
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-100 text-xs">{row.scrapMethod}</span>
                              </td>
                              <td className="p-4 text-gray-500 truncate max-w-[250px]" title={row.reason}>{row.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 审批意见模块 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 mt-6 overflow-hidden transition-all hover:shadow-md">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-800 text-base">审批意见</h3>
          </div>
          <div className="p-6">
            <textarea 
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="请输入审批意见（如驳回，请务必填写驳回原因）..." 
              className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[120px] resize-y bg-gray-50/50 focus:bg-white text-base"
            />
          </div>
        </div>
      </div>

      {/* 底部固定审批操作栏 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-[95%] xl:max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-gray-500 text-sm font-medium">
            审批节点: <span className="text-gray-900 font-bold ml-1">部门负责人审批</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-8 py-3 text-red-600 bg-white border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all font-bold tracking-wider">
              <CloseIcon className="w-5 h-5 mr-2" /> 驳回
            </button>
            <button className="flex items-center px-12 py-3 text-white bg-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-bold tracking-wider">
              <Check className="w-5 h-5 mr-2" /> 同意
            </button>
          </div>
        </div>
      </div>

      {/* 隐藏并美化自定义的横向滚动条 */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}} />
    </div>
  );
}