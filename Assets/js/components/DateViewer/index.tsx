import React, { memo } from 'react';

import dayjs, { ConfigType } from 'dayjs';

type HTMLSpanElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

export type DateViewerProps = HTMLSpanElementProps & {
  format?: string;
  value: ConfigType;
  placeholder?: React.ReactNode;
};

export default memo(function DateViewer({
  value,
  placeholder = '无',
  format = 'YYYY-MM-DD HH:mm:ss',
  ...restProps
}: DateViewerProps): React.ReactElement | null {
  if (value == null) {
    if (placeholder != null) {
      return <span {...restProps}>{placeholder}</span>;
    }

    return null;
  }

  return <span {...restProps}>{dayjs(value).format(format)}</span>;
});
