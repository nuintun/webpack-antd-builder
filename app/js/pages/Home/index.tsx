import * as styles from '/css/pages/home/index.module.scss';

import Paper from '/js/components/Paper';
import { Line, LineConfig } from '@ant-design/plots';
import { memo, useEffect, useMemo, useState } from 'react';

interface LineItem {
  year: string;
  value: number;
  category: string;
}

const LineChart = memo(() => {
  const [data, setData] = useState<LineItem[]>([]);

  const config = useMemo<LineConfig>(() => {
    return {
      data,
      xField: 'year',
      yField: 'value',
      xAxis: { type: 'time' },
      seriesField: 'category',
      tooltip: {
        // 数值格式化为千分位
        formatter(data) {
          const { category, value } = data as LineItem;

          return {
            name: category,
            value: `${value}`.replace(/\d{1,3}(?=(\d{3})+$)/g, matched => `${matched},`)
          };
        }
      },
      yAxis: {
        label: {
          // 数值格式化为千分位
          formatter(value: string) {
            return `${value}`.replace(/\d{1,3}(?=(\d{3})+$)/g, matched => `${matched},`);
          }
        }
      }
    };
  }, [data]);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json')
      .then(response => response.json())
      .then((json: LineItem[]) => {
        setData(json);
      })
      .catch((error: Error) => {
        console.error('fetch data failed', error);
      });
  }, []);

  return <Line {...config} />;
});

export default memo(function Page() {
  return (
    <Paper>
      <div className={styles.main}>
        <div className={styles.chart}>
          <LineChart />
        </div>
      </div>
    </Paper>
  );
});
