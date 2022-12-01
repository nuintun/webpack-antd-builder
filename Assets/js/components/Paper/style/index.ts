import { CSSInterpolation } from '@ant-design/cssinjs';
import { Render, Token, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-paper';

function getRoutePaperStyle(token: Token): CSSInterpolation {
  return {
    [`.${prefixUI}`]: {
      margin: token.marginXS,
      padding: token.paddingXS * 2,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer
    }
  };
}

export default function useStyle(): Render {
  return useStyleSheets(['components', 'Paper'], getRoutePaperStyle);
}
