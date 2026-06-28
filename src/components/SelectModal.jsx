import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from 'antd';

const DEFAULT_SEARCH_VALUES = {};

/**
  * 通用选择弹窗组件
  * 
  * Props:
  *   open        - boolean, 弹窗是否打开
  *   onCancel    - () => void, 关闭回调
  *   onSelect      - (record) => void, 选中回调
  *   title         - string, 弹窗标题
  *   searchFields  - Array<{ name, label, dataIndex, placeholder }>, 搜索字段配置
  *   columns       - Array<{ title, dataIndex }>, 表格列配置
  *   dataSource    - Array, 数据源
  *   initialSearchValues - object, 可选的初始搜索值 (如 { brand: '华硕' })
  *   rowKey        - string, 行标识字段 (默认 'id')
  */
export default function SelectModal({
  open,
  onCancel,
  onSelect,
  onConfirm,
   title,
   searchFields = [],
   columns = [],
   dataSource = [],
   initialSearchValues = DEFAULT_SEARCH_VALUES,
   rowKey = 'id',
  multiple = false,
 }) {
   const [searchValues, setSearchValues] = useState(() => {
     const init = {};
     searchFields.forEach(f => { init[f.name] = (initialSearchValues[f.name] || ''); });
     return init;
   });
   const [selectedKey, setSelectedKey] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
 
   const filteredData = dataSource.filter(item => {
     return searchFields.every(field => {
       const searchValue = searchValues[field.name];
       if (!searchValue) return true;
       const targetValue = item[field.dataIndex];
       return String(targetValue || '').toLowerCase().includes(String(searchValue).toLowerCase());
     });
   });
 
   
  // 每次弹窗打开时或 initialSearchValues 变化时重置搜索值和选中行
  useEffect(() => {
    if (!open) return;
    const init = {};
    searchFields.forEach(field => {
      init[field.name] = initialSearchValues[field.name] || '';
    });
    setSearchValues(init);
    setSelectedKey(null);
      setSelectedKeys([]);
  }, [open, initialSearchValues]);

const resetState = () => {
     const init = {};
     searchFields.forEach(f => { init[f.name] = (initialSearchValues[f.name] || ''); });
     setSearchValues(init);
     setSelectedKey(null);
   };
 
   const handleConfirm = () => {
     if (multiple) {
       if (selectedKeys.length > 0) {
         const selected = filteredData.filter(item => selectedKeys.includes(String(item[rowKey])));
         if (selected.length > 0) {
           (onConfirm || onSelect)(selected);
           onCancel();
           resetState();
         }
       }
     } else {
       if (selectedKey) {
         const selected = filteredData.find(item => String(item[rowKey]) === String(selectedKey));
         if (selected) {
           (onConfirm || onSelect)(selected);
           onCancel();
           resetState();
         }
       }
     }
   };
 
  const handleCancel = () => {
    onCancel();
    resetState();
   };
 
  if (!open) return null;

  // 搜索字段分组：每行 2 个
   const rows = [];
   for (let i = 0; i < searchFields.length; i += 2) {
     rows.push(searchFields.slice(i, i + 2));
   }
 
   return (
     <div className="fixed inset-0 bg-black/40 z-[1050] flex items-center justify-center p-4">
       <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
         {/* 标题栏 */}
         <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
           <span className="font-medium text-gray-800">{title}</span>
           <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
             <X size={18} />
           </button>
         </div>
 
         {/* 搜索区域 */}
         <div className="p-4">
           {rows.map((row, ri) => (
             <div key={ri} className="flex gap-4 mb-4">
               {row.map((field) => (
                 <div key={field.name} className="flex items-center gap-2 flex-1">
                   <span className="text-sm text-gray-600 whitespace-nowrap">{field.label}:</span>
                   <input
                     type="text"
                     value={searchValues[field.name] || ''}
                     onChange={(e) => setSearchValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                     placeholder={field.placeholder || `请输入${field.label}`}
                     className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
                   />
                 </div>
               ))}
               {/* 补齐空位 */}
               {row.length < 2 && <div className="flex-1" />}
             </div>
           ))}
 
           {/* 表格 */}
           <div className="border border-[#f0f0f0] rounded overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                   <th className="px-4 py-3 w-12 text-center">
                     <span className="w-4 h-4 flex items-center justify-center">
                       <input type={multiple ? "checkbox" : "radio"} className="w-3.5 h-3.5" disabled />
                     </span>
                   </th>
                   {columns.map((col, ci) => (
                     <th key={ci} className="px-4 py-3 text-sm font-semibold text-gray-800">{col.title}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {filteredData.map((item) => {
                   const keyVal = String(item[rowKey]);
                   return (
                     <tr
                       key={keyVal}
                       className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                         selectedKey === keyVal ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                       }`}
                       onClick={() => { if (multiple) { setSelectedKeys(prev => prev.includes(keyVal) ? prev.filter(k => k !== keyVal) : [...prev, keyVal]); } else { setSelectedKey(keyVal); } }}
                     >
                       <td className="px-4 py-3 text-center">
                         <input
                           type={multiple ? "checkbox" : "radio"}
                           className="w-3.5 h-3.5"
                           checked={multiple ? selectedKeys.includes(keyVal) : selectedKey === keyVal}
                           onChange={() => {
                             if (multiple) {
                               setSelectedKeys(prev =>
                                 prev.includes(keyVal) ? prev.filter(k => k !== keyVal) : [...prev, keyVal]
                               );
                             } else {
                               setSelectedKey(keyVal);
                             }
                           }}
                         />
                       </td>
                       {columns.map((col, ci) => (
                         <td key={ci} className="px-4 py-3 text-sm text-gray-600">
                           {item[col.dataIndex]}
                         </td>
                       ))}
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         </div>
 
        {/* 底部按钮 */}
        <div className="flex justify-center gap-3 px-4 pb-4">
          <Button type="primary" onClick={handleConfirm}>确定</Button>
          <Button onClick={handleCancel}>取消</Button>
        </div>
       </div>
     </div>
   );
 }
