/**
 * @module usePagingOptions
 */

import { PaginationProps } from 'antd';
import useLatestCallback from './useLatestCallback';

export interface UsePagingOptions {
  (pageSize: number): PagingOptions | undefined;
}

export interface Options extends Omit<PagingOptions, 'pageSizeOptions'> {
  pageSizeOptions?: number[];
}

type PagingOptions = Omit<PaginationProps, 'total' | 'current' | 'pageSize' | 'defaultCurrent' | 'defaultPageSize'>;

/**
 * @function showTotal
 * @param total 总条数
 */
function showTotal(total: number): string {
  return `共 ${total} 条`;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * @function usePagingOptions
 * @description [hook] 分页处理
 * @param opitons 分页配置
 */
export default function usePagingOptions(opitons: Options | false = {}): UsePagingOptions {
  return useLatestCallback<UsePagingOptions>(pageSize => {
    if (opitons !== false) {
      const {
        simple,
        showQuickJumper = !simple,
        showSizeChanger = !simple,
        pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
      } = opitons;

      if (__DEV__) {
        if (showSizeChanger && !pageSizeOptions.includes(pageSize)) {
          console.error(new ReferenceError(`page size ${pageSize} not in options [${pageSizeOptions.join(', ')}]`));
        }
      }

      const pagingOptions: PagingOptions = {
        showTotal,
        showQuickJumper,
        showSizeChanger,
        size: 'default',
        responsive: true,
        ...opitons
      };

      if (showSizeChanger) {
        pagingOptions.pageSizeOptions = pageSizeOptions;
      }

      return pagingOptions;
    }
  });
}
