/**
 * @module useInViewport
 */

import { useEffect, useState } from 'react';
import { canUseDOM, getTargetElement, Target } from '/js/utils/dom';

export interface Options extends Omit<IntersectionObserverInit, 'root'> {
  root?: Target<Element | Document>;
}

/**
 * @function useInViewport
 * @description [hook] 监听指定元素是否可见
 * @param target 监听元素
 * @param options 监听配置
 * @param initialVisibleState 默认可见状态
 */
export default function useInViewport(
  target: Target,
  options: Options = {},
  initialVisibleState: boolean | (() => boolean) = false
): boolean {
  const [inViewPort, setInViewport] = useState<boolean>(initialVisibleState);

  useEffect(() => {
    if (canUseDOM) {
      const element = getTargetElement(target);

      if (element) {
        const observer = new IntersectionObserver(
          entries => {
            for (const entry of entries) {
              if (entry.target === element) {
                return setInViewport(entry.isIntersecting);
              }
            }
          },
          {
            ...options,
            root: getTargetElement(options.root)
          }
        );

        observer.observe(element);

        return () => {
          observer.disconnect();
        };
      }
    }
  }, [target, options.root, options.rootMargin, options.threshold]);

  return inViewPort;
}
