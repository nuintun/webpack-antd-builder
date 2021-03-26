import { useEffect, useLayoutEffect } from 'react';

import { isBrowser } from '~js/utils/utils';

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
