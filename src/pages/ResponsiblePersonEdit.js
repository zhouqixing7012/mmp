import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Upload } from 'lucide-react';

const ResponsiblePersonEdit = () => {
  // 控制树状表格展开/折叠的状态
  const [expandedRows, setExpandedRows] = useState({ '1': true });

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 模拟数据结构，支持主备树状结构
  const tableData = [
    {
      id: '1',
      tag: '114141605224',
      sn: 'SN-M-2023001',
      relation: '主',
      desc: '戴尔.E2417H主机',
      qty: 1,
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: '17层',
      majorCategory: 'IT设备',
      minorCategory: '台式电脑',
      status: '在用-使用中',
      children: [
        {
          id: '1-1',
          tag: 'PART-NIC-001',
          sn: 'SN-P-001122',
          relation: '备',
          desc: '千兆独立网卡',
          qty: 1,
          city: '北京市',
          building: '搜狐媒体大厦',
          floor: '17层',
          majorCategory: 'IT部件',
          minorCategory: '网络适配器',
          status: '在用-使用中'
        },
        {
          id: '1-2',
          tag: 'PART-MEM-009',
          sn: 'SN-P-003344',
          relation: '备',
          desc: '金士顿 16G DDR4',
          qty: 1,
          city: '北京市',
          building: '搜狐媒体大厦',
          floor: '17层',
          majorCategory: 'IT部件',
          minorCategory: '内存',
          status: '在用-使用中'
        },
        {
          id: '1-3',
          tag: 'PART-HDD-012',
          sn: 'SN-P-005566',
          relation: '备',
          desc: '希捷 1T 机械硬盘',
          qty: 1,
          city: '北京市',
          building: '搜狐媒体大厦',
          floor: '17层',
          majorCategory: 'IT部件',
          minorCategory: '硬盘',
          status: '在用-使用中'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center font-sans">
      <div className="bg-white w-full max-w-[1400px] rounded-lg shadow-sm p-8">
        
        {/* 接收人信息区域 */}
        <div className="mb-8">
          <div className="flex items-center mb-6 border-b border-gray-100 pb-2">
            <div className="w-1 h-4 bg-blue-500 mr-2 rounded-sm"></div>
            <h2 className="text-blue-500 font-medium text-lg">接收人信息</h2>
          </div>

          <div className="space-y-4">
            {/* 第一行 */}
            <div className="grid grid-cols-3 gap-8">
              <div className="flex items-center">
                <label className="w-24 text-right pr-3 text-sm text-gray-700 whitespace-nowrap">
                  <span className="text-red-500 mr-1">*</span>接收人:
                </label>
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="请选择转移人" 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-24 text-right pr-3 text-sm text-gray-700 whitespace-nowrap">
                  转移类型:
                </label>
                <div className="relative flex-1">
                  <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm appearance-none focus:outline-none focus:border-blue-500 bg-white">
                    <option>一般转移</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-24 text-right pr-3 text-sm text-gray-700 whitespace-nowrap">
                  电话:
                </label>
                <input 
                  type="text" 
                  placeholder="自动带出" 
                  disabled
                  className="flex-1 border border-transparent bg-gray-50 rounded px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* 第二行 */}
            <div className="grid grid-cols-3 gap-8">
              <div className="flex items-center">
                <label className="w-24 text-right pr-3 text-sm text-gray-700 whitespace-nowrap">
                  邮箱:
                </label>
                <input 
                  type="text" 
                  placeholder="自动带出" 
                  disabled
                  className="flex-1 border border-transparent bg-gray-50 rounded px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center">
                <label className="w-24 text-right pr-3 text-sm text-gray-700 whitespace-nowrap">
                  部门:
                </label>
                <input 
                  type="text" 
                  placeholder="自动带出" 
                  disabled
                  className="flex-1 border border-transparent bg-gray-50 rounded px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center">
                {/* 占位，保持网格对齐 */}
              </div>
            </div>

            {/* 第三行 */}
            <div className="flex items-start pt-2">
              <label className="w-24 text-right pr-3 text-sm text-gray-700 whitespace-nowrap pt-1">
                <span className="text-red-500 mr-1">*</span>转移原因:
              </label>
              <div className="relative flex-1">
                <textarea 
                  placeholder="请填写转出原因" 
                  className="w-full border border-gray-300 rounded p-3 text-sm h-24 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                ></textarea>
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">0/500</span>
              </div>
            </div>
          </div>
        </div>

        {/* 转移物资信息区域 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-blue-500 mr-2 rounded-sm"></div>
              <h2 className="text-blue-500 font-medium text-lg">转移物资信息</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                共 {tableData.length + tableData.reduce((acc, curr) => acc + (expandedRows[curr.id] ? curr.children?.length || 0 : 0), 0)} 条记录
              </span>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors">
                <Upload className="w-4 h-4" />
                批量导入
              </button>
            </div>
          </div>

          {/* 表格容器 */}
          <div className="overflow-x-auto border border-gray-100 rounded-sm">
            <table className="w-full min-w-[1300px] text-left text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 font-medium min-w-[200px]">资产标签号</th>
                  <th className="py-3 px-4 font-medium">序列号</th>
                  <th className="py-3 px-4 font-medium w-16">关系</th>
                  <th className="py-3 px-4 font-medium">资产说明</th>
                  <th className="py-3 px-4 font-medium w-16">数量</th>
                  <th className="py-3 px-4 font-medium w-24">City</th>
                  <th className="py-3 px-4 font-medium w-32">Building</th>
                  <th className="py-3 px-4 font-medium w-20">Floor</th>
                  <th className="py-3 px-4 font-medium w-24">资产大类</th>
                  <th className="py-3 px-4 font-medium w-28">资产小类</th>
                  <th className="py-3 px-4 font-medium w-32 text-right">资产状态</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <React.Fragment key={row.id}>
                    {/* 主资产行 */}
                    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {row.children && row.children.length > 0 && (
                            <button 
                              onClick={() => toggleRow(row.id)}
                              className="w-[18px] h-[18px] border border-gray-300 rounded-[3px] flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors bg-white shadow-sm"
                            >
                              {expandedRows[row.id] ? <ChevronDown size={12} strokeWidth={3} /> : <ChevronRight size={12} strokeWidth={3} />}
                            </button>
                          )}
                          <span className="font-medium">{row.tag}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{row.sn}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">{row.relation}</span>
                      </td>
                      <td className="py-3 px-4">{row.desc}</td>
                      <td className="py-3 px-4">{row.qty}</td>
                      <td className="py-3 px-4">{row.city}</td>
                      <td className="py-3 px-4">{row.building}</td>
                      <td className="py-3 px-4">{row.floor}</td>
                      <td className="py-3 px-4">{row.majorCategory}</td>
                      <td className="py-3 px-4">{row.minorCategory}</td>
                      <td className="py-3 px-4 text-right">{row.status}</td>
                    </tr>

                    {/* 备用/子资产行 */}
                    {expandedRows[row.id] && row.children?.map((child) => (
                      <tr key={child.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group bg-gray-50/20">
                        <td className="py-3 px-4">
                          <div className="flex items-center pl-3">
                            {/* L 型树状连接线 */}
                            <div className="w-4 h-4 border-l-[1.5px] border-b-[1.5px] border-gray-300 mr-2 -mt-2 rounded-bl-[2px]"></div>
                            <span className="text-gray-600">
                              {child.tag}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{child.sn}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{child.relation}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{child.desc}</td>
                        <td className="py-3 px-4 text-gray-600">{child.qty}</td>
                        <td className="py-3 px-4 text-gray-500">{child.city}</td>
                        <td className="py-3 px-4 text-gray-500">{child.building}</td>
                        <td className="py-3 px-4 text-gray-500">{child.floor}</td>
                        <td className="py-3 px-4 text-gray-600">{child.majorCategory}</td>
                        <td className="py-3 px-4 text-gray-600">{child.minorCategory}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{child.status}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center gap-4 mt-12 mb-4">
          <button className="px-8 py-2 text-blue-500 bg-white border border-blue-400 rounded hover:bg-blue-50 transition-colors text-sm">
            返回
          </button>
          <button className="px-8 py-2 text-white bg-[#409EFF] border border-[#409EFF] rounded hover:bg-blue-500 transition-colors text-sm shadow-sm">
            预览
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResponsiblePersonEdit;