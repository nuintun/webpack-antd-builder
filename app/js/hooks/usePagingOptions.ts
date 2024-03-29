/**
 * @module usePagingOptions
 */

import { useCallback, useMemo } from 'react';

import memoizeOne from 'memoize-one';
import { PaginationProps } from 'antd';
import useLatestRef from './useLatestRef';

type PagingOptions = Omit<PaginationProps, 'total' | 'current' | 'pageSize' | 'defaultCurrent' | 'defaultPageSize'>;

export interface Options extends Omit<PagingOptions, 'pageSizeOptions'> {
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 30, 50, 80];

/**
 * @function showTotal
 * @param total 总条数
 */
function showTotal(total: number): string {
  return `共 ${total} 条`;
}

/**
 * @function normalizePagingOptions
 * @param pageSize 页大小
 * @param opitons 分页配置
 */
function normalizePagingOptions(pageSize: number, opitons?: Options | false): PagingOptions | undefined {
  if (opitons !== false) {
    const { pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS } = opitons || {};

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
}

/**
 * @function usePagingOptions
 * @description [hook] 分页处理
 * @param opitons 分页配置
 */
export default function usePagingOptions(opitons?: Options | false): (pageSize: number) => PagingOptions | undefined {
  const opitonsRef = useLatestRef(opitons);

  const memoizeNormalizePagingOptions = useMemo(() => {
    return memoizeOne(normalizePagingOptions);
  }, []);

  return useCallback((pageSize: number): PagingOptions | undefined => {
    return memoizeNormalizePagingOptions(pageSize, opitonsRef.current);
  }, []);
}
