/**
 * @module useIsoLayoutEffect
 */

import { useEffect, useLayoutEffect } from 'react';

import { isBrowser } from '/js/utils/utils';

/**
 * @function useIsoLayoutEffect
 * @description [hook] 使用同构 useLayoutEffect，防止 SSR 模式报错
 */
const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export default useIsoLayoutEffect;
