import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-menu';

export const headerBgDark = '#141414';
export const headerBgLight = '#001529';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const headerBg = token.Layout?.headerBg;

  return {
    [`.${prefixUI}-sider`]: {
      height: '100%',
      overflow: 'hidden',

      [`.${prefixUI}-header`]: {
        display: 'flex',
        overflow: 'hidden',
        placeItems: 'center',
        whiteSpace: 'nowrap',
        wordBreak: 'keep-all',
        color: token.colorPrimaryText,
        transition: `all ${token.motionDurationMid}`
      },

      [`&.${prefixUI}-dark`]: {
        [`.${prefixUI}-header`]: {
          backgroundColor: headerBg ?? headerBgDark
        }
      },

      [`&.${prefixUI}-light`]: {
        [`.${prefixUI}-header`]: {
          backgroundColor: headerBg ?? headerBgLight
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'FlexMenu', prefixUI], getFlexMenuStyle);
}
