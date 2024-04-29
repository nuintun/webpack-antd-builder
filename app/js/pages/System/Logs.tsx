import { memo, useMemo } from 'react';
import Paper from '/js/components/Paper';
import QRCode from '/js/components/QRCode';
import { Byte, Charset } from '@nuintun/qrcode';

export default memo(function Page() {
  const now = useMemo(() => {
    return new Date().toISOString();
  }, []);

  return (
    <Paper>
      <p>安全日志</p>
      <QRCode level="H" moduleSize={4} segments={new Byte(now, Charset.UTF_8)} />
    </Paper>
  );
});
