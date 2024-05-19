import * as styles from '/css/pages/home/index.module.scss';

import { memo, useMemo } from 'react';
import Paper from '/js/components/Paper';
import QRCode from '/js/components/QRCode';
import { Byte, Charset } from '@nuintun/qrcode';
import useTheme, { Theme } from '/js/hooks/useTheme';
import { Line, LineConfig } from '@ant-design/plots';

interface LineChartProps {
  theme: Theme;
}

const LineChart = memo(({ theme }: LineChartProps) => {
  const config = useMemo<LineConfig>(() => {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];

    return {
      data,
      theme,
      autoFit: true,
      xField: 'year',
      yField: 'value',
      style: {
        lineWidth: 2
      },
      interaction: {
        tooltip: {
          marker: false
        }
      },
      animate: {
        enter: {
          type: 'pathIn'
        },
        update: {
          type: 'morphing'
        }
      },
      point: {
        sizeField: 4,
        shapeField: 'square'
      }
    };
  }, [theme]);
  return <Line {...config} />;
});

export default memo(function Page() {
  const [theme] = useTheme();

  const now = useMemo(() => {
    return new Date().toISOString();
  }, []);

  return (
    <Paper>
      <div className={styles.chart}>
        <LineChart theme={theme} />
      </div>
      <QRCode
        level="H"
        moduleSize={4}
        className={styles.qrcode}
        segments={new Byte(now, Charset.UTF_8)}
        foreground={theme === 'light' ? '#000' : '#fff'}
        background={theme === 'light' ? '#fff' : '#000'}
      />
    </Paper>
  );
});
