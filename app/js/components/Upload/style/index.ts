/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-upload';

export default createStyles(['components', 'ImageUpload', prefixCls], token => {
  return {
    [`.${prefixCls}`]: {
      gap: 8,
      flexWrap: 'wrap',
      overflow: 'hidden',
      width: 'fit-content',
      height: 'fit-content',
      display: 'inline-flex',

      [`&.${prefixCls}-block`]: {
        width: '100%',
        display: 'flex',

        [`.${prefixCls}-input`]: {
          width: '100%'
        },

        [`.${prefixCls}-hidden`]: {
          display: 'none'
        }
      },

      [`.${prefixCls}-done,
        .${prefixCls}-error,
        .${prefixCls}-action,
        .${prefixCls}-loading`]: {
        gap: 20,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: token.colorPrimaryText,
        borderRadius: token.borderRadiusLG,
        background: 'rgba(34,123,208,0.02)',
        transition: `all ${token.motionDurationSlow}`,
        border: `${token.lineWidth} dashed ${token.colorBorder}`
      },

      [`.${prefixCls}-icon`]: {
        fontSize: 35
      },

      [`.${prefixCls}-eye,
        .${prefixCls}-warn,
        .${prefixCls}-delete`]: {
        gap: 4,
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        wordBreak: 'keep-all',
        justifyContent: 'center'
      },

      [`.${prefixCls}-action`]: {
        border: 'none',

        ['&:hover']: {
          color: token.colorPrimaryTextHover
        }
      },

      [`.${prefixCls}-error`]: {
        textAlign: 'center',
        color: token.colorError,
        borderColor: token.colorError,

        '&:hover': {
          color: token.colorErrorHover,
          borderColor: token.colorErrorHover
        }
      },

      [`.${prefixCls}-error,
        .${prefixCls}-done`]: {
        position: 'relative',

        [`.${prefixCls}-preview,
          .${prefixCls}-placeholder`]: {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        },

        [`.${prefixCls}-mask`]: {
          gap: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          [`.${prefixCls}-delete`]: {
            color: token.colorError
          }
        }
      }
    }
  };
});
