/**
 * @module 403
 */

import { Button, Result } from 'antd';
import { useNavigate } from 'react-nest-router';
import React, { memo, useCallback } from 'react';

const style: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  placeItems: 'center',
  placeContent: 'center'
};

export default memo(function Page(): React.ReactElement {
  const navigate = useNavigate();

  const onBackHome = useCallback(() => {
    navigate('/');
  }, []);

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
