import styles from '/css/pages/home/index.module.scss';

import { memo, useEffect, useMemo, useState } from 'react';

import { Line, LineConfig } from '@ant-design/plots';

const LineChart = memo(() => {
  const [data, setData] = useState<Record<string, number>[]>([]);

  const config = useMemo<LineConfig>(() => {
    return {
      data,
      xField: 'year',
      yField: 'value',
      xAxis: { type: 'time' },
      seriesField: 'category',
      yAxis: {
        label: {
          // 数值格式化为千分位
          formatter: v => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`)
        }
      }
    };
  }, [data]);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json')
      .then(response => response.json())
      .then((json: Record<string, number>[]) => setData(json))
      .catch((error: Error) => {
        console.error('fetch data failed', error);
      });
  }, []);

  return <Line {...config} />;
});

export default memo(function Page() {
  return (
    <div className={styles.main}>
      <div className={styles.chart}>
        <LineChart />
      </div>
    </div>
  );
});
