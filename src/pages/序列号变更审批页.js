import React, { useState } from 'react';

// 复用图标
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
const IconImage = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

// 模拟来自后端的审批数据，包含序列号变更前后的信息
const MOCK_APPROVAL_DATA = {
  formNumber: 'MIG-202605150012',
  applicantInfo: {
    applicant: '吕静 (115720)',
    department: 'IDC运维部',
    applyTime: '2026-05-12 10:30:00',
    changeType: '序列号变更',
    changeReason: '因业务扩容需求，厂商免费更换更大内存及硬盘，导致部分主板及部件更换，序列号随之更新。'
  },
  assets: [
    {
      id: 1,
      assetCode: 'SRV-BJ-2024-001',
      // 模拟序列号变更轨迹
      serialNumberChange: {
        old: 'SN-DELL-R750-001',
        new: 'SN-DELL-R750-001-NEW'
      },
      snPhoto: 'https://placehold.co/100x100/e2e8f0/64748b?text=SN-NEW',
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
      // 修改为已变更的序列号，展示变更效果
      serialNumberChange: {
        old: 'SN-HPE-DL380-001',
        new: 'SN-HPE-DL380-001-UPDATE'
      },
      snPhoto: 'https://placehold.co/100x100/e2e8f0/64748b?text=SN-UPDATE',
      remark: '暂不迁移',
      description: 'HPE ProLiant DL380 Gen10 服务器',
      qty: 1,
      city: '北京市',
      building: '搜狐媒体大厦',
      floor: 'B2 核心机房',
      status: '在用-使用中',
    }
  ]
};

const App = () => {
  const { applicantInfo, formNumber, assets } = MOCK_APPROVAL_DATA;
  const [message, setMessage] = useState({ type: '', content: '', visible: false });
  const [approvalComment, setApprovalComment] = useState('');

  // 全局提示
  const showMessage = (type, content) => {
    setMessage({ type, content, visible: true });
    setTimeout(() => setMessage({ type: '', content: '', visible: false }), 3000);
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

  // 渲染变更字段的高亮样式
  const renderChangedField = (fieldData) => {
    if (!fieldData) return '-';
    const hasChanged = fieldData.old !== fieldData.new;
    
    if (hasChanged) {
      return (
        <div className="flex flex-col gap-[4px] items-start py-1">
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
              <IconCheckCircle size={18} className="text-[#52c41a]" />
            ) : (
              <IconAlertCircle size={18} className="text-[#ff4d4f]" />
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
              申请单号：{formNumber}
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
              共计资产 <span className="text-[#1677ff] font-medium mx-1">{assets.length}</span> 项
            </div>
          </div>

          <div className="overflow-x-auto border border-[#f0f0f0] rounded-lg">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[180px]">资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[220px]">序列号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-24 text-center">照片</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[200px]">资产说明</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">数量</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">City</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[140px]">Building</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[120px]">Floor</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[140px]">备注</th>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[120px]">资产状态</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {assets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className="border-b border-[#f0f0f0] transition-colors hover:bg-[#f5f5f5]"
                  >
                    <td className="py-3 px-4 align-middle">
                      <span className="font-medium text-[rgba(0,0,0,0.88)]">{asset.assetCode}</span>
                    </td>
                    
                    {/* 序列号变更字段 */}
                    <td className="py-2 px-3 align-middle text-[13px]">
                      {renderChangedField(asset.serialNumberChange)}
                    </td>

                    <td className="py-3 px-3 align-middle text-center">
                      <div className="flex items-center justify-center">
                        {asset.snPhoto ? (
                          <div className="relative w-10 h-10 rounded-[4px] border border-[#d9d9d9] overflow-hidden shadow-sm cursor-pointer group hover:border-[#1677ff] transition-colors">
                            <img src={asset.snPhoto} alt="SN Preview" className="w-full h-full object-cover" />
                            {/* 悬浮提示查看大图 */}
                            <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-[10px]">查看</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-[4px] border border-dashed border-[#d9d9d9] bg-[#fafafa] flex items-center justify-center text-[rgba(0,0,0,0.25)]">
                            <IconImage size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.88)]">
                      <div className="truncate max-w-[200px]" title={asset.description}>{asset.description}</div>
                    </td>
                    
                    <td className="py-3 px-3 align-middle text-center text-[rgba(0,0,0,0.88)]">{asset.qty}</td>
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">{asset.city}</td>
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">{asset.building}</td>
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">{asset.floor}</td>
                    <td className="py-3 px-3 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">{asset.remark || '-'}</td>
                    <td className="py-3 px-4 align-middle text-[rgba(0,0,0,0.65)] text-[13px]">{asset.status}</td>
                  </tr>
                ))}
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
        {/* <button className="h-9 px-6 border border-[#d9d9d9] text-[rgba(0,0,0,0.88)] bg-white rounded-md hover:text-[#4096ff] hover:border-[#4096ff] transition-all text-[14px]">
          返回列表
        </button> */}
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

export default App;