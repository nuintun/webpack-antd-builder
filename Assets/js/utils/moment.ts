/**
 * @module moment
 */

import dayjs from './dayjs';
import { isString } from './utils';
import weekday from 'dayjs/plugin/weekday';
import weekYear from 'dayjs/plugin/weekYear';
import isMoment from 'dayjs/plugin/isMoment';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import localeData from 'dayjs/plugin/localeData';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(weekday);
dayjs.extend(weekYear);
dayjs.extend(isMoment);
dayjs.extend(weekOfYear);
dayjs.extend(localeData);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

interface Locales {
  [key: string]: string;
}

const localeMap: Locales = {
  en_US: 'en',
  en_GB: 'en-gb',
  zh_CN: 'zh-cn',
  zh_TW: 'zh-tw'
};

function parseLocale(locale: string): string {
  const mapLocale = localeMap[locale];

  return mapLocale || locale.split('_')[0];
}

dayjs.extend<undefined>((_option, dayjsClass) => {
  const { locale: originLocale } = dayjsClass.prototype;

  dayjsClass.prototype.locale = function (locale: string): string {
    if (isString(locale)) {
      locale = parseLocale(locale);
    }

    return originLocale.call(this, locale);
  } as typeof originLocale;
});

export default dayjs;
