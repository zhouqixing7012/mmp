import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Menu,
  Bell,
  Monitor,
  Layers,
  ClipboardList,
  Settings,
  ShieldCheck,
  UserCircle,
  X,
  LayoutDashboard,
  Plus,
  Download,
  Upload,
  Network,
  Building2,
  FolderOpen,
  History,
  Camera,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { Input, Select } from 'antd';

// --- 统一的Ant Button组件 ---
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

// ==========================================
// 1. 模拟数据 (Mock Data)
// ==========================================

const mockTreeData = [
  {
    key: 'D0001',
    title: '搜狐集团 (D0001)',
    type: '公司',
    direct: 1,
    total: 2743,
    leader: '张朝阳',
        leaderCode: '10001',
    code: 'D0001',
    status: '已启用',
    children: [
      {
        key: 'D0002',
        title: '集团总部',
        type: '部门',
        direct: 0,
        total: 543,
        leader: '张朝阳',
        leaderCode: '10001',
        code: 'D0002',
        status: '已启用',
        parentCode: 'D0001',
        children: [
          { key: 'D0003', title: '财务中心', type: '部门', direct: 0, total: 45, leader: '李明', leaderCode: '10003', code: 'D0003', status: '已启用', parentCode: 'D0002' },
          { key: 'D0004', title: '法律中心', type: '部门', direct: 0, total: 12, leader: '王强', leaderCode: '10004', code: 'D0004', status: '已启用', parentCode: 'D0002' },
        ]
      },
      {
        key: 'D0161',
        title: '搜狐媒体',
        type: '部门',
        direct: 0,
        total: 1357,
        leader: '张朝阳',
        leaderCode: '10001',
        code: 'D0161',
        status: '已启用',
        parentCode: 'D0001',
      },
      {
        key: 'D0717',
        title: '视频',
        type: '部门',
        direct: 0,
        total: 797,
        leader: '张朝阳',
        leaderCode: '10001',
        code: 'D0717',
        status: '已启用',
        parentCode: 'D0001',
      },
      {
        key: 'D0841',
        title: '焦点',
        type: '部门',
        direct: 0,
        total: 45,
        leader: '张雪梅',
        leaderCode: '10002',
        code: 'D0841',
        status: '已启用',
        parentCode: 'D0001',
      }
    ]
  }
];

const mockUserData = [
  { id: '117687', name: '苑竹', email: 'zhuyuan@sohu-inc.com', level: '5', isTech: '否', dept: '集团总部', deptCode: 'D0159', empStatus: 'employed', usageStatus: 'active' },
  { id: '201672', name: '罗励瑶', email: 'maijinluo@sohu-inc.com', level: '4B', isTech: '是', dept: '集团总部', deptCode: 'D0101', empStatus: 'employed', usageStatus: 'active' },
  { id: '120074', name: '包亦未', email: 'adabao@sohu-inc.com', level: '4B', isTech: '否', dept: '集团总部', deptCode: 'D0156', empStatus: 'employed', usageStatus: 'active' },
  { id: '130008', name: '易志群', email: 'annieyi@sohu-inc.com', level: '4B', isTech: '是', dept: '集团总部', deptCode: 'D0152', empStatus: 'employed', usageStatus: 'active' },
  { id: '200026', name: '陈菁', email: 'millychen@sohu-inc.com', level: '4A', isTech: '否', dept: '集团总部', deptCode: 'D0159', empStatus: 'resigned', usageStatus: 'inactive' },
  { id: '214644', name: '姜珊', email: 'shanjiang214644@sohu-inc.com', level: '3B', isTech: '是', dept: '集团总部', deptCode: 'D0159', empStatus: 'employed', usageStatus: 'active' },
];

