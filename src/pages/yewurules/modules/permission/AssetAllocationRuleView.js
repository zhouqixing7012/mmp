import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Select, Modal, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import {
  mockAssetAllocationRuleData, mockReceiptRuleManagementData,
} from '../../../../mock/businessRulesMock';

export const AssetAllocationRuleView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '影像器材配给方案名称', dataIndex: 'name' },
    { title: '影像器材配给方案描述', dataIndex: 'desc' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '资产级别', dataIndex: 'level' },
    { title: '数量', dataIndex: 'qty' },
    { title: '操作', dataIndex: 'action', render: () => <Button type="link">操作</Button> }
  ];
  const data = mockAssetAllocationRuleData;
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案名称:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'高配影像器材', value:'1'}, {label:'标配影像器材', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案描述:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'方案1', value:'1'}, {label:'方案2', value:'2'}]} 
            />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">资产级别:</span>
        <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              allowClear options={[{label:'高端', value:'1'}, {label:'中低端', value:'2'}]} 
            />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <Button type="primary" icon={<Plus size={14} />}>新增</Button>
          <Button danger disabled={selectedRowKeys.length === 0} icon={<Trash2 size={14} />}>删除</Button>
        </div>
        <Table rowKey="id" rowSelection={{ type: 'checkbox', onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </div>
  );
};
