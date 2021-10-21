import 'antd/es/date-picker/style';

import { Dayjs } from 'dayjs';
import generatePicker, {
  PickerDateProps,
  PickerProps,
  RangePickerProps as BaseRangePickerProps
} from 'antd/es/date-picker/generatePicker';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';

import 'dayjs/locale/zh-cn';

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export default DatePicker;

export type DatePickerProps = PickerProps<Dayjs>;
export type RangePickerProps = BaseRangePickerProps<Dayjs>;
export type WeekPickerProps = Omit<PickerDateProps<Dayjs>, 'picker'>;
export type MonthPickerProps = Omit<PickerDateProps<Dayjs>, 'picker'>;
