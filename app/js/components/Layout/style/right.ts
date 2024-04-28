import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-right-header';

function getRightHeaderStyle(token: Token): CSSInterpolation {
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
        placeItems: 'center',
        gap: token.marginXXS
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'Layout', 'RightHeader', prefixUI], getRightHeaderStyle);
}
