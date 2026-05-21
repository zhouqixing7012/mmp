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
const IconChevronRight = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const IconChevronDown = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
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
  { assetCode: 'SRV-BJ-2024-003', serialNumber: 'SN-LENOVO-SR650-01', brand: 'Lenovo', majorCategory: 'SERVER', minorCategory: '服务器-机架式', description: 'Lenovo ThinkSystem SR650', config: 'Xeon Silver 4210R*2, 64G' },
  { assetCode: 'SRV-BJ-2024-004', serialNumber: 'SN-INSPUR-5280M5-01', brand: 'Inspur', majorCategory: 'SERVER', minorCategory: '服务器-机架式', description: 'Inspur NF5280M5', config: 'Xeon Gold 5218*2, 128G' },
  { assetCode: 'SRV-BJ-2024-005', serialNumber: 'SN-HUAWEI-2288H-01', brand: 'Huawei', majorCategory: 'SERVER', minorCategory: '服务器-机架式', description: 'Huawei TaiShan 2288H V5', config: 'Kunpeng 920*2, 256G' },
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

  // 删除逻辑 (主资产带走备件，备件仅删自身)
  const handleDelete = (id, parentId = null) => {
    setAssets(prevAssets => {
      if (parentId) {
        // 删除的是备件
        return prevAssets.map(main => {
          if (main.id === parentId) {
            return { ...main, children: main.children.filter(child => child.id !== id) };
          }
          return main;
        });
      } else {
        // 删除的是主资产
        return prevAssets.filter(main => main.id !== id);
      }
    });
    showMessage('success', '删除成功');
  };

  // 确认添加主资产
  const confirmAddMainAsset = () => {
    const assetDef = MOCK_AVAILABLE_MAIN_ASSETS.find(a => a.assetCode === selectedNewMainAsset);
    if (!assetDef) return;

    const newAsset = {
      id: `main-${Date.now()}`,
      relation: '主',
      qty: 1,
      city: '', building: '', floor: '', remark: '',
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

        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6">
          <div className="flex items-center justify-between pb-4 mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
              <h2 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">资产明细</h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[14px] text-[rgba(0,0,0,0.65)]">
                共计主资产 <span className="text-[#1677ff] font-medium mx-1">{assets.length}</span> 项，明细 <span className="text-[#1677ff] font-medium mx-1">{displayAssets.length}</span> 条
              </span>
              <button 
                className="flex items-center gap-1.5 px-4 py-1.5 border border-[#1677ff] text-[#1677ff] rounded-md hover:bg-[#e6f4ff] transition-colors text-[14px] font-medium"
              >
                <IconUpload size={16} />
                <span>批量上传</span>
              </button>
            </div>
          </div>

          {/* AntD 风格表格主体 */}
          <div className="overflow-x-auto border border-[#f0f0f0] rounded-t-lg">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">序列号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">关系</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">品牌</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[130px]">资产小类</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">资产说明</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[180px]">配置</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">数量</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">城市</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[130px]">建筑物</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[130px]">楼层/机房</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">备注</th>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-36 text-center sticky right-0 bg-[#fafafa] z-10 shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] border-l border-[#f0f0f0]">操作</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {displayAssets.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="py-12 text-center text-[rgba(0,0,0,0.45)] border-b border-[#f0f0f0]">
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
                      className={`group border-b border-[#f0f0f0] transition-colors hover:bg-[#f5f5f5] ${rowBg}`}
                    >
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: asset.isMain ? '0px' : '24px' }}>
                          {asset.isMain && (
                            <div 
                              onClick={() => toggleExpand(asset.id)}
                              className={`w-[20px] h-[20px] flex items-center justify-center border border-[#d9d9d9] rounded-[4px] bg-white text-[rgba(0,0,0,0.45)] hover:text-[#1677ff] hover:border-[#1677ff] cursor-pointer transition-all ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                              {asset.expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                            </div>
                          )}
                          {!asset.isMain && <div className="w-[16px] h-[20px] border-l border-b border-[#d9d9d9] -mt-[10px] mr-1 rounded-bl-sm"></div>}
                          <span className="font-medium text-[rgba(0,0,0,0.88)]">{asset.assetCode}</span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                        {asset.serialNumber}
                      </td>

                      <td className="py-3 px-3 align-middle text-center">
                        <span className={`px-2 py-[2px] rounded border text-[12px] ${
                          asset.isMain 
                            ? 'bg-[#e6f4ff] text-[#1677ff] border-[#91caff]' 
                            : 'bg-[#fafafa] text-[rgba(0,0,0,0.65)] border-[#d9d9d9]'
                        }`}>
                          {asset.relation}
                        </span>
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
                      
                      {/* 禁用编辑的地点展示 */}
                      {['city', 'building', 'floor'].map((field) => (
                        <td key={field} className="py-2 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                          {asset[field] || '-'}
                        </td>
                      ))}

                      <td className="py-2 px-3 align-middle">
                        <input 
                          type="text" value={asset.remark || ''} placeholder="选填..."
                          onChange={(e) => handleAssetChange(asset.id, 'remark', e.target.value)}
                          className="w-full border border-[#d9d9d9] rounded px-2.5 py-1.5 text-[13px] text-[rgba(0,0,0,0.88)] outline-none transition-all focus:border-[#4096ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] hover:border-[#4096ff] placeholder:text-[rgba(0,0,0,0.25)]" 
                        />
                      </td>

                      <td className={`py-3 px-4 align-middle text-center sticky right-0 z-10 border-l border-[#f0f0f0] transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] ${rowBg} group-hover:bg-[#f5f5f5]`}>
                        <div className="flex items-center justify-center gap-3">
                          {asset.isMain && (
                            <button 
                              onClick={() => setAddSpareModal({ isOpen: true, parentId: asset.id, selectedSpare: '' })}
                              className="text-[#1677ff] hover:text-[#4096ff] transition-colors text-[13px] font-medium"
                            >
                              添加备件
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(asset.id, asset.parentId)}
                            className="text-[#ff4d4f] hover:text-[#ff7875] transition-colors flex items-center justify-center p-1"
                            title={asset.isMain ? "删除主资产(将同时删除其关联备件)" : "删除备件"}
                          >
                            <IconTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* AntD 风格底部新增主资产按钮 */}
          <div className="border border-[#f0f0f0] border-t-0 rounded-b-lg p-3 bg-[#fafafa]/50 flex justify-center">
             <button 
                onClick={() => setAddMainModalOpen(true)}
                className="w-full max-w-[150px] flex items-center justify-center gap-1.5 px-4 py-2 border border-dashed border-[#d9d9d9] bg-white text-[rgba(0,0,0,0.65)] rounded-md hover:text-[#1677ff] hover:border-[#1677ff] transition-colors text-[14px]"
              >
                <IconPlus size={16} />
                <span>添加主资产</span>
              </button>
          </div>
        </div>

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

        {addMainModalOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">新增主资产</h3>
                <IconX size={16} className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.88)]" onClick={() => setAddMainModalOpen(false)} />
              </div>
              <div className="p-6">
                <label className="block text-[14px] text-[rgba(0,0,0,0.88)] mb-2">
                  <span className="text-[#ff4d4f] font-family-[SimSun] mr-1">*</span>选择基础资产数据
                </label>
                <select 
                  value={selectedNewMainAsset} onChange={(e) => setSelectedNewMainAsset(e.target.value)}
                  className="w-full border border-[#d9d9d9] rounded-md h-8 px-3 text-[14px] text-[rgba(0,0,0,0.88)] outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                >
                  <option value="">请搜索或选择要添加的主资产...</option>
                  {MOCK_AVAILABLE_MAIN_ASSETS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} - {ast.description} ({ast.serialNumber})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-[13px] text-[rgba(0,0,0,0.45)] bg-[#fafafa] border border-[#f0f0f0] p-3 rounded">
                  💡 提示：添加主资产后，您可以继续在其操作列中为其绑定相关的备件信息。
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-[#f0f0f0] flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setAddMainModalOpen(false)} className="h-8 px-4 border border-[#d9d9d9] rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={confirmAddMainAsset} disabled={!selectedNewMainAsset} className={`h-8 px-4 rounded-md shadow-sm transition-all ${selectedNewMainAsset ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-[#f5f5f5] text-[rgba(0,0,0,0.25)] border border-[#d9d9d9] cursor-not-allowed'}`}>确定添加</button>
              </div>
            </div>
          </div>
        )}

        {addSpareModal.isOpen && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full max-w-[520px] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
                <h3 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">为主资产添加备件</h3>
                <IconX size={16} className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.88)]" onClick={() => setAddSpareModal({ isOpen: false, parentId: null, selectedSpare: '' })} />
              </div>
              <div className="p-6">
                <label className="block text-[14px] text-[rgba(0,0,0,0.88)] mb-2">
                  <span className="text-[#ff4d4f] font-family-[SimSun] mr-1">*</span>选择备件数据
                </label>
                <select 
                  value={addSpareModal.selectedSpare} onChange={(e) => setAddSpareModal({...addSpareModal, selectedSpare: e.target.value})}
                  className="w-full border border-[#d9d9d9] rounded-md h-8 px-3 text-[14px] text-[rgba(0,0,0,0.88)] outline-none hover:border-[#4096ff] focus:border-[#4096ff] transition-all bg-white"
                >
                  <option value="">请搜索或选择关联备件...</option>
                  {MOCK_AVAILABLE_SPARE_PARTS.map(ast => (
                    <option key={ast.assetCode} value={ast.assetCode}>
                      {ast.assetCode} - {ast.description} ({ast.minorCategory})
                    </option>
                  ))}
                </select>
                <div className="mt-4 text-[13px] text-[rgba(0,0,0,0.45)] bg-[#fafafa] border border-[#f0f0f0] p-3 rounded flex gap-2">
                   <IconAlertCircle size={15} className="mt-[2px] shrink-0 text-[#1677ff]"/>
                   <span>备件添加后，其位置信息（城市/建筑/楼层）将强制与当前绑定的主资产保持一致，无法单独修改。</span>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-[#f0f0f0] flex justify-end gap-2 bg-[#fafafa]">
                <button onClick={() => setAddSpareModal({ isOpen: false, parentId: null, selectedSpare: '' })} className="h-8 px-4 border border-[#d9d9d9] rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all bg-white">取消</button>
                <button onClick={confirmAddSparePart} disabled={!addSpareModal.selectedSpare} className={`h-8 px-4 rounded-md shadow-sm transition-all ${addSpareModal.selectedSpare ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-[#f5f5f5] text-[rgba(0,0,0,0.25)] border border-[#d9d9d9] cursor-not-allowed'}`}>确认绑定</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;