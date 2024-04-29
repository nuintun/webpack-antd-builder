import { createStyles } from '/js/hooks/createStyles';

export const prefixUI = 'ui-route-tabs';

export default createStyles(['components', 'RouteTabs', prefixUI], (token, { calc, unit }) => {
  const { fontSizeLG } = token;

  return {
    [`.${prefixUI}`]: {
      marginBlockStart: -1,
      borderBlockStart: `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}`,

      '> [role=tablist]': {
        margin: 0,
        paddingBlock: 0,
        backgroundColor: token.colorBgContainer,
        paddingInline: calc(token.paddingXS).mul(2).equal(),

        '&::before': {
          display: 'none'
        }
      },

      [`.${prefixUI}-nav`]: {
        color: 'inherit',
        fontSize: fontSizeLG,
        lineHeight: unit(fontSizeLG),

        [`&:hover, &.${prefixUI}-active`]: {
          color: 'inherit'
        },

        [`.${prefixUI}-icon`]: {
          margin: 'unset',
          marginInlineEnd: token.marginXXS,

          '> img': {
            width: 'auto',
            height: fontSizeLG
          }
        }
      }
    },

    [`.${prefixUI}-vertical`]: {
      '> [role=tablist]': {
        paddingInline: 0,
        borderBlockStart: 'none',
        paddingBlock: token.paddingXS
      }
    }
  };
});
