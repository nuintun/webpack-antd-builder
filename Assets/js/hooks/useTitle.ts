import { useEffect, useRef } from 'react';

import { isBrowser } from '~js/utils/utils';

export interface Options {
  defaultTitle?: string;
  restoreOnUnmount?: boolean;
  format?: (title: string | undefined, defaultTitle: string) => string;
}

const defaultFormat = (title: string, defaultTitle: string): string => (title ? `${defaultTitle} - ${title}` : defaultTitle);

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
