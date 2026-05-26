import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';


// 模拟来自后端的审批数据（包含变更状态 changeStatus）
const MOCK_APPROVAL_DATA = {
  formNumber: 'XXX-202605130006',
  applicantInfo: {
    applicant: '梁声 (111160)',
    department: '新媒体',
    applyTime: '2026-05-12 10:30:00',
    changeType: '主备维护',
    changeReason: '针对Dell.R730服务器及其相关备件进行统一的资产信息规范及位置校准更新。由于旧内存损坏申请解除，并新增一块网卡。'
  },
  assets: [
    {
      id: 'main-1',
      assetCode: '114141605224',
      serialNumber: '4XMSWG2',
      relation: '主',
      brand: 'Dell',
      minorCategory: '服务器-机架式',
      description: 'Dell.R730',
      config: 'E5-2620V3*2,16G DDR4*8,600G*8',
      qty: 1,
      city: '北京市',
      building: '土城',
      floor: '9层',
      remark: '原位置: TC9-903-8-1-8', 
      expanded: true, 
      children: [
        // 故意打乱顺序，测试排序逻辑
        {
          id: 'spare-1-1',
          assetCode: 'PART-HDD-012',
          serialNumber: 'SN-DELL-HDD-02',
          relation: '备',
          brand: 'Dell',
          minorCategory: '服务器硬盘',
          description: '2.5寸 600G 10K SAS',
          config: '600G 10K SAS',
          qty: 8,
          city: '北京市', building: '土城', floor: '9层',
          remark: '无变更备件', 
          changeStatus: '' // 空状态
        },
        {
          id: 'spare-1-2',
          assetCode: 'PART-MEM-009',
          serialNumber: 'SN-DELL-MEM-01',
          relation: '备',
          brand: 'Dell',
          minorCategory: '服务器内存',
          description: '16G DDR4 ECC RDIMM',
          config: '16G DDR4',
          qty: 8,
          city: '北京市', building: '土城', floor: '9层',
          remark: '内存损坏，申请解除绑定', 
          changeStatus: 'remove' // 解除状态
        },
        {
          id: 'spare-1-3',
          assetCode: 'PART-NIC-001',
          serialNumber: 'SN-INTEL-X710-01',
          relation: '备',
          brand: 'Intel',
          minorCategory: '服务器网卡',
          description: 'Intel X710-DA2',
          config: '万兆双口网卡 光口',
          qty: 1,
          city: '北京市', building: '土城', floor: '9层',
          remark: '新领用网卡绑定', 
          changeStatus: 'add' // 新增状态
        }
      ]
    },
    {
      id: 'main-2',
      assetCode: '114141605225',
      serialNumber: '5YNTWH3',
      relation: '主',
      brand: 'HPE',
      minorCategory: '服务器-机架式',
      description: 'HPE ProLiant DL380 Gen10',
      config: 'Xeon Silver 4210*2, 32G DDR4*4',
      qty: 1,
      city: '上海市', building: '张江', floor: '3层',
      remark: '无变更', 
      expanded: true, 
      children: []
    }
  ]
};

