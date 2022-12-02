import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-right-header';

function getRouteTabsStyle(token: Token): CSSInterpolation {
  return {
    [`.${prefixUI}`]: {
      display: 'flex',
      gap: token.margin,
      overflow: 'hidden',
      placeItems: 'center',

      '> *:hover': {
        color: token.colorPrimaryTextHover
      },

      [`.${prefixUI}-profile`]: {
        display: 'flex',
        cursor: 'default',
        gap: token.marginXXS,
        placeItems: 'center'
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'Layout', 'RightHeader'], getRouteTabsStyle);
}
