import React, { useState } from 'react';
import {
  Search, Plus, CheckCircle, XCircle, Download, Edit, Settings,
  ChevronDown, Folder, LayoutDashboard, Monitor, Layers, ClipboardList,
  Menu, User, Bell, ChevronRight, MoreHorizontal, Trash2, RefreshCcw, MinusSquare, X, Upload, ArrowLeft
} from 'lucide-react';

// 导入 xitongrules.js 中的组织与用户管理组件
import OrgAndUserContainer from './xitongrules';

// --- 选择物料大类弹窗组件 ---

// 模拟物料大类数据
const mockMaterialCategories = [
  { id: 1, code: '001', desc: 'SERVER' },
  { id: 2, code: '002', desc: 'OFFICE EQUIPMENT' },
  { id: 3, code: '003', desc: 'NET EQUIPMENT' },
  { id: 4, code: '004', desc: 'COMPUTER PARTS' },
  { id: 5, code: '005', desc: 'CONSUMABLES' },
];

const MaterialCategorySelectModal = ({ isOpen, onClose, onSelect }) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockMaterialCategories.filter(item => {
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    return matchCode && matchDesc;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchCode('');
      setSearchDesc('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchCode('');
    setSearchDesc('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择物料大类</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">物料大类编号:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编号"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">物料大类描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">物料大类编号</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">物料大类描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- 选择品牌弹窗组件 ---

// 模拟品牌数据
const mockBrands = [
  { id: 1, code: '001', desc: '华硕' },
  { id: 2, code: '002', desc: '三星' },
  { id: 3, code: '003', desc: '闪迪' },
  { id: 4, code: '004', desc: '联想' },
  { id: 5, code: '005', desc: '戴尔' },
];

const BrandSelectModal = ({ isOpen, onClose, onSelect }) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockBrands.filter(item => {
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    return matchCode && matchDesc;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchCode('');
      setSearchDesc('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchCode('');
    setSearchDesc('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择品牌</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">品牌编码:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编码"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">品牌描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">品牌编码</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">品牌描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- 选择型号弹窗组件 ---

// 模拟型号数据
const mockModels = [
  { id: 1, brand: '华硕', code: '001', desc: '天选5 Pro' },
  { id: 2, brand: '三星', code: '002', desc: 'Galaxy S8+' },
  { id: 3, brand: '闪迪', code: '003', desc: '512G固态硬盘' },
  { id: 4, brand: '联想', code: '004', desc: 'ThinkPad X1 Carbon' },
  { id: 5, brand: '戴尔', code: '005', desc: 'XPS 15' },
];

const ModelSelectModal = ({ isOpen, onClose, onSelect, brandFilter = '' }) => {
  const [searchBrand, setSearchBrand] = useState(brandFilter);
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockModels.filter(item => {
    const matchBrand = !searchBrand || item.brand.toLowerCase().includes(searchBrand.toLowerCase());
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    return matchBrand && matchCode && matchDesc;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchBrand(brandFilter);
      setSearchCode('');
      setSearchDesc('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchBrand(brandFilter);
    setSearchCode('');
    setSearchDesc('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择型号</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">品牌:</span>
              <input
                type="text"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                placeholder="请输入品牌"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">型号编码:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编码"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">型号描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex-1"></div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">品牌</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">型号编码</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">型号描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- 选择配置弹窗组件 ---

// 模拟配置数据
const mockConfigs = [
  { id: 1, brand: '华硕', model: '天选5 Pro', code: '001', desc: '标准配置' },
  { id: 2, brand: '三星', model: 'Galaxy S8+', code: '002', desc: 'G9550 64G 全网通' },
  { id: 3, brand: '闪迪', model: '512G固态硬盘', code: '003', desc: '512G NVMe' },
  { id: 4, brand: '联想', model: 'ThinkPad X1 Carbon', code: '004', desc: 'i7 16GB 512GB' },
  { id: 5, brand: '戴尔', model: 'XPS 15', code: '005', desc: 'i9 32GB 1TB' },
];

const ConfigSelectModal = ({ isOpen, onClose, onSelect, brandFilter = '', modelFilter = '' }) => {
  const [searchBrand, setSearchBrand] = useState(brandFilter);
  const [searchModel, setSearchModel] = useState(modelFilter);
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockConfigs.filter(item => {
    const matchBrand = !searchBrand || item.brand.toLowerCase().includes(searchBrand.toLowerCase());
    const matchModel = !searchModel || item.model.toLowerCase().includes(searchModel.toLowerCase());
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    return matchBrand && matchModel && matchCode && matchDesc;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchBrand(brandFilter);
      setSearchModel(modelFilter);
      setSearchCode('');
      setSearchDesc('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchBrand(brandFilter);
    setSearchModel(modelFilter);
    setSearchCode('');
    setSearchDesc('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择配置</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">品牌:</span>
              <input
                type="text"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                placeholder="请输入品牌"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">型号:</span>
              <input
                type="text"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                placeholder="请输入型号"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">配置编码:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编码"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">配置描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">品牌</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">型号</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">配置编码</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">配置描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- 选择公司弹窗组件 ---

// 模拟公司数据
const mockCompanies = [
  { id: 1, code: '114', desc: '搜狐媒体' },
  { id: 2, code: '115', desc: '新媒体' },
  { id: 3, code: '122', desc: '焦点直销' },
  { id: 4, code: '203', desc: '焦点新干线' },
  { id: 5, code: '420', desc: '上海搜狐互' },
];

const CompanySelectModal = ({ isOpen, onClose, onSelect }) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockCompanies.filter(item => {
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    return matchCode && matchDesc;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchCode('');
      setSearchDesc('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchCode('');
    setSearchDesc('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择公司</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">公司编码:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编码"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">公司描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">公司编码</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">公司描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- 选择部门弹窗组件 ---

// 模拟部门数据
const mockDepartments = [
  { id: 1, code: 'D0001', desc: '集团总部' },
  { id: 2, code: 'D0002', desc: '财务中心' },
  { id: 3, code: 'D0003', desc: '法律中心' },
  { id: 4, code: 'D0161', desc: '搜狐媒体' },
  { id: 5, code: 'D0164', desc: '搜狐媒体_社会招聘' },
];

const DepartmentSelectModal = ({ isOpen, onClose, onSelect }) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockDepartments.filter(item => {
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    return matchCode && matchDesc;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchCode('');
      setSearchDesc('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchCode('');
    setSearchDesc('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择部门</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">部门编码:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编码"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">部门描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">部门编码</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">部门描述</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- 选择仓库弹窗组件 ---

// 模拟仓库数据
const mockWarehouses = [
  { id: 1, code: 'I0001', desc: '资产库北京库(新媒体)', city: '北京市' },
  { id: 2, code: 'I0015', desc: '资产库(前台库)(互联网)', city: '北京市' },
  { id: 3, code: 'I2031', desc: '资产库北京库(焦点互动)', city: '北京市' },
  { id: 4, code: 'I3001', desc: '资产库上海库', city: '上海市' },
  { id: 5, code: 'I4001', desc: '资产库深圳库', city: '深圳市' },
];

const WarehouseSelectModal = ({ isOpen, onClose, onSelect }) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredData = mockWarehouses.filter(item => {
    const matchCode = !searchCode || item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchDesc = !searchDesc || item.desc.toLowerCase().includes(searchDesc.toLowerCase());
    const matchCity = !searchCity || item.city.toLowerCase().includes(searchCity.toLowerCase());
    return matchCode && matchDesc && matchCity;
  });

  const handleConfirm = () => {
    if (selectedId) {
      const selected = filteredData.find(item => item.id === selectedId);
      onSelect(selected);
      onClose();
      setSearchCode('');
      setSearchDesc('');
      setSearchCity('');
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSearchCode('');
    setSearchDesc('');
    setSearchCity('');
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden" style={{ width: '700px', maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">选择仓库</span>
          <button onClick={handleCancel} className="text-gray-400 hover:text-[#ff4d4f] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">仓库编码:</span>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="请输入编码"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">仓库描述:</span>
              <input
                type="text"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                placeholder="请输入描述"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600 whitespace-nowrap">City:</span>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="请输入城市"
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
            <div className="flex-1"></div>
          </div>
          <div className="border border-[#f0f0f0] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <th className="px-4 py-3 w-12 text-center">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <input type="radio" className="w-3.5 h-3.5" disabled />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">仓库编码</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">仓库描述</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-800">City</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                      selectedId === item.id ? 'bg-[#e6f7ff]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        className="w-3.5 h-3.5"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.desc}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-3 px-4 pb-4">
          <AntButton type="primary" onClick={handleConfirm} className="px-6">确定</AntButton>
          <AntButton type="default" onClick={handleCancel} className="px-6">取消</AntButton>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Antd-style Components ---

const AntButton = ({ children, type = 'default', icon, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded transition-all duration-200 border cursor-pointer select-none";
  const types = {
    primary: "bg-[#1677ff] text-white border-[#1677ff] hover:bg-[#4096ff] hover:border-[#4096ff] shadow-sm",
    default: "bg-white text-gray-700 border-[#d9d9d9] hover:text-[#1677ff] hover:border-[#1677ff] shadow-sm",
    danger: "bg-white text-[#ff4d4f] border-[#d9d9d9] hover:text-[#ff7875] hover:border-[#ff7875] shadow-sm",
    dashed: "bg-white text-gray-700 border-[#d9d9d9] border-dashed hover:text-[#1677ff] hover:border-[#1677ff] shadow-sm",
    link: "bg-transparent text-[#1677ff] border-transparent hover:text-[#4096ff] px-0 shadow-none",
  };

  return (
    <button className={`${baseStyle} ${types[type]} ${className}`} {...props}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

const AntInput = ({ placeholder, className = '', ...props }) => (
  <input
    type="text"
    placeholder={placeholder}
    className={`w-full px-3 py-1.5 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all disabled:bg-[#f5f5f5] disabled:text-gray-400 disabled:cursor-pointer disabled:hover:border-[#1677ff] ${className}`}
    {...props}
  />
);

const AntSelect = ({ options, placeholder = '请选择...', className = '', ...props }) => (
  <div className="relative w-full">
    <select 
      className={`w-full appearance-none px-3 py-1.5 pr-8 text-sm bg-white border border-[#d9d9d9] rounded hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff] focus:ring-opacity-20 outline-none transition-all text-gray-700 ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

const AntRadio = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 text-sm" onClick={onChange}>
    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${checked ? 'border-[#1677ff]' : 'border-gray-300'}`}>
      {checked && <div className="w-2 h-2 rounded-full bg-[#1677ff]" />}
    </div>
    {label}
  </label>
);

const AntModal = ({ isOpen, onClose, title, children, width = '600px' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" style={{ width, maxWidth: '100%' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <span className="font-medium text-gray-800">{title}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-[#ff4d4f] transition-colors"><X size={18} /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const AntTable = ({ columns, data }) => (
  <div className="w-full overflow-x-auto border border-[#f0f0f0] rounded-t">
    <table className="w-full text-left border-collapse min-w-max">
      <thead>
        <tr>
          <th className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] w-12 text-center">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#1677ff] focus:ring-[#1677ff]" />
          </th>
          {columns.map((col, idx) => (
            <th key={idx} className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] text-sm font-semibold text-gray-800 whitespace-nowrap">
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => {
          if (row.isGroup) {
            return (
              <tr key={rowIdx} className="bg-[#f5f5f5] border-b border-[#f0f0f0]">
                <td colSpan={columns.length + 1} className="px-4 py-2 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <MinusSquare size={14} className="text-gray-500" />
                    {row.groupName}
                  </div>
                </td>
              </tr>
            );
          }
          return (
            <tr key={rowIdx} className="hover:bg-[#fafafa] transition-colors group cursor-pointer">
              <td className="px-4 py-3 border-b border-[#f0f0f0] text-center">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#1677ff] focus:ring-[#1677ff]" />
              </td>
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-3 border-b border-[#f0f0f0] text-sm text-gray-600">
                  {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const Pagination = ({ total }) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#f0f0f0] border-t-0 rounded-b text-sm text-gray-500">
    <div>共 {total} 条记录</div>
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">上一页</button>
      <button className="px-2 py-1 border rounded bg-[#1677ff] text-white border-[#1677ff]">1</button>
      <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">2</button>
      <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">...</button>
      <button className="px-2 py-1 border rounded hover:border-[#1677ff] hover:text-[#1677ff]">下一页</button>
      <span className="ml-2">10 条/页</span>
    </div>
  </div>
);

// --- Query Bar Layout ---
const QueryBar = ({ children }) => (
  <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-6">
          {children}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 shrink-0">
        <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
        <AntButton type="default" icon={<RefreshCcw size={14}/>}>重置</AntButton>
      </div>
    </div>
  </div>
);

// --- Sub-Views ---

// 1. 物料综合集合
const MaterialComprehensiveView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mainCatCode: '', mainCatDesc: '', subCatCode: '', subCatDesc: '', brand: '', modelCode: '', modelDesc: '',
    configDesc: '', unit: '', hasLevel: '', level: '', hasMainAsset: '', misAudit: '', returnCheck: '',
    enabled: '1', canApply: '', refPrice: '', isStop: '', needCheck: '是',
    allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '0', allowReturn: '0',
    nonTechOverlimit: '0', misIdentifyOnReturn: '0', misIdentify: '0', mainAssetSubCat: ''
  });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ ...formData, mainCatCode: '', mainCatDesc: '', subCatCode: '', subCatDesc: '', brand: '', modelCode: '', modelDesc: '', configDesc: '', unit: '', hasLevel: '', level: '', hasMainAsset: '', misAudit: '', returnCheck: '', enabled: '1', canApply: '', refPrice: '', isStop: '', needCheck: '是', allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '0', allowReturn: '0', nonTechOverlimit: '0', misIdentifyOnReturn: '0', misIdentify: '0', mainAssetSubCat: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ ...formData, ...record });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '维度组合编码', dataIndex: 'code' },
    { title: '维度组合描述', dataIndex: 'desc' },
    { title: '物料总类', dataIndex: 'mainCatCode', render: (val) => val === '1' ? '资产' : val === '2' ? '耗材' : val === '3' ? '低值耐用品' : '-' },
    { title: '大类描述', dataIndex: 'catDesc' },
    { title: '小类描述', dataIndex: 'subCatDesc' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '型号', dataIndex: 'model' },
    { title: '配置描述', dataIndex: 'configDesc' },
    { title: '单位', dataIndex: 'unit' },
    { title: '是否有级别', dataIndex: 'hasLevel', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '级别', dataIndex: 'level', render: (val) => val === '1' ? '标准' : val === '2' ? '高端' : '-' },
    { title: '是否关联主资产', dataIndex: 'hasMainAsset', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '退库鉴定', dataIndex: 'returnCheck', render: (val) => val || '-' },
    { title: '是否MIS审核', dataIndex: 'misAudit', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => val === '1' ? <span className="text-green-600">启用</span> : <span className="text-red-500">停用</span> },
    { title: '参考价格', dataIndex: 'refPrice', render: (val) => val || '0.00' },
    { title: '是否可申请', dataIndex: 'canApply', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否停产', dataIndex: 'isStop', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否需要盘点', dataIndex: 'needCheck', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '是' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '是' ? '是' : '否'}</span> },
    { title: '是否允许更换', dataIndex: 'allowReplace', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否允许转岗', dataIndex: 'allowTransfer', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否允许借用', dataIndex: 'allowBorrow', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否需要ES审批', dataIndex: 'needEsApproval', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '是否允许退库', dataIndex: 'allowReturn', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val === '1' ? '是' : '否'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, mainCatCode: '3', code: '228002052003000', desc: '闪迪 512G固态硬盘', catDesc: '内存/硬盘', subCatDesc: '硬盘', brand: '闪迪', model: '512G', configDesc: '', unit: '块', hasLevel: '0', level: '', hasMainAsset: '1', returnCheck: 'MIS', misAudit: '1', enabled: '1', canApply: '0', refPrice: '1380.00', isStop: '0', needCheck: '否', allowReplace: '1', allowTransfer: '0', allowBorrow: '1', needEsApproval: '0', allowReturn: '1' },
    { id: 2, mainCatCode: '3', code: '228002001279000', desc: '三星 500G固态硬盘', catDesc: '内存/硬盘', subCatDesc: '硬盘', brand: '三星', model: '500G', configDesc: '', unit: '块', hasLevel: '0', level: '', hasMainAsset: '1', returnCheck: 'MIS', misAudit: '1', enabled: '1', canApply: '0', refPrice: '0.00', isStop: '0', needCheck: '否', allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '1', allowReturn: '0' },
    { id: 3, mainCatCode: '1', code: '11100583001000', desc: '测试品牌-测试型号', catDesc: 'PC', subCatDesc: '测试PC小类', brand: '测试品牌', model: '测试型号', configDesc: '', unit: '个', hasLevel: '0', level: '', hasMainAsset: '0', returnCheck: 'ES', misAudit: '1', enabled: '1', canApply: '0', refPrice: '0.00', isStop: '0', needCheck: '是', allowReplace: '1', allowTransfer: '1', allowBorrow: '1', needEsApproval: '0', allowReturn: '1' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">维度组合编码:</span>
          <AntInput placeholder="请输入编码" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">维度组合描述:</span>
          <AntInput placeholder="请输入描述" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">物资总类:</span>
          <AntSelect options={[{label:'资产', value:'1'}, {label:'低值耐用品', value:'2'}]} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">大类描述:</span>
          <AntInput placeholder="搜索大类..." />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">小类描述:</span>
          <AntInput placeholder="搜索小类..." />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">单位:</span>
          <AntSelect options={[{label:'台', value:'1'}, {label:'块', value:'2'}, {label:'个', value:'3'}]} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
          <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-right text-sm text-gray-600">参考价格:</span>
          <div className="flex items-center w-full gap-2">
            <AntInput placeholder="从" />
            <span className="text-gray-400">至</span>
            <AntInput placeholder="至" />
          </div>
        </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <div className="relative">
            <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          <AntTable columns={columns} data={data} />
        <Pagination total={data.length} />
        </div>
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增物料维度组合' : '编辑物料维度组合'} width="1100px">
        {/* 核心字段 */}
        <div className="mb-4">
          <div className="bg-[#e6f7ff] border border-[#91d5ff] px-4 py-2 rounded-t text-sm font-medium text-[#1890ff]">
            核心字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">维度组合编码</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntInput value={formData.code || '系统自动生成'} disabled={true} className="bg-[#f5f5f5]" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>维度组合描述</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <AntInput value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料总类</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.mainCatCode} onChange={(e) => setFormData({...formData, mainCatCode: e.target.value})} options={[{label:'资产', value:'1'}, {label:'耗材', value:'2'}, {label:'低值耐用品', value:'3'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
              <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
                <AntInput value={formData.mainCatDesc} onChange={(e) => setFormData({...formData, mainCatDesc: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料小类</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center relative">
                <AntInput value={formData.subCatDesc} onChange={(e) => setFormData({...formData, subCatDesc: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
              <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsBrandModalOpen(true)}>
                <AntInput value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="请选择品牌" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsModelModalOpen(true)}>
                <AntInput value={formData.modelCode} onChange={(e) => setFormData({...formData, modelCode: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">配置</div>
              <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsConfigModalOpen(true)}>
                <AntInput value={formData.configDesc} onChange={(e) => setFormData({...formData, configDesc: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 状态字段 */}
        <div className="mb-4">
          <div className="bg-[#f6ffed] border border-[#b7eb8f] px-4 py-2 rounded-t text-sm font-medium text-[#52c41a]">
            状态字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'启用', value:'1'}, {label:'停用', value:'0'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">参考价格</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <AntInput value={formData.refPrice} onChange={(e) => setFormData({...formData, refPrice: e.target.value})} placeholder="请输入价格（元）" />
              </div>
            </div>
          </div>
        </div>

        {/* 业务规则字段 */}
        <div className="mb-4">
          <div className="bg-[#fff7e6] border border-[#ffd591] px-4 py-2 rounded-t text-sm font-medium text-[#fa8c16]">
            业务规则字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否有级别</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.hasLevel} onChange={(e) => setFormData({...formData, hasLevel: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">级别</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} options={[{label:'标准', value:'1'}, {label:'高端', value:'2'}]} className="w-full" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>单位</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} options={[{label:'台', value:'台'}, {label:'块', value:'块'}, {label:'个', value:'个'}, {label:'套', value:'套'}, {label:'件', value:'件'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">退库鉴定</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.returnCheck} onChange={(e) => setFormData({...formData, returnCheck: e.target.value})} options={[{label:'MIS', value:'MIS'}, {label:'ES', value:'ES'}]} className="w-full" />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否MIS审核</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.misAudit} onChange={(e) => setFormData({...formData, misAudit: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否关联主资产</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <AntSelect value={formData.hasMainAsset} onChange={(e) => setFormData({...formData, hasMainAsset: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 权限控制字段 */}
        <div className="mb-4">
          <div className="bg-[#f9f0ff] border border-[#d3adf7] px-4 py-2 rounded-t text-sm font-medium text-[#722ed1]">
            权限控制字段
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否可申请</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.canApply} onChange={(e) => setFormData({...formData, canApply: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否停产</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.isStop} onChange={(e) => setFormData({...formData, isStop: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否需要盘点</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.needCheck} onChange={(e) => setFormData({...formData, needCheck: e.target.value})} options={[{label:'是', value:'是'}, {label:'否', value:'否'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否允许更换</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.allowReplace || '0'} onChange={(e) => setFormData({...formData, allowReplace: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否允许转岗</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.allowTransfer || '1'} onChange={(e) => setFormData({...formData, allowTransfer: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否允许借用</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.allowBorrow || '0'} onChange={(e) => setFormData({...formData, allowBorrow: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否需要ES审批</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntSelect value={formData.needEsApproval || '0'} onChange={(e) => setFormData({...formData, needEsApproval: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否允许退库</div>
              <div className="w-[37.5%] p-2 flex items-center">
                <AntSelect value={formData.allowReturn || '0'} onChange={(e) => setFormData({...formData, allowReturn: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 资产类专属字段（物料总类=资产时显示） */}
        {formData.mainCatCode === '1' && (
          <div className="mb-4">
            <div className="bg-[#fff1f0] border border-[#ffccc7] px-4 py-2 rounded-t text-sm font-medium text-[#ff4d4f]">
              资产类专属字段
            </div>
            <div className="border border-t-0 border-[#e8e8e8] text-sm">
              <div className="flex min-h-[40px]">
                <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">非技术申请超标</div>
                <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <AntSelect value={formData.nonTechOverlimit || '0'} onChange={(e) => setFormData({...formData, nonTechOverlimit: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
                </div>
                <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">退库时需要MIS鉴定</div>
                <div className="w-[37.5%] p-2 flex items-center">
                  <AntSelect value={formData.misIdentifyOnReturn || '0'} onChange={(e) => setFormData({...formData, misIdentifyOnReturn: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 耗材/低值耐用品专属字段 */}
        {(formData.mainCatCode === '2' || formData.mainCatCode === '3') && (
          <div className="mb-4">
            <div className="bg-[#e6fffb] border border-[#b5f5ec] px-4 py-2 rounded-t text-sm font-medium text-[#13c2c2]">
              耗材/低值耐用品专属字段
            </div>
            <div className="border border-t-0 border-[#e8e8e8] text-sm">
              <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
                <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否关联主资产</div>
                <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <AntSelect value={formData.hasMainAsset} onChange={(e) => setFormData({...formData, hasMainAsset: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
                </div>
                <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否MIS鉴定</div>
                <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">
                  <AntSelect value={formData.misIdentify || '0'} onChange={(e) => setFormData({...formData, misIdentify: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} className="w-full" />
                </div>
              </div>
              <div className="flex min-h-[40px]">
                <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">主资产物料小类</div>
                <div className="w-[37.5%] p-2 flex items-center relative">
                  <AntInput value={formData.mainAssetSubCat || ''} onChange={(e) => setFormData({...formData, mainAssetSubCat: e.target.value})} placeholder="请选择主资产物料小类" />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
                </div>
                <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8]"></div>
                <div className="w-[37.5%] p-2 flex items-center"></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors" onClick={() => {}}>
            <Upload size={18} className="text-[#1677ff]" />
            <span className="text-sm text-gray-700">上传文件</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors" onClick={() => {}}>
            <Download size={18} className="text-[#1677ff]" />
            <span className="text-sm text-gray-700">下载模板</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] rounded cursor-pointer hover:bg-[#e6f7ff] transition-colors" onClick={() => {}}>
            <CheckCircle size={18} className="text-[#52c41a]" />
            <span className="text-sm text-gray-700">无须盘点设置</span>
          </div>
        </div>
      </AntModal>

      <MaterialCategorySelectModal
        isOpen={isMaterialCategoryModalOpen}
        onClose={() => setIsMaterialCategoryModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            mainCatCode: selected.code,
            mainCatDesc: selected.desc
          });
        }}
      />

      <BrandSelectModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            brand: selected.desc
          });
        }}
      />

      <ModelSelectModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        brandFilter={formData.brand}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            modelCode: selected.code,
            modelDesc: selected.desc
          });
        }}
      />

      <ConfigSelectModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        brandFilter={formData.brand}
        modelFilter={formData.modelCode}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            configDesc: selected.desc
          });
        }}
      />
    </div>
  );
};

// 2. 物料大类
const MaterialCategoryView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', enabled: '', borrowable: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', enabled: '', borrowable: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0', borrowable: record.borrowable ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类编号', dataIndex: 'code' },
    { title: '物料大类描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 14, code: '001', desc: 'SERVER', enabled: true },
    { id: 34, code: '002', desc: '合约机', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料大类编号:</span>
        <AntInput placeholder="请输入大类编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料大类描述:</span>
        <AntInput placeholder="请输入大类描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增物料大类' : '编辑物料大类'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>物料大类编码
            </div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>物料大类描述
            </div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>是否启用
            </div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700">
            </div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
}

// 3. 物料小类
const MaterialSubCategoryView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mainCatCode: '', mainCatDesc: '', subDesc: '', enabled: '', mis: '0', borrowable: '1', pcPart: '1'
  });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCatCode: '', mainCatDesc: '', subDesc: '', enabled: '', mis: '0', borrowable: '1', pcPart: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCatCode: '001', mainCatDesc: record.catDesc, subDesc: record.subDesc, enabled: record.enabled ? '1' : '0', mis: record.mis ? '1' : '0', borrowable: record.borrowable ? '1' : '0', pcPart: record.pcPart ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类描述', dataIndex: 'catDesc' },
    { title: '物料小类编号', dataIndex: 'subCode' },
    { title: '物料小类描述', dataIndex: 'subDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '标签生成规则', dataIndex: 'rule' },
    { title: '是否允许借用', dataIndex: 'borrowable', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{val ? '是' : '否'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, catDesc: 'OFFICE EQUIPMENT', subCode: '113', subDesc: '移动数码-智能机器人', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
    { id: 2, catDesc: 'NET EQUIPMENT', subCode: '025', subDesc: '网络设备-UPS电源', enabled: true, mis: false, rule: '', borrowable: false, pcPart: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料大类编号:</span>
        <AntInput placeholder="请输入大类编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料大类描述:</span>
        <AntInput placeholder="请输入大类描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料小类编号:</span>
        <AntInput placeholder="请输入小类编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料小类描述:</span>
        <AntInput placeholder="请输入小类描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增物料小类' : '编辑物料小类'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类编号</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
              <AntInput value={formData.mainCatCode} onChange={(e) => setFormData({...formData, mainCatCode: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料大类描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.mainCatDesc} onChange={(e) => setFormData({...formData, mainCatDesc: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料小类描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.subDesc} onChange={(e) => setFormData({...formData, subDesc: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否允许借用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <AntRadio checked={formData.borrowable === '1'} onChange={() => setFormData({...formData, borrowable: '1'})} label="是" />
              <AntRadio checked={formData.borrowable === '0'} onChange={() => setFormData({...formData, borrowable: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>

      <MaterialCategorySelectModal
        isOpen={isMaterialCategoryModalOpen}
        onClose={() => setIsMaterialCategoryModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            mainCatCode: selected.code,
            mainCatDesc: selected.desc
          });
        }}
      />
    </div>
  );
};

// 4. 品牌
const BrandView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '系统自动生成', desc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌编码', dataIndex: 'code' },
    { title: '品牌描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, code: '040', desc: '滴滴出行', enabled: true },
    { id: 2, code: '055', desc: '优客工场', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">品牌编码:</span>
        <AntInput placeholder="请输入编码" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">品牌描述:</span>
        <AntInput placeholder="请输入描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增品牌' : '编辑品牌'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌编码</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.code} disabled={true} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

// 5. 型号
const ModelView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [formData, setFormData] = useState({ brand: '', code: '', desc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ brand: '', code: '系统自动生成', desc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ brand: record.brand, code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '规格型号编码', dataIndex: 'code' },
    { title: '规格型号描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, brand: '华硕', code: '014', desc: '天选5 Pro 魔霸版', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">品牌:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="请选择品牌" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">规格型号编码:</span>
        <AntInput placeholder="请输入编码" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">规格型号描述:</span>
        <AntInput placeholder="请输入描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增型号' : '编辑型号'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="请选择品牌" disabled />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" onClick={() => setIsBrandModalOpen(true)} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号编码</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.code} disabled={true} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

// 6. 配置
const ConfigView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [formData, setFormData] = useState({ brand: '', model: '', code: '', desc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ brand: '', model: '', code: '系统自动生成', desc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ brand: record.brand, model: record.model, code: record.code, desc: record.desc, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '品牌', dataIndex: 'brand' },
    { title: '型号', dataIndex: 'model' },
    { title: '配置编码', dataIndex: 'code' },
    { title: '配置描述', dataIndex: 'desc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, brand: '三星', model: 'Galaxy S8+', code: '001', desc: 'G9550 64G 全网通', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">品牌:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="请选择品牌" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">型号:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="请选择型号" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">配置编码:</span>
        <AntInput placeholder="请输入编码" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">配置描述:</span>
        <AntInput placeholder="请输入描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增配置' : '编辑配置'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌型号</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsModelModalOpen(true)}>
              <AntInput value={formData.brand && formData.model ? `${formData.brand} / ${formData.model}` : ''} placeholder="请选择品牌型号" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>配置编码</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.code} disabled={true} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编码" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>配置描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>

      <ModelSelectModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        brandFilter={formData.brand}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            brand: selected.brand,
            model: selected.desc
          });
        }}
      />
    </div>
  );
};

// 7. NO服务
const NOServiceView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '服务描述', dataIndex: 'desc' },
  ];
  const data = [
    { id: 1, desc: '17173' },
    { id: 2, desc: 'MediaPlatform' },
  ];
  
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-white border border-[#f0f0f0] rounded shadow-sm">
        <div className="flex items-center gap-4">
           <span className="text-sm text-gray-600 whitespace-nowrap">服务描述:</span>
           <AntInput placeholder="请输入服务描述" className="w-64" />
           <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
        </div>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="flex-1 overflow-auto bg-white p-4">
           <AntTable columns={columns} data={data} />
        <Pagination total={data.length} />
        </div>
      </div>
    </div>
  )
}

// 8. 办公区与仓库映射
const OfficeWarehouseMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', dept: '', office: '', warehouse: '', enabled: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', dept: '', office: '', warehouse: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, dept: record.dept, office: record.office, warehouse: record.warehouse, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '部门', dataIndex: 'dept' },
    { title: '办公区', dataIndex: 'office' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, company: 'WJS_北京搜狐互...', dept: 'D0164_搜狐媒体_社会...', office: 'L062_北京-搜狐媒体大厦...', warehouse: 'I0015_资产库(前台库)(互联网)...', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">办公区:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索办公区..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">仓库:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索仓库..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">部门:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索部门..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>部门</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsDepartmentModalOpen(true)}>
              <AntInput value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})} placeholder="请选择部门" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>办公区</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.office} onChange={(e) => setFormData({...formData, office: e.target.value})} placeholder="请选择办公区" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsWarehouseModalOpen(true)}>
              <AntInput value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} placeholder="请选择仓库" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>

      <CompanySelectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            company: selected.desc
          });
        }}
      />

      <DepartmentSelectModal
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            dept: selected.desc
          });
        }}
      />

      <WarehouseSelectModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            warehouse: selected.desc
          });
        }}
      />
    </div>
  );
};

// 9. PS新员工领用物料映射
const PSNewEmployeeMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', config: '', city: '', desc: '', qty: '', dept: '', enabled: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', config: '', city: '', desc: '', qty: '1', dept: 'MIS', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, config: record.config, city: record.city, desc: record.desc, qty: record.qty, dept: record.dept, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '资产配置', dataIndex: 'config' },
    { title: 'City', dataIndex: 'city' },
    { title: '物料描述', dataIndex: 'desc' },
    { title: '数量', dataIndex: 'qty' },
    { title: '处理部门', dataIndex: 'dept' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, company: '420_上海搜狐互...', config: '标准台式设计机', city: 'CT0002_上海', desc: '芝麻 EIZO SX2262W显示器...', qty: 1, dept: 'ES', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">资产配置:</span>
        <AntSelect options={[{label:'标准台式设计机', value:'1'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">City:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索City..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料描述:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索物料描述..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">数量:</span>
        <AntInput placeholder="请输入数量" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">处理部门:</span>
        <AntSelect options={[{label:'MIS', value:'1'}, {label:'ES', value:'0'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>资产配置</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsConfigModalOpen(true)}>
              <AntInput value={formData.config} onChange={(e) => setFormData({...formData, config: e.target.value})} placeholder="请选择配置" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="请选择City" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料描述</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请选择物料描述" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>处理部门</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})} options={[{label:'MIS', value:'MIS'}, {label:'ES', value:'ES'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>数量</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput type="number" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="请输入数量" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <AntRadio checked={formData.enabled === '1'} onChange={() => setFormData({...formData, enabled: '1'})} label="是" />
              <AntRadio checked={formData.enabled === '0'} onChange={() => setFormData({...formData, enabled: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>

      <CompanySelectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            company: selected.desc
          });
        }}
      />

      <ConfigSelectModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            config: selected.desc
          });
        }}
      />
    </div>
  );
};

// 10. NO地点与资产地点映射
const NOLocationMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', info: '', city: '', building: '', floor: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', info: '', city: '', building: '', floor: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ code: record.code, desc: record.desc, info: record.info, city: record.city, building: record.building, floor: record.floor });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO地点英文缩写', dataIndex: 'code' },
    { title: 'NO地点中文描述', dataIndex: 'desc' },
    { title: 'NO地点详细信息', dataIndex: 'info' },
    { title: 'City', dataIndex: 'city' },
    { title: 'Building', dataIndex: 'building' },
    { title: 'Floor', dataIndex: 'floor' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { isGroup: true, groupName: '搜狐' },
    { id: 1, code: 'SDZZ_CH1', desc: '枣庄联通机房', info: '山东省市中区长白山路2666号联通数...', city: '1854374_山东省_枣庄市', building: '1854711_联通数据中心', floor: '3层', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点英文缩写:</span>
        <AntInput placeholder="请输入英文缩写" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点中文描述:</span>
        <AntInput placeholder="请输入中文描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">NO地点详细信息:</span>
        <AntInput placeholder="请输入详细信息" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" className="text-green-600" icon={<RefreshCcw size={14} />}>刷新</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>英文缩写</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入英文缩写" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>中文描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入中文描述" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>详细信息</div>
            <div className="w-[85%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.info} onChange={(e) => setFormData({...formData, info: e.target.value})} placeholder="请输入详细信息" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="请选择City" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Building</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} placeholder="请选择Building" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Floor</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} placeholder="请输入Floor" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

// 11. 虚拟库管员映射
const VirtualWarehouseManagerMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', virtualAdmin: '', realAdmin: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', virtualAdmin: '', realAdmin: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, virtualAdmin: record.virtualAdmin, realAdmin: record.realAdmin });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '虚拟库管员', dataIndex: 'virtualAdmin' },
    { title: '仓库管理员', dataIndex: 'realAdmin' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { isGroup: true, groupName: '搜狐' },
    { id: 1, company: '203_搜狐千线', plate: '59_SAAS', virtualAdmin: 'SOHU52-库房管理员-焦点', realAdmin: 'SOHU51-公共管理员-焦点', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">虚拟库管员:</span>
        <AntInput placeholder="请输入库管员" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择公司" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择板块" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>虚拟库管员</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.virtualAdmin} onChange={(e) => setFormData({...formData, virtualAdmin: e.target.value})} placeholder="请输入虚拟库管员" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库管理员</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.realAdmin} onChange={(e) => setFormData({...formData, realAdmin: e.target.value})} placeholder="请输入仓库管理员" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>

      <CompanySelectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            company: selected.desc
          });
        }}
      />
    </div>
  );
};

// 12. 板块与账簿映射
const PlateLedgerMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ plate: '', ledger: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ plate: '', ledger: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ plate: record.plate, ledger: record.ledger, enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账簿', dataIndex: 'ledger' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { isGroup: true, groupName: '搜狐' },
    { id: 1, plate: '22_搜索事业部', ledger: 'FA_BOOK_SOGOU', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">账簿:</span>
        <AntInput placeholder="请输入账簿" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="全部" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增映射' : '编辑映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择板块" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>账簿</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.ledger} onChange={(e) => setFormData({...formData, ledger: e.target.value})} placeholder="请选择账簿" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>
    </div>
  );
};

// 13. 公司板块提取资产权限
const CompanyPlateAssetAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ company: '', plate: '', materialCat: '', empCompany: '', empPlate: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ company: record.company, plate: record.plate, materialCat: record.materialCategory, empCompany: record.empCompany, empPlate: record.empPlate });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '物料大类', dataIndex: 'materialCategory' },
    { title: '员工所属公司', dataIndex: 'empCompany' },
    { title: '员工所属板块', dataIndex: 'empPlate' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, company: '114_搜狐媒体', plate: '17_Corporate', materialCategory: '140_搜狐媒体_武汉', empCompany: '', empPlate: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">物料大类:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索物料大类..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增权限' : '编辑权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
              <AntInput value={formData.materialCat} onChange={(e) => setFormData({...formData, materialCat: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">员工所属公司</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.empCompany} onChange={(e) => setFormData({...formData, empCompany: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">员工所属板块</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.empPlate} onChange={(e) => setFormData({...formData, empPlate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>

      <MaterialCategorySelectModal
        isOpen={isMaterialCategoryModalOpen}
        onClose={() => setIsMaterialCategoryModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            materialCat: selected.desc
          });
        }}
      />
    </div>
  );
};
const NODeviceAssetAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: '服务器', owner: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '服务器', owner: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type, owner: record.owner });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO设备类型', dataIndex: 'type' },
    { title: '责任人', dataIndex: 'owner' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, type: '服务器', owner: '220314-刘帅' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">NO类型:</span>
        <AntSelect options={[{label:'服务器', value:'1'}, {label:'网络设备', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
        <AntInput placeholder="请输入编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">姓名:</span>
        <AntInput placeholder="请输入姓名" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增设备权限' : '编辑设备权限'} width="700px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[30%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>NO设备类型</div>
            <div className="w-[70%] p-2 flex items-center">
              <AntSelect value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} options={[{label:'服务器', value:'服务器'}, {label:'网络设备', value:'网络设备'}]} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[30%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>责任人</div>
            <div className="w-[70%] p-2 flex items-center relative">
              <AntInput value={formData.owner} onChange={(e) => setFormData({...formData, owner: e.target.value})} placeholder="请选择责任人" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

// 15. 公司归属权限
const CompanyBelongingAuthView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ belonging: '焦点', company: '', plate: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ belonging: '焦点', company: '', plate: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ belonging: record.belonging, company: record.company, plate: record.plate });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司归属', dataIndex: 'belonging' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, belonging: '焦点', company: '122_焦点直销', plate: '52_房产' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司归属:</span>
        <AntSelect options={[{label:'焦点', value:'1'}, {label:'搜狐', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索公司..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索板块..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增归属' : '编辑归属'} width="700px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司归属</div>
            <div className="w-[80%] p-2 flex items-center">
              <AntSelect value={formData.belonging} onChange={(e) => setFormData({...formData, belonging: e.target.value})} options={[{label:'焦点', value:'焦点'}, {label:'搜狐', value:'搜狐'}]} className="max-w-[300px]" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[80%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none max-w-[300px]" />
              <Search className="absolute right-[calc(100%-300px+12px)] top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[20%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>板块</div>
            <div className="w-[80%] p-2 flex items-center relative">
              <AntInput value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" className="max-w-[300px]" />
              <Search className="absolute right-[calc(100%-300px+12px)] top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};


// 16. 仓库信息
const WarehouseInfoView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '', desc: '', city: '', building: '', floor: '', address: '', type: '', usage: '',
    company: '', admin: '', isVirtual: '0', isAreaEnabled: '0', isLocationEnabled: '0',
    isEnabled: '1', startDate: '', endDate: ''
  });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      code: '', desc: '', city: '', building: '', floor: '', address: '', type: '', usage: '',
      company: '', admin: '', isVirtual: '0', isAreaEnabled: '0', isLocationEnabled: '0',
      isEnabled: '1', startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      code: record.code, desc: record.desc, city: record.city || '', building: '', floor: '', address: '', 
      type: '', usage: record.usage, company: record.company, admin: record.admin,
      isVirtual: record.isVirtual ? '1' : '0', isAreaEnabled: '0', isLocationEnabled: '0',
      isEnabled: record.enabled ? '1' : '0', startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库编码', dataIndex: 'code' },
    { title: '仓库描述', dataIndex: 'desc' },
    { title: '仓库用途', dataIndex: 'usage' },
    { title: '是否虚拟库', dataIndex: 'isVirtual', render: (val) => val ? '是' : '否' },
    { title: '公司', dataIndex: 'company' },
    { title: 'City', dataIndex: 'city' },
    { title: '库管员', dataIndex: 'admin' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, code: 'I0001', desc: '资产库北京库(新媒体)', usage: 'IU0001_资产库标准', isVirtual: false, company: '114_新媒体', city: '35_北京市', admin: '114111-杨平', enabled: true },
  ];
  
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#f0f0f0]">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-6">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">仓库编码:</span>
                  <AntInput placeholder="请输入仓库编码" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">仓库描述:</span>
                  <AntInput placeholder="请输入仓库描述" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">是否虚拟库:</span>
                  <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">是否启用:</span>
                  <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 shrink-0">
              <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
              <AntButton type="default" icon={<RefreshCcw size={14}/>}>重置</AntButton>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 border-b border-[#f0f0f0] bg-white flex gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
           <AntTable columns={columns} data={data} />
        <Pagination total={data.length} />
        </div>
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="仓库信息" width="850px">
        <div className="flex items-center gap-2 mb-3 p-2 bg-[#f9f9f9] border border-[#e8e8e8] rounded shadow-sm">
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:text-[#1677ff] hover:bg-[#e6f4ff] rounded transition-colors"><Plus size={14} className="text-green-500" /> 新建</button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:text-[#1677ff] hover:bg-[#e6f4ff] rounded transition-colors" onClick={() => setIsModalOpen(false)}><ArrowLeft size={14} className="text-green-500" /> 取消</button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:text-[#1677ff] hover:bg-[#e6f4ff] rounded transition-colors"><Settings size={14} className="text-gray-500" /> 配置</button>
        </div>

        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[38px]">
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库编码</div>
            <div className="w-[35%] p-1.5 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.code} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库描述</div>
            <div className="w-[35%] p-1.5 flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[38px]">
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>City</div>
            <div className="w-[35%] p-1.5 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>Building</div>
            <div className="w-[35%] p-1.5 flex items-center relative">
              <AntInput value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[38px]">
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">Floor</div>
            <div className="w-[35%] p-1.5 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} options={[]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库地址</div>
            <div className="w-[35%] p-1.5 flex items-center">
              <AntInput value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[38px]">
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库类型</div>
            <div className="w-[35%] p-1.5 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} options={[]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">仓库用途</div>
            <div className="w-[35%] p-1.5 flex items-center relative">
              <AntInput value={formData.usage} onChange={(e) => setFormData({...formData, usage: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[38px]">
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司</div>
            <div className="w-[35%] p-1.5 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>管理员</div>
            <div className="w-[35%] p-1.5 flex items-center relative">
              <AntInput value={formData.admin} onChange={(e) => setFormData({...formData, admin: e.target.value})} />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[38px]">
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否虚拟库</div>
            <div className="w-[35%] p-1.5 border-r border-[#e8e8e8] flex items-center gap-4 px-3">
              <AntRadio checked={formData.isVirtual === '1'} onChange={() => setFormData({...formData, isVirtual: '1'})} label="是" />
              <AntRadio checked={formData.isVirtual === '0'} onChange={() => setFormData({...formData, isVirtual: '0'})} label="否" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-1.5 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-1.5 flex items-center gap-4 px-3">
              <AntRadio checked={formData.isEnabled === '1'} onChange={() => setFormData({...formData, isEnabled: '1'})} label="是" />
              <AntRadio checked={formData.isEnabled === '0'} onChange={() => setFormData({...formData, isEnabled: '0'})} label="否" />
            </div>
          </div>
        </div>
      </AntModal>
    </div>
  )
}

// 17. 仓库用途
const WarehouseUsageView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', desc: '', category: '', mainCategory: '', subCategory: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ code: '', desc: '', category: '', mainCategory: '', subCategory: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ 
      code: record.code, desc: record.desc, category: record.category, 
      mainCategory: record.mainCategory, subCategory: record.subCategory, 
      enabled: record.enabled ? '1' : '0' 
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '编号', dataIndex: 'code' },
    { title: '描述', dataIndex: 'desc' },
    { title: '物品分类', dataIndex: 'category' },
    { title: '物品大类', dataIndex: 'mainCategory' },
    { title: '物品小类', dataIndex: 'subCategory' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, code: 'IU0007', desc: 'NO_Net-E库', category: '资产', mainCategory: 'NET EQUIPMENT', subCategory: '', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">编号:</span>
        <AntInput placeholder="请输入编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">描述:</span>
        <AntInput placeholder="请输入描述" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增用途' : '编辑用途'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>编号</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.code} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="请输入编号" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="请输入描述" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物品分类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物品大类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.mainCategory} onChange={(e) => setFormData({...formData, mainCategory: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物品小类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

// 18. 仓库权限
const WarehousePermissionView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    warehouse: '', operator: '', 
    inPerm: '0', defaultIn: '0', outPerm: '0', defaultOut: '0', invPerm: '0' 
  });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ warehouse: '', operator: '', inPerm: '0', defaultIn: '0', outPerm: '0', defaultOut: '0', invPerm: '0' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ 
      warehouse: record.warehouse, operator: record.operator, 
      inPerm: record.inPerm ? '1' : '0', defaultIn: record.defaultIn ? '1' : '0', 
      outPerm: record.outPerm ? '1' : '0', defaultOut: record.defaultOut ? '1' : '0', 
      invPerm: record.invPerm ? '1' : '0' 
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '操作人', dataIndex: 'operator' },
    { title: '入库权限', dataIndex: 'inPerm', render: (val) => val ? '是' : '否' },
    { title: '默认入库仓库', dataIndex: 'defaultIn', render: (val) => val ? '是' : '否' },
    { title: '出库权限', dataIndex: 'outPerm', render: (val) => val ? '是' : '否' },
    { title: '默认出库仓库', dataIndex: 'defaultOut', render: (val) => val ? '是' : '否' },
    { title: '盘点权限', dataIndex: 'invPerm', render: (val) => val ? '是' : '否' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, warehouse: 'I2031_资产库北京库(焦点互动)...', operator: '219128-刘蓓', inPerm: true, defaultIn: false, outPerm: true, defaultOut: false, invPerm: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">仓库编号:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索仓库..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">操作人:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索操作人..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">入库权限:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>

      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增权限' : '编辑权限'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>仓库</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.warehouse} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} placeholder="请选择仓库" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>操作人</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.operator} disabled={modalMode === 'edit'} onChange={(e) => setFormData({...formData, operator: e.target.value})} placeholder="请选择操作人" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>入库权限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.inPerm} onChange={(e) => setFormData({...formData, inPerm: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>出库权限</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.outPerm} onChange={(e) => setFormData({...formData, outPerm: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">默认入库仓库</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.defaultIn} onChange={(e) => setFormData({...formData, defaultIn: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">默认出库仓库</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.defaultOut} onChange={(e) => setFormData({...formData, defaultOut: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>盘点权限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.invPerm} onChange={(e) => setFormData({...formData, invPerm: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"></div>
            <div className="w-[35%] p-2 flex items-center"></div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <AntModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="批量修改" width="400px">
        <div className="flex flex-col items-center py-6 gap-5">
          <p className="text-gray-500 mb-2">请选择您要进行的操作</p>
          <div className="flex gap-4">
            <AntButton type="primary" icon={<Upload size={14} />}>上传文件</AntButton>
            <AntButton type="default" icon={<Download size={14} />}>下载模板</AntButton>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

// 19. 地点基础数据维护
const LocationBasicDataView = () => {
  const [expandedKeys, setExpandedKeys] = useState(['1', '2', '3']);

  const columns = [
    { title: '城市名称', dataIndex: 'cityName', render: (text, record) => record.children ? <span className="font-medium">{text}</span> : '' },
    { title: '建筑名称', dataIndex: 'buildingName', render: (text) => text || '-' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> }
  ];

  const data = [
    {
      id: '1', cityName: '北京市', enabled: true,
      children: [
        { id: '1-1', buildingName: '搜狐媒体大厦', enabled: true },
        { id: '1-2', buildingName: '搜狐网络大厦', enabled: true },
        { id: '1-3', buildingName: '搜狐畅游大厦', enabled: true },
      ]
    },
    {
      id: '2', cityName: '上海市', enabled: true,
      children: [
        { id: '2-1', buildingName: '搜狐上海大厦', enabled: true },
      ]
    },
    {
      id: '3', cityName: '深圳市', enabled: true,
      children: [
        { id: '3-1', buildingName: '搜狐深圳大厦', enabled: false },
      ]
    },
  ];

  // 递归筛选函数：筛选后保留完整树结构
  const filterTreeData = (treeData, cityNameFilter, buildingNameFilter, enabledFilter) => {
    return treeData.reduce((acc, node) => {
      // 检查城市名称是否匹配
      const cityMatch = !cityNameFilter || node.cityName?.includes(cityNameFilter);

      // 筛选子节点（建筑）
      const filteredChildren = node.children?.filter(child => {
        const buildingMatch = !buildingNameFilter || child.buildingName?.includes(buildingNameFilter);
        const statusMatch = enabledFilter === '' || enabledFilter === undefined ||
          (enabledFilter === '1' && child.enabled) || (enabledFilter === '0' && !child.enabled);
        return buildingMatch && statusMatch;
      }) || [];

      // 如果有匹配的子节点，或者城市名称匹配，则保留该节点
      if (filteredChildren.length > 0 || (cityMatch && (!buildingNameFilter || !node.children?.length))) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      return acc;
    }, []);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#f0f0f0]">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-4 gap-x-6">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">城市名称:</span>
                  <AntInput placeholder="请输入城市名称" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">建筑名称:</span>
                  <AntInput placeholder="请输入建筑名称" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-right text-sm text-gray-600">状态:</span>
                  <AntSelect options={[{label:'启用', value:'1'}, {label:'停用', value:'0'}]} placeholder="全部" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 shrink-0">
              <AntButton type="primary" icon={<Search size={14}/>}>查询</AntButton>
              <AntButton type="default" icon={<RefreshCcw size={14}/>}>重置</AntButton>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-[#f0f0f0] bg-white flex gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <div className="flex-1 overflow-auto bg-white p-4">
          <div className="border border-[#e8e8e8] rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#e8e8e8]">
                  <th className="w-[8%] p-2 text-left font-medium text-gray-700">序号</th>
                  <th className="w-[35%] p-2 text-left font-medium text-gray-700">城市名称</th>
                  <th className="w-[35%] p-2 text-left font-medium text-gray-700">建筑名称</th>
                  <th className="w-[22%] p-2 text-left font-medium text-gray-700">是否启用</th>
                </tr>
              </thead>
              <tbody>
                {data.map((city, cityIndex) => (
                  <React.Fragment key={city.id}>
                    {/* 城市行 */}
                    <tr className="border-b border-[#e8e8e8] bg-[#f5f5f5] hover:bg-[#e6f7ff] cursor-pointer"
                        onClick={() => {
                          const newExpanded = expandedKeys.includes(city.id)
                            ? expandedKeys.filter(k => k !== city.id)
                            : [...expandedKeys, city.id];
                          setExpandedKeys(newExpanded);
                        }}>
                      <td className="p-2">
                        <div className="flex items-center">
                          <span className="w-4">{expandedKeys.includes(city.id) ? '▼' : '▶'}</span>
                          <span>{cityIndex + 1}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium text-gray-800">{city.cityName}</span>
                      </td>
                      <td className="p-2 text-gray-500">-</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${city.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {city.enabled ? '启用' : '停用'}
                        </span>
                      </td>
                    </tr>
                    {/* 建筑行 */}
                    {expandedKeys.includes(city.id) && city.children?.map((building, buildingIndex) => (
                      <tr key={building.id} className="border-b border-[#e8e8e8] hover:bg-[#f0f5ff]">
                        <td className="p-2 pl-10 text-gray-500">
                          {cityIndex + 1}.{buildingIndex + 1}
                        </td>
                        <td className="p-2 pl-8 text-gray-400">
                          {city.cityName}
                        </td>
                        <td className="p-2">
                          <span className="text-gray-700">{building.buildingName}</span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${building.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {building.enabled ? '启用' : '停用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={data.length} />
        </div>
      </div>
    </div>
  )
}

// 20. 单据编号规则管理
const ReceiptRuleManagementView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ type: '', prefix: '', separator: '', hasCompany: '0', dateType: '', serialType: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ type: '', prefix: '', separator: '', hasCompany: '0', dateType: '', serialType: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ type: record.type || '', prefix: record.prefix || '', separator: record.separator || '', hasCompany: record.hasCompany ? '1' : '0', dateType: record.dateType || '', serialType: record.serialType || '' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '单据类型', dataIndex: 'type' },
    { title: '前缀', dataIndex: 'prefix' },
    { title: '分隔符', dataIndex: 'separator' },
    { title: '是否包含公司缩写', dataIndex: 'hasCompany', render: (val) => val ? '是' : '否' },
    { title: '日期类型', dataIndex: 'dateType' },
    { title: '流水号类型', dataIndex: 'serialType' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, type: '员工信息', prefix: 'PAI', separator: '-', hasCompany: false, dateType: '年月日', serialType: '5位流水号' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">单据类型:</span>
        <AntSelect options={[{label:'员工信息', value:'1'}, {label:'资产调拨', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">前缀:</span>
        <AntInput placeholder="请输入前缀" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">分隔符:</span>
        <AntInput placeholder="请输入分隔符" />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex flex-col h-full relative">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
        </div>
        <div className="flex-1 overflow-x-auto">
          <AntTable columns={columns} data={data} />
        <Pagination total={data.length} />
        </div>
        <div className="p-4 bg-[#fff1f0] border-t border-[#ffccc7] text-[#ff4d4f] text-sm">
          <div className="font-semibold mb-1">规范说明：</div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>单据编号规则必须包含有单据类型</li>
            <li>单据前缀及其连缀符仅在规则生成时使用</li>
          </ol>
        </div>
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增规则' : '编辑规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>单据类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} options={[{label:'员工信息', value:'员工信息'}, {label:'资产调拨', value:'资产调拨'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">前缀</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.prefix} onChange={(e) => setFormData({...formData, prefix: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">分隔符</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.separator} onChange={(e) => setFormData({...formData, separator: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否包含公司缩写</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.hasCompany} onChange={(e) => setFormData({...formData, hasCompany: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">日期类型</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.dateType} onChange={(e) => setFormData({...formData, dateType: e.target.value})} options={[{label:'年月日', value:'年月日'}, {label:'年月', value:'年月'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">流水号类型</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.serialType} onChange={(e) => setFormData({...formData, serialType: e.target.value})} options={[{label:'5位流水号', value:'5位流水号'}, {label:'4位流水号', value:'4位流水号'}]} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>
    </div>
  );
};

// 21. HR公司与财务公司映射
const HRCompanyFinanceMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR公司', dataIndex: 'hrCompany' },
    { title: 'HR公司描述', dataIndex: 'hrCompanyDesc' },
    { title: '财务公司', dataIndex: 'financeCompany' },
    { title: '财务公司描述', dataIndex: 'financeCompanyDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
  ];

  const data = [
    { id: 1, hrCompany: 'FRA', hrCompanyDesc: '北京搜狐新时代信息技术有限公司', financeCompany: '101', financeCompanyDesc: '新时代', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">HR公司:</span>
        <AntInput placeholder="请输入HR公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">财务公司:</span>
        <AntInput placeholder="请输入财务公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 22. 部门与成本中心映射
const DeptCostCenterMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR部门', dataIndex: 'hrDept' },
    { title: 'HR部门描述', dataIndex: 'hrDeptDesc' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
  ];

  const data = [
    { id: 1, hrDept: 'D0177', hrDeptDesc: '搜狐媒体_大沟通', costCenter: '111001', costCenterDesc: 'BD_大沟通', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">HR部门:</span>
        <AntInput placeholder="请输入HR部门" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
        <AntInput placeholder="请输入成本中心" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 23. 成本中心与板块映射
const CostCenterPlateMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '板块', dataIndex: 'plate' },
    { title: '板块描述', dataIndex: 'plateDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
  ];

  const data = [
    { id: 1, costCenter: '181004', costCenterDesc: '搜狐-畅游品牌_节目制作部_内容运营', plate: '18', plateDesc: '畅游-畅游品牌', enabled: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
        <AntInput placeholder="请输入成本中心" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <AntInput placeholder="请输入板块" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 24. 城市与业务线映射
const CityBusinessLineMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '城市', dataIndex: 'city' },
    { title: '城市描述', dataIndex: 'cityDesc' },
    { title: '业务线', dataIndex: 'businessLine' },
    { title: '业务线描述', dataIndex: 'businessLineDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
  ];

  const data = [
    { id: 1, city: '001', cityDesc: '美国', businessLine: '', businessLineDesc: '', enabled: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">城市:</span>
        <AntInput placeholder="请输入城市" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">业务线:</span>
        <AntInput placeholder="请输入业务线" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 25. 部门与业务线映射
const DeptBusinessLineMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'HR部门', dataIndex: 'hrDept' },
    { title: 'HR部门描述', dataIndex: 'hrDeptDesc' },
    { title: '业务线', dataIndex: 'businessLine' },
    { title: '业务线描述', dataIndex: 'businessLineDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
  ];

  const data = [
    { id: 1, hrDept: 'D2307', hrDeptDesc: '焦点房地产资讯', businessLine: 'F601', businessLineDesc: '石家庄', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">HR部门:</span>
        <AntInput placeholder="请输入HR部门" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">业务线:</span>
        <AntInput placeholder="请输入业务线" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} placeholder="请选择..." />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 26. 资产配给规则管理
const AssetAllocationRuleView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '影像器材配给方案名称', dataIndex: 'name' },
    { title: '影像器材配给方案描述', dataIndex: 'desc' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '资产级别', dataIndex: 'level' },
    { title: '数量', dataIndex: 'qty' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, name: '高配影像器材', desc: '方案3', subCat: '摄影摄像-镜头', level: '高端', qty: 3 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案名称:</span>
        <AntSelect options={[{label:'高配影像器材', value:'1'}, {label:'标配影像器材', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-40 text-right text-sm text-gray-600">影像器材配给方案描述:</span>
        <AntSelect options={[{label:'方案1', value:'1'}, {label:'方案2', value:'2'}]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">资产级别:</span>
        <AntSelect options={[{label:'高端', value:'1'}, {label:'中低端', value:'2'}]} />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 27. 物资申请超标配置
const MaterialRequestLimitView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ name: '', subCat: '', excludeSubCat: '', excludePerson: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ name: '', subCat: '', excludeSubCat: '', excludePerson: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ name: record.name || '', subCat: record.subCat || '', excludeSubCat: record.excludeSubCat || '', excludePerson: record.excludePerson || '' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name' },
    { title: '小类', dataIndex: 'subCat' },
    { title: '排除小类', dataIndex: 'excludeSubCat' },
    { title: '排除人', dataIndex: 'excludePerson' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { name: '主机-设计主机', subCat: '12302_主机-设计主机', excludeSubCat: '12302_主机...', excludePerson: '' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">规则名称:</span>
        <AntInput placeholder="请输入规则名称" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">小类:</span>
        <AntInput placeholder="请输入小类" />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>编辑</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增超标规则' : '编辑超标规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规则名称</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">小类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.subCat} onChange={(e) => setFormData({...formData, subCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">排除小类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.excludeSubCat} onChange={(e) => setFormData({...formData, excludeSubCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">排除人</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.excludePerson} onChange={(e) => setFormData({...formData, excludePerson: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>
    </div>
  );
};

// 28. 资产折旧规则管理
const AssetDepreciationRuleView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCat: '', subCat: '', originalValue: '', relation: '>=', years: '', valueType: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCat: record.mainCat || '', subCat: record.subCat || '', originalValue: record.originalValue || '', relation: record.relation || '>=', years: record.years || '', valueType: record.valueType || '' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料小类', dataIndex: 'subCat' },
    { title: '原值要求', dataIndex: 'originalValue' },
    { title: '计算关系', dataIndex: 'relation' },
    { title: '使用年限', dataIndex: 'years' },
    { title: '账面金额类型', dataIndex: 'valueType' },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { mainCat: 'OFFICE EQUIPMENT', subCat: '摄影摄像-单反机身', originalValue: '5000.0', relation: '>=', years: '4年以上', valueType: '净值' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-[-10px] mt-2 relative z-10 mr-4">
         <AntButton type="default" className="text-gray-600 hover:text-[#1677ff]">计算</AntButton>
      </div>
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索物料大类..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">物料小类:</span>
        <div className="flex-1 relative">
          <AntInput placeholder="搜索物料小类..." />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">使用年限:</span>
        <AntSelect options={[{label:'4年以上', value:'1'}, {label:'4年以内', value:'2'}]} placeholder="请选择..." />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>编辑</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增折旧规则' : '编辑折旧规则'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.mainCat} onChange={(e) => setFormData({...formData, mainCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料小类</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.subCat} onChange={(e) => setFormData({...formData, subCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">原值要求</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.originalValue} onChange={(e) => setFormData({...formData, originalValue: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">计算关系</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.relation} onChange={(e) => setFormData({...formData, relation: e.target.value})} options={[{label:'>=', value:'>='}, {label:'<=', value:'<='}, {label:'=', value:'='}]} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">使用年限</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntSelect value={formData.years} onChange={(e) => setFormData({...formData, years: e.target.value})} options={[{label:'4年以上', value:'4年以上'}, {label:'4年以内', value:'4年以内'}, {label:'不限', value:'不限'}]} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">账面金额类型</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.valueType} onChange={(e) => setFormData({...formData, valueType: e.target.value})} options={[{label:'净值', value:'净值'}, {label:'原值', value:'原值'}]} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>
    </div>
  );
};

// 29. 账套内容维护
const AccountBookContentView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '公司', dataIndex: 'company' },
    { title: '板块', dataIndex: 'plate' },
    { title: '账套名称', dataIndex: 'name' },
    { title: '账套名称中文', dataIndex: 'cnName' },
    { title: '账套名称英文', dataIndex: 'enName' },
    { title: '操作', dataIndex: 'action', render: () => <AntButton type="link">操作</AntButton> }
  ];

  const data = [
    { id: 1, company: '搜狐干线', plate: 'SAAS', name: '搜狐干线', cnName: '搜狐干线', enName: 'FOCUS XinGanXian' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <AntInput placeholder="请输入公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <AntInput placeholder="请输入板块" />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};

// 30. 费用账户规则
const ExpenseAccountRuleView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ inCat: '', inComp: '', inCost: '', outComp: '', outPlate: '', outCost: '', outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ inCat: '', inComp: '', inCost: '', outComp: '', outPlate: '', outCost: '', outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ inCat: record.inCat || '', inComp: record.inComp || '', inCost: record.inCost || '', outComp: record.outComp || '', outPlate: record.outPlate || '', outCost: record.outCost || '', outSubj: record.outSubj || '', outSubSubj: record.outSubSubj || '', outLine: record.outLine || '', outProj: record.outProj || '', outTrans: record.outTrans || '', outMisc: record.outMisc || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类(输入)', dataIndex: 'inCat' },
    { title: '公司(输入)', dataIndex: 'inComp' },
    { title: '成本中心(输入)', dataIndex: 'inCost' },
    { title: '公司(输出)', dataIndex: 'outComp' },
    { title: '板块(输出)', dataIndex: 'outPlate' },
    { title: '成本中心(输出)', dataIndex: 'outCost' },
    { title: '科目(输出)', dataIndex: 'outSubj' },
    { title: '子目(输出)', dataIndex: 'outSubSubj' },
    { title: '业务线(输出)', dataIndex: 'outLine' },
    { title: '项目(输出)', dataIndex: 'outProj' },
    { title: '往来(输出)', dataIndex: 'outTrans' },
    { title: '备用(输出)', dataIndex: 'outMisc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, inCat: '16.FURNITURE', inComp: '114_新媒体', inCost: '112064', outComp: '', outPlate: '17_Corporate', outCost: '909003', outSubj: '', outSubSubj: '', outLine: '', outProj: '', outTrans: '', outMisc: '', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">物料大类(输入):</span>
        <AntInput placeholder="请输入物料大类" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">公司:</span>
        <AntInput placeholder="请输入公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-28 text-right text-sm text-gray-600">成本中心(输入):</span>
        <AntInput placeholder="请输入成本中心" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增费用账户规则' : '编辑费用账户规则'} width="900px">
        {/* 输入属性信息 */}
        <div className="mb-4">
          <div className="bg-[#e6f7ff] border border-[#91d5ff] px-4 py-2 rounded-t text-sm font-medium text-[#1890ff]">
            输入属性信息
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类(输入)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => setIsMaterialCategoryModalOpen(true)}>
                <AntInput value={formData.inCat} onChange={(e) => setFormData({...formData, inCat: e.target.value})} readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司(输入)</div>
              <div className="w-[35%] p-2 flex items-center relative">
                <AntInput value={formData.inComp} onChange={(e) => setFormData({...formData, inComp: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心(输入)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
                <AntInput value={formData.inCost} onChange={(e) => setFormData({...formData, inCost: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>是否启用</div>
              <div className="w-[35%] p-2 flex items-center">
                <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
              </div>
            </div>
          </div>
        </div>

        {/* 输出属性信息 */}
        <div className="mb-4">
          <div className="bg-[#f6ffed] border border-[#b7eb8f] px-4 py-2 rounded-t text-sm font-medium text-[#52c41a]">
            输出属性信息
          </div>
          <div className="border border-t-0 border-[#e8e8e8] text-sm">
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>公司(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
                <AntInput value={formData.outComp} onChange={(e) => setFormData({...formData, outComp: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative">
                <AntInput value={formData.outPlate} onChange={(e) => setFormData({...formData, outPlate: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntInput value={formData.outCost} onChange={(e) => setFormData({...formData, outCost: e.target.value})} />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目(输出)</div>
              <div className="w-[35%] p-2 flex items-center">
                <AntInput value={formData.outSubj} onChange={(e) => setFormData({...formData, outSubj: e.target.value})} />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">子目(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntInput value={formData.outSubSubj} onChange={(e) => setFormData({...formData, outSubSubj: e.target.value})} />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">业务线(输出)</div>
              <div className="w-[35%] p-2 flex items-center">
                <AntInput value={formData.outLine} onChange={(e) => setFormData({...formData, outLine: e.target.value})} />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">项目(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
                <AntInput value={formData.outProj} onChange={(e) => setFormData({...formData, outProj: e.target.value})} />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">往来(输出)</div>
              <div className="w-[35%] p-2 flex items-center relative">
                <AntInput value={formData.outTrans} onChange={(e) => setFormData({...formData, outTrans: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
            </div>
            <div className="flex min-h-[40px]">
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">备用(输出)</div>
              <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
                <AntInput value={formData.outMisc} onChange={(e) => setFormData({...formData, outMisc: e.target.value})} placeholder="请选择" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
              </div>
              <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8]"></div>
              <div className="w-[35%] p-2"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <MaterialCategorySelectModal
        isOpen={isMaterialCategoryModalOpen}
        onClose={() => setIsMaterialCategoryModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            inCat: selected.desc
          });
        }}
      />
    </div>
  );
};

// 31. 成本中心与科目映射
const CostCenterSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [formData, setFormData] = useState({ costCenter: '', costCenterDesc: '', cat: '', company: '', subject: '', subjectDesc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ costCenter: '', costCenterDesc: '', cat: '', company: '', subject: '', subjectDesc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ costCenter: record.costCenter || '', costCenterDesc: record.costCenterDesc || '', cat: record.cat || '', company: record.company || '', subject: record.subject || '', subjectDesc: record.subjectDesc || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '大类', dataIndex: 'cat' },
    { title: '公司', dataIndex: 'company' },
    { title: '科目', dataIndex: 'subject' },
    { title: '科目描述', dataIndex: 'subjectDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, costCenter: '168001', costCenterDesc: '视频_分摊费用', cat: '11 PC', company: '115 新媒体-上海', subject: '72101', subjectDesc: 'General and Administrative', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">大类:</span>
        <AntInput placeholder="请输入大类" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">公司:</span>
        <AntInput placeholder="请输入公司" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">成本中心:</span>
        <AntInput placeholder="请输入成本中心" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">科目:</span>
        <AntInput placeholder="请输入科目" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="default" icon={<Edit size={14} />}>批量修改</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增成本中心与科目映射' : '编辑成本中心与科目映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>成本中心</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.costCenterDesc} onChange={(e) => setFormData({...formData, costCenterDesc: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.cat} onChange={(e) => setFormData({...formData, cat: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">公司</div>
            <div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsCompanyModalOpen(true)}>
              <AntInput value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="请选择" readOnly className="pointer-events-none" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.subjectDesc} onChange={(e) => setFormData({...formData, subjectDesc: e.target.value})} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>

      <CompanySelectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={(selected) => {
          setFormData({
            ...formData,
            company: selected.desc
          });
        }}
      />
    </div>
  );
};

// 32. 物料大类与子目映射
const MaterialSubSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({ mainCat: '', mainCatDesc: '', subSubj: '', subSubjDesc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ mainCat: '', mainCatDesc: '', subSubj: '', subSubjDesc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ mainCat: record.mainCat || '', mainCatDesc: record.mainCatDesc || '', subSubj: record.subSubj || '', subSubjDesc: record.subSubjDesc || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '物料大类', dataIndex: 'mainCat' },
    { title: '物料大类描述', dataIndex: 'mainCatDesc' },
    { title: '子科目', dataIndex: 'subSubj' },
    { title: '子科目描述', dataIndex: 'subSubjDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [
    { id: 1, mainCat: '22', mainCatDesc: 'Park lot land use rights', subSubj: 'E2102', subSubjDesc: 'Dpm - Park Lot Using Right', enabled: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">物料大类:</span>
        <AntInput placeholder="请输入物料大类" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">子科目:</span>
        <AntInput placeholder="请输入子科目" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增物料大类与子目映射' : '编辑物料大类与子目映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center relative">
              <AntInput value={formData.mainCat} onChange={(e) => setFormData({...formData, mainCat: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">物料大类描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.mainCatDesc} onChange={(e) => setFormData({...formData, mainCatDesc: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">子科目</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.subSubj} onChange={(e) => setFormData({...formData, subSubj: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">子科目描述</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.subSubjDesc} onChange={(e) => setFormData({...formData, subSubjDesc: e.target.value})} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>
    </div>
  );
};

// 33. NO一级服务与科目映射
const NOServiceSubjectMappingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ service: '', plate: '', plateDesc: '', costCenter: '', costCenterDesc: '', subject: '', subjectDesc: '', enabled: '1' });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ service: '', plate: '', plateDesc: '', costCenter: '', costCenterDesc: '', subject: '', subjectDesc: '', enabled: '1' });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({ service: record.service || '', plate: record.plate || '', plateDesc: record.plateDesc || '', costCenter: record.costCenter || '', costCenterDesc: record.costCenterDesc || '', subject: record.subject || '', subjectDesc: record.subjectDesc || '', enabled: record.enabled ? '1' : '0' });
    setIsModalOpen(true);
  };

  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: 'NO一级服务', dataIndex: 'service' },
    { title: '板块', dataIndex: 'plate' },
    { title: '板块描述', dataIndex: 'plateDesc' },
    { title: '成本中心', dataIndex: 'costCenter' },
    { title: '成本中心描述', dataIndex: 'costCenterDesc' },
    { title: '科目', dataIndex: 'subject' },
    { title: '科目描述', dataIndex: 'subjectDesc' },
    { title: '是否启用', dataIndex: 'enabled', render: (val) => <span className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? '启用' : '停用'}</span> },
    { title: '操作', dataIndex: 'action', render: (_, record) => <AntButton type="link" onClick={() => handleEdit(record)}>编辑</AntButton> }
  ];

  const data = [];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-24 text-right text-sm text-gray-600">NO一级服务:</span>
        <AntInput placeholder="请输入服务" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">板块:</span>
        <AntInput placeholder="请输入板块" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">是否启用:</span>
        <AntSelect options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />

      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</AntButton>
          <AntButton type="danger" icon={<Trash2 size={14} />}>删除</AntButton>
          <AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
          <AntButton type="default" className="text-red-500" icon={<XCircle size={14} />}>停用</AntButton>
        </div>
        <div className="min-h-[200px]">
           <AntTable columns={columns} data={data} />
           <Pagination total={data.length} />
           {data.length === 0 && <div className="text-center py-10 text-gray-400">暂无数据</div>}
        </div>
      </div>
      <AntModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? '新增NO一级服务与科目映射' : '编辑NO一级服务与科目映射'} width="900px">
        <div className="border border-[#e8e8e8] text-sm mb-4">
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>NO一级服务</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块</div>
            <div className="w-[35%] p-2 flex items-center relative">
              <AntInput value={formData.plate} onChange={(e) => setFormData({...formData, plate: e.target.value})} placeholder="请选择" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] cursor-pointer" />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">板块描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.plateDesc} onChange={(e) => setFormData({...formData, plateDesc: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} />
            </div>
          </div>
          <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">成本中心描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.costCenterDesc} onChange={(e) => setFormData({...formData, costCenterDesc: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntInput value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
            </div>
          </div>
          <div className="flex min-h-[40px]">
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">科目描述</div>
            <div className="w-[35%] p-2 border-r border-[#e8e8e8] flex items-center">
              <AntInput value={formData.subjectDesc} onChange={(e) => setFormData({...formData, subjectDesc: e.target.value})} />
            </div>
            <div className="w-[15%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
            <div className="w-[35%] p-2 flex items-center">
              <AntSelect value={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.value})} options={[{label:'是', value:'1'}, {label:'否', value:'0'}]} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <AntButton type="primary" onClick={() => setIsModalOpen(false)} className="px-6">保存</AntButton>
          <AntButton type="default" onClick={() => setIsModalOpen(false)} className="px-6">返回</AntButton>
        </div>
      </AntModal>
    </div>
  );
};

// 34. 员工与项目映射
const EmployeeProjectMappingView = () => {
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '员工编号', dataIndex: 'empNo' },
    { title: '员工姓名', dataIndex: 'empName' },
    { title: '项目名称', dataIndex: 'projName' }
  ];

  const data = [
    { id: 21, empNo: '219177', empName: '黄涛', projName: 'A项目' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <QueryBar>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">员工编号:</span>
        <AntInput placeholder="请输入员工编号" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">员工姓名:</span>
        <AntInput placeholder="请输入员工姓名" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-right text-sm text-gray-600">项目名称:</span>
        <AntInput placeholder="请输入项目名称" />
      </div>
      </QueryBar>
      <div className="bg-white border border-[#f0f0f0] rounded shadow-sm flex-1">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-2">
          <AntButton type="default" className="text-green-600 border-[#b7eb8f] bg-[#f6ffed] hover:border-green-500" icon={<RefreshCcw size={14} />}>同步</AntButton>
        </div>
        <AntTable columns={columns} data={data} />
      <Pagination total={data.length} />
      </div>
    </div>
  );
};



// --- Main Application Layout ---

export default function App() {
  const [activeMenu, setActiveMenu] = useState('业务配置');
  const [activeSubMenu, setActiveSubMenu] = useState('业务基础数据维护');
  const [activeTab, setActiveTab] = useState('物料大类');

  const baseDataTabs = ['物料维度组合', '物料大类', '物料小类', '品牌', '型号', '配置', 'NO服务'];
  const mappingTabs = ['办公区与仓库映射', 'PS新员工领用物料映射', 'NO地点与资产地点映射', '虚拟库管员映射', '板块与账簿映射'];
  const authTabs = ['公司板块提取资产权限', 'NO设备提取资产权限', '公司归属权限'];
  const warehouseTabs = ['仓库信息', '仓库用途', '仓库权限'];
  const locationTabs = ['地点基础数据维护'];
  const receiptRuleTabs = ['单据编号规则管理'];
  const accountingTabs = ['HR公司与财务公司映射', '部门与成本中心映射', '成本中心与板块映射', '城市与业务线映射', '部门与业务线映射'];
  const assetAllocationTabs = ['电脑配给方案', '影像器材配给方案', '配给规则'];
  const materialLimitTabs = ['超标规则'];
  const expenseAccountTabs = ['费用账户规则', '成本中心与科目映射', '物料大类与子目映射', 'NO一级服务与科目映射', '员工与项目映射'];
  const depreciationTabs = ['资产折旧规则管理'];
  const accountBookTabs = ['账套内容维护'];
  
  const tabs = activeSubMenu === '业务基础数据维护' ? baseDataTabs : 
               activeSubMenu === '业务映射规则管理' ? mappingTabs : 
               activeSubMenu === '业务权限规则管理' ? authTabs : 
               activeSubMenu === '仓库基础数据维护' ? warehouseTabs : 
               activeSubMenu === '地点基础数据维护' ? locationTabs : 
               activeSubMenu === '单据编号规则管理' ? receiptRuleTabs : 
               activeSubMenu === '会计映射规则管理' ? accountingTabs : 
               activeSubMenu === '资产配给规则管理' ? assetAllocationTabs : 
               activeSubMenu === '物资申请超标配置' ? materialLimitTabs : 
               activeSubMenu === '费用账户规则管理' ? expenseAccountTabs :
               activeSubMenu === '资产折旧规则管理' ? depreciationTabs : 
               activeSubMenu === '账套内容维护' ? accountBookTabs : [];

  const handleSubMenuClick = (sub) => {
    setActiveSubMenu(sub);
    if (sub === '业务基础数据维护') setActiveTab('物料大类');
    if (sub === '业务映射规则管理') setActiveTab('办公区与仓库映射');
    if (sub === '业务权限规则管理') setActiveTab('公司板块提取资产权限');
    if (sub === '仓库基础数据维护') setActiveTab('仓库信息');
    if (sub === '地点基础数据维护') setActiveTab('地点基础数据维护');
    if (sub === '单据编号规则管理') setActiveTab('单据编号规则管理');
    if (sub === '会计映射规则管理') setActiveTab('HR公司与财务公司映射');
    if (sub === '资产配给规则管理') setActiveTab('影像器材配给方案');
    if (sub === '物资申请超标配置') setActiveTab('超标规则');
    if (sub === '费用账户规则管理') setActiveTab('费用账户规则');
    if (sub === '资产折旧规则管理') setActiveTab('资产折旧规则管理');
    if (sub === '账套内容维护') setActiveTab('账套内容维护');
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] font-sans text-gray-800 overflow-hidden">
      <div className="w-56 bg-[#001529] text-white flex flex-col transition-all duration-300 shadow-xl z-20 relative">
        <div className="h-14 flex items-center gap-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.3)] z-10 bg-[#002140]">
          <div className="w-8 h-8 rounded bg-[#1677ff] flex items-center justify-center font-bold text-lg shadow-sm">E</div>
          <span className="font-semibold text-base tracking-wide text-white">企业资产管理系统</span>
        </div>
        <div className="py-4 px-5 border-b border-white/10 flex flex-col gap-1 text-sm bg-[#001529]">
          <div className="flex items-center gap-2 text-gray-300">
            <User size={14} />
            <span className="font-medium text-white">系统管理员 (admin)</span>
          </div>
          <div className="text-gray-400 text-xs ml-5">2026年05月27日 星期三</div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {[
            { id: '个人工作台', icon: <LayoutDashboard size={16} /> },
            { id: '资产管理', icon: <Monitor size={16} /> },
            { id: '无形资产', icon: <Layers size={16} /> },
            { id: '资产盘点', icon: <ClipboardList size={16} /> },
          ].map(item => (
             <div 
               key={item.id}
               className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm transition-colors hover:text-white ${activeMenu === item.id ? 'text-white bg-[#1677ff]' : 'text-gray-300 hover:bg-white/5'}`}
               onClick={() => setActiveMenu(item.id)}
             >
               {item.icon}
               <span>{item.id}</span>
             </div>
          ))}
          <div className="mt-1">
            <div
              className={`flex items-center justify-between px-5 py-3 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5`}
              onClick={() => setActiveMenu('业务配置')}
            >
              <div className="flex items-center gap-3">
                <Settings size={16} />
                <span>业务配置</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${activeMenu === '业务配置' ? 'rotate-180' : ''}`} />
            </div>
            {activeMenu === '业务配置' && (
              <div className="bg-[#000c17] py-1">
                {[
                  '业务基础数据维护',
                  '业务映射规则管理',
                  '业务权限规则管理',
                  '仓库基础数据维护',
                  '地点基础数据维护',
                  '单据编号规则管理',
                  '会计映射规则管理',
                  '资产配给规则管理',
                  '物资申请超标配置',
                  '费用账户规则管理',
                  '资产折旧规则管理',
                  '账套内容维护',
                ].map(sub => (
                  <div
                    key={sub}
                    className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${activeSubMenu === sub ? 'text-white bg-[#1677ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    onClick={() => handleSubMenuClick(sub)}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 系统配置 - 与业务配置同级 */}
          <div className="mt-1">
            <div
              className={`flex items-center justify-between px-5 py-3 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5`}
              onClick={() => {
                // 如果已经在系统配置下，则折叠；否则展开并显示组织与用户管理
                if (activeMenu === '系统配置') {
                  setActiveMenu('业务配置'); // 折叠回去
                } else {
                  setActiveMenu('系统配置');
                  setActiveSubMenu('组织与用户管理');
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Layers size={16} />
                <span>系统配置</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${activeMenu === '系统配置' ? 'rotate-180' : ''}`} />
            </div>
            {activeMenu === '系统配置' && (
              <div className="bg-[#000c17] py-1">
                <div
                  className={`pl-12 pr-5 py-2.5 cursor-pointer text-sm transition-colors ${activeSubMenu === '组织与用户管理' ? 'text-white bg-[#1677ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveSubMenu('组织与用户管理')}
                >
                  组织与用户管理
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        <div className="h-14 bg-white shadow-[0_1px_4px_rgba(0,21,41,0.08)] flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <div className="p-1 cursor-pointer text-gray-500 hover:bg-gray-100 rounded transition-colors">
              <Menu size={20} />
            </div>
            <div className="flex items-end h-full pt-3 gap-1">
               <div className="px-4 py-1.5 bg-[#fafafa] border border-b-0 border-[#f0f0f0] rounded-t-md text-sm text-gray-500 cursor-pointer flex items-center gap-2 hover:bg-gray-50">
                 我的资产
                 <XCircle size={12} className="hover:text-red-500" />
               </div>
               <div className="px-4 py-1.5 bg-[#e6f4ff] border border-b-0 border-[#1677ff] rounded-t-md text-sm text-[#1677ff] font-medium cursor-pointer flex items-center gap-2 relative top-[1px]">
                 {activeSubMenu}
                 <XCircle size={12} className="hover:text-[#1677ff]" />
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Bell size={18} className="cursor-pointer hover:text-gray-800 transition-colors" />
            <div className="w-7 h-7 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs shadow-sm cursor-pointer hover:opacity-90">A</div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
             <span>首页</span>
             <ChevronRight size={14} />
             <span>{activeMenu}</span>
             <ChevronRight size={14} />
             <span className="text-gray-800 font-medium">{activeSubMenu}</span>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-[#f0f0f0] min-h-[calc(100vh-140px)] flex flex-col">
            {activeMenu !== '系统配置' && (
              <div className="flex items-center border-b border-[#f0f0f0] px-4 pt-2 overflow-x-auto custom-scrollbar bg-white rounded-t-md">
                {tabs.map(tab => (
                  <div
                    key={tab}
                    className={`px-5 py-3 text-sm cursor-pointer whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#1677ff] font-medium' : 'text-gray-600 hover:text-[#1677ff]'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1677ff]" />}
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 md:p-5 bg-[#fafafa] flex-1 flex flex-col relative">
              {/* 系统配置 - 组织与用户管理 */}
              {activeMenu === '系统配置' && activeSubMenu === '组织与用户管理' && (
                <div className="flex-1 flex flex-col relative">
                  <OrgAndUserContainer />
                </div>
              )}

              {/* 业务基础数据维护 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '物料维度组合' && <MaterialComprehensiveView />}
              {activeMenu === '业务配置' && activeTab === '物料大类' && <MaterialCategoryView />}
              {activeMenu === '业务配置' && activeTab === '物料小类' && <MaterialSubCategoryView />}
              {activeMenu === '业务配置' && activeTab === '品牌' && <BrandView />}
              {activeMenu === '业务配置' && activeTab === '型号' && <ModelView />}
              {activeMenu === '业务配置' && activeTab === '配置' && <ConfigView />}
              {activeMenu === '业务配置' && activeTab === 'NO服务' && <NOServiceView />}
              
              {/* 业务映射规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '办公区与仓库映射' && <OfficeWarehouseMappingView />}
              {activeMenu === '业务配置' && activeTab === 'PS新员工领用物料映射' && <PSNewEmployeeMappingView />}
              {activeMenu === '业务配置' && activeTab === 'NO地点与资产地点映射' && <NOLocationMappingView />}
              {activeMenu === '业务配置' && activeTab === '虚拟库管员映射' && <VirtualWarehouseManagerMappingView />}
              {activeMenu === '业务配置' && activeTab === '板块与账簿映射' && <PlateLedgerMappingView />}

              {/* 业务权限规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '公司板块提取资产权限' && <CompanyPlateAssetAuthView />}
              {activeMenu === '业务配置' && activeTab === 'NO设备提取资产权限' && <NODeviceAssetAuthView />}
              {activeMenu === '业务配置' && activeTab === '公司归属权限' && <CompanyBelongingAuthView />}

              {/* 仓库基础数据维护 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '仓库信息' && <WarehouseInfoView />}
              {activeMenu === '业务配置' && activeTab === '仓库用途' && <WarehouseUsageView />}
              {activeMenu === '业务配置' && activeTab === '仓库权限' && <WarehousePermissionView />}

              {/* 地点基础数据维护 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '地点基础数据维护' && <LocationBasicDataView />}

              {/* 单据编号规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '单据编号规则管理' && <ReceiptRuleManagementView />}

              {/* 会计映射规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === 'HR公司与财务公司映射' && <HRCompanyFinanceMappingView />}
              {activeMenu === '业务配置' && activeTab === '部门与成本中心映射' && <DeptCostCenterMappingView />}
              {activeMenu === '业务配置' && activeTab === '成本中心与板块映射' && <CostCenterPlateMappingView />}
              {activeMenu === '业务配置' && activeTab === '城市与业务线映射' && <CityBusinessLineMappingView />}
              {activeMenu === '业务配置' && activeTab === '部门与业务线映射' && <DeptBusinessLineMappingView />}

              {/* 资产配给规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '影像器材配给方案' && <AssetAllocationRuleView />}

              {/* 物资申请超标配置 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '超标规则' && <MaterialRequestLimitView />}

              {/* 费用账户规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '费用账户规则' && <ExpenseAccountRuleView />}
              {activeMenu === '业务配置' && activeTab === '成本中心与科目映射' && <CostCenterSubjectMappingView />}
              {activeMenu === '业务配置' && activeTab === '物料大类与子目映射' && <MaterialSubSubjectMappingView />}
              {activeMenu === '业务配置' && activeTab === 'NO一级服务与科目映射' && <NOServiceSubjectMappingView />}
              {activeMenu === '业务配置' && activeTab === '员工与项目映射' && <EmployeeProjectMappingView />}

              {/* 资产折旧规则管理 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '资产折旧规则管理' && <AssetDepreciationRuleView />}

              {/* 账套内容维护 - 只在业务配置下显示 */}
              {activeMenu === '业务配置' && activeTab === '账套内容维护' && <AccountBookContentView />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}