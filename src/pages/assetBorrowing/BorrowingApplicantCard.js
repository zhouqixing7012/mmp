import React from 'react';
import { Eye } from 'lucide-react';
import { Button, Card, Descriptions, Space, Tag } from 'antd';

export default function BorrowingApplicantCard({ applicant, applyDate, warehouse, onViewAssets, compact = false }) {
  const employeeStatus = applicant.employeeStatus || applicant.employeeType;

  return (
    <Card title="申请人信息" size="small">
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="申请人">
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
        </Descriptions.Item>
        <Descriptions.Item label="联系电话">{applicant.phone}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{applicant.email}</Descriptions.Item>
        <Descriptions.Item label="公司">{applicant.company}</Descriptions.Item>
        <Descriptions.Item label="办公区">{applicant.officeArea}</Descriptions.Item>
        <Descriptions.Item label="申请日期">{applyDate}</Descriptions.Item>
        <Descriptions.Item label="员工状态">
          <Tag color={employeeStatus === '正式员工' ? 'success' : 'default'}>
            {employeeStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="部门" span={2}>{applicant.department}</Descriptions.Item>

        {!compact && (
          <>
            <Descriptions.Item label="板块">{applicant.block}</Descriptions.Item>
            <Descriptions.Item label="成本中心">{applicant.costCenter}</Descriptions.Item>
            <Descriptions.Item label="办理仓库">{warehouse || applicant.defaultWarehouse}</Descriptions.Item>
          </>
        )}
      </Descriptions>
    </Card>
  );
}
