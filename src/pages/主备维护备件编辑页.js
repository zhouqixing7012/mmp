import React, { useState } from 'react';

const IconX = ({ size = 16, className = "", onClick }) => (
  <svg onClick={onClick} className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: onClick ? 'pointer' : 'default'}}>
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconUpload = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);
const IconTrash2 = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const IconSearch = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const IconPlus = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const IconCheckCircle = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const IconAlertCircle = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const MOCK_AVAILABLE_MAIN_ASSETS = [
  { assetCode: '114141605224', serialNumber: '4XMSWG2', description: 'Dell.R730', city: '北京市', building: '土城', floor: '9层' },
  { assetCode: '114141605225', serialNumber: '5YNTWH3', description: 'HPE ProLiant DL380 Gen10', city: '上海市', building: '张江', floor: '3层' },
  { assetCode: 'SRV-BJ-2024-003', serialNumber: 'SN-LENOVO-SR650-01', description: 'Lenovo ThinkSystem SR650', city: '广州市', building: '天河', floor: '5层' },
];

const MOCK_AVAILABLE_SPARE_PARTS = [
  { assetCode: 'PART-MEM-001', serialNumber: 'SN-SAMSUNG-DDR4-01', brand: 'Samsung', majorCategory: 'PART', minorCategory: '服务器内存', description: 'Samsung 64GB DDR4', config: 'DDR4 3200MHz ECC' },
  { assetCode: 'PART-HDD-001', serialNumber: 'SN-SEAGATE-8T-01', brand: 'Seagate', majorCategory: 'PART', minorCategory: '服务器硬盘', description: 'Seagate 8TB SATA', config: '7.2K RPM SATA 6Gbps' },
  { assetCode: 'PART-NIC-001', serialNumber: 'SN-INTEL-X710-01', brand: 'Intel', majorCategory: 'PART', minorCategory: '服务器网卡', description: 'Intel X710-DA2', config: '万兆双口网卡 光口' },
];

