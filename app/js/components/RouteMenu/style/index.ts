import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-route-menu';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const { marginXXS, fontSizeLG } = token;
  const marginInline = token.Menu?.itemMarginInline ?? marginXXS;

  return {
    [`.${prefixUI}`]: {
      overflow: 'auto',
      userSelect: 'none',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      msScrollChaining: 'none',
      OverscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',

      '&::-webkit-scrollbar': {
        display: 'none'
      },

      [`.${prefixUI}-title`]: {
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        fontSize: fontSizeLG,
        textOverflow: 'ellipsis',
        lineHeight: `${fontSizeLG}px`,

        [`.${prefixUI}-icon`]: {
          lineHeight: 0,
          fontSize: fontSizeLG,

          '> img': {
            height: fontSizeLG
          },

          '+ span': {
            marginInlineStart: marginXXS
          }
        }
      },

      [`&.${prefixUI}-collapsed`]: {
        '[role=menuitem]': {
          paddingInline: `calc(50% - ${fontSizeLG / 2 + marginInline}px)`
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'RouteMenu', prefixUI], getFlexMenuStyle);
}
