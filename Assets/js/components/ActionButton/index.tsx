import React, { memo } from 'react';

import useRequest from '~js/hooks/useRequest';
import { Options, RequestError } from '~js/utils/request';
import { QuestionCircleOutlined } from '@ant-design/icons';
import usePersistCallback from '~js/hooks/usePersistCallback';
import { Button, ButtonProps, message, Popconfirm, PopconfirmProps } from 'antd';
import { isFunction } from '~js/utils/utils';

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

export default memo(function ActionButton<T>({
  delay,
  action,
  notify,
  onError,
  disabled,
  children,
  onSuccess,
  onComplete,
  requestInit,
  confirmInit,
  confirmTitle,
  method = 'PUT',
  body: initBody,
  query: initQuery,
  confirmIcon = DEFAULT_CONFIRM_ICON,
  ...restProps
}: ActionButtonProps<T>): React.ReactElement {
  const [loading, fetch] = useRequest(delay);

  const onAction = usePersistCallback(async () => {
    const body = isFunction(initBody) ? initBody() : initBody;
    const query = isFunction(initQuery) ? initQuery() : initQuery;

    try {
      const response = await fetch<T>(action, { ...requestInit, method, body, query, notify });

      onSuccess && onSuccess(response);
    } catch (error) {
      onError ? onError(error) : message.error(error.message);
    }

    onComplete && onComplete();
  });

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
});
