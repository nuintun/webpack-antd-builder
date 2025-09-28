import * as styles from '/css/pages/home/index.module.scss';

import { Button } from 'antd';
import { memo, useMemo } from 'react';
import Paper from '/js/components/Paper';
import useTheme from '/js/hooks/useTheme';
import QRCode from '/js/components/QRCode';
import { Byte, Charset } from '@nuintun/qrcode';
import useStateMachine from '/js/hooks/useStateMachine';
import { PauseOutlined, PlayCircleOutlined, UndoOutlined } from '@ant-design/icons';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatTime(time: number): string {
  const secs = time % 60;
  const mins = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

function requestTicktock(callback: (...args: any[]) => void): () => void {
  let timerId: Timeout;

  const getInterval = () => {
    const now = new Date();

    return 1000 - now.getMilliseconds();
  };

  const ticktock = () => {
    callback();

    timerId = setTimeout(ticktock, getInterval());
  };

  timerId = setTimeout(ticktock, getInterval());

  return () => {
    clearTimeout(timerId);
  };
}

const Time = memo(function Time() {
  const [machine, send] = useStateMachine<
    // Context
    { time: number },
    // State
    'idle' | 'running' | 'paused',
    // Event
    'start' | 'pause' | 'reset'
  >(
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
            return requestTicktock(() => {
              update(({ time }) => ({ time: time + 1 }));
            });
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
    <Paper className={styles.paper}>
      <QRCode
        level="H"
        alt="QRCode"
        moduleSize={4}
        className={styles.qrcode}
        segments={new Byte(now, Charset.UTF_8)}
        foreground={theme === 'light' ? '#000' : '#fff'}
        background={theme === 'light' ? '#fff' : '#000'}
      />
      <Time />
    </Paper>
  );
});
