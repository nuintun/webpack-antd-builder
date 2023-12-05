import { CSSInterpolation } from '@ant-design/cssinjs';
import { getBorderSize } from '/js/components/FlexMenu/utils';
import { headerBgDark, headerBgLight } from '/js/components/FlexMenu/style';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-layout';

function getFlexLayoutStyle(token: Token): CSSInterpolation {
  const borderSize = getBorderSize(token);
  const headerBg = token.Layout?.headerBg;

  return {
    [`.${prefixUI}`]: {
      height: '100%',
      overflow: 'hidden',

      [`.${prefixUI}-header`]: {
        padding: 0,
        display: 'flex',
        overflow: 'hidden',
        placeItems: 'center',
        fontSize: token.fontSizeXL,
        justifyContent: 'space-between',
        transition: `all ${token.motionDurationMid}`,
        borderBlockEnd: `${borderSize}px ${token.lineType} ${token.colorSplit}`,

        [`.${prefixUI}-trigger`]: {
          flex: 0,

          '&:hover': {
            color: token.colorPrimaryHover
          }
        },

        [`.${prefixUI}-header-right`]: {
          flex: 1,
          display: 'flex',
          gap: token.margin,
          placeItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${token.paddingXS}px`
        }
      },

      [`.${prefixUI}-content`]: {
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        color: token.colorText,
        msScrollChaining: 'none',
        scrollBehavior: 'smooth',
        OverscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        transition: `all ${token.motionDurationMid}`
      },

      [`&.${prefixUI}-dark`]: {
        [`.${prefixUI}-header`]: {
          color: token.colorTextLightSolid,
          backgroundColor: headerBg ?? headerBgDark
        }
      },

      [`&.${prefixUI}-light`]: {
        [`.${prefixUI}-header`]: {
          color: token.colorTextLightSolid,
          backgroundColor: headerBg ?? headerBgLight
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'FlexLayout', prefixUI], getFlexLayoutStyle);
}
