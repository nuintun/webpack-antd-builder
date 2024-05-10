/**
 * @module logo
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-header-logo';

export default createStyles(
  ['components', 'Layout', 'LogoHeader', prefixCls],
  token => {
    const layout = token.Layout;

    return {
      [`.${prefixCls}`]: {
        display: 'flex',
        placeItems: 'center',

        img: {
          padding: 8,
          aspectRatio: '1/1',
          height: layout?.headerHeight ?? 64
        },

        span: {
          fontSize: 24,
          fontWeight: 'bold',
          color: layout?.headerColor ?? token.colorText,

          '&:hover': {
            color: layout?.colorPrimary ?? token.colorPrimary
          }
        }
      }
    };
  },
  ['Layout']
);
