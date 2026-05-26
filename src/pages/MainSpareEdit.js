import React, { useState } from 'react';
import { X, Upload, Trash2, ChevronRight, ChevronDown, Plus, CheckCircle, AlertCircle } from 'lucide-react';

// Custom icons (not available in lucide-react)
const IconUnlink = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* 左上半环 */}
    <path d="M10 13a5 5 0 0 0 7.54.54l1.5-1.5" />
    {/* 右下半环 */}
    <path d="M14 11a5 5 0 0 0-7.54-.54l-1.5 1.5" />
    {/* 斩断线，特意用更明晰的断开间距表达 */}
    <line x1="19" y1="5" x2="5" y2="19" stroke="#ff4d4f" strokeWidth="3" />
  </svg>
);

// 新增：“关联其他” 扁平文本化图标 (简洁的左右对调交换双流向箭头)
const IconExchange = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 5h18" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 19H3" />
  </svg>
);


// === 模拟基础数据 ===
const MOCK_AVAILABLE_MAIN_ASSETS = [
  { assetCode: 'SRV-BJ-2024-003', serialNumber: 'SN-LENOVO-SR650-01', brand: 'Lenovo', majorCategory: 'SERVER', minorCategory: '服务器-机架式', description: 'Lenovo ThinkSystem SR650', config: 'Xeon Silver 4210R*2, 64G' },
  { assetCode: 'SRV-BJ-2024-004', serialNumber: 'SN-INSPUR-5280M5-01', brand: 'Inspur', majorCategory: 'SERVER', minorCategory: '服务器-机架式', description: 'Inspur NF5280M5', config: 'Xeon Gold 5218*2, 128G' },
  { assetCode: 'SRV-BJ-2024-005', serialNumber: 'SN-HUAWEI-2288H-01', brand: 'Huawei', majorCategory: 'SERVER', minorCategory: '服务器-机架式', description: 'Huawei TaiShan 2288H V5', config: 'Kunpeng 920*2, 256G' },
];

const MOCK_AVAILABLE_SPARE_PARTS = [
  { assetCode: 'PART-MEM-001', serialNumber: 'SN-SAMSUNG-DDR4-01', brand: 'Samsung', majorCategory: 'PART', minorCategory: '服务器内存', description: 'Samsung 64GB DDR4', config: 'DDR4 3200MHz ECC' },
  { assetCode: 'PART-HDD-001', serialNumber: 'SN-SEAGATE-8T-01', brand: 'Seagate', majorCategory: 'PART', minorCategory: '服务器硬盘', description: 'Seagate 8TB SATA', config: '7.2K RPM SATA 6Gbps' },
  { assetCode: 'PART-NIC-001', serialNumber: 'SN-INTEL-X710-01', brand: 'Intel', majorCategory: 'PART', minorCategory: '服务器网卡', description: 'Intel X710-DA2', config: '万兆双口网卡 光口' },
];

