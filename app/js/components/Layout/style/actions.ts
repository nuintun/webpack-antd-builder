import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-header-actions';

export default createStyles(['components', 'Layout', 'ActionsHeader', prefixUI], token => {
  return {
    [`.${prefixUI}`]: {
      flex: 1,
      display: 'flex',
      gap: token.margin,
      overflow: 'hidden',
      placeItems: 'center',
      justifyContent: 'flex-end',

      '> *:hover': {
        color: token.colorPrimary
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
