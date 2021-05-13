import React, { memo } from 'react';

import useRequest from '~js/hooks/useRequest';
import { Options, RequestError } from '~js/utils/request';
import { QuestionCircleOutlined } from '@ant-design/icons';
import usePersistCallback from '~js/hooks/usePersistCallback';
import { Button, ButtonProps, message, Popconfirm, PopconfirmProps } from 'antd';

export interface ActionButtonProps<T> extends Omit<ButtonProps, 'loading' | 'onClick' | 'onError'> {
  delay?: number;
  action: string;
  method?: string;
  notify?: boolean;
  body?: Options['body'];
  onComplete?: () => void;
  query?: Options['query'];
  onSuccess?: (response: T) => void;
  confirmIcon?: PopconfirmProps['icon'];
  confirmTitle?: PopconfirmProps['title'];
  onError?: (error: RequestError) => void;
  requestInit?: Omit<Options, 'query' | 'body' | 'method' | 'notify'>;
  confirmInit?: Omit<PopconfirmProps, 'icon' | 'title' | 'disabled' | 'onConfirm'>;
}

const DEFAULT_CONFIRM_ICON = <QuestionCircleOutlined style={{ color: '#f00' }} />;

export default memo(function ActionButton<T>({
  body,
  query,
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
  confirmIcon = DEFAULT_CONFIRM_ICON,
  ...restProps
}: ActionButtonProps<T>): React.ReactElement {
  const [loading, fetch] = useRequest(delay);

  const onAction = usePersistCallback(async () => {
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