const MainSpareEdit = () => {
  // 申请表单状态
  const [formData, setFormData] = useState({
    applicant: '梁声 (111160)',
    department: '新媒体',
    applyTime: '2026-05-12 10:30:00',
    changeType: '主备维护',
    changeReason: '针对Dell.R730服务器及其相关备件进行统一的资产信息规范及位置校准更新。'
  });

  // 资产列表状态 (初始包含主资产及嵌套的备件)
  const [assets, setAssets] = useState([
    {
      id: 'main-1',
      assetCode: '114141605224',
      serialNumber: '4XMSWG2',
      relation: '主',
      brand: 'Dell',
      majorCategory: 'SERVER',
      minorCategory: '服务器-机架式',
      description: 'Dell.R730',
      config: 'E5-2620V3*2,16G DDR4*8,600G*8',
      qty: 1,
      city: '北京市',
      building: '土城',
      floor: '9层',
      remark: '原位置: TC9-903-8-1-8', 
      status: '在用-使用中',
      expanded: true, 
      children: [
        {
          id: 'spare-1-1',
          assetCode: 'PART-MEM-009',
          serialNumber: 'SN-DELL-MEM-01',
          relation: '备',
          brand: 'Dell',
          majorCategory: 'PART',
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
          id: 'spare-1-2',
          assetCode: 'PART-HDD-012',
          serialNumber: 'SN-DELL-HDD-02',
          relation: '备',
          brand: 'Dell',
          majorCategory: 'PART',
          minorCategory: '服务器硬盘',
          description: '2.5寸 600G 10K SAS',
          config: '600G 10K SAS',
          qty: 8,
          city: '北京市',
          building: '土城',
          floor: '9层',
          remark: '随主机上架', 
          status: '在用-使用中',
        }
      ]
    },
    {
      id: 'main-2',
      assetCode: '114141605225',
      serialNumber: '5YNTWH3',
      relation: '主',
      brand: 'HPE',
      majorCategory: 'SERVER',
      minorCategory: '服务器-机架式',
      description: 'HPE ProLiant DL380 Gen10',
      config: 'Xeon Silver 4210*2, 32G DDR4*4',
      qty: 1,
      city: '上海市',
      building: '张江',
      floor: '3层',
      remark: '新机上架', 
      status: '在用-使用中',
      expanded: false, 
      children: []
    }
  ]);

  // AntD风格的轻提示消息状态
  const [message, setMessage] = useState({ type: '', content: '', visible: false });

  // 主资产添加弹窗
  const [addMainModalOpen, setAddMainModalOpen] = useState(false);
  const [selectedNewMainAsset, setSelectedNewMainAsset] = useState('');

  // 备件添加弹窗
  const [addSpareModal, setAddSpareModal] = useState({ isOpen: false, parentId: null, selectedSpare: '' });

  // 备件转移弹窗状态
  const [transferSpareModal, setTransferSpareModal] = useState({
    isOpen: false,
    spareId: null,
    currentParentId: null,
    spareName: '',
    targetParentId: ''
  });

  // 触发全局提示
  const showMessage = (type, content) => {
    setMessage({ type, content, visible: true });
    setTimeout(() => setMessage({ type: '', content: '', visible: false }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 通用字段修改 (包含位置级联同步)
  const handleAssetChange = (id, field, value) => {
    setAssets(prevAssets => {
      const newAssets = JSON.parse(JSON.stringify(prevAssets));
      const updateTree = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            nodes[i][field] = value;
            // 级联更新子节点的位置
            if (nodes[i].relation === '主' && ['city', 'building', 'floor'].includes(field) && nodes[i].children) {
              nodes[i].children.forEach(child => child[field] = value);
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

  // 展开/折叠
  const toggleExpand = (id) => {
    setAssets(prev => prev.map(item => item.id === id ? { ...item, expanded: !item.expanded } : item));
  };

  // 删除主资产逻辑 (将同时清空该主机下的所有备件)
  const handleDeleteMain = (id) => {
    setAssets(prevAssets => prevAssets.filter(main => main.id !== id));
    showMessage('success', '主资产及关联备件已成功删除');
  };

  // 备件解除绑定关系（“解除”）
  const handleUnbindSpare = (spareId, parentId, spareName) => {
    setAssets(prevAssets => {
      return prevAssets.map(main => {
        if (main.id === parentId) {
          return {
            ...main,
            children: main.children.filter(child => child.id !== spareId)
          };
        }
        return main;
      });
    });
    showMessage('success', `备件【${spareName}】已解除绑定`);
  };

  // 备件转移模态框打开
  const openTransferModal = (spare, parentId) => {
    setTransferSpareModal({
      isOpen: true,
      spareId: spare.id,
      currentParentId: parentId,
      spareName: `${spare.assetCode} (${spare.description})`,
      targetParentId: ''
    });
  };

  // 备件转移保存逻辑（“关联其他主资产”）
  const handleConfirmTransfer = () => {
    const { spareId, currentParentId, targetParentId } = transferSpareModal;
    if (!targetParentId) {
      showMessage('error', '请选择目标主资产');
      return;
    }

    setAssets(prevAssets => {
      // 1. 深拷贝当前资产列表
      const newAssets = JSON.parse(JSON.stringify(prevAssets));
      let spareObj = null;

      // 2. 从源主资产下移除该备件
      const sourceMain = newAssets.find(main => main.id === currentParentId);
      if (sourceMain) {
        spareObj = sourceMain.children.find(child => child.id === spareId);
        sourceMain.children = sourceMain.children.filter(child => child.id !== spareId);
      }

      if (!spareObj) return prevAssets;

      // 3. 将备件添加至目标主资产下，并强制同步目标主资产的物理位置
      const targetMain = newAssets.find(main => main.id === targetParentId);
      if (targetMain) {
        const transferredSpare = {
          ...spareObj,
          city: targetMain.city,
          building: targetMain.building,
          floor: targetMain.floor,
          remark: spareObj.remark ? `${spareObj.remark} (转配自主机:${sourceMain.assetCode})` : `转配自主机:${sourceMain.assetCode}`
        };
        targetMain.children.push(transferredSpare);
        targetMain.expanded = true; // 转移后自动展开目标主机以便用户确认
      }

      return newAssets;
    });

    setTransferSpareModal({ isOpen: false, spareId: null, currentParentId: null, spareName: '', targetParentId: '' });
    showMessage('success', '备件已成功流转至新的主资产');
  };

  // 确认添加主资产
  const confirmAddMainAsset = () => {
    const assetDef = MOCK_AVAILABLE_MAIN_ASSETS.find(a => a.assetCode === selectedNewMainAsset);
    if (!assetDef) return;

    const newAsset = {
      id: `main-${Date.now()}`,
      relation: '主',
      qty: 1,
      city: '北京市', building: '土城', floor: '9层', remark: '',
      status: '在用-使用中',
      expanded: true,
      children: [],
      ...assetDef
    };

    setAssets([...assets, newAsset]);
    setAddMainModalOpen(false);
    setSelectedNewMainAsset('');
    showMessage('success', '主资产添加成功');
  };

  // 确认添加备件
  const confirmAddSparePart = () => {
    const spareDef = MOCK_AVAILABLE_SPARE_PARTS.find(a => a.assetCode === addSpareModal.selectedSpare);
    const parentAsset = assets.find(a => a.id === addSpareModal.parentId);
    if (!spareDef || !parentAsset) return;

    const newSpare = {
      id: `spare-${Date.now()}`,
      relation: '备',
      qty: 1,
      // 备件默认继承主资产的位置
      city: parentAsset.city,
      building: parentAsset.building,
      floor: parentAsset.floor,
      remark: '',
      status: '在用-使用中',
      ...spareDef
    };

    setAssets(prev => prev.map(main => {
      if (main.id === addSpareModal.parentId) {
        return { ...main, expanded: true, children: [...(main.children || []), newSpare] };
      }
      return main;
    }));

    setAddSpareModal({ isOpen: false, parentId: null, selectedSpare: '' });
    showMessage('success', '备件添加成功');
  };

  const handleSubmit = () => {
    if (!formData.changeReason.trim()) {
      showMessage('error', '请填写变更理由！');
      return;
    }
    showMessage('success', '提交成功！即将返回列表。');
    console.log('提交数据:', { formData, assets });
  };

  const getFlattenedAssets = () => {
    let flatList = [];
    assets.forEach(main => {
      flatList.push({ ...main, isMain: true, parentId: null });
      if (main.children && main.expanded) {
        main.children.forEach(child => {
          flatList.push({ ...child, isMain: false, parentId: main.id });
        });
      }
    });
    return flatList;
  };

  const displayAssets = getFlattenedAssets();

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 font-sans text-[14px] text-text-primary relative">
      
      {/* AntD 风格全局 Message 提示 */}
      {message.visible && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-none transition-all duration-300 translate-y-0 opacity-100">
          <div className="bg-white shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2.5 flex items-center gap-2 pointer-events-auto">
            {message.type === 'success' ? (
              <CheckCircle size={18} className="text-[#52c41a]" />
            ) : (
              <AlertCircle size={18} className="text-danger" />
            )}
            <span className="text-[14px] leading-tight text-text-primary">{message.content}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* 顶部申请信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center pb-4 mb-4 border-b border-border">
            <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
            <h2 className="text-[16px] font-semibold text-text-primary">申请信息</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-text-secondary leading-[32px]">申请人:</label>
              <div className="flex-1 text-text-primary leading-[32px]">{formData.applicant}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-text-secondary leading-[32px]">申请部门:</label>
              <div className="flex-1 text-text-primary leading-[32px]">{formData.department}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-text-secondary leading-[32px]">申请时间:</label>
              <div className="flex-1 text-text-primary leading-[32px]">{formData.applyTime}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-text-secondary leading-[32px]">变更类型:</label>
              <div className="flex-1 text-text-primary leading-[32px]">{formData.changeType}</div>
            </div>
            <div className="hidden md:block md:col-span-2"></div>

            <div className="md:col-span-3 flex items-start">
              <label className="w-[100px] text-right pr-4 pt-1.5 text-text-secondary">
                <span className="text-danger font-family-[SimSun] mr-1">*</span>变更理由:
              </label>
              <div className="flex-1 relative">
                <textarea 
                  name="changeReason" rows="3"
                  value={formData.changeReason}
                  onChange={handleInputChange}
                  className="w-full border border-border-input rounded-md p-2 text-[14px] leading-[1.5] transition-all hover:border-[#4096ff] focus:border-[#4096ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] outline-none resize-none"
                  placeholder="请输入变更理由"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between pb-4 mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
              <h2 className="text-[16px] font-semibold text-text-primary">资产明细</h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[14px] text-text-secondary">
                共计主资产 <span className="text-primary font-medium mx-1">{assets.length}</span> 项，明细 <span className="text-primary font-medium mx-1">{displayAssets.length}</span> 条
              </span>
              <button 
                className="flex items-center gap-1.5 px-4 py-1.5 border border-[#1677ff] text-primary rounded-md hover:bg-primary-bg transition-colors text-[14px] font-medium"
              >
                <Upload size={16} />
                <span>批量上传</span>
              </button>
            </div>
          </div>

          {/* AntD 风格表格主体 */}
          <div className="overflow-x-auto border border-border rounded-t-lg">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-text-primary border-b border-border min-w-[160px]">资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[160px]">序列号</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border w-16 text-center">关系</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[100px]">品牌</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[130px]">资产小类</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[160px]">资产说明</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[180px]">配置</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border w-16 text-center">数量</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[100px]">城市</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[130px]">建筑物</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[130px]">楼层/机房</th>
                  <th className="py-3.5 px-3 font-medium text-text-primary border-b border-border min-w-[160px]">备注</th>
                  <th className="py-3.5 px-4 font-medium text-text-primary border-b border-border w-44 text-center sticky right-0 bg-[#fafafa] z-10 shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] border-l border-border">操作</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {displayAssets.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="py-12 text-center text-text-tertiary border-b border-border">
                      暂无数据，请新增主资产
                    </td>
                  </tr>
                ) : displayAssets.map((asset) => {
                  const hasChildren = asset.isMain && asset.children && asset.children.length > 0;
                  // 定义实体的背景色，避免 sticky 列变透明
                  const rowBg = !asset.isMain ? 'bg-[#fafafa]' : 'bg-white';
                  
                  return (
                    <tr 
                      key={asset.id} 
                      className={`group border-b border-border transition-colors hover:bg-[#f5f5f5] ${rowBg}`}
                    >
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: asset.isMain ? '0px' : '24px' }}>
                          {asset.isMain && (
                            <div 
                              onClick={() => toggleExpand(asset.id)}
                              className={`w-[20px] h-[20px] flex items-center justify-center border border-border-input rounded-[4px] bg-white text-text-tertiary hover:text-primary hover:border-[#1677ff] cursor-pointer transition-all ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                              {asset.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </div>
                          )}
                          {!asset.isMain && <div className="w-[16px] h-[20px] border-l border-b border-border-input -mt-[10px] mr-1 rounded-bl-sm"></div>}
                          <span className="font-medium text-text-primary">{asset.assetCode}</span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-text-secondary text-[13px]">
                        {asset.serialNumber}
                      </td>

                      <td className="py-3 px-3 align-middle text-center">
                        <span className={`px-2 py-[2px] rounded border text-[12px] ${
                          asset.isMain 
                            ? 'bg-primary-bg text-primary border-primary-border' 
                            : 'bg-[#fafafa] text-text-secondary border-border-input'
                        }`}>
                          {asset.relation}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-middle text-text-primary">
                        {asset.brand}
                      </td>
                      <td className="py-3 px-3 align-middle text-text-secondary text-[13px]">
                        {asset.minorCategory}
                      </td>
                      
                      <td className="py-3 px-3 align-middle">
                        <div className="text-text-primary truncate max-w-[160px]" title={asset.description}>{asset.description}</div>
                      </td>
                      <td className="py-3 px-3 align-middle">
                        <div className="text-text-secondary text-[13px] truncate max-w-[180px]" title={asset.config}>{asset.config}</div>
                      </td>

                      <td className="py-3 px-3 align-middle text-center text-text-primary">{asset.qty}</td>
                      
                      {/* 地点展示区 */}
                      {['city', 'building', 'floor'].map((field) => (
                        <td key={field} className="py-2 px-3 align-middle text-text-secondary text-[13px]">
                          {asset[field] || '-'}
                        </td>
                      ))}

                      <td className="py-2 px-3 align-middle">
                        <input 
                          type="text" value={asset.remark || ''} placeholder="选填..."
                          onChange={(e) => handleAssetChange(asset.id, 'remark', e.target.value)}
                          className="w-full border border-border-input rounded px-2.5 py-1.5 text-[13px] text-text-primary outline-none transition-all focus:border-[#4096ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] hover:border-[#4096ff] placeholder:text-text-disabled" 
                        />
                      </td>

                      {/* Sticky 操作区列 - 已重构为极致轻盈、一致的无背景纯文本链接按钮样式 */}
                      <td className={`py-3 px-4 align-middle text-center sticky right-0 z-10 border-l border-border transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] ${rowBg} group-hover:bg-[#f5f5f5]`}>
                        <div className="flex items-center justify-center gap-2">
                          {asset.isMain ? (
                            // 主资产操作：添加备件 与 删除
                            <>
                              <button 
                                onClick={() => setAddSpareModal({ isOpen: true, parentId: asset.id, selectedSpare: '' })}
                                className="text-primary hover:text-primary-hover transition-colors text-[13px] font-medium"
                              >
                                添加备件
                              </button>
                              <span className="text-[#f0f0f0] select-none">|</span>
                              <button 
                                onClick={() => handleDeleteMain(asset.id)}
                                className="text-danger hover:text-danger-hover transition-colors flex items-center justify-center p-1"
                                title="删除主资产(将同时删除其关联备件)"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            // 备件操作：扁平的“解除” 与 “关联其他” 纯文字链接按钮
                            <>
                              {/* 解除绑定 */}
                              <button
                                onClick={() => handleUnbindSpare(asset.id, asset.parentId, asset.description)}
                                className="flex items-center gap-1.5 text-[#ff7875] hover:text-danger transition-colors text-[13px] font-medium py-1 px-1.5 rounded hover:bg-danger-bg"
                                title="解绑此备件，从本主机移除"
                              >
                                <IconUnlink size={13} className="shrink-0" />
                                <span>解除</span>
                              </button>

                              <span className="text-[#f0f0f0] select-none">|</span>

                              {/* 流转到其他主资产 */}
                              <button
                                onClick={() => openTransferModal(asset, asset.parentId)}
                                className="flex items-center gap-1.5 text-primary hover:text-primary-hover transition-colors text-[13px] font-medium py-1 px-1.5 rounded hover:bg-primary-bg"
                                title="将此备件重新关联至另一台主机"
                              >
                                <IconExchange size={13} className="shrink-0" />
                                <span>关联其他</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* AntD 风格底部新增主资产按钮 */}
          <div className="border border-border border-t-0 rounded-b-lg p-3 bg-[#fafafa]/50 flex justify-center">
             <button 
                onClick={() => setAddMainModalOpen(true)}
                className="w-full max-w-[150px] flex items-center justify-center gap-1.5 px-4 py-2 border border-dashed border-border-input bg-white text-text-secondary rounded-md hover:text-primary hover:border-[#1677ff] transition-colors text-[14px]"
              >
                <Plus size={16} />
                <span>添加主资产</span>
              </button>
          </div>
        </div>

        <div className="flex justify-center items-center py-6 gap-4">
          <button className="h-8 px-6 border border-border-input text-text-primary bg-white rounded-md hover:text-primary-hover hover:border-[#4096ff] transition-all text-[14px]">
            返回
          </button>
          <button 
            onClick={handleSubmit}
            className="h-8 px-8 bg-[#1677ff] text-white rounded-md hover:bg-[#4096ff] shadow-[0_2px_0_rgba(5,145,255,0.1)] transition-all text-[14px] font-medium"
          >
            提交
          </button>
        </div>

        {/* 模态框 1: 新增主资产 */}
        {addMainModalOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-text-primary">新增主资产</h3>
                <X size={16} className="text-text-tertiary hover:text-text-primary" onClick={() => setAddMainModalOpen(false)} />
              </div>
              <div className="p-6">
                <label className="block text-[14px] text-text-primary mb-2">
                  <span className="text-danger font-family-[SimSun] mr-1">*</span>选择基础资产数据
                </label>
                <select 
                  value={selectedNewMainAsset} onChange={(e) => setSelectedNewMainAsset(e.target.value)}
                  className="w-full border border-border-input rounded-md h-8 px-3 text-[14px] text-text-primary outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                >
                  <option value="">请搜索或选择要添加的主资产...</option>
                  {MOCK_AVAILABLE_MAIN_ASSETS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} - {ast.description} ({ast.serialNumber})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-[13px] text-text-tertiary bg-[#fafafa] border border-border p-3 rounded">
                  💡 提示：添加主资产后，您可以继续在其操作列中为其绑定相关的备件信息。
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-border flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setAddMainModalOpen(false)} className="h-8 px-4 border border-border-input rounded-md hover:text-primary-hover hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={confirmAddMainAsset} disabled={!selectedNewMainAsset} className={`h-8 px-4 rounded-md shadow-sm transition-all ${selectedNewMainAsset ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-[#f5f5f5] text-text-disabled border border-border-input cursor-not-allowed'}`}>确定添加</button>
              </div>
            </div>
          </div>
        )}

        {/* 模态框 2: 为主资产绑定备件 */}
        {addSpareModal.isOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-text-primary">为主资产添加备件</h3>
                <X size={16} className="text-text-tertiary hover:text-text-primary" onClick={() => setAddSpareModal({ isOpen: false, parentId: null, selectedSpare: '' })} />
              </div>
              <div className="p-6">
                <label className="block text-[14px] text-text-primary mb-2">
                  <span className="text-danger font-family-[SimSun] mr-1">*</span>选择备件数据
                </label>
                <select 
                  value={addSpareModal.selectedSpare} onChange={(e) => setAddSpareModal({...addSpareModal, selectedSpare: e.target.value})}
                  className="w-full border border-border-input rounded-md h-8 px-3 text-[14px] text-text-primary outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                >
                  <option value="">请搜索或选择关联备件...</option>
                  {MOCK_AVAILABLE_SPARE_PARTS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} - {ast.description} ({ast.minorCategory})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-[13px] text-text-tertiary bg-[#fafafa] border border-border p-3 rounded flex gap-2">
                   <AlertCircle size={15} className="mt-[2px] shrink-0 text-primary"/>
                   <span>备件添加后，其位置信息（城市/建筑/楼层）将强制与当前绑定的主资产保持一致，无法单独修改。</span>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-border flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setAddSpareModal({ isOpen: false, parentId: null, selectedSpare: '' })} className="h-8 px-4 border border-border-input rounded-md hover:text-primary-hover hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={confirmAddSparePart} disabled={!addSpareModal.selectedSpare} className={`h-8 px-4 rounded-md shadow-sm transition-all ${addSpareModal.selectedSpare ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-[#f5f5f5] text-text-disabled border border-border-input cursor-not-allowed'}`}>确认绑定</button>
              </div>
            </div>
          </div>
        )}

        {/* 模态框 3: 备件流转/关联其他主资产 */}
        {transferSpareModal.isOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-text-primary">备件流转转配</h3>
                <X size={16} className="text-text-tertiary hover:text-text-primary" onClick={() => setTransferSpareModal({ isOpen: false, spareId: null, currentParentId: null, spareName: '', targetParentId: '' })} />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-[13px] text-text-tertiary mb-1">正在流转的备件</div>
                  <div className="font-semibold text-[14px] text-text-primary bg-[#fafafa] border border-border p-2.5 rounded">
                    {transferSpareModal.spareName}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] text-text-primary mb-2">
                    <span className="text-danger font-family-[SimSun] mr-1">*</span>选择目标主资产 (流转至该服务器)
                  </label>
                  <select 
                    value={transferSpareModal.targetParentId} 
                    onChange={(e) => setTransferSpareModal({...transferSpareModal, targetParentId: e.target.value})}
                    className="w-full border border-border-input rounded-md h-8 px-3 text-[14px] text-text-primary outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                  >
                    <option value="">请选择目标服务器...</option>
                    {assets
                      .filter(main => main.id !== transferSpareModal.currentParentId) // 过滤掉当前的父资产
                      .map(main => (
                        <option key={main.id} value={main.id}>
                          {main.assetCode} - {main.description} ({main.serialNumber} | 物理位置: {main.city}-{main.building})
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="text-[13px] text-text-tertiary bg-primary-bg border border-primary-border p-3 rounded flex gap-2">
                   <AlertCircle size={15} className="mt-[2px] shrink-0 text-primary"/>
                   <span>⚠️ 注意：完成转配后，该备件在表单中的城市、建筑、楼层等物理地址，将自动继承并变更为所选目标主机对应的物理地址，实现资产流转一体化。</span>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-border flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setTransferSpareModal({ isOpen: false, spareId: null, currentParentId: null, spareName: '', targetParentId: '' })} className="h-8 px-4 border border-border-input rounded-md hover:text-primary-hover hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={handleConfirmTransfer} disabled={!transferSpareModal.targetParentId} className={`h-8 px-4 rounded-md shadow-sm transition-all ${transferSpareModal.targetParentId ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-[#f5f5f5] text-text-disabled border border-border-input cursor-not-allowed'}`}>确认转移</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MainSpareEdit;