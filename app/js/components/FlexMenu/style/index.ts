import { CSSInterpolation } from '@ant-design/cssinjs';
import { getBorderSize } from '/js/components/FlexMenu/utils';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-menu';

export const headerBgDark = '#141414';
export const headerBgLight = '#001529';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const borderSize = getBorderSize(token);
  const headerBg = token.Layout?.headerBg;

  return {
    [`.${prefixUI}-sider`]: {
      height: '100%',
      overflow: 'hidden',

      '> div': {
        height: '100%',
        marginTop: -0.1,
        paddingTop: 0.1
      },

      [`.${prefixUI}-header`]: {
        display: 'flex',
        overflow: 'hidden',
        placeItems: 'center',
        whiteSpace: 'nowrap',
        wordBreak: 'keep-all',
        color: token.colorPrimaryText,
        transition: `all ${token.motionDurationMid}`,
        borderInlineEnd: `${borderSize}px ${token.lineType} transparent`,
        borderBlockEnd: `${borderSize}px ${token.lineType} ${token.colorSplit}`
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
    },

    [`.${prefixUI}-drawer`]: {
      [`.${prefixUI}-sider`]: {
        [`.${prefixUI}-header`]: {
          borderInlineColor: token.colorSplit
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'FlexMenu', prefixUI], getFlexMenuStyle);
}
