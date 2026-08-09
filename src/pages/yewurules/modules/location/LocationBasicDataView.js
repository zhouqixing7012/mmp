import React, { useState } from 'react';
import { Input, Select } from 'antd';
import StatusTag from '../../../../components/StatusTag';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import {
  mockLocationBasicDataData,
} from '../../../../mock/businessRulesMock';

const LocationBasicDataView = () => {
  const [expandedKeys, setExpandedKeys] = useState(['1', '2', '3']);
  const columns = [
    { title: '城市名称', dataIndex: 'cityName', render: (text, record) => record.children ? <span className="font-medium">{text}</span> : '' },
    { title: '建筑名称', dataIndex: 'buildingName', render: (text) => text || '-' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <StatusTag value={val} type="enabled" /> }
  ];
  const data = mockLocationBasicDataData;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 递归筛选函数：筛选后保留完整树结构
  const filterTreeData = (treeData, cityNameFilter, buildingNameFilter, enabledFilter) => {
    return treeData.reduce((acc, node) => {
      // 检查城市名称是否匹配
      const cityMatch = !cityNameFilter || node.cityName?.includes(cityNameFilter);
      // 筛选子节点（建筑）
      const filteredChildren = node.children?.filter(child => {
        const buildingMatch = !buildingNameFilter || child.buildingName?.includes(buildingNameFilter);
        const statusMatch = enabledFilter === '' || enabledFilter === undefined ||
          (enabledFilter === '1' && child.enabled) || (enabledFilter === '0' && !child.enabled);
        return buildingMatch && statusMatch;
      }) || [];
      // 如果有匹配的子节点，或者城市名称匹配，则保留该节点
      if (filteredChildren.length > 0 || (cityMatch && (!buildingNameFilter || !node.children?.length))) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      return acc;
    }, []);
  };
  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <QueryItem label="城市名称">
          <Input placeholder="请输入城市名称" />
        </QueryItem>
        <QueryItem label="建筑名称">
          <Input placeholder="请输入建筑名称" />
        </QueryItem>
        <QueryItem label="状态">
          <Select
              style={{ width: '100%' }}
              allowClear options={[{label:'启用', value:'1'}, {label:'停用', value:'0'}]} placeholder="全部" 
            />
        </QueryItem>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">

        <div className="flex-1 overflow-auto bg-white p-4">
          <div className="border border-[#e8e8e8] rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#e8e8e8]">
                  <th className="w-[8%] p-2 text-left font-medium text-gray-700">序号</th>
                  <th className="w-[35%] p-2 text-left font-medium text-gray-700">城市名称</th>
                  <th className="w-[35%] p-2 text-left font-medium text-gray-700">建筑名称</th>
                  <th className="w-[22%] p-2 text-left font-medium text-gray-700">是否启用</th>
                </tr>
              </thead>
              <tbody>
                {data.map((city, cityIndex) => (
                  <React.Fragment key={city.id}>
                    {/* 城市行 */}
                    <tr className="border-b border-[#e8e8e8] bg-[#f5f5f5] hover:bg-[#e6f7ff] cursor-pointer"
                        onClick={() => {
                          const newExpanded = expandedKeys.includes(city.id)
                            ? expandedKeys.filter(k => k !== city.id)
                            : [...expandedKeys, city.id];
                          setExpandedKeys(newExpanded);
                        }}>
                      <td className="p-2">
                        <div className="flex items-center">
                          <span className="w-4">{expandedKeys.includes(city.id) ? '▼' : '▶'}</span>
                          <span>{cityIndex + 1}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium text-gray-800">{city.cityName}</span>
                      </td>
                      <td className="p-2 text-gray-500">-</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${city.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {city.enabled ? '启用' : '停用'}
                        </span>
                      </td>
                    </tr>
                    {/* 建筑行 */}
                    {expandedKeys.includes(city.id) && city.children?.map((building, buildingIndex) => (
                      <tr key={building.id} className="border-b border-[#e8e8e8] hover:bg-[#f0f5ff]">
                        <td className="p-2 pl-10 text-gray-500">
                          {cityIndex + 1}.{buildingIndex + 1}
                        </td>
                        <td className="p-2 pl-8 text-gray-400">
                          {city.cityName}
                        </td>
                        <td className="p-2">
                          <span className="text-gray-700">{building.buildingName}</span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${building.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {building.enabled ? '启用' : '停用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default LocationBasicDataView;
