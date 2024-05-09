/**
 * @module actions
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-header-actions';

export default createStyles(['components', 'Layout', 'ActionsHeader', prefixCls], token => {
  return {
    [`.${prefixCls}`]: {
      flex: 1,
      display: 'flex',
      gap: token.margin,
      overflow: 'hidden',
      placeItems: 'center',
      justifyContent: 'flex-end',

      '> *:hover': {
        color: token.colorPrimary
      },

      [`.${prefixCls}-profile`]: {
        display: 'flex',
        cursor: 'default',
        placeItems: 'center',
        gap: token.marginXXS
      }
    }
  };
});
