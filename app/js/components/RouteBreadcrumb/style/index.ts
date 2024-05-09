/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-route-breadcrumb';

export default createStyles(['components', 'RouteBreadcrumb', prefixCls], (token, { unit }) => {
  const { colorPrimary, fontSizeHeading2 } = token;

  return {
    [`.${prefixCls}`]: {
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
      padding: `0 ${unit(token.paddingXS)}`,
      backgroundColor: token.colorBgContainer,
      lineHeight: `${unit(fontSizeHeading2)}`,

      '&::-webkit-scrollbar': {
        display: 'none'
      },

      [`.${prefixCls}-link, .${prefixCls}-item`]: {
        display: 'flex',
        cursor: 'default',
        alignItems: 'center',

        [`.${prefixCls}-icon`]: {
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

      [`.${prefixCls}-link`]: {
        cursor: 'pointer',

        '&:hover': {
          color: colorPrimary
        }
      }
    }
  };
});
