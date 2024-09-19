/**
 * @module useFullscreen
 */

import useLatestRef from './useLatestRef';
import { getTargetElement, Target } from '/js/utils/dom';
import { useCallback, useEffect, useState } from 'react';

function getTarget(target?: Target<Element>): Element {
  return getTargetElement(target) ?? document.documentElement;
}

/**
 * @function useFullscreen
 * @description [hook] 全屏模式
 * @param target 全屏元素
 * @param options 全屏配置
 */
export default function useFullscreen(
  target?: Target<Element>,
  options?: FullscreenOptions
): [fullscreen: boolean, requestFullscreen: () => void, exitFullscreen: () => void] {
  const targetRef = useLatestRef(target);
  const optionsRef = useLatestRef(options);
  const [fullscreen, setFullscreen] = useState(() => {
    if (document.fullscreenEnabled) {
      const element = getTarget(target);

      return document.fullscreenElement === element;
    }

    return false;
  });

  const requestFullscreen = useCallback(() => {
    const target = getTarget(targetRef.current);

    target.requestFullscreen(optionsRef.current);
  }, []);

  const exitFullscreen = useCallback(() => {
    document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const element = getTarget(target);

      setFullscreen(document.fullscreenElement === element);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [target]);

  useEffect(() => {
    const element = getTarget(target);

    setFullscreen(document.fullscreenElement === element);
  }, []);

  return [fullscreen, requestFullscreen, exitFullscreen];
}