const App = () => {
  const { applicantInfo } = MOCK_APPROVAL_DATA;
  const [assets, setAssets] = useState(MOCK_APPROVAL_DATA.assets);
  const [message, setMessage] = useState({ type: '', content: '', visible: false });
  const [approvalComment, setApprovalComment] = useState('');

  // 全局提示
  const showMessage = (type, content) => {
    setMessage({ type, content, visible: true });
    setTimeout(() => setMessage({ type: '', content: '', visible: false }), 3000);
  };

  // 展开/折叠
  const toggleExpand = (id) => {
    setAssets(prev => prev.map(item => item.id === id ? { ...item, expanded: !item.expanded } : item));
  };

  // 审批操作
  const handleApprove = () => {
    showMessage('success', '审批已通过！');
    console.log('Approve Payload:', { assets, approvalComment });
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

  // 获取排序并扁平化的资产列表
  const displayAssets = useMemo(() => {
    let flatList = [];
    
    // 定义状态优先级权重: 新增(1) > 解除(2) > 空(3)
    const getStatusWeight = (status) => {
      if (status === 'add') return 1;
      if (status === 'remove') return 2;
      return 3;
    };

    assets.forEach(main => {
      flatList.push({ ...main, isMain: true, parentId: null });
      
      if (main.children && main.expanded) {
        // 对子备件进行排序
        const sortedChildren = [...main.children].sort((a, b) => {
          return getStatusWeight(a.changeStatus) - getStatusWeight(b.changeStatus);
        });

        sortedChildren.forEach(child => {
          flatList.push({ ...child, isMain: false, parentId: main.id });
        });
      }
    });
    return flatList;
  }, [assets]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 font-sans text-[14px] text-[rgba(0,0,0,0.88)] relative pb-24">
      
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
              {/* <span className="ml-4 text-[13px] text-[rgba(0,0,0,0.45)]">
                💡 备件已按 <span className="text-[#52c41a]">新增</span>、<span className="text-[#ff4d4f]">解除</span>、无变更 顺序自动排列
              </span> */}
            </div>
            <div className="text-[14px] text-[rgba(0,0,0,0.65)]">
              共计主资产 <span className="text-[#1677ff] font-medium mx-1">{assets.length}</span> 项，明细 <span className="text-[#1677ff] font-medium mx-1">{displayAssets.length}</span> 条
            </div>
          </div>

          <div className="overflow-x-auto border border-[#f0f0f0] rounded-lg">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-[#fafafa]">
                <tr>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">资产标签号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[140px]">序列号</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">关系</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">品牌</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[120px]">资产小类</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">资产说明</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-16 text-center">数量</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[100px]">城市</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[120px]">建筑物</th>
                  <th className="py-3.5 px-3 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[120px]">楼层/机房</th>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] min-w-[160px]">备注</th>
                  <th className="py-3.5 px-4 font-medium text-[rgba(0,0,0,0.88)] border-b border-[#f0f0f0] w-24 text-center sticky right-0 bg-[#fafafa] z-10 shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] border-l border-[#f0f0f0]">变更状态</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {displayAssets.map((asset) => {
                  const hasChildren = asset.isMain && asset.children && asset.children.length > 0;
                  
                  // 1. 判断是否是被解除的行
                  const isRemoved = asset.changeStatus === 'remove';
                  // 2. 如果解除，整行文本颜色置灰，并添加删除线 (只对数据单元格生效，排除图标和状态标签)
                  const rowTextClass = isRemoved ? 'text-[rgba(0,0,0,0.35)] line-through decoration-1' : 'text-[rgba(0,0,0,0.88)]';
                  // 3. 背景色处理
                  const rowBgClass = isRemoved ? 'bg-[#fffbfa]' : (asset.isMain ? 'bg-white' : 'bg-[#fafafa]');

                  return (
                    <tr 
                      key={asset.id} 
                      className={`border-b border-[#f0f0f0] transition-colors hover:bg-[#f5f5f5] ${rowBgClass}`}
                    >
                      {/* 1. 资产标签号 */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: asset.isMain ? '0px' : '24px' }}>
                          {asset.isMain && (
                            <div 
                              onClick={() => toggleExpand(asset.id)}
                              className={`w-[20px] h-[20px] flex items-center justify-center border border-[#d9d9d9] rounded-[4px] bg-white text-[rgba(0,0,0,0.45)] hover:text-[#1677ff] hover:border-[#1677ff] cursor-pointer transition-all ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                              {asset.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </div>
                          )}
                          {!asset.isMain && <div className="w-[16px] h-[20px] border-l border-b border-[#d9d9d9] -mt-[10px] mr-1 rounded-bl-sm"></div>}
                          {/* 标签号应用删除线 */}
                          <span className={`font-medium ${isRemoved ? rowTextClass : 'text-[rgba(0,0,0,0.88)]'}`}>
                            {asset.assetCode}
                          </span>
                        </div>
                      </td>

                      {/* 其他字段统一应用 rowTextClass 控制置灰和删除线 */}
                      <td className={`py-3 px-3 align-middle text-[13px] ${isRemoved ? rowTextClass : 'text-[rgba(0,0,0,0.65)]'}`}>
                        {asset.serialNumber}
                      </td>

                      <td className="py-3 px-3 align-middle text-center">
                        <span className={`px-2 py-[2px] rounded border text-[12px] ${
                          isRemoved 
                            ? 'bg-transparent text-[rgba(0,0,0,0.35)] border-[rgba(0,0,0,0.2)] line-through' // 解除状态的关系标签也置灰
                            : (asset.isMain ? 'bg-[#e6f4ff] text-[#1677ff] border-[#91caff]' : 'bg-[#fafafa] text-[rgba(0,0,0,0.65)] border-[#d9d9d9]')
                        }`}>
                          {asset.relation}
                        </span>
                      </td>

                      <td className={`py-3 px-3 align-middle ${rowTextClass}`}>{asset.brand}</td>
                      <td className={`py-3 px-3 align-middle text-[13px] ${isRemoved ? rowTextClass : 'text-[rgba(0,0,0,0.65)]'}`}>{asset.minorCategory}</td>
                      <td className={`py-3 px-3 align-middle ${rowTextClass}`}>
                        <div className="truncate max-w-[160px]" title={asset.description}>{asset.description}</div>
                      </td>
                      <td className={`py-3 px-3 align-middle text-center ${rowTextClass}`}>{asset.qty}</td>
                      
                      {/* 地理位置 */}
                      {['city', 'building', 'floor'].map((field) => (
                        <td key={field} className={`py-2 px-3 align-middle text-[13px] ${isRemoved ? rowTextClass : 'text-[rgba(0,0,0,0.65)]'}`}>
                          {asset[field] || '-'}
                        </td>
                      ))}

                      {/* 备注变为只读展示 */}
                      <td className={`py-3 px-4 align-middle text-[13px] ${isRemoved ? rowTextClass : 'text-[rgba(0,0,0,0.65)]'}`}>
                        {asset.remark || '-'}
                      </td>

                      {/* 2. 变更状态标签列 (移至最后并作为冻结列) */}
                      <td className={`py-3 px-4 align-middle text-center sticky right-0 z-10 border-l border-[#f0f0f0] transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.12)] ${rowBgClass}`}>
                        {asset.changeStatus === 'add' && (
                          <span className="inline-block px-2 py-0.5 bg-[#f6ffed] border border-[#b7eb8f] text-[#52c41a] rounded text-[12px] whitespace-nowrap">
                            新增
                          </span>
                        )}
                        {asset.changeStatus === 'remove' && (
                          <span className="inline-block px-2 py-0.5 bg-[#fff2f0] border border-[#ffccc7] text-[#ff4d4f] rounded text-[12px] whitespace-nowrap">
                            解除
                          </span>
                        )}
                        {!asset.changeStatus && <span className="text-[rgba(0,0,0,0.25)] text-[12px]">-</span>}
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

export default MainSpareApproval;