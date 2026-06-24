import React from 'react';
import { Button, Card, Row, Col, Space } from 'antd';
import { Search, RefreshCcw } from 'lucide-react';

/**
 * 查询条件容器组件
 * fields: 查询字段（自动按 3 列栅格排列）
 * buttons: 按钮区（查询/重置等，显示在最右侧）
 */

export function QueryItem({ label, children, labelWidth = 96 }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="shrink-0 text-right text-sm text-gray-600"
        style={{ width: labelWidth }}
      >
        {label}:
      </span>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

export default function QueryBar({ children, buttons, labelWidth = 96, onQuery, onReset }) {
  const fields = React.Children.toArray(children);
    const defaultButtons = (
    <>
      <Button type="primary" icon={<Search size={14} />} onClick={onQuery}>查询</Button>
      <Button icon={<RefreshCcw size={14} />} onClick={onReset}>重置</Button>
    </>
  );
  const finalButtons = buttons !== undefined ? buttons : defaultButtons;
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <style>{`
        .qw > div > span:first-child {
          width: ${labelWidth}px !important;
          min-width: ${labelWidth}px !important;
          text-align: right !important;
          flex-shrink: 0 !important;
        }
        .qw > div > :nth-child(2) {
          width: 100% !important;
        }
      `}</style>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row gutter={[16, 16]}>
            {fields.map((field, i) => (
              <Col key={i} xs={24} sm={12} md={12} lg={8} xl={7}>
                <div className="qw">{field}</div>
              </Col>
            ))}
          </Row>
        </div>
        {finalButtons && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 80, width: 90, justifyContent: 'center' }}>
            {finalButtons}
          </div>
        )}
      </div>
    </Card>
  );
}
