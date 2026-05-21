import React, { useState } from 'react';
import { FileText, Search, ChevronDown, ChevronRight, Edit } from 'lucide-react';

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

export default function App() {
  const [expandedRows, setExpandedRows] = useState(['1']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({ city: '', building: '', floor: '' });

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const [assets, setAssets] = useState([
    {
      id: '1',
      tag: '114141605224',
      sn: 'SN-M-2023001',
      relation: '主',
      description: '显示器-标准显示器,戴尔,U2412M显示器.',
      quantity: 1,
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: '8层',
      major: 'IT设备',
      minor: '显示器',
      status: '在用-使用中',
      children: [
        { id: '1-1', tag: 'PART-NIC-001', sn: 'SN-P-001122', relation: '备', description: '网卡配件', quantity: 1, city: '北京市', building: '搜狐媒体大厦', floor: '8层', major: 'IT设备', minor: '网络配件', status: '在用-使用中' },
        { id: '1-2', tag: 'PART-MEM-009', sn: 'SN-P-003344', relation: '备', description: '内存配件', quantity: 1, city: '北京市', building: '搜狐媒体大厦', floor: '8层', major: 'IT设备', minor: '内存', status: '在用-使用中' },
        { id: '1-3', tag: 'PART-HDD-012', sn: 'SN-P-005566', relation: '备', description: '硬盘配件', quantity: 1, city: '北京市', building: '搜狐媒体大厦', floor: '8层', major: 'IT设备', minor: '硬盘', status: '在用-使用中' },
      ]
    }
  ]);

  const handleLocationChange = (id, field, value) => {
    setAssets(prevAssets => prevAssets.map(asset => {
      if (asset.id === id) {
        const updatedAsset = { ...asset, [field]: value };
        if (updatedAsset.children) {
          updatedAsset.children = updatedAsset.children.map(child => ({ ...child, [field]: value }));
        }
        return updatedAsset;
      }
      return asset;
    }));
  };

  const handleBatchUpdate = () => {
    setAssets(prevAssets => prevAssets.map(asset => {
      const newCity = modalForm.city || asset.city;
      const newBuilding = modalForm.building || asset.building;
      const newFloor = modalForm.floor || asset.floor;
      
      const updatedAsset = {
        ...asset,
        city: newCity,
        building: newBuilding,
        floor: newFloor
      };
      
      if (updatedAsset.children) {
        updatedAsset.children = updatedAsset.children.map(child => ({
          ...child,
          city: newCity,
          building: newBuilding,
          floor: newFloor
        }));
      }
      return updatedAsset;
    }));
    setIsModalOpen(false);
  };

  const RelationBadge = ({ type }) => {
    if (type === '主') {
      return <span className="inline-flex items-center justify-center px-2 py-0.5 text-[#1677ff] bg-[#e6f4ff] border border-[#91caff] rounded-sm text-xs font-normal min-w-[24px]">主</span>;
    }
    return <span className="inline-flex items-center justify-center px-2 py-0.5 text-gray-500 bg-gray-50 border border-gray-200 rounded-sm text-xs font-normal min-w-[24px]">备</span>;
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

          {/* 2. 接收人信息 */}
          <div>
            <SectionHeader title="接收人信息" />
            <div className="grid grid-cols-2 gap-y-4 mb-4">
              <FormRow label="接收人" value="114111-杨羊" />
              <FormRow label="接收部门" value="集团总部.员工服务中心.资产部" />
              <FormRow label="电话" value="010-62726168" />
              <FormRow label="邮箱" value="qianyang@sohu-lab.com" />
            </div>
            {/* 跨行的文本域 */}
            <div className="flex items-start text-sm mt-4">
              <div className="w-28 text-right text-gray-700 mr-4 mt-1">
                使用用途:<span className="text-red-500 ml-1">*</span>
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full border border-gray-300 bg-white rounded-none p-2 outline-none resize-none text-gray-700"
                  rows={2}
                  defaultValue="测试"
                />
              </div>
            </div>
          </div>

          {/* 3. 转出资产信息 (原转移资产信息，已全部置为只读) */}
          <div>
            <SectionHeader title="转出资产信息" />
            
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[#f8f9fa]">
                    <th className="border border-gray-300 py-2 font-normal">资产标签号</th>
                    <th className="border border-gray-300 py-2 font-normal">序列号</th>
                    <th className="border border-gray-300 py-2 font-normal">关系</th>
                    <th className="border border-gray-300 py-2 font-normal">资产说明</th>
                    <th className="border border-gray-300 py-2 font-normal">数量</th>
                    <th className="border border-gray-300 py-2 font-normal">City</th>
                    <th className="border border-gray-300 py-2 font-normal">Building</th>
                    <th className="border border-gray-300 py-2 font-normal">Floor</th>
                    <th className="border border-gray-300 py-2 font-normal">资产大类</th>
                    <th className="border border-gray-300 py-2 font-normal">资产小类</th>
                    <th className="border border-gray-300 py-2 font-normal">资产状态</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(item => (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-left">
                          <div className="flex items-center">
                            {item.children && (
                              <button
                                onClick={() => toggleRow(item.id)}
                                className="mr-2 flex items-center justify-center w-4 h-4 border border-gray-300 rounded text-gray-500 hover:bg-gray-100 bg-white shadow-sm transition-colors"
                              >
                                {expandedRows.includes(item.id) ? <ChevronDown size={12} strokeWidth={2.5} /> : <ChevronRight size={12} strokeWidth={2.5} />}
                              </button>
                            )}
                            {item.tag}
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2">{item.sn}</td>
                        <td className="border border-gray-300 p-2"><RelationBadge type={item.relation} /></td>
                        <td className="border border-gray-300 p-2 text-left">{item.description}</td>
                        <td className="border border-gray-300 p-2">{item.quantity}</td>
                        <td className="border border-gray-300 p-2">{item.city}</td>
                        <td className="border border-gray-300 p-2">{item.building}</td>
                        <td className="border border-gray-300 p-2">{item.floor}</td>
                        <td className="border border-gray-300 p-2">{item.major}</td>
                        <td className="border border-gray-300 p-2">{item.minor}</td>
                        <td className="border border-gray-300 p-2">{item.status}</td>
                      </tr>
                      {expandedRows.includes(item.id) && item.children?.map(child => (
                        <tr key={child.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-left">
                            <div className="flex items-center pl-6">
                              <div className="w-3 h-3 border-l-2 border-b-2 border-gray-300 mr-2 -translate-y-1"></div>
                              <span className="text-gray-600">{child.tag}</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.sn}</td>
                          <td className="border border-gray-300 p-2"><RelationBadge type={child.relation} /></td>
                          <td className="border border-gray-300 p-2 text-left text-gray-600">{child.description}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.quantity}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.city}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.building}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.floor}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.major}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.minor}</td>
                          <td className="border border-gray-300 p-2 text-gray-600">{child.status}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. 接收资产信息 (新增模块，指定字段可编辑) */}
          <div>
            <div className="flex justify-between items-center mb-3 mt-6 border-b border-gray-100 pb-1">
              <div className="flex items-center text-[#0088cc] font-bold text-base">
                <FileText className="w-5 h-5 mr-2" />
                接收资产信息
              </div>
              {/* <button
                onClick={() => {
                  setModalForm({ city: '', building: '', floor: '' });
                  setIsModalOpen(true);
                }}
                className="flex items-center bg-[#1677ff] hover:bg-[#4096ff] active:bg-[#0958d9] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                批量编辑
              </button> */}
            </div>
            {/* 这一行是修改后的：文字 + 按钮 同行显示 */}
            <div className="flex justify-between items-center mb-3">
                <div className="text-red-600 text-sm font-bold">
                    请确认接收资产的存放与使用地点。
                </div>
                <button
                    onClick={() => {
                    setModalForm({ city: '', building: '', floor: '' });
                    setIsModalOpen(true);
                    }}
                    className="flex items-center bg-[#1677ff] hover:bg-[#4096ff] active:bg-[#0958d9] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shadow-sm hover:shadow"
                >
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> 批量编辑
                </button>
            </div>
            {/* <div className="text-red-600 text-sm font-bold mb-3">
              请确认接收资产的存放与使用地点。
            </div> */}
            
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[#f8f9fa]">
                    <th className="border border-gray-300 py-2 font-normal w-[13%]">资产标签号</th>
                    <th className="border border-gray-300 py-2 font-normal w-[10%]">序列号</th>
                    <th className="border border-gray-300 py-2 font-normal w-[5%]">关系</th>
                    <th className="border border-gray-300 py-2 font-normal w-[18%]">资产说明</th>
                    <th className="border border-gray-300 py-2 font-normal w-[4%]">数量</th>
                    <th className="border border-gray-300 py-2 font-normal w-[9%]">City</th>
                    <th className="border border-gray-300 py-2 font-normal w-[11%]">Building</th>
                    <th className="border border-gray-300 py-2 font-normal w-[8%]">Floor</th>
                    <th className="border border-gray-300 py-2 font-normal w-[7%]">资产大类</th>
                    <th className="border border-gray-300 py-2 font-normal w-[7%]">资产小类</th>
                    <th className="border border-gray-300 py-2 font-normal w-[8%]">资产状态</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(item => (
                    <React.Fragment key={`recv-${item.id}`}>
                      <tr>
                        <td className="border border-gray-300 p-2 bg-gray-50 text-left">
                          <div className="flex items-center">
                            {item.children && (
                              <button
                                onClick={() => toggleRow(item.id)}
                                className="mr-2 flex items-center justify-center w-4 h-4 border border-gray-300 rounded text-gray-500 hover:bg-white bg-white shadow-sm transition-colors"
                              >
                                {expandedRows.includes(item.id) ? <ChevronDown size={12} strokeWidth={2.5} /> : <ChevronRight size={12} strokeWidth={2.5} />}
                              </button>
                            )}
                            {item.tag}
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 bg-gray-50">{item.sn}</td>
                        <td className="border border-gray-300 p-2 bg-gray-50"><RelationBadge type={item.relation} /></td>
                        <td className="border border-gray-300 p-2 text-left bg-gray-50">{item.description}</td>
                        <td className="border border-gray-300 p-2 bg-gray-50">{item.quantity}</td>
                        <td className="border border-gray-300 p-1">
                          <div className="flex items-center border border-gray-300 bg-white">
                            <input 
                              type="text" 
                              value={item.city} 
                              onChange={(e) => handleLocationChange(item.id, 'city', e.target.value)}
                              className="w-full outline-none p-1 text-xs" 
                            />
                            <Search className="w-4 h-4 text-blue-500 mx-1 cursor-pointer" />
                          </div>
                        </td>
                        <td className="border border-gray-300 p-1">
                          <div className="flex items-center border border-gray-300 bg-white">
                            <input 
                              type="text" 
                              value={item.building} 
                              onChange={(e) => handleLocationChange(item.id, 'building', e.target.value)}
                              className="w-full outline-none p-1 text-xs" 
                            />
                            <Search className="w-4 h-4 text-blue-500 mx-1 cursor-pointer" />
                          </div>
                        </td>
                        <td className="border border-gray-300 p-1">
                          <select 
                            className="w-full border border-gray-300 outline-none p-1 text-xs bg-white" 
                            value={item.floor}
                            onChange={(e) => handleLocationChange(item.id, 'floor', e.target.value)}
                          >
                            <option>8层</option>
                            <option>9层</option>
                            <option>10层</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 p-2 bg-gray-50">{item.major}</td>
                        <td className="border border-gray-300 p-2 bg-gray-50">{item.minor}</td>
                        <td className="border border-gray-300 p-2 bg-gray-50">{item.status}</td>
                      </tr>
                      {expandedRows.includes(item.id) && item.children?.map(child => (
                        <tr key={`recv-${child.id}`}>
                          <td className="border border-gray-300 p-2 bg-gray-50 text-left">
                            <div className="flex items-center pl-6">
                              <div className="w-3 h-3 border-l-2 border-b-2 border-gray-300 mr-2 -translate-y-1"></div>
                              <span className="text-gray-600">{child.tag}</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2 text-gray-600 bg-gray-50">{child.sn}</td>
                          <td className="border border-gray-300 p-2 bg-gray-50"><RelationBadge type={child.relation} /></td>
                          <td className="border border-gray-300 p-2 text-left text-gray-600 bg-gray-50">{child.description}</td>
                          <td className="border border-gray-300 p-2 text-gray-600 bg-gray-50">{child.quantity}</td>
                          <td className="border border-gray-300 p-1 bg-gray-50">
                            <div className="p-1 text-gray-500">{child.city}</div>
                          </td>
                          <td className="border border-gray-300 p-1 bg-gray-50">
                            <div className="p-1 text-gray-500">{child.building}</div>
                          </td>
                          <td className="border border-gray-300 p-1 bg-gray-50">
                            <div className="p-1 text-gray-500">{child.floor}</div>
                          </td>
                          <td className="border border-gray-300 p-2 text-gray-600 bg-gray-50">{child.major}</td>
                          <td className="border border-gray-300 p-2 text-gray-600 bg-gray-50">{child.minor}</td>
                          <td className="border border-gray-300 p-2 text-gray-600 bg-gray-50">{child.status}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. 保管职责 */}
          <div>
            <SectionHeader title="保管职责" />
            <div className="text-red-600 text-xs leading-relaxed mb-4">
              接收人同意接收上述资产及相关配件，须承担妥善保管资产的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应的赔偿责任。应公司需要，接收人应当配合及时调换或归还领用资产。如接收人延迟甚至拒绝交还公司资产，公司保留采取进一步手段的权利，包括但不限于留置接收人工资、奖金或者其他个人资产。
            </div>
            <div className="flex justify-center items-center text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2" defaultChecked />
                同意“保管职责”
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* 批量编辑位置信息弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-96 overflow-hidden">
            <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">批量编辑位置信息</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center">
                <span className="w-20 text-right text-xs text-gray-600 mr-3">City:</span>
                <div className="flex-1 flex items-center border border-gray-300 bg-white">
                  <input 
                    type="text" 
                    value={modalForm.city}
                    onChange={(e) => setModalForm({...modalForm, city: e.target.value})}
                    placeholder="不填则保持原值"
                    className="w-full outline-none p-1.5 text-xs" 
                  />
                  <Search className="w-4 h-4 text-blue-500 mx-1 cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-right text-xs text-gray-600 mr-3">Building:</span>
                <div className="flex-1 flex items-center border border-gray-300 bg-white">
                  <input 
                    type="text" 
                    value={modalForm.building}
                    onChange={(e) => setModalForm({...modalForm, building: e.target.value})}
                    placeholder="不填则保持原值"
                    className="w-full outline-none p-1.5 text-xs" 
                  />
                  <Search className="w-4 h-4 text-blue-500 mx-1 cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-right text-xs text-gray-600 mr-3">Floor:</span>
                <select 
                  className="flex-1 border border-gray-300 outline-none p-1.5 text-xs bg-white" 
                  value={modalForm.floor}
                  onChange={(e) => setModalForm({...modalForm, floor: e.target.value})}
                >
                  <option value="">不修改</option>
                  <option>8层</option>
                  <option>9层</option>
                  <option>10层</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end space-x-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded bg-white text-gray-600 text-xs hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={handleBatchUpdate}
                className="px-4 py-1.5 rounded bg-[#1677ff] text-white text-xs hover:bg-[#4096ff]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}