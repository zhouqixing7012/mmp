import React, { useState } from 'react';
import { Button, Input, Select, Modal } from 'antd';
import { Plus, CheckCircle, XCircle, Search, X } from 'lucide-react';
import QueryBar, { QueryItem } from '../components/QueryBar';

// ==========================================
// 1. Mock Data
// ==========================================

const mockRoleData = [
  { id: 1, roleName: '系统管理员', duty: '管理系统配置和用户权限', users: ['张三', '李四'], menus: ['资产管理', '资产盘点', '系统管理'], status: '启用' },
  { id: 2, roleName: '资产管理员', duty: '管理企业资产信息', users: ['王五'], menus: ['资产管理', '资产盘点'], status: '启用' },
  { id: 3, roleName: '部门负责人', duty: '管理部门资产信息', users: ['赵六', '钱七'], menus: ['资产管理'], status: '启用' },
  { id: 4, roleName: '财务人员', duty: '管理财务相关信息', users: ['孙八'], menus: ['资产管理'], status: '停用' },
  { id: 5, roleName: '仓库管理员', duty: '管理仓库库存', users: ['周九'], menus: ['资产管理', '资产盘点'], status: '启用' },
];

const mockAllMenus = ['资产管理', '资产盘点', '报废管理', '无形资产', '业务配置', '系统配置'];

const mockAllUsers = [
  { id: '10001', name: '张三', dept: '集团总部' }, { id: '10002', name: '李四', dept: '集团总部' },
  { id: '10003', name: '王五', dept: '搜狐媒体' }, { id: '10004', name: '赵六', dept: '财务中心' },
  { id: '10005', name: '钱七', dept: '视频' }, { id: '10006', name: '孙八', dept: '法律中心' },
  { id: '10007', name: '周九', dept: '焦点' }, { id: '10008', name: '吴十', dept: '搜狐媒体' },
  { id: '10009', name: '郑十一', dept: '集团总部' },
];

const mockPermissionData = [
  { firstMenu: '资产分类', secondMenu: '资产分类管理', thirdMenu: '资产类别', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产分类', secondMenu: '资产分类管理', thirdMenu: '资产型号', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '启用', '停用'] },
  { firstMenu: '资产采购', secondMenu: '资产入库管理', thirdMenu: '采购申请', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '审批'] },
  { firstMenu: '资产采购', secondMenu: '资产入库管理', thirdMenu: '入库登记', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '生成单据'] },
  { firstMenu: '资产采购', secondMenu: '资产入库管理', thirdMenu: '供应商管理', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产领用', secondMenu: '资产领用管理', thirdMenu: '领用申请', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '审批'] },
  { firstMenu: '资产领用', secondMenu: '资产领用管理', thirdMenu: '领用登记', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '生成单据'] },
  { firstMenu: '资产领用', secondMenu: '资产领用管理', thirdMenu: '归还管理', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产盘点', secondMenu: '资产盘点管理', thirdMenu: '盘点计划', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产盘点', secondMenu: '资产盘点管理', thirdMenu: '盘点执行', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '生成报告'] },
  { firstMenu: '资产盘点', secondMenu: '资产盘点管理', thirdMenu: '盘点差异', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产维修', secondMenu: '资产维修管理', thirdMenu: '维修申请', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '审批'] },
  { firstMenu: '资产维修', secondMenu: '资产维修管理', thirdMenu: '维修记录', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '生成单据'] },
  { firstMenu: '资产维修', secondMenu: '资产维修管理', thirdMenu: '维修供应商', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产报废', secondMenu: '资产报废管理', thirdMenu: '报废申请', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '审批'] },
  { firstMenu: '资产报废', secondMenu: '资产报废管理', thirdMenu: '报废处理', features: ['查看', '编辑', '创建', '删除', '导入', '导出', '生成单据'] },
  { firstMenu: '资产报废', secondMenu: '资产报废管理', thirdMenu: '报废记录', features: ['查看', '编辑', '创建', '删除', '导入', '导出'] },
  { firstMenu: '资产报表', secondMenu: '资产报表管理', thirdMenu: '资产台账', features: ['查看', '导出', '生成报表'] },
  { firstMenu: '资产报表', secondMenu: '资产报表管理', thirdMenu: '资产统计', features: ['查看', '导出', '生成报表'] },
  { firstMenu: '资产报表', secondMenu: '资产报表管理', thirdMenu: '资产分析', features: ['查看', '导出', '生成报表'] },
  { firstMenu: '系统设置', secondMenu: '系统设置', thirdMenu: '用户管理', features: ['查看', '编辑', '创建', '删除'] },
  { firstMenu: '系统设置', secondMenu: '系统设置', thirdMenu: '角色管理', features: ['查看', '编辑', '创建', '删除'] },
  { firstMenu: '系统设置', secondMenu: '系统设置', thirdMenu: '权限配置', features: ['查看', '编辑'] },
];

