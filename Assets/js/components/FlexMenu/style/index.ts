import { getBorderSize } from '../useBorderSize';
import { CSSInterpolation } from '@ant-design/cssinjs';
import { Render, Token, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-menu';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const { fontSizeLG } = token;
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
        },

        [`.${prefixUI}`]: {
          overflow: 'auto',
          userSelect: 'none',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          msScrollChaining: 'none',
          OverscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',

          [`&.${prefixUI}-border`]: {
            borderInlineEnd: borderSplit
          },

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
    }
  };
}

export default function useStyle(): Render {
  return useStyleSheets(['components', 'FlexMenu'], getFlexMenuStyle);
}
