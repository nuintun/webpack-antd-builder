/**
 * @module index
 */

import { memo } from 'react';
import { formatThousands } from '/js/utils/utils';

export interface NumericViewerProps {
  precision?: number;
  value: string | number | undefined;
}

export default memo(function NumericViewer({ value, precision }: NumericViewerProps) {
  return <>{formatThousands(value, precision)}</>;
});
