import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Select,
  Space,
  Typography,
  message as antdMessage,
} from 'antd';
import { formatDepartment } from '../../utils/displayFormat';

const WAREHOUSE_OPTIONS = [
  'I1001-耗材集团总库（新媒体）',
  'I1002-北京搜狐媒体大厦耗材仓',
  'I1003-上海办公区耗材仓',
].map((value) => ({ label: value, value }));

const CITY_OPTIONS = ['35.北京市', '31.上海市', '44.广州市'].map((value) => ({ label: value, value }));
const BUILDING_OPTIONS = ['129753.搜狐媒体大厦', '129754.融科资讯中心', '129755.上海办公区'].map((value) => ({ label: value, value }));
const FLOOR_OPTIONS = ['8层', '10层', '12层', '15层'].map((value) => ({ label: value, value }));
const PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途'].map((value) => ({ label: value, value }));

const VARIANTS = {
  materialCode: {
    menuKey: '耗材领用方案一',
    title: '耗材领用方案一（物料编码）',
    applicationNo: 'EUA-2026070300001',
    applicant: {
      id: '117771',
      name: '任珊珊',
      phone: '010-62726082',
      email: 'shanshanren@sohu-inc.com',
      company: '新媒体',
      officeArea: '北京-搜狐媒体大厦',
      costCenter: '114101.汽车_总部_高管组_N',
      department: '搜狐媒体/汽车/管理组',
      applyDate: '2026-07-03',
    },
    identifierLabel: '物料编码',
    identifier: '324001014ABZ000',
    serialNo: '-',
    quantityLabel: '数量',
    quantity: 1,
    company: '114-新媒体',
    block: '搜狐网-web',
    enableDate: '2026-07-03',
    actualDescription: '其他.131A四色硒鼓（国产）',
    configuration: '-',
    requestedDescription: '硒鼓.其他.131A四色硒鼓（国产）',
    reason: '部门公共设备使用',
    detail: '部门公共设备使用',
  },
  assetTag: {
    menuKey: '耗材领用方案二',
    title: '耗材领用方案二（标签号）',
    applicationNo: 'EUA-2026051200002',
    applicant: {
      id: '220687',
      name: '李慧君',
      phone: '010-56603318',
      email: 'huijunli@sohu-inc.com',
      company: '新媒体',
      officeArea: '北京-搜狐媒体大厦',
      costCenter: '113155.汽车_总部_营销策略中心_N',
      department: '搜狐媒体/汽车/用户运营中心/智能家居组',
      applyDate: '2026-05-12',
    },
    identifierLabel: '耗材标签号',
    identifier: 'QT-264529',
    serialNo: '缺省',
    quantityLabel: '部件数量',
    quantity: 0,
    company: '114-新媒体',
    block: '搜狐网-web',
    enableDate: '2026-05-12',
    actualDescription: '闪迪.E61 2TB移动固态硬盘',
    configuration: '-',
    requestedDescription: '移动硬盘.闪迪.E61 2TB移动固态硬盘',
    reason: '日常办公使用',
    detail: '需要型号：闪迪移动固态硬盘 E61-2T 高速读取，1050MB/S。用于探索类节目、热点口播视频及AI动画视频项目的素材存储与剪辑。',
  },
};

