import React, { useMemo, useState } from 'react';
import { Button, Card, Input, Result, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import { RefreshCcw, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import {
  CURRENT_WAREHOUSE_OPERATOR,
  WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY,
  WAREHOUSE_WORKBENCH_DOCUMENT_TYPES,
  WAREHOUSE_WORKBENCH_TASKS,
  WAREHOUSE_WORKBENCH_USERS,
  buildWarehouseEmployeePageContext,
} from '../../mock/warehouseWorkbenchMock';

const EMPTY_FILTERS = {
  assetTag: '',
  employeeCard: '',
  employeeName: '',
  assetName: '',
  documentNo: '',
  documentType: '',
};

function PageTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-1.5 rounded bg-[#1677ff]" />
      <Typography.Title level={3} className="mb-0">{children}</Typography.Title>
    </div>
  );
}

function includesText(value, query) {
  return String(value || '').toLowerCase().includes(String(query || '').trim().toLowerCase());
}

function buildEmployeeWindowHtml(storageKey) {
  const safeStorageKey = JSON.stringify(storageKey);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>员工页面</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#f3f5f8;color:#1f2937;font-family:Arial,"Microsoft YaHei",sans-serif}
  .page{max-width:1080px;margin:0 auto;padding:28px}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  h1{margin:0;font-size:24px}
  .status{padding:6px 12px;border-radius:999px;background:#e6f4ff;color:#1677ff;font-size:14px}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:16px}
  .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 24px}
  .label{color:#6b7280;font-size:13px;margin-bottom:4px}
  .value{font-size:15px;word-break:break-all}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{border:1px solid #e5e7eb;padding:9px 10px;text-align:left;vertical-align:middle}
  th{background:#fafafa}
  .empty{padding:90px 20px;text-align:center;color:#8c8c8c}
  .responsibility{line-height:1.8;color:#4b5563}
  .hint{font-size:12px;color:#9ca3af;margin-top:12px;text-align:right}
</style>
</head>
<body>
<div id="app"></div>
<script>
(function(){
  var KEY=${safeStorageKey};
  function esc(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function render(){
    var root=document.getElementById('app');
    var raw=localStorage.getItem(KEY);
    if(!raw){
      root.innerHTML='<div class="page"><div class="header"><h1>员工页面</h1><span class="status">无办理信息</span></div><div class="card empty">请等待库管员开始办理业务</div><div class="hint">页面每 3 秒自动刷新</div></div>';
      return;
    }
    var data;
    try { data=JSON.parse(raw); } catch(e){ localStorage.removeItem(KEY); render(); return; }
    var employee=data.employee||{};
    var doc=data.document||{};
    var materials=Array.isArray(data.materials)?data.materials:[];
    var rows=materials.map(function(item,index){
      var isConsumable=String(item.materialGroup||'').indexOf('耗材')>=0 || String(item.materialGroup||'').indexOf('低值')>=0;
      return '<tr>'
        +'<td>'+esc(index+1)+'</td>'
        +'<td>'+esc(item.materialSubClass||'-')+'</td>'
        +'<td>'+esc(isConsumable?(item.materialCode||'-'):(item.assetTag||'-'))+'</td>'
        +'<td>'+esc(item.quantity||0)+'</td>'
        +'<td>'+esc(item.unit||'-')+'</td>'
        +'<td>'+esc(item.description||'-')+'</td>'
        +'</tr>';
    }).join('');
    root.innerHTML='<div class="page">'
      +'<div class="header"><h1>员工页面</h1><span class="status">'+esc(data.status||'办理中')+'</span></div>'
      +'<div class="card"><div class="grid">'
      +'<div><div class="label">员工编号</div><div class="value">'+esc(employee.id||'-')+'</div></div>'
      +'<div><div class="label">员工姓名</div><div class="value">'+esc(employee.name||'-')+'</div></div>'
      +'<div><div class="label">组织</div><div class="value">'+esc(employee.organization||'-')+'</div></div>'
      +'<div><div class="label">单据编号</div><div class="value">'+esc(doc.no||'-')+'</div></div>'
      +'<div><div class="label">业务类型</div><div class="value">'+esc(doc.type||'-')+'</div></div>'
      +'<div><div class="label">当前环节</div><div class="value">'+esc(doc.approvalNode||'-')+'</div></div>'
      +'</div></div>'
      +'<div class="card"><table><thead><tr><th>行号</th><th>物资小类</th><th>标签号/物料编码</th><th>数量</th><th>单位</th><th>说明</th></tr></thead><tbody>'
      +(rows||'<tr><td colspan="6" class="empty">暂无物资明细</td></tr>')
      +'</tbody></table></div>'
      +(data.responsibility?'<div class="card"><div class="label">保管职责</div><div class="responsibility">'+esc(data.responsibility)+'</div></div>':'')
      +'<div class="hint">页面每 3 秒自动刷新</div>'
      +'</div>';
  }
  render();
  setInterval(render,3000);
  window.addEventListener('storage',function(e){ if(e.key===KEY) render(); });
})();
</script>
</body>
</html>`;
}

export default function WarehouseWorkbenchPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState(() => (
    WAREHOUSE_WORKBENCH_TASKS
      .filter((task) => (
        task.assignedTo === CURRENT_WAREHOUSE_OPERATOR
        && task.status === '待处理'
        && task.documentType !== '员工离职'
      ))
      .sort((a, b) => String(b.applicationTime).localeCompare(String(a.applicationTime)))
  ));
  const [hasQueried, setHasQueried] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const canUseWorkbench = WAREHOUSE_WORKBENCH_USERS.includes(CURRENT_WAREHOUSE_OPERATOR);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const availableTasks = useMemo(() => (
    WAREHOUSE_WORKBENCH_TASKS.filter((task) => (
      task.assignedTo === CURRENT_WAREHOUSE_OPERATOR
      && task.status === '待处理'
      && task.documentType !== '员工离职'
    ))
  ), []);

  const writeEmployeePageContext = (task) => {
    window.localStorage.setItem(
      WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY,
      JSON.stringify(buildWarehouseEmployeePageContext(task)),
    );
  };

  const handleTask = (task) => {
    writeEmployeePageContext(task);
    navigate(`/yewurules?workspace=${encodeURIComponent(task.workspace)}`, {
      state: {
        workspace: task.workspace,
        warehouseWorkbenchTask: {
          applicationNo: task.applicationNo,
          documentType: task.documentType,
          approvalNode: task.approvalNode,
        },
      },
    });
  };

  const runQuery = (filters = draftFilters) => {
    const filtered = availableTasks
      .filter((task) => {
        if (filters.assetTag) {
          const matched = (task.materials || []).some((item) => String(item.assetTag || '').trim() === filters.assetTag.trim());
          if (!matched) return false;
        }
        if (filters.employeeCard && task.employeeCard !== filters.employeeCard.trim()) return false;
        if (filters.employeeName && !includesText(task.applicantName, filters.employeeName)) return false;
        if (filters.assetName) {
          const matched = (task.materials || []).some((item) => includesText(item.materialDesc, filters.assetName));
          if (!matched) return false;
        }
        if (filters.documentNo && !includesText(task.applicationNo, filters.documentNo)) return false;
        if (filters.documentType && task.documentType !== filters.documentType) return false;
        return true;
      })
      .sort((a, b) => String(b.applicationTime).localeCompare(String(a.applicationTime)));

    setHasQueried(true);
    setResults(filtered);
    setPage(1);

    if (filtered.length === 1) {
      handleTask(filtered[0]);
    }
  };

  const handleAssetEnter = () => {
    if (!draftFilters.assetTag.trim()) {
      messageApi.warning('请扫描/输入资产标签号！');
      return;
    }
    runQuery({ ...draftFilters, assetTag: draftFilters.assetTag.trim() });
  };

  const handleCardEnter = () => {
    if (!draftFilters.employeeCard.trim()) {
      messageApi.warning('请扫描/输入员工卡号！');
      return;
    }
    runQuery({ ...draftFilters, employeeCard: draftFilters.employeeCard.trim() });
  };

  const openEmployeePage = () => {
    const employeeWindow = window.open('', 'mmp-warehouse-employee-page', 'width=1080,height=760');
    if (!employeeWindow) {
      messageApi.warning('员工页面被浏览器拦截，请允许弹出窗口后重试');
      return;
    }
    employeeWindow.document.open();
    employeeWindow.document.write(buildEmployeeWindowHtml(WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY));
    employeeWindow.document.close();
  };

  const refreshEmployeePage = () => {
    window.localStorage.removeItem(WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY);
    messageApi.success('已刷新');
  };

  const columns = [
    {
      title: '行号',
      width: 80,
      align: 'center',
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: '申请单编号',
      dataIndex: 'applicationNo',
      width: 220,
      sorter: (a, b) => String(a.applicationNo).localeCompare(String(b.applicationNo)),
      render: (value, row) => <Button type="link" className="px-0" onClick={() => handleTask(row)}>{value}</Button>,
    },
    { title: '单据类型', dataIndex: 'documentType', width: 160 },
    { title: '审批环节', dataIndex: 'approvalNode', width: 180 },
    { title: '申请人', dataIndex: 'applicant', width: 180 },
    {
      title: '申请时间',
      dataIndex: 'applicationTime',
      width: 180,
      defaultSortOrder: 'descend',
      sorter: (a, b) => String(a.applicationTime).localeCompare(String(b.applicationTime)),
      render: (value) => String(value || '').slice(0, 10),
    },
    {
      title: '操作',
      key: 'operation',
      width: 100,
      fixed: 'right',
      render: (_, row) => <Button type="link" className="px-0" onClick={() => handleTask(row)}>处理</Button>,
    },
  ];

  if (!canUseWorkbench) {
    return (
      <>
        {contextHolder}
        <Result
          status="403"
          title="无库管员工作台权限"
          subTitle="当前工作台仅开放给杨芊、孙志强。"
        />
      </>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>库管员工作台</PageTitle>

      <div className="flex justify-end">
        <Space wrap>
          <Button icon={<UserRound size={14} />} onClick={openEmployeePage}>员工页面</Button>
          <Button icon={<RefreshCcw size={14} />} onClick={refreshEmployeePage}>刷新员工页面</Button>
        </Space>
      </div>

      <QueryBar>
        <QueryItem label="资产标签号">
          <Input
            value={draftFilters.assetTag}
            allowClear
            placeholder="扫描/输入资产标签号"
            onChange={(event) => updateFilter('assetTag', event.target.value)}
            onPressEnter={handleAssetEnter}
          />
        </QueryItem>
        <QueryItem label="员工卡号">
          <Input
            value={draftFilters.employeeCard}
            allowClear
            placeholder="刷卡/输入员工卡号"
            onChange={(event) => updateFilter('employeeCard', event.target.value)}
            onPressEnter={handleCardEnter}
          />
        </QueryItem>
        <QueryItem label="员工姓名">
          <Input
            value={draftFilters.employeeName}
            allowClear
            placeholder="请输入员工姓名"
            onChange={(event) => updateFilter('employeeName', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="资产名称">
          <Input
            value={draftFilters.assetName}
            allowClear
            placeholder="请输入资产名称"
            onChange={(event) => updateFilter('assetName', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="单据编号">
          <Input
            value={draftFilters.documentNo}
            allowClear
            placeholder="请输入单据编号"
            onChange={(event) => updateFilter('documentNo', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="单据类型">
          <Select
            value={draftFilters.documentType || undefined}
            allowClear
            placeholder="请选择"
            options={WAREHOUSE_WORKBENCH_DOCUMENT_TYPES.map((value) => ({ label: value, value }))}
            onChange={(value) => updateFilter('documentType', value)}
          />
        </QueryItem>
      </QueryBar>


      <Card
        size="small"
        title="资产出入库单据"
        extra={<Typography.Text type="secondary">共 {hasQueried ? results.length : 0} 条</Typography.Text>}
      >
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={hasQueried ? results : []}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          locale={{ emptyText: '暂无待处理单据' }}
        />
      </Card>
    </Space>
  );
}