// ==========================================
// 2. 新增角色弹窗
// ==========================================

function RoleAddModal({ open, onClose, editRecord }) {
  const isEdit = !!editRecord;
  const [values, setValues] = useState(
    editRecord || { roleName: '', duty: '', status: '启用' }
  );

  const handleSave = () => {
    if (!values.roleName) return;
    console.log(isEdit ? 'Edit role:' : 'Add role:', values);
    onClose();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={isEdit ? '编辑角色' : '新增角色'} width="800px" destroyOnClose>
      <div className="border border-[#e8e8e8] text-sm mb-4">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">
            <span className="text-red-500 mr-1">*</span>角色名称
          </div>
          <div className="w-[30%] p-2 border-r border-[#e8e8e8] flex items-center">
            <Input value={values.roleName} onChange={(e) => setValues({...values, roleName: e.target.value})} placeholder="请输入角色名称" />
          </div>
          <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">状态</div>
          <div className="w-[30%] p-2 flex items-center">
            <Select value={values.status} onChange={(val) => setValues({...values, status: val})} style={{ width: '100%' }}
              options={[{ label: '启用', value: '启用' }, { label: '停用', value: '停用' }]} />
          </div>
        </div>
        <div className="flex min-h-[40px]">
          <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">职责</div>
          <div className="w-[80%] p-2 flex items-center">
            <Input.TextArea rows={3} value={values.duty} onChange={(e) => setValues({...values, duty: e.target.value})} placeholder="请输入角色职责描述" />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <Button type="primary" onClick={handleSave} className="px-6">保存</Button>
        <Button type="default" onClick={onClose} className="px-6">返回</Button>
      </div>
    </Modal>
  );
}

// ==========================================
// 3. 关联用户弹窗
// ==========================================

