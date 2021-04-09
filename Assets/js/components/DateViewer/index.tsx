import React, { memo } from 'react';

import { format as formatDate, parseJSON as parseDate } from 'date-fns';

type HTMLSpanElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

export type DateViewerProps = HTMLSpanElementProps & {
  format?: string;
  value: string | number | Date;
  placeholder?: React.ReactNode;
};

export default memo(function DateViewer({
  value,
  placeholder = '无',
  format = 'yyyy-MM-dd HH:mm:ss',
  ...restProps
}: DateViewerProps): React.ReactElement | null {
  if (value == null) {
    if (placeholder != null) {
      return <span {...restProps}>{placeholder}</span>;
    }

    return null;
  }

  const date = parseDate(value);

  return <span {...restProps}>{formatDate(date, format)}</span>;
});
