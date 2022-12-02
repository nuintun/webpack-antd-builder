import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-route-tabs';

function getRouteTabsStyle(token: Token): CSSInterpolation {
  const { fontSizeLG } = token;

  return {
    '.ui-component': {
      [`&.${prefixUI}`]: {
        marginBlockStart: -1,
        borderBlockStart: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,

        '> [role=tablist]': {
          margin: 0,
          paddingBlock: 0,
          paddingInline: token.paddingXS * 2,
          backgroundColor: token.colorBgContainer,

          '&::before': {
            display: 'none'
          }
        },

        [`.${prefixUI}-nav`]: {
          fontSize: fontSizeLG,
          color: 'inherit',
          lineHeight: `${fontSizeLG}px`,

          [`&:hover, &.${prefixUI}-active`]: {
            color: 'inherit'
          },

          [`.${prefixUI}-icon`]: {
            margin: 'unset',
            marginInlineEnd: token.marginXXS,

            '> img': {
              width: 'auto',
              height: fontSizeLG
            }
          }
        }
      },

      [`.${prefixUI}-vertical`]: {
        '> [role=tablist]': {
          paddingInline: 0,
          borderBlockStart: 'none',
          paddingBlock: token.paddingXS
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'RouteTabs'], getRouteTabsStyle);
}
