/**
 * @module index
 */

import React, { memo } from 'react';

import { Spin, SpinProps } from 'antd';

export interface SuspenseFallBackProps extends Pick<SpinProps, 'delay'>, Pick<React.CSSProperties, 'width' | 'height'> {}

export default memo(function SuspenseFallBack({ delay = 128, width, height = 360 }: SuspenseFallBackProps): React.ReactElement {
  return (
    <Spin delay={delay}>
      <div style={{ width, height }} />
    </Spin>
  );
});
