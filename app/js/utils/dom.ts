/**
 * @module dom
 */

import { isFunction } from './utils';

/**
 * @type {boolean} canUseDOM
 * @description 是否支持 DOM 操作
 */
export const canUseDOM =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

type TargetValue<T> = T | undefined | null;

type TargetType = HTMLElement | Element | Window | Document;

export type Target<T extends TargetType = Element> =
  | TargetValue<T>
  | (() => TargetValue<T>)
  | React.MutableRefObject<TargetValue<T>>;

/**
 * @function getTargetElement
 * @param target 目标元素
 */
export function getTargetElement<T extends TargetType>(target: Target<T>): TargetValue<T> | null {
  if (!target) {
    return null;
  }

  if (isFunction(target)) {
    return target();
  }

  if ('current' in target) {
    return target.current;
  }

  return target;
}
