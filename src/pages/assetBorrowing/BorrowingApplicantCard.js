import React from 'react';
import { Eye } from 'lucide-react';
import { Button, Card, Descriptions, Space } from 'antd';
import StatusTag from '../../components/StatusTag';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';

function ApplicantValue({ applicant, onViewAssets }) {
  return (
    <Space size={8}>
      <span>{applicant.id}-{applicant.name}</span>
      {onViewAssets && (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          className="px-0"
          onClick={onViewAssets}
        >
          查看名下资产
        </Button>
      )}
    </Space>
  );
}

export default function BorrowingApplicantCard({ applicant, applyDate, warehouse, onViewAssets, compact = false }) {
  const employeeStatus = applicant.employeeStatus || applicant.employeeType;

  if (compact) {
    return (
      <Card title="申请人信息" size="small">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请人">
            <ApplicantValue applicant={applicant} onViewAssets={onViewAssets} />
          </Descriptions.Item>
          <Descriptions.Item label="申请日期">{formatDateText(applyDate)}</Descriptions.Item>
          <Descriptions.Item label="公司">{applicant.company || '-'}</Descriptions.Item>
          <Descriptions.Item label="办公区">{applicant.officeArea || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{applicant.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{applicant.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="部门" span={3}>{formatDepartment(applicant.department)}</Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card title="申请人信息" size="small">
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="申请人">
          <ApplicantValue applicant={applicant} onViewAssets={onViewAssets} />
        </Descriptions.Item>
        <Descriptions.Item label="申请日期">{formatDateText(applyDate)}</Descriptions.Item>
        <Descriptions.Item label="公司">{applicant.company || '-'}</Descriptions.Item>
        <Descriptions.Item label="办公区">{applicant.officeArea || '-'}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{applicant.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{applicant.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="部门" span={3}>{formatDepartment(applicant.department)}</Descriptions.Item>
        <Descriptions.Item label="员工状态"><StatusTag value={employeeStatus} type="business" /></Descriptions.Item>
        <Descriptions.Item label="板块">{applicant.block || '-'}</Descriptions.Item>
        <Descriptions.Item label="成本中心">{applicant.costCenter || '-'}</Descriptions.Item>
        <Descriptions.Item label="办理仓库" span={3}>{warehouse || applicant.defaultWarehouse || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
