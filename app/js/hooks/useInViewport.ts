/**
 * @module useInViewport
 */

import React, { useEffect, useState } from 'react';

import { canUseDOM, isFunction } from '/js/utils/utils';

export type Target = HTMLElement | null | (() => HTMLElement | null) | React.MutableRefObject<HTMLElement | null>;

/**
 * @function getTargetElement
 * @param target 目标元素
 */
function getTargetElement(target: Target): HTMLElement | null {
  if (!target) return null;

  if (isFunction(target)) return target();

  if ('current' in target) return target.current;

  return target;
}

/**
 * @function isInViewPort
 * @param element HTML 元素
 */
function isInViewPort(element: HTMLElement | null): boolean {
  if (!element) return false;

  const rect = element.getBoundingClientRect();

  if (rect) {
    const { top, bottom, left, right } = rect;
    const { body, documentElement } = document;
    const viewPortWidth = window.innerWidth || documentElement.clientWidth || body.clientWidth;
    const viewPortHeight = window.innerHeight || documentElement.clientHeight || body.clientHeight;

    return bottom > 0 && top <= viewPortHeight && left <= viewPortWidth && right > 0;
  }

  return false;
}

/**
 * @function useInViewport
 * @description [hook] 监听指定元素是否可见
 * @param target 监听元素
 * @param defaultVisible 默认是否可见
 */
export default function useInViewport(target: Target, defaultVisible: boolean = false): boolean {
  const [inViewPort, setInViewport] = useState<boolean>(() => {
    if (!canUseDOM) return defaultVisible;

    const element = getTargetElement(target);

    return isInViewPort(element);
  });

  useEffect(() => {
    const element = getTargetElement(target);

    if (element) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.target === element) {
            return setInViewport(entry.isIntersecting);
          }
        }
      });

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }
  }, [target]);

  return inViewPort;
}
