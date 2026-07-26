import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Save, UploadCloud } from 'lucide-react';
import { Button, Card, Empty, Input, Space, Table, Tabs, Upload, message as antdMessage } from 'antd';
import {
  DEPARTMENT_SUMMARY_ROWS,
  NON_OVER_STANDARD_ROWS,
  SUMMARY_TEXT,
  UNIFIED_SUMMARY_APPLICANTS,
  UNIFIED_SUMMARY_LIST,
} from '../mock/unifiedAssetSummaryMock';

const { TextArea } = Input;

function formatMoney(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function totalBy(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function PageHeader({ title, children }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
        <FileText size={20} className="text-blue-600" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function UnifiedAssetApplySummary() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [currentView, setCurrentView] = useState('list');
  const [projectPurpose, setProjectPurpose] = useState('');
  const [fileList, setFileList] = useState([]);

  const departmentTotals = useMemo(
    () => ({
      quantity: totalBy(DEPARTMENT_SUMMARY_ROWS, 'quantity'),
      amount: totalBy(DEPARTMENT_SUMMARY_ROWS, 'amount'),
    }),
    []
  );

  const nonOverTotals = useMemo(
    () => ({
      quantity: totalBy(NON_OVER_STANDARD_ROWS, 'quantity'),
      amount: totalBy(NON_OVER_STANDARD_ROWS, 'amount'),
    }),
    []
  );

  const listColumns = [
    { title: '申请部门', dataIndex: 'department' },
    { title: '申请数量', dataIndex: 'quantity', width: 120, align: 'center' },
    { title: '汇总时间', dataIndex: 'summaryTime', width: 180 },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: () => (
        <Button type="link" onClick={() => setCurrentView('detail')}>
          查看
        </Button>
      ),
    },
  ];

  const detailColumns = [
    { title: '物料小类', dataIndex: 'category', width: 180 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 100 },
    { title: '详细说明', dataIndex: 'detail' },
    { title: '价格', dataIndex: 'price', width: 100, align: 'right', render: formatMoney },
    { title: '超标', dataIndex: 'overStandard', width: 80, align: 'center' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 100, align: 'center' },
  ];

  const departmentColumns = [
    { title: '序号', dataIndex: 'index', width: 80, align: 'center' },
    { title: '物资类别', dataIndex: 'category' },
    { title: '申请采购数量', dataIndex: 'quantity', width: 140, align: 'center' },
    { title: '预计采购费用(元)', dataIndex: 'amount', width: 180, align: 'right', render: formatMoney },
  ];

  const nonOverColumns = [
    { title: '序号', dataIndex: 'index', width: 70, align: 'center' },
    { title: '申请人', dataIndex: 'applicant', width: 150 },
    { title: '物资类别', dataIndex: 'category', width: 180 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 100 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '预计采购费用(元)', dataIndex: 'amount', width: 160, align: 'right', render: formatMoney },
    { title: '详细说明', dataIndex: 'detail', width: 180 },
    { title: '在用资产', dataIndex: 'currentAssets', width: 100, align: 'center' },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 100, align: 'center' },
  ];

  const handleReject = (applicant) => {
    messageApi.warning(`${applicant} 已标记为驳回演示状态`);
  };

  const handleSave = () => {
    messageApi.success('汇总明细已保存');
  };

  const handleSubmit = () => {
    messageApi.success('统一申请汇总已提交至下一环节');
  };

  const renderList = () => (
    <Card>
      <Tabs
        activeKey="summary"
        items={[
          { key: 'myAsset', label: '我的资产', children: null },
          { key: 'transfer', label: '转移', children: null },
          { key: 'scrap', label: '报废', children: null },
          {
            key: 'summary',
            label: '统一申请汇总-资产',
            children: (
              <Table
                rowKey="id"
                columns={listColumns}
                dataSource={UNIFIED_SUMMARY_LIST}
                pagination={false}
                locale={{ emptyText: <Empty description="暂无汇总数据" /> }}
              />
            ),
          },
        ]}
      />
    </Card>
  );

  const renderDetail = () => (
    <Space direction="vertical" size={16} className="w-full">
      {UNIFIED_SUMMARY_APPLICANTS.map((record) => (
        <Card key={record.key} size="small">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
            <Space wrap>
              <span>申请人：{record.applicant}</span>
              <span>申请单号：{record.formNo}</span>
              <span>申请部门：{record.department}</span>
            </Space>
            <Button danger onClick={() => handleReject(record.applicant)}>
              驳回
            </Button>
          </div>
          <Table rowKey="key" columns={detailColumns} dataSource={record.items} pagination={false} size="small" />
        </Card>
      ))}

      <Card size="small">
        <div className="flex justify-end gap-2">
          <Button type="primary" onClick={() => setCurrentView('summary')}>
            下一步
          </Button>
          <Button icon={<Save size={14} />} onClick={handleSave}>
            保存
          </Button>
          <Button icon={<ArrowLeft size={14} />} onClick={() => setCurrentView('list')}>
            返回
          </Button>
        </div>
      </Card>
    </Space>
  );

  const renderSummary = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Card title="ES汇总说明" size="small">
        <div className="rounded-md bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {SUMMARY_TEXT.map((text) => (
            <p key={text} className="m-0">
              {text}
            </p>
          ))}
        </div>
      </Card>

      <Card title="项目用途说明" size="small">
        <TextArea
          rows={4}
          value={projectPurpose}
          onChange={(event) => setProjectPurpose(event.target.value)}
          placeholder="请输入项目用途说明"
          maxLength={300}
          showCount
        />
        <div className="mt-2 text-sm text-red-500">备注：此信息会同步至PR系统。</div>
      </Card>

      <Card title="部门汇总信息" size="small">
        <Table
          rowKey="key"
          columns={departmentColumns}
          dataSource={DEPARTMENT_SUMMARY_ROWS}
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="center">
                {departmentTotals.quantity}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                {formatMoney(departmentTotals.amount)}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        <div className="mt-2 text-sm text-red-500">此汇总申请中的价格仅供参考，最终采购价格以PR单为准。</div>
      </Card>

      <Card title="超标申请" size="small">
        <Empty description="暂无超标申请" />
      </Card>

      <Card title="非超标申请" size="small">
        <Table
          rowKey="key"
          columns={nonOverColumns}
          dataSource={NON_OVER_STANDARD_ROWS}
          pagination={false}
          size="small"
          scroll={{ x: 1300 }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="center">
                {nonOverTotals.quantity}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                {formatMoney(nonOverTotals.amount)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} colSpan={3} />
            </Table.Summary.Row>
          )}
        />
      </Card>

      <Card title="附件信息" size="small">
        <Upload
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
        >
          <Button icon={<UploadCloud size={14} />}>上传附件</Button>
        </Upload>
      </Card>

      <Card title="部门现资产参考使用量" size="small">
        <Empty description="暂无参考数据" />
      </Card>

      <Card size="small">
        <div className="flex justify-end gap-2">
          <Button type="primary" icon={<CheckCircle2 size={14} />} onClick={handleSubmit}>
            提交
          </Button>
          <Button onClick={() => setCurrentView('detail')}>修改</Button>
        </div>
      </Card>
    </Space>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <PageHeader title="统一申请汇总">
        {currentView !== 'list' && (
          <Button icon={<ArrowLeft size={14} />} onClick={() => setCurrentView(currentView === 'summary' ? 'detail' : 'list')}>
            返回上一步
          </Button>
        )}
      </PageHeader>
      {currentView === 'list' && renderList()}
      {currentView === 'detail' && renderDetail()}
      {currentView === 'summary' && renderSummary()}
    </div>
  );
}
