import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Space, Table, Tabs, Typography } from 'antd';
import { Handshake, Plus } from 'lucide-react';
import StatusTag from '../components/StatusTag';
import { mockComprehensiveData } from '../mock/businessRulesMock';
import { EMPLOYEE_CONTRACT_NUMBERS } from '../mock/assetReturnMock';

const MOCK_DATA = {
  user: { name: '周琦星', id: '220784', department: '集团总部' },
  assets: [
    {
      id: 'A2024001234',
      brandModel: '联想.ThinkPad T14',
      categorySub: '电脑整机-笔记本电脑',
      config: 'i7-1360P / 16GB / 512GB SSD / Win11 专业版',
      quantity: 1,
      status: '在用-使用中',
      usage: '员工用机',
      materialRuleId: 3,
      borrowed: false,
    },
    {
      id: 'A2024002345',
      brandModel: '戴尔.P2422H',
      categorySub: '显示设备-显示器',
      config: '24英寸 / 1920×1080 / IPS / HDMI+DP',
      quantity: 1,
      status: '在用-借用中',
      usage: '员工用机',
      materialRuleId: 3,
      borrowed: true,
    },
    {
      id: 'A2024003456',
      brandModel: '罗技.MX Master 3S',
      categorySub: '电脑配件-鼠标',
      config: '蓝牙 / 2.4G / 可充电 / 黑色',
      quantity: 1,
      status: '在用-使用中',
      usage: '日常办公',
      materialRuleId: 2,
      borrowed: false,
    },
  ],
  consumables: [
    { id: 'CON-2023001', brandModel: '苹果.35W 双USB-C 电源适配器', categorySub: '电脑配件-充电插头', config: '原装 35W', quantity: 1, status: '在用-使用中' },
    { id: 'CON-2023089', brandModel: '罗技.MX Master 3S', categorySub: '电脑配件-无线鼠标', config: '静音版 8K DPI', quantity: 1, status: '在用-使用中' },
  ],
  contracts: EMPLOYEE_CONTRACT_NUMBERS.map((item) => ({
    id: item.number,
    contractNumber: item.number,
    description: item.description,
  })),
};

const enabled = (value) => value === '1' || value === 1 || value === true || value === '是';

function getActions(asset) {
  if (asset.borrowed) return { canReturn: true, canTransfer: false, canReplace: false };
  const rule = mockComprehensiveData.find((item) => item.id === asset.materialRuleId);
  return {
    canReturn: enabled(rule?.allowReturn),
    canTransfer: enabled(rule?.allowTransfer),
    canReplace: enabled(rule?.allowReplace),
  };
}

