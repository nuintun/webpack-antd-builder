/**
 * @module date
 */

import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs, { ConfigType, Dayjs, ManipulateType, OpUnitType, QUnitType } from 'dayjs';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

export function isOutdated(compared: ConfigType): boolean {
  const target = dayjs(compared);

  return target.isBefore(dayjs().endOf('day'));
}

export function formatShortDate(date?: ConfigType): string {
  const now = dayjs();
  const target = dayjs(date);

  if (target.year() === now.year()) {
    return target.format('MM-DD');
  }

  return target.format('YYYY');
}

export function formatDate(date?: ConfigType, template = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(template);
}

export function fromDate(compared: ConfigType, withoutSuffix?: boolean): string {
  return dayjs().from(compared, withoutSuffix);
}

export function diffDate(compared: ConfigType, unit?: QUnitType | OpUnitType, float?: boolean): number {
  return dayjs().diff(compared, unit, float);
}

/**
 * @function getLastRangeDate
 * @description 获取当前时间向前指定偏移的时间区间
 * @param value 偏移值
 * @param unit 偏移单位
 */
export function getLastRangeDate(value: number, unit: ManipulateType = 'day'): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.subtract(value, unit), today];
}

/**
 * @function getThisRangeDate
 * @description 获取当前时间所在的指定范围日期区间
 * @param unit 指定范围
 * @param overflow 是否能超过当前时间
 */
export function getThisRangeDate(unit: OpUnitType = 'day', overflow: boolean = false): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.startOf(unit), overflow ? today.endOf(unit) : today];
}
