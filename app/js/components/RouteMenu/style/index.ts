/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-route-menu';

export default createStyles(
  ['components', 'RouteMenu', prefixCls],
  token => {
    const menu = token.Menu;
    const { fontSize, fontSizeLG } = token;
    const iconSize = menu?.iconSize ?? fontSize;
    const collapsedIconSize = menu?.collapsedIconSize ?? fontSizeLG;

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

        [`&.${prefixCls}-collapsed`]: {
          [`.${prefixCls}-icon`]: {
            '> img': {
              height: collapsedIconSize
            }
          }
        }
      },

      [`.${prefixCls},
        .${prefixCls}-popup`]: {
        [`.${prefixCls}-item`]: {
          [`.${prefixCls}-icon`]: {
            '> img': {
              height: iconSize
            }
          }
        }
      }
    };
  },
  ['Menu']
);