const App = () => {
  // 申请表单状态
  const [formData, setFormData] = useState({
    applicant: '梁声 (111160)',
    department: '新媒体',
    applyTime: '2026-05-12 10:30:00',
    changeType: '主备维护',
    changeReason: '针对部分服务器备件进行统一的位置迁移及主资产挂载信息的核对。'
  });

  // 资产列表状态 (备件平铺视角，去除树形结构)
  const [assets, setAssets] = useState([
    {
      id: 'spare-1',
      assetCode: 'PART-MEM-009',
      serialNumber: 'SN-DELL-MEM-01',
      mainAssetCode: '114141605224',
      brand: 'Dell',
      minorCategory: '服务器内存',
      description: '16G DDR4 ECC RDIMM',
      config: '16G DDR4',
      qty: 8,
      city: '北京市',
      building: '土城',
      floor: '9层',
      remark: '随主机扩容', 
      status: '在用-使用中',
    },
    {
      id: 'spare-2',
      assetCode: 'PART-HDD-012',
      serialNumber: 'SN-DELL-HDD-02',
      mainAssetCode: '114141605224',
      brand: 'Dell',
      minorCategory: '服务器硬盘',
      description: '2.5寸 600G 10K SAS',
      config: '600G 10K SAS',
      qty: 8,
      city: '北京市',
      building: '土城',
      floor: '9层',
      remark: '已上架', 
      status: '在用-使用中',
    },
    {
      id: 'spare-3',
      assetCode: 'PART-MEM-010',
      serialNumber: 'SN-HPE-MEM-01',
      mainAssetCode: '',
      brand: 'HPE',
      minorCategory: '服务器内存',
      description: '32G DDR4 2933',
      config: '32G DDR4',
      qty: 4,
      city: '上海市',
      building: '张江',
      floor: '3层',
      remark: '闲置待绑定', 
      status: '闲置',
    },
    {
      id: 'spare-4',
      assetCode: 'PART-NIC-005',
      serialNumber: 'SN-INTEL-X710-02',
      mainAssetCode: '114141605225',
      brand: 'Intel',
      minorCategory: '服务器网卡',
      description: 'Intel X710-DA2',
      config: '万兆双口网卡',
      qty: 1,
      city: '上海市',
      building: '张江',
      floor: '3层',
      remark: '网络扩容', 
      status: '在用-使用中',
    }
  ]);

  // AntD风格的轻提示消息状态
  const [message, setMessage] = useState({ type: '', content: '', visible: false });

  // 底部添加备件弹窗状态
  const [addSpareModalOpen, setAddSpareModalOpen] = useState(false);
  const [selectedNewSpare, setSelectedNewSpare] = useState('');

  // 绑定主资产的弹窗状态
  const [bindMainModal, setBindMainModal] = useState({ isOpen: false, targetSpareId: null, selectedMainCode: '' });

  // 触发全局提示
  const showMessage = (type, content) => {
    setMessage({ type, content, visible: true });
    setTimeout(() => setMessage({ type: '', content: '', visible: false }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 通用字段修改 (仅备注等字段)
  const handleAssetChange = (id, field, value) => {
    setAssets(prevAssets => prevAssets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  // 备件删除逻辑
  const handleDelete = (id) => {
    setAssets(prevAssets => prevAssets.filter(item => item.id !== id));
    showMessage('success', '备件已移除');
  };

  // 打开选择主资产弹窗
  const openBindMainModal = (spareId, currentMainCode) => {
    setBindMainModal({ 
      isOpen: true, 
      targetSpareId: spareId, 
      selectedMainCode: currentMainCode || '' 
    });
  };

  // 确认为主资产绑定
  const confirmBindMainAsset = () => {
    const { targetSpareId, selectedMainCode } = bindMainModal;
    const mainDef = MOCK_AVAILABLE_MAIN_ASSETS.find(m => m.assetCode === selectedMainCode);
    
    setAssets(prevAssets => prevAssets.map(asset => {
      if (asset.id === targetSpareId) {
        // 如果选中了主资产，将主资产的位置信息同步给备件
        if (mainDef) {
          return { 
            ...asset, 
            mainAssetCode: selectedMainCode,
            city: mainDef.city,
            building: mainDef.building,
            floor: mainDef.floor
          };
        } else {
          // 清空绑定的情况
          return { ...asset, mainAssetCode: '' };
        }
      }
      return asset;
    }));

    setBindMainModal({ isOpen: false, targetSpareId: null, selectedMainCode: '' });
    showMessage('success', '主资产关联已更新');
  };

  // 确认添加全新备件明细
  const confirmAddSparePart = () => {
    const spareDef = MOCK_AVAILABLE_SPARE_PARTS.find(a => a.assetCode === selectedNewSpare);
    if (!spareDef) return;

    const newSpare = {
      id: `spare-${Date.now()}`,
      mainAssetCode: '', // 初始不绑定主资产
      qty: 1,
      city: '-', building: '-', floor: '-', remark: '',
      status: '闲置',
      ...spareDef
    };

    setAssets([...assets, newSpare]);
    setAddSpareModalOpen(false);
    setSelectedNewSpare('');
    showMessage('success', '备件明细添加成功');
  };

  const handleSubmit = () => {
    if (!formData.changeReason.trim()) {
      showMessage('error', '请填写变更理由！');
      return;
    }
    showMessage('success', '提交成功！即将返回列表。');
    console.log('提交数据:', { formData, assets });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 font-sans text-[14px] text-[rgba(0,0,0,0.88)] relative">
      
      {/* AntD 风格全局 Message 提示 */}
      {message.visible && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-none transition-all duration-300 translate-y-0 opacity-100">
          <div className="bg-white shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2.5 flex items-center gap-2 pointer-events-auto">
            {message.type === 'success' ? (
              <IconCheckCircle size={18} className="text-[#52c41a]" />
            ) : (
              <IconAlertCircle size={18} className="text-[#ff4d4f]" />
            )}
            <span className="text-[14px] leading-tight text-[rgba(0,0,0,0.88)]">{message.content}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* 顶部申请信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6">
          <div className="flex items-center pb-4 mb-4 border-b border-[#f0f0f0]">
            <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
            <h2 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">申请信息</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)] leading-[32px]">申请人:</label>
              <div className="flex-1 text-[rgba(0,0,0,0.88)] leading-[32px]">{formData.applicant}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)] leading-[32px]">申请部门:</label>
              <div className="flex-1 text-[rgba(0,0,0,0.88)] leading-[32px]">{formData.department}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)] leading-[32px]">申请时间:</label>
              <div className="flex-1 text-[rgba(0,0,0,0.88)] leading-[32px]">{formData.applyTime}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)] leading-[32px]">变更类型:</label>
              <div className="flex-1 text-[rgba(0,0,0,0.88)] leading-[32px]">{formData.changeType}</div>
            </div>
            <div className="hidden md:block md:col-span-2"></div>

            <div className="md:col-span-3 flex items-start">
              <label className="w-[100px] text-right pr-4 pt-1.5 text-[rgba(0,0,0,0.65)]">
                <span className="text-[#ff4d4f] font-family-[SimSun] mr-1">*</span>变更理由:
              </label>
              <div className="flex-1 relative">
                <textarea 
                  name="changeReason" rows="3"
                  value={formData.changeReason}
                  onChange={handleInputChange}
                  className="w-full border border-[#d9d9d9] rounded-md p-2 text-[14px] leading-[1.5] transition-all hover:border-[#4096ff] focus:border-[#4096ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] outline-none resize-none"
                  placeholder="请输入变更理由"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6">
          <div className="flex items-center justify-between pb-4 mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
              <h2 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">资产明细</h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[14px] text-[rgba(0,0,0,0.65)]">
                共计明细 <span className="text-[#1677ff] font-medium mx-1">{assets.length}</span> 条
              </span>
              <button className="flex items-center gap-1.5 px-4 py-1.5 border border-[#1677ff] text-[#1677ff] rounded-md hover:bg-[#e6f4ff] transition-colors text-[14px] font-medium">
                <IconUpload size={16} />
                <span>批量上传</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#f0f0f0] rounded-t-lg">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">序列号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">主资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">品牌</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[130px]">资产小类</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">资产说明</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[180px]">配置</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">数量</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">城市</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[130px]">建筑物</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[130px]">楼层/机房</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">备注</th>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-20 text-center sticky right-0 bg-[#fafafa] z-10 shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] border-l border-[#f0f0f0]">操作</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="py-12 text-center text-[rgba(0,0,0,0.45)] border-b border-[#f0f0f0]">
                      暂无明细数据
                    </td>
                  </tr>
                ) : assets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className="group border-b border-[#f0f0f0] transition-colors hover:bg-[#f5f5f5] bg-white"
                  >
                    <td className="py-3 px-4 align-middle">
                      <span className="font-medium text-[rgba(0,0,0,0.88)]">{asset.assetCode}</span>
                    </td>
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                      {asset.serialNumber}
                    </td>
                    
                    <td className="py-2 px-3 align-middle">
                      <div className="relative group cursor-pointer" onClick={() => openBindMainModal(asset.id, asset.mainAssetCode)}>
                        <input 
                          type="text" 
                          readOnly
                          value={asset.mainAssetCode}
                          className="w-full border border-[#d9d9d9] bg-white rounded px-2.5 py-1.5 text-[13px] text-[#1677ff] font-medium outline-none transition-all group-hover:border-[#4096ff] cursor-pointer placeholder:text-[rgba(0,0,0,0.25)] placeholder:font-normal" 
                          placeholder="点击选择主资产"
                        />
                        <IconSearch size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[rgba(0,0,0,0.25)] group-hover:text-[#1677ff] transition-colors" />
                      </div>
                    </td>

                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.88)]">
                      {asset.brand}
                    </td>
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                      {asset.minorCategory}
                    </td>
                    <td className="py-3 px-3 align-middle">
                      <div className="text-[rgba(0,0,0,0.88)] truncate max-w-[160px]" title={asset.description}>{asset.description}</div>
                    </td>
                    <td className="py-3 px-3 align-middle">
                      <div className="text-[rgba(0,0,0,0.65)] text-[13px] truncate max-w-[180px]" title={asset.config}>{asset.config}</div>
                    </td>
                    <td className="py-3 px-3 align-middle text-center text-[rgba(0,0,0,0.88)]">{asset.qty}</td>
                    
                    {/* 地点信息，改为纯文本只读 */}
                    {['city', 'building', 'floor'].map((field) => (
                      <td key={field} className="py-2 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                        {asset[field] || '-'}
                      </td>
                    ))}

                    <td className="py-2 px-3 align-middle">
                      <input 
                        type="text" value={asset.remark || ''} placeholder="输入备注..."
                        onChange={(e) => handleAssetChange(asset.id, 'remark', e.target.value)}
                        className="w-full border border-[#d9d9d9] rounded px-2.5 py-1.5 text-[13px] text-[rgba(0,0,0,0.88)] outline-none transition-all focus:border-[#4096ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] hover:border-[#4096ff] placeholder:text-[rgba(0,0,0,0.25)]" 
                      />
                    </td>

                    <td className="py-3 px-4 align-middle text-center sticky right-0 z-10 border-l border-[#f0f0f0] transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] bg-white group-hover:bg-[#f5f5f5]">
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="text-[#ff4d4f] hover:text-[#ff7875] transition-colors flex items-center justify-center p-1 mx-auto"
                        title="删除该明细"
                      >
                        <IconTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {}
          <div className="border border-[#f0f0f0] border-t-0 rounded-b-lg p-3 bg-[#fafafa]/50 flex justify-center">
             <button 
                onClick={() => setAddSpareModalOpen(true)}
                className="w-full max-w-[100px] flex items-center justify-center gap-1.5 px-4 py-2 border border-dashed border-[#d9d9d9] bg-white text-[rgba(0,0,0,0.65)] rounded-md hover:text-[#1677ff] hover:border-[#1677ff] transition-colors text-[14px]"
              >
                <IconPlus size={16} />
                <span>添加</span>
              </button>
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="flex justify-center items-center py-6 gap-4">
          <button className="h-8 px-6 border border-[#d9d9d9] text-[rgba(0,0,0,0.88)] bg-white rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all text-[14px]">
            返回
          </button>
          <button 
            onClick={handleSubmit}
            className="h-8 px-8 bg-[#1677ff] text-white rounded-md hover:bg-[#4096ff] shadow-[0_2px_0_rgba(5,145,255,0.1)] transition-all text-[14px] font-medium"
          >
            提交
          </button>
        </div>

        {/* 新增备件明细弹窗 */}
        {addSpareModalOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">新增备件明细</h3>
                <IconX size={16} className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.88)]" onClick={() => setAddSpareModalOpen(false)} />
              </div>
              <div className="p-6">
                <label className="block text-[14px] text-[rgba(0,0,0,0.88)] mb-2">
                  <span className="text-[#ff4d4f] font-family-[SimSun] mr-1">*</span>选择备件基础数据
                </label>
                <select 
                  value={selectedNewSpare} onChange={(e) => setSelectedNewSpare(e.target.value)}
                  className="w-full border border-[#d9d9d9] rounded-md h-8 px-3 text-[14px] text-[rgba(0,0,0,0.88)] outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                >
                  <option value="">请选择要添加的备件...</option>
                  {MOCK_AVAILABLE_SPARE_PARTS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} - {ast.description} ({ast.minorCategory})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-[13px] text-[rgba(0,0,0,0.45)] bg-[#fafafa] border border-[#f0f0f0] p-3 rounded">
                  💡 提示：将备件加入列表后，请在“主资产标签号”列为其指定要挂载的主设备。
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-[#f0f0f0] flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setAddSpareModalOpen(false)} className="h-8 px-4 border border-[#d9d9d9] rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={confirmAddSparePart} disabled={!selectedNewSpare} className={`h-8 px-4 rounded-md shadow-sm transition-all ${selectedNewSpare ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-[#f5f5f5] text-[rgba(0,0,0,0.25)] border border-[#d9d9d9] cursor-not-allowed'}`}>确定添加</button>
              </div>
            </div>
          </div>
        )}

        {/* 绑定主资产弹窗 */}
        {bindMainModal.isOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">选择绑定的主资产</h3>
                <IconX size={16} className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.88)]" onClick={() => setBindMainModal({ isOpen: false, targetSpareId: null, selectedMainCode: '' })} />
              </div>
              <div className="p-6">
                <label className="block text-[14px] text-[rgba(0,0,0,0.88)] mb-2">
                  选择关联的主设备标签号：
                </label>
                <select 
                  value={bindMainModal.selectedMainCode} onChange={(e) => setBindMainModal({...bindMainModal, selectedMainCode: e.target.value})}
                  className="w-full border border-[#d9d9d9] rounded-md h-8 px-3 text-[14px] text-[rgba(0,0,0,0.88)] outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                >
                  <option value="">解除绑定 / 暂不绑定</option>
                  {MOCK_AVAILABLE_MAIN_ASSETS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} - {ast.description} ({ast.city}/{ast.building})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-[13px] text-[rgba(0,0,0,0.45)] bg-[#fafafa] border border-[#f0f0f0] p-3 rounded flex gap-2">
                   <IconAlertCircle size={15} className="mt-[2px] shrink-0 text-[#1677ff]"/>
                   <span>绑定主资产后，该备件的城市、建筑物及楼层信息将自动与所选主资产对齐。</span>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-[#f0f0f0] flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setBindMainModal({ isOpen: false, targetSpareId: null, selectedMainCode: '' })} className="h-8 px-4 border border-[#d9d9d9] rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={confirmBindMainAsset} className="h-8 px-4 bg-[#1677ff] text-white rounded-md shadow-sm transition-all hover:bg-[#4096ff]">确认关联</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;