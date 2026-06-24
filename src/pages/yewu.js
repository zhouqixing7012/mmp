import React, { useState } from 'react';
import { 
  Search, Plus, CheckCircle, XCircle, Download, Edit, Settings, 
  ChevronDown, Folder, LayoutDashboard, Monitor, Layers, ClipboardList,
  Menu, User, Bell, ChevronRight, MoreHorizontal, Trash2, RefreshCcw, MinusSquare
} from 'lucide-react';

// --- Reusable Antd-style Components ---

const AntButton = ({ children, type = 'default', icon, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded transition-all duration-200 border cursor-pointer select-none";
  const types = {
    primary: "bg-[#1677ff] text-white border-[#1677ff] hover:bg-[#4096ff] hover:border-[#4096ff] shadow-sm",
    default: "bg-white text-gray-700 border-[#d9d9d9] hover:text-[#1677ff] hover:border-[#1677ff] shadow-sm",
    danger: "bg-white text-[#ff4d4f] border-[#d9d9d9] hover:text-[#ff7875] hover:border-[#ff7875] shadow-sm",
    dashed: "bg-white text-gray-700 border-[#d9d9d9] border-dashed hover:text-[#1677ff] hover:border-[#1677ff] shadow-sm",
    link: "bg-transparent text-[#1677ff] border-transparent hover:text-[#4096ff] px-0 shadow-none",
  };

  return (
    <button className={`${baseStyle} ${types[type]} ${className}`} {...props}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

const AntInput = ({ placeholder, className = '', ...props }) => (
  <input 
    type="text"
    placeholder={placeholder}
    className={`w-full px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all ${className}`}
    {...props}
  />
);

const AntSelect = ({ options, placeholder = '请选择...', className = '', ...props }) => (
  <div className="relative w-full">
    <select 
      className={`w-full appearance-none px-3 py-1.5 pr-8 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all text-gray-700 ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

const AntTable = ({ columns, data }) => (
  <div className="w-full overflow-x-auto border border-[#f0f0f0] rounded-t">
    <table className="w-full text-left border-collapse min-w-max">
      <thead>
        <tr>
          <th className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] w-12 text-center">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#1677ff] focus:ring-[#1677ff]" />
          </th>
          {columns.map((col, idx) => (
            <th key={idx} className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] text-sm font-semibold text-gray-800 whitespace-nowrap">
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => {
          if (row.isGroup) {
            return (
              <tr key={rowIdx} className="bg-[#f5f5f5] border-b border-[#f0f0f0]">
                <td colSpan={columns.length + 1} className="px-4 py-2 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <MinusSquare size={14} className="text-gray-500" />
                    {row.groupName}
                  </div>
                </td>
              </tr>
            );
          }
          return (
            <tr key={rowIdx} className="hover:bg-[#fafafa] transition-colors group cursor-pointer">
              <td className="px-4 py-3 border-b border-[#f0f0f0] text-center">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#1677ff] focus:ring-[#1677ff]" />
              </td>
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-3 border-b border-[#f0f0f0] text-sm text-gray-600">
                  {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#f0f0f0] rounded-b text-sm text-gray-500">
      <div>共 {data.length} 条记录</div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">上一页</button>
        <button className="px-2 py-1 border rounded bg-[#1677ff] text-white border-[#1677ff]">1</button>
        <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">2</button>
        <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">...</button>
        <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">下一页</button>
        <span className="ml-2">10 条/页</span>
      </div>
    </div>
  </div>
);

// --- Sub-Views for Tabs ---

// 1. 物料综合集合 (Material Comprehensive View)
const MaterialComprehensiveView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类', dataIndex: 'category' },
    { title: '物料综合编码', dataIndex: 'code' },
    { title: '物料综合描述', dataIndex: 'desc' },
    { title: '大类描述', dataIndex: 'catDesc' },
    { title: '小类描述', dataIndex: 'subCatDesc' },
    { title: '配置描述', dataIndex: 'configDesc' },
    { title: '单位', dataIndex: 'unit' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? <span className="text-green-600">启用</span> : <span className="text-red-500">停用</span> },
    { title: '参考价格', dataIndex: 'price' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link" className="text-sm">操作</AntButton> }
  ];

  const data = [
    { id: 1, category: '资产', code: '1120001120077', desc: '苹果 MacBook Pro', catDesc: 'NOTEBOOK', subCatDesc: '笔记本技术笔记本', configDesc: 'M4 Apple M4 芯片...', unit: '台', enabled: true, price: '14,200.00' },
    { id: 2, category: '资产', code: '111007011259010', desc: '苹果 Mac mini', catDesc: 'PC', subCatDesc: '主机-Mac Mini', configDesc: 'Apple M4 芯片/24G...', unit: '台', enabled: true, price: '7,499.00' },
    { id: 3, category: '资产', code: '111014011190007', desc: '苹果 iMac', catDesc: 'PC', subCatDesc: '主机-一体机', configDesc: '定制 Apple M4 芯片...', unit: '台', enabled: true, price: '10,499.00' },
    { id: 4, category: '资产', code: '1120001120018', desc: '苹果 MacBook Air', catDesc: 'NOTEBOOK', subCatDesc: '笔记本技术笔记本', configDesc: '定制 Apple M4 芯片...', unit: '台', enabled: true, price: '9,999.00' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 搜索表单区域 */}
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料综合编码:</span>
            <AntInput placeholder="请输入编码" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">大类描述:</span>
            <AntInput placeholder="搜索大类..." />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">品牌:</span>
            <AntInput placeholder="搜索品牌..." />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">型号MIS对照:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center gap-2 md:col-span-2 xl:col-span-2">
            <span className="w-24 text-right text-sm text-gray-600">参考价格:</span>
            <div className="flex items-center w-full gap-2">
              <AntInput placeholder="最低价" />
              <span className="text-gray-400">-</span>
              <AntInput placeholder="最高价" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-span-1">
            <AntButton type="default" icon={<Search size={14}/>}>重置</AntButton>
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>

      {/* 列表区域 */}
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" className="text-green-600 hover:border-green-600 hover:text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>批量修改</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 2. 物料大类 (Material Category View)
const MaterialCategoryView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类编号', dataIndex: 'code' },
    { title: '物料大类描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '是否允许借用', dataIndex: 'borrowable', render: (val) => val ? '是' : '否' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];
  
  const data = [
    { id: 14, code: '001', desc: 'SERVER', enabled: true, borrowable: true },
    { id: 34, code: '002', desc: '合约机', enabled: true, borrowable: false },
    { id: 26, code: '003', desc: '电脑电池', enabled: true, borrowable: false },
    { id: 20, code: '004', desc: '内存硬盘', enabled: true, borrowable: true },
    { id: 23, code: '005', desc: '办公设备', enabled: true, borrowable: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料大类编号:</span>
            <AntInput placeholder="请输入大类编号" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料大类描述:</span>
            <AntInput placeholder="请输入大类描述" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            <AntButton type="primary" className="ml-2">查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
}

// 2.1 物料小类 (Material Sub Category View)
const MaterialSubCategoryView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类描述', dataIndex: 'catDesc' },
    { title: '物料小类编号', dataIndex: 'subCode' },
    { title: '物料小类描述', dataIndex: 'subDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '是否MIS转换', dataIndex: 'mis', render: (val) => val ? '是' : '否' },
    { title: '标签生成规则(前后缀)', dataIndex: 'rule' },
    { title: '是否允许借用', dataIndex: 'borrowable', render: (val) => val ? '是' : '否' },
    { title: '是否电脑配件', dataIndex: 'pcPart', render: (val) => val ? '是' : '否' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, catDesc: 'OFFICE EQUIPMENT', subCode: '113', subDesc: '移动数码-智能机器人', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
    { id: 2, catDesc: 'NET EQUIPMENT', subCode: '025', subDesc: '网络设备-UPS电源', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
    { id: 3, catDesc: '办公设备', subCode: '027', subDesc: '智能牛盾', enabled: false, mis: false, rule: '', borrowable: false, pcPart: false },
    { id: 4, catDesc: 'OFFICE EQUIPMENT', subCode: '112', subDesc: '办公设备-拼接屏LED屏', enabled: true, mis: true, rule: '', borrowable: false, pcPart: false },
    { id: 5, catDesc: 'OFFICE EQUIPMENT', subCode: '111', subDesc: '数码配件-户外电源', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料大类:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索大类..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料小类编号:</span>
            <AntInput placeholder="请输入小类编号" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料小类描述:</span>
            <AntInput placeholder="请输入小类描述" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            <AntButton type="primary" className="ml-2" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>批量修改</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 2.2 品牌 (Brand View)
const BrandView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌编码', dataIndex: 'code' },
    { title: '品牌描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, code: '040', desc: '滴滴出行', enabled: true },
    { id: 2, code: '055', desc: '优客工场', enabled: true },
    { id: 3, code: '106', desc: '保护动力', enabled: true },
    { id: 4, code: '144', desc: '戴尔', enabled: true },
    { id: 5, code: '148', desc: '惠普', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">品牌编码:</span>
            <AntInput placeholder="请输入编码" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">品牌描述:</span>
            <AntInput placeholder="请输入描述" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-span-1">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>批量修改</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 2.3 型号 (Model View)
const ModelView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '规格型号编码', dataIndex: 'code' },
    { title: '规格型号描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, brand: '华硕', code: '014', desc: '天选5 Pro 魔霸版', enabled: true },
    { id: 2, brand: '惠普', code: '393', desc: '惠普暗影精灵8 Pro电源适配器', enabled: true },
    { id: 3, brand: 'OPPO', code: '075', desc: 'A8 Pro', enabled: true },
    { id: 4, brand: 'OPPO', code: '074', desc: 'Find X9', enabled: true },
    { id: 5, brand: '三星', code: '306', desc: 'Galaxy S25', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">品牌:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="请选择品牌" />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">规格型号编码:</span>
            <AntInput placeholder="请输入编码" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">规格型号描述:</span>
            <AntInput placeholder="请输入描述" />
          </div>
          <div className="flex items-center gap-2 xl:col-start-1">
            <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 2.4 配置 (Configuration View)
const ConfigView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '型号', dataIndex: 'model' },
    { title: '配置编码', dataIndex: 'code' },
    { title: '配置描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, brand: '三星', model: 'Galaxy S8+', code: '001', desc: 'G9550 64G 全网通', enabled: true },
    { id: 2, brand: '联想', model: 'ThinkPad X1 Carbon 2017', code: '001', desc: 'i5-7200U/8G/256G SSD/14英寸/三年质保', enabled: true },
    { id: 3, brand: '联想', model: 'ThinkPad X1 Carbon 2023', code: '001', desc: 'i7-1360P/32G/1T SSD/14英寸/三年质保', enabled: true },
    { id: 4, brand: '联想', model: 'ThinkPad X1 Carbon AI 2024', code: '001', desc: 'Ultra5-125H/32G/1TB SSD/集成显卡/14寸/三年质保', enabled: true },
    { id: 5, brand: '戴尔', model: 'DELL 2950', code: '001', desc: 'SAS 73G*6', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">品牌:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="请选择品牌" />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">型号:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="请选择型号" />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">配置编码:</span>
            <AntInput placeholder="请输入编码" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">配置描述:</span>
            <AntInput placeholder="请输入描述" />
          </div>
          <div className="flex items-center gap-2 xl:col-start-1">
            <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};


// 3. NO服务 (NO Service View - With Tree)
const NOServiceView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '服务描述', dataIndex: 'desc' },
  ];
  const data = [
    { id: 1, desc: '17173' },
    { id: 2, desc: 'MediaPlatform' },
    { id: 3, desc: 'DB' },
    { id: 4, desc: 'DUTY' },
    { id: 5, desc: 'E-HR' },
    { id: 6, desc: 'ERP' },
  ];
  
  const treeNodes = ['sendcloud', '腾讯', '17173', 'MediaPlatform', 'DB', 'DUTY', 'E-HR', 'ERP', 'FORTUNE', 'go back', 'Internal IT'];

  return (
    <div className="flex h-[calc(100vh-210px)] gap-4">
      {/* Left Tree */}
      <div className="w-64 bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0] font-medium text-gray-800 text-sm bg-[#fafafa]">
          NO服务角色
        </div>
        <div className="p-2 overflow-y-auto flex-1">
          {treeNodes.map((node, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#f5f5f5] cursor-pointer rounded text-sm text-gray-700">
              <Folder size={14} className="text-[#1677ff] opacity-70" />
              <span>{node}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Content */}
      <div className="flex-1 bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[#f0f0f0] flex items-center gap-4 bg-[#fafafa]">
           <span className="text-sm text-gray-600 whitespace-nowrap">服务描述:</span>
           <AntInput placeholder="请输入服务描述" className="w-64 bg-white" />
           <AntButton type="primary">查询</AntButton>
        </div>
        <div className="px-3 py-2 border-b border-[#f0f0f0] bg-white flex gap-2">
           <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
           <AntTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  )
}


// --- New Mapping Rule Views ---

// 4. 办公区与仓库映射
const OfficeWarehouseMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '部门', dataIndex: 'dept' },
    { title: '办公区', dataIndex: 'office' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '优先级', dataIndex: 'priority' },
    { title: '启用日期', dataIndex: 'date' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, company: 'WJS_北京搜狐互...', dept: 'D0164_搜狐媒体_社会...', office: 'L062_北京-搜狐媒体大厦...', warehouse: 'I0015_资产库(前台库)(互联网)...', priority: '2', date: '2024-07-12' },
    { id: 2, company: '420_上海搜狐互...', dept: 'D1619_搜狐媒体_广告...', office: 'L004_上海-神安广场', warehouse: 'I2064_资产库上海库(新媒体)...', priority: '4', date: '2023-08-22' },
    { id: 3, company: '380_北京畅游智...', dept: 'D3889_焦点_畅游智投...', office: 'L058_昆明-盘龙区同德商...', warehouse: 'I3017_资产库成都库(畅游智...', priority: '1', date: '2023-07-24' },
    { id: 4, company: '340_成都畅游科...', dept: 'D3889_焦点_畅游智投...', office: 'L085_成都-高新区环球中...', warehouse: 'I3006_资产库成都库(成都畅...', priority: '3', date: '2023-06-07' },
    { id: 5, company: 'NMG_北京搜狐新...', dept: 'D0722_视频_广告销售...', office: 'L003_广州-富力中心', warehouse: 'I3020_资产库广州库(新媒体...', priority: '1', date: '2023-05-17' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">公司:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索公司..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">办公区:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索办公区..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">仓库:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索仓库..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">部门:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索部门..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">启用日期从:</span>
            <AntInput type="date" className="text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">启用日期至:</span>
            <AntInput type="date" className="text-gray-600" />
            <AntButton type="primary" className="ml-2" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 5. PS新员工领用物料映射
const PSNewEmployeeMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '资产配置', dataIndex: 'config' },
    { title: 'City', dataIndex: 'city' },
    { title: '物料描述', dataIndex: 'desc' },
    { title: '数量', dataIndex: 'qty' },
    { title: '处理部门', dataIndex: 'dept' },
    { title: '优先级', dataIndex: 'priority' },
    { title: '启用日期', dataIndex: 'date' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, company: '420_上海搜狐互...', config: '标准台式设计机', city: 'CT0002_上海', desc: '芝麻 EIZO SX2262W显示器...', qty: 1, dept: 'ES', priority: '4', date: '2023-08-22' },
    { id: 2, company: '380_北京畅游智...', config: '标配技术笔记本', city: 'CT0003_北京', desc: '戴尔 Latitude E7280', qty: 1, dept: 'MIS', priority: '1', date: '2023-07-24' },
    { id: 3, company: '420_上海搜狐互...', config: '标配技术笔记本+显示器', city: 'CT0002_上海', desc: '戴尔 Latitude E7280', qty: 1, dept: 'MIS', priority: '2', date: '2023-08-22' },
    { id: 4, company: '420_上海搜狐互...', config: '标配技术笔记本+显示器', city: 'CT0002_上海', desc: '戴尔 P2417H显示器', qty: 1, dept: 'MIS', priority: '3', date: '2023-08-22' },
    { id: 5, company: '420_上海搜狐互...', config: '标配台式工作站', city: 'CT0002_上海', desc: '惠普 HP 8000', qty: 1, dept: 'MIS', priority: '3', date: '2023-08-22' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">资产配置:</span>
            <AntSelect options={[{label:'标准台式设计机', value:'1'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">公司:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索公司..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">City:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索City..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料描述:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索物料描述..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">数量:</span>
            <AntInput placeholder="请输入数量" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">处理部门:</span>
            <AntSelect options={[{label:'MIS', value:'1'}, {label:'ES', value:'0'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">优先级:</span>
            <AntInput placeholder="请输入优先级" />
          </div>
          <div className="flex items-center gap-2 xl:col-span-2 justify-between">
            <div className="flex items-center gap-2 w-full">
              <span className="w-24 text-right text-sm text-gray-600">启用日期从:</span>
              <AntInput type="date" className="text-gray-600" />
              <span className="w-24 text-right text-sm text-gray-600">启用日期至:</span>
              <AntInput type="date" className="text-gray-600" />
            </div>
            <AntButton type="primary" className="ml-4 whitespace-nowrap" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 6. NO地点与资产地点映射
const NOLocationMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO地点英文缩写', dataIndex: 'code' },
    { title: 'NO地点中文描述', dataIndex: 'desc' },
    { title: 'NO地点详细信息', dataIndex: 'info' },
    { title: 'City', dataIndex: 'city' },
    { title: 'Building', dataIndex: 'building' },
    { title: 'Floor', dataIndex: 'floor' },
    { title: '启用日期', dataIndex: 'date' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { isGroup: true, groupName: '搜狐' },
    { id: 1, code: 'SDZZ_CH1', desc: '枣庄联通机房', info: '山东省市中区长白山路2666号联通数...', city: '1854374_山东省_枣庄市', building: '1854711_联通数据中心', floor: '3层', date: '2023-06-14' },
    { id: 2, code: 'TJYZ', desc: '亦庄同济POP', info: '北京亦庄同济中路15号1层', city: '35_北京市', building: '1043828_亦庄同济中路15号', floor: '1层', date: '2023-05-29' },
    { id: 3, code: '亦庄高管', desc: '亦庄高管', info: '北京市大兴区半壁店村18号', city: '35_北京市', building: '1413424_大兴锦江瑞华2号', floor: '1层', date: '2023-04-27' },
    { id: 4, code: 'WHSY_MSP...', desc: '武汉金山云联通机房', info: '湖北省武汉市东西湖区金山大道武大科教...', city: '42_湖北省_武汉市', building: '1303156_武汉金山云联通机房', floor: '4层', date: '2022-10-14' },
    { id: 5, code: 'BJZW_CT1', desc: '北京电信数据中心', info: '北京市朝阳区酒仙桥路14号兆维工业园...', city: '35_北京市', building: '60_中国电信(兆维)', floor: '1层', date: '2022-10-13' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-sm text-gray-600">NO地点英文缩写:</span>
            <AntInput placeholder="请输入英文缩写" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-sm text-gray-600">NO地点中文描述:</span>
            <AntInput placeholder="请输入中文描述" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-sm text-gray-600">NO地点详细信息:</span>
            <AntInput placeholder="请输入详细信息" />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<RefreshCcw size={14} />}>刷新</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 7. 虚拟库管员映射
const VirtualWarehouseManagerMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '虚拟库管员', dataIndex: 'virtualAdmin' },
    { title: '仓库管理员', dataIndex: 'realAdmin' },
    { title: '启用日期', dataIndex: 'date' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { isGroup: true, groupName: '搜狐' },
    { id: 1, company: '203_搜狐千线', plate: '59_SAAS', virtualAdmin: 'SOHU52-库房管理员-焦点', realAdmin: 'SOHU51-公共管理员-焦点', date: '2023-07-21' },
    { id: 2, company: '247_成视聚创科技', plate: '59_SAAS', virtualAdmin: 'SOHU52-库房管理员-焦点', realAdmin: 'SOHU51-公共管理员-焦点', date: '2023-03-30' },
    { id: 3, company: '244_焦点聚会科技', plate: '59_SAAS', virtualAdmin: 'SOHU52-库房管理员-焦点', realAdmin: 'SOHU51-公共管理员-焦点', date: '2023-03-30' },
    { id: 4, company: '118_搜狐媒体-广州', plate: '16_视频', virtualAdmin: 'SOHU38-库房管理员-视频', realAdmin: 'SOHU38-公共管理员-视频', date: '2023-01-17' },
    { id: 5, company: '244_焦点聚会科技', plate: '57_房产', virtualAdmin: 'SOHUF1-库房管理员-FOCUS', realAdmin: 'SOHUF2-公共管理员-FOCUS', date: '2022-08-31' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">公司:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索公司..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索板块..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">虚拟库管员:</span>
            <AntInput placeholder="请输入库管员" />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 8. 板块与账簿映射
const PlateLedgerMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账簿', dataIndex: 'ledger' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { isGroup: true, groupName: '搜狐' },
    { id: 1, plate: '22_搜索事业部', ledger: 'FA_BOOK_SOGOU', enabled: true, startDate: '2000-01-01', endDate: '' },
    { id: 2, plate: '21_搜索事业部', ledger: 'FA_BOOK_SOGOU', enabled: true, startDate: '2000-01-01', endDate: '' },
    { id: 3, plate: '17_Corporate', ledger: 'FA_BOOK_SOHU', enabled: true, startDate: '2000-01-01', endDate: '' },
    { id: 4, plate: '59_SAAS', ledger: 'FA_BOOK_FOCUS_N', enabled: true, startDate: '2022-01-14', endDate: '' },
    { id: 5, plate: '54_二手房', ledger: 'FA_BOOK_FOCUS_N', enabled: true, startDate: '2000-01-01', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索板块..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">账簿:</span>
            <AntInput placeholder="请输入账簿" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="全部" />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};


// --- New Authorization Rule Views ---

// 9. 公司板块提取资产权限
const CompanyPlateAssetAuthView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '物料大类', dataIndex: 'materialCategory' },
    { title: '员工所属公司', dataIndex: 'empCompany' },
    { title: '员工所属板块', dataIndex: 'empPlate' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, company: '114_搜狐媒体', plate: '17_Corporate', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '' },
    { id: 2, company: '114_搜狐媒体', plate: '14_视频', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '' },
    { id: 3, company: '114_搜狐媒体', plate: '13_汽车', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '' },
    { id: 4, company: '114_搜狐媒体', plate: '12_搜狐网-mobile', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '' },
    { id: 5, company: '114_搜狐媒体', plate: '11_搜狐网-web', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '' },
    { id: 6, company: '244_焦点聚会科技', plate: '', materialCategory: '244_焦点聚会科技', empCompany: '', empPlate: '' },
    { id: 7, company: '247_成视聚创科技', plate: '', materialCategory: '247_成视聚创科技', empCompany: '', empPlate: '' },
    { id: 8, company: '203_搜狐千线', plate: '', materialCategory: '203_搜狐千线', empCompany: '', empPlate: '' },
    { id: 9, company: '201_焦点互动', plate: '', materialCategory: '201_焦点互动', empCompany: '', empPlate: '' },
    { id: 10, company: '247_成视聚创科技', plate: '51_焦点 Corporate', materialCategory: '247_成视聚创科技', empCompany: '52_房产', empPlate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">公司:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索公司..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索板块..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">物料大类:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索物料大类..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 10. NO设备提取资产权限
const NODeviceAssetAuthView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO设备类型', dataIndex: 'type' },
    { title: '责任人', dataIndex: 'owner' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, type: '服务器', owner: '220314-刘帅' },
    { id: 2, type: '网络设备', owner: '220314-刘帅' },
    { id: 3, type: '服务器', owner: '219795-毛帆帆' },
    { id: 4, type: '网络设备', owner: '219795-毛帆帆' },
    { id: 5, type: '网络设备', owner: '151778-王锐晨' },
    { id: 6, type: '服务器', owner: '216770-董星奉' },
    { id: 7, type: '网络设备', owner: '216858-宋立国' },
    { id: 8, type: '网络设备', owner: '217778-赵俊华' },
    { id: 9, type: '网络设备', owner: '205946-戴士静' },
    { id: 10, type: '网络设备', owner: '215740-宋文建' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">NO类型:</span>
            <AntSelect options={[{label:'服务器', value:'1'}, {label:'网络设备', value:'2'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
            <AntInput placeholder="请输入编号" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">姓名:</span>
            <AntInput placeholder="请输入姓名" />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 11. 公司归属权限
const CompanyBelongingAuthView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司归属', dataIndex: 'belonging' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, belonging: '焦点', company: '122_焦点直销', plate: '52_房产' },
    { id: 2, belonging: '焦点', company: '122_焦点直销', plate: '51_焦点 Corporate' },
    { id: 3, belonging: '焦点', company: '122_焦点直销', plate: '15_焦点' },
    { id: 4, belonging: '焦点', company: '121_焦点财信', plate: '15_焦点' },
    { id: 5, belonging: '焦点', company: '120_焦点新时代', plate: '15_焦点' },
    { id: 6, belonging: '焦点', company: '203_搜狐千线', plate: '54_二手房' },
    { id: 7, belonging: '焦点', company: '203_搜狐千线', plate: '51_焦点 Corporate' },
    { id: 8, belonging: '焦点', company: '131_焦点互动', plate: '53_家居' },
    { id: 9, belonging: '焦点', company: '131_焦点互动', plate: '52_房产' },
    { id: 10, belonging: '焦点', company: '131_焦点互动', plate: '51_焦点 Corporate' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">公司归属:</span>
            <AntSelect options={[{label:'焦点', value:'1'}, {label:'搜狐', value:'2'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">公司:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索公司..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索板块..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};


// --- New Warehouse Data Views ---

// 12. 仓库信息 (Warehouse Information View - With Tree)
const WarehouseInfoView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库编码', dataIndex: 'code' },
    { title: '仓库描述', dataIndex: 'desc' },
    { title: '仓库用途', dataIndex: 'usage' },
    { title: '是否虚拟库', dataIndex: 'isVirtual', render: (val) => val ? '是' : '否' },
    { title: '公司', dataIndex: 'company' },
    { title: 'City', dataIndex: 'city' },
    { title: '库管员', dataIndex: 'admin' },
    { title: '启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, code: 'I0001', desc: '资产库北京库(新媒体)', usage: 'IU0001_资产库标准', isVirtual: false, company: '114_新媒体', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 2, code: 'I0002', desc: '资产库北京库(畅游北...)', usage: 'IU0001_资产库标准', isVirtual: false, company: '101_焦点互动', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 3, code: 'I0003', desc: '资产库北京库(互联网)', usage: 'IU0001_资产库标准', isVirtual: true, company: '102_互联网', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 4, code: 'I0004', desc: '资产库北京库(视频支付)', usage: 'IU0001_资产库标准', isVirtual: false, company: '129_视频支付', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 5, code: 'I0005', desc: '资产库北京库(软件科技)', usage: 'IU0001_资产库标准', isVirtual: false, company: '111_软件科技(软件科技)', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 6, code: 'I0006', desc: '资产库北京库(新媒体...)', usage: 'IU0001_资产库标准', isVirtual: false, company: '112_北京畅游动力', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 7, code: 'I0007', desc: '资产库北京库(天游飞...)', usage: 'IU0001_资产库标准', isVirtual: false, company: '123_天游飞享', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 8, code: 'I0008', desc: '资产库北京库(天津金...)', usage: 'IU0001_资产库标准', isVirtual: false, company: '124_天津金源', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 9, code: 'I0009', desc: '资产库北京库(千钧)', usage: 'IU0001_资产库标准', isVirtual: false, company: '132_千钧', city: '35_北京市', admin: '114111-杨平', enabled: true },
    { id: 10, code: 'I0010', desc: '资产库北京库(焦点互动)', usage: 'IU0001_资产库标准', isVirtual: false, company: '201_焦点互动', city: '35_北京市', admin: '114111-杨平', enabled: true },
  ];
  
  const treeNodes = ['仓库信息', '实体库', '虚拟库', '报废库', '借用库', '待检库'];

  return (
    <div className="flex h-[calc(100vh-210px)] gap-4">
      {/* Left Tree */}
      <div className="w-56 bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0] font-medium text-gray-800 text-sm bg-[#fafafa]">
          仓库信息
        </div>
        <div className="p-2 overflow-y-auto flex-1">
          {treeNodes.map((node, i) => (
            <div key={i} className={`flex items-center gap-2 px-2 py-1.5 hover:bg-[#f5f5f5] cursor-pointer rounded text-sm ${i === 0 ? 'text-[#1677ff] font-medium bg-[#e6f4ff]' : 'text-gray-700'}`}>
              <Folder size={14} className={i === 0 ? "text-[#1677ff]" : "text-[#1677ff] opacity-70"} />
              <span>{node}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Content */}
      <div className="flex-1 bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#f0f0f0]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex items-center gap-2">
              <span className="w-24 text-right text-sm text-gray-600">仓库编码:</span>
              <AntInput placeholder="请输入仓库编码" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-right text-sm text-gray-600">仓库描述:</span>
              <AntInput placeholder="请输入仓库描述" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-right text-sm text-gray-600">是否虚拟库:</span>
              <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
              <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
              <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 border-b border-[#f0f0f0] bg-white flex gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
           <AntTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  )
}

// 13. 仓库用途 (Warehouse Usage View)
const WarehouseUsageView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '编号', dataIndex: 'code' },
    { title: '描述', dataIndex: 'desc' },
    { title: '物品分类', dataIndex: 'category' },
    { title: '物品大类', dataIndex: 'mainCategory' },
    { title: '物品小类', dataIndex: 'subCategory' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, code: 'IU0007', desc: 'NO_Net-E库', category: '资产', mainCategory: 'NET EQUIPMENT', subCategory: '', enabled: true },
    { id: 2, code: 'IU0006', desc: 'NO_Server库', category: '资产', mainCategory: 'SERVER', subCategory: '', enabled: true },
    { id: 3, code: 'IU0005', desc: '文具库', category: '文具', mainCategory: '', subCategory: '', enabled: true },
    { id: 4, code: 'IU0004', desc: '耗材库', category: '耗材', mainCategory: '', subCategory: '', enabled: true },
    { id: 5, code: 'IU0003', desc: '易耗品库', category: '低值易耗品-耗材', mainCategory: '', subCategory: '', enabled: true },
    { id: 6, code: 'IU0002', desc: '资产库', category: '资产', mainCategory: '', subCategory: '', enabled: true },
    { id: 7, code: 'IU0001', desc: '资产标准库', category: '资产_低值易耗品', mainCategory: '', subCategory: '', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">编号:</span>
            <AntInput placeholder="请输入编号" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">描述:</span>
            <AntInput placeholder="请输入描述" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 14. 仓库权限 (Warehouse Permission View)
const WarehousePermissionView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '操作人', dataIndex: 'operator' },
    { title: '入库权限', dataIndex: 'inPerm', render: (val) => val ? '是' : '否' },
    { title: '默认入库仓库', dataIndex: 'defaultIn', render: (val) => val ? '是' : '否' },
    { title: '出库权限', dataIndex: 'outPerm', render: (val) => val ? '是' : '否' },
    { title: '默认出库仓库', dataIndex: 'defaultOut', render: (val) => val ? '是' : '否' },
    { title: '盘点权限', dataIndex: 'invPerm', render: (val) => val ? '是' : '否' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, warehouse: 'I2031_资产库北京库(焦点互动)...', operator: '219128-刘蓓', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 2, warehouse: 'I2007_资产库上海库(天游飞享)...', operator: '215410-卢雪华', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 3, warehouse: 'I3003_资产库北京库(新媒体-上...', operator: '215410-卢雪华', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 4, warehouse: 'I3023_资产库北京库(新媒体)...', operator: '208973-温翔', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 5, warehouse: 'I3023_资产库北京库(新媒体)...', operator: '114111-杨平', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 6, warehouse: 'I3023_资产库北京库(新媒体)...', operator: '119039-刘铮', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 7, warehouse: 'I3023_资产库北京库(新媒体)...', operator: '200520-王英', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 8, warehouse: 'I3014_资产库北京库(新媒体科...', operator: '114111-杨平', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 9, warehouse: 'I3022_资产库上海库(新媒体科...', operator: '114111-杨平', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
    { id: 10, warehouse: 'I3013_资产库北京库(新媒体科...', operator: '114111-杨平', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">仓库编号:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索仓库..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">操作人:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索操作人..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">入库权限:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// --- New Location Data View ---

// 15. 地点基础数据维护
const LocationBasicDataView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '地点名称', dataIndex: 'name' },
    { title: '地点类型', dataIndex: 'type' },
    { title: '启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' }
  ];

  const data = [
    { id: 1, name: '辽宁省-铁岭市', type: 'city', enabled: true },
    { id: 2, name: '江西省-赣州市', type: 'city', enabled: true },
    { id: 3, name: '山东省-德州市', type: 'city', enabled: true },
    { id: 4, name: '陕西省-咸阳市', type: 'city', enabled: true },
    { id: 5, name: '黑龙江省-七台河市', type: 'city', enabled: true },
    { id: 6, name: '湖南省-益阳市', type: 'city', enabled: true },
    { id: 7, name: '广西省-桂林市', type: 'city', enabled: true },
    { id: 8, name: '浙江省-舟山市', type: 'city', enabled: true },
    { id: 9, name: '吉林省-延吉市', type: 'city', enabled: true },
    { id: 10, name: '浙江省-台州市', type: 'city', enabled: true },
  ];
  
  const treeNodes = [
    { name: '地点信息', isRoot: true, expanded: true },
    { name: '北京市', level: 1 },
    { name: '安徽省-合肥市', level: 1 },
    { name: '安徽省-芜湖市', level: 1 },
    { name: '重庆市', level: 1 },
    { name: '福建省-福州市', level: 1 },
    { name: '福建省-宁德市', level: 1 },
    { name: '福建省-莆田市', level: 1 },
    { name: '福建省-泉州市', level: 1 },
    { name: '福建省-厦门市', level: 1 },
    { name: '甘肃省-兰州市', level: 1 },
  ];

  return (
    <div className="flex h-[calc(100vh-170px)] gap-4">
      {/* Left Tree */}
      <div className="w-56 bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="p-2 overflow-y-auto flex-1 text-sm text-gray-700">
          {treeNodes.map((node, i) => (
            <div key={i} className={`flex items-center gap-1 px-2 py-1.5 hover:bg-[#f5f5f5] cursor-pointer rounded ${node.level ? 'ml-4' : ''}`}>
              {node.isRoot ? (
                <MinusSquare size={14} className="text-gray-400" />
              ) : (
                <Plus size={14} className="text-gray-400" />
              )}
              <Folder size={14} className="text-[#1677ff] opacity-80" />
              <span>{node.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Content */}
      <div className="flex-1 bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#f0f0f0]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-6">
            <div className="flex items-center gap-2">
              <span className="w-20 text-right text-sm text-gray-600">地点名称:</span>
              <AntInput placeholder="请输入地点名称" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-right text-sm text-gray-600">地点类型:</span>
              <AntSelect options={[{label:'city', value:'city'}, {label:'province', value:'province'}]} placeholder="全部" />
            </div>
            <div className="flex items-center gap-2 xl:col-start-1">
              <span className="w-20 text-right text-sm text-gray-600">状态:</span>
              <AntSelect options={[{label:'启用', value:'1'}, {label:'停用', value:'0'}]} placeholder="全部" />
            </div>
            <div className="flex items-center gap-2 xl:col-start-2">
               <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
           <AntTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  )
}

// --- New Receipt Rule Management View ---

// 16. 单据编号规则管理
const ReceiptRuleManagementView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '单据类型', dataIndex: 'type' },
    { title: '前缀', dataIndex: 'prefix' },
    { title: '分隔符', dataIndex: 'separator' },
    { title: '是否包含公司缩写', dataIndex: 'hasCompany', render: (val) => val ? '是' : '否' },
    { title: '日期类型', dataIndex: 'dateType' },
    { title: '流水号类型', dataIndex: 'serialType' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, type: '员工信息', prefix: 'PAI', separator: '-', hasCompany: false, dateType: '年月日', serialType: '5位流水号' },
    { id: 2, type: '合并机网库', prefix: 'CPR', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
    { id: 3, type: '合并机应用', prefix: 'CPU', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
    { id: 4, type: '延长保修期', prefix: 'AST', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
    { id: 5, type: '资产调拨', prefix: 'ADC', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
    { id: 6, type: '资产调拨更换', prefix: 'CHA', separator: '-', hasCompany: false, dateType: '年月日', serialType: '5位流水号' },
    { id: 7, type: '员工借用申请', prefix: 'EUA', separator: '-', hasCompany: false, dateType: '年月日', serialType: '5位流水号' },
    { id: 8, type: '申购接收', prefix: 'SR', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
    { id: 9, type: '资产验收', prefix: 'PR', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
    { id: 10, type: 'ebs同步批次', prefix: 'MMP', separator: '-', hasCompany: false, dateType: '年月日', serialType: '4位流水号' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">单据类型:</span>
            <AntSelect options={[{label:'员工信息', value:'1'}, {label:'资产调拨', value:'2'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">前缀:</span>
            <AntInput placeholder="请输入前缀" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">分隔符:</span>
            <AntInput placeholder="请输入分隔符" />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col h-full relative">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <div className="flex-1 overflow-x-auto">
          <AntTable columns={columns} data={data} />
        </div>
        <div className="p-4 bg-[#fff1f0] border-t border-[#ffccc7] text-[#ff4d4f] text-sm">
          <div className="font-semibold mb-1">规范说明：</div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>单据编号规则必须包含有单据类型</li>
            <li>单据前缀及其连缀符仅在规则生成时使用</li>
          </ol>
        </div>
      </div>
    </div>
  );
};


// --- New Accounting Mapping Rule Views ---

// 17. HR公司与财务公司映射
const HRCompanyFinanceMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR公司', dataIndex: 'hrCompany' },
    { title: 'HR公司描述', dataIndex: 'hrCompanyDesc' },
    { title: '财务公司', dataIndex: 'financeCompany' },
    { title: '财务公司描述', dataIndex: 'financeCompanyDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' }
  ];

  const data = [
    { id: 1, hrCompany: 'FRA', hrCompanyDesc: '北京搜狐新时代信息技术有限公司', financeCompany: '101', financeCompanyDesc: '新时代', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 2, hrCompany: 'WIS', hrCompanyDesc: '北京搜狐互联网信息服务有限公司', financeCompany: '102', financeCompanyDesc: '互联网', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 3, hrCompany: 'SHS', hrCompanyDesc: '北京搜狐软件技术有限公司', financeCompany: '111', financeCompanyDesc: '软件科技(前软件)', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 4, hrCompany: 'SHP', hrCompanyDesc: '北京畅游时代数码技术有限公司', financeCompany: '112', financeCompanyDesc: '北京畅游动力', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 5, hrCompany: 'NMT', hrCompanyDesc: '北京搜狐新媒体信息技术有限公司', financeCompany: '114', financeCompanyDesc: '新媒体', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 6, hrCompany: 'NMS', hrCompanyDesc: '北京搜狐新媒体信息技术有限公司上海分公司', financeCompany: '115', financeCompanyDesc: '新媒体-上海', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 7, hrCompany: 'NMG', hrCompanyDesc: '北京搜狐新媒体信息技术有限公司广州分公司', financeCompany: '116', financeCompanyDesc: '新媒体-广州', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 8, hrCompany: 'FFT', hrCompanyDesc: '飞狐信息技术(天津)有限公司', financeCompany: '123', financeCompanyDesc: '天游飞享', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 9, hrCompany: 'GFC', hrCompanyDesc: '天津金源文化传播有限公司', financeCompany: '124', financeCompanyDesc: '天津金源', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 10, hrCompany: 'QGN', hrCompanyDesc: '广州市千钧网络科技有限公司', financeCompany: '132', financeCompanyDesc: '千钧', enabled: true, startDate: '2010-01-01', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">HR公司:</span>
            <AntInput placeholder="请输入HR公司" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">财务公司:</span>
            <AntInput placeholder="请输入财务公司" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 18. 部门与成本中心映射
const DeptCostCenterMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR部门', dataIndex: 'hrDept' },
    { title: 'HR部门描述', dataIndex: 'hrDeptDesc' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' }
  ];

  const data = [
    { id: 1, hrDept: 'D0177', hrDeptDesc: '搜狐媒体_媒体内外部文化交流中心_文化生产中心_互动百科组', costCenter: '111001', costCenterDesc: 'BD_大沟通', enabled: true, startDate: '2010-01-01', endDate: '2013-12-31' },
    { id: 2, hrDept: 'D0203', hrDeptDesc: '搜狐媒体_内容中心_财经', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 3, hrDept: 'D1204', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经生产_财经观念', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2014-06-01', endDate: '' },
    { id: 4, hrDept: 'D1230', hrDeptDesc: '搜狐媒体_媒体内容_财经中心_财经生产_财经观念', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2014-06-01', endDate: '' },
    { id: 5, hrDept: 'D1505', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经分发', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2014-07-01', endDate: '' },
    { id: 6, hrDept: 'D3104', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经生产', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 7, hrDept: 'D3254', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经分发_手赚', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 8, hrDept: 'D3259', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经生产_财经图集', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 9, hrDept: 'D3258', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经分发_商业', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2010-01-01', endDate: '' },
    { id: 10, hrDept: 'D3245', hrDeptDesc: '搜狐媒体_原创中心_财经账号_财经生产_高教', costCenter: '111002', costCenterDesc: '财经中心_大沟通', enabled: true, startDate: '2010-01-01', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">HR部门:</span>
            <AntInput placeholder="请输入HR部门" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
            <AntInput placeholder="请输入成本中心" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 19. 成本中心与板块映射
const CostCenterPlateMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '板块', dataIndex: 'plate' },
    { title: '板块描述', dataIndex: 'plateDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' }
  ];

  const data = [
    { id: 1, costCenter: '181004', costCenterDesc: '搜狐-畅游品牌_节目制作部_内容运营', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '' },
    { id: 2, costCenter: '181005', costCenterDesc: '搜狐-畅游品牌_内容营销部_内容运营', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '' },
    { id: 3, costCenter: '181007', costCenterDesc: '搜狐-畅游品牌_艺人中心', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '2014-12-31' },
    { id: 4, costCenter: '181008', costCenterDesc: '搜狐-畅游品牌_技术成本', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '' },
    { id: 5, costCenter: '181009', costCenterDesc: '搜狐-畅游品牌_维权与维稳_版权成本中心', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '' },
    { id: 6, costCenter: '181010', costCenterDesc: '搜狐-畅游品牌_维权与维稳_侵权维权成本中心', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '' },
    { id: 7, costCenter: '181011', costCenterDesc: '搜狐-畅游品牌_网络运营部', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '2014-12-31' },
    { id: 8, costCenter: '181012', costCenterDesc: '搜狐-畅游品牌_剧场制作部', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '2014-12-31' },
    { id: 9, costCenter: '181013', costCenterDesc: '搜狐-畅游品牌_产业内容部_内容运营', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '2014-12-31' },
    { id: 10, costCenter: '182001', costCenterDesc: '搜狐-畅游品牌_技术中心_平台技术', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false, startDate: '', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
            <AntInput placeholder="请输入成本中心" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <AntInput placeholder="请输入板块" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 20. 城市与业务线映射
const CityBusinessLineMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '城市', dataIndex: 'city' },
    { title: '城市描述', dataIndex: 'cityDesc' },
    { title: '业务线', dataIndex: 'businessLine' },
    { title: '业务线描述', dataIndex: 'businessLineDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' }
  ];

  const data = [
    { id: 1, city: '001', cityDesc: '美国', businessLine: '', businessLineDesc: '', enabled: false, startDate: '', endDate: '' },
    { id: 2, city: '0044', cityDesc: '英国', businessLine: '', businessLineDesc: '', enabled: false, startDate: '', endDate: '2016-04-01' },
    { id: 3, city: '0060', cityDesc: '马来西亚', businessLine: '', businessLineDesc: '', enabled: false, startDate: '', endDate: '2016-04-01' },
    { id: 4, city: '010', cityDesc: '北京市', businessLine: 'F101', businessLineDesc: '北京', enabled: true, startDate: '', endDate: '' },
    { id: 5, city: '020', cityDesc: '广东省_广州市', businessLine: 'F101', businessLineDesc: '广州', enabled: true, startDate: '', endDate: '' },
    { id: 6, city: '021', cityDesc: '上海市', businessLine: 'F102', businessLineDesc: '上海', enabled: true, startDate: '', endDate: '' },
    { id: 7, city: '022', cityDesc: '天津市', businessLine: 'F104', businessLineDesc: '天津', enabled: true, startDate: '', endDate: '' },
    { id: 8, city: '023', cityDesc: '重庆市', businessLine: 'F103', businessLineDesc: '重庆', enabled: true, startDate: '', endDate: '' },
    { id: 9, city: '0241', cityDesc: '辽宁省-沈阳市', businessLine: 'F401', businessLineDesc: '沈阳', enabled: true, startDate: '', endDate: '' },
    { id: 10, city: '0242', cityDesc: '辽宁省-铁岭市', businessLine: '', businessLineDesc: '', enabled: true, startDate: '', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">城市:</span>
            <AntInput placeholder="请输入城市" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">业务线:</span>
            <AntInput placeholder="请输入业务线" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 21. 部门与业务线映射
const DeptBusinessLineMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR部门', dataIndex: 'hrDept' },
    { title: 'HR部门描述', dataIndex: 'hrDeptDesc' },
    { title: '业务线', dataIndex: 'businessLine' },
    { title: '业务线描述', dataIndex: 'businessLineDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' }
  ];

  const data = [
    { id: 1, hrDept: 'D2307', hrDeptDesc: '焦点房地产资讯直营站-石家庄办事处-直销部', businessLine: 'F601', businessLineDesc: '石家庄', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 2, hrDept: 'D2308', hrDeptDesc: '焦点房地产资讯省-大区-北京房产二手房部', businessLine: 'F101', businessLineDesc: '北京', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 3, hrDept: 'D2307', hrDeptDesc: '焦点房地产资讯省-大区-北京房产经纪服务部', businessLine: 'F101', businessLineDesc: '北京', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 4, hrDept: 'D2308', hrDeptDesc: '焦点房地产资讯直营站-昆明办事处-直销部', businessLine: 'F001', businessLineDesc: '昆明', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 5, hrDept: 'D2305', hrDeptDesc: '焦点房地产资讯直营站-南京办事处-直销部', businessLine: 'F001', businessLineDesc: '南京', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 6, hrDept: 'D2305', hrDeptDesc: '焦点房地产资讯直营站-天津办事处-直销部', businessLine: 'F104', businessLineDesc: '天津', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 7, hrDept: 'D2305', hrDeptDesc: '焦点房地产资讯直营站-广州办事处-直销部', businessLine: 'F101', businessLineDesc: '广州', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 8, hrDept: 'D2315', hrDeptDesc: '焦点房地产资讯直营站-重庆办事处-直销部', businessLine: 'F103', businessLineDesc: '重庆', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 9, hrDept: 'D2235', hrDeptDesc: '焦点房产业务渠道网销中心-南京', businessLine: 'F001', businessLineDesc: '南京', enabled: true, startDate: '2015-01-01', endDate: '' },
    { id: 10, hrDept: 'D2234', hrDeptDesc: '焦点房产业务渠道网销中心-昆明', businessLine: 'FK01', businessLineDesc: '昆明', enabled: true, startDate: '2015-01-01', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">HR部门:</span>
            <AntInput placeholder="请输入HR部门" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">业务线:</span>
            <AntInput placeholder="请输入业务线" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};


// --- New Extra Configuration Views ---

// 22. 资产配给规则管理 (Asset Allocation Rule View)
const AssetAllocationRuleView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '影像器材配给方案名称', dataIndex: 'name' },
    { title: '影像器材配给方案描述', dataIndex: 'desc' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '资产级别', dataIndex: 'level' },
    { title: '数量', dataIndex: 'qty' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, name: '高配影像器材', desc: '方案3', subCat: '摄影摄像-镜头', level: '高端', qty: 3 },
    { id: 2, name: '高配影像器材', desc: '方案2', subCat: '摄影摄像-镜头', level: '高端', qty: 2 },
    { id: 3, name: '高配影像器材', desc: '方案1', subCat: '摄影摄像-单反相机', level: '中低端', qty: 1 },
    { id: 4, name: '标配影像器材', desc: '方案1', subCat: '摄影摄像-单反相机', level: '中低端', qty: 1 },
    { id: 5, name: '标配影像器材', desc: '方案2', subCat: '摄影摄像-镜头', level: '中低端', qty: 1 },
    { id: 6, name: '标配影像器材', desc: '方案2', subCat: '摄影摄像-单反机身', level: '高端', qty: 1 },
    { id: 7, name: '标配影像器材', desc: '方案3', subCat: '摄影摄像-单反机身', level: '高端', qty: 1 },
    { id: 8, name: '高配影像器材', desc: '方案1', subCat: '摄影摄像-微单相机', level: '高端', qty: 1 },
    { id: 9, name: '定配影像器材', desc: '方案1', subCat: '摄影摄像-小型数码照相机', level: '高端', qty: 1 },
    { id: 10, name: '标配影像器材', desc: '方案3', subCat: '摄影摄像-微单相机', level: '中低端', qty: 1 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案名称:</span>
            <AntSelect options={[{label:'高配影像器材', value:'1'}, {label:'标配影像器材', value:'2'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案描述:</span>
            <AntSelect options={[{label:'方案1', value:'1'}, {label:'方案2', value:'2'}]} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">资产级别:</span>
            <AntSelect options={[{label:'高端', value:'1'}, {label:'中低端', value:'2'}]} />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 23. 物资申请超标配置 (Material Request Over-limit Config View)
const MaterialRequestLimitView = () => {
  const columns = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '小类', dataIndex: 'subCat' },
    { title: '排除小类', dataIndex: 'excludeSubCat' },
    { title: '排除人', dataIndex: 'excludePerson' }
  ];

  const data = [
    { name: '主机-设计主机', subCat: '12302_主机-设计主机', excludeSubCat: '12302_主机-设计主机, 11111_主机-一体机, 11118_主机-Mac Pro, 11119_主机-极微型主机, 11117_主机-Mac Mini, 11123_主机-组装主机...', excludePerson: '' },
    { name: '摄影摄像-摄像机', subCat: '11332_摄影摄像-摄像机', excludeSubCat: '11331_摄影摄像-单反相机, 11330_摄影摄像-微单相机, 11332_摄影摄像-摄像机, 11325_摄影摄像-小型数码照相机', excludePerson: '' },
    { name: '摄影摄像-单反相机', subCat: '11331_摄影摄像-单反相机', excludeSubCat: '11325_摄影摄像-小型数码照相机, 11332_摄影摄像-摄像机, 11331_摄影摄像-单反相机, 11330_摄影摄像-微单相机', excludePerson: '' },
    { name: '摄影摄像-微单相机', subCat: '11330_摄影摄像-微单相机', excludeSubCat: '11331_摄影摄像-单反相机, 11330_摄影摄像-微单相机, 11332_摄影摄像-摄像机, 11325_摄影摄像-小型数码照相机', excludePerson: '' },
    { name: '摄影摄像-小型数码照相机', subCat: '11325_摄影摄像-小型数码照相机', excludeSubCat: '11330_摄影摄像-微单相机, 11331_摄影摄像-单反相机, 11325_摄影摄像-小型数码照相机, 11332_摄影摄像-摄像机', excludePerson: '' },
    { name: '笔记本-技术笔记本', subCat: '11217_笔记本-技术笔记本', excludeSubCat: '11217_笔记本-技术笔记本, 11216_笔记本-标准笔记本, 11211_笔记本, 11123_主机-组装主机, 11117_主机-Mac Mini, 11111_主机...', excludePerson: '' },
    { name: '笔记本-标准笔记本', subCat: '11216_笔记本-标准笔记本', excludeSubCat: '11118_主机-标准主机, 11118_主机-Mac Pro, 11116_主机-一体机, 11111_主机, 12302_主机-设计主机, 11121_主机-工作站...', excludePerson: '' },
    { name: '笔记本', subCat: '11211_笔记本', excludeSubCat: '11123_主机-组装主机, 11211_笔记本, 11216_笔记本-标准笔记本, 11217_笔记本-技术笔记本, 11117_主机-Mac Mini, 11118_主机...', excludePerson: '' },
    { name: '主机-组装主机', subCat: '11123_主机-组装主机', excludeSubCat: '12302_主机-设计主机, 11116_主机-一体机, 11110_主机_Mac Pro, 11118_主机-标准主机, 11117_主机_Mac Mini, 11123_主机...', excludePerson: '' },
    { name: '主机-工作站', subCat: '11121_主机-工作站', excludeSubCat: '11116_主机-一体机, 11110_主机_Mac Pro, 11118_主机_标准主机, 11121_主机-工作站, 11123_主机-组装主机, 11211_笔记本...', excludePerson: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">规则名称:</span>
            <AntInput placeholder="请输入规则名称" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">小类:</span>
            <AntInput placeholder="请输入小类" />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>编辑</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 24. 资产折旧规则管理 (Asset Depreciation Rule View)
const AssetDepreciationRuleView = () => {
  const columns = [
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '原值要求', dataIndex: 'originalValue' },
    { title: '计算关系', dataIndex: 'relation' },
    { title: '使用年限', dataIndex: 'years' },
    { title: '账面金额类型', dataIndex: 'valueType' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反机身', originalValue: '5000.0', relation: '>=', years: '4年以上', valueType: '净值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反机身', originalValue: '5000.0', relation: '>', years: '4年以内', valueType: '原值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反机身', originalValue: '5000.0', relation: '<', years: '1年以上', valueType: '净值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反机身', originalValue: '5000.0', relation: '<', years: '1年以内', valueType: '原值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-摄像机', originalValue: '5000.0', relation: '>=', years: '4年以上', valueType: '净值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反相机', originalValue: '5000.0', relation: '>=', years: '4年以内', valueType: '原值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反相机', originalValue: '5000.0', relation: '<', years: '1年以上', valueType: '净值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-镜头', originalValue: '5000.0', relation: '>=', years: '4年以上', valueType: '原值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-镜头', originalValue: '5000.0', relation: '<', years: '4年以上', valueType: '净值' },
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-镜头', originalValue: '5000.0', relation: '>=', years: '4年以内', valueType: '原值' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-[-10px] mt-2 relative z-10 mr-4">
         <AntButton type="default" className="text-gray-600 hover:text-[#1677ff]">计算</AntButton>
      </div>
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索物料大类..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">物料小类:</span>
            <div className="flex-1 relative">
              <AntInput placeholder="搜索物料小类..." />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">使用年限:</span>
            <AntSelect options={[{label:'4年以上', value:'1'}, {label:'4年以内', value:'2'}]} placeholder="请选择..." />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>编辑</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 25. 账套内容维护 (Account Book Content View)
const AccountBookContentView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账套名称', dataIndex: 'name' },
    { title: '账套名称中文', dataIndex: 'cnName' },
    { title: '账套名称英文', dataIndex: 'enName' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, company: '搜狐干线', plate: 'SAAS', name: '搜狐干线', cnName: '搜狐干线', enName: 'FOCUS XinGanXian' },
    { id: 2, company: '新媒体_广州', plate: '视频', name: '视频新媒体_广州', cnName: '视频广州', enName: 'ENTMT GZ' },
    { id: 3, company: '焦点互动', plate: 'SAAS', name: '焦点互动', cnName: '焦点互动', enName: 'FOCUS Interactive' },
    { id: 4, company: '焦点互动_南京', plate: '房产', name: '焦点互动', cnName: '焦点互动', enName: 'FOCUS Interactive' },
    { id: 5, company: '焦点聚会科技', plate: 'SAAS', name: '焦点聚会科技', cnName: '焦点聚会科技', enName: 'BoDianZhiHe' },
    { id: 6, company: '成视聚创科技', plate: 'SAAS', name: '成视聚创科技', cnName: '成视聚创科技', enName: 'ChengDuBoDian' },
    { id: 7, company: '焦点聚会科技', plate: '房产', name: '焦点聚会科技', cnName: '焦点聚会科技', enName: 'BoDianZhiHe' },
    { id: 8, company: '搜狐工会', plate: '软件', name: '搜狐工会', cnName: '搜狐工会', enName: 'SOHUTU' },
    { id: 9, company: '焦点聚会科技', plate: '焦点 Corporate', name: '焦点聚会科技', cnName: '焦点聚会科技', enName: 'BoDianZhiHe' },
    { id: 10, company: '成视聚创科技', plate: '焦点 Corporate', name: '成视聚创科技', cnName: '成视聚创科技', enName: 'ChengDuBoDian' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">公司:</span>
            <AntInput placeholder="请输入公司" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <AntInput placeholder="请输入板块" />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};


// --- New Expense Account Rule Views ---

// 26. 费用账户规则
const ExpenseAccountRuleView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类(输入)', dataIndex: 'inCat' },
    { title: '公司(输入)', dataIndex: 'inComp' },
    { title: '成本中心(输入)', dataIndex: 'inCost' },
    { title: '公司(输出)', dataIndex: 'outComp' },
    { title: '板块(输出)', dataIndex: 'outPlate' },
    { title: '成本中心(输出)', dataIndex: 'outCost' },
    { title: '科目(输出)', dataIndex: 'outSubj' },
    { title: '子目(输出)', dataIndex: 'outSubSubj' },
    { title: '业务线(输出)', dataIndex: 'outLine' },
    { title: '项目(输出)', dataIndex: 'outProj' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, inCat: '16.FURNITURE', inComp: '114_新媒体', inCost: '112064_搜狐媒体_平台运营中心', outComp: '', outPlate: '17_Corporate', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 2, inCat: '17.SOFTWARE', inComp: '123_天游飞享', inCost: '112004_产品技术部', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 3, inCat: '12.NOTEBOOK', inComp: '115_新媒体-上海', inCost: '168001_视频_分摊费用', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 4, inCat: '21.LEASEHOLD IMPROVEMENT', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 5, inCat: '18.VEHICLE', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 6, inCat: '17.SOFTWARE', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 7, inCat: '15.NET EQUIPMENT', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 8, inCat: '14.SERVER', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 9, inCat: '13.OFFICE EQUIPMENT', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
    { id: 10, inCat: '12.NOTEBOOK', inComp: '115_新媒体-上海', inCost: '161008_视频_技术成本', outComp: '', outPlate: '16_视频', outCost: '909003_折旧与摊销_facility分摊', outSubj: '', outSubSubj: '', outLine: '', outProj: '', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-sm text-gray-600">物料大类(输入):</span>
            <AntInput placeholder="请输入物料大类" />
          </div>
          <div className="flex items-center gap-2 xl:col-span-2">
            <span className="w-28 text-right text-sm text-gray-600">公司:</span>
            <AntInput placeholder="请输入公司" className="max-w-xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-right text-sm text-gray-600">成本中心(输入):</span>
            <AntInput placeholder="请输入成本中心" />
          </div>
          <div className="flex items-center gap-2 xl:col-start-3 xl:col-span-2 justify-end">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-32 mr-2" />
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>编辑</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 27. 成本中心与科目映射
const CostCenterSubjectMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '大类', dataIndex: 'cat' },
    { title: '公司', dataIndex: 'company' },
    { title: '科目', dataIndex: 'subject' },
    { title: '科目描述', dataIndex: 'subjectDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, costCenter: '168001', costCenterDesc: '视频_分摊费用', cat: '11 PC', company: '115 新媒体-上海', subject: '72101', subjectDesc: 'General and Administrative', enabled: true, startDate: '', endDate: '' },
    { id: 2, costCenter: '113045', costCenterDesc: '政策管理_广告销售', cat: '11 PC', company: '115 新媒体-上海', subject: '71101', subjectDesc: 'Sales and Marketing', enabled: true, startDate: '', endDate: '' },
    { id: 3, costCenter: '161008', costCenterDesc: '视频_技术成本', cat: '11 PC', company: '112 北京畅游动力', subject: '60101', subjectDesc: 'COR - Marketing services', enabled: true, startDate: '', endDate: '' },
    { id: 4, costCenter: '163005', costCenterDesc: '视频_频道策略_广告销售', cat: '12 NOTEBOOK', company: '115 新媒体-上海', subject: '71101', subjectDesc: 'Sales and Marketing', enabled: true, startDate: '', endDate: '' },
    { id: 5, costCenter: '113024', costCenterDesc: '华北服务支持_广告销售', cat: '11 PC', company: '115 新媒体-上海', subject: '71101', subjectDesc: 'Sales and Marketing', enabled: true, startDate: '', endDate: '' },
    { id: 6, costCenter: '113044', costCenterDesc: '数据分析_广告销售', cat: '12 NOTEBOOK', company: '114 新媒体', subject: '71101', subjectDesc: 'Sales and Marketing', enabled: true, startDate: '', endDate: '' },
    { id: 7, costCenter: '163013', costCenterDesc: '视频_大客户部(二)_广告销售', cat: '12 NOTEBOOK', company: '115 新媒体-上海', subject: '71101', subjectDesc: 'Sales and Marketing', enabled: true, startDate: '', endDate: '' },
    { id: 8, costCenter: '112012', costCenterDesc: '产品技术部_研发成本', cat: '11 PC', company: '114 新媒体', subject: '70101', subjectDesc: 'Product Development', enabled: true, startDate: '', endDate: '' },
    { id: 9, costCenter: '112012', costCenterDesc: '产品技术部_研发成本', cat: '12 NOTEBOOK', company: '114 新媒体', subject: '70101', subjectDesc: 'Product Development', enabled: true, startDate: '', endDate: '' },
    { id: 10, costCenter: '163016', costCenterDesc: '视频_市场推广中心', cat: '12 NOTEBOOK', company: '115 新媒体-上海', subject: '71101', subjectDesc: 'Sales and Marketing', enabled: true, startDate: '', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">大类:</span>
            <AntInput placeholder="请输入大类" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">公司:</span>
            <AntInput placeholder="请输入公司" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
            <AntInput placeholder="请输入成本中心" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">科目:</span>
            <AntInput placeholder="请输入科目" />
          </div>
          <div className="flex items-center gap-2 xl:col-start-1">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>批量修改</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 28. 物料大类与子目映射
const MaterialSubSubjectMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料大类描述', dataIndex: 'mainCatDesc' },
    { title: '子科目', dataIndex: 'subSubj' },
    { title: '子科目描述', dataIndex: 'subSubjDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, mainCat: '22', mainCatDesc: 'Park lot land use rights', subSubj: 'E2102', subSubjDesc: 'Dpm - Park Lot Using Right', enabled: true, startDate: '', endDate: '' },
    { id: 2, mainCat: '21', mainCatDesc: 'LEASEHOLD IMPROVEMENT', subSubj: 'E2108', subSubjDesc: 'Dpm - Leasehold Improvement', enabled: true, startDate: '', endDate: '' },
    { id: 3, mainCat: '20', mainCatDesc: 'Investment Properties', subSubj: 'E2101', subSubjDesc: 'Dpm - Building', enabled: true, startDate: '', endDate: '' },
    { id: 4, mainCat: '19', mainCatDesc: 'BUILDINGS', subSubj: 'E2101', subSubjDesc: 'Dpm - Building', enabled: true, startDate: '', endDate: '' },
    { id: 5, mainCat: '18', mainCatDesc: 'VEHICLE', subSubj: 'E2109', subSubjDesc: 'Dpm - Vehicle', enabled: true, startDate: '', endDate: '' },
    { id: 6, mainCat: '17', mainCatDesc: 'SOFTWARE', subSubj: 'E2204', subSubjDesc: 'Amortization-Software', enabled: true, startDate: '', endDate: '' },
    { id: 7, mainCat: '16', mainCatDesc: 'FURNITURE', subSubj: 'E2107', subSubjDesc: 'Dpm - Furniture and Fixture', enabled: true, startDate: '', endDate: '' },
    { id: 8, mainCat: '15', mainCatDesc: 'NET EQUIPMENT', subSubj: 'E2105', subSubjDesc: 'Dpm - Network Equipment', enabled: true, startDate: '', endDate: '' },
    { id: 9, mainCat: '14', mainCatDesc: 'SERVER', subSubj: 'E2106', subSubjDesc: 'Dpm - Server', enabled: true, startDate: '', endDate: '' },
    { id: 10, mainCat: '13', mainCatDesc: 'OFFICE EQUIPMENT', subSubj: 'E2104', subSubjDesc: 'Dpm - Office Equipment', enabled: true, startDate: '', endDate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
            <AntInput placeholder="请输入物料大类" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">子科目:</span>
            <AntInput placeholder="请输入子科目" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// 29. NO一级服务与科目映射
const NOServiceSubjectMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO一级服务', dataIndex: 'service' },
    { title: '板块', dataIndex: 'plate' },
    { title: '板块描述', dataIndex: 'plateDesc' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '科目', dataIndex: 'subject' },
    { title: '科目描述', dataIndex: 'subjectDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val ? '启用' : '停用' },
    { title: '启用日期', dataIndex: 'startDate' },
    { title: '停用日期', dataIndex: 'endDate' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  // Placeholder data for demonstration
  const data = [];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-24 text-right text-sm text-gray-600">NO一级服务:</span>
            <AntInput placeholder="请输入服务" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">板块:</span>
            <AntInput placeholder="请输入板块" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
            <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            <AntButton type="primary" className="ml-4" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          <AntButton type="default" icon={<Download size={14} className="rotate-180" />}>上传数据</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <div className="min-h-[200px]">
           <AntTable columns={columns} data={data} />
           {data.length === 0 && <div className="text-center py-10 text-gray-400">暂无数据</div>}
        </div>
      </div>
    </div>
  );
};

// 30. 员工与项目映射
const EmployeeProjectMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '员工编号', dataIndex: 'empNo' },
    { title: '员工姓名', dataIndex: 'empName' },
    { title: '项目名称', dataIndex: 'projName' }
  ];

  const data = [
    { id: 21, empNo: '219177', empName: '黄涛', projName: 'A项目' },
    { id: 22, empNo: '219153', empName: '王丽倩', projName: 'A项目' },
    { id: 23, empNo: '219138', empName: '熊立东', projName: 'A项目' },
    { id: 24, empNo: '219114', empName: '李梁', projName: 'A项目' },
    { id: 25, empNo: '219100', empName: '陈香玲', projName: 'A项目' },
    { id: 26, empNo: '219084', empName: '何立行', projName: 'A项目' },
    { id: 27, empNo: '219083', empName: '王曼', projName: 'A项目' },
    { id: 28, empNo: '219004', empName: '关洪皓月', projName: 'A项目' },
    { id: 29, empNo: '218952', empName: '皇甫铮', projName: 'A项目' },
    { id: 30, empNo: '218938', empName: '杨跃', projName: 'C项目' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
            <AntInput placeholder="请输入员工编号" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">员工姓名:</span>
            <AntInput placeholder="请输入员工姓名" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 text-right text-sm text-gray-600">项目名称:</span>
            <AntInput placeholder="请输入项目名称" />
          </div>
          <div className="flex items-center justify-end gap-2 xl:col-start-4">
            <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
          <AntButton type="default" icon={<Settings size={14} />}>配置</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      </div>
    </div>
  );
};

// --- Main Application Layout ---

export default function App() {
  const [activeMenu, setActiveMenu] = useState('业务配置');
  const [activeSubMenu, setActiveSubMenu] = useState('费用账户规则管理');
  const [activeTab, setActiveTab] = useState('费用账户规则');

  const baseDataTabs = ['物料综合集合', '物料大类', '物料小类', '品牌', '型号', '配置', 'NO服务'];
  const mappingTabs = ['办公区与仓库映射', 'PS新员工领用物料映射', 'NO地点与资产地点映射', '虚拟库管员映射', '板块与账簿映射'];
  const authTabs = ['公司板块提取资产权限', 'NO设备提取资产权限', '公司归属权限'];
  const warehouseTabs = ['仓库信息', '仓库用途', '仓库权限'];
  const locationTabs = ['地点基础数据维护'];
  const receiptRuleTabs = ['单据编号规则管理'];
  const accountingTabs = ['HR公司与财务公司映射', '部门与成本中心映射', '成本中心与板块映射', '城市与业务线映射', '部门与业务线映射'];
  
  // New Tabs definition
  const assetAllocationTabs = ['电脑配给方案', '影像器材配给方案', '配给规则'];
  const materialLimitTabs = ['超标规则'];
  const expenseAccountTabs = ['费用账户规则', '成本中心与科目映射', '物料大类与子目映射', 'NO一级服务与科目映射', '员工与项目映射'];
  const depreciationTabs = ['资产折旧规则管理'];
  const accountBookTabs = ['账套内容维护'];
  
  const tabs = activeSubMenu === '业务基础数据维护' ? baseDataTabs : 
               activeSubMenu === '业务映射规则管理' ? mappingTabs : 
               activeSubMenu === '业务权限规则管理' ? authTabs : 
               activeSubMenu === '仓库基础数据维护' ? warehouseTabs : 
               activeSubMenu === '地点基础数据维护' ? locationTabs : 
               activeSubMenu === '单据编号规则管理' ? receiptRuleTabs : 
               activeSubMenu === '会计映射规则管理' ? accountingTabs : 
               activeSubMenu === '资产配给规则管理' ? assetAllocationTabs : 
               activeSubMenu === '物资申请超标配置' ? materialLimitTabs : 
               activeSubMenu === '费用账户规则管理' ? expenseAccountTabs :
               activeSubMenu === '资产折旧规则管理' ? depreciationTabs : 
               activeSubMenu === '账套内容维护' ? accountBookTabs : [];

  const handleSubMenuClick = (sub) => {
    setActiveSubMenu(sub);
    if (sub === '业务基础数据维护') setActiveTab('物料综合集合');
    if (sub === '业务映射规则管理') setActiveTab('办公区与仓库映射');
    if (sub === '业务权限规则管理') setActiveTab('公司板块提取资产权限');
    if (sub === '仓库基础数据维护') setActiveTab('仓库信息');
    if (sub === '地点基础数据维护') setActiveTab('地点基础数据维护');
    if (sub === '单据编号规则管理') setActiveTab('单据编号规则管理');
    if (sub === '会计映射规则管理') setActiveTab('HR公司与财务公司映射');
    if (sub === '资产配给规则管理') setActiveTab('影像器材配给方案');
    if (sub === '物资申请超标配置') setActiveTab('超标规则');
    if (sub === '费用账户规则管理') setActiveTab('费用账户规则');
    if (sub === '资产折旧规则管理') setActiveTab('资产折旧规则管理');
    if (sub === '账套内容维护') setActiveTab('账套内容维护');
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] font-sans text-gray-800 overflow-hidden">
      
      {/* Sidebar (Sider) - Dark theme typical of Antd Pro */}
      <div className="w-56 bg-[#001529] text-white flex flex-col transition-all duration-300 shadow-xl z-20 relative">
        {/* Logo Area */}
        <div className="h-14 flex items-center gap-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.3)] z-10 bg-[#002140]">
          <div className="w-8 h-8 rounded bg-[#1677ff] flex items-center justify-center font-bold text-lg shadow-sm">
            E
          </div>
          <span className="font-semibold text-base tracking-wide text-white">企业资产管理系统</span>
        </div>

        {/* User Info Snippet (From screenshot upper left) */}
        <div className="py-4 px-5 border-b border-white/10 flex flex-col gap-1 text-sm bg-[#001529]">
          <div className="flex items-center gap-2 text-gray-300">
            <User size={14} />
            <span className="font-medium text-white">系统管理员 (admin)</span>
          </div>
          <div className="text-gray-400 text-xs ml-5">2026年05月27日 星期三</div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {[
            { id: '个人工作台', icon: <LayoutDashboard size={16} /> },
            { id: '资产管理', icon: <Monitor size={16} /> },
            { id: '无形资产', icon: <Layers size={16} /> },
            { id: '资产盘点', icon: <ClipboardList size={16} /> },
          ].map(item => (
             <div 
               key={item.id}
               className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm transition-colors hover:text-white ${activeMenu === item.id ? 'text-white bg-[#1677ff]' : 'text-gray-300 hover:bg-white/5'}`}
               onClick={() => setActiveMenu(item.id)}
             >
               {item.icon}
               <span>{item.id}</span>
             </div>
          ))}

          {/* Config Menu (Expanded state) */}
          <div className="mt-1">
            <div 
              className={`flex items-center justify-between px-5 py-3 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5`}
              onClick={() => setActiveMenu('业务配置')}
            >
              <div className="flex items-center gap-3">
                <Settings size={16} />
                <span>业务配置</span>
              </div>
              <ChevronDown size={14} className="transition-transform" />
            </div>
            
            {/* Sub-menu items */}
            <div className="bg-[#000c17] py-1">
              {[
                '业务基础数据维护',
                '业务映射规则管理',
                '业务权限规则管理',
                '仓库基础数据维护',
                '地点基础数据维护',
                '单据编号规则管理',
                '会计映射规则管理',
                '资产配给规则管理',
                '物资申请超标配置',
                '费用账户规则管理',
                '资产折旧规则管理',
                '账套内容维护',
                '结账基础数据维护',
                '单据调整规则管理',
              ].map(sub => (
                <div 
                  key={sub}
                  className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${activeSubMenu === sub ? 'text-white bg-[#1677ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  onClick={() => handleSubMenuClick(sub)}
                >
                  {sub}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        
        {/* Header / Top Navigation */}
        <div className="h-14 bg-white shadow-[0_1px_4px_rgba(0,21,41,0.08)] flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <div className="p-1 cursor-pointer text-gray-500 hover:bg-gray-100 rounded transition-colors">
              <Menu size={20} />
            </div>
            {/* Top Chrome Tabs (like old browser tabs in standard ERP) */}
            <div className="flex items-end h-full pt-3 gap-1">
               <div className="px-4 py-1.5 bg-[#fafafa] border border-b-0 border-[#f0f0f0] rounded-t-md text-sm text-gray-500 cursor-pointer flex items-center gap-2 hover:bg-gray-50">
                 我的资产
                 <XCircle size={12} className="hover:text-red-500" />
               </div>
               <div className="px-4 py-1.5 bg-[#e6f4ff] border border-b-0 border-[#1677ff] rounded-t-md text-sm text-[#1677ff] font-medium cursor-pointer flex items-center gap-2 relative top-[1px]">
                 {activeSubMenu}
                 <XCircle size={12} className="hover:text-[#1677ff]" />
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Bell size={18} className="cursor-pointer hover:text-gray-800 transition-colors" />
            <div className="w-7 h-7 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs shadow-sm cursor-pointer hover:opacity-90">
              A
            </div>
          </div>
        </div>

        {/* Page Content Container */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          
          {/* Breadcrumb / Page Title */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
             <span>首页</span>
             <ChevronRight size={14} />
             <span>业务配置</span>
             <ChevronRight size={14} />
             <span className="text-gray-800 font-medium">{activeSubMenu}</span>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-[#f0f0f0] min-h-[calc(100vh-140px)] flex flex-col">
            
            {/* Internal Sub-Tabs */}
            <div className="flex items-center border-b border-[#f0f0f0] px-4 pt-2 overflow-x-auto custom-scrollbar bg-white rounded-t-md">
              {tabs.map(tab => (
                <div 
                  key={tab}
                  className={`px-5 py-3 text-sm cursor-pointer whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#1677ff] font-medium' : 'text-gray-600 hover:text-[#1677ff]'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {/* Active Indicator Line */}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1677ff]" />
                  )}
                </div>
              ))}
            </div>

            {/* Sub-Tab Content Area */}
            <div className="p-4 md:p-5 bg-[#fafafa] flex-1">
              {/* 业务基础数据维护 */}
              {activeTab === '物料综合集合' && <MaterialComprehensiveView />}
              {activeTab === '物料大类' && <MaterialCategoryView />}
              {activeTab === '物料小类' && <MaterialSubCategoryView />}
              {activeTab === '品牌' && <BrandView />}
              {activeTab === '型号' && <ModelView />}
              {activeTab === '配置' && <ConfigView />}
              {activeTab === 'NO服务' && <NOServiceView />}
              
              {/* 业务映射规则管理 */}
              {activeTab === '办公区与仓库映射' && <OfficeWarehouseMappingView />}
              {activeTab === 'PS新员工领用物料映射' && <PSNewEmployeeMappingView />}
              {activeTab === 'NO地点与资产地点映射' && <NOLocationMappingView />}
              {activeTab === '虚拟库管员映射' && <VirtualWarehouseManagerMappingView />}
              {activeTab === '板块与账簿映射' && <PlateLedgerMappingView />}

              {/* 业务权限规则管理 */}
              {activeTab === '公司板块提取资产权限' && <CompanyPlateAssetAuthView />}
              {activeTab === 'NO设备提取资产权限' && <NODeviceAssetAuthView />}
              {activeTab === '公司归属权限' && <CompanyBelongingAuthView />}

              {/* 仓库基础数据维护 */}
              {activeTab === '仓库信息' && <WarehouseInfoView />}
              {activeTab === '仓库用途' && <WarehouseUsageView />}
              {activeTab === '仓库权限' && <WarehousePermissionView />}

              {/* 地点基础数据维护 */}
              {activeTab === '地点基础数据维护' && <LocationBasicDataView />}

              {/* 单据编号规则管理 */}
              {activeTab === '单据编号规则管理' && <ReceiptRuleManagementView />}

              {/* 会计映射规则管理 */}
              {activeTab === 'HR公司与财务公司映射' && <HRCompanyFinanceMappingView />}
              {activeTab === '部门与成本中心映射' && <DeptCostCenterMappingView />}
              {activeTab === '成本中心与板块映射' && <CostCenterPlateMappingView />}
              {activeTab === '城市与业务线映射' && <CityBusinessLineMappingView />}
              {activeTab === '部门与业务线映射' && <DeptBusinessLineMappingView />}

              {/* 追加的新配置页面 */}
              {activeTab === '影像器材配给方案' && <AssetAllocationRuleView />}
              {activeTab === '超标规则' && <MaterialRequestLimitView />}
              
              {/* 费用账户规则管理 */}
              {activeTab === '费用账户规则' && <ExpenseAccountRuleView />}
              {activeTab === '成本中心与科目映射' && <CostCenterSubjectMappingView />}
              {activeTab === '物料大类与子目映射' && <MaterialSubSubjectMappingView />}
              {activeTab === 'NO一级服务与科目映射' && <NOServiceSubjectMappingView />}
              {activeTab === '员工与项目映射' && <EmployeeProjectMappingView />}

              {activeTab === '资产折旧规则管理' && <AssetDepreciationRuleView />}
              {activeTab === '账套内容维护' && <AccountBookContentView />}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}