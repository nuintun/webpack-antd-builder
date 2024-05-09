/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';

export const headerBgLight = '#fff';
export const headerBgDark = '#141414';

export const prefixCls = 'ui-flex-menu';

export default createStyles(
  ['components', 'FlexMenu', prefixCls],
  (token, { unit }) => {
    const layout = token.Layout;
    const headerBg = layout?.headerBg;
    const headerHeight = layout?.headerHeight ?? 64;
    const lineType = layout?.lineType ?? token.lineType;
    const lineWidth = layout?.lineWidth ?? token.lineWidth;
    const colorSplit = layout?.colorSplit ?? token.colorSplit;

    return {
      [`.${prefixCls}`]: {
        height: '100%',
        overflow: 'hidden',

        [`.${prefixCls}-header`]: {
          display: 'flex',
          overflow: 'hidden',
          placeItems: 'center',
          whiteSpace: 'nowrap',
          wordBreak: 'keep-all',
          height: unit(headerHeight),
          transition: `all ${token.motionDurationMid}`,
          color: layout?.headerColor ?? token.colorText,
          borderBlockEnd: `${unit(lineWidth)} ${lineType} ${colorSplit}`
        },

        [`.${prefixCls}-body`]: {
          height: `calc(100% - ${unit(headerHeight)})`
        },

        [`&.${prefixCls}-dark`]: {
          [`.${prefixCls}-header`]: {
            backgroundColor: headerBg ?? headerBgDark
          }
        },

        [`&.${prefixCls}-light`]: {
          [`.${prefixCls}-header`]: {
            backgroundColor: headerBg ?? headerBgLight
          }
        },

        [`&.${prefixCls}-mobile`]: {
          [`.${prefixCls}-header`]: {
            borderInlineEnd: `${unit(lineWidth)} ${lineType} ${colorSplit}`
          }
        }
      }
    };
  },
  ['Layout']
);
