/**
 * @module useTitle
 */

import { useEffect, useRef } from 'react';

import { isBrowser } from '~js/utils/utils';

const defaultFormat = (title: string | undefined, defaultTitle: string): string => {
  return title ? `${defaultTitle} - ${title}` : defaultTitle;
};

export interface Options {
  defaultTitle?: string;
  restoreOnUnmount?: boolean;
  format?: (title: string | undefined, defaultTitle: string) => string;
}

/**
 * @function useTitle
 * @description [hook] 更改页面标题
 * @param title 页面标题
 * @param options 配置参数
 */
export default function useTitle(title?: string, options: Options = {}) {
  const titleRef = useRef(isBrowser ? document.title : '');
  const { defaultTitle = __APP_TITLE__, format = defaultFormat, restoreOnUnmount = false } = options;

  useEffect(() => {
    if (isBrowser) {
      document.title = format(title, defaultTitle);
    }
  }, [title]);

  useEffect(() => {
    if (isBrowser && restoreOnUnmount) {
      return () => {
        document.title = titleRef.current;
      };
    }
  }, []);
}
