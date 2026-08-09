import React from 'react';
import SelectModal from '../../../../components/SelectModal';
import {
  mockMaterialCategories,
  mockBrands,
  mockModels,
  mockConfigs,
  mockDepartments,
  mockSubCategoryData,
  mockEmployeeMappingData,
} from '../../../../mock/businessRulesMock';

const MaterialComprehensiveSelectModals = ({
  formData,
  setFormData,
  isMaterialCategoryModalOpen,
  setIsMaterialCategoryModalOpen,
  isBrandModalOpen,
  setIsBrandModalOpen,
  isModelModalOpen,
  setIsModelModalOpen,
  isConfigModalOpen,
  setIsConfigModalOpen,
  isDeptModalOpen,
  setIsDeptModalOpen,
  isEmpModalOpen,
  setIsEmpModalOpen,
  isSubCategoryModalOpen,
  setIsSubCategoryModalOpen,
}) => (
  <>
    <SelectModal
      open={isMaterialCategoryModalOpen}
      title="选择物料大类"
      dataSource={mockMaterialCategories}
      columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
      searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
      onCancel={() => setIsMaterialCategoryModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, mainCatCode: record.code, mainCatDesc: record.desc });
        setIsMaterialCategoryModalOpen(false);
      }}
    />
    <SelectModal
      open={isBrandModalOpen}
      title="选择品牌"
      dataSource={mockBrands}
      columns={[{ title: '品牌编码', dataIndex: 'code' }, { title: '品牌描述', dataIndex: 'desc' }]}
      searchFields={[{ label: '品牌编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '品牌描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
      onCancel={() => setIsBrandModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, brand: record.desc });
        setIsBrandModalOpen(false);
        setTimeout(() => setIsModelModalOpen(true), 100);
      }}
    />
    <SelectModal
      open={isModelModalOpen}
      title="选择型号"
      dataSource={mockModels.filter((item) => !formData.brand || item.brand === formData.brand)}
      columns={[{ title: '品牌', dataIndex: 'brand' }, { title: '型号编码', dataIndex: 'code' }, { title: '型号描述', dataIndex: 'desc' }]}
      searchFields={[{ label: '品牌', name: 'brand', dataIndex: 'brand' }, { label: '型号编码', name: 'code', dataIndex: 'code' }, { label: '型号描述', name: 'desc', dataIndex: 'desc' }]}
      onCancel={() => setIsModelModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, modelCode: record.code, modelDesc: record.desc });
        setIsModelModalOpen(false);
      }}
    />
    <SelectModal
      open={isSubCategoryModalOpen}
      title="选择物料小类"
      dataSource={mockSubCategoryData}
      columns={[{ title: '小类编码', dataIndex: 'code' }, { title: '小类描述', dataIndex: 'desc' }]}
      searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '描述', name: 'desc', dataIndex: 'desc', placeholder: '请输入描述' }]}
      onCancel={() => setIsSubCategoryModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, subCatCode: record.code, subCatDesc: record.desc });
        setIsSubCategoryModalOpen(false);
      }}
    />
    <SelectModal
      open={isDeptModalOpen}
      title="选择部门"
      dataSource={mockDepartments}
      columns={[{ title: '部门编码', dataIndex: 'code' }, { title: '部门名称', dataIndex: 'desc' }]}
      searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '名称', name: 'desc', dataIndex: 'desc', placeholder: '请输入名称' }]}
      onCancel={() => setIsDeptModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, tempDept: record.desc });
        setIsDeptModalOpen(false);
      }}
    />
    <SelectModal
      open={isEmpModalOpen}
      title="选择员工"
      dataSource={mockEmployeeMappingData}
      columns={[{ title: '员工编码', dataIndex: 'code' }, { title: '员工姓名', dataIndex: 'desc' }]}
      searchFields={[{ label: '编码', name: 'code', dataIndex: 'code', placeholder: '请输入编码' }, { label: '姓名', name: 'desc', dataIndex: 'desc', placeholder: '请输入姓名' }]}
      onCancel={() => setIsEmpModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, tempEmployee: record.desc });
        setIsEmpModalOpen(false);
      }}
    />
    <SelectModal
      open={isConfigModalOpen}
      title="选择配置"
      dataSource={mockConfigs.filter((item) => (!formData.brand || item.brand === formData.brand) && (!formData.modelCode || item.model === formData.modelCode))}
      columns={[{ title: '品牌', dataIndex: 'brand' }, { title: '型号', dataIndex: 'model' }, { title: '配置编码', dataIndex: 'code' }, { title: '配置描述', dataIndex: 'desc' }]}
      searchFields={[{ label: '品牌', name: 'brand', dataIndex: 'brand' }, { label: '型号', name: 'model', dataIndex: 'model' }, { label: '配置编码', name: 'code', dataIndex: 'code' }, { label: '配置描述', name: 'desc', dataIndex: 'desc' }]}
      onCancel={() => setIsConfigModalOpen(false)}
      onConfirm={(record) => {
        setFormData({ ...formData, configDesc: record.desc });
        setIsConfigModalOpen(false);
      }}
    />
  </>
);

export default MaterialComprehensiveSelectModals;
