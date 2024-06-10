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
  return <Line {...config} />;
});

function formatTime(time: number): string {
  const mins = Math.floor(time / 600);
  const secs = Math.floor(time / 10) % 60;
  const ms = Math.floor(time % 10);

  if (secs < 10) return `${mins}:0${secs}.${ms}`;

  return `${mins}:${secs}.${ms}`;
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

export default memo(function Page() {
  const [theme] = useTheme();

  const now = useMemo(() => {
    return new Date().toISOString();
  }, []);

  const [machine, send] = useStateMachine(
    {
      initial: 'idle',
      verbose: __DEV__,
      states: {
        idle: {
          on: {
            start: {
              target: 'running'
            }
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
            start: {
              target: 'running'
            }
          }
        }
      }
    },
    { time: 0 }
  );

  return (
    <Paper>
      <div className={styles.chart}>
        <LineChart theme={theme} />
      </div>
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
              type="default"
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
              type="default"
              icon={<UndoOutlined />}
              onClick={() => send('reset')}
            />
          )}
        </div>
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
