import 'antd/es/time-picker/style';

import { forwardRef } from 'react';

import { Dayjs } from 'dayjs';
import DatePicker from '/js/components/DatePicker';
import { PickerTimeProps, RangePickerTimeProps } from 'antd/es/date-picker/generatePicker';

const { TimePicker: InternalTimePicker, RangePicker: InternalRangePicker } = DatePicker;

export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

export interface TimeRangePickerProps extends Omit<RangePickerTimeProps<Dayjs>, 'picker' | 'mode'> {
  popupClassName?: string;
}

const RangePicker = forwardRef<any, TimeRangePickerProps>((props, ref) => (
  <InternalRangePicker {...props} ref={ref} picker="time" />
));

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {
  popupClassName?: string;
}

const TimePicker = forwardRef<any, TimePickerProps>(({ renderExtraFooter, ...restProps }, ref) => {
  return <InternalTimePicker {...restProps} ref={ref} renderExtraFooter={renderExtraFooter} />;
});

if (__DEV__) {
  TimePicker.displayName = 'TimePicker';
}

type MergedTimePicker = typeof TimePicker & {
  RangePicker: typeof RangePicker;
};

(TimePicker as MergedTimePicker).RangePicker = RangePicker;

export default TimePicker as MergedTimePicker;
