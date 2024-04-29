/**
 * @module useTheme
 */

import { useCallback } from 'react';
import useStorage from './useStorage';
import createStorage from '/js/utils/storage';
import createSharedState from './createSharedState';

const THEME_CACHE_KEY = 'theme';

export type Theme = 'dark' | 'light';

const storage = createStorage<Theme>(window.localStorage);
const useSharedTheme = createSharedState<Theme>(() => storage.get(THEME_CACHE_KEY) || 'light');

/**
 * @function useTheme
 * @description [hook] 主题设置
 */
export default function useTheme(): [theme: Theme, setTheme: (theme: Theme) => void] {
  const [theme, updateTheme] = useSharedTheme();
  const [writeTheme] = useStorage<Theme>(THEME_CACHE_KEY);

  const setTheme = useCallback((theme: Theme): void => {
    writeTheme(theme);
    updateTheme(theme);
  }, []);

  return [theme, setTheme];
}
