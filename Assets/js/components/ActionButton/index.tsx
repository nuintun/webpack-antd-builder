import React, { memo, useCallback } from 'react';

import { isFunction } from '~js/utils/utils';
import useRequest from '~js/hooks/useRequest';
import usePersistRef from '~js/hooks/usePersistRef';
import { Options, RequestError } from '~js/utils/request';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, ButtonProps, message, Popconfirm, PopconfirmProps } from 'antd';

export interface ActionButtonProps<T>
  extends Pick<Options, 'method' | 'notify'>,
    Omit<ButtonProps, 'loading' | 'onClick' | 'onError'> {
  delay?: number;
  action: string;
  onComplete?: () => void;
  onSuccess?: (response: T) => void;
  confirmIcon?: PopconfirmProps['icon'];
  confirmTitle?: PopconfirmProps['title'];
  onError?: (error: RequestError) => void;
  body?: (() => Options['body']) | Options['body'];
  query?: (() => Options['query']) | Options['query'];
  requestInit?: Omit<Options, 'query' | 'body' | 'method' | 'notify'>;
  confirmInit?: Omit<PopconfirmProps, 'icon' | 'title' | 'disabled' | 'onConfirm'>;
}

const DEFAULT_CONFIRM_ICON = <QuestionCircleOutlined style={{ color: '#f00' }} />;

function ActionButton<T>(props: ActionButtonProps<T>): React.ReactElement {
  const {
    delay,
    action,
    notify,
    method,
    onError,
    disabled,
    children,
    onSuccess,
    onComplete,
    requestInit,
    confirmInit,
    confirmTitle,
    body: initBody,
    query: initQuery,
    confirmIcon = DEFAULT_CONFIRM_ICON,
    ...restProps
  } = props;
  const propsRef = usePersistRef(props);
  const [loading, request] = useRequest({ delay }, false);

  const onAction = useCallback(() => {
    const { action, notify, requestInit, method = 'PUT', body: initBody, query: initQuery } = propsRef.current;

    const body = isFunction(initBody) ? initBody() : initBody;
    const query = isFunction(initQuery) ? initQuery() : initQuery;

    request<T>(action, { ...requestInit, method, body, query, notify })
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
        <Button {...restProps} disabled={disabled} loading={loading}>
          {children}
        </Button>
      </Popconfirm>
    );
  }

  return (
    <Button {...restProps} disabled={disabled} loading={loading} onClick={onAction}>
      {children}
    </Button>
  );
}

export default memo(ActionButton) as typeof ActionButton;
