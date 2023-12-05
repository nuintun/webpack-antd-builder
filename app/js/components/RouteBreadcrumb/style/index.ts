import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-route-breadcrumb';

function getRouteBreadcrumbStyle(token: Token): CSSInterpolation {
  const { colorPrimary, fontSizeHeading2 } = token;

  return {
    [`.${prefixUI}`]: {
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
      color: token.colorText,
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      fontSize: token.fontSize,
      height: fontSizeHeading2,
      msScrollChaining: 'none',
      OverscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
      padding: `0 ${token.paddingXS}px`,
      lineHeight: `${fontSizeHeading2}px`,
      backgroundColor: token.colorBgContainer,

      '&::-webkit-scrollbar': {
        display: 'none'
      },

      [`.${prefixUI}-link, .${prefixUI}-item`]: {
        cursor: 'default',

        [`.${prefixUI}-icon`]: {
          marginInlineEnd: token.marginXXS,

          '> img': {
            width: 'auto',
            height: fontSizeHeading2
          }
        },

        '&.active': {
          color: colorPrimary
        }
      },

      [`.${prefixUI}-link`]: {
        cursor: 'pointer',

        '&:hover': {
          color: colorPrimary
        }
      }
    }
  };
}

export default function useStyle(): UseStyleSheets {
  return useStyleSheets(['components', 'RouteBreadcrumb', prefixUI], getRouteBreadcrumbStyle);
}
