import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';

dayjs.extend<undefined>((_option, dayjsClass) => {
  dayjsClass.prototype.toString = function (): string {
    return this.toISOString();
  };
});

export default dayjs;
