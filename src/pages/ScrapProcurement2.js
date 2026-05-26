import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, UserPlus, X, AlertCircle, Eye, ShieldCheck, ShoppingCart, Download, ThumbsUp } from 'lucide-react';

// --- 模拟已提交的单据数据 (包含了内审部的历史填报数据) ---
const submittedData = {
  docNo: 'SCRAP-20231027-8842',
  status: '审批中',
  currentNode: '采购部审批',
  responsiblePerson: 'kingdee (开发测试账号)',
  applyDate: '2023-10-27',
  reason: '设备严重老化，主板烧毁，已无维修价值，申请整体报废处理并联系回收商。',
  assets: [
    { id: 1, tagNo: 'AST-SRV-099', serialNo: 'DELL-R740-001', qty: 1, category: 'IT设备', subCategory: '服务器', desc: '戴尔服务器', company: '金蝶软件', segment: '研发中心', originalValue: '45000.00', netValue: '12000.00', status: '在用', city: '深圳', building: '机房中心', floor: '1F', photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=150&q=80' }
  ],
  accessories: [
    { id: 2, parentTagNo: 'AST-SRV-099', tagNo: 'ACC-HD-001', serialNo: 'WD-1TB-001', qty: 2, category: 'IT配件', subCategory: '硬盘', desc: '企业级硬盘 1TB', company: '金蝶软件', segment: '研发中心', originalValue: '2000.00', netValue: '500.00', status: '在用', city: '深圳', building: '机房', floor: '1F', photoUrl: '' }
  ],
  // 模拟上一节点(内审部)填写的只读数据
  internalAuditQuotations: [
    {
      id: 1,
      quotationAmount: '12000.00',
      supplier: '深圳市绿能环保回收有限公司',
      attachmentName: '内审部资产评估参考报告_20231028.pdf'
    },
    {
      id: 2,
      quotationAmount: '12500.00',
      supplier: '广环再生资源利用有限公司',
      attachmentName: '广环报价单_20231029.pdf'
    }
  ]
};

export default function ScrapProcurement2() {
  const [activeTab, setActiveTab] = useState('main'); 
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // 衍生数据：内审部报价按金额从高到低排序
  const sortedQuotations = [...submittedData.internalAuditQuotations].sort(
    (a, b) => parseFloat(b.quotationAmount) - parseFloat(a.quotationAmount)
  );
  // 获取最高报价金额（用于动态打标签）
  const maxQuotationAmount = sortedQuotations.length > 0 ? parseFloat(sortedQuotations[0].quotationAmount) : 0;

  // 当前节点：采购部专属填报数据 (通过下拉框联动)
  const [purchasingQuotation, setPurchasingQuotation] = useState({
    supplierId: '',
    quotationAmount: '',
    supplier: '',
    attachmentName: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4000);
  };

  const handleSupplierChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    if (!selectedId) {
      setPurchasingQuotation({ supplierId: '', quotationAmount: '', supplier: '', attachmentName: '' });
      return;
    }
    const selectedQuote = submittedData.internalAuditQuotations.find(q => q.id === selectedId);
    if (selectedQuote) {
      setPurchasingQuotation({
        supplierId: selectedId,
        quotationAmount: selectedQuote.quotationAmount,
        supplier: selectedQuote.supplier,
        attachmentName: selectedQuote.attachmentName
      });
    }
  };

  const handleExport = () => {
    showToast('报废资产明细已开始导出', 'success');
  };

  const handleApprovalAction = (actionName) => {
    if (actionName === '同意') {
      if (!purchasingQuotation.supplier) {
        showToast('请选择最终回收供应商', 'error');
        return;
      }
      showToast('审批已同意，单据流转至下一节点', 'success');
    } else if (actionName === '驳回') {
      showToast('已驳回该报废申请', 'error');
    } else if (actionName === '加签') {
      showToast('已发起加签请求', 'success');
    }
  };

  const currentList = activeTab === 'main' ? submittedData.assets : submittedData.accessories;

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
        
        {}
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

        {}
        {/* 报废资产明细模块 (全局只读) */}
        <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <h2 className="font-semibold">报废资产明细</h2>
            </div>
            <button onClick={handleExport} className="flex items-center text-xs px-3 py-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-gray-700 transition-colors">
              <Download className="w-4 h-4 mr-1" /> 导出明细
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
              <table className="w-full text-left whitespace-nowrap min-w-[1400px]">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2 w-12 text-center text-gray-600 font-medium">#</th>
                    {activeTab === 'accessory' && <th className="p-2 font-medium text-gray-600 bg-gray-200/50">所属主资产</th>}
                    <th className="p-2 font-medium text-gray-600">资产标签号</th>
                    <th className="p-2 font-medium text-gray-600">序列号</th>
                    <th className="p-2 font-medium text-gray-600 text-center">数量</th>
                    <th className="p-2 font-medium text-gray-600">资产大类</th>
                    <th className="p-2 font-medium text-gray-600">资产小类</th>
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
                      <td className="p-3">{row.subCategory}</td>
                      <td className="p-3" title={row.desc}>{row.desc}</td>
                      <td className="p-3">{row.company}</td>
                      <td className="p-3">{row.segment}</td>
                      <td className="p-3 text-right">{row.originalValue}</td>
                      <td className="p-3 text-right">{row.netValue}</td>
                      <td className="p-3">{row.status}</td>
                      <td className="p-3 text-gray-500">{row.city}</td>
                      <td className="p-3 text-gray-500">{row.building}</td>
                      <td className="p-3 text-gray-500">{row.floor}</td>
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

        {}
        {/* ✨ 内审部报价信息 (全局只读) - 历史节点数据 ✨ */}
        <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center text-gray-600">
            <ShieldCheck className="w-4 h-4 mr-2" />
            <h2 className="font-semibold">内审部报价信息</h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2 w-16 text-center text-gray-600 font-medium">序号</th>
                    <th className="p-2 font-medium text-gray-600">回收供应商</th>
                    <th className="p-2 font-medium text-gray-600 text-right">报价金额（元）</th>
                    <th className="p-2 font-medium text-gray-600">报价附件</th>
                    <th className="p-2 font-medium text-gray-600 text-center">内审部建议</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedQuotations.map((item, index) => {
                    const isRecommended = parseFloat(item.quotationAmount) === maxQuotationAmount;
                    return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors text-gray-700">
                      <td className="p-3 text-center text-gray-400">{index + 1}</td>
                      <td className="p-3 font-medium">{item.supplier}</td>
                      <td className="p-3 text-right font-medium text-gray-800">{item.quotationAmount}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-blue-500 hover:underline cursor-pointer">{item.attachmentName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {index === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                            推荐
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        // {isRecommended ? (
                        //   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                        //     <ThumbsUp className="w-3 h-3 mr-1" /> 推荐
                        //   </span>
                        // ) : (
                        //   <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {}
        {/* ✨ 采购部专属操作区 (可编辑) - 当前待办节点 ✨ */}
        <section className="bg-blue-50/50 border border-blue-200 rounded-md shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="bg-white px-4 py-3 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center text-blue-800">
              <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
              <span className="font-semibold">采购部最终报价信息</span>
              <span className="ml-2 text-xs text-blue-600">(请确认并选择最终回收数据)</span>
            </div>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-700 mb-1 font-medium">最终回收供应商 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={purchasingQuotation.supplierId || ''}
                    onChange={handleSupplierChange}
                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-shadow cursor-pointer appearance-none"
                  >
                    <option value="">-- 请选择最终回收供应商 --</option>
                    {sortedQuotations.map(quote => {
                      const isRecommended = parseFloat(quote.quotationAmount) === maxQuotationAmount;
                      return (
                        <option key={quote.id} value={quote.id}>
                          {quote.supplier} {isRecommended ? ' (内审推荐最高价)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 mb-1 font-medium">报价金额（元）</label>
                <input 
                  type="text" 
                  readOnly
                  value={purchasingQuotation.quotationAmount}
                  placeholder="自动带出" 
                  className="border border-gray-200 rounded p-2 bg-gray-50 text-gray-500 cursor-not-allowed outline-none" 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 mb-1 font-medium">最终报价附件</label>
                <div className="flex items-center h-10 w-full border border-gray-200 rounded bg-gray-50 px-3 overflow-hidden">
                  {purchasingQuotation.attachmentName ? (
                    <>
                      <FileText className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 truncate text-sm" title={purchasingQuotation.attachmentName}>
                        {purchasingQuotation.attachmentName}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">选择供应商后自动带出</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {}
      {/* ✨ 底部审批操作区 ✨ */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] p-4 flex justify-center space-x-6 z-40">
        <button onClick={() => handleApprovalAction('同意')} className="flex items-center px-12 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-md font-medium text-base hover:shadow-lg">
          <CheckCircle className="w-5 h-5 mr-2" /> 同意
        </button>
        <button onClick={() => handleApprovalAction('驳回')} className="flex items-center px-8 py-2.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-md font-medium text-base hover:shadow-lg">
          <XCircle className="w-5 h-5 mr-2" /> 驳回
        </button>
        <button onClick={() => handleApprovalAction('加签')} className="flex items-center px-8 py-2.5 bg-white text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm font-medium text-base hover:shadow-md">
          <UserPlus className="w-5 h-5 mr-2" /> 加签
        </button>
      </footer>
    </div>
  );
}