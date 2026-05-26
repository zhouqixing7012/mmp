import React, { useState } from 'react';
import { 
  X, Plus, Save, ArrowLeft, Settings, FileSpreadsheet, 
  Download, Paperclip, ChevronLeft, ChevronRight, Search, 
  Trash2, Edit, AlertCircle, Send 
} from 'lucide-react';

// --- 模拟初始数据 ---
const initialData = [
  {
    id: 1,
    category: 'IT设备.笔记本电脑',
    tagNo: 'AST-2023-001',
    assetNo: 'NO-20230001',
    description: '联想ThinkPad T14',
    keyword: '笔记本',
    qty: 1,
    originalValue: '8500.00',
    purchaseDate: '2023-01-15',
    lifeMonths: 36,
    accumulatedDepreciation: '4250.00',
    netValue: '4250.00',
    responsiblePerson: '张三',
    responsiblePersonId: 'EMP001',
    city: '北京',
    location: '朝阳区A座',
    floor: '5F',
    scrapMethod: '全部报废',
    scrapType: '已到报废期',
    reason: '设备老化，性能不达标',
  },
  {
    id: 2,
    category: '办公家具.办公椅',
    tagNo: 'AST-2021-045',
    assetNo: 'NO-20210045',
    description: '人体工学椅',
    keyword: '办公椅',
    qty: 5,
    originalValue: '2500.00',
    purchaseDate: '2021-06-20',
    lifeMonths: 60,
    accumulatedDepreciation: '2000.00',
    netValue: '500.00',
    responsiblePerson: '李四',
    responsiblePersonId: 'EMP002',
    city: '上海',
    location: '浦东新区B座',
    floor: '12F',
    scrapMethod: '部分报废',
    scrapType: '未到报废期',
    reason: '靠背断裂无法修复',
  }
];

