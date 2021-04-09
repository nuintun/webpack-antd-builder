import 'antd/es/calendar/style';

import generateCalendar from 'antd/es/calendar/generateCalendar';
import dateFnsGenerateConfig from 'rc-picker/es/generate/dateFns';

const Calendar = generateCalendar<Date>(dateFnsGenerateConfig);

export default Calendar;
