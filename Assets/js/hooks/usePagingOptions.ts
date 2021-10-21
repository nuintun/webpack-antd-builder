/**
 * @module usePagingOptions
 */

import memoizeOne from 'memoize-one';
import { PaginationProps } from 'antd';
import usePersistCallback from './usePersistCallback';

type PagingOptions = Omit<PaginationProps, 'total' | 'current' | 'pageSize' | 'defaultCurrent' | 'defaultPageSize'>;

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 30, 50, 80];

function showTotal(total: number): string {
  return `共 ${total} 条`;
}

const normalizePagingOptions = memoizeOne((pageSize: number, opitons?: Options | false): PagingOptions | undefined => {
  if (opitons) {
    const { pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS } = opitons;

    if (__DEV__) {
      if (!pageSizeOptions.includes(pageSize)) {
        console.error(new ReferenceError(`page size ${pageSize} not in options [${pageSizeOptions.join(', ')}]`));
      }
    }

    return {
      showTotal,
      size: 'default',
      responsive: true,
      showSizeChanger: true,
      showQuickJumper: true,
      ...opitons,
      pageSizeOptions: pageSizeOptions.map(item => item.toString())
    };
  }
});

export interface Options extends Omit<PagingOptions, 'pageSizeOptions'> {
  pageSizeOptions?: number[];
}

/**
 * @function usePagingOptions
 * @description [hook] 分页处理
 * @param opitons 分页配置
 */
export default function usePagingOptions(opitons?: Options | false): (pageSize: number) => PagingOptions | undefined {
  return usePersistCallback((pageSize: number): PagingOptions | undefined => {
    return normalizePagingOptions(pageSize, opitons);
  });
}
