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
  placeholder,
  format = 'YYYY-MM-DD HH:mm:ss',
  ...restProps
}: DateViewerProps): React.ReactElement | null {
  const date = dayjs(value);

  if (date.isValid()) {
    return <span {...restProps}>{date.format(format)}</span>;
  }

  if (placeholder) {
    return <span {...restProps}>{placeholder}</span>;
  }

  return null;
});
