/**
 * @module useIsoLayoutEffect
 */

import { useEffect, useLayoutEffect } from 'react';

import { canUseDOM } from '/js/utils/dom';

/**
 * @function useIsoLayoutEffect
 * @description [hook] 使用同构 useLayoutEffect，防止 SSR 模式报错
 */
const useIsoLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export default useIsoLayoutEffect;