const mockUserDetail = {
  name: '杨',
  dept: 'D3879 焦点产研部',
  loginName: '999999',
  mobile: '',
  roles: '',
  level: '2B',
  company: '203 焦点新干线',
  costCenter: '',
  hrCompany: 'F.I.T.北京焦点新干线信息技术有限公司',
  fullDeptName: '焦点-焦点产研部',
  office: 'L003 北京-融科大厦C座',
  position: 'JC0456 高级电商专员',
  phone: '18805025056',
  statusValid: '无效',
  gender: '女',
  email: 'weiyang205266@sohu-inc.com',
  manager: '117313 李少鹏',
  jobCategory: '',
  jobSubCategory: '',
  plate: 'SAAS',
  proj: 'P001_项目A'
};


// ==========================================
// 2. 左侧树组件 (用于用户管理)
// ==========================================
const SidebarTreeNode = ({ node, level = 0, expandedKeys, toggleExpand, selectedKey, setSelectedKey }) => {
  const isExpanded = expandedKeys.includes(node.key);
  const isSelected = selectedKey === node.key;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-2 cursor-pointer hover:bg-gray-100 rounded-md text-sm transition-colors
          ${isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setSelectedKey(node.key)}
      >
        <span 
          className="w-5 h-5 flex items-center justify-center mr-1"
          onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggleExpand(node.key); } }}
        >
          {hasChildren ? (isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />) : (<span className="w-[14px]"></span>)}
        </span>
        <span className="truncate select-none">{node.title}</span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <SidebarTreeNode 
              key={child.key} node={child} level={level + 1} expandedKeys={expandedKeys} 
              toggleExpand={toggleExpand} selectedKey={selectedKey} setSelectedKey={setSelectedKey}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// ==========================================
