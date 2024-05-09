import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-flex-menu';

export const headerBgLight = '#fff';
export const headerBgDark = '#141414';

export default createStyles(
  ['components', 'FlexMenu', prefixUI],
  (token, { unit }) => {
    const layout = token.Layout;
    const headerBg = layout?.headerBg;
    const headerHeight = layout?.headerHeight ?? 64;
    const lineType = layout?.lineType ?? token.lineType;
    const lineWidth = layout?.lineWidth ?? token.lineWidth;
    const colorSplit = layout?.colorSplit ?? token.colorSplit;

    return {
      [`.${prefixUI}`]: {
        height: '100%',
        overflow: 'hidden',

        [`.${prefixUI}-header`]: {
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

        [`.${prefixUI}-body`]: {
          height: `calc(100% - ${unit(headerHeight)})`
        },

        [`&.${prefixUI}-dark`]: {
          [`.${prefixUI}-header`]: {
            backgroundColor: headerBg ?? headerBgDark
          }
        },

        [`&.${prefixUI}-light`]: {
          [`.${prefixUI}-header`]: {
            backgroundColor: headerBg ?? headerBgLight
          }
        },

        [`&.${prefixUI}-mobile`]: {
          [`.${prefixUI}-header`]: {
            borderInlineEnd: `${unit(lineWidth)} ${lineType} ${colorSplit}`
          }
        }
      }
    };
  },
  ['Layout']
);
