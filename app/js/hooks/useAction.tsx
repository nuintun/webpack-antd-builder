/**
 * @module useAction
 */

import useLatestRef from './useLatestRef';
import { isObject } from '/js/utils/utils';
import { Popconfirm, PopconfirmProps } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useSubmit, { Options as UseSubmitOptions, Values } from '/js/hooks/useSubmit';

export interface Options<V extends Values, R> extends UseSubmitOptions<V, R> {
  delay?: number;
  disabled?: boolean;
  confirm?: string | Omit<PopconfirmProps, 'open' | 'trigger' | 'disabled' | 'onCancel' | 'onConfirm'>;
}

export default function useAction<V extends Values, R>(
  action: string,
  options: Options<V, R> = {}
): [loading: boolean, onAction: (values: V) => void, render: (children: React.ReactElement) => React.ReactElement] {
  const valuesRef = useRef<V>();
  const [open, setOpen] = useState(false);
  const optionsRef = useLatestRef(options);
  const [loading, onSubmit] = useSubmit<V, R>(action, options);

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const onConfirm = useCallback(() => {
    setOpen(false);
    onSubmit(valuesRef.current!);
  }, []);

  const onAction = useCallback((values: V) => {
    const { current: options } = optionsRef;

    if (!options.disabled) {
      if (options.confirm) {
        valuesRef.current = values;

        setOpen(true);
      } else {
        onSubmit(values);
      }
    }
  }, []);

  const render = (children: React.ReactElement): React.ReactElement => {
    const { confirm } = options;

    if (confirm) {
      const { disabled } = options;
      const icon = <QuestionCircleOutlined style={{ color: '#f00' }} />;
      const props: PopconfirmProps = isObject(confirm) ? confirm : { title: '警告', description: confirm };

      return (
        <Popconfirm
          icon={icon}
          {...props}
          open={open}
          trigger={[]}
          disabled={disabled}
          onCancel={onCancel}
          onConfirm={onConfirm}
        >
          {children}
        </Popconfirm>
      );
    }

    return children;
  };

  return [loading, onAction, render];
}
