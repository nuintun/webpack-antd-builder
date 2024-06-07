/**
 * @module useSafeLayoutEffect
 */

import { canUseDOM } from '/js/utils/dom';
import { useEffect, useLayoutEffect } from 'react';

/**
 * @function useSafeLayoutEffect
 * @description [hook] 安全的 useLayoutEffect，防止 SSR 模式报错
 */
const useSafeLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export default useSafeLayoutEffect;
