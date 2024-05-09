/**
 * @module index
 */

import createStyles from '/js/hooks/createStyles';
import { headerBgDark, headerBgLight } from '/js/components/FlexMenu/style';

export const prefixCls = 'ui-flex-layout';

export default createStyles(
  ['components', 'FlexLayout', prefixCls],
  (token, { unit }) => {
    const layout = token.Layout;
    const headerBg = layout?.headerBg;
    const lineType = layout?.lineType ?? token.lineType;
    const lineWidth = layout?.lineWidth ?? token.lineWidth;
    const colorSplit = layout?.colorSplit ?? token.colorSplit;

    return {
      [`.${prefixCls}`]: {
        height: '100%',
        overflow: 'hidden',

        [`.${prefixCls}-header`]: {
          padding: 0,
          display: 'flex',
          overflow: 'hidden',
          placeItems: 'center',
          fontSize: token.fontSizeXL,
          transition: `all ${token.motionDurationMid}`,
          color: layout?.headerColor ?? token.colorText,
          borderBlockEnd: `${unit(lineWidth)} ${lineType} ${colorSplit}`,

          [`.${prefixCls}-trigger`]: {
            flex: 0,

            '&:hover': {
              color: token.colorPrimary
            }
          },

          [`.${prefixCls}-logo-header`]: {
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
            placeItems: 'center',
            whiteSpace: 'nowrap',
            wordBreak: 'keep-all'
          },

          [`.${prefixCls}-actions-header`]: {
            flex: 1,
            display: 'flex',
            gap: token.margin,
            placeItems: 'center',
            padding: `0 ${unit(token.paddingXS)}`
          }
        },

        [`.${prefixCls}-content`]: {
          height: '100%',
          overflow: 'auto',
          position: 'relative',
          color: token.colorText,
          msScrollChaining: 'none',
          scrollBehavior: 'smooth',
          OverscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          transition: `all ${token.motionDurationMid}`
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
        }
      }
    };
  },
  ['Layout']
);
