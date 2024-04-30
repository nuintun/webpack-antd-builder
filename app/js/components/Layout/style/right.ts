import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-right-header';

export default createStyles(['components', 'Layout', 'RightHeader', prefixUI], token => {
  return {
    [`.${prefixUI}`]: {
      display: 'flex',
      gap: token.margin,
      overflow: 'hidden',
      placeItems: 'center',

      '> *:hover': {
        color: token.colorPrimaryTextHover
      },

      [`.${prefixUI}-profile`]: {
        display: 'flex',
        cursor: 'default',
        placeItems: 'center',
        gap: token.marginXXS
      }
    }
  };
});
