import React from 'react';
import { Card, Descriptions, Modal, Space, Tag, Typography } from 'antd';
import ReplacementHistoryCard from './ReplacementHistoryCard';

const STATUS_COLOR = {
  处理中: 'processing',
  已完成: 'success',
  已驳回: 'error',
};

export default function ReplacementDetailModal({ open, application, onCancel }) {
  if (!application) return null;

  return (
    <Modal
      title="资产更换详情及流程记录"
      open={open}
      width={1180}
      footer={null}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} className="w-full">
        <Card title="基本信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="申请单号">{application.id}</Descriptions.Item>
            <Descriptions.Item label="申请人">{application.applicant.id}-{application.applicant.name}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{application.applyTime}</Descriptions.Item>
            <Descriptions.Item label="更换类型">{application.replacementType}</Descriptions.Item>
            <Descriptions.Item label="单据状态">
              <Tag color={STATUS_COLOR[application.status] || 'default'}>{application.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="当前节点">{application.currentNode}</Descriptions.Item>
            <Descriptions.Item label="更换原因" span={3}>{application.reason}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="旧资产退回信息" size="small">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="旧资产标签号">{application.oldAsset.assetTag}</Descriptions.Item>
            <Descriptions.Item label="资产说明">{application.oldAsset.assetDesc}</Descriptions.Item>
            <Descriptions.Item label="配置">{application.oldAsset.config}</Descriptions.Item>
            <Descriptions.Item label="MIS鉴定结果">{application.mis.result || '-'}</Descriptions.Item>
            <Descriptions.Item label="入库单号">{application.returnProcess.inboundOrderNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="退库确认状态">{application.returnProcess.confirmStatus}</Descriptions.Item>
            <Descriptions.Item label="实际入库仓库">{application.returnProcess.warehouse || '-'}</Descriptions.Item>
            <Descriptions.Item label="入库状态">{application.returnProcess.inboundStatus}</Descriptions.Item>
            <Descriptions.Item label="入库时间">{application.returnProcess.inboundAt || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="新资产发放信息" size="small">
          {application.newAsset ? (
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="新资产标签号">{application.newAsset.assetTag}</Descriptions.Item>
              <Descriptions.Item label="资产说明">{application.newAsset.assetDesc}</Descriptions.Item>
              <Descriptions.Item label="配置">{application.newAsset.config}</Descriptions.Item>
              <Descriptions.Item label="出库单号">{application.issueProcess.outboundOrderNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="领用确认状态">{application.issueProcess.confirmStatus}</Descriptions.Item>
              <Descriptions.Item label="发放仓库">{application.issueProcess.warehouse || '-'}</Descriptions.Item>
              <Descriptions.Item label="归还日期">{application.issueProcess.returnDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="资产用途">{application.issueProcess.purpose || '-'}</Descriptions.Item>
              <Descriptions.Item label="出库时间">{application.issueProcess.outboundAt || '-'}</Descriptions.Item>
            </Descriptions>
          ) : (
            <Typography.Text type="secondary">尚未选择或发放新资产</Typography.Text>
          )}
        </Card>

        <ReplacementHistoryCard records={application.history} />
      </Space>
    </Modal>
  );
}
