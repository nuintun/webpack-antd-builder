/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-route-breadcrumb';

export default createStyles(
  ['components', 'RouteBreadcrumb', prefixCls],
  (token, { unit }) => {
    const breadcrumb = token.Breadcrumb;
    const colorPrimary = breadcrumb?.colorPrimary ?? token.colorPrimary;
    const fontSizeHeading2 = breadcrumb?.fontSizeHeading2 ?? token.fontSizeHeading2;

    return {
      [`.${prefixCls}`]: {
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        color: token.colorText,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        height: fontSizeHeading2,
        msScrollChaining: 'none',
        OverscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: token.colorBgContainer,
        lineHeight: `${unit(fontSizeHeading2)}`,
        fontSize: breadcrumb?.fontSize ?? token.fontSize,
        padding: `0 ${unit(breadcrumb?.paddingXS ?? token.paddingXS)}`,

        '&::-webkit-scrollbar': {
          display: 'none'
        },

        [`.${prefixCls}-link,
          .${prefixCls}-item`]: {
          display: 'flex',
          cursor: 'default',
          alignItems: 'center',

          [`.${prefixCls}-icon`]: {
            marginInlineEnd: breadcrumb?.marginXXS ?? token.marginXXS,

            '> img': {
              width: 'auto',
              height: fontSizeHeading2
            }
          },

          '&.active': {
            color: colorPrimary
          }
        },

        [`.${prefixCls}-link`]: {
          cursor: 'pointer',

          '&:hover': {
            color: colorPrimary
          }
        }
      }
    };
  },
  ['Breadcrumb']
);
