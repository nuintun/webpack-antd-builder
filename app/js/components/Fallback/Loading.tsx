/**
 * @module Loading
 */

import React, { memo } from 'react';
import { Spin, SpinProps } from 'antd';

export interface LoadingFallbackProps extends Pick<SpinProps, 'delay'>, Pick<React.CSSProperties, 'width' | 'height'> {}

export default memo(function LoadingFallback({ delay = 128, width, height = 360 }: LoadingFallbackProps) {
  return (
    <Spin delay={delay}>
      <div style={{ width, height }} />
    </Spin>
  );
});