export default function PersonalWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assets');
  const [keyword, setKeyword] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  const selectedAssets = useMemo(
    () => MOCK_DATA.assets.filter((item) => selectedAssetIds.includes(item.id)),
    [selectedAssetIds]
  );

  const batchPermissions = useMemo(() => ({
    canReturn: selectedAssets.length > 1 && selectedAssets.every((item) => getActions(item).canReturn),
    canTransfer: selectedAssets.length > 1 && selectedAssets.every((item) => getActions(item).canTransfer),
    canReplace: selectedAssets.length > 1 && selectedAssets.every((item) => getActions(item).canReplace),
  }), [selectedAssets]);

  const startAssetAction = (type, rows) => {
    const assetTags = rows.map((item) => item.id);
    if (type === 'return') {
      navigate('/yewurules', { state: { workspace: '资产退库', prefillAssetTags: assetTags, source: 'personal-workspace' } });
      return;
    }
    if (type === 'replace') {
      navigate('/yewurules', { state: { workspace: '资产更换申请', prefillAssetTags: assetTags, source: 'personal-workspace' } });
      return;
    }
    navigate('/People', { state: { prefillAssetTags: assetTags, source: 'personal-workspace' } });
  };

  const assetColumns = [
    {
      title: '资产信息',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800">{record.brandModel}</div>
          <Typography.Text type="secondary" className="text-xs">{record.categorySub}</Typography.Text>
        </div>
      ),
    },
    { title: '资产标签号', dataIndex: 'id', width: 170 },
    { title: '资产配置', dataIndex: 'config', width: 300 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 140, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
    { title: '资产用途', dataIndex: 'usage', width: 120, align: 'center', render: (value) => value || '-' },
    {
      title: '操作',
      width: 210,
      fixed: 'right',
      align: 'right',
      render: (_, record) => {
        const actions = getActions(record);
        return (
          <Space size={4}>
            {actions.canReturn && <Button type="link" size="small" onClick={() => startAssetAction('return', [record])}>退库</Button>}
            {actions.canTransfer && <Button type="link" size="small" onClick={() => startAssetAction('transfer', [record])}>转移</Button>}
            {actions.canReplace && <Button type="link" size="small" onClick={() => startAssetAction('replace', [record])}>更换</Button>}
          </Space>
        );
      },
    },
  ];

  const consumableColumns = [
    {
      title: '资产信息',
      width: 260,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800">{record.brandModel}</div>
          <Typography.Text type="secondary" className="text-xs">{record.categorySub}</Typography.Text>
        </div>
      ),
    },
    { title: '资产标签号', dataIndex: 'id', width: 180 },
    { title: '资产配置', dataIndex: 'config' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '状态', dataIndex: 'status', width: 140, render: (value) => <StatusTag value={value} type="business" /> },
  ];

  const contractColumns = [
    { title: '合约号码', dataIndex: 'contractNumber', width: 220 },
    { title: '合约号码说明', dataIndex: 'description' },
    {
      title: '操作',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate('/yewurules', { state: { workspace: '合约号码退库', prefillContractNumbers: [record.contractNumber], source: 'personal-workspace' } })}
        >
          退库
        </Button>
      ),
    },
  ];

  const source = activeTab === 'assets' ? MOCK_DATA.assets : activeTab === 'consumables' ? MOCK_DATA.consumables : MOCK_DATA.contracts;
  const filtered = source.filter((item) => {
    const text = activeTab === 'contracts'
      ? `${item.contractNumber} ${item.description}`
      : `${item.id} ${item.brandModel} ${item.categorySub} ${item.config}`;
    return text.toLowerCase().includes(keyword.trim().toLowerCase());
  });

  return (
    <Space direction="vertical" size={16} className="w-full">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5 text-white">
        <div className="flex items-center justify-between gap-6">
          <div>
            <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>上午好，{MOCK_DATA.user.name}</Typography.Title>
            <div className="mt-2 text-sm text-blue-100">您名下共有 {MOCK_DATA.assets.length + MOCK_DATA.consumables.length} 项资产与耗材。</div>
          </div>
          <Space>
            <Button icon={<Plus size={14} />} onClick={() => navigate('/employee-self-service/asset-apply')}>物资申请</Button>
            <Button ghost icon={<Handshake size={14} />} onClick={() => navigate('/yewurules', { state: { workspace: '资产借用' } })}>资产借用</Button>
          </Space>
        </div>
      </div>

      <Card size="small">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); setKeyword(''); setSelectedAssetIds([]); }}
            items={[
              { key: 'assets', label: `资产 ${MOCK_DATA.assets.length}` },
              { key: 'consumables', label: `耗材 ${MOCK_DATA.consumables.length}` },
              { key: 'contracts', label: `合约号码 ${MOCK_DATA.contracts.length}` },
            ]}
            className="mb-[-16px]"
          />
          <Input.Search
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={activeTab === 'contracts' ? '搜索合约号码或说明' : '搜索标签号、资产说明或配置'}
            style={{ width: 280 }}
          />
        </div>

        {activeTab === 'assets' && selectedAssets.length > 1 && (
          <div className="mb-3 flex items-center justify-between rounded bg-blue-50 px-3 py-2">
            <Typography.Text>已选择 {selectedAssets.length} 项资产</Typography.Text>
            <Space>
              {batchPermissions.canReturn && <Button type="link" size="small" onClick={() => startAssetAction('return', selectedAssets)}>批量退库</Button>}
              {batchPermissions.canTransfer && <Button type="link" size="small" onClick={() => startAssetAction('transfer', selectedAssets)}>批量转移</Button>}
              {batchPermissions.canReplace && <Button type="link" size="small" onClick={() => startAssetAction('replace', selectedAssets)}>批量更换</Button>}
            </Space>
          </div>
        )}

        <Table
          rowKey="id"
          size="small"
          bordered
          dataSource={filtered}
          columns={activeTab === 'assets' ? assetColumns : activeTab === 'consumables' ? consumableColumns : contractColumns}
          rowSelection={activeTab === 'assets' ? { selectedRowKeys: selectedAssetIds, onChange: setSelectedAssetIds } : undefined}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: activeTab === 'assets' ? 1270 : undefined }}
        />
      </Card>
    </Space>
  );
}
