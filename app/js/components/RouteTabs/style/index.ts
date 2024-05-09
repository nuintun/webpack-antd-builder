/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-route-tabs';

export default createStyles(['components', 'RouteTabs', prefixCls], (token, { calc, unit }) => {
  const { fontSizeLG } = token;

  return {
    [`.${prefixCls}`]: {
      marginBlockStart: -1,
      borderBlockStart: `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}`,

      '> [role=tablist]': {
        margin: 0,
        paddingBlock: 0,
        backgroundColor: token.colorBgContainer,
        paddingInline: calc(token.paddingXS).mul(2).equal(),

        '&::before': {
          display: 'none'
        }
      },

      [`.${prefixCls}-nav`]: {
        color: 'inherit',
        fontSize: fontSizeLG,
        lineHeight: unit(fontSizeLG),

        [`&:hover, &.${prefixCls}-active`]: {
          color: 'inherit'
        },

        [`.${prefixCls}-icon`]: {
          margin: 'unset',
          marginInlineEnd: token.marginXXS,

          '> img': {
            width: 'auto',
            height: fontSizeLG
          }
        }
      }
    },

    [`.${prefixCls}-vertical`]: {
      '> [role=tablist]': {
        paddingInline: 0,
        borderBlockStart: 'none',
        paddingBlock: token.paddingXS
      }
    }
  };
});