function UserLinkModal({ open, onClose, roleName, linkedUsers, onConfirm }) {
  const [searchValues, setSearchValues] = useState({ id: '', name: '', dept: '' });
  const [selectedKeys, setSelectedKeys] = useState([...new Set(linkedUsers || [])]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredData = mockAllUsers.filter(item => {
    if (searchValues.id && !item.id.includes(searchValues.id)) return false;
    if (searchValues.name && !item.name.includes(searchValues.name)) return false;
    if (searchValues.dept && !item.dept.includes(searchValues.dept)) return false;
    return true;
  });

  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const currentPageKeys = paginatedData.map(u => u.id);
  const allSelected = currentPageKeys.length > 0 && currentPageKeys.every(id => selectedKeys.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys(selectedKeys.filter(id => !currentPageKeys.includes(id)));
    } else {
      const newKeys = [...selectedKeys];
      currentPageKeys.forEach(id => { if (!newKeys.includes(id)) newKeys.push(id); });
      setSelectedKeys(newKeys);
    }
  };

  const handleSave = () => {
    if (onConfirm) onConfirm(selectedKeys);
    onClose();
  };

  const toggleUser = (id) => {
    setSelectedKeys(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[1050] flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '800px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">关联用户 - {roleName}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">工号:</span>
              <input type="text" value={searchValues.id}
                onChange={(e) => { setSearchValues({...searchValues, id: e.target.value}); setCurrentPage(1); }}
                placeholder="请输入工号"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">姓名:</span>
              <input type="text" value={searchValues.name}
                onChange={(e) => { setSearchValues({...searchValues, name: e.target.value}); setCurrentPage(1); }}
                placeholder="请输入姓名"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all" />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">部门:</span>
              <input type="text" value={searchValues.dept}
                onChange={(e) => { setSearchValues({...searchValues, dept: e.target.value}); setCurrentPage(1); }}
                placeholder="请输入部门"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all" />
            </div>
            <div className="flex-1" />
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={allSelected}
                      onChange={handleSelectAll} />
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">工号</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">姓名</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">部门</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user) => {
                  const isChecked = selectedKeys.includes(user.id);
                  return (
                    <tr key={user.id}
                      className={'border-b border-[#f0f0f0] cursor-pointer transition-colors ' + (isChecked ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]')}
                      onClick={() => toggleUser(user.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="w-3.5 h-3.5" checked={isChecked}
                          onChange={() => toggleUser(user.id)} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1677ff]">{user.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.dept}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between pt-3 text-sm text-gray-500">
            <span>已选 {selectedKeys.length} 人</span>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-xs border border-[#d9d9d9] rounded hover:border-[#1677ff] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</button>
              <span>第 {currentPage}/{Math.max(totalPages, 1)} 页</span>
              <button className="px-2 py-1 text-xs border border-[#d9d9d9] rounded hover:border-[#1677ff] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>下一页</button>
              <span className="ml-1">共 {total} 条</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <Button type="primary" onClick={handleSave}>确定</Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. 菜单权限分配页面
// ==========================================

function PermissionAssignmentPage({ roleName, onClose, onSave }) {
  const firstMenus = ['资产总览', '资产分类', '资产采购', '资产领用', '资产盘点', '资产维修', '资产报废', '资产报表', '系统设置'];
  const [activeFirstMenu, setActiveFirstMenu] = useState('资产分类');
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());

  const filteredData = mockPermissionData.filter(row => row.firstMenu === activeFirstMenu);

  const makeKey = (row, feature) => row.secondMenu + '|' + row.thirdMenu + '|' + feature;

  const toggleFeature = (row, feature) => {
    const key = makeKey(row, feature);
    setSelectedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const isRowAllSelected = (row) =>
    row.features.every(f => selectedFeatures.has(makeKey(row, f)));

  const toggleRow = (row) => {
    setSelectedFeatures(prev => {
      const next = new Set(prev);
      const allSelected = isRowAllSelected(row);
      row.features.forEach(f => {
        if (allSelected) next.delete(makeKey(row, f));
        else next.add(makeKey(row, f));
      });
      return next;
    });
  };

  const allVisibleSelected = filteredData.length > 0 &&
    filteredData.every(row => row.features.every(f => selectedFeatures.has(makeKey(row, f))));

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedFeatures(prev => {
        const next = new Set(prev);
        filteredData.forEach(row => row.features.forEach(f => next.delete(makeKey(row, f))));
        return next;
      });
    } else {
      setSelectedFeatures(prev => {
        const next = new Set(prev);
        filteredData.forEach(row => row.features.forEach(f => next.add(makeKey(row, f))));
        return next;
      });
    }
  };

  const handleSave = () => {
    if (onSave) onSave(selectedFeatures);
    onClose();
  };

  const validFirstMenus = firstMenus.filter(m => mockPermissionData.some(r => r.firstMenu === m));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center border-b border-[#f0f0f0] bg-white rounded-t-md overflow-x-auto">
        {validFirstMenus.map(menu => (
          <div key={menu}
            className={'px-5 py-3 text-sm cursor-pointer whitespace-nowrap transition-colors relative ' + (activeFirstMenu === menu ? 'text-[#1677ff] font-medium' : 'text-gray-600 hover:text-[#1677ff]')}
            onClick={() => setActiveFirstMenu(menu)}
          >
            {menu}
            {activeFirstMenu === menu && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1677ff]" />}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">资产权限</h2>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={allVisibleSelected} onChange={handleSelectAll} />
          全选
        </label>
      </div>
      {filteredData.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-12">暂无数据</div>
      ) : (
        <div className="border border-[#f0f0f0] rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                <th className="px-4 py-3 text-sm font-semibold text-gray-800 w-[180px]">二级菜单</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-800 w-[180px]">三级菜单</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-800">功能点</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className={'border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ' + (idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]')}>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.secondMenu}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.thirdMenu}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-4">
                      {row.features.map(feature => {
                        const checked = selectedFeatures.has(makeKey(row, feature));
                        return (
                          <label key={feature} className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#1677ff]"
                            onClick={() => toggleFeature(row, feature)}>
                            <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" checked={checked} readOnly />
                            <span className={'text-sm ' + (checked ? 'text-[#1677ff] font-medium' : 'text-gray-600')}>{feature}</span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-center gap-3 pt-2">
        <Button type="primary" onClick={handleSave} className="px-6">确定</Button>
        <Button type="default" onClick={onClose} className="px-6">取消</Button>
      </div>
    </div>
  );
}

// ==========================================
// 5. 主组件：角色管理
// ==========================================

export default function RoleManagementView() {
  const [viewMode, setViewMode] = useState('list');
  const [permRole, setPermRole] = useState(null);
  const [query, setQuery] = useState({ roleName: '', enabled: '' });
  const [filteredData, setFilteredData] = useState(mockRoleData);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [linkUserRole, setLinkUserRole] = useState(null);

  if (viewMode === 'permission' && permRole) {
    return (
      <PermissionAssignmentPage
        roleName={permRole.roleName}
        onClose={() => { setPermRole(null); setViewMode('list'); }}
        onSave={(features) => {
          console.log('Saved permissions for', permRole.roleName, features);
          setPermRole(null);
          setViewMode('list');
        }}
      />
    );
  }

  const handleQuery = () => {
    let result = mockRoleData;
    if (query.roleName) {
      result = result.filter(r => r.roleName.includes(query.roleName));
    }
    if (query.enabled === '1') {
      result = result.filter(r => r.status === '启用');
    } else if (query.enabled === '0') {
      result = result.filter(r => r.status === '停用');
    }
    setFilteredData(result);
  };

  const handleReset = () => {
    setQuery({ roleName: '', enabled: '' });
    setFilteredData(mockRoleData);
  };

  const columns = [
    { title: '角色名称', dataIndex: 'roleName', key: 'roleName', width: 150 },
    { title: '职责', dataIndex: 'duty', key: 'duty', width: 250 },
    {
      title: '关联用户', dataIndex: 'users', key: 'users', width: 250,
      render: (users, record) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700 truncate max-w-[160px]">
            {users && users.length > 0 ? users.join(', ') : '-'}
          </span>
          <Button type="link" size="small" onClick={() => setLinkUserRole(record)}>
            关联
          </Button>
        </div>
      ),
    },
    {
      title: '菜单权限', dataIndex: 'menus', key: 'menus', width: 300,
      render: (menus, record) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700 truncate max-w-[200px]">
            {menus && menus.length > 0 ? menus.join(', ') : '-'}
          </span>
          <Button type="link" size="small" onClick={() => { setPermRole(record); setViewMode('permission'); }}>
            分配
          </Button>
        </div>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status) => (
        <span className={'px-2 py-0.5 rounded text-xs ' + (status === '启用' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{status}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar
        buttons={
          <Button type="primary" icon={<Search size={14} />} onClick={handleQuery}>
            查询
          </Button>
        }
      >
        <QueryItem label="角色名称">
          <Input placeholder="请输入角色名称" value={query.roleName}
            onChange={(e) => setQuery({...query, roleName: e.target.value})} />
        </QueryItem>
        <QueryItem label="是否启用">
          <Select allowClear placeholder="全部" value={query.enabled || undefined}
            onChange={(val) => setQuery({...query, enabled: val || ''})}
            options={[
              { label: '启用', value: '1' },
              { label: '停用', value: '0' },
            ]}
            style={{ width: '100%' }} />
        </QueryItem>
      </QueryBar>

      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditRecord(null); setAddModalOpen(true); }}>
            新增
          </Button>
          <Button type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</Button>
          <Button type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</Button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <th className="px-4 py-3 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
              {columns.map(col => (
                <th key={col.key || col.dataIndex} className="px-4 py-3 text-xs font-semibold text-gray-600">{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredData.map(record => (
              <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="py-2.5 px-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="py-2.5 px-3 text-gray-800">{record.roleName}</td>
                <td className="py-2.5 px-3 text-gray-600">{record.duty}</td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 truncate max-w-[160px]">{record.users && record.users.length > 0 ? record.users.join(', ') : '-'}</span>
                    <Button type="link" size="small" onClick={() => setLinkUserRole(record)}>关联</Button>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 truncate max-w-[200px]">{record.menus && record.menus.length > 0 ? record.menus.join(', ') : '-'}</span>
                    <Button type="link" size="small" onClick={() => { setPermRole(record); setViewMode('permission'); }}>分配</Button>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <span className={'px-2 py-0.5 rounded text-xs ' + (record.status === '启用' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{record.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-3 border-t border-gray-100 flex justify-end text-sm text-gray-500 bg-white">
          共 {filteredData.length} 条记录
        </div>
      </div>

      <RoleAddModal open={addModalOpen} onClose={() => setAddModalOpen(false)} editRecord={editRecord} />
      {linkUserRole && (
        <UserLinkModal
          open={!!linkUserRole}
          onClose={() => setLinkUserRole(null)}
          roleName={linkUserRole?.roleName}
          linkedUsers={linkUserRole?.users}
        />
      )}
    </div>
  );
}
