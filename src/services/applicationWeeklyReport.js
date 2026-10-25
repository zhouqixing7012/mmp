import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import * as XLSX from 'xlsx';
import { queryApplications, formatApplicationValue } from './applicationQueryService';
import { unfinishedDefinition } from '../pages/applicationQueries/unfinishedDefinition';
import { DEFAULT_APPLICATION_ACCESS } from './applicationAccess';

dayjs.extend(utc);
dayjs.extend(timezone);

export const APPLICATION_WEEKLY_RULE = Object.freeze({ weekday: 1, time: '10:00', timezone: 'Asia/Shanghai', channel: '服务号', recipients: Object.freeze(['ES-何文']) });
// 生成符合业务通知策略的周报材料；此前端方法不执行真实定时投递。
export function prepareApplicationWeeklyReport(date, access = DEFAULT_APPLICATION_ACCESS) {
  if (!dayjs(date).isValid()) throw new Error('周报日期无效');
  const businessDate = dayjs(date).tz(APPLICATION_WEEKLY_RULE.timezone);
  if (businessDate.day() !== APPLICATION_WEEKLY_RULE.weekday) throw new Error('未完成员工申请周报在每周一生成');
  const rows = queryApplications('unfinished', {}, null, access).filter(row => row.employeeApplication === true);
  const definition = { date: businessDate.format('YYYY-MM-DD'), time: APPLICATION_WEEKLY_RULE.time, timezone: APPLICATION_WEEKLY_RULE.timezone, channel: APPLICATION_WEEKLY_RULE.channel, recipients: [...APPLICATION_WEEKLY_RULE.recipients], rows, sent: false };
  const columns = unfinishedDefinition.exportColumns;
  const sheet = XLSX.utils.aoa_to_sheet([columns.map(column => column.label), ...rows.map(row => columns.map(column => formatApplicationValue(row.values[column.key], column.format)))]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, '未完成员工申请');
  return { ...definition, workbook };
}
