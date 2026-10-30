import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Edit, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';
import { Button, Input, InputNumber, Select, message } from 'antd';
import Table from '../../../../components/tableAlignment/AlignedTable';
import QueryBar, { QueryItem } from '../../../../components/QueryBar';
import MaterialBatchActionModal from './MaterialBatchActionModal';
import MaterialComprehensiveFormModal from './MaterialComprehensiveFormModal';
import MaterialComprehensiveSelectModals from './MaterialComprehensiveSelectModals';
import { createMaterialComprehensiveColumns, initialMaterialComprehensiveForm, materialComprehensiveResetFields } from './materialComprehensiveConfig';
import SelectModal from '../../../../components/SelectModal';
import TableDensityControl from '../../../../components/TableDensityControl';
import TableEmptyState from '../../../../components/TableEmptyState';
import { queryMaterialCombinations, hasMaterialFilters, materialQueryLookups } from '../../../../services/materialComprehensiveService';
import './materialComprehensive.css';

const MaterialComprehensiveView = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [rowHeight, setRowHeight] = useState(40);
  const [lookupKey, setLookupKey] = useState(null);
  const lookup = materialQueryLookups[lookupKey];
  const [messageApi, contextHolder] = message.useMessage();
  const data = queryMaterialCombinations(appliedFilters);
  const updateFilter = (key, value) => setFilters(previous => ({ ...previous, [key]: value }));
  const applyQuery = (reset = false) => {
    if (!reset && filters.priceFrom != null && filters.priceTo != null && filters.priceFrom > filters.priceTo) {
      messageApi.warning('参考价格起始值不能大于结束值');
      return;
    }
    if (reset) setFilters({});
    setAppliedFilters(reset ? {} : { ...filters });
    setSelectedRowKeys([]);
    setPagination(previous => ({ ...previous, current: 1 }));
  };
  const unavailable = action => messageApi.info(action + '暂未开放，未修改任何数据');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isMaterialCategoryModalOpen, setIsMaterialCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);
  const [formData, setFormData] = useState({ ...initialMaterialComprehensiveForm });

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ ...formData, ...materialComprehensiveResetFields });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      ...formData,
      ...record,
      mainCatDesc: record.mainCatDesc || record.catDesc || '',
      modelDesc: record.modelDesc || record.model || '',
      modelCode: record.modelCode || record.model || '',
    });
    setIsModalOpen(true);
  };

  const columns = createMaterialComprehensiveColumns(handleEdit);

  return (
    <div className="material-comprehensive flex flex-col gap-4" style={{ '--material-row-height': rowHeight + 'px' }}>
      {contextHolder}
      <div data-prototype-anchor="material-query-bar">
        <QueryBar buttons={
          <>
            <Button type="link" onClick={() => setIsQueryExpanded(!isQueryExpanded)} aria-expanded={isQueryExpanded} icon={isQueryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}>
              {isQueryExpanded ? '收起更多' : '展开更多'}
            </Button>
            <Button icon={<RefreshCcw size={14} />} onClick={() => applyQuery(true)}>重置</Button>
            <Button type="primary" icon={<Search size={14} />} onClick={() => applyQuery()}>查询</Button>
          </>
        }>
          <QueryItem label="维度组合编码"><Input aria-label="维度组合编码" placeholder="请输入编码" value={filters.code || ''} onChange={event => updateFilter('code', event.target.value)} onPressEnter={() => applyQuery()} /></QueryItem>
          <QueryItem label="维度组合描述"><Input aria-label="维度组合描述" placeholder="请输入描述" value={filters.desc || ''} onChange={event => updateFilter('desc', event.target.value)} onPressEnter={() => applyQuery()} /></QueryItem>
          <QueryItem label="物料总类"><Select aria-label="物料总类" placeholder="请选择" allowClear value={filters.mainCatCode} onChange={value => updateFilter('mainCatCode', value)} options={[{ label: '资产', value: '1' }, { label: '耗材', value: '2' }, { label: '低值耐用品', value: '3' }]} /></QueryItem>
          {Object.entries(materialQueryLookups).map(([key, item]) => (
            <QueryItem key={key} label={item.label}>
              <Input aria-label={item.label} placeholder={'选择' + item.label} value={filters[key] || ''} readOnly onClick={() => setLookupKey(key)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setLookupKey(key); } }} suffix={<Search size={14} />} style={{ cursor: 'pointer' }} />
            </QueryItem>
          ))}
          <QueryItem label="单位"><Select aria-label="单位" placeholder="请选择" allowClear value={filters.unit} onChange={value => updateFilter('unit', value)} options={['台', '块', '个', '套', '件'].map(value => ({ label: value, value }))} /></QueryItem>
          {isQueryExpanded && [
            ['enabled', '是否启用', [{ label: '启用', value: '1' }, { label: '停用', value: '0' }]],
            ['formalCanApply', '正式员工可申请', [{ label: '是', value: '是' }, { label: '否', value: '否' }]],
            ['misAudit', '耗材申请是否需要MIS审核', [{ label: '是', value: '1' }, { label: '否', value: '0' }]],
            ['misIdentifyOnReturn', '退库是否需要MIS鉴定', [{ label: '是', value: '1' }, { label: '否', value: '0' }]],
            ['hasMainAsset', '是否关联主资产', [{ label: '是', value: '1' }, { label: '否', value: '0' }]],
            ['needCheck', '是否需要盘点', [{ label: '是', value: '是' }, { label: '否', value: '否' }]],
          ].map(([key, label, options]) => <QueryItem key={key} label={label}><Select aria-label={label} placeholder="请选择" allowClear value={filters[key]} onChange={value => updateFilter(key, value)} options={options} /></QueryItem>)}
          {isQueryExpanded && <QueryItem label="参考价格"><div className="flex items-center w-full gap-2"><InputNumber aria-label="参考价格从" placeholder="从" value={filters.priceFrom} onChange={value => updateFilter('priceFrom', value)} /><span className="text-gray-400">至</span><InputNumber aria-label="参考价格至" placeholder="至" value={filters.priceTo} onChange={value => updateFilter('priceTo', value)} /></div></QueryItem>}
        </QueryBar>
      </div>

      <div className="material-results">
        <div data-prototype-anchor="material-table-toolbar" className="material-toolbar">
          <TableDensityControl value={rowHeight} onChange={setRowHeight} />
          <Button icon={<Edit size={14} />} onClick={() => setIsBatchModalOpen(true)}>批量修改</Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>新增</Button>
        </div>
        {selectedRowKeys.length > 0 && (
          <div className="material-batch-bar" role="region" aria-label="所选物料批量操作">
            <strong>已选本页 {selectedRowKeys.length} 条</strong>
            <Button icon={<CheckCircle size={14} />} onClick={() => unavailable('批量启用')}>启用</Button>
            <Button icon={<XCircle size={14} />} onClick={() => unavailable('批量停用')}>停用</Button>
            <Button type="link" onClick={() => setSelectedRowKeys([])}>取消选择</Button>
          </div>
        )}
        <div data-prototype-anchor="material-table" className="overflow-x-auto">
          <Table rowKey="id" rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }} columns={columns} dataSource={data} size="middle" scroll={{ x: 3100 }} locale={{ emptyText: <TableEmptyState filtered={hasMaterialFilters(appliedFilters)} /> }} pagination={{ ...pagination, showSizeChanger: true, showTotal: total => '共 ' + total + ' 条' }} onChange={next => { setPagination({ current: next.current, pageSize: next.pageSize }); setSelectedRowKeys([]); }} />
        </div>
      </div>
      {lookup && <SelectModal
        open title={'选择' + lookup.label} dataSource={lookup.rows}
        columns={[{ title: '编码', dataIndex: lookup.codeField }, { title: '描述', dataIndex: lookup.valueField }]}
        searchFields={[{ label: '编码', name: lookup.codeField, dataIndex: lookup.codeField }, { label: '描述', name: lookup.valueField, dataIndex: lookup.valueField }]}
        onCancel={() => setLookupKey(null)}
        onConfirm={record => { updateFilter(lookupKey, record[lookup.valueField]); setLookupKey(null); }}
      />}

      <MaterialComprehensiveFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => unavailable('物料保存')}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        setIsMaterialCategoryModalOpen={setIsMaterialCategoryModalOpen}
        setIsSubCategoryModalOpen={setIsSubCategoryModalOpen}
        setIsBrandModalOpen={setIsBrandModalOpen}
        setIsModelModalOpen={setIsModelModalOpen}
        setIsConfigModalOpen={setIsConfigModalOpen}
        setIsDeptModalOpen={setIsDeptModalOpen}
        setIsEmpModalOpen={setIsEmpModalOpen}
      />
      <MaterialBatchActionModal open={isBatchModalOpen} onCancel={() => setIsBatchModalOpen(false)} onAction={() => unavailable('批量修改')} />
      <MaterialComprehensiveSelectModals
        formData={formData}
        setFormData={setFormData}
        isMaterialCategoryModalOpen={isMaterialCategoryModalOpen}
        setIsMaterialCategoryModalOpen={setIsMaterialCategoryModalOpen}
        isBrandModalOpen={isBrandModalOpen}
        setIsBrandModalOpen={setIsBrandModalOpen}
        isModelModalOpen={isModelModalOpen}
        setIsModelModalOpen={setIsModelModalOpen}
        isConfigModalOpen={isConfigModalOpen}
        setIsConfigModalOpen={setIsConfigModalOpen}
        isDeptModalOpen={isDeptModalOpen}
        setIsDeptModalOpen={setIsDeptModalOpen}
        isEmpModalOpen={isEmpModalOpen}
        setIsEmpModalOpen={setIsEmpModalOpen}
        isSubCategoryModalOpen={isSubCategoryModalOpen}
        setIsSubCategoryModalOpen={setIsSubCategoryModalOpen}
      />
    </div>
  );
};

export default MaterialComprehensiveView;
