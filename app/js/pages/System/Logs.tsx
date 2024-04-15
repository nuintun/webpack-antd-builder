import { memo } from 'react';

import Paper from '/js/components/Paper';
import QRCode from '/js/components/QRCode';
import { Byte, Charset } from '@nuintun/qrcode';

export default memo(function Page() {
  return (
    <Paper>
      <p>安全日志</p>
      <QRCode level="H" moduleSize={4} segments={new Byte('安全日志', Charset.UTF_8)} />
    </Paper>
  );
});
