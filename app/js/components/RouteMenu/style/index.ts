import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-route-menu';

export default createStyles(
  ['components', 'RouteMenu', prefixUI],
  (token, { calc, unit }) => {
    const { marginXXS, fontSizeLG } = token;
    const marginInline = token.Menu?.itemMarginInline ?? marginXXS;

    return {
      [`.${prefixUI}`]: {
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

        [`.${prefixUI}-submenu, .${prefixUI}-item`]: {
          [`.${prefixUI}-title`]: {
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            fontSize: fontSizeLG,
            textOverflow: 'ellipsis',

            [`.${prefixUI}-icon`]: {
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

        [`&.${prefixUI}-collapsed`]: {
          '[role=menuitem]': {
            paddingInline: `calc(50% - ${unit(calc(fontSizeLG).div(2).add(marginInline).equal())})`
          }
        }
      }
    };
  },
  ['Menu']
);
