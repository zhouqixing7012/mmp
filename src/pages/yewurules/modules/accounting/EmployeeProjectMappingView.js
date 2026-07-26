import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button, Input, Table } from 'antd';
import QueryBar from '../../../../components/QueryBar';
import { mockEmployeeProjectMappingData } from '../../../../mock/businessRulesMock';

const EmployeeProjectMappingView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '员工编号', dataIndex: 'empNo' },
    { title: '员工姓名', dataIndex: 'empName' },
    { title: '项目名称', dataIndex: 'projName' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
          <Input placeholder="请输入员工编号" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">员工姓名:</span>
          <Input placeholder="请输入员工姓名" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-right text-sm text-gray-600">项目名称:</span>
          <Input placeholder="请输入项目名称" />
        </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={mockEmployeeProjectMappingData} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};

export default EmployeeProjectMappingView;
