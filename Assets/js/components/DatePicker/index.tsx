import 'antd/es/date-picker/style';

import generatePicker from 'antd/es/date-picker/generatePicker';
import dateFnsGenerateConfig from 'rc-picker/es/generate/dateFns';

const DatePicker = generatePicker<Date>(dateFnsGenerateConfig);

export default DatePicker;
