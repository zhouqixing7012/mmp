import React, { useState } from 'react';
import { Search, Upload, Image as ImageIcon, X, Paperclip, FileText, Trash2, AlertCircle } from 'lucide-react';

const AssetChangeForm = () => {
  // 申请人信息表单状态
  const [formData, setFormData] = useState({
    applyNo: 'REQ20260508001',
    applicant: '吕静 (115720)',
    applyTime: '2026-05-08 11:00:00',
    description: ''
  });

  // 变更资产列表状态
  const [assets, setAssets] = useState([
    {
      id: 1,
      assetCode: '112161100271',
      originalSerialNumber: 'SN-DELL-2023-001', // 模拟本身带出的原始序列号
      serialNumber: 'SN-DELL-2023-001',
      description: '戴尔.E2417H主机',
      qty: 1,
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: '17层',
      photo: null,
      remark: '',
      status: '在用-使用中'
    }
  ]);

  // 附件列表状态
  const [attachments, setAttachments] = useState([]);

  // 错误提示状态
  const [errorMsg, setErrorMsg] = useState('');

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 处理表格行数据变化
  const handleAssetChange = (id, field, value) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
    if (errorMsg) setErrorMsg(''); // 清除错误提示
  };

  // 模拟照片上传
  const handlePhotoUpload = (id) => {
    // 这里模拟上传成功，实际应调用文件上传API
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, photo: 'uploaded_image.jpg' } : asset
    ));
    if (errorMsg) setErrorMsg('');
  };

  // 移除已上传的照片
  const handleRemovePhoto = (id) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, photo: null } : asset
    ));
  };

  // 模拟上传附件
  const handleUploadAttachment = () => {
    const newAttachment = {
      id: Date.now(),
      name: `附件资料_${attachments.length + 1}.pdf`,
      size: '1.2MB'
    };
    setAttachments([...attachments, newAttachment]);
  };

  // 移除附件
  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // 提交/预览前校验
  const handlePreview = () => {
    // 校验：如果序列号与原始序列号不同（被编辑过），则必须上传照片
    const invalidAsset = assets.find(a => a.serialNumber !== a.originalSerialNumber && !a.photo);
    
    if (invalidAsset) {
      setErrorMsg(`资产 ${invalidAsset.assetCode} 的序列号已被修改，请上传对应的资产照片作为凭证！`);
      return;
    }

    if (!formData.description.trim()) {
      setErrorMsg('请填写变更说明！');
      return;
    }

    // 校验通过，可以执行后续逻辑
    setErrorMsg('');
    console.log('校验通过，准备提交数据:', { formData, assets, attachments });
    // TODO: 弹出预览弹窗或跳转
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6 font-sans text-gray-700 text-sm">
      <div className="max-w-[1200px] mx-auto bg-white shadow-sm rounded-md p-8">
        
        {/* 全局错误提示 */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded flex items-center justify-between">
            <span>{errorMsg}</span>
            <X className="cursor-pointer" size={16} onClick={() => setErrorMsg('')} />
          </div>
        )}

        {/* 申请人信息模块 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="w-1 h-4 bg-blue-600 mr-2 rounded-sm"></div>
            <h2 className="text-blue-600 text-base font-medium">申请人信息</h2>
          </div>

          <div className="grid grid-cols-3 gap-y-6 gap-x-8">
            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-600">申请单号:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">
                {formData.applyNo}
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-600">申请人:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">
                {formData.applicant}
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-24 text-right pr-4 text-gray-600">申请时间:</label>
              <div className="flex-1 text-gray-800 py-1.5 font-medium">
                {formData.applyTime}
              </div>
            </div>

            <div className="col-span-3 flex items-start">
              <label className="w-24 text-right pr-4 pt-1 text-gray-600"><span className="text-red-500 mr-1">*</span>变更说明:</label>
              <div className="flex-1 relative">
                <textarea 
                  name="description"
                  rows="4"
                  placeholder="请填写变更原因和具体说明"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-colors"
                ></textarea>
                <div className="absolute bottom-2 right-3 text-gray-400 text-xs">
                  {formData.description.length}/500
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 变更资产信息模块 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-blue-600 mr-2 rounded-sm"></div>
              <h2 className="text-blue-600 text-base font-medium">变更资产信息</h2>
            </div>
            <button className="flex items-center space-x-1 px-3 py-1.5 border border-blue-400 text-blue-500 rounded hover:bg-blue-50 transition-colors">
              <Upload size={14} />
              <span>批量导入</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-t border-gray-200">
                <tr>
                  <th className="py-3 px-2 font-medium text-gray-600 w-32">资产标签号</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-40 text-blue-600">序列号</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-28">照片</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[150px]">资产说明</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-16 text-center">数量</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[160px]">城市</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[200px]">建筑物</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[140px]">楼层</th>
                  <th className="py-3 px-2 font-medium text-gray-600 min-w-[150px]">备注</th>
                  <th className="py-3 px-2 font-medium text-gray-600 w-24">资产状态</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  // 判断序列号是否被修改过
                  const isSnModified = asset.serialNumber !== asset.originalSerialNumber;
                  
                  return (
                    <tr key={asset.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 px-2 align-top">{asset.assetCode}</td>
                      
                      {/* 序列号 - 移到这里并增强交互 */}
                      <td className="py-4 px-2 align-top">
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="请输入序列号"
                            value={asset.serialNumber}
                            onChange={(e) => handleAssetChange(asset.id, 'serialNumber', e.target.value)}
                            className={`w-full border rounded px-2 py-1 outline-none text-xs transition-colors ${
                              isSnModified ? 'border-orange-400 bg-orange-50 focus:border-orange-500' : 'border-gray-300 focus:border-blue-400'
                            }`} 
                          />
                          {isSnModified && (
                            <div className="absolute top-7 left-1 flex items-center text-[10px] text-orange-500 whitespace-nowrap mt-1">
                              <AlertCircle size={10} className="mr-0.5" />
                              已修改，需传照片
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 照片上传 - 移到序列号之后 */}
                      <td className="py-4 px-2 align-top">
                        <div className="flex items-center">
                          {isSnModified && !asset.photo && (
                            <span className="text-orange-500 mr-1 font-bold" title="序列号已修改，必须上传照片作为凭证">*</span>
                          )}
                          {asset.photo ? (
                            <div className="flex items-center bg-green-50 text-green-600 border border-green-200 rounded px-2 py-1 text-xs">
                              <ImageIcon size={12} className="mr-1" />
                              <span className="truncate w-12" title={asset.photo}>已上传</span>
                              <X size={12} className="ml-1 cursor-pointer hover:text-green-800" onClick={() => handleRemovePhoto(asset.id)} />
                            </div>
                          ) : (
                            <button 
                              onClick={() => handlePhotoUpload(asset.id)}
                              className={`flex items-center px-2 py-1 border rounded text-xs transition-colors whitespace-nowrap ${
                                isSnModified && !asset.photo 
                                  ? 'border-orange-400 text-orange-500 hover:bg-orange-50' 
                                  : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-400'
                              }`}
                            >
                              <Upload size={12} className="mr-1" />
                              上传照片
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-2 align-top">{asset.description}</td>
                      <td className="py-4 px-2 align-top text-center">{asset.qty}</td>
                      
                      {/* 城市 */}
                      <td className="py-4 px-2 align-top">
                        <div className="relative">
                          <input 
                            type="text" 
                            value={asset.city}
                            onChange={(e) => handleAssetChange(asset.id, 'city', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 pr-6 focus:border-blue-400 outline-none text-xs" 
                          />
                          <Search className="absolute right-1.5 top-1.5 text-gray-400" size={12} />
                        </div>
                      </td>
                      
                      {/* 建筑物 */}
                      <td className="py-4 px-2 align-top">
                        <div className="relative">
                          <input 
                            type="text" 
                            value={asset.building}
                            onChange={(e) => handleAssetChange(asset.id, 'building', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 pr-6 focus:border-blue-400 outline-none text-xs" 
                          />
                          <Search className="absolute right-1.5 top-1.5 text-gray-400" size={12} />
                        </div>
                      </td>
                      
                      {/* 楼层 */}
                      <td className="py-4 px-2 align-top">
                        <select 
                          value={asset.floor}
                          onChange={(e) => handleAssetChange(asset.id, 'floor', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:border-blue-400 outline-none text-xs bg-white"
                        >
                          <option value="17层">17层</option>
                          <option value="18层">18层</option>
                        </select>
                      </td>

                      {/* 备注 */}
                      <td className="py-4 px-2 align-top">
                        <input 
                          type="text" 
                          value={asset.remark}
                          onChange={(e) => handleAssetChange(asset.id, 'remark', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:border-blue-400 outline-none text-xs" 
                        />
                      </td>
                      
                      <td className="py-4 px-2 align-top">{asset.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="text-right text-gray-500 mt-4 border-b border-gray-100 pb-6">
            共 {assets.length} 条
          </div>
        </div>

        {/* 附件信息模块 */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-blue-600 mr-2 rounded-sm"></div>
              <h2 className="text-blue-600 text-base font-medium">附件信息</h2>
            </div>
            <button 
              onClick={handleUploadAttachment}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 hover:text-blue-500 hover:border-blue-400 transition-colors"
            >
              <Paperclip size={14} />
              <span>上传附件</span>
            </button>
          </div>

          {attachments.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-md py-8 text-center text-gray-400 bg-gray-50/50">
              暂无附件，点击右上角按钮上传
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:shadow-sm bg-white group">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-gray-700 font-medium" title={att.name}>{att.name}</span>
                      <span className="text-xs text-gray-400">{att.size}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="mt-8 flex justify-center space-x-4">
          <button className="px-8 py-2 border border-blue-400 text-blue-500 rounded hover:bg-blue-50 transition-colors bg-white">
            返回
          </button>
          <button 
            onClick={handlePreview}
            className="px-8 py-2 bg-[#4aa1f0] text-white rounded hover:bg-blue-500 transition-colors shadow-sm"
          >
            预览
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssetChangeForm;