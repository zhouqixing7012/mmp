import React from 'react';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import { Button, Input, Select, Modal, Radio, DatePicker } from 'antd';

const MaterialComprehensiveFormModal = ({
  open,
  onClose,
  modalMode,
  formData,
  setFormData,
  setIsMaterialCategoryModalOpen,
  setIsSubCategoryModalOpen,
  setIsBrandModalOpen,
  setIsModelModalOpen,
  setIsConfigModalOpen,
  setIsDeptModalOpen,
  setIsEmpModalOpen,
}) => (
  <Modal open={open} onCancel={onClose} footer={null} title={modalMode === 'add' ? '新增物料维度组合' : '编辑物料维度组合'} width="1100px">
    <div className="mb-4">
      <div className="bg-[#e6f7ff] border border-[#91d5ff] px-4 py-2 rounded-t text-sm font-medium text-[#1890ff]">核心字段</div>
      <div className="border border-t-0 border-[#e8e8e8] text-sm">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">维度组合编码</div>
          <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><Input value={formData.code || '系统自动生成'} disabled className="bg-[#f5f5f5]" /></div>
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>维度组合描述</div>
          <div className="w-[37.5%] p-2 flex items-center"><Input value={formData.brand && formData.modelCode ? `${formData.brand}.${formData.modelCode}` : '请先选择品牌/规格型号'} disabled className="bg-[#f5f5f5]" /></div>
        </div>
        {modalMode === 'add' ? (
          <>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料总类</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><Select value={formData.mainCatCode} onChange={(value) => setFormData({ ...formData, mainCatCode: value })} options={[{ label: '资产', value: '1' }, { label: '耗材', value: '2' }, { label: '低值耐用品', value: '3' }]} className="w-full" placeholder="请选择" allowClear /></div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类/小类</div>
              <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => { if (formData.mainCatDesc) setIsSubCategoryModalOpen(true); else setIsMaterialCategoryModalOpen(true); }}>
                <Input value={formData.mainCatDesc && formData.subCatDesc ? `${formData.mainCatDesc} / ${formData.subCatDesc}` : ''} placeholder="请先选择物料大类" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌/规格型号</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center relative cursor-pointer" onClick={() => { if (!formData.brand) setIsBrandModalOpen(true); else setIsModelModalOpen(true); }}>
                <Input value={formData.brand && formData.modelCode ? `${formData.brand} / ${formData.modelCode}` : ''} placeholder="请先选择品牌" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">配置描述</div>
              <div className="w-[37.5%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsConfigModalOpen(true)}>
                <Input value={formData.configDesc || ''} placeholder="请选择配置" readOnly className="pointer-events-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料总类</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><Select value={formData.mainCatCode} disabled className="w-full" options={[{ label: '资产', value: '1' }, { label: '耗材', value: '2' }, { label: '低值耐用品', value: '3' }]} /></div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料大类</div>
              <div className="w-[37.5%] p-2 flex items-center"><Input value={formData.mainCatDesc || ''} disabled /></div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>物料小类</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><Input value={formData.subCatDesc || ''} disabled /></div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>品牌</div>
              <div className="w-[37.5%] p-2 flex items-center"><Input value={formData.brand || ''} disabled /></div>
            </div>
            <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>规格型号</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><Input value={formData.modelDesc || formData.model || ''} disabled /></div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">配置</div>
              <div className="w-[37.5%] p-2 flex items-center"><Input value={formData.configDesc || ''} disabled /></div>
            </div>
          </>
        )}
        <div className="flex min-h-[40px]">
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">单位</div>
          <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><Input value={formData.unit || ''} onChange={(event) => setFormData({ ...formData, unit: event.target.value })} placeholder="请输入单位" /></div>
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right"><span className="text-red-500 mr-1">*</span>参考价格</div>
          <div className="w-[37.5%] p-2 flex items-center"><Input value={formData.refPrice || ''} onChange={(event) => setFormData({ ...formData, refPrice: event.target.value })} placeholder="请输入价格（元）" /></div>
        </div>
      </div>
    </div>

    <div className="mb-4">
      <div className="bg-[#f6ffed] border border-[#b7eb8f] px-4 py-2 rounded-t text-sm font-medium text-[#52c41a]">状态字段</div>
      <div className="border border-t-0 border-[#e8e8e8] text-sm">
        <div className="flex border-b border-[#e8e8e8] min-h-[40px]">
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否启用</div>
          <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center gap-4 px-3"><Radio checked={formData.enabled === '1'} onChange={() => setFormData({ ...formData, enabled: '1' })}>启用</Radio><Radio checked={formData.enabled === '0'} onChange={() => setFormData({ ...formData, enabled: '0' })}>停用</Radio></div>
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">是否停产</div>
          <div className="w-[37.5%] p-2 flex items-center gap-4 px-3"><Radio checked={formData.isStop === '1'} onChange={() => setFormData({ ...formData, isStop: '1' })}>是</Radio><Radio checked={formData.isStop === '0'} onChange={() => setFormData({ ...formData, isStop: '0' })}>否</Radio></div>
        </div>
        <div className="flex min-h-[40px]">
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">启用日期</div>
          <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center"><DatePicker value={formData.enableDate ? dayjs(formData.enableDate) : null} onChange={(_, dateString) => setFormData({ ...formData, enableDate: dateString })} placeholder="请选择启用日期" className="w-full" /></div>
          <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">停用日期</div>
          <div className="w-[37.5%] p-2 flex items-center"><DatePicker value={formData.stopDate ? dayjs(formData.stopDate) : null} onChange={(_, dateString) => setFormData({ ...formData, stopDate: dateString })} placeholder="请选择停用日期" className="w-full" /></div>
        </div>
      </div>
    </div>

    <div className="mb-4">
      <div className="bg-[#fff7e6] border border-[#ffd591] px-4 py-2 rounded-t text-sm font-medium text-[#fa8c16]">业务规则字段</div>
      <div className="border border-t-0 border-[#e8e8e8] text-sm">
        {(() => {
          const baseFields = [
            { key: 'formalCanApply', label: '正式员工可申请', content: <div className="flex items-center gap-2 px-3"><Radio checked={formData.formalCanApply === '是'} onChange={() => setFormData({ ...formData, formalCanApply: '是' })}>是</Radio><Radio checked={formData.formalCanApply === '否'} onChange={() => setFormData({ ...formData, formalCanApply: '否' })}>否</Radio><Radio checked={formData.formalCanApply === '临时可申请'} onChange={() => setFormData({ ...formData, formalCanApply: '临时可申请' })}>临时可申请</Radio></div> },
            { key: 'internCanApply', label: '实习生可申请', visible: formData.formalCanApply !== '临时可申请', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.internCanApply === '是'} onChange={() => setFormData({ ...formData, internCanApply: '是' })}>是</Radio><Radio checked={formData.internCanApply === '否'} onChange={() => setFormData({ ...formData, internCanApply: '否' })}>否</Radio></div> },
            { key: 'tempDateRange', label: '生效时间', visible: formData.formalCanApply === '临时可申请', content: <DatePicker.RangePicker value={formData.tempEffStartDate && formData.tempEffEndDate ? [dayjs(formData.tempEffStartDate), dayjs(formData.tempEffEndDate)] : null} onChange={(_, dateStrings) => setFormData({ ...formData, tempEffStartDate: dateStrings[0], tempEffEndDate: dateStrings[1] })} placeholder={['开始日期', '结束日期']} className="w-full" /> },
            { key: 'tempDept', label: '可申请部门', visible: formData.formalCanApply === '临时可申请', content: <div className="flex items-center relative w-full cursor-pointer" onClick={() => setIsDeptModalOpen(true)}><Input value={formData.tempDept || ''} placeholder="请选择部门" readOnly className="pointer-events-none bg-white w-full" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" /></div> },
            { key: 'tempEmployee', label: '可申请员工', visible: formData.formalCanApply === '临时可申请', content: <div className="flex items-center relative w-full cursor-pointer" onClick={() => setIsEmpModalOpen(true)}><Input value={formData.tempEmployee || ''} placeholder="请选择员工" readOnly className="pointer-events-none bg-white w-full" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" /></div> },
          ];
          const conditionFields = [];
          if (formData.mainCatCode === '1') {
            conditionFields.push(
              { key: 'misIdentifyOnReturn', label: '退库是否需要MIS鉴定', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.misIdentifyOnReturn === '1'} onChange={() => setFormData({ ...formData, misIdentifyOnReturn: '1' })}>是</Radio><Radio checked={formData.misIdentifyOnReturn === '0'} onChange={() => setFormData({ ...formData, misIdentifyOnReturn: '0' })}>否</Radio></div> },
              { key: 'allowReplace', label: '是否允许更换', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.allowReplace === '1'} onChange={() => setFormData({ ...formData, allowReplace: '1' })}>是</Radio><Radio checked={formData.allowReplace === '0'} onChange={() => setFormData({ ...formData, allowReplace: '0' })}>否</Radio></div> },
              { key: 'allowTransfer', label: '是否允许转移', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.allowTransfer === '1'} onChange={() => setFormData({ ...formData, allowTransfer: '1' })}>是</Radio><Radio checked={formData.allowTransfer === '0'} onChange={() => setFormData({ ...formData, allowTransfer: '0' })}>否</Radio></div> },
            );
          } else if (formData.mainCatCode === '2' || formData.mainCatCode === '3') {
            conditionFields.push(
              { key: 'misAudit', label: '耗材申请是否需要MIS审核', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.misAudit === '1'} onChange={() => setFormData({ ...formData, misAudit: '1' })}>是</Radio><Radio checked={formData.misAudit === '0'} onChange={() => setFormData({ ...formData, misAudit: '0' })}>否</Radio></div> },
              { key: 'hasMainAsset', label: '是否关联主资产', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.hasMainAsset === '1'} onChange={() => setFormData({ ...formData, hasMainAsset: '1' })}>是</Radio><Radio checked={formData.hasMainAsset === '0'} onChange={() => setFormData({ ...formData, hasMainAsset: '0' })}>否</Radio></div> },
            );
            if (formData.hasMainAsset === '1') conditionFields.push({ key: 'mainAssetSubCat', label: '主资产物料小类', content: <div className="flex items-center relative w-full"><Input value={formData.mainAssetSubCat || ''} onChange={(event) => setFormData({ ...formData, mainAssetSubCat: event.target.value })} placeholder="请选择主资产物料小类" className="w-full" /><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff]" /></div> });
          }
          const tailFields = [
            { key: 'needCheck', label: '是否需要盘点', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.needCheck === '是'} onChange={() => setFormData({ ...formData, needCheck: '是' })}>是</Radio><Radio checked={formData.needCheck === '否'} onChange={() => setFormData({ ...formData, needCheck: '否' })}>否</Radio></div> },
            { key: 'allowReturn', label: '是否允许退库', content: <div className="flex items-center gap-4 px-3"><Radio checked={formData.allowReturn === '1'} onChange={() => setFormData({ ...formData, allowReturn: '1' })}>是</Radio><Radio checked={formData.allowReturn === '0'} onChange={() => setFormData({ ...formData, allowReturn: '0' })}>否</Radio></div> },
          ];
          const fields = [...baseFields.filter((field) => field.visible !== false), ...conditionFields, ...tailFields];
          const rows = [];
          for (let index = 0; index < fields.length; index += 2) rows.push([fields[index], fields[index + 1] || null]);
          return rows.map((row, rowIndex) => (
            <div key={row[0].key} className={`flex min-h-[40px]${rowIndex < rows.length - 1 ? ' border-b border-[#e8e8e8]' : ''}`}>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">{row[0].label}</div>
              <div className="w-[37.5%] p-2 border-r border-[#e8e8e8] flex items-center">{row[0].content}</div>
              <div className="w-[12.5%] bg-[#fafafa] p-2 border-r border-[#e8e8e8] flex items-center justify-end font-medium text-gray-700 text-right">{row[1]?.label || ''}</div>
              <div className="w-[37.5%] p-2 flex items-center">{row[1]?.content || null}</div>
            </div>
          ));
        })()}
      </div>
    </div>

    <div className="flex justify-center gap-3 mt-6">
      <Button type="primary" onClick={onClose} className="px-6">保存</Button>
      <Button onClick={onClose} className="px-6">返回</Button>
    </div>
  </Modal>
);

export default MaterialComprehensiveFormModal;
