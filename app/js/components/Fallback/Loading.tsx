/**
 * @module Loading
 */

import { Spin } from 'antd';
import React, { memo } from 'react';

export interface LoadingFallbackProps extends Pick<React.CSSProperties, 'width' | 'height'> {
  delay?: number;
}

export default memo(function LoadingFallback({ delay = 128, width, height = 360 }: LoadingFallbackProps) {
  return (
    <Spin delay={delay}>
      <div style={{ width, height }} />
    </Spin>
  );
});
