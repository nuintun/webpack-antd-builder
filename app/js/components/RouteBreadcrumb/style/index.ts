import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-route-breadcrumb';

export default createStyles(['components', 'RouteBreadcrumb', prefixUI], (token, { unit }) => {
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
      padding: `0 ${unit(token.paddingXS)}`,
      backgroundColor: token.colorBgContainer,
      lineHeight: `${unit(fontSizeHeading2)}`,

      '&::-webkit-scrollbar': {
        display: 'none'
      },

      [`.${prefixUI}-link, .${prefixUI}-item`]: {
        display: 'flex',
        cursor: 'default',
        alignItems: 'center',

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
});
