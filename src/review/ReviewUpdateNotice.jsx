import React, { useState } from 'react';
import { Alert, Button, Divider, Modal, Space, Tag, Typography } from 'antd';
import { REVIEW_RELEASE } from './review-release';

function ChangeSection({ title, items }) {
  return (
    <div>
      <Typography.Text strong>{title}</Typography.Text>
      <ul className="mb-0 mt-2 pl-5 text-sm leading-6 text-gray-600">
        {(items || []).map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default function ReviewUpdateNotice() {
  const [open, setOpen] = useState(true);

  return (
    <Modal
      open={open}
      width={760}
      closable={false}
      maskClosable={false}
      keyboard={false}
      title={(
        <Space size={8}>
          <span>研发评审版本更新说明</span>
          <Tag color="blue">{REVIEW_RELEASE.version}</Tag>
        </Space>
      )}
      footer={(
        <div className="flex justify-center">
          <Button type="primary" onClick={() => setOpen(false)}>我知道了</Button>
        </div>
      )}
    >
      <Typography.Paragraph type="secondary" className="mb-3">
        {REVIEW_RELEASE.title} · {REVIEW_RELEASE.publishedAt}
      </Typography.Paragraph>

      <Alert
        type="info"
        showIcon
        message="本页面来自研发评审专用分支"
        description={REVIEW_RELEASE.note}
      />

      <Divider />
      <ChangeSection title="PRD 变化" items={REVIEW_RELEASE.prdChanges} />
      <Divider />
      <ChangeSection title="原型变化" items={REVIEW_RELEASE.prototypeChanges} />
    </Modal>
  );
}
