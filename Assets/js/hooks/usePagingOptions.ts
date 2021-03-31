/**
 * @module usePagingOptions
 */

import memoizeOne from 'memoize-one';
import { PaginationProps } from 'antd';
import usePersistCallback from './usePersistCallback';

type OmitProps = 'total' | 'current' | 'pageSize' | 'defaultCurrent' | 'defaultPageSize';

type PagingOptions = Omit<PaginationProps, OmitProps>;

export interface Options extends Omit<PagingOptions, 'pageSizeOptions'> {
  pageSizeOptions?: number[];
}

export type ResolvePagingOptions = (pageSize: number) => PagingOptions;

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 30, 50, 80];

function showTotal(total: number): string {
  return `共 ${total} 条`;
}

const normalizePagingOptions = memoizeOne(
  (pageSize: number, opitons: Options = {}): PagingOptions => {
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
);

/**
 * @function usePagingOptions
 * @description 【Hook】分页处理
 * @param opitons 分页配置
 */
export default function usePagingOptions(opitons?: Options): ResolvePagingOptions {
  const resolvePagingOptions: ResolvePagingOptions = usePersistCallback(pageSize => {
    return normalizePagingOptions(pageSize, opitons);
  });

  return resolvePagingOptions;
}
