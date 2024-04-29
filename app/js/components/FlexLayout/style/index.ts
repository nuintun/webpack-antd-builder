import { createStyles } from '/js/hooks/createStyles';
import { headerBgDark, headerBgLight } from '/js/components/FlexMenu/style';

export const prefixUI = 'ui-flex-layout';

export default createStyles(['components', 'FlexLayout', prefixUI], (token, { unit }) => {
  const layout = token.Layout;
  const headerBg = token.Layout?.headerBg;
  const lineType = layout?.lineType ?? token.lineType;
  const lineWidth = layout?.lineWidth ?? token.lineWidth;
  const colorSplit = layout?.colorSplit ?? token.colorSplit;

  return {
    [`.${prefixUI}`]: {
      height: '100%',
      overflow: 'hidden',

      [`.${prefixUI}-header`]: {
        padding: 0,
        display: 'flex',
        overflow: 'hidden',
        placeItems: 'center',
        fontSize: token.fontSizeXL,
        justifyContent: 'space-between',
        transition: `all ${token.motionDurationMid}`,

        [`.${prefixUI}-trigger`]: {
          flex: 0,

          '&:hover': {
            color: token.colorPrimaryHover
          }
        },

        [`.${prefixUI}-header-right`]: {
          flex: 1,
          display: 'flex',
          gap: token.margin,
          placeItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${unit(token.paddingXS)}`
        }
      },

      [`.${prefixUI}-content`]: {
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        color: token.colorText,
        msScrollChaining: 'none',
        scrollBehavior: 'smooth',
        OverscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        transition: `all ${token.motionDurationMid}`,
        borderBlockStart: `${unit(lineWidth)} ${lineType} ${colorSplit}`
      },

      [`&.${prefixUI}-dark`]: {
        [`.${prefixUI}-header`]: {
          color: token.colorTextLightSolid,
          backgroundColor: headerBg ?? headerBgDark
        }
      },

      [`&.${prefixUI}-light`]: {
        [`.${prefixUI}-header`]: {
          color: token.colorTextLightSolid,
          backgroundColor: headerBg ?? headerBgLight
        }
      }
    },

    [`.${prefixUI}-menu`]: {
      borderBlockStart: `${unit(lineWidth)} ${lineType} ${colorSplit}`
    }
  };
});
