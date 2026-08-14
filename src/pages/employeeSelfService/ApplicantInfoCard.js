import React from 'react';
import { Button, Card, Space } from 'antd';
import { Eye } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';

export default function ApplicantInfoCard({ applicant, applyDate, onViewAssets }) {
  return (
    <Card title="申请人信息" size="small">
      <DetailGrid>
        <DetailItem label="申请人">
          <Space size={8}>
            <span>{applicant.id}-{applicant.name}</span>
            {onViewAssets && (
              <Button
                type="link"
                size="small"
                className="px-0"
                icon={<Eye size={14} />}
                onClick={onViewAssets}
              >
                查看名下资产
              </Button>
            )}
          </Space>
        </DetailItem>
        <DetailItem label="申请日期">{applyDate || '-'}</DetailItem>
        <DetailItem label="公司">{applicant.company || '-'}</DetailItem>
        <DetailItem label="办公区">{applicant.officeArea || '-'}</DetailItem>
        <DetailItem label="联系电话">{applicant.phone || '-'}</DetailItem>
        <DetailItem label="邮箱">{applicant.email || '-'}</DetailItem>
        <DetailItem label="部门" span={3}>{formatDepartment(applicant.department)}</DetailItem>
        <DetailItem label="员工状态"><StatusTag value={applicant.employeeStatus || '-'} type="business" /></DetailItem>
      </DetailGrid>
    </Card>
  );
}
