/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-route-menu';

export default createStyles(
  ['components', 'RouteMenu', prefixCls],
  (token, { calc, unit }) => {
    const { marginXXS, fontSizeLG } = token;
    const marginInline = token.Menu?.itemMarginInline ?? marginXXS;

    return {
      [`.${prefixCls}`]: {
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

        [`.${prefixCls}-submenu, .${prefixCls}-item`]: {
          [`.${prefixCls}-title`]: {
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            fontSize: fontSizeLG,
            textOverflow: 'ellipsis',

            [`.${prefixCls}-icon`]: {
              lineHeight: 0,
              fontSize: fontSizeLG,

              '> img': {
                height: fontSizeLG
              },

              '+ span': {
                marginInlineStart: marginXXS
              }
            }
          }
        },

        [`&.${prefixCls}-collapsed`]: {
          '[role=menuitem]': {
            paddingInline: `calc(50% - ${unit(calc(fontSizeLG).div(2).add(marginInline).equal())})`
          }
        }
      }
    };
  },
  ['Menu']
);
