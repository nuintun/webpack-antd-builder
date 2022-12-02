import React, { cloneElement, memo, useCallback } from 'react';

import { isFunction } from '/js/utils/utils';
import { Body, Query } from '/js/utils/request';
import { Popconfirm, PopconfirmProps } from 'antd';
import useLatestRefef from '/js/hooks/useLatestRef';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useRequest, { RequestOptions } from '/js/hooks/useRequest';

type Trigger = 'onClick' | 'onChange';

type ActionChildrenProps = {
  loading?: boolean;
  disabled?: boolean;
} & {
  [onTrigger in Trigger]?: (...args: unknown[]) => void;
};

type RequestPicked = 'query' | 'body' | 'method' | 'notify' | 'onError' | 'onSuccess' | 'onComplete';

export interface ActionProps<R> extends Pick<RequestOptions<R>, RequestPicked> {
  delay?: number;
  action: string;
  trigger?: Trigger;
  disabled?: boolean;
  body?: (() => Body) | Body;
  query?: (() => Query) | Query;
  confirmIcon?: PopconfirmProps['icon'];
  confirmTitle?: PopconfirmProps['title'];
  children: React.ReactElement<ActionChildrenProps>;
  requestInit?: Omit<RequestOptions<R>, RequestPicked>;
  confirmInit?: Omit<PopconfirmProps, 'icon' | 'title' | 'disabled' | 'onConfirm'>;
}

const DEFAULT_CONFIRM_ICON = <QuestionCircleOutlined style={{ color: '#f00' }} />;

function Action<R>(props: ActionProps<R>): React.ReactElement {
  const {
    delay,
    disabled,
    children,
    confirmInit,
    confirmTitle,
    trigger = 'onClick',
    confirmIcon = DEFAULT_CONFIRM_ICON
  } = props;

  const propsRef = useLatestRefef(props);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const {
      action,
      notify,
      onError,
      onSuccess,
      onComplete,
      requestInit,
      method = 'PUT',
      body: initBody,
      query: initQuery
    } = propsRef.current;
    // @ts-ignore
    const body = isFunction(initBody) ? initBody() : initBody;
    const query = isFunction(initQuery) ? initQuery() : initQuery;

    request<R>(action, { ...requestInit, body, query, method, notify, onError, onSuccess, onComplete });
  }, []);

  if (confirmTitle) {
    return (
      <Popconfirm
        placement="topRight"
        {...confirmInit}
        icon={confirmIcon}
        title={confirmTitle}
        onConfirm={onAction}
        disabled={disabled || loading}
      >
        {cloneElement(children, {
          loading,
          disabled
        })}
      </Popconfirm>
    );
  }

  return cloneElement(children, {
    loading,
    disabled,
    [trigger]: (...args: unknown[]) => {
      const onTrigger = children.props[trigger];

      onAction();

      onTrigger?.(...args);
    }
  });
}

export default memo(Action) as typeof Action;
