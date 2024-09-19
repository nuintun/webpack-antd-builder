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

type TargetType = Element | Window | Document;

export type Target<T extends TargetType = Element> =
  | TargetValue<T>
  | (() => TargetValue<T>)
  | React.MutableRefObject<TargetValue<T>>;

export function isWindow(target: unknown): target is Window {
  return canUseDOM && target instanceof Window;
}

export function isElement(target: unknown): target is Element {
  return canUseDOM && target instanceof Element;
}

export function isDocument(target: unknown): target is Document {
  return canUseDOM && target instanceof Document;
}

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

  if (isWindow(target) || isDocument(target) || isElement(target)) {
    return target;
  }

  return target.current ?? null;
}
