import createStyles from '/js/hooks/createStyles';

export const prefixUI = 'ui-flex-menu';

export const headerBgDark = '#141414';
export const headerBgLight = '#001529';

export default createStyles(
  ['components', 'FlexMenu', prefixUI],
  (token, { unit }) => {
    const layout = token.Layout;
    const headerBg = layout?.headerBg;
    const lineType = layout?.lineType ?? token.lineType;
    const lineWidth = layout?.lineWidth ?? token.lineWidth;
    const colorSplit = layout?.colorSplit ?? token.colorSplit;

    return {
      [`.${prefixUI}-sider`]: {
        height: '100%',
        overflow: 'hidden',

        [`.${prefixUI}-header`]: {
          display: 'flex',
          overflow: 'hidden',
          placeItems: 'center',
          whiteSpace: 'nowrap',
          wordBreak: 'keep-all',
          color: token.colorPrimaryText,
          transition: `all ${token.motionDurationMid}`,
          borderBlockEnd: `${unit(lineWidth)} ${lineType} ${colorSplit}`
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
        }
      }
    };
  },
  ['Layout']
);
