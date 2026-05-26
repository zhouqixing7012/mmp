import React, { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

// 模拟来自后端的审批数据，包含原位置和新位置的变更轨迹信息
const MOCK_APPROVAL_DATA = {
  formNumber: 'MIG-202605120008',
  applicantInfo: {
    applicant: '吕静 (115720)',
    department: 'IDC运维部',
    applyTime: '2026-05-12 10:30:00',
    changeType: '位置变更',
    changeReason: '因业务扩容需求，将搜狐媒体大厦部分测试服务器迁移至酒仙桥IDC机房进行统一部署。'
  },
  assets: [
    {
      id: 1,
      assetCode: 'SRV-BJ-2024-001',
      serialNumber: 'SN-DELL-R750-001',
      relation: '主',
      description: 'Dell PowerEdge R750 机架式服务器',
      qty: 1,
      remark: '已上架',
      status: '在用-使用中',
      expanded: true, // 控制子节点展开状态
      // 包含变更前后的字段
      locationChange: {
        city: { old: '北京市', new: '北京市' }, // 未变
        building: { old: '搜狐媒体大厦', new: '酒仙桥IDC机房' }, // 已变
        floor: { old: 'B2 核心机房', new: '3层 302机房' } // 已变
      },
      children: [
        {
          id: 11,
          assetCode: 'PART-MEM-001',
          serialNumber: 'SN-SAMSUNG-DDR4-01',
          relation: '备',
          description: 'Samsung 64GB DDR4 3200MHz 内存条',
          qty: 4,
          remark: '随主机迁移',
          status: '在用-使用中',
          locationChange: {
            city: { old: '北京市', new: '北京市' },
            building: { old: '搜狐媒体大厦', new: '酒仙桥IDC机房' },
            floor: { old: 'B2 核心机房', new: '3层 302机房' }
          }
        },
        {
          id: 12,
          assetCode: 'PART-HDD-001',
          serialNumber: 'SN-SEAGATE-8T-01',
          relation: '备',
          description: 'Seagate 8TB 7.2K RPM SATA 硬盘',
          qty: 2,
          remark: '随主机迁移',
          status: '在用-使用中',
          locationChange: {
            city: { old: '北京市', new: '北京市' },
            building: { old: '搜狐媒体大厦', new: '酒仙桥IDC机房' },
            floor: { old: 'B2 核心机房', new: '3层 302机房' }
          }
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
      remark: '暂不迁移',
      status: '在用-使用中',
      expanded: false,
      locationChange: {
        city: { old: '北京市', new: '北京市' },
        building: { old: '搜狐媒体大厦', new: '搜狐媒体大厦' }, // 未变
        floor: { old: 'B2 核心机房', new: 'B2 核心机房' } // 未变
      },
      children: [
        {
          id: 21,
          assetCode: 'PART-MEM-002',
          serialNumber: 'SN-HYNIX-DDR4-01',
          relation: '备',
          description: 'SK Hynix 32GB DDR4 2933MHz 内存条',
          qty: 8,
          remark: '',
          status: '在用-使用中',
          locationChange: {
            city: { old: '北京市', new: '北京市' },
            building: { old: '搜狐媒体大厦', new: '搜狐媒体大厦' },
            floor: { old: 'B2 核心机房', new: 'B2 核心机房' }
          }
        }
      ]
    }
  ]
};

const PositionChangeApproval = () => {
  const { applicantInfo } = MOCK_APPROVAL_DATA;
  const [assets, setAssets] = useState(MOCK_APPROVAL_DATA.assets);
  const [message, setMessage] = useState({ type: '', content: '', visible: false });
  const [approvalComment, setApprovalComment] = useState('');

  // 全局提示
  const showMessage = (type, content) => {
    setMessage({ type, content, visible: true });
    setTimeout(() => setMessage({ type: '', content: '', visible: false }), 3000);
  };

  // 展开/折叠树形节点
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

  // 审批操作
  const handleApprove = () => {
    showMessage('success', '审批已通过！');
  };

  const handleReject = () => {
    if (!approvalComment.trim()) {
      showMessage('error', '驳回操作必须填写审批意见！');
      return;
    }
    showMessage('success', '单据已驳回！');
  };

  const handleAddSigner = () => {
    showMessage('success', '已进入加签流程！');
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

  // 辅助渲染位置变更字段的函数：上方是置灰+删除线的旧值，下方是黄色标签框包裹的新值
  const renderLocationField = (fieldData) => {
    if (!fieldData) return '-';
    const hasChanged = fieldData.old !== fieldData.new;
    
    if (hasChanged) {
      return (
        <div className="flex flex-col gap-[4px] items-start">
          <span className="text-[rgba(0,0,0,0.35)] text-[12px] line-through decoration-1 leading-none">
            {fieldData.old}
          </span>
          <span className="inline-block px-2 py-[2px] bg-[#fffbe6] border border-[#ffe58f] text-[#faad14] rounded-[4px] font-medium text-[13px] leading-tight">
            {fieldData.new}
          </span>
        </div>
      );
    }
    return <span className="text-[rgba(0,0,0,0.88)]">{fieldData.new}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 font-sans text-[14px] text-[rgba(0,0,0,0.88)] relative pb-24">
      
      {/* 消息提示 */}
      {message.visible && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center justify-center transition-all duration-300">
          <div className="bg-white shadow-lg rounded-lg px-4 py-2.5 flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle size={18} className="text-[#52c41a]" />
            ) : (
              <AlertCircle size={18} className="text-[#ff4d4f]" />
            )}
            <span>{message.content}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* 申请信息面板 (只读) */}
        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0f0f0]">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
              <h2 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">申请信息</h2>
              <span className="ml-4 px-2 py-0.5 bg-[#e6f4ff] text-[#1677ff] border border-[#91caff] rounded text-[12px]">待审批</span>
            </div>
            <div className="text-[14px] text-[rgba(0,0,0,0.65)] font-medium">
              申请单号：{MOCK_APPROVAL_DATA.formNumber}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)]">申请人:</label>
              <div className="flex-1 font-medium">{applicantInfo.applicant}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)]">申请部门:</label>
              <div className="flex-1">{applicantInfo.department}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)]">申请时间:</label>
              <div className="flex-1">{applicantInfo.applyTime}</div>
            </div>
            <div className="flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)]">变更类型:</label>
              <div className="flex-1">{applicantInfo.changeType}</div>
            </div>
            <div className="md:col-span-3 flex items-start">
              <label className="w-[100px] text-right pr-4 text-[rgba(0,0,0,0.65)]">变更理由:</label>
              <div className="flex-1 text-[rgba(0,0,0,0.88)] leading-relaxed">
                {applicantInfo.changeReason}
              </div>
            </div>
          </div>
        </div>

        {/* 资产明细列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6">
          <div className="flex items-center justify-between pb-4 mb-4">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#1677ff] mr-3 rounded-sm"></div>
              <h2 className="text-[16px] font-semibold text-[rgba(0,0,0,0.88)]">资产明细</h2>
            </div>
            <div className="text-[14px] text-[rgba(0,0,0,0.65)]">
              共计主资产 <span className="text-[#1677ff] font-medium mx-1">{assets.length}</span> 项，明细 <span className="text-[#1677ff] font-medium mx-1">{displayAssets.length}</span> 条
            </div>
          </div>

          <div className="overflow-x-auto border border-[#f0f0f0] rounded-lg">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[200px]">资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[140px]">序列号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-20 text-center">主备关系</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[180px]">资产说明</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">数量</th>
                  {/* 位置相关字段 */}
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">城市</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[200px]">建筑物</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[200px]">楼层/机房</th>
                  
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[140px]">备注</th>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[120px] text-center sticky right-0 bg-[#fafafa] z-10 shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] border-l border-[#f0f0f0]">资产状态</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {displayAssets.map((asset) => {
                  const hasChildren = asset.children && asset.children.length > 0;
                  const isMain = asset.relation === '主';
                  const rowBg = isMain ? 'bg-white' : 'bg-[#fafafa]';

                  return (
                    <tr 
                      key={asset.id} 
                      className={`border-b border-[#f0f0f0] transition-colors hover:bg-[#f5f5f5] ${rowBg}`}
                    >
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: isMain ? '0px' : '24px' }}>
                          {isMain && (
                            <div 
                              onClick={() => toggleExpand(asset.id)}
                              className={`w-[20px] h-[20px] flex items-center justify-center border border-[#d9d9d9] rounded-[4px] bg-white text-[rgba(0,0,0,0.45)] hover:text-[#1677ff] hover:border-[#1677ff] cursor-pointer transition-all ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                              {asset.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </div>
                          )}
                          {!isMain && <div className="w-[16px] h-[20px] border-l border-b border-[#d9d9d9] -mt-[10px] mr-1 rounded-bl-sm"></div>}
                          <span className={`font-medium ${isMain ? 'text-[rgba(0,0,0,0.88)]' : 'text-[rgba(0,0,0,0.65)]'}`}>
                            {asset.assetCode}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                        {asset.serialNumber}
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-center">
                        <span className={`px-2 py-[2px] rounded border text-[12px] ${isMain ? 'bg-[#e6f4ff] text-[#1677ff] border-[#91caff]' : 'bg-[#fafafa] text-[rgba(0,0,0,0.65)] border-[#d9d9d9]'}`}>
                          {asset.relation}
                        </span>
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.88)]">
                        <div className="truncate max-w-[180px]" title={asset.description}>{asset.description}</div>
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-center text-[rgba(0,0,0,0.88)]">
                        {asset.qty}
                      </td>
                      
                      {/* 渲染位置字段：支持高亮和箭头指示 */}
                      <td className="py-2 px-3 align-middle text-[13px]">
                        {renderLocationField(asset.locationChange?.city)}
                      </td>
                      <td className="py-2 px-3 align-middle text-[13px]">
                        {renderLocationField(asset.locationChange?.building)}
                      </td>
                      <td className="py-2 px-3 align-middle text-[13px]">
                        {renderLocationField(asset.locationChange?.floor)}
                      </td>
                      
                      <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">
                        {asset.remark || '-'}
                      </td>
                      
                      <td className={`py-3 px-4 align-middle text-center text-[rgba(0,0,0,0.65)] text-[13px] sticky right-0 z-10 border-l border-[#f0f0f0] transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] ${rowBg}`}>
                        {asset.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 审批意见填写区 */}
        <div className="bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-6 mb-8">
          <h2 className="text-[14px] font-medium text-[rgba(0,0,0,0.88)] mb-3">审批意见</h2>
          <textarea 
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            className="w-full border border-[#d9d9d9] rounded-md p-3 text-[14px] leading-[1.5] transition-all hover:border-[#4096ff] focus:border-[#4096ff] focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)] outline-none resize-none min-h-[80px]"
            placeholder="请输入审批意见（驳回必填）..."
          ></textarea>
        </div>

      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 flex justify-center items-center gap-4">
        <button 
          onClick={handleReject}
          className="h-9 px-8 border border-[#ff4d4f] text-[#ff4d4f] bg-white rounded-md hover:bg-[#fff2f0] transition-all text-[14px] font-medium"
        >
          驳回
        </button>
        <button 
          onClick={handleAddSigner}
          className="h-9 px-8 border border-[#d9d9d9] text-[rgba(0,0,0,0.88)] bg-white rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all text-[14px] font-medium"
        >
          加签
        </button>
        <button 
          onClick={handleApprove}
          className="h-9 px-8 bg-[#1677ff] text-white rounded-md hover:bg-[#4096ff] shadow-[0_2px_0_rgba(5,145,255,0.1)] transition-all text-[14px] font-medium"
        >
          同意
        </button>
      </div>

    </div>
  );
};

export default PositionChangeApproval;