import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-header-logo';

export default createStyles(
  ['components', 'Layout', 'LogoHeader', prefixUI],
  token => {
    const layout = token.Layout;

    return {
      [`.${prefixUI}`]: {
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
            color: token.colorPrimary
          }
        }
      }
    };
  },
  ['Layout']
);
