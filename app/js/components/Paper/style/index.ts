import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

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

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'Paper', prefixUI], getRoutePaperStyle);
}
