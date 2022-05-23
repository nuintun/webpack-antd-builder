/**
 * @module useTitle
 */

import { useEffect, useRef } from 'react';

import { isBrowser } from '/js/utils/utils';

/**
 * @function defaultFormat
 * @param title 标题
 * @param defaultTitle 默认标题
 */
function defaultFormat(title: string | undefined, defaultTitle: string): string {
  return title ? `${defaultTitle} - ${title}` : defaultTitle;
}

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
  const { defaultTitle = __APP_NAME__, format = defaultFormat, restoreOnUnmount = false } = options;

  const titleRef = useRef(isBrowser ? document.title : defaultTitle);

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
