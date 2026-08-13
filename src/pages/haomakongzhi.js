import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { Plus } from 'lucide-react';
import QueryBar, { QueryItem } from '../components/QueryBar';
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

const EMPTY_MAIN_FILTERS = {
  keyword: '',
  authorizationStatus: '',
};

const EMPTY_USER_FILTERS = {
  id: '',
  name: '',
  dept: '',
};

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

function UserLinkModal({ open, onClose, linkedUsers, onConfirm }) {
  const [draftFilters, setDraftFilters] = useState(EMPTY_USER_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_USER_FILTERS);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (!open) return;
    setDraftFilters(EMPTY_USER_FILTERS);
    setAppliedFilters(EMPTY_USER_FILTERS);
    setSelectedKeys([...new Set(linkedUsers || [])]);
    setCurrentPage(1);
  }, [open, linkedUsers]);

  const filteredData = useMemo(() => mockAllUsers.filter((item) => (
    includesText(item.id, appliedFilters.id)
    && includesText(item.name, appliedFilters.name)
    && includesText(item.dept, appliedFilters.dept)
  )), [appliedFilters]);

  const handleSave = () => {
    onConfirm?.(selectedKeys);
    onClose();
  };

  const columns = [
    { title: '工号', dataIndex: 'id', width: 140 },
    { title: '姓名', dataIndex: 'name', width: 140 },
    { title: '部门', dataIndex: 'dept' },
  ];

  return (
    <Modal
      title="新增授权人员"
      open={open}
      width={820}
      onCancel={onClose}
      destroyOnHidden
      footer={(
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={handleSave}>确定</Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      )}
    >
      <QueryBar
        labelWidth={64}
        onQuery={() => {
          setAppliedFilters({ ...draftFilters });
          setCurrentPage(1);
        }}
        onReset={() => {
          setDraftFilters(EMPTY_USER_FILTERS);
          setAppliedFilters(EMPTY_USER_FILTERS);
          setCurrentPage(1);
        }}
      >
        <QueryItem label="工号" labelWidth={64}>
          <Input
            allowClear
            placeholder="请输入工号"
            value={draftFilters.id}
            onChange={(event) => setDraftFilters((current) => ({ ...current, id: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="姓名" labelWidth={64}>
          <Input
            allowClear
            placeholder="请输入姓名"
            value={draftFilters.name}
            onChange={(event) => setDraftFilters((current) => ({ ...current, name: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="部门" labelWidth={64}>
          <Input
            allowClear
            placeholder="请输入部门"
            value={draftFilters.dept}
            onChange={(event) => setDraftFilters((current) => ({ ...current, dept: event.target.value }))}
          />
        </QueryItem>
      </QueryBar>

      <div className="mb-3 flex justify-end">
        <Typography.Text type="secondary">已选 {selectedKeys.length} 人</Typography.Text>
      </div>

      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={filteredData}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          preserveSelectedRowKeys: true,
          onChange: setSelectedKeys,
        }}
        pagination={{
          current: currentPage,
          pageSize,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
          onChange: setCurrentPage,
        }}
        onRow={(record) => ({
          onClick: (event) => {
            if (event.target.closest('.ant-checkbox-wrapper')) return;
            setSelectedKeys((current) => current.includes(record.id)
              ? current.filter((id) => id !== record.id)
              : [...current, record.id]);
          },
          style: { cursor: 'pointer' },
        })}
      />
    </Modal>
  );
}

export default function ContractPermissionAdmin() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [data, setData] = useState(initialData);
  const [draftFilters, setDraftFilters] = useState(EMPTY_MAIN_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_MAIN_FILTERS);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredData = useMemo(() => data.filter((item) => {
    const keywordMatched = !appliedFilters.keyword
      || includesText(item.name, appliedFilters.keyword)
      || includesText(item.empId, appliedFilters.keyword);
    const statusMatched = !appliedFilters.authorizationStatus
      || (appliedFilters.authorizationStatus === '已授权' ? item.status : !item.status);
    return keywordMatched && statusMatched;
  }), [data, appliedFilters]);

  const handleToggleStatus = (empId, authorized) => {
    setData((current) => current.map((item) => (
      item.empId === empId ? { ...item, status: authorized } : item
    )));
    messageApi.success(authorized ? '已授权该员工的申请权限' : '已停止授权该员工的申请权限');
  };

  const handleSendNotification = (name) => {
    messageApi.success(`已成功向 ${name} 发送合约号码申请通知`);
  };

  const handleAddUsers = (selectedIds) => {
    const newUsers = selectedIds
      .filter((id) => !data.some((item) => item.empId === id))
      .map((id) => {
        const user = mockAllUsers.find((item) => item.id === id);
        if (!user) return null;
        return {
          key: `${Date.now()}-${id}`,
          empId: user.id,
          name: user.name,
          department: user.dept,
          status: true,
        };
      })
      .filter(Boolean);

    if (newUsers.length > 0) {
      setData((current) => [...newUsers, ...current]);
      messageApi.success(`已添加 ${newUsers.length} 名授权人员`);
      return;
    }
    messageApi.info('所选人员已在授权人员列表中');
  };

  const columns = [
    { title: '工号', dataIndex: 'empId', width: 150 },
    { title: '姓名', dataIndex: 'name', width: 150 },
    { title: '所属部门', dataIndex: 'department', minWidth: 260 },
    {
      title: '授权状态',
      dataIndex: 'status',
      width: 140,
      render: (value) => <StatusTag type="business" value={value ? '已授权' : '未授权'} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      fixed: 'right',
      render: (_, record) => (
        <Space size={12}>
          <Button
            type="link"
            size="small"
            className="px-0"
            disabled={!record.status}
            onClick={() => handleSendNotification(record.name)}
          >
            发送通知
          </Button>
          <Popconfirm
            title={record.status ? '确定停止该人员授权吗？' : '确定授权该人员吗？'}
            description={record.status ? '停止授权后，该人员将不能继续发起合约号码申请。' : '授权后，该人员可发起合约号码申请。'}
            okText="确定"
            cancelText="取消"
            okButtonProps={record.status ? { danger: true } : undefined}
            onConfirm={() => handleToggleStatus(record.empId, !record.status)}
          >
            <Button type="link" size="small" danger={record.status} className="px-0">
              {record.status ? '停止授权' : '授权'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">号码控制</Typography.Title>
        </div>

        <QueryBar
          onQuery={() => setAppliedFilters({ ...draftFilters })}
          onReset={() => {
            setDraftFilters(EMPTY_MAIN_FILTERS);
            setAppliedFilters(EMPTY_MAIN_FILTERS);
          }}
        >
          <QueryItem label="姓名/工号">
            <Input
              allowClear
              placeholder="请输入姓名或工号"
              value={draftFilters.keyword}
              onChange={(event) => setDraftFilters((current) => ({ ...current, keyword: event.target.value }))}
            />
          </QueryItem>
          <QueryItem label="授权状态">
            <Select
              allowClear
              placeholder="请选择授权状态"
              value={draftFilters.authorizationStatus || undefined}
              options={[
                { label: '已授权', value: '已授权' },
                { label: '未授权', value: '未授权' },
              ]}
              onChange={(value) => setDraftFilters((current) => ({ ...current, authorizationStatus: value || '' }))}
            />
          </QueryItem>
        </QueryBar>

        <Card
          size="small"
          title={<SectionTitle>授权人员列表</SectionTitle>}
          extra={<Typography.Text type="secondary">共 {filteredData.length} 条</Typography.Text>}
        >
          <div className="mb-3 flex justify-end">
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsModalVisible(true)}>
              新增授权人员
            </Button>
          </div>

          <Table
            rowKey="key"
            size="small"
            bordered
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>

        <UserLinkModal
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          linkedUsers={data.map((item) => item.empId)}
          onConfirm={handleAddUsers}
        />
      </Space>
    </>
  );
}
