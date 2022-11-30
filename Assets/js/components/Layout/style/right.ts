import { CSSInterpolation } from '@ant-design/cssinjs';
import { Render, Token, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-right-header';

function getRouteTabsStyle(token: Token): CSSInterpolation {
  return {
    [`.${prefixUI}`]: {
      display: 'flex',
      gap: token.margin,
      overflow: 'hidden',
      placeItems: 'center',
      fontSize: token.fontSizeLG,
      color: token.colorPrimaryText,

      ':hover': {
        color: token.colorPrimaryTextHover
      }
    }
  };
}

export default function useStyle(): Render {
  return useStyleSheets(['components', 'Layout', 'RightHeader'], getRouteTabsStyle);
}
