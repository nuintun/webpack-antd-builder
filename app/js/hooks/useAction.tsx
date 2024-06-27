/**
 * @module useAction
 */

import useLatestRef from './useLatestRef';
import { isObject } from '/js/utils/utils';
import { TooltipRef } from 'antd/es/tooltip';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { GetProp, Popconfirm, PopconfirmProps } from 'antd';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import useSubmit, { Options as UseSubmitOptions, Values } from '/js/hooks/useSubmit';

function createConfirmId(id: string): string {
  return `confirm_${id.replace(/[^a-z_\d]/gi, '')}`;
}

export interface Options<V extends Values, R> extends UseSubmitOptions<V, R> {
  delay?: number;
  disabled?: boolean;
  confirm?: string | ConfirmInit;
}

interface ConfirmInit extends Omit<PopconfirmProps, 'id' | 'open' | 'trigger' | 'disabled' | 'onCancel' | 'onConfirm'> {
  okButtonProps?: Omit<GetProp<PopconfirmProps, 'okButtonProps'>, 'loading'>;
}

export default function useAction<V extends Values, R>(
  action: string,
  options: Options<V, R> = {}
): [loading: boolean, onAction: (values: V) => void, render: (children: React.ReactElement) => React.ReactElement] {
  const id = useId();
  const valuesRef = useRef<V>();
  const confirmId = createConfirmId(id);
  const [open, setOpen] = useState(false);
  const optionsRef = useLatestRef(options);
  const popconfirmRef = useRef<TooltipRef>(null);
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

        requestAnimationFrame(() => {
          setOpen(open => !open);
        });
      } else {
        onSubmit(values);
      }
    }
  }, []);

  useEffect(() => {
    const onClick = ({ target }: MouseEvent) => {
      const { current: popconfirm } = popconfirmRef;

      if (popconfirm) {
        const { nativeElement } = popconfirm;
        const confirm = document.getElementById(confirmId);

        if (
          !(
            confirm === target ||
            nativeElement === target ||
            confirm?.contains(target as Node) ||
            nativeElement?.contains(target as Node)
          )
        ) {
          setOpen(false);
        }
      }
    };

    window.addEventListener('mousedown', onClick, true);

    return () => {
      window.removeEventListener('mousedown', onClick, true);
    };
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
          placement="topRight"
          {...props}
          open={open}
          trigger={[]}
          id={confirmId}
          disabled={disabled}
          onCancel={onCancel}
          ref={popconfirmRef}
          onConfirm={onConfirm}
          okButtonProps={{ ...props.okButtonProps, loading }}
        >
          {children}
        </Popconfirm>
      );
    }

    return children;
  };

  return [loading, onAction, render];
}
