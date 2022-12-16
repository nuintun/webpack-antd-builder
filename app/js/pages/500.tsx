import React, { memo, useCallback } from 'react';

import { Button, Result } from 'antd';
import { useNavigate } from 'react-nest-router';

const style: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  placeItems: 'center',
  placeContent: 'center'
};

export default memo(function Page(): React.ReactElement {
  const navigate = useNavigate();

  const onBackHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div style={style}>
      <Result
        title="500"
        status="500"
        subTitle="对不起，服务器无法提供正常服务！"
        extra={
          <Button type="primary" onClick={onBackHome}>
            返回首页
          </Button>
        }
      />
    </div>
  );
});
