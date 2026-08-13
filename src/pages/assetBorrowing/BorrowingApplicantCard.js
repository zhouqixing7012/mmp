import React from 'react';
import { Button, Card, Space } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
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
        <DetailGrid>
          <DetailItem label="申请人">
            <ApplicantValue applicant={applicant} onViewAssets={onViewAssets} />
          </DetailItem>
          <DetailItem label="申请日期">{formatDateText(applyDate)}</DetailItem>
          <DetailItem label="公司">{applicant.company || '-'}</DetailItem>
          <DetailItem label="办公区">{applicant.officeArea || '-'}</DetailItem>
          <DetailItem label="联系电话">{applicant.phone || '-'}</DetailItem>
          <DetailItem label="邮箱">{applicant.email || '-'}</DetailItem>
          <DetailItem label="部门" span={3}>{formatDepartment(applicant.department)}</DetailItem>
        </DetailGrid>
      </Card>
    );
  }

  return (
    <Card title="申请人信息" size="small">
      <DetailGrid>
        <DetailItem label="申请人">
          <ApplicantValue applicant={applicant} onViewAssets={onViewAssets} />
        </DetailItem>
        <DetailItem label="申请日期">{formatDateText(applyDate)}</DetailItem>
        <DetailItem label="公司">{applicant.company || '-'}</DetailItem>
        <DetailItem label="办公区">{applicant.officeArea || '-'}</DetailItem>
        <DetailItem label="联系电话">{applicant.phone || '-'}</DetailItem>
        <DetailItem label="邮箱">{applicant.email || '-'}</DetailItem>
        <DetailItem label="部门" span={3}>{formatDepartment(applicant.department)}</DetailItem>
        <DetailItem label="员工状态"><StatusTag value={employeeStatus} type="business" /></DetailItem>
        <DetailItem label="板块">{applicant.block || '-'}</DetailItem>
        <DetailItem label="成本中心">{applicant.costCenter || '-'}</DetailItem>
        <DetailItem label="办理仓库" span={3}>{warehouse || applicant.defaultWarehouse || '-'}</DetailItem>
      </DetailGrid>
    </Card>
  );
}
