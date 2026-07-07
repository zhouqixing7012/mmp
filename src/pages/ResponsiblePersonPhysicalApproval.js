import React, { useState } from 'react';
import { FileText, Search, ChevronRight, ChevronDown } from 'lucide-react';

// 通用的区块标题组件
const SectionHeader = ({ title }) => (
  <div className="flex items-center text-[#0088cc] font-bold text-base mb-3 mt-6 pb-1 border-b border-gray-100">
    <FileText className="w-5 h-5 mr-2" />
    {title}
  </div>
);

// 通用的表单行组件
const FormRow = ({ label, value, required }) => (
  <div className="flex items-start text-sm">
    <div className="w-28 text-right text-gray-700 mr-4 flex-shrink-0">
      {label}:
      {required && <span className="text-red-500 ml-1">*</span>}
    </div>
    <div className="flex-1 text-gray-900">{value}</div>
  </div>
);

// 新增：关系标签组件（完全贴合设计图“主/备”颜色）
const RelBadge = ({ type }) => {
  if (type === '主') {
    return <span className="inline-block px-[10px] py-[2px] border border-[#a0cfff] text-[#409eff] rounded-[3px] text-xs bg-[#ecf5ff]">主</span>;
  }
  return <span className="inline-block px-[10px] py-[2px] border border-gray-200 text-gray-500 rounded-[3px] text-xs bg-white">备</span>;
};

// 新增：提取的统一测试数据，方便两张表同步渲染并展示树状结构
const assetData = [
  { id: '114141605224', sn: 'SN-M-2023001', rel: '主', desc: '服务器主机', qty: 1, city: '北京市', bldg: '搜狐媒体大厦', floor: '8层', cat: 'IT设备', subcat: '服务器', status: '在用-使用中', isChild: false },
  { id: 'PART-NIC-001', sn: 'SN-P-001122', rel: '备', desc: '网卡', qty: 1, city: '北京市', bldg: '搜狐媒体大厦', floor: '8层', cat: 'IT设备', subcat: '网络设备', status: '在用-使用中', isChild: true, parentId: '114141605224' },
  { id: 'PART-MEM-009', sn: 'SN-P-003344', rel: '备', desc: '内存条', qty: 1, city: '北京市', bldg: '搜狐媒体大厦', floor: '8层', cat: 'IT设备', subcat: '服务器配件', status: '在用-使用中', isChild: true, parentId: '114141605224' },
  { id: 'PART-HDD-012', sn: 'SN-P-005566', rel: '备', desc: '硬盘', qty: 1, city: '北京市', bldg: '搜狐媒体大厦', floor: '8层', cat: 'IT设备', subcat: '服务器配件', status: '在用-使用中', isChild: true, parentId: '114141605224' },
];

