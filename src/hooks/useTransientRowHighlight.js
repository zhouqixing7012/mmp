import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 表格新增/修改成功后的短暂行高亮。
 * 业务页面只负责在成功落数据后调用 highlightRow，不自行维护动画时长或样式。
 */
export default function useTransientRowHighlight({ duration = 900 } = {}) {
  const [highlightedKey, setHighlightedKey] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const highlightRow = useCallback((key) => {
    if (key === undefined || key === null || key === '') return;
    if (timerRef.current) window.clearTimeout(timerRef.current);

    setHighlightedKey(String(key));
    timerRef.current = window.setTimeout(() => {
      setHighlightedKey(null);
      timerRef.current = null;
    }, duration);
  }, [duration]);

  const getRowClassName = useCallback((record, rowKey = 'id') => {
    const key = typeof rowKey === 'function' ? rowKey(record) : record?.[rowKey];
    return String(key) === highlightedKey ? 'mmp-table-row-flash' : '';
  }, [highlightedKey]);

  return {
    highlightedKey,
    highlightRow,
    getRowClassName,
  };
}
