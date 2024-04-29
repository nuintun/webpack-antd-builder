import { createStyles } from '/js/hooks/createStyles';

export const prefixUI = 'ui-image-upload';

export default createStyles(['components', 'ImageUpload', prefixUI], token => {
  return {
    [`.${prefixUI}`]: {
      gap: 8,
      alignItems: 'center',
      display: 'inline-flex',
      justifyContent: 'flex-start',

      [`.${prefixUI}-icon`]: {
        fontSize: 18
      },

      [`.${prefixUI}-done, .${prefixUI}-error, .${prefixUI}-action, .${prefixUI}-loading`]: {
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

      [`.${prefixUI}-done`]: {
        [`.${prefixUI}-mask`]: {
          gap: 8,
          display: 'flex',

          [`.${prefixUI}-delete`]: {
            color: token.colorError
          }
        }
      },

      [`.${prefixUI}-action, .${prefixUI}-error`]: {
        transition: 'border-color 0.3s 0s ease'
      },

      [`.${prefixUI}-action, .${prefixUI}-loading`]: {
        border: `1px dashed ${token.colorBorder}`
      },

      [`.${prefixUI}-error`]: {
        textAlign: 'center',
        color: token.colorError,
        border: `1px dashed ${token.colorError}`,

        '&:hover': {
          borderColor: token.colorErrorActive
        }
      },

      [`.${prefixUI}-action`]: {
        '&:hover': {
          borderColor: token.colorPrimaryActive
        }
      }
    }
  };
});
