import React, { useMemo, useState } from "react";
import {
  Download,
  Plus,
  Trash2,
  Save,
  Send,
  LogOut,
  Search,
} from "lucide-react";
import { Select } from "antd";
import SelectModal from "../components/SelectModal";
import "./ScrapApplicationEdit.css";

const emptyRow = (id) => ({
  id,
  tagNo: "",
  serialNo: "",
  quantity: 1,
  category: "",
  subCategory: "",
  description: "",
  status: "",
  originalValue: "",
  netValue: "",
  startDate: "",
  scrapReason: "",
});

const mockFinancialCompanies = [
  { id: '1', code: 'CW-001', name: '新媒体财务公司', taxNo: '91110108MA...' },
  { id: '2', code: 'CW-002', name: '科技财务公司', taxNo: '91110105MA...' },
  { id: '3', code: 'CW-003', name: '文化财务公司', taxNo: '91110115MA...' },
];

function SectionTitle({ children }) {
  return (
    <div className="pageScrap-sectionTitle">
      <span className="pageScrap-sectionTitleLine" />
      <span>{children}</span>
    </div>
  );
}

export default function ScrapApplicationEdit({ embedded = false, onBack }) {
  const [activeTab, setActiveTab] = useState("assets");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [assetCategory, setAssetCategory] = useState(undefined);
  const [assetLocation, setAssetLocation] = useState(undefined);
  const [errors, setErrors] = useState({});

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(window.__scrapTimer);
    window.__scrapTimer = window.setTimeout(() => setMessage(""), 1800);
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(Date.now())]);
    setActiveTab("assets");
  };

  const deleteRows = () => {
    if (!selected.length) {
      showMessage("请先选择要删除的行");
      return;
    }
    setRows((prev) => prev.filter((item) => !selected.includes(item.id)));
    setSelected([]);
    showMessage("已删除所选行");
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : rows.map((row) => row.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateRow = (id, key, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  };

  const columns = useMemo(
    () => [
      ["tagNo", "资产标签号", 180],
      ["serialNo", "资产序列号", 170],
      ["quantity", "数量", 80],
      ["category", "资产大类", 130],
      ["subCategory", "资产小类", 130],
      ["description", "资产说明", 180],
      ["status", "资产状态", 130],
      ["originalValue", "原值", 120],
      ["netValue", "净值", 120],
      ["startDate", "启用日期", 145],
      ["scrapReason", "报废原因", 180],
    ],
    []
  );

  const handleExit = () => {
    if (embedded && onBack) {
      onBack();
      return;
    }
    window.history.back();
  };

  const validateRequired = () => {
    const newErrors = {};
    if (!company) newErrors.company = true;
    if (!assetCategory) newErrors.assetCategory = true;
    if (!assetLocation) newErrors.assetLocation = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateRequired()) {
      showMessage("请填写所有必填字段");
      return;
    }
    showMessage("保存成功");
  };

  const handleSubmit = () => {
    if (!validateRequired()) {
      showMessage("请填写所有必填字段");
      return;
    }
    showMessage("提交成功");
  };

  return (
    <div
      className="pageScrap-shell"
      style={embedded ? { minHeight: 'auto', paddingBottom: 0, background: 'transparent' } : undefined}
    >
      <header
        className="pageScrap-topbar"
        style={embedded ? { height: 'auto', padding: '0 0 16px', background: 'transparent', borderBottom: 0 } : undefined}
      >
        <h1 style={embedded ? { fontSize: 22 } : undefined}>报废申请单</h1>
      </header>

      <main
        className="pageScrap-content"
        style={embedded ? { width: '100%', margin: 0 } : undefined}
      >
        <section className="pageScrap-card pageScrap-basicCard">
          <SectionTitle>基本信息</SectionTitle>

          <div className="pageScrap-infoGrid">
            <div className="pageScrap-infoItem">
              <div className="pageScrap-label">单据编号</div>
              <div className="pageScrap-muted pageScrap-italic">保存/提交后生成</div>
            </div>
            <div className="pageScrap-infoItem">
              <div className="pageScrap-label">单据状态</div>
              <div className="pageScrap-value">草稿</div>
            </div>
            <div className="pageScrap-infoItem">
              <div className="pageScrap-label">资产责任人</div>
              <div className="pageScrap-value">陈才慧</div>
            </div>
          </div>

          <div className="pageScrap-requiredFields">
            <div className="pageScrap-fieldRow">
              <div className="pageScrap-fieldItem">
                <label className="pageScrap-requiredLabel">
                  公司 <span className="text-red-500">*</span>
                </label>
                <div className={"pageScrap-selectTrigger" + (errors.company ? " pageScrap-errorBorder" : "")} onClick={() => setCompanyModalOpen(true)}>
                  <input
                    type="text"
                    className="pageScrap-cellInput pageScrap-pointerNone"
                    value={company}
                    readOnly
                    placeholder="请选择财务公司"
                  />
                  <Search className="pageScrap-selectIcon" size={16} />
                </div>
                {errors.company && <span className="pageScrap-fieldError">请选择公司</span>}
              </div>

              <div className="pageScrap-fieldItem">
                <label className="pageScrap-requiredLabel">
                  资产大类 <span className="text-red-500">*</span>
                </label>
                <Select
                  className="pageScrap-antdSelect"
                  status={errors.assetCategory ? "error" : undefined}
                  placeholder="请选择"
                  value={assetCategory}
                  onChange={(val) => { setAssetCategory(val); setErrors(prev => ({...prev, assetCategory: false})); }}
                  options={[
                    { value: '服务器', label: '服务器' },
                    { value: '网络设备', label: '网络设备' },
                  ]}
                  style={{ width: '100%' }}
                />
                {errors.assetCategory && <span className="pageScrap-fieldError">请选择资产大类</span>}
              </div>

              <div className="pageScrap-fieldItem">
                <label className="pageScrap-requiredLabel">
                  资产所在地 <span className="text-red-500">*</span>
                </label>
                <Select
                  className="pageScrap-antdSelect"
                  status={errors.assetLocation ? "error" : undefined}
                  placeholder="请选择"
                  value={assetLocation}
                  onChange={(val) => { setAssetLocation(val); setErrors(prev => ({...prev, assetLocation: false})); }}
                  options={[
                    { value: '北京', label: '北京' },
                    { value: '非北京', label: '非北京' },
                  ]}
                  style={{ width: '100%' }}
                />
                {errors.assetLocation && <span className="pageScrap-fieldError">请选择资产所在地</span>}
              </div>
            </div>
          </div>

          <SelectModal
            open={companyModalOpen}
            title="选择财务公司"
            dataSource={mockFinancialCompanies}
            columns={[
              { title: '编码', dataIndex: 'code' },
              { title: '名称', dataIndex: 'name' },
              { title: '税号', dataIndex: 'taxNo' },
            ]}
            searchFields={[
              { label: '编码', name: 'code', dataIndex: 'code' },
              { label: '名称', name: 'name', dataIndex: 'name' },
            ]}
            onCancel={() => setCompanyModalOpen(false)}
            onConfirm={(record) => {
              setCompany(record.name);
              setCompanyId(record.id);
              setErrors(prev => ({...prev, company: false}));
            }}
          />

          <div className="pageScrap-singleRow">
            <div className="pageScrap-infoItem">
              <div className="pageScrap-label">申请日期</div>
              <div className="pageScrap-value">2026-04-15</div>
            </div>
          </div>

          <div className="pageScrap-formBlock">
            <label className="pageScrap-label" htmlFor="scrapDesc">报废说明</label>
            <textarea
              id="scrapDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述报废原因..."
            />
          </div>
        </section>

        <section className="pageScrap-card pageScrap-detailCard">
          <SectionTitle>报废资产明细</SectionTitle>

          <div className="pageScrap-detailToolbar">
            <div className="pageScrap-tabs">
              <button
                className={"pageScrap-tab" + (activeTab === "assets" ? " pageScrap-active" : "")}
                onClick={() => setActiveTab("assets")}
              >
                报废资产
              </button>
              <button
                className={"pageScrap-tab" + (activeTab === "parts" ? " pageScrap-active" : "")}
                onClick={() => setActiveTab("parts")}
              >
                关联配件
              </button>
            </div>

            <div className="pageScrap-toolbarActions">
              <button className="pageScrap-textBtn" onClick={() => showMessage("Excel 导入功能已预留")}>
                <Download size={18} strokeWidth={1.8} />
                导入Excel
              </button>
              <button className="pageScrap-textBtn" onClick={addRow}>
                <Plus size={18} strokeWidth={1.8} />
                增行
              </button>
              <button className="pageScrap-textBtn" onClick={deleteRows}>
                <Trash2 size={18} strokeWidth={1.8} />
                删行
              </button>
            </div>
          </div>

          <div className="pageScrap-tableWrap">
            {activeTab === "assets" ? (
              <table className="pageScrap-assetTable">
                <thead>
                  <tr>
                    <th className="pageScrap-checkCol">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="全选"
                      />
                    </th>
                    <th className="pageScrap-indexCol">#</th>
                    {columns.map(([key, label, width]) => (
                      <th key={key} style={{ minWidth: width }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={13}>
                        <div className="pageScrap-emptyState">
                          暂无报废资产，请点击右上角"增行"添加
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="pageScrap-checkCol">
                          <input
                            type="checkbox"
                            checked={selected.includes(row.id)}
                            onChange={() => toggleOne(row.id)}
                            aria-label={"选择第 " + (index + 1) + " 行"}
                          />
                        </td>
                        <td className="pageScrap-indexCol">{index + 1}</td>
                        {columns.map(([key]) => (
                          <td key={key}>
                            <input
                              className="pageScrap-cellInput"
                              type={
                                key === "quantity"
                                  ? "number"
                                  : key === "startDate"
                                  ? "date"
                                  : "text"
                              }
                              value={row[key]}
                              onChange={(e) => updateRow(row.id, key, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="pageScrap-partsEmpty">暂无关联配件</div>
            )}
          </div>
        </section>
      </main>

      <footer
        className="pageScrap-footerBar"
        style={embedded ? { position: 'sticky', left: 'auto', right: 'auto', bottom: 0, marginTop: 16 } : undefined}
      >
        <button className="pageScrap-bottomBtn pageScrap-saveBtn" onClick={handleSave}>
          <Save size={19} />
          保存
        </button>
        <button className="pageScrap-bottomBtn pageScrap-submitBtn" onClick={handleSubmit}>
          <Send size={19} />
          提交
        </button>
        <button className="pageScrap-bottomBtn pageScrap-exitBtn" onClick={handleExit}>
          <LogOut size={19} />
          退出
        </button>
      </footer>

      {message && <div className="pageScrap-toast">{message}</div>}
    </div>
  );
}
