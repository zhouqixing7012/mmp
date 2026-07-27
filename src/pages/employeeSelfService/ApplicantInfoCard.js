import React from 'react';
import { Card, Descriptions, Tag } from 'antd';

export default function ApplicantInfoCard({ applicant, applyDate }) {
  return (
    <Card title="申请人信息" size="small">
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="申请人">{applicant.id}-{applicant.name}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{applicant.phone}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{applicant.email}</Descriptions.Item>
        <Descriptions.Item label="公司">{applicant.company}</Descriptions.Item>
        <Descriptions.Item label="办公区">{applicant.officeArea}</Descriptions.Item>
        <Descriptions.Item label="申请日期">{applyDate}</Descriptions.Item>
        <Descriptions.Item label="员工状态">
          <Tag color={applicant.employeeStatus === '正式员工' ? 'success' : 'default'}>
            {applicant.employeeStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="部门" span={2}>{applicant.department}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