export default function ResponsiblePersonPhysicalApproval() {
  // 简单的状态用于控制树状表格行的展开/折叠
  const [expandedRows, setExpandedRows] = useState({
    '114141605224': true,
  });

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 提取通用的表格行渲染函数，确保两个表格样式一致且全是只读结构
  const renderTableRows = () => {
    return assetData.map((row) => {
      // 若是子节点且父节点未展开，则隐藏
      if (row.isChild && !expandedRows[row.parentId]) return null;

      return (
        <tr key={row.id} className="bg-white hover:bg-gray-50 transition-colors">
          <td className="border border-gray-300 py-3 px-2 text-left">
            <div className="flex items-center select-none pl-2">
              {!row.isChild ? (
                <span
                  className="inline-flex items-center justify-center w-[20px] h-[20px] border border-gray-300 rounded-[3px] bg-white mr-3 text-gray-500 cursor-pointer shadow-sm hover:border-gray-400 flex-shrink-0"
                  onClick={() => toggleRow(row.id)}
                >
                  {expandedRows[row.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              ) : (
                <div className="w-[20px] h-[20px] mr-3 relative flex-shrink-0">
                  {/* 精确控制线段，完美还原设计图中的 L 型分支线 */}
                  <div className="absolute left-[9px] top-[-2px] w-[14px] h-[14px] border-l-[1.5px] border-b-[1.5px] border-[#c0c4cc]"></div>
                </div>
              )}
              <span className={!row.isChild ? "text-gray-900" : "text-gray-600"}>{row.id}</span>
            </div>
          </td>
          <td className="border border-gray-300 py-3 px-2 text-gray-800">{row.sn}</td>
          <td className="border border-gray-300 py-3 px-2">
            <RelBadge type={row.rel} />
          </td>
          <td className="border border-gray-300 py-3 px-2 text-left">{row.desc}</td>
          <td className="border border-gray-300 py-3 px-2">{row.qty}</td>
          <td className="border border-gray-300 py-3 px-2">{row.city}</td>
          <td className="border border-gray-300 py-3 px-2">{row.bldg}</td>
          <td className="border border-gray-300 py-3 px-2">{row.floor}</td>
          <td className="border border-gray-300 py-3 px-2">{row.cat}</td>
          <td className="border border-gray-300 py-3 px-2">{row.subcat}</td>
          <td className="border border-gray-300 py-3 px-2">{row.status}</td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 font-sans">
      <div className="max-w-[1200px] mx-auto bg-white shadow-sm border border-gray-300">
        
        {/* 顶部蓝色标题栏 */}
        <div className="bg-[#46a3ff] text-white px-4 py-2 text-lg font-bold">
          转移资产申请
        </div>

        {/* 单号信息 */}
        <div className="text-right px-6 py-2 text-xs text-gray-600">
          转移单号: ETA-202407240001
        </div>

        {/* 主体内容区域 */}
        <div className="px-8 pb-8">
          
          {}
          {/* 1. 转出人信息 */}
          <div>
            <SectionHeader title="转出人信息" />
            <div className="grid grid-cols-2 gap-y-4">
              <FormRow label="转出人" value="216770-唐星博" />
              <FormRow label="申请时间" value="2024-07-24" />
              <FormRow label="转出部门" value="集团总部.MIS部.系统运维组" />
              <FormRow label="转移类型" value="一般转移" />
              <FormRow label="电话" value="010-56603079" />
              <FormRow label="邮箱" value="xingbotang@sohu-lab.com" />
              <FormRow label="转出原因" value="123" />
            </div>
          </div>

          {}
          {/* 2. 接收人信息 */}
          <div>
            <SectionHeader title="接收人信息" />
            <div className="grid grid-cols-2 gap-y-4 mb-4">
              <FormRow label="接收人" value="114111-杨羊" />
              <FormRow label="接收部门" value="集团总部.员工服务中心.资产部" />
              <FormRow label="电话" value="010-62726168" />
              <FormRow label="邮箱" value="qianyang@sohu-lab.com" />
            </div>
            {/* 跨行的只读文本域 */}
            <div className="flex items-start text-sm mt-4">
              <div className="w-28 text-right text-gray-700 mr-4 mt-1">
                使用用途:<span className="text-red-500 ml-1">*</span>
              </div>
              <div className="flex-1">
                <textarea
                  readOnly
                  className="w-full border border-gray-300 bg-gray-50 rounded-none p-2 outline-none resize-none text-gray-700"
                  rows={2}
                  value="测试"
                />
              </div>
            </div>
          </div>

          {}
          {/* 3. 转出资产信息 (已注释) */}

          {}
          {/* 4. 转移物资信息 (已根据要求全部置为只读) */}
          <div>
            <SectionHeader title="转移物资信息" />
            {/* <div className="text-red-600 text-sm font-bold mb-3">
              请确认接收资产的存放与使用地点。
            </div> */}
            
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[#f8f9fa]">
                    <th className="border border-gray-300 py-2 font-normal text-left pl-4 w-[16%]">资产标签号</th>
                    <th className="border border-gray-300 py-2 font-normal w-[12%]">序列号</th>
                    <th className="border border-gray-300 py-2 font-normal w-[6%]">关系</th>
                    <th className="border border-gray-300 py-2 font-normal w-[12%]">资产说明</th>
                    <th className="border border-gray-300 py-2 font-normal w-[5%]">数量</th>
                    <th className="border border-gray-300 py-2 font-normal w-[8%]">City</th>
                    <th className="border border-gray-300 py-2 font-normal w-[10%]">Building</th>
                    <th className="border border-gray-300 py-2 font-normal w-[7%]">Floor</th>
                    <th className="border border-gray-300 py-2 font-normal w-[8%]">资产大类</th>
                    <th className="border border-gray-300 py-2 font-normal w-[8%]">资产小类</th>
                    <th className="border border-gray-300 py-2 font-normal w-[8%]">资产状态</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
          </div>

          {}
          {/* 5. 保管职责 */}
          <div>
            <SectionHeader title="实物确认" />
            <div className="text-red-600 text-xs leading-relaxed mb-4">
              接收人确认已收到上述资产及相关配件，认同公司资产仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。
            </div>
            <div className="flex justify-center items-center text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2" defaultChecked />
                同意“实物确认”
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}