// 3. 页面容器与各个子视图
// ==========================================
const OrgManagementView = () => {
  const [tableExpandedKeys, setTableExpandedKeys] = useState(['D0001']);
  const [query, setQuery] = useState({ code: '', name: '', fullName: '', enabled: '' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const toggleTableExpand = (key) => setTableExpandedKeys(prev => 
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );

  const getFlattenedData = (nodes, level = 0, parentExpanded = true, parentPath = '') => {
    let result = [];
    nodes.forEach(node => {
      const isExpanded = tableExpandedKeys.includes(node.key);
      const isVisible = parentExpanded;
      const cleanTitle = node.title.replace(/\s*\([^)]*\)\s*$/, '').trim();
      if (isVisible) {
        result.push({
          ...node, 
          level, 
          isExpanded, 
          fullName: parentPath ? parentPath + '/' + cleanTitle : cleanTitle 
        });
      }
      if (node.children) {
        result = result.concat(
          getFlattenedData(node.children, level + 1, isVisible && isExpanded, 
            parentPath ? parentPath + '/' + cleanTitle : cleanTitle)
        );
      }
    });
    return result;
  };
  const flatOrgData = getFlattenedData(mockTreeData);
  
  const filteredData = flatOrgData.filter(node => {
    if (query.code && !node.code.toLowerCase().includes(query.code.toLowerCase())) return false;
    if (query.name && !node.title.toLowerCase().includes(query.name.toLowerCase())) return false;
    if (query.fullName && !node.fullName.toLowerCase().includes(query.fullName.toLowerCase())) return false;
    if (query.enabled) {
      if (query.enabled === '1' && node.status !== '已启用') return false;
      if (query.enabled === '0' && node.status === '已启用') return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#f0f0f0] rounded p-4">
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                <span className="w-24 text-right text-sm text-gray-600 shrink-0">组织编码:</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input placeholder="请输入组织编码" value={query.code} onChange={(e) => setQuery({...query, code: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                <span className="w-24 text-right text-sm text-gray-600 shrink-0">组织名称:</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input placeholder="请输入组织名称" value={query.name} onChange={(e) => setQuery({...query, name: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                <span className="w-24 text-right text-sm text-gray-600 shrink-0">组织全称:</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input placeholder="请输入组织全称" value={query.fullName} onChange={(e) => setQuery({...query, fullName: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                <span className="w-24 text-right text-sm text-gray-600 shrink-0">是否启用:</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Select placeholder="全部" allowClear value={query.enabled || undefined} onChange={(v) => setQuery({...query, enabled: v || ''})} style={{ width: '100%' }} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 80, justifyContent: 'center' }}>
            <AntButton type="primary" icon={<Search size={14} />}>查询</AntButton>
            <AntButton type="default" onClick={() => setQuery({ code: '', name: '', fullName: '', enabled: '' })}>重置</AntButton>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#fafafa] z-10 shadow-sm">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600">组织名称</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600">组织编码</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600">部门负责人</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600">部门全称</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600">上级部门编码</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredData.map((node, index) => {
                const hasChildren = node.children && node.children.length > 0;
                return (
                  <tr key={node.key} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-gray-300 text-xs mr-2">{index + 1}</span>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center" style={{ paddingLeft: `${node.level * 24}px` }}>
                        <span 
                          className="w-5 h-5 flex items-center justify-center mr-1 cursor-pointer"
                          onClick={() => { if(hasChildren) toggleTableExpand(node.key); }}
                        >
                          {hasChildren ? (
                            node.isExpanded ? <ChevronDown size={14} className="text-gray-500 hover:text-blue-500" /> 
                                            : <ChevronRight size={14} className="text-gray-500 hover:text-blue-500" />
                          ) : <span className="w-[14px]"></span>}
                        </span>
                        {node.type === '公司' ? (
                           <Building2 size={16} className="text-[#1677ff] mr-2" />
                        ) : (
                           <FolderOpen size={16} className="text-yellow-500 mr-2" />
                        )}
                        <span className="font-medium text-gray-800">{node.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{node.code}</td>
                    <td className="py-2.5 px-4 text-gray-600">{node.leader}{node.leaderCode ? " (" + node.leaderCode + ")" : ""}</td>
                    <td className="py-2.5 px-4 text-gray-600">{node.fullName}</td>
                    <td className="py-2.5 px-4 text-gray-600">{node.parentCode || '-'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${node.status === '已启用' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{node.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-gray-100 flex justify-end text-sm text-gray-500 bg-white">
          共 {filteredData.length} 条记录
        </div>
      </div>
    </div>
  );
};


const UserManagementView = () => {
  const [viewingUserId, setViewingUserId] = useState(null); // null 或者 用户ID

  // --- 用户管理视图所需 State ---
 const [expandedKeys, setExpandedKeys] = useState(['D0001', 'D0002']);
  const [selectedKey, setSelectedKey] = useState('D0002');
  const [selectedRows, setSelectedRows] = useState([]);
 if (viewingUserId) {
    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 flex flex-col h-full overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-6">用户信息</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm flex-1">
          {/* 左侧列 */}
          <div className="space-y-6">
            <div className="flex"><div className="w-24 text-gray-500">姓名</div><div className="flex-1 text-gray-900 font-medium">{mockUserDetail.name}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">所在部门</div><div className="flex-1 text-gray-900">{mockUserDetail.dept}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">登录名</div><div className="flex-1 text-gray-900">{mockUserDetail.loginName}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">移动电话</div><div className="flex-1 text-gray-900">{mockUserDetail.mobile || '-'}</div></div>
           <div className="flex"><div className="w-24 text-gray-500">拥有的角色</div><div className="flex-1 text-gray-900">{mockUserDetail.roles || '-'}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">员工职级</div><div className="flex-1 text-gray-900">{mockUserDetail.level}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">公司</div><div className="flex-1 text-gray-900">{mockUserDetail.company}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">成本中心</div><div className="flex-1 text-gray-900">{mockUserDetail.costCenter || '-'}</div></div>
           <div className="flex"><div className="w-24 text-gray-500">HR公司</div><div className="flex-1 text-gray-900">{mockUserDetail.hrCompany}</div></div>
           <div className="flex"><div className="w-24 text-gray-500">部门全称</div><div className="flex-1 text-gray-900">{mockUserDetail.fullDeptName}</div></div>
           <div className="flex"><div className="w-24 text-gray-500">办公区</div><div className="flex-1 text-gray-900">{mockUserDetail.office}</div></div>
           <div className="flex"><div className="w-24 text-gray-500">职位</div><div className="flex-1 text-gray-900">{mockUserDetail.position}</div></div>
          </div>
          {/* 右侧列 */}
          <div className="space-y-6">
            <div className="flex"><div className="w-24 text-gray-500">联系电话</div><div className="flex-1 text-gray-900">{mockUserDetail.phone}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">状态有效</div><div className="flex-1 text-gray-900">{mockUserDetail.statusValid}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">性别</div><div className="flex-1 text-gray-900">{mockUserDetail.gender}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">Email地址</div><div className="flex-1 text-gray-900">{mockUserDetail.email}</div></div>
           <div className="flex"><div className="w-24 text-gray-500">职目</div><div className="flex-1 text-gray-900">{mockUserDetail.jobSubCategory || '-'}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">上级领导</div><div className="flex-1 text-gray-900">{mockUserDetail.manager}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">板块</div><div className="flex-1 text-gray-900">{mockUserDetail.plate || '-'}</div></div>
            <div className="flex"><div className="w-24 text-gray-500">项目</div><div className="flex-1 text-gray-900">{mockUserDetail.proj || '-'}</div></div>
         </div>
       </div>

        <div className="mt-8 flex justify-center pt-4 border-t border-gray-100">
          <AntButton
            type="default"
            onClick={() => setViewingUserId(null)}
          >
            返回
          </AntButton>
        </div>
      </div>
    );
  }

 return (
    <div className="absolute inset-0 flex">
           {/* 左侧架构树 */}
            <div className="w-64 border-r border-gray-200 flex flex-col bg-white shrink-0">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <input type="text" placeholder="输入组织关键字" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"/>
                  <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {mockTreeData.map(node => (
                  <SidebarTreeNode 
                    key={node.key} node={node} 
                    expandedKeys={expandedKeys} toggleExpand={(k) => setExpandedKeys(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k])}
                    selectedKey={selectedKey} setSelectedKey={setSelectedKey}
                  />
                ))}
              </div>
            </div>

            {/* 右侧用户表格 */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
                <input type="text" placeholder="请输入员工姓名" className="w-48 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <AntButton type="primary" icon={<Search size={14} />}>查询</AntButton>
              </div>
              
              <div className="px-4 py-3 flex gap-2">
                <AntButton type="primary" icon={<Plus size={14} />}>新增人员</AntButton>
                <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
                <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
                <AntButton type="default" icon={<Trash2 size={14} />}>批量删除</AntButton>
              </div>

              <div className="flex-1 overflow-auto px-4 pb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-gray-200">
                      <th className="py-3 px-3 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                      <th className="py-3 px-3 text-xs font-semibold text-gray-600">工号</th>
                      <th className="py-3 px-3 text-xs font-semibold text-gray-600">姓名</th>
                      <th className="py-3 px-3 text-xs font-semibold text-gray-600">邮箱</th>
                     <th className="py-3 px-3 text-xs font-semibold text-gray-600">职级</th>
                      <th className="py-3 px-3 text-xs font-semibold text-gray-600">部门</th>
                     <th className="py-3 px-3 text-xs font-semibold text-gray-600">使用状态</th>
                      <th className="py-3 px-3 text-xs font-semibold text-gray-600 text-right">角色</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {mockUserData.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/50">
                        <td className="py-2.5 px-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="py-2.5 px-3">
                          {/* 将工号设置为超链接 */}
                          <a 
                            onClick={() => setViewingUserId(user.id)}
                            className="text-[#1677ff] hover:underline cursor-pointer font-medium"
                          >
                            {user.id}
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-gray-800">{user.name}</td>
                        <td className="py-2.5 px-3 text-gray-500">{user.email}</td>
                       <td className="py-2.5 px-3 text-gray-600">{user.level}</td>
                        <td className="py-2.5 px-3 text-gray-600">{user.dept}</td>
                       <td className="py-2.5 px-3">
                         <span className={`px-2 py-0.5 rounded text-xs ${user.usageStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {user.usageStatus === 'active' ? '启用' : '停用'}
                         </span>
                       </td>
                       <td className="py-2.5 px-3 text-right">
                           <AntButton type="link">分配</AntButton>
                       </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
         </div>
 );
};



// ==========================================
// 4. 主组件：整体系统框架布局 (Layout)
// ==========================================
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(['system']);
  
  const toggleSidebarMenu = (key) => setExpandedMenus(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] font-sans overflow-hidden text-gray-800">
      
      {/* 侧边栏 Sidebar */}
      <div className={`${sidebarOpen ? 'w-[220px]' : 'w-16'} transition-all duration-300 bg-[#001529] text-gray-300 flex flex-col z-20 shrink-0`}>
        {/* Logo 区域 */}
        <div className="h-14 flex items-center justify-center bg-[#002140] text-white">
          <div className="w-8 h-8 bg-blue-600 text-white font-bold rounded flex items-center justify-center text-lg shadow-sm">E</div>
          {sidebarOpen && <span className="ml-3 font-semibold text-sm tracking-wide whitespace-nowrap">企业资产管理系统</span>}
        </div>

        {/* 导航菜单 */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-none mt-4">
          <div className="px-2 space-y-1">
            <div className="flex items-center px-3 py-2.5 rounded text-sm hover:text-white hover:bg-[#1677ff]/10 cursor-pointer transition-colors">
              <LayoutDashboard size={18} className={sidebarOpen ? "mr-3" : "mx-auto"} />
              {sidebarOpen && <span>个人工作台</span>}
            </div>
            {/* ... 其它菜单省略以保持简洁 ... */}

            {/* 系统管理 (展开状态) */}
            <div>
              <div 
                className={`flex items-center justify-between px-3 py-2.5 rounded text-sm cursor-pointer transition-colors
                  ${expandedMenus.includes('system') ? 'text-white' : 'hover:text-white hover:bg-[#1677ff]/10'}`}
                onClick={() => toggleSidebarMenu('system')}
              >
                <div className="flex items-center">
                  <ShieldCheck size={18} className={sidebarOpen ? "mr-3 text-blue-500" : "mx-auto text-blue-500"} />
                  {sidebarOpen && <span className="font-medium">系统管理</span>}
                </div>
                {sidebarOpen && <ChevronDown size={14} className={`transform transition-transform ${expandedMenus.includes('system') ? 'rotate-180' : ''}`} />}
              </div>
              
              {/* 子菜单 */}
              {sidebarOpen && expandedMenus.includes('system') && (
                <div className="mt-1 mb-2 space-y-1">
                  <div className="pl-11 pr-3 py-2.5 rounded text-sm cursor-pointer transition-colors bg-[#1677ff] text-white">
                    组织与用户管理
                  </div>
                  <div className="pl-11 pr-3 py-2.5 rounded text-sm text-gray-400 hover:text-white hover:bg-[#1677ff]/10 cursor-pointer">
                    角色权限管理
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f0f2f5]">
        
        {/* 顶部 Header */}
        <header className="bg-white h-14 flex items-center justify-between px-4 border-b border-gray-200 shadow-sm z-10 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors mr-4">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-end h-full pt-3 space-x-1">
              <div className="px-4 py-2 bg-white border border-gray-200 border-b-white rounded-t-md text-sm text-blue-600 font-medium flex items-center cursor-pointer relative top-[1px]">
                组织与用户管理 <X size={14} className="ml-2 text-blue-400 hover:text-blue-600" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 rounded-t-md"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </header>

        {/* 内容滚动区 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
          <div className="text-sm text-gray-500 mb-4 flex items-center">
            <span>首页</span><ChevronRight size={14} className="mx-1" />
            <span>系统管理</span><ChevronRight size={14} className="mx-1" />
            <span className="text-gray-800 font-medium">组织与用户管理</span>
          </div>

          {/* 注入业务组件 */}
          <div className="flex-1 min-h-[500px]">
              <UserManagementView />
          </div>
        </main>

      </div>
    </div>
  );
}

export { UserManagementView, OrgManagementView };

export default UserManagementView;
