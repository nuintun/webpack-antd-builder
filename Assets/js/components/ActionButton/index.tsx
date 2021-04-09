import React, { memo } from 'react';

import useRequest from '~js/hooks/useRequest';
import { Options, RequestError } from '~js/utils/request';
import { QuestionCircleOutlined } from '@ant-design/icons';
import usePersistCallback from '~js/hooks/usePersistCallback';
import { Button, ButtonProps, message, Popconfirm, PopconfirmProps } from 'antd';

export interface ActionButtonProps<T> extends Omit<ButtonProps, 'loading' | 'onClick' | 'onError'> {
  body?: any;
  delay?: number;
  action: string;
  method?: string;
  onComplete?: () => void;
  onSuccess?: (response: T) => void;
  onError?: (error: RequestError) => void;
  requestInit?: Omit<Options, 'body' | 'method'>;
  confirm?: Omit<PopconfirmProps, 'disabled' | 'onConfirm'>;
}

export default memo(function ActionButton<T>({
  body,
  delay,
  action,
  confirm,
  onError,
  disabled,
  children,
  onSuccess,
  onComplete,
  requestInit,
  method = 'PUT',
  ...restProps
}: ActionButtonProps<T>): React.ReactElement {
  const [loading, fetch] = useRequest(delay);

  const onAction = usePersistCallback(async () => {
    try {
      const response = await fetch<T>(action, { ...requestInit, method, body });

      onSuccess && onSuccess(response);
      onComplete && onComplete();
    } catch (error) {
      onError ? onError(error) : message.error(error.message);
      onComplete && onComplete();
    }
  });

  if (confirm) {
    const icon = <QuestionCircleOutlined style={{ color: '#f00' }} />;

    return (
      <Popconfirm icon={icon} placement="topRight" {...confirm} disabled={disabled || loading} onConfirm={onAction}>
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
