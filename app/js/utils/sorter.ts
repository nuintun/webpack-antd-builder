/**
 * @module sorter
 */

import React from 'react';

export interface Sorter {
  orderBy: Field[];
  orderType: OrderType[];
}

export interface SortOrder {
  orderBy: OrderBy;
  orderType: OrderType;
}

export type Field = React.Key;

export type OrderType = 'ascend' | 'descend';

export type OrderBy = Field | readonly Field[];

/**
 * @function formatFields
 * @description 多字段排序格式化
 * @param fields 排序字段
 */
function formatFields(fields: OrderBy): Field {
  if (Array.isArray(fields)) {
    return fields.join('.');
  }

  return fields as Field;
}

export function normalize(sortOrder?: SortOrder[] | false): Sorter | undefined {
  const orderBy: Field[] = [];
  const orderType: OrderType[] = [];

  if (Array.isArray(sortOrder)) {
    for (const sorter of sortOrder) {
      if (sorter && sorter.orderType) {
        orderBy.push(formatFields(sorter.orderBy));
        orderType.push(sorter.orderType);
      }
    }

    return {
      orderBy,
      orderType
    };
  }
}
