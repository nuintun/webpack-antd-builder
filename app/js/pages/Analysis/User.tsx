import Paper from '/js/components/Paper';
import { memo, useCallback, useState } from 'react';
import useAction from '/js/hooks/useAction';
import { Button, ButtonProps, GetProp, Select, SelectProps, Space } from 'antd';

export default memo(function Page() {
  const [value, setValue] = useState(0);
  const [loading1, onAction1, render1] = useAction('/api/analysis/user', {
    confirm: '确认进行删除吗？'
  });

  const [loading2, onAction2, render2] = useAction<{ gender: number }, null>('/api/analysis/user', {
    confirm: '确认进行删除吗？',
    onSuccess(_response, values) {
      setValue(values.gender);
    }
  });

  const onClick = useCallback<GetProp<ButtonProps, 'onClick'>>(() => {
    onAction1(null);
  }, []);

  const onChange = useCallback<GetProp<SelectProps<number>, 'onChange'>>(value => {
    onAction2({ gender: value });
  }, []);

  console.log('render', loading1, loading2);

  return (
    <Paper>
      <p>用户分析</p>
      <p>用户分析</p>
      <p>用户分析</p>
      <Space>
        {render1(
          <Button danger type="primary" loading={loading1} onClick={onClick}>
            删除
          </Button>
        )}
        {render2(
          <Select
            value={value}
            loading={loading2}
            onChange={onChange}
            options={[
              { label: '保密', value: 0 },
              { label: '男性', value: 1 },
              { label: '女性', value: 2 }
            ]}
          />
        )}
      </Space>
    </Paper>
  );
});
