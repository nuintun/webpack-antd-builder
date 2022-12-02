import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-route-menu';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const { fontSizeLG } = token;

  return {
    '.ui-component': {
      [`&.${prefixUI}`]: {
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
          overflow: 'hidden',
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
              marginInlineStart: token.marginXXS
            }
          }
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'RouteMenu'], getFlexMenuStyle);
}