function ConsumableClaimAlternativePage({ variant }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const data = VARIANTS[variant];
  const isMaterialCode = variant === 'materialCode';
  const [warehouse, setWarehouse] = useState('I1001-耗材集团总库（新媒体）');
  const [identifier, setIdentifier] = useState(data.identifier);
  const [remark, setRemark] = useState('');
  const [city, setCity] = useState('35.北京市');
  const [building, setBuilding] = useState('129753.搜狐媒体大厦');
  const [floor, setFloor] = useState('15层');
  const [purpose, setPurpose] = useState('专业用途');
  const [usageNote, setUsageNote] = useState('');

  const submit = () => {
    if (!warehouse || !identifier.trim() || !city || !building || !floor || (!isMaterialCode && !purpose)) {
      messageApi.warning('请完整填写必填字段');
      return;
    }
    messageApi.success('领用信息已保存，并已发起员工刷卡/扫码确认');
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
        <Typography.Title level={4} className="mb-0">{data.title}</Typography.Title>
        <Typography.Text type="secondary">领用申请单号：{data.applicationNo}</Typography.Text>
      </div>

      <Card size="small" title="申请人信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 当前仓库</span>} span={3}>
            <Select className="w-full max-w-2xl" value={warehouse} options={WAREHOUSE_OPTIONS} onChange={setWarehouse} />
          </Descriptions.Item>
          <Descriptions.Item label="使用人">{data.applicant.id}-{data.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{data.applicant.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{data.applicant.email}</Descriptions.Item>
          <Descriptions.Item label="公司">{data.applicant.company}</Descriptions.Item>
          <Descriptions.Item label="办公区">{data.applicant.officeArea}</Descriptions.Item>
          <Descriptions.Item label="申请日期">{data.applicant.applyDate}</Descriptions.Item>
          <Descriptions.Item label="成本中心">{data.applicant.costCenter}</Descriptions.Item>
          <Descriptions.Item label="部门" span={2}>{formatDepartment(data.applicant.department)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="申请耗材信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> {data.identifierLabel}</span>}>
            <Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
          </Descriptions.Item>
          {!isMaterialCode && <Descriptions.Item label="序列号">{data.serialNo}</Descriptions.Item>}
          <Descriptions.Item label={data.quantityLabel}>{data.quantity}</Descriptions.Item>
          <Descriptions.Item label="公司">{data.company}</Descriptions.Item>
          <Descriptions.Item label="板块">{data.block}</Descriptions.Item>
          <Descriptions.Item label="启用日期">{data.enableDate}</Descriptions.Item>
          <Descriptions.Item label="实际耗材说明">{data.actualDescription}</Descriptions.Item>
          <Descriptions.Item label="配置" span={2}>{data.configuration}</Descriptions.Item>
          <Descriptions.Item label="备注" span={3}>
            <Input maxLength={400} value={remark} placeholder="请输入备注" onChange={(event) => setRemark(event.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 城市</span>}>
            <Select className="w-full" value={city} options={CITY_OPTIONS} onChange={setCity} />
          </Descriptions.Item>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 建筑</span>}>
            <Select className="w-full" value={building} options={BUILDING_OPTIONS} onChange={setBuilding} />
          </Descriptions.Item>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 楼层</span>}>
            <Select className="w-full" value={floor} options={FLOOR_OPTIONS} onChange={setFloor} />
          </Descriptions.Item>
          {!isMaterialCode && (
            <Descriptions.Item label={<span><span className="text-red-500">*</span> 使用用途</span>}>
              <Select className="w-full" value={purpose} options={PURPOSE_OPTIONS} onChange={setPurpose} />
            </Descriptions.Item>
          )}
          <Descriptions.Item label="使用说明" span={isMaterialCode ? 3 : 2}>
            <Input maxLength={400} value={usageNote} placeholder="请输入使用说明" onChange={(event) => setUsageNote(event.target.value)} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="申请参考信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请耗材说明" span={3}>{data.requestedDescription}</Descriptions.Item>
          <Descriptions.Item label="申请用途" span={3}>{data.reason}</Descriptions.Item>
          <Descriptions.Item label="申请原因" span={3}>{data.detail}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="审批操作">
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={submit}>领用确认</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
        </div>
      </Card>
    </Space>
  );
}

export function ConsumableClaimMaterialCodePage() {
  return <ConsumableClaimAlternativePage variant="materialCode" />;
}

export function ConsumableClaimAssetTagPage() {
  return <ConsumableClaimAlternativePage variant="assetTag" />;
}
