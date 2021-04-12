import 'antd/es/time-picker/style';

import * as React from 'react';

import { Dayjs } from 'dayjs';
import DatePicker from '../DatePicker';
import { PickerTimeProps, RangePickerTimeProps } from 'antd/es/date-picker/generatePicker';

const { TimePicker: InternalTimePicker, RangePicker: InternalRangePicker } = DatePicker;

export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

export interface TimeRangePickerProps extends Omit<RangePickerTimeProps<Dayjs>, 'picker' | 'mode'> {
  popupClassName?: string;
}

const RangePicker = React.forwardRef<any, TimeRangePickerProps>(({ popupClassName, ...restProps }, ref) => (
  <InternalRangePicker {...restProps} dropdownClassName={popupClassName} ref={ref} picker="time" />
));

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {
  popupClassName?: string;
}

const TimePicker = React.forwardRef<any, TimePickerProps>(({ renderExtraFooter, popupClassName, ...restProps }, ref) => {
  const internalRenderExtraFooter = React.useMemo(() => {
    return renderExtraFooter;
  }, [renderExtraFooter]);

  return (
    <InternalTimePicker
      {...restProps}
      ref={ref}
      dropdownClassName={popupClassName}
      renderExtraFooter={internalRenderExtraFooter}
    />
  );
});

if (__DEV__) {
  TimePicker.displayName = 'TimePicker';
}

type MergedTimePicker = typeof TimePicker & {
  RangePicker: typeof RangePicker;
};

(TimePicker as MergedTimePicker).RangePicker = RangePicker;

export default TimePicker as MergedTimePicker;
