/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-paper';

export default createStyles(['components', 'Paper', prefixCls], (token, { calc }) => {
  return {
    [`.${prefixCls}`]: {
      margin: token.marginXS,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer,
      padding: calc(token.paddingXS).mul(2).equal()
    }
  };
});
