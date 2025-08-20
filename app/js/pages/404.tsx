/**
 * @module 404
 */

import { Button, Result } from 'antd';
import useTitle from '/js/hooks/useTitle';
import { useNavigate } from 'react-nest-router';
import React, { memo, useCallback } from 'react';

const style: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  placeItems: 'center',
  placeContent: 'center'
};

export default memo(function Page(): React.ReactElement {
  useTitle('404');

  const navigate = useNavigate();

  const onBackHome = useCallback(() => {
    navigate('/');
  }, []);

  return (
    <div style={style}>
      <Result
        title="404"
        status="404"
        subTitle="对不起，您访问的页面不存在！"
        extra={
          <Button type="primary" onClick={onBackHome}>
            返回首页
          </Button>
        }
      />
    </div>
  );
});
