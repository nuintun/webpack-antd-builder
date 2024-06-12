import * as styles from '/css/pages/home/index.module.scss';

import { Button } from 'antd';
import { memo, useMemo } from 'react';
import Paper from '/js/components/Paper';
import QRCode from '/js/components/QRCode';
import { Byte, Charset } from '@nuintun/qrcode';
import useTheme, { Theme } from '/js/hooks/useTheme';
import { Line, LineConfig } from '@ant-design/plots';
import useStateMachine from '/js/hooks/useStateMachine';
import { PauseOutlined, PlayCircleOutlined, UndoOutlined } from '@ant-design/icons';

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

  return (
    <div className={styles.chart}>
      <Line {...config} />
    </div>
  );
});

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatTime(time: number): string {
  const secs = time % 60;
  const mins = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

function requestInterval(callback: (...args: any[]) => void, interval: number): () => void {
  let timerId: number;
  let start = Date.now();

  const frame = () => {
    const now = Date.now();
    const elapsed = now - start;

    if (elapsed >= interval) {
      callback();
      start = Date.now();
    }

    timerId = requestAnimationFrame(frame);
  };

  timerId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(timerId);
  };
}

const Time = memo(function Time() {
  const [machine, send] = useStateMachine(
    {
      initial: 'idle',
      verbose: __DEV__,
      states: {
        idle: {
          on: {
            start: 'running'
          },
          effect(_, update) {
            update({ time: 0 });
          }
        },
        running: {
          on: {
            pause: 'paused'
          },
          effect(_, update) {
            return requestInterval(() => {
              update(({ time }) => ({ time: time + 1 }));
            }, 1000);
          }
        },
        paused: {
          on: {
            reset: 'idle',
            start: 'running'
          }
        }
      }
    },
    { time: 0 }
  );

  return (
    <div className={styles.machine}>
      <div className={styles.display}>{formatTime(machine.context.time)}</div>
      <div className={styles.controls}>
        {machine.nextEvents.includes('start') && (
          <Button
            title="开始"
            size="large"
            shape="circle"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => send('start')}
          />
        )}
        {machine.nextEvents.includes('pause') && (
          <Button
            title="暂停"
            size="large"
            shape="circle"
            type="primary"
            icon={<PauseOutlined />}
            onClick={() => send('pause')}
          />
        )}
        {machine.nextEvents.includes('reset') && (
          <Button
            danger
            title="重置"
            size="large"
            shape="circle"
            type="primary"
            icon={<UndoOutlined />}
            onClick={() => send('reset')}
          />
        )}
      </div>
    </div>
  );
});

export default memo(function Page() {
  const [theme] = useTheme();

  const now = useMemo(() => {
    return new Date().toISOString();
  }, []);

  return (
    <Paper>
      <LineChart theme={theme} />
      <Time />
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