export default function AccountingScrapEdit() {
  const [formData, setFormData] = useState({
    docNo: 'BF-202309280001',
    company: '114.新媒体',
    status: '草稿',
    creator: 'admin-系统管理员',
    createDate: '2023-09-28',
    remarks: ''
  });

  const [tableData, setTableData] = useState(initialData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // --- 事件处理 ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(tableData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      category: '新增资产类别', tagNo: 'NEW-TAG-' + Date.now().toString().slice(-4), assetNo: 'NEW-ASSET', description: '新增资产说明', keyword: '新增',
      qty: 1, originalValue: '1000.00', purchaseDate: '2023-10-01', lifeMonths: 36,
      accumulatedDepreciation: '100.00', netValue: '900.00',
      responsiblePerson: '测试员', responsiblePersonId: 'EMP999', city: '未知', location: '未知', floor: '1F',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '测试原因'
    };
    setTableData([...tableData, newRow]);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setTableData(tableData.filter(row => !selectedRows.includes(row.id)));
    setSelectedRows([]);
  };

  const handleDeleteRow = (id) => {
    setTableData(tableData.filter(row => row.id !== id));
    setSelectedRows(selectedRows.filter(rowId => rowId !== id));
  };

  const handleTableChange = (id, field, value) => {
    setTableData(prevData =>
      prevData.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // 模拟 20MB 限制 (20 * 1024 * 1024 bytes)
      if (file.size > 20971520) {
        alert(`文件 "${file.name}" 超过 20MB 限制！`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setAttachments([...attachments, ...validFiles.map(f => ({ name: f.name, size: (f.size/1024/1024).toFixed(2) + ' MB' }))]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-sm text-gray-800 pb-20">
      {/* 主要内容区 */}
      <div className="flex-1 p-4 space-y-4">
        
        {/* 蓝色标题头 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-4 py-2 text-white font-medium flex items-center">
            报废申请单物资列表
          </div>

          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 pb-2 border-b border-gray-100">账面报废申请单</h2>
            
            {/* 表单区域 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <label className="text-gray-500 w-24 text-right">申请单号</label>
                <input type="text" value={formData.docNo} readOnly className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700 outline-none" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-gray-500 w-24 text-right"><span className="text-red-500 mr-1">*</span>公司</label>
                <input type="text" name="company" value={formData.company} readOnly className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700 outline-none cursor-default" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-gray-500 w-24 text-right">单据状态</label>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700">{formData.status}</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-gray-500 w-24 text-right">制单人</label>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700">{formData.creator}</div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-gray-500 w-24 text-right">制单时间</label>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700">{formData.createDate}</div>
              </div>
              <div className="col-span-1 md:col-span-3 flex items-start space-x-3 mt-2">
                <label className="text-gray-500 w-24 text-right pt-1">备注</label>
                <textarea 
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleFormChange} 
                  placeholder="请输入备注信息..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2 min-h-[60px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y" 
                />
              </div>
              
              {/* 简化后的附件字段 */}
              <div className="col-span-1 md:col-span-3 flex items-start space-x-3 mt-2">
                <label className="text-gray-500 w-24 text-right pt-1.5">附件</label>
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="relative inline-block">
                      <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm text-sm">
                        <Paperclip className="w-4 h-4 mr-1.5" /> 
                        上传附件
                      </button>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 text-gray-300" /> 单个文件大小不超过 20MB
                    </span>
                  </div>
                  
                  {/* 已上传文件列表 (Chips 形式) */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center bg-gray-50 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-700 group">
                          <Paperclip className="w-3 h-3 text-gray-400 mr-1.5" />
                          <span className="max-w-[150px] truncate mr-2" title={file.name}>{file.name}</span>
                          <span className="text-gray-400 mr-2">{file.size}</span>
                          <button 
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="删除"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 列表及工具栏区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* 工具栏 */}
          <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center space-x-2">
              <button onClick={handleAddRow} className="flex items-center px-3 py-1.5 text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> 添加物资
              </button>
              <button onClick={handleDeleteSelected} disabled={selectedRows.length === 0} className="flex items-center px-3 py-1.5 text-red-600 bg-white border border-gray-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium">
                <Trash2 className="w-4 h-4 mr-1.5" /> 删除物资
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1.5 text-green-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> 导出明细
              </button>
              <button className="flex items-center px-3 py-1.5 text-blue-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm">
                <Download className="w-4 h-4 mr-1.5" /> 下载模板
              </button>
              <button className="flex items-center px-3 py-1.5 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:text-green-600 transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-1.5 text-green-500" /> Excel导入
              </button>
            </div>
          </div>

          {/* 表格容器 */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[2400px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="p-3 w-12 text-center sticky left-0 bg-gray-50 z-10 border-r">
                    <input type="checkbox" onChange={handleSelectAll} checked={tableData.length > 0 && selectedRows.length === tableData.length} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="p-3 w-16 text-center border-r">行号</th>
                  <th className="p-3 w-20 text-center border-r">操作</th>
                  <th className="p-3 border-r min-w-[140px]">资产类别</th>
                  <th className="p-3 border-r min-w-[140px]">资产标签号</th>
                  <th className="p-3 border-r min-w-[120px]">资产编号</th>
                  <th className="p-3 border-r min-w-[160px]">资产说明</th>
                  <th className="p-3 border-r min-w-[120px]">资产关键字</th>
                  <th className="p-3 border-r w-20 text-right">数量</th>
                  <th className="p-3 border-r min-w-[100px] text-right">原值</th>
                  <th className="p-3 border-r min-w-[120px] text-center">购买日期</th>
                  <th className="p-3 border-r min-w-[120px] text-right">资产寿命（月）</th>
                  <th className="p-3 border-r min-w-[100px] text-right">累计折旧</th>
                  <th className="p-3 border-r min-w-[100px] text-right">净值</th>
                  <th className="p-3 border-r min-w-[100px]">责任人姓名</th>
                  <th className="p-3 border-r min-w-[100px]">责任人工号</th>
                  <th className="p-3 border-r min-w-[100px]">资产所在城市</th>
                  <th className="p-3 border-r min-w-[120px]">资产所在地点</th>
                  <th className="p-3 border-r min-w-[100px]">资产所在楼层</th>
                  <th className="p-3 border-r min-w-[100px]">报废方式</th>
                  <th className="p-3 border-r min-w-[100px]">报废类型</th>
                  <th className="p-3 min-w-[150px]">报废原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="22" className="p-8 text-center text-gray-400 bg-gray-50/50">
                      暂无物资数据，请点击“添加物资”或“Excel导入”
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors bg-white">
                      <td className="p-2 text-center sticky left-0 bg-inherit border-r border-gray-100 z-10">
                        <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleSelectRow(row.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="p-2 text-center text-gray-500 border-r border-gray-100">{index + 1}</td>
                      <td className="p-2 text-center border-r border-gray-100">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleDeleteRow(row.id)} className="text-red-500 hover:text-red-700" title="删除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.category} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100 font-mono text-blue-600"><input type="text" value={row.tagNo} readOnly className="w-full bg-transparent outline-none cursor-default px-1 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.assetNo} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.description} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.keyword} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="number" value={row.qty} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-right text-gray-700" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.originalValue} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-right text-gray-700" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="date" value={row.purchaseDate} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-center text-gray-700" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="number" value={row.lifeMonths} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-right text-gray-700" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.accumulatedDepreciation} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-right text-gray-700" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.netValue} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-right text-gray-700" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.responsiblePerson} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.responsiblePersonId} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.city} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.location} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.floor} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100"><input type="text" value={row.scrapMethod} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                      <td className="p-2 border-r border-gray-100">
                        <select
                          value={row.scrapType}
                          onChange={(e) => handleTableChange(row.id, 'scrapType', e.target.value)}
                          className="w-full bg-transparent outline-none px-1 py-0.5 text-gray-700 focus:ring-1 focus:ring-blue-500 rounded border border-transparent hover:border-gray-200 cursor-pointer"
                        >
                          <option value="已到报废期">已到报废期</option>
                          <option value="未到报废期">未到报废期</option>
                          <option value="丢失">丢失</option>
                        </select>
                      </td>
                      <td className="p-2"><input type="text" value={row.reason} readOnly className="w-full bg-transparent outline-none cursor-default px-1 text-gray-700 truncate" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* 分页与底部工具 */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 flex items-center justify-end">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <button className="p-1 border rounded bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 border rounded bg-white text-gray-600 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <span>共 <span className="font-medium text-gray-800">1</span> 页</span>
              <div className="flex items-center">
                每页 
                <select className="mx-2 border rounded p-1 outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select> 
                条
              </div>
              <div className="flex items-center">
                到第 <input type="number" defaultValue="1" min="1" className="w-12 mx-2 border rounded p-1 text-center outline-none focus:ring-1 focus:ring-blue-500" /> 页
                <button className="ml-2 px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">Go</button>
              </div>
              <div className="flex space-x-2 pl-4 border-l">
                <button title="导出Excel" className="text-green-600 hover:bg-green-50 p-1 rounded"><FileSpreadsheet className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部悬浮操作栏 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] p-4 flex justify-center items-center space-x-6 z-40">
        <button className="flex items-center px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回
        </button>
        <button className="flex items-center px-6 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors shadow-sm font-medium">
          <Save className="w-4 h-4 mr-2" /> 保存
        </button>
        <button className="flex items-center px-8 py-2 text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm font-medium">
          <Send className="w-4 h-4 mr-2" /> 提交
        </button>
      </div>
    </div>
  );
}