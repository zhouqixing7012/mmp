import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { queryApplications, formatApplicationValue } from './applicationQueryService';
import { unfinishedDefinition } from '../pages/applicationQueries/unfinishedDefinition';
import { DEFAULT_APPLICATION_ACCESS } from './applicationAccess';

export const APPLICATION_WEEKLY_RULE = Object.freeze({ weekday: 1, recipients: Object.freeze(['杨芊', '王英', '孙志强', '刘建', '何文']) });
// 生成周报材料，不冒充已配置的任务或发送结果；发送渠道和时刻由正式任务配置提供。
export function prepareApplicationWeeklyReport(date, access = DEFAULT_APPLICATION_ACCESS) {
  if (!dayjs(date).isValid()) throw new Error('周报日期无效');
  if (dayjs(date).day() !== APPLICATION_WEEKLY_RULE.weekday) throw new Error('未完成员工申请周报在每周一生成');
  const rows = queryApplications('unfinished', {}, null, access).filter(row => row.employeeApplication === true);
  const definition = { date: dayjs(date).format('YYYY-MM-DD'), recipients: [...APPLICATION_WEEKLY_RULE.recipients], rows, sent: false };
  const columns = unfinishedDefinition.exportColumns;
  const sheet = XLSX.utils.aoa_to_sheet([columns.map(column => column.label), ...rows.map(row => columns.map(column => formatApplicationValue(row.values[column.key], column.format)))]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, '未完成员工申请');
  return { ...definition, workbook };
}
