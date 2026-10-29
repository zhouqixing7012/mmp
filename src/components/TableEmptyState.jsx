import React from 'react';
import { Empty } from 'antd';
import emptyStateImage from '../assets/ui/empty-state.png';

// 复用设计走查原素材，保持比例；空结果只通过原筛选区重置恢复。
export default function TableEmptyState({ filtered = false }) {
  return <Empty image={emptyStateImage} styles={{ image: { height: 90 } }} description={filtered ? '暂无匹配结果' : '暂无数据'} />;
}
