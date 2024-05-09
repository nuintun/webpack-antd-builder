/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-image-upload';

export default createStyles(['components', 'ImageUpload', prefixCls], token => {
  return {
    [`.${prefixCls}`]: {
      gap: 8,
      alignItems: 'center',
      display: 'inline-flex',
      justifyContent: 'flex-start',

      [`.${prefixCls}-icon`]: {
        fontSize: 18
      },

      [`.${prefixCls}-done, .${prefixCls}-error, .${prefixCls}-action, .${prefixCls}-loading`]: {
        gap: 8,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        alignItems: 'center',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'transparent',
        borderRadius: token.borderRadius
      },

      [`.${prefixCls}-done`]: {
        [`.${prefixCls}-mask`]: {
          gap: 8,
          display: 'flex',

          [`.${prefixCls}-delete`]: {
            color: token.colorError
          }
        }
      },

      [`.${prefixCls}-action, .${prefixCls}-error`]: {
        transition: 'border-color 0.3s 0s ease'
      },

      [`.${prefixCls}-action, .${prefixCls}-loading`]: {
        border: `1px dashed ${token.colorBorder}`
      },

      [`.${prefixCls}-error`]: {
        textAlign: 'center',
        color: token.colorError,
        border: `1px dashed ${token.colorError}`,

        '&:hover': {
          borderColor: token.colorErrorActive
        }
      },

      [`.${prefixCls}-action`]: {
        '&:hover': {
          borderColor: token.colorPrimaryActive
        }
      }
    }
  };
});
