import React, { memo, useCallback } from 'react';

import { Button, Result } from 'antd';
import { useNavigate } from 'react-nest-router';

const style: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center'
};

export default memo(function Page(): React.ReactElement {
  const navigate = useNavigate();

  const onBackHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div style={style}>
      <Result
        title="403"
        status="403"
        subTitle="对不起，您无权访问的当前页面！"
        extra={
          <Button type="primary" onClick={onBackHome}>
            返回首页
          </Button>
        }
      />
    </div>
  );
});
