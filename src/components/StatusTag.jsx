import React from 'react';
import { Tag } from 'antd';

const STATUS_MAP = {
  yes: { text: '是', color: '#389e0d', background: '#f6ffed', borderColor: '#b7eb8f' },
  no: { text: '否', color: '#595959', background: '#fafafa', borderColor: '#d9d9d9' },
  enabled: { text: '启用', color: '#389e0d', background: '#f6ffed', borderColor: '#b7eb8f' },
  disabled: { text: '停用', color: '#cf1322', background: '#fff1f0', borderColor: '#ffa39e' },
  warning: { text: '停产', color: '#d46b08', background: '#fff7e6', borderColor: '#ffd591' },
};

const BUSINESS_STATUS_TONE = {
  已提交: 'processing',
  处理中: 'processing',
  在库: 'processing',
  '在库-新增': 'processing',
  待审批: 'warning',
  待确认: 'warning',
  等待员工确认: 'warning',
  '在库-待处理': 'warning',
  待维修: 'warning',
  未发起: 'default',
  未盘: 'error',
  已确认: 'success',
  已同意: 'success',
  已完成: 'success',
  已处理: 'success',
  已出库: 'success',
  已入库: 'success',
  鉴定通过: 'success',
  正式员工: 'success',
  '在用-使用中': 'success',
  '在用-借用中': 'success',
  '再利用-使用中': 'success',
  '在库-再利用': 'success',
  已驳回: 'error',
  鉴定不通过: 'error',
  限制出库: 'error',
  已结束: 'default',
  外包员工: 'default',
  实习员工: 'default',
};

const TONE_STYLE = {
  processing: { color: '#0958d9', background: '#e6f4ff', borderColor: '#91caff' },
  warning: { color: '#d46b08', background: '#fff7e6', borderColor: '#ffd591' },
  success: { color: '#389e0d', background: '#f6ffed', borderColor: '#b7eb8f' },
  error: { color: '#cf1322', background: '#fff1f0', borderColor: '#ffa39e' },
  default: { color: '#595959', background: '#fafafa', borderColor: '#d9d9d9' },
};

function normalizeValue(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return value;
}

function renderTag(text, style) {
  return (
    <Tag style={{ ...style, marginInlineEnd: 0 }}>
      <span>{text}</span>
    </Tag>
  );
}

function renderBusinessTag(value) {
  const text = typeof value === 'string' ? value : String(value);
  const tone = BUSINESS_STATUS_TONE[text] || 'default';
  return renderTag(text, TONE_STYLE[tone]);
}

function renderYesNoTag(value) {
  return value === '1' || value === true || value === '是'
    ? renderTag(STATUS_MAP.yes.text, STATUS_MAP.yes)
    : renderTag(STATUS_MAP.no.text, STATUS_MAP.no);
}

function isYesNoValue(value) {
  return value === true
    || value === false
    || value === '1'
    || value === '0'
    || value === '是'
    || value === '否';
}

export default function StatusTag({ value, status, children, type = 'auto' }) {
  const normalizedValue = normalizeValue(value ?? status ?? children);

  if (normalizedValue === '') {
    return renderTag('-', TONE_STYLE.default);
  }

  if (type === 'business') {
    return renderBusinessTag(normalizedValue);
  }

  if (type === 'enabled') {
    return normalizedValue === '1' || normalizedValue === true
      ? renderTag(STATUS_MAP.enabled.text, STATUS_MAP.enabled)
      : renderTag(STATUS_MAP.disabled.text, STATUS_MAP.disabled);
  }

  if (type === 'stop') {
    return normalizedValue === '1' || normalizedValue === true
      ? renderTag(STATUS_MAP.warning.text, STATUS_MAP.warning)
      : renderTag('未停产', TONE_STYLE.default);
  }

  if (type === 'yesNo') {
    return renderYesNoTag(normalizedValue);
  }

  if (!isYesNoValue(normalizedValue)) {
    return renderBusinessTag(normalizedValue);
  }

  return renderYesNoTag(normalizedValue);
}
