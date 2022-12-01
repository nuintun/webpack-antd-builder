import { CSSInterpolation } from '@ant-design/cssinjs';
import { getBorderSize } from '/js/components/FlexMenu/useBorderSize';
import { Render, Token, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-layout';

function getFlexLayoutStyle(token: Token): CSSInterpolation {
  const borderSize = getBorderSize(token);
  const colorBgHeader = token.Layout?.colorBgHeader;
  const borderSplit = `${borderSize}px ${token.lineType} ${token.colorSplit}`;

  return {
    '.ui-component': {
      [`&.${prefixUI}`]: {
        height: '100%',
        overflow: 'hidden',

        [`.${prefixUI}-header`]: {
          padding: 0,
          display: 'flex',
          overflow: 'hidden',
          placeItems: 'center',
          borderBlockEnd: borderSplit,
          justifyContent: 'space-between',

          [`.${prefixUI}-trigger`]: {
            flex: 0,
            cursor: 'pointer',
            fontSize: token.fontSizeXL,
            color: token.colorPrimaryText,

            ':hover': {
              color: token.colorPrimaryTextHover
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
          WebkitOverflowScrolling: 'touch'
        },

        [`&.${prefixUI}-dark`]: {
          [`.${prefixUI}-header`]: {
            backgroundColor: colorBgHeader ?? '#001529'
          }
        },

        [`&.${prefixUI}-light`]: {
          [`.${prefixUI}-header`]: {
            backgroundColor: colorBgHeader ?? token.colorBgContainer
          }
        }
      }
    }
  };
}

export default function useStyle(): Render {
  return useStyleSheets(['components', 'FlexLayout'], getFlexLayoutStyle);
}