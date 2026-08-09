import React, { useMemo, useState } from 'react';
import { Download, Paperclip } from 'lucide-react';
import {
  Button,
  Card,
  Collapse,
  Descriptions,
  Input,
  Space,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import StatusTag from '../components/StatusTag';

const { Text, Title } = Typography;

const approvalData = {
  docNo: 'BF-202310250088',
  company: '114.搜狐媒体',
  status: '待审批',
  creator: '李四（系统管理员）',
  createDate: '2023-10-25 10:30:00',
  intercompanyTransfer: '是',
  expiredReason: '已达到资产使用年限，且设备性能、稳定性已无法满足现有业务需求，申请按到期资产进行账面报废。',
  unexpiredReason: '部分资产因机房漏水、接口故障等原因发生不可修复损坏，虽未达到报废年限，但已无法继续投入使用。',
  lostReason: '部分资产在机房盘点过程中确认丢失，已完成内部核查及上报，申请按丢失资产进行账面报废。',
  remarks: '该批次设备已无法满足各频道及业务线的日常办公需求，部分设备已严重损坏或丢失，特申请报废处理。',
  attachments: [
    { name: '资产鉴定报告_2023Q4.pdf', size: '2.4 MB' },
    { name: '设备损坏照片汇总_搜狐网.zip', size: '15.1 MB' },
  ],
  items: [
    {
      id: 1, group: '服务器', sector: '搜狐网', category: 'Server', tagNo: 'SOHU-SRV-001', assetNo: 'SN-100239',
      description: 'DELL PowerEdge R740 数据库服务器', keyword: 'DELL, 服务器, 数据库',
      qty: 2, originalValue: 85000.00, purchaseDate: '2018-05-10', lifeMonths: 60, accDepreciation: 85000.00, netValue: 0.00,
      responsiblePerson: '王五', responsiblePersonId: 'SH00231', city: '北京', location: '搜狐媒体大厦', floor: 'B2机房',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '设备老化，性能已无法支撑核心业务',
    },
    {
      id: 6, group: '服务器', sector: '搜狐网', category: 'Server', tagNo: 'SOHU-SRV-002', assetNo: 'SN-100240',
      description: 'HP ProLiant DL380 Gen10', keyword: 'HP, 服务器, 计算',
      qty: 3, originalValue: 75000.00, purchaseDate: '2017-08-11', lifeMonths: 60, accDepreciation: 75000.00, netValue: 0.00,
      responsiblePerson: '张三', responsiblePersonId: 'SH00111', city: '北京', location: '搜狐媒体大厦', floor: 'B2机房',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '超出使用寿命，已淘汰退网',
    },
    {
      id: 2, group: '服务器（配件）', sector: '汽车', category: 'Server', tagNo: 'AUTO-ACC-102', assetNo: 'AC-300412',
      description: '64GB DDR4 ECC 内存条', keyword: '三星, 内存, 配件',
      qty: 8, originalValue: 12800.00, purchaseDate: '2018-05-10', lifeMonths: 60, accDepreciation: 12800.00, netValue: 0.00,
      responsiblePerson: '赵六', responsiblePersonId: 'SH01542', city: '北京', location: '搜狐媒体大厦', floor: 'B2机房',
      scrapMethod: '部分报废', scrapType: '已到报废期', reason: '随主服务器一同淘汰报废',
    },
    {
      id: 7, group: '服务器（配件）', sector: '游戏', category: 'Server', tagNo: 'GAME-ACC-015', assetNo: 'GM-500120',
      description: '1.2TB 10K RPM SAS 硬盘', keyword: '硬盘, SAS, 配件',
      qty: 10, originalValue: 15000.00, purchaseDate: '2018-02-20', lifeMonths: 60, accDepreciation: 15000.00, netValue: 0.00,
      responsiblePerson: '李梅', responsiblePersonId: 'SH04105', city: '北京', location: '搜狐畅游大厦', floor: '15层机房',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '坏道过多，SMART告警，无法继续使用',
    },
    {
      id: 8, group: '网络设备', sector: '搜狐网', category: 'Net Equipment', tagNo: 'SOHU-NET-001', assetNo: 'SN-200101',
      description: 'Cisco 2960 接入层交换机', keyword: 'Cisco, 交换机, 接入',
      qty: 5, originalValue: 25000.00, purchaseDate: '2016-11-05', lifeMonths: 60, accDepreciation: 25000.00, netValue: 0.00,
      responsiblePerson: '刘工', responsiblePersonId: 'SH00255', city: '北京', location: '搜狐媒体大厦', floor: '各楼层弱电间',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '端口老化，频繁导致局部断网',
    },
    {
      id: 9, group: '网络设备', sector: '汽车', category: 'Net Equipment', tagNo: 'AUTO-NET-012', assetNo: 'AC-200112',
      description: 'H3C 路由器', keyword: 'H3C, 路由器',
      qty: 2, originalValue: 18000.00, purchaseDate: '2017-04-10', lifeMonths: 60, accDepreciation: 18000.00, netValue: 0.00,
      responsiblePerson: '陈明', responsiblePersonId: 'SH01566', city: '北京', location: '搜狐媒体大厦', floor: '8层弱电间',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '性能不足，背板带宽无法满足需求，已替换',
    },
    {
      id: 10, group: '网络设备（配件）', sector: '房产', category: 'Net Equipment', tagNo: 'PROP-NAC-001', assetNo: 'PM-200201',
      description: '千兆多模光模块', keyword: '光模块, 配件',
      qty: 12, originalValue: 4800.00, purchaseDate: '2016-11-05', lifeMonths: 60, accDepreciation: 4800.00, netValue: 0.00,
      responsiblePerson: '王磊', responsiblePersonId: 'SH02899', city: '上海', location: '上海分公司办公区', floor: '12层机房',
      scrapMethod: '部分报废', scrapType: '已到报废期', reason: '随老旧交换机一同报废处理',
    },
    {
      id: 11, group: '网络设备（配件）', sector: '家居', category: 'Net Equipment', tagNo: 'HOME-NAC-002', assetNo: 'HN-800902',
      description: 'CAT6 屏蔽跳线 3米', keyword: '网线, 跳线, 配件',
      qty: 50, originalValue: 1500.00, purchaseDate: '2017-01-15', lifeMonths: 60, accDepreciation: 1500.00, netValue: 0.00,
      responsiblePerson: '张强', responsiblePersonId: 'SH03422', city: '广州', location: '广州研发中心', floor: '5层机房',
      scrapMethod: '全部报废', scrapType: '已到报废期', reason: '线缆老化严重，水晶头弹片大面积损坏',
    },
    {
      id: 3, group: '网络设备', sector: '房产', category: 'Net Equipment', tagNo: 'PROP-NET-045', assetNo: 'PM-202201',
      description: 'Cisco Catalyst 9300 核心交换机', keyword: 'Cisco, 交换机, 网络',
      qty: 1, originalValue: 45000.00, purchaseDate: '2022-03-15', lifeMonths: 60, accDepreciation: 20000.00, netValue: 25000.00,
      responsiblePerson: '孙七', responsiblePersonId: 'SH02888', city: '上海', location: '上海分公司办公区', floor: '12层机房',
      scrapMethod: '全部报废', scrapType: '未到报废期', reason: '机房漏水导致设备短路烧毁，无法维修',
    },
    {
      id: 4, group: '网络设备（配件）', sector: '家居', category: 'Net Equipment', tagNo: 'HOME-NAC-008', assetNo: 'HN-889901',
      description: '万兆单模光模块 SFP+', keyword: '华为, 光模块, 配件',
      qty: 4, originalValue: 3200.00, purchaseDate: '2021-08-10', lifeMonths: 60, accDepreciation: 1600.00, netValue: 1600.00,
      responsiblePerson: '周八', responsiblePersonId: 'SH03411', city: '广州', location: '广州研发中心', floor: '5层机房',
      scrapMethod: '部分报废', scrapType: '未到报废期', reason: '接口老化导致频繁丢包，影响业务稳定性',
    },
    {
      id: 5, group: '服务器（配件）', sector: '游戏', category: 'Server', tagNo: 'GAME-ACC-012', assetNo: 'GM-500112',
      description: 'PERC H740P 阵列卡', keyword: 'DELL, 阵列卡, 配件',
      qty: 1, originalValue: 4500.00, purchaseDate: '2022-01-10', lifeMonths: 60, accDepreciation: 2000.00, netValue: 2500.00,
      responsiblePerson: '吴九', responsiblePersonId: 'SH04102', city: '北京', location: '搜狐畅游大厦', floor: '15层机房',
      scrapMethod: '全部报废', scrapType: '丢失', reason: '机房资产盘点时确认丢失，已按流程上报',
    },
  ],
};

const transferDetails = approvalData.items.map((item, index) => ({
  assetId: item.id,
  tagNo: item.tagNo,
  newResponsiblePerson: index % 2 === 0 ? '220314.刘帅' : '219128.刘蓓',
  newCompany: '115.新媒体',
  newPlate: '18.Media',
  newCostCenter: '112064.新媒体成本中心',
  city: '北京市',
  building: '搜狐媒体大厦',
  floor: index % 3 === 0 ? 'B2机房' : index % 3 === 1 ? '5层' : '8层',
  adjustedWarehouse: 'I0001.资产库北京库(新媒体)',
}));

const formatMoney = (value) => Number(value || 0).toLocaleString('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const sectionTitle = (title) => (
  <div className="flex items-center gap-2.5 py-0.5">
    <span className="w-1 h-5 rounded-full bg-[#1677ff]" />
    <span className="text-[16px] font-semibold text-gray-900">{title}</span>
  </div>
);

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState('已到报废期');
  const [expandedGroupKeys, setExpandedGroupKeys] = useState([]);
  const [approvalComment, setApprovalComment] = useState('');

  const availableTabs = useMemo(() => ['已到报废期', '未到报废期', '丢失'].filter(
    (type) => approvalData.items.some((item) => item.scrapType === type),
  ), []);

  const activeTabItems = useMemo(
    () => approvalData.items.filter((item) => item.scrapType === activeTab),
    [activeTab],
  );

  const tabTotals = useMemo(() => ({
    qty: activeTabItems.reduce((sum, item) => sum + item.qty, 0),
    originalValue: activeTabItems.reduce((sum, item) => sum + item.originalValue, 0),
    netValue: activeTabItems.reduce((sum, item) => sum + item.netValue, 0),
  }), [activeTabItems]);

  const groupedData = useMemo(() => activeTabItems.reduce((acc, item) => {
    const key = item.group || '其他';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {}), [activeTabItems]);

  const assetColumns = useMemo(() => [
    { title: '行号', key: 'index', width: 64, fixed: 'left', align: 'center', render: (_, __, index) => index + 1 },
    { title: '板块', dataIndex: 'sector', width: 110, fixed: 'left' },
    { title: '资产类别', dataIndex: 'category', width: 140, fixed: 'left' },
    { title: '资产标签号', dataIndex: 'tagNo', width: 150, fixed: 'left', render: (value) => <Text className="font-mono">{value}</Text> },
    { title: '资产编号', dataIndex: 'assetNo', width: 130 },
    { title: '资产说明', dataIndex: 'description', width: 220 },
    { title: '资产关键字', dataIndex: 'keyword', width: 170 },
    { title: '数量', dataIndex: 'qty', width: 80, align: 'right' },
    { title: '原值(元)', dataIndex: 'originalValue', width: 120, align: 'right', render: formatMoney },
    { title: '购买日期', dataIndex: 'purchaseDate', width: 120, align: 'center' },
    { title: '资产寿命(月)', dataIndex: 'lifeMonths', width: 120, align: 'right' },
    { title: '累计折旧', dataIndex: 'accDepreciation', width: 120, align: 'right', render: formatMoney },
    { title: '净值(元)', dataIndex: 'netValue', width: 120, align: 'right', render: (value) => <Text className="text-green-600">{formatMoney(value)}</Text> },
    { title: '责任人姓名', dataIndex: 'responsiblePerson', width: 120 },
    { title: '责任人工号', dataIndex: 'responsiblePersonId', width: 120 },
    { title: '资产所在城市', dataIndex: 'city', width: 120 },
    { title: '资产所在地点', dataIndex: 'location', width: 150 },
    { title: '资产所在楼层', dataIndex: 'floor', width: 130 },
    { title: '报废方式', dataIndex: 'scrapMethod', width: 110 },
    { title: '报废原因', dataIndex: 'reason', width: 220 },
  ], []);

  const transferColumns = useMemo(() => [
    { title: '资产标签号', dataIndex: 'tagNo', width: 160, fixed: 'left', render: (value) => <Text className="font-mono text-gray-900">{value}</Text> },
    { title: '新责任人', dataIndex: 'newResponsiblePerson', width: 150 },
    { title: '新公司', dataIndex: 'newCompany', width: 160 },
    { title: '新板块', dataIndex: 'newPlate', width: 140 },
    { title: '新成本中心', dataIndex: 'newCostCenter', width: 210 },
    { title: 'City', dataIndex: 'city', width: 130 },
    { title: 'Building', dataIndex: 'building', width: 160 },
    { title: 'Floor', dataIndex: 'floor', width: 120 },
    { title: '调账后仓库', dataIndex: 'adjustedWarehouse', width: 240 },
  ], []);

  const handleDownloadAttachment = (file) => {
    const blob = new Blob([`账面报废审批演示附件：${file.name}`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(`已开始下载 ${file.name}`);
  };

  const handleApprove = () => {
    message.success('审批已同意');
  };

  const handleReject = () => {
    if (!approvalComment.trim()) {
      message.error('驳回时请填写审批意见');
      return;
    }
    message.success('审批已驳回');
  };

  const groupCollapseItems = useMemo(() => Object.entries(groupedData).map(([groupName, items]) => {
    const groupQty = items.reduce((sum, item) => sum + item.qty, 0);
    const groupOriginal = items.reduce((sum, item) => sum + item.originalValue, 0);
    const groupNet = items.reduce((sum, item) => sum + item.netValue, 0);

    return {
      key: groupName,
      label: <Text strong className="text-[14px]">{groupName}</Text>,
      extra: (
        <Space size={20} wrap>
          <Text type="secondary">数量：<Text strong>{groupQty}</Text></Text>
          <Text type="secondary">原值合计：<Text strong>{formatMoney(groupOriginal)}</Text></Text>
          <Text type="secondary">净值合计：<Text strong>{formatMoney(groupNet)}</Text></Text>
        </Space>
      ),
      children: (
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={assetColumns}
          dataSource={items}
          pagination={false}
          scroll={{ x: 2650 }}
        />
      ),
    };
  }), [assetColumns, groupedData]);

  return (
    <div className="pb-24">
      <div className="max-w-[1800px] mx-auto p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 px-1">
          <div>
            <Title level={3} className="!mb-0 !text-[22px]">账面报废审批</Title>
          </div>
          <Space size={12}>
            <Button icon={<Download size={15} />}>导出</Button>
            <StatusTag value={approvalData.status} type="business" />
          </Space>
        </div>

        <Card size="small" title={sectionTitle('基本信息')} className="shadow-sm">
          <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
            <Descriptions.Item label="申请单号"><Text className="font-mono">{approvalData.docNo}</Text></Descriptions.Item>
            <Descriptions.Item label="公司">{approvalData.company}</Descriptions.Item>
            <Descriptions.Item label="单据状态"><StatusTag value={approvalData.status} type="business" /></Descriptions.Item>
            <Descriptions.Item label="制单人">{approvalData.creator}</Descriptions.Item>
            <Descriptions.Item label="制单时间">{approvalData.createDate}</Descriptions.Item>
            <Descriptions.Item label="是否公司间转移">{approvalData.intercompanyTransfer}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{approvalData.remarks || '-'}</Descriptions.Item>
            <Descriptions.Item label="附件" span={3}>
              {approvalData.attachments.length > 0 ? (
                <Space wrap>
                  {approvalData.attachments.map((file) => (
                    <span
                      key={file.name}
                      className="group inline-flex items-center gap-2 px-3 py-1.5 border border-[#e5e7eb] rounded-md bg-[#fafafa] hover:border-[#91caff] hover:bg-white transition-colors"
                    >
                      <Paperclip size={14} className="text-gray-400" />
                      <span>{file.name}</span>
                      <Text type="secondary" className="text-xs">{file.size}</Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<Download size={14} />}
                        className="!px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="下载附件"
                        onClick={() => handleDownloadAttachment(file)}
                      />
                    </span>
                  ))}
                </Space>
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title={sectionTitle('报废原因')} className="shadow-sm">
          <Descriptions bordered size="small" column={1} labelStyle={{ width: 180 }}>
            <Descriptions.Item label="已到报废期报废原因">{approvalData.expiredReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="未到报废期报废原因">{approvalData.unexpiredReason || '-'}</Descriptions.Item>
            <Descriptions.Item label="丢失报废原因">{approvalData.lostReason || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title={sectionTitle('报废资产明细')} className="shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={(nextTab) => {
              setActiveTab(nextTab);
              setExpandedGroupKeys([]);
            }}
            items={availableTabs.map((type) => {
              const count = approvalData.items
                .filter((item) => item.scrapType === type)
                .reduce((sum, item) => sum + item.qty, 0);
              return { key: type, label: `${type}（${count}）` };
            })}
          />

          <div className="flex items-center justify-end gap-8 mb-4 px-1 text-sm">
            <span>总数量：<Text strong>{tabTotals.qty}</Text></span>
            <span>原值合计：<Text strong>{formatMoney(tabTotals.originalValue)}</Text></span>
            <span>净值合计：<Text strong className="text-green-600">{formatMoney(tabTotals.netValue)}</Text></span>
          </div>

          <Collapse
            size="small"
            activeKey={expandedGroupKeys}
            onChange={(keys) => setExpandedGroupKeys(Array.isArray(keys) ? keys : [keys])}
            items={groupCollapseItems}
            className="bg-white"
          />
        </Card>

        {approvalData.intercompanyTransfer === '是' && (
          <Card size="small" title={sectionTitle('公司间转移明细')} className="shadow-sm">
            <Table
              rowKey="assetId"
              size="small"
              bordered
              columns={transferColumns}
              dataSource={transferDetails}
              pagination={false}
              scroll={{ x: 1530 }}
            />
          </Card>
        )}

        <Card size="small" title={sectionTitle('审批意见')} className="shadow-sm">
          <Input.TextArea
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder="请输入审批意见（驳回时必填）"
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
          <div className="flex justify-center gap-3 mt-4">
            <Button danger onClick={handleReject}>驳回</Button>
            <Button type="primary" onClick={handleApprove}>同意</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
