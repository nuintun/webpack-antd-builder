import { getBorderSize } from '../utils';
import { CSSInterpolation } from '@ant-design/cssinjs';
import { Token, UseStyleSheets, useStyleSheets } from '/js/hooks/useStyleSheets';

export const prefixUI = 'ui-flex-menu';

export const colorDarkBgHeader = '#001529';

function getFlexMenuStyle(token: Token): CSSInterpolation {
  const borderSize = getBorderSize(token);
  const colorBgHeader = token.Layout?.colorBgHeader;

  return {
    '.ui-component': {
      [`&.${prefixUI}-sider`]: {
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
            backgroundColor: colorBgHeader ?? colorDarkBgHeader
          }
        },

        [`&.${prefixUI}-light`]: {
          [`.${prefixUI}-header`]: {
            backgroundColor: colorBgHeader ?? token.colorBgContainer
          }
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
  return useStyleSheets(['components', 'FlexMenu'], getFlexMenuStyle);
}
