/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-paper';

export default createStyles(['components', 'Paper', prefixCls], token => {
  return {
    [`.${prefixCls}`]: {
      margin: token.marginXS,
      padding: token.padding,
      minWidth: 'fit-content',
      minHeight: 'fit-content',
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer
    }
  };
});
