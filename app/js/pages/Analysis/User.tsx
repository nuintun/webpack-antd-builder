import Paper from '/js/components/Paper';
import { memo, useCallback } from 'react';
import useAction from '/js/hooks/useAction';
import { Button, ButtonProps, GetProp } from 'antd';

export default memo(function Page() {
  const [loading, onAction, render] = useAction('/api/analysis/user');

  const onClick = useCallback<GetProp<ButtonProps, 'onClick'>>(e => {
    e.stopPropagation();

    onAction(null);
  }, []);

  console.log('render', loading);

  return (
    <Paper>
      <p>用户分析</p>
      <div>
        {render(
          <Button type="primary" loading={loading} onClick={onClick}>
            useAction
          </Button>
        )}
      </div>
    </Paper>
  );
});
