import 'antd/es/calendar/style';

import 'dayjs/locale/zh-cn';

import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import generateCalendar from 'antd/es/calendar/generateCalendar';

const Calendar = generateCalendar<Dayjs>(dayjsGenerateConfig);

export default Calendar;
