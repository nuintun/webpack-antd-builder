/**
 * @module useAction
 */

import useLatestRef from './useLatestRef';
import { isObject } from '/js/utils/utils';
import { TooltipRef } from 'antd/es/tooltip';
import { useCallback, useRef, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { GetProp, Popconfirm, PopconfirmProps } from 'antd';
import useSubmit, { Options as UseSubmitOptions, Values } from '/js/hooks/useSubmit';

type PopconfirmOmitted =
  | 'ref'
  | 'open'
  | 'trigger'
  | 'disabled'
  | 'onCancel'
  | 'onConfirm'
  | 'hideAction'
  | 'showAction'
  | 'onOpenChange';

interface ConfirmInit extends Omit<PopconfirmProps, PopconfirmOmitted> {
  okButtonProps?: Omit<GetProp<PopconfirmProps, 'okButtonProps'>, 'loading'>;
}

export interface Options<V extends Values, R> extends UseSubmitOptions<V, R> {
  delay?: number;
  disabled?: boolean;
  confirm?: string | ConfirmInit;
}

export default function useAction<V extends Values, R>(
  action: string,
  options: Options<V, R> = {}
): [loading: boolean, onAction: (values: V) => void, render: (children: React.ReactElement) => React.ReactElement] {
  const valuesRef = useRef<V>();
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

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const render = (children: React.ReactElement): React.ReactElement => {
    const { confirm } = options;

    if (confirm) {
      const { disabled } = options;
      const props: PopconfirmProps = isObject(confirm) ? confirm : { title: '警告', description: confirm };
      const { okButtonProps, placement = 'topRight', icon = <QuestionCircleOutlined style={{ color: '#f00' }} /> } = props;

      return (
        <Popconfirm
          {...props}
          icon={icon}
          open={open}
          trigger={[]}
          // @ts-ignore
          showAction={[]}
          hideAction="click"
          disabled={disabled}
          onCancel={onCancel}
          ref={popconfirmRef}
          onConfirm={onConfirm}
          placement={placement}
          onOpenChange={onOpenChange}
          okButtonProps={{ ...okButtonProps, loading }}
        >
          {children}
        </Popconfirm>
      );
    }

    return children;
  };

  return [loading, onAction, render];
}
