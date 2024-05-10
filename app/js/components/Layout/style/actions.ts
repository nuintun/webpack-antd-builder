/**
 * @module actions
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-header-actions';

export default createStyles(
  ['components', 'Layout', 'ActionsHeader', prefixCls],
  token => {
    const layout = token.Layout;

    return {
      [`.${prefixCls}`]: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        placeItems: 'center',
        justifyContent: 'flex-end',
        gap: layout?.margin ?? token.margin,

        '> *:hover': {
          color: layout?.colorPrimary ?? token.colorPrimary
        },

        [`.${prefixCls}-profile`]: {
          display: 'flex',
          cursor: 'default',
          placeItems: 'center',
          gap: layout?.marginXXS ?? token.marginXXS
        }
      }
    };
  },
  ['Layout']
);
