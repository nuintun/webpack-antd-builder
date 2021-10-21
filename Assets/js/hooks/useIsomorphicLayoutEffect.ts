/**
 * @module useIsomorphicLayoutEffect
 */

import { useEffect, useLayoutEffect } from 'react';

import { isBrowser } from '~js/utils/utils';

/**
 * @function useIsomorphicLayoutEffect
 * @description [hook] 使用同构 useLayoutEffect，防止 SSR 模式报错
 */
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
