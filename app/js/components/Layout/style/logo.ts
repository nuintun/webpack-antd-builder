import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-header-logo';

export default createStyles(
  ['components', 'Layout', 'LogoHeader', prefixUI],
  token => {
    const layout = token.Layout;
    const headerHeight = layout?.headerHeight ?? 64;

    return {
      [`.${prefixUI}`]: {
        display: 'flex',
        placeItems: 'center',

        img: {
          padding: 8,
          aspectRatio: '1/1',
          height: headerHeight
        },

        span: {
          fontSize: 24,
          fontWeight: 'bold'
        }
      }
    };
  },
  ['Layout']
);
