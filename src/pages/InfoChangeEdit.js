import React, { useState } from 'react';
import { X, Upload, Paperclip, FileText, Trash2, ChevronRight, ChevronDown, Search, Plus } from 'lucide-react';

// 模拟可供新增的外部资产库数据
const MOCK_AVAILABLE_ASSETS = [
  { assetCode: 'SRV-BJ-2024-003', serialNumber: 'SN-LENOVO-SR650-01', description: 'Lenovo ThinkSystem SR650' },
  { assetCode: 'SRV-BJ-2024-004', serialNumber: 'SN-INSPUR-5280M5-01', description: 'Inspur NF5280M5' },
  { assetCode: 'SRV-BJ-2024-005', serialNumber: 'SN-HUAWEI-2288H-01', description: 'Huawei TaiShan 2288H V5' },
];

const InfoChangeEdit = () => {
  // 申请信息表单状态
  const [formData, setFormData] = useState({
    applicant: '吕静 (115720)',
    department: 'IDC运维部',
    applyTime: '2026-05-12 10:30:00',
    changeType: '位置变更',
    changeReason: '因业务扩容需求，将搜狐媒体大厦部分测试服务器迁移至酒仙桥IDC机房进行统一部署。'
  });

  // 变更资产列表状态 (树形结构 - 服务器资产)
  const [assets, setAssets] = useState([
    {
      id: 1,
      assetCode: 'SRV-BJ-2024-001',
      serialNumber: 'SN-DELL-R750-001',
      relation: '主',
      description: 'Dell PowerEdge R750 机架式服务器',
      qty: 1,
      city: '北京市',
      building: '酒仙桥IDC机房',
      floor: '3层 302机房',
      remark: '已上架',
      status: '在用-使用中',
      expanded: true, // 控制子节点展开状态
      children: [
        {
          id: 11,
          assetCode: 'PART-MEM-001',
          serialNumber: 'SN-SAMSUNG-DDR4-01',
          relation: '备',
          description: 'Samsung 64GB DDR4 3200MHz 内存条',
          qty: 4,
          city: '北京市',
          building: '酒仙桥IDC机房',
          floor: '3层 302机房',
          remark: '随主机迁移',
          status: '在用-使用中'
        },
        {
          id: 12,
          assetCode: 'PART-HDD-001',
          serialNumber: 'SN-SEAGATE-8T-01',
          relation: '备',
          description: 'Seagate 8TB 7.2K RPM SATA 硬盘',
          qty: 2,
          city: '北京市',
          building: '酒仙桥IDC机房',
          floor: '3层 302机房',
          remark: '随主机迁移',
          status: '在用-使用中'
        },
        {
          id: 13,
          assetCode: 'PART-NIC-001',
          serialNumber: 'SN-INTEL-X710-01',
          relation: '备',
          description: 'Intel X710-DA2 万兆双口网卡',
          qty: 1,
          city: '北京市',
          building: '酒仙桥IDC机房',
          floor: '3层 302机房',
          remark: '随主机迁移',
          status: '在用-使用中'
        }
      ]
    },
    {
      id: 2,
      assetCode: 'SRV-BJ-2024-002',
      serialNumber: 'SN-HPE-DL380-001',
      relation: '主',
      description: 'HPE ProLiant DL380 Gen10 服务器',
      qty: 1,
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: 'B2 核心机房',
      remark: '暂不迁移',
      status: '在用-使用中',
      expanded: false,
      children: [
        {
          id: 21,
          assetCode: 'PART-MEM-002',
          serialNumber: 'SN-HYNIX-DDR4-01',
          relation: '备',
          description: 'SK Hynix 32GB DDR4 2933MHz 内存条',
          qty: 8,
          city: '北京市',
          building: '搜狐媒体大厦',
          floor: 'B2 核心机房',
          remark: '',
          status: '在用-使用中'
        }
      ]
    }
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 地点选择弹窗状态
  const [locationModal, setLocationModal] = useState({
    isOpen: false,
    assetId: null,
    city: '',
    building: '',
    floor: ''
  });

  // 新增资产弹窗状态
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedNewAsset, setSelectedNewAsset] = useState('');

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  // 递归更新树形结构中的资产字段 (行内编辑)
  const handleAssetChange = (id, field, value) => {
    setAssets(prevAssets => {
      const newAssets = JSON.parse(JSON.stringify(prevAssets));
      const updateTree = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            nodes[i][field] = value;
            // 如果是主资产，且修改的是地点字段，则级联更新所有子资产
            if (nodes[i].relation === '主' && ['city', 'building', 'floor'].includes(field)) {
              if (nodes[i].children) {
                nodes[i].children.forEach(child => {
                  child[field] = value;
                });
              }
            }
            return true;
          }
          if (nodes[i].children && updateTree(nodes[i].children)) return true;
        }
        return false;
      };
      updateTree(newAssets);
      return newAssets;
    });
  };

  // 打开地点选择弹窗
  const openLocationModal = (asset) => {
    setLocationModal({
      isOpen: true,
      assetId: asset.id,
      city: asset.city || '',
      building: asset.building || '',
      floor: asset.floor || ''
    });
  };

  // 关闭地点选择弹窗
  const closeLocationModal = () => {
    setLocationModal(prev => ({ ...prev, isOpen: false }));
  };

  // 保存地点选择并级联更新
  const saveLocation = () => {
    setAssets(prevAssets => {
      const newAssets = JSON.parse(JSON.stringify(prevAssets));
      const updateTree = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === locationModal.assetId) {
            nodes[i].city = locationModal.city;
            nodes[i].building = locationModal.building;
            nodes[i].floor = locationModal.floor;
            // 如果是主资产，级联更新所有子资产
            if (nodes[i].relation === '主' && nodes[i].children) {
              nodes[i].children.forEach(child => {
                child.city = locationModal.city;
                child.building = locationModal.building;
                child.floor = locationModal.floor;
              });
            }
            return true;
          }
          if (nodes[i].children && updateTree(nodes[i].children)) return true;
        }
        return false;
      };
      updateTree(newAssets);
      return newAssets;
    });
    closeLocationModal();
  };

  // 删除资产 (如果是主资产则同时删除子资产)
  const handleDeleteAsset = (id) => {
    setAssets(prevAssets => {
      let newAssets = prevAssets.filter(item => item.id !== id);
      newAssets = newAssets.map(item => {
        if (item.children) {
          return { ...item, children: item.children.filter(child => child.id !== id) };
        }
        return item;
      });
      return newAssets;
    });
  };

  // 切换树节点的展开/折叠状态
  const toggleExpand = (id) => {
    const toggleNode = (list) => {
      return list.map(item => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: toggleNode(item.children) };
        }
        return item;
      });
    };
    setAssets(toggleNode(assets));
  };

  // 确认添加新资产行
  const handleConfirmAddAsset = () => {
    if (!selectedNewAsset) return;
    const assetDef = MOCK_AVAILABLE_ASSETS.find(a => a.assetCode === selectedNewAsset);
    if (!assetDef) return;

    const newAsset = {
      id: Date.now(), // 使用时间戳作为临时唯一ID
      assetCode: assetDef.assetCode,
      serialNumber: assetDef.serialNumber,
      relation: '主',
      description: assetDef.description,
      qty: 1,
      city: '',
      building: '',
      floor: '',
      remark: '',
      status: '在用-使用中',
      expanded: false,
      children: []
    };

    setAssets([...assets, newAsset]);
    setAddModalOpen(false);
    setSelectedNewAsset(''); // 重置选中状态
  };

  // 提交前校验
  const handleSubmit = () => {
    setSuccessMsg('');
    if (!formData.changeReason.trim()) {
      setErrorMsg('请填写变更理由！');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('提交成功！请在控制台查看提交数据。');
    console.log('准备提交数据:', { formData, assets });
  };

  // 将树形结构展平以便于在表格中渲染
  const getFlattenedAssets = (list, level = 0) => {
    let flatList = [];
    list.forEach(item => {
      flatList.push({ ...item, _level: level });
      if (item.children && item.expanded) {
        flatList = flatList.concat(getFlattenedAssets(item.children, level + 1));
      }
    });
    return flatList;
  };

  const displayAssets = getFlattenedAssets(assets);

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6 font-sans text-gray-700 text-sm">
      <div className="max-w-[1280px] mx-auto bg-white shadow-sm rounded-md p-8">
        
        {/* 全局错误提示 */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded flex items-center justify-between">
            <span>{errorMsg}</span>
            <X size={16} className="text-red-500 hover:text-red-700" onClick={() => setErrorMsg('')} />
          </div>
        )}

        {/* 全局成功提示 */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded flex items-center justify-between">
            <span>{successMsg}</span>
            <X size={16} className="text-green-500 hover:text-green-700" onClick={() => setSuccessMsg('')} />
          </div>
        )}

        {/* 申请信息模块 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="w-1 h-4 bg-blue-600 mr-2 rounded-sm"></div>
            <h2 className="text-blue-600 text-base font-medium">申请信息</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-500">申请人:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">{formData.applicant}</div>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-500">申请部门:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">{formData.department}</div>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-500">申请时间:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">{formData.applyTime}</div>
            </div>

            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-500">变更类型:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">{formData.changeType}</div>
            </div>
            <div className="hidden md:block md:col-span-2"></div>

            <div className="md:col-span-3 flex items-start">
              <label className="w-24 text-right pr-4 pt-2 text-gray-500">
                <span className="text-red-500 mr-1">*</span>变更理由:
              </label>
              <div className="flex-1 relative">
                <textarea 
                  name="changeReason"
                  rows="3"
                  placeholder="请输入变更理由"
                  value={formData.changeReason}
                  onChange={handleInputChange}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-colors"
                ></textarea>
                <div className="absolute bottom-2 right-3 text-gray-400 text-xs bg-white px-1">
                  {formData.changeReason.length}/500
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 资产明细模块 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-blue-600 mr-2 rounded-sm"></div>
              <h2 className="text-blue-600 text-base font-medium">资产明细</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-500 text-sm">
                共计主资产 <span className="text-blue-600 font-medium">{assets.length}</span> 项，总计明细 <span className="text-blue-600 font-medium">{displayAssets.length}</span> 条
              </div>
              <button className="flex items-center space-x-1 px-3 py-1.5 border border-blue-400 text-blue-500 rounded hover:bg-blue-50 transition-colors">
                <Upload size={14} />
                <span>批量导入</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-medium text-gray-600 w-56">资产标签号</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-48">序列号</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-24 text-center">主备关系</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[200px]">资产说明</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-16 text-center">数量</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[140px]"><span className="text-red-500 mr-1">*</span>城市</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[160px]"><span className="text-red-500 mr-1">*</span>建筑物</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[140px]"><span className="text-red-500 mr-1">*</span>楼层/机房</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[150px]">备注</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-28">资产状态</th>
                  <th className="py-3 px-4 font-medium text-gray-600 w-20 text-center">操作</th>
                </tr>
              </thead>
              
              <tbody>
                {displayAssets.map((asset) => {
                  const hasChildren = asset.children && asset.children.length > 0;
                  const isChild = asset._level > 0;

                  return (
                    <tr 
                      key={asset.id} 
                      className={`border-b border-gray-100 transition-colors ${isChild ? 'bg-gray-50/50 hover:bg-blue-50/30' : 'hover:bg-blue-50/40'}`}
                    >
                      <td className="py-3 px-4 align-middle">
                        <div 
                          className="flex items-center" 
                          style={{ paddingLeft: `${asset._level * 24}px` }}
                        >
                          {hasChildren ? (
                            <button 
                              onClick={() => toggleExpand(asset.id)}
                              className="mr-1.5 text-gray-400 hover:text-blue-500 focus:outline-none bg-white rounded-sm border border-gray-200 p-0.5"
                            >
                              {asset.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ) : (
                            <div className="w-[22px] mr-1.5"></div>
                          )}
                          <span className={isChild ? "text-gray-600 text-xs" : "font-semibold text-gray-800"}>
                            {asset.assetCode}
                          </span>
                        </div>
                      </td>
                      
                      <td className={`py-3 px-2 align-middle ${isChild ? 'text-gray-500 text-xs' : 'text-gray-700 font-medium'}`}>
                        {asset.serialNumber}
                      </td>
                      <td className="py-3 px-2 align-middle text-center">
                        <span className={`px-2.5 py-1 rounded-sm text-xs font-medium ${asset.relation === '主' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {asset.relation}
                        </span>
                      </td>
                      <td className={`py-3 px-2 align-middle ${isChild ? 'text-gray-500 text-xs' : 'text-gray-700'}`}>{asset.description}</td>
                      <td className="py-3 px-2 align-middle text-center font-medium text-gray-600">{asset.qty}</td>
                      
                      <td className="py-2 px-2 align-middle">
                        {asset.relation === '备' ? (
                          <div className={`px-2 py-1.5 ${isChild ? 'text-xs text-gray-400' : 'text-sm text-gray-500'} bg-gray-100 border border-gray-200 rounded cursor-not-allowed`} title="备件地点随主资产变动，不可单独编辑">
                            {asset.city}
                          </div>
                        ) : (
                          <div className="relative group cursor-pointer" onClick={() => openLocationModal(asset)}>
                            <input 
                              type="text" 
                              readOnly
                              value={asset.city}
                              className={`w-full border border-gray-300 group-hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded px-2 py-1.5 pr-7 outline-none transition-all cursor-pointer ${isChild ? 'text-xs text-gray-600' : 'text-sm'}`} 
                              placeholder="请选择"
                            />
                            <Search size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        )}
                      </td>
                      
                      <td className="py-2 px-2 align-middle">
                        {asset.relation === '备' ? (
                          <div className={`px-2 py-1.5 ${isChild ? 'text-xs text-gray-400' : 'text-sm text-gray-500'} bg-gray-100 border border-gray-200 rounded cursor-not-allowed`} title="备件地点随主资产变动，不可单独编辑">
                            {asset.building}
                          </div>
                        ) : (
                          <div className="relative group cursor-pointer" onClick={() => openLocationModal(asset)}>
                            <input 
                              type="text" 
                              readOnly
                              value={asset.building}
                              className={`w-full border border-gray-300 group-hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded px-2 py-1.5 pr-7 outline-none transition-all cursor-pointer ${isChild ? 'text-xs text-gray-600' : 'text-sm'}`} 
                              placeholder="请选择"
                            />
                            <Search size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        )}
                      </td>
                      
                      <td className="py-2 px-2 align-middle">
                        {asset.relation === '备' ? (
                          <div className={`px-2 py-1.5 ${isChild ? 'text-xs text-gray-400' : 'text-sm text-gray-500'} bg-gray-100 border border-gray-200 rounded cursor-not-allowed`} title="备件地点随主资产变动，不可单独编辑">
                            {asset.floor}
                          </div>
                        ) : (
                          <div className="relative group cursor-pointer" onClick={() => openLocationModal(asset)}>
                            <input 
                              type="text" 
                              readOnly
                              value={asset.floor}
                              className={`w-full border border-gray-300 group-hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded px-2 py-1.5 pr-7 outline-none transition-all cursor-pointer ${isChild ? 'text-xs text-gray-600' : 'text-sm'}`} 
                              placeholder="请选择"
                            />
                            <Search size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        )}
                      </td>

                      <td className="py-2 px-2 align-middle">
                        <div className="relative">
                          <input 
                            type="text" 
                            value={asset.remark || ''}
                            onChange={(e) => handleAssetChange(asset.id, 'remark', e.target.value)}
                            className={`w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded px-2 py-1.5 outline-none transition-all ${isChild ? 'text-xs text-gray-600' : 'text-sm'}`} 
                            placeholder="输入备注"
                          />
                        </div>
                      </td>
                      
                      <td className={`py-3 px-2 align-middle ${isChild ? 'text-gray-400 text-xs' : 'text-gray-500'}`}>
                        {asset.status}
                      </td>

                      <td className="py-3 px-4 align-middle text-center">
                        {asset.relation === '主' ? (
                          <button 
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors focus:outline-none inline-flex items-center justify-center"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div className="w-[28px] h-[28px] inline-block" title="备件随主资产变动，不可单独删除"></div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 新增行按钮 */}
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => setAddModalOpen(true)}
              className="flex items-center space-x-1 px-5 py-2 border border-dashed border-blue-400 text-blue-500 rounded hover:bg-blue-50 transition-colors focus:outline-none"
            >
              <Plus size={16} />
              <span className="font-medium text-sm"></span>
            </button>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center space-x-4">
          <button className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 hover:text-gray-800 transition-colors bg-white font-medium focus:outline-none">
            返回
          </button>
          <button 
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-[#4aa1f0] text-white rounded hover:bg-blue-500 transition-colors shadow-sm font-medium focus:outline-none"
          >
            提交
          </button>
        </div>

        {/* 地点选择弹窗 */}
        {locationModal.isOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-[420px] overflow-hidden transform transition-all">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <h3 className="font-medium text-gray-800 text-base">选择目标地点</h3>
                <X size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" onClick={closeLocationModal} />
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium"><span className="text-red-500 mr-1">*</span>City</label>
                  <select 
                    value={locationModal.city}
                    onChange={(e) => setLocationModal({...locationModal, city: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">请选择城市</option>
                    <option value="北京市">北京市</option>
                    <option value="上海市">上海市</option>
                    <option value="广州市">广州市</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium"><span className="text-red-500 mr-1">*</span>Building</label>
                  <select 
                    value={locationModal.building}
                    onChange={(e) => setLocationModal({...locationModal, building: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">请选择建筑物</option>
                    <option value="搜狐媒体大厦">搜狐媒体大厦</option>
                    <option value="酒仙桥IDC机房">酒仙桥IDC机房</option>
                    <option value="中关村软件园">中关村软件园</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium"><span className="text-red-500 mr-1">*</span>Floor</label>
                  <select 
                    value={locationModal.floor}
                    onChange={(e) => setLocationModal({...locationModal, floor: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">请选择楼层/机房</option>
                    <option value="3层 302机房">3层 302机房</option>
                    <option value="B2 核心机房">B2 核心机房</option>
                    <option value="5层 505机房">5层 505机房</option>
                  </select>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
                <button 
                  onClick={closeLocationModal} 
                  className="px-5 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={saveLocation} 
                  className="px-5 py-2 bg-[#4aa1f0] text-white rounded hover:bg-blue-500 text-sm font-medium shadow-sm transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增资产弹窗 */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden transform transition-all">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <h3 className="font-medium text-gray-800 text-base">选择新增资产</h3>
                <X size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" onClick={() => setAddModalOpen(false)} />
              </div>
              <div className="p-6">
                <label className="block text-gray-600 mb-2 text-sm font-medium"><span className="text-red-500 mr-1">*</span>资产标签号 / 序列号</label>
                <select 
                  value={selectedNewAsset}
                  onChange={(e) => setSelectedNewAsset(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">请选择要添加的资产...</option>
                  {MOCK_AVAILABLE_ASSETS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} | {ast.serialNumber} ({ast.description})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded">
                  提示：在此选择主资产标签号及序列号后，将自动载入资产说明等基础信息，添加至列表后即可为其补充迁移的城市、建筑物、楼层及备注。
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
                <button 
                  onClick={() => setAddModalOpen(false)} 
                  className="px-5 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmAddAsset} 
                  disabled={!selectedNewAsset}
                  className={`px-5 py-2 rounded text-sm font-medium shadow-sm transition-colors ${selectedNewAsset ? 'bg-[#4aa1f0] text-white hover:bg-blue-500' : 'bg-blue-300 text-white cursor-not-allowed'}`}
                >
                  确定添加
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InfoChangeEdit;