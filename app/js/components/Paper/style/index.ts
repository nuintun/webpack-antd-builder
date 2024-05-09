/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-paper';

export default createStyles(['components', 'Paper', prefixUI], (token, { calc }) => {
  return {
    [`.${prefixUI}`]: {
      margin: token.marginXS,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer,
      padding: calc(token.paddingXS).mul(2).equal()
    }
  };
});
