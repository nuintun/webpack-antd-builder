/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const prefixCls = 'ui-route-tabs';

export default createStyles(
  ['components', 'RouteTabs', prefixCls],
  (token, { unit }) => {
    const tabs = token.Tabs;
    const lineType = tabs?.lineType ?? token.lineType;
    const lineWidth = tabs?.lineWidth ?? token.lineWidth;
    const colorSplit = tabs?.colorSplit ?? token.colorSplit;
    const fontSizeLG = token.Tabs?.fontSizeLG ?? token.fontSizeLG;

    return {
      [`.${prefixCls}`]: {
        marginBlockStart: -1,
        borderBlockStart: `${unit(lineWidth)} ${lineType} ${colorSplit}`,

        '> [role=tablist]': {
          margin: 0,
          paddingBlock: 0,
          paddingInline: tabs?.padding ?? token.padding,
          backgroundColor: tabs?.colorBgContainer ?? token.colorBgContainer
        },

        [`.${prefixCls}-nav`]: {
          color: 'inherit',
          fontSize: fontSizeLG,
          lineHeight: unit(fontSizeLG),

          [`&:hover,
            &.${prefixCls}-active`]: {
            color: 'inherit'
          },

          [`.${prefixCls}-icon`]: {
            margin: 'unset',
            marginInlineEnd: tabs?.marginXXS ?? token.marginXXS,

            '> img': {
              width: 'auto',
              height: fontSizeLG
            }
          }
        }
      },

      [`.${prefixCls}-vertical`]: {
        '> [role=tablist]': {
          paddingInline: 0,
          borderBlockStart: 'none',
          paddingBlock: tabs?.paddingXS ?? token.paddingXS
        }
      }
    };
  },
  ['Tabs']
);
