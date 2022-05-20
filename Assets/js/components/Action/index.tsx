import React, { cloneElement, memo, useCallback } from 'react';

import { isFunction } from '/js/utils/utils';
import useRequest from '/js/hooks/useRequest';
import usePersistRef from '/js/hooks/usePersistRef';
import { Options, RequestError } from '/js/utils/request';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { message, Popconfirm, PopconfirmProps } from 'antd';

type Trigger = 'onClick' | 'onChange';

type ActionChildrenProps = {
  loading?: boolean;
  disabled?: boolean;
} & {
  [onTrigger in Trigger]: (...args: unknown[]) => void;
};

export interface ActionProps<R> extends Pick<Options, 'method' | 'notify'> {
  delay?: number;
  action: string;
  trigger?: Trigger;
  disabled?: boolean;
  onComplete?: () => void;
  onSuccess?: (response: R) => void;
  confirmIcon?: PopconfirmProps['icon'];
  confirmTitle?: PopconfirmProps['title'];
  onError?: (error: RequestError) => void;
  body?: (() => Options['body']) | Options['body'];
  children: React.ReactElement<ActionChildrenProps>;
  query?: (() => Options['query']) | Options['query'];
  requestInit?: Omit<Options, 'query' | 'body' | 'method' | 'notify'>;
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

  const propsRef = usePersistRef(props);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const { action, notify, requestInit, method = 'PUT', body: initBody, query: initQuery } = propsRef.current;

    const body = isFunction(initBody) ? initBody() : initBody;
    const query = isFunction(initQuery) ? initQuery() : initQuery;

    request<R>(action, { ...requestInit, method, body, query, notify })
      .then(
        response => {
          const { onSuccess } = propsRef.current;

          onSuccess && onSuccess(response);
        },
        error => {
          const { onError } = propsRef.current;

          if (onError) {
            onError(error);
          } else {
            message.error(error.message);
          }
        }
      )
      .finally(() => {
        const { onComplete } = propsRef.current;

        onComplete && onComplete();
      });
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

      onTrigger && onTrigger(...args);

      onAction();
    }
  });
}

export default memo(Action) as typeof Action;
