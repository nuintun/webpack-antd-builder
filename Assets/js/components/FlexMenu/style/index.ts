import { getBorderSize } from '../utils';
import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-menu';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const borderSize = getBorderSize(token);
  const borderSplit = `${borderSize}px ${token.lineType} ${token.colorSplit}`;

  return {
    '.ui-component': {
      [`&.${prefixUI}-sider`]: {
        height: '100%',
        overflow: 'hidden',

        [`.${prefixUI}-header`]: {
          display: 'flex',
          overflow: 'hidden',
          placeItems: 'center',
          whiteSpace: 'nowrap',
          wordBreak: 'keep-all',
          borderBlockEnd: borderSplit,
          color: token.colorPrimaryText
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'FlexMenu'], getFlexMenuStyle);
}
