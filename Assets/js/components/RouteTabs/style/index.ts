import { CSSInterpolation } from '@ant-design/cssinjs';
import { Render, Token, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-route-tabs';

function getRouteTabsStyle(token: Token): CSSInterpolation {
  const { fontSizeLG } = token;

  return {
    '.ui-component': {
      [`&.${prefixUI}`]: {
        backgroundColor: token.colorBgContainer,

        '> div': {
          margin: 0,
          padding: 0,

          '&:first-child': {
            padding: `0 ${token.paddingXS}px`
          }
        },

        [`.${prefixUI}-nav`]: {
          fontSize: fontSizeLG,
          color: token.colorLink,
          lineHeight: `${fontSizeLG}px`,

          '&.active': {
            color: token.colorLinkActive
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
      }
    }
  };
}

export default function useStyle(): Render {
  return useStyleSheets(['components', 'RouteTabs'], getRouteTabsStyle);
}
