import React, { useState } from 'react';
import { X, Upload, Camera, Trash2, Plus } from 'lucide-react';

// 模拟可供新增的外部资产库数据
const MOCK_AVAILABLE_ASSETS = [
  { assetCode: 'SRV-BJ-2024-003', serialNumber: 'SN-LENOVO-SR650-01', description: 'Lenovo ThinkSystem SR650', city: '北京市', building: '酒仙桥IDC机房', floor: '3层 302机房' },
  { assetCode: 'SRV-BJ-2024-004', serialNumber: 'SN-INSPUR-5280M5-01', description: 'Inspur NF5280M5', city: '上海市', building: '金桥数据中心', floor: '1层 101机房' },
  { assetCode: 'SRV-BJ-2024-005', serialNumber: 'SN-HUAWEI-2288H-01', description: 'Huawei TaiShan 2288H V5', city: '广州市', building: '越秀机房', floor: '5层 502机房' },
];

const SerialNumberEdit = () => {
  // 申请信息表单状态
  const [formData, setFormData] = useState({
    applicant: '吕静 (115720)',
    department: 'IDC运维部',
    applyTime: '2026-05-12 10:30:00',
    changeType: '序列号变更',
    changeReason: '因业务扩容需求，厂商免费更换更大内存及硬盘'
  });

  // 变更资产列表状态
  const [assets, setAssets] = useState([
    {
      id: 1,
      assetCode: 'SRV-BJ-2024-001',
      serialNumber: 'SN-DELL-R750-001',
      snPhoto: null, 
      remark: '已上架', 
      description: 'Dell PowerEdge R750 机架式服务器',
      qty: 1,
      city: '北京市',
      building: '酒仙桥IDC机房',
      floor: '3层 302机房',
      status: '在用-使用中',
    },
    {
      id: 2,
      assetCode: 'SRV-BJ-2024-002',
      serialNumber: 'SN-HPE-DL380-001',
      snPhoto: 'https://placehold.co/100x100/e2e8f0/64748b?text=SN', // 使用占位图模拟已有照片
      remark: '暂不迁移', 
      description: 'HPE ProLiant DL380 Gen10 服务器',
      qty: 1,
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: 'B2 核心机房',
      status: '在用-使用中',
    }
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  // 扁平化数据更新
  const handleAssetChange = (id, field, value) => {
    setAssets(prevAssets => prevAssets.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 处理图片真实上传，生成本地预览URL
  const handlePhotoUpload = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      // 简单校验是否为图片
      if (!file.type.startsWith('image/')) {
        setErrorMsg('请上传图片格式的文件！');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAssetChange(id, 'snPhoto', reader.result);
      };
      reader.readAsDataURL(file);
    }
    // 清空 input 的 value，确保下次选择同一张图也能触发 onChange
    event.target.value = null;
  };

  // 删除资产
  const handleDeleteAsset = (id) => {
    setAssets(prevAssets => prevAssets.filter(item => item.id !== id));
  };

  // 确认添加新资产行
  const handleConfirmAddAsset = () => {
    if (!selectedNewAsset) return;
    const assetDef = MOCK_AVAILABLE_ASSETS.find(a => a.assetCode === selectedNewAsset);
    if (!assetDef) return;

    const newAsset = {
      id: Date.now(),
      assetCode: assetDef.assetCode,
      serialNumber: assetDef.serialNumber,
      snPhoto: null,
      remark: '',
      description: assetDef.description,
      qty: 1,
      city: assetDef.city,         
      building: assetDef.building, 
      floor: assetDef.floor,       
      status: '在用-使用中',
    };

    setAssets([...assets, newAsset]);
    setAddModalOpen(false);
    setSelectedNewAsset(''); 
  };

  // 提交前校验
  const handleSubmit = () => {
    setSuccessMsg('');
    if (!formData.changeReason.trim()) {
      setErrorMsg('请填写变更理由！');
      return;
    }
    
    const missingSerial = assets.some(a => !a.serialNumber || !a.serialNumber.trim());
    if (missingSerial) {
      setErrorMsg('请填写所有资产的序列号！');
      return;
    }

    const missingPhoto = assets.some(a => !a.snPhoto);
    if (missingPhoto) {
      setErrorMsg('请上传所有资产的序列号照片！');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('提交成功！请在控制台查看提交数据。');
    console.log('准备提交数据:', { formData, assets });
  };

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
                共计资产 <span className="text-blue-600 font-medium">{assets.length}</span> 项
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
                  <th className="py-3 px-4 font-medium text-gray-600 w-48">资产标签号</th>
                  {/* 序列号宽度调宽：从 w-48 调整为 w-64 */}
                  <th className="py-3 px-4 font-medium text-gray-600 min-w-[150px]"><span className="text-red-500 mr-1">*</span>序列号</th>
                  <th className="py-3 px-4 font-medium text-gray-600 min-w-[50px] text-center"><span className="text-red-500 mr-1">*</span>照片</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[150px]">备注</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[200px]">资产说明</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-16 text-center">数量</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[120px]">City</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[140px]">Building</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[120px]">Floor</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-28">资产状态</th>
                  <th className="py-3 px-4 font-medium text-gray-600 w-20 text-center">操作</th>
                </tr>
              </thead>
              
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100 transition-colors hover:bg-blue-50/40">
                    <td className="py-3 px-4 align-middle">
                      <span className="font-semibold text-gray-800">{asset.assetCode}</span>
                    </td>
                    
                    <td className="py-3 px-2 align-middle">
                      <input 
                        type="text" 
                        value={asset.serialNumber} 
                        onChange={(e) => handleAssetChange(asset.id, 'serialNumber', e.target.value)}
                        className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded px-2 py-1.5 outline-none transition-all text-sm" 
                        placeholder="请输入"
                      />
                    </td>

                    <td className="py-3 px-2 align-middle text-center">
                      <div className="flex items-center justify-center">
                        {asset.snPhoto ? (
                          // 显示缩略图预览
                          <div className="relative w-9 h-9 group rounded border border-gray-200 overflow-hidden shadow-sm">
                            <img src={asset.snPhoto} alt="SN Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <X size={16} className="text-white cursor-pointer" onClick={() => handleAssetChange(asset.id, 'snPhoto', null)} title="移除照片" />
                            </div>
                          </div>
                        ) : (
                          // 真实的上传按钮
                          <label
                            className="flex items-center justify-center w-full py-1 border border-dashed border-gray-300 rounded text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="点击上传"
                          >
                            <Camera size={16} className="my-1" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(asset.id, e)}
                            />
                          </label>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-2 align-middle">
                      <input 
                        type="text" 
                        value={asset.remark || ''}
                        onChange={(e) => handleAssetChange(asset.id, 'remark', e.target.value)}
                        className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded px-2 py-1.5 outline-none transition-all text-sm" 
                        placeholder="输入备注"
                      />
                    </td>

                    <td className="py-3 px-2 align-middle text-gray-700">{asset.description}</td>
                    <td className="py-3 px-2 align-middle text-center font-medium text-gray-600">{asset.qty}</td>
                    
                    {/* 以下三个字段设为无外框普通文本只读 */}
                    <td className="py-3 px-2 align-middle text-gray-700">{asset.city}</td>
                    <td className="py-3 px-2 align-middle text-gray-700">{asset.building}</td>
                    <td className="py-3 px-2 align-middle text-gray-700">{asset.floor}</td>

                    <td className="py-3 px-2 align-middle text-gray-500">
                      {asset.status}
                    </td>

                    <td className="py-3 px-4 align-middle text-center">
                      <button 
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors focus:outline-none inline-flex items-center justify-center"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded leading-relaxed">
                  提示：在此选择资产后，将自动载入资产说明、城市、建筑物、楼层等基础信息，且位置信息将被设为只读。
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

export default SerialNumberEdit;