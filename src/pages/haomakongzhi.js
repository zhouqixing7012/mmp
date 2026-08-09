import React, { useState } from 'react';
import { Table, Button, Space, Input, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, BellOutlined } from '@ant-design/icons';
import { X } from 'lucide-react';
import StatusTag from '../components/StatusTag';

const initialData = [
  { key: '1', empId: '200620', name: '王英', department: '员工服务中心', status: true },
  { key: '2', empId: '213852', name: '孙志强', department: '前端架构组', status: true },
  { key: '3', empId: '210001', name: '李明', department: '财务部', status: false },
  { key: '4', empId: '220784', name: '周琦星', department: '市场营销中心', status: true },
];

const mockAllUsers = [
  { id: '200620', name: '王英', dept: '员工服务中心' },
  { id: '213852', name: '孙志强', dept: '前端架构组' },
  { id: '210001', name: '李明', dept: '财务部' },
  { id: '220784', name: '周琦星', dept: '市场营销中心' },
  { id: '208811', name: '张三', dept: '后端业务组' },
  { id: '208812', name: '李四', dept: '资产管理部' },
  { id: '208813', name: '王五', dept: '安全中心' },
];

function UserLinkModal({ open, onClose, linkedUsers, onConfirm }) {
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
          <span className="font-medium text-gray-800">新增授权人员</span>
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

const ContractPermissionAdmin = () => {
  const [data, setData] = useState(initialData);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleToggleStatus = (empId, checked) => {
    const newData = data.map(item => {
      if (item.empId === empId) {
        return { ...item, status: checked };
      }
      return item;
    });
    setData(newData);
    message.success(`已${checked ? '启用' : '停用'}该员工的申请权限`);
  };

  const handleSendNotification = (name) => {
    message.success(`已成功向 ${name} 发送合约号码申请通知！`);
  };

  const handleAddUsers = (selectedIds) => {
    const newUsers = selectedIds
      .filter(id => !data.some(item => item.empId === id))
      .map(id => {
        const user = mockAllUsers.find(u => u.id === id);
        if (!user) return null;
        return {
          key: Date.now().toString() + id,
          empId: user.id,
          name: user.name,
          department: user.dept,
          status: true,
        };
      })
      .filter(Boolean);

    if (newUsers.length > 0) {
      setData([...newUsers, ...data]);
      message.success(`已添加 ${newUsers.length} 名授权人员`);
    } else {
      message.info('所选人员已在白名单中');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: '工号',
      dataIndex: 'empId',
      key: 'empId',
      render: (text) => <span className="text-gray-500 font-mono">{text}</span>,
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue" bordered={false}>{text}</Tag>,
    },
    {
      title: '权限状态',
      key: 'status',
      render: (_, record) => (
        <StatusTag value={record.status} type="enabled" />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<BellOutlined />}
            onClick={() => handleSendNotification(record.name)}
            disabled={!record.status} className="px-0">
            发送通知
          </Button>
          <Popconfirm
            title={record.status ? '确定要停用该人员吗？' : '确定要启用该人员吗？'}
            onConfirm={() => handleToggleStatus(record.empId, !record.status)}
            okText="确定" cancelText="取消"
          >
            <Button type="link" danger={record.status}
              className={`px-0 ${record.status ? 'text-orange-500' : 'text-green-600'}`}>
              {record.status ? '停用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item =>
    item.name.includes(searchText) || item.empId.includes(searchText)
  );

  return (
    <div className="h-full bg-[#f0f2f5] p-6 text-[14px] overflow-auto">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">合约号码申请人员管理</h1>
          <p className="text-gray-500">管理允许填写合约号码申请表单的人员白名单，控制权限开关，并可一键发送填报邀请通知。</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6">
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="按姓名或工号搜索..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-72"
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              新增授权人员
            </Button>
          </div>
          <Table columns={columns} dataSource={filteredData}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            className="border border-[#f0f0f0] rounded-md overflow-hidden"
          />
        </div>
        <UserLinkModal
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          linkedUsers={data.map(item => item.empId)}
          onConfirm={handleAddUsers}
        />
      </div>
    </div>
  );
};

export default ContractPermissionAdmin;
