import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, UserPlus, Upload, X, AlertCircle, Eye, Download } from 'lucide-react';

// --- 模拟已提交的单据数据 ---
const submittedData = {
  docNo: 'SCRAP-20231027-8842',
  status: '审批中',
  currentNode: '采购部审批',
  responsiblePerson: 'kingdee (开发测试账号)',
  applyDate: '2023-10-27',
  reason: '设备严重老化，主板烧毁，已无维修价值，申请整体报废处理并联系回收商。',
  assets: [
    { id: 1, tagNo: 'AST-SRV-099', serialNo: 'DELL-R740-001', qty: 1, category: 'IT设备', subCategory: '服务器', desc: '戴尔服务器', status: '在用', originalValue: '45000.00', netValue: '12000.00', startDate: '2020-05-10', scrapReason: '主板烧毁', company: '金蝶中国', segment: '云服务', city: '深圳', building: '机房中心', floor: '1F', location: '机柜A12', photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=150&q=80' }
  ],
  accessories: [
    { id: 2, parentTagNo: 'AST-SRV-099', tagNo: 'ACC-HD-001', serialNo: 'WD-1TB-001', qty: 2, category: 'IT配件', subCategory: '硬盘', desc: '企业级硬盘 1TB', status: '在用', originalValue: '2000.00', netValue: '500.00', startDate: '2020-05-10', scrapReason: '随主资产报废', company: '金蝶中国', segment: '云服务', city: '深圳', building: '机房', floor: '1F', location: '机柜A12', photoUrl: '' }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('main'); 
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // 填写方选择
  const [infoProvider, setInfoProvider] = useState('purchasing'); // 'purchasing' 或 'internalaudit'

  // 采购部专属填报数据
  const [quotationData, setQuotationData] = useState({
    quoteAmount: '',
    supplier: '',
    attachmentName: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4000);
  };

  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuotationData(prev => ({ ...prev, attachmentName: file.name }));
      showToast(`报价附件 ${file.name} 上传成功`);
    }
    e.target.value = null;
  };

  const handleApprovalAction = (actionName) => {
    if (actionName === '同意') {
      if (infoProvider === 'purchasing' && (!quotationData.quoteAmount || !quotationData.supplier || !quotationData.attachmentName)) {
        showToast('请完整填写报价金额、回收供应商，并上传报价附件', 'error');
        return;
      }
      showToast('审批已同意，流转至下一节点', 'success');
    } else if (actionName === '驳回') {
      showToast('单据已驳回给申请人', 'error');
    } else if (actionName === '加签') {
      showToast('已打开加签人员选择窗口', 'success');
    }
  };

  const currentList = activeTab === 'main' ? submittedData.assets : submittedData.accessories;

  // 导出 CSV 功能
  const handleExport = () => {
    let csvContent = '\uFEFF'; // 添加 BOM 确保 Excel 能正确识别 UTF-8
    
    // 表头
    let headers = [];
    if (activeTab === 'accessory') {
      headers = ['序号', '所属主资产', '资产标签号', '序列号', '数量', '资产大类', '资产说明', '公司', '板块', '原值', '净值', '资产状态', 'City', 'Building', 'Floor'];
    } else {
      headers = ['序号', '资产标签号', '序列号', '数量', '资产大类', '资产说明', '公司', '板块', '原值', '净值', '资产状态', 'City', 'Building', 'Floor'];
    }
    csvContent += headers.join(',') + '\n';

    // 表格内容
    currentList.forEach((row, index) => {
      let rowData = [];
      rowData.push(index + 1);
      if (activeTab === 'accessory') rowData.push(row.parentTagNo || '');
      rowData.push(row.tagNo || '');
      rowData.push(row.serialNo || '');
      rowData.push(row.qty || '');
      rowData.push(row.category || '');
      // 处理说明中可能存在的逗号
      rowData.push(`"${(row.desc || '').replace(/"/g, '""')}"`); 
      rowData.push(row.company || '');
      rowData.push(row.segment || '');
      rowData.push(row.originalValue || '');
      rowData.push(row.netValue || '');
      rowData.push(row.status || '');
      rowData.push(row.city || '');
      rowData.push(row.building || '');
      rowData.push(row.floor || '');
      
      csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `报废明细_${activeTab === 'main' ? '主资产' : '关联配件'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('表格导出成功');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-sm text-gray-800">
      
      {/* Toast 提示 */}
      {toast.visible && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center px-4 py-3 rounded shadow-lg transition-all ${toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
          {toast.message}
        </div>
      )}

      {/* 图片预览模态框 */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors" onClick={() => setPreviewImage(null)}>
              <X className="w-8 h-8" />
            </button>
            <img src={previewImage} alt="预览" className="max-w-full max-h-[85vh] rounded shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          报废申请单审批 
          <span className="ml-3 px-2.5 py-0.5 text-xs font-normal bg-orange-100 text-orange-700 border border-orange-200 rounded-full">当前节点：{submittedData.currentNode}</span>
        </h1>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-5">
        
        {/* 基本信息模块 (全局只读) */}
        <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center text-gray-600">
            <FileText className="w-4 h-4 mr-2" />
            <h2 className="font-semibold">基本信息</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">单据编号</span>
                <span className="font-mono text-gray-800">{submittedData.docNo}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">单据状态</span>
                <span className="text-blue-600 font-medium">{submittedData.status}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">资产责任人</span>
                <span className="text-gray-800">{submittedData.responsiblePerson}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">申请日期</span>
                <span className="text-gray-800">{submittedData.applyDate}</span>
              </div>
              <div className="flex flex-col md:col-span-4">
                <span className="text-gray-500 mb-1">报废说明</span>
                <div className="bg-gray-50 p-3 rounded border border-gray-100 text-gray-700 min-h-[60px]">
                  {submittedData.reason}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 报废资产明细模块 (全局只读) - 移到中间 */}
        <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <h2 className="font-semibold">报废资产明细</h2>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-1.5 text-gray-500" />
              导出表格
            </button>
          </div>
          
          <div className="px-4 pt-3 pb-1 border-b border-gray-100 flex space-x-6 text-sm">
            <span onClick={() => setActiveTab('main')} className={`cursor-pointer font-medium pb-2 px-1 ${activeTab === 'main' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500 border-b-2 border-transparent'}`}>
              报废资产 ({submittedData.assets.length})
            </span>
            <span onClick={() => setActiveTab('accessory')} className={`cursor-pointer font-medium pb-2 px-1 ${activeTab === 'accessory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500 border-b-2 border-transparent'}`}>
              关联配件 ({submittedData.accessories.length})
            </span>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left whitespace-nowrap min-w-[1300px]">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2 w-12 text-center text-gray-600 font-medium">#</th>
                    {activeTab === 'accessory' && <th className="p-2 font-medium text-gray-600 bg-gray-200/50">所属主资产</th>}
                    <th className="p-2 font-medium text-gray-600">资产标签号</th>
                    <th className="p-2 font-medium text-gray-600">序列号</th>
                    <th className="p-2 font-medium text-gray-600 text-center">数量</th>
                    <th className="p-2 font-medium text-gray-600">资产大类</th>
                    <th className="p-2 font-medium text-gray-600">资产说明</th>
                    <th className="p-2 font-medium text-gray-600">公司</th>
                    <th className="p-2 font-medium text-gray-600">板块</th>
                    <th className="p-2 font-medium text-gray-600 text-right">原值</th>
                    <th className="p-2 font-medium text-gray-600 text-right">净值</th>
                    <th className="p-2 font-medium text-gray-600">资产状态</th>
                    <th className="p-2 font-medium text-gray-600">City</th>
                    <th className="p-2 font-medium text-gray-600">Building</th>
                    <th className="p-2 font-medium text-gray-600">Floor</th>
                    <th className="p-2 font-medium text-gray-600 text-center">资产照片</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentList.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors text-gray-700">
                      <td className="p-3 text-center text-gray-400">{index + 1}</td>
                      {activeTab === 'accessory' && <td className="p-3 bg-gray-50 font-mono text-gray-500">{row.parentTagNo}</td>}
                      <td className="p-3 font-mono">{row.tagNo}</td>
                      <td className="p-3 text-gray-500">{row.serialNo}</td>
                      <td className="p-3 text-center">{row.qty}</td>
                      <td className="p-3">{row.category}</td>
                      <td className="p-3" title={row.desc}>{row.desc}</td>
                      <td className="p-3">{row.company}</td>
                      <td className="p-3">{row.segment}</td>
                      <td className="p-3 text-right">{row.originalValue}</td>
                      <td className="p-3 text-right">{row.netValue}</td>
                      <td className="p-3">{row.status}</td>
                      <td className="p-3">{row.city}</td>
                      <td className="p-3">{row.building}</td>
                      <td className="p-3">{row.floor}</td>
                      <td className="p-3 text-center">
                        {row.photoUrl ? (
                          <button onClick={() => setPreviewImage(row.photoUrl)} className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline">
                            <Eye className="w-4 h-4 mr-1" /> 查看
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ✨ 采购部专属操作区 (可编辑) - 移到下方 ✨ */}
        <section className="bg-blue-50/50 border border-blue-200 rounded-md shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="bg-white px-4 py-2.5 border-b border-blue-100 flex items-center text-blue-800">
            <span className="font-semibold">报价信息</span>
            <span className="ml-2 text-xs text-blue-600">(请选择填写方并完善相关数据)</span>
          </div>
          <div className="p-6 bg-white">
            <div className="mb-6 flex items-center">
              <label className="text-gray-700 mr-4 font-medium">信息填写方 <span className="text-red-500">*</span></label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    value="purchasing" 
                    checked={infoProvider === 'purchasing'} 
                    onChange={(e) => setInfoProvider(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">采购部</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    value="internalaudit" 
                    checked={infoProvider === 'internalaudit'} 
                    onChange={(e) => setInfoProvider(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">内审部</span>
                </label>
              </div>
            </div>

            {infoProvider === 'purchasing' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <label className="text-gray-700 mb-1 font-medium">报价金额（元） <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="quoteAmount"
                    value={quotationData.quoteAmount}
                    onChange={handleQuotationChange}
                    placeholder="请输入金额" 
                    className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white" 
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-700 mb-1 font-medium">回收供应商 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="supplier"
                    value={quotationData.supplier}
                    onChange={handleQuotationChange}
                    placeholder="请输入供应商名称" 
                    className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white" 
                  />
                </div>

                <div className="flex flex-col md:col-span-4 mt-2">
                  <label className="text-gray-700 mb-1 font-medium">报价附件 <span className="text-red-500">*</span></label>
                  <div className="flex items-center h-10 md:max-w-sm">
                    <input type="file" className="hidden" id="quote-upload" onChange={handleFileUpload} />
                    {quotationData.attachmentName ? (
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 h-full w-full">
                        <span className="text-blue-600 truncate flex-grow text-sm" title={quotationData.attachmentName}>{quotationData.attachmentName}</span>
                        <button onClick={() => setQuotationData(prev => ({...prev, attachmentName: ''}))} className="text-gray-400 hover:text-red-500 ml-2"><X className="w-4 h-4"/></button>
                      </div>
                    ) : (
                      <label htmlFor="quote-upload" className="w-full h-full border border-dashed border-gray-300 rounded text-center text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer flex items-center justify-center transition-colors bg-gray-50/50 hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" /> 点击上传附件
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ✨ 底部审批操作区 (定制颜色) ✨ */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] p-4 flex justify-center space-x-4 md:space-x-6 z-40">

        {/* 同意按钮 - 绿色 (主操作，强化视觉) */}
        <button onClick={() => handleApprovalAction('同意')} className="flex items-center px-8 md:px-10 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-md font-medium text-base">
          <CheckCircle className="w-5 h-5 mr-2" /> 同意
        </button>

        {/* 驳回按钮 - 红色 */}
        <button onClick={() => handleApprovalAction('驳回')} className="flex items-center px-8 md:px-10 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md font-medium text-base">
          <XCircle className="w-5 h-5 mr-2" /> 驳回
        </button>

        {/* 加签按钮 - 次要线框样式 */}
        <button onClick={() => handleApprovalAction('加签')} className="flex items-center px-8 md:px-10 py-2.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors shadow-sm font-medium text-base">
          <UserPlus className="w-5 h-5 mr-2" /> 加签
        </button>
        
      </footer>
    </div>
  );
}