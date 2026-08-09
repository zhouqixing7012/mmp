import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button, Input, Select, Table } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar from '../../../../components/QueryBar';
import {
  mockCityBusinessLineMappingData, mockCostCenterPlateMappingData, mockDeptBusinessLineMappingData, mockDeptCostCenterMappingData, mockHRCompanyFinanceMappingData,
} from '../../../../mock/businessRulesMock';

const MappingView = ({ firstLabel, secondLabel, columns, data }) => (
  <div className="flex flex-col gap-4">
    <QueryBar>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">{firstLabel}:</span><Input placeholder={`请输入${firstLabel}`} /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">{secondLabel}:</span><Input placeholder={`请输入${secondLabel}`} /></div>
      <div className="flex items-center gap-2"><span className="w-20 text-right text-sm text-gray-600">是否启用:</span><Select style={{ width: '100%' }} allowClear options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." /></div>
    </QueryBar>
    <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2"><Button type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</Button></div>
      <Table rowKey="id" columns={columns} dataSource={data} size="middle" scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} />
    </div>
  </div>
);

const enabledColumn = { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> };

export const HRCompanyFinanceMappingView = () => <MappingView firstLabel="HR公司" secondLabel="财务公司" data={mockHRCompanyFinanceMappingData} columns={[
  { title: '序号', dataIndex: 'id' }, { title: 'HR公司', dataIndex: 'hrCompany' }, { title: 'HR公司描述', dataIndex: 'hrCompanyDesc' }, { title: '财务公司', dataIndex: 'financeCompany' }, { title: '财务公司描述', dataIndex: 'financeCompanyDesc' }, enabledColumn,
]} />;

export const DeptCostCenterMappingView = () => <MappingView firstLabel="HR部门" secondLabel="成本中心" data={mockDeptCostCenterMappingData} columns={[
  { title: '序号', dataIndex: 'id' }, { title: 'HR部门', dataIndex: 'hrDept' }, { title: 'HR部门描述', dataIndex: 'hrDeptDesc' }, { title: '成本中心', dataIndex: 'costCenter' }, { title: '成本中心描述', dataIndex: 'costCenterDesc' }, enabledColumn,
]} />;

export const CostCenterPlateMappingView = () => <MappingView firstLabel="成本中心" secondLabel="板块" data={mockCostCenterPlateMappingData} columns={[
  { title: '序号', dataIndex: 'id' }, { title: '成本中心', dataIndex: 'costCenter' }, { title: '成本中心描述', dataIndex: 'costCenterDesc' }, { title: '板块', dataIndex: 'plate' }, { title: '板块描述', dataIndex: 'plateDesc' }, enabledColumn,
]} />;

export const CityBusinessLineMappingView = () => <MappingView firstLabel="城市" secondLabel="业务线" data={mockCityBusinessLineMappingData} columns={[
  { title: '序号', dataIndex: 'id' }, { title: '城市', dataIndex: 'city' }, { title: '城市描述', dataIndex: 'cityDesc' }, { title: '业务线', dataIndex: 'businessLine' }, { title: '业务线描述', dataIndex: 'businessLineDesc' }, enabledColumn,
]} />;

export const DeptBusinessLineMappingView = () => <MappingView firstLabel="HR部门" secondLabel="业务线" data={mockDeptBusinessLineMappingData} columns={[
  { title: '序号', dataIndex: 'id' }, { title: 'HR部门', dataIndex: 'hrDept' }, { title: 'HR部门描述', dataIndex: 'hrDeptDesc' }, { title: '业务线', dataIndex: 'businessLine' }, { title: '业务线描述', dataIndex: 'businessLineDesc' }, enabledColumn,
]} />;
