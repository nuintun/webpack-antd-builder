/**
 * @module useAction
 */

import { Fields } from '/js/utils/form';
import { isObject } from '/js/utils/utils';
import useLatestCallback from './useLatestCallback';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { GetProp, Popconfirm, PopconfirmProps } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import useSubmit, { Options as UseSubmitOptions } from '/js/hooks/useSubmit';

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

export interface Options<F extends Fields | null, R> extends UseSubmitOptions<F, R> {
  delay?: number;
  disabled?: boolean;
  confirm?: string | ConfirmInit;
}

/**
 * @function useAction
 * @description [hook] 请求动作
 * @param action 请求地址
 * @param options 配置参数
 */
export default function useAction<F extends Fields | null, R>(
  action: string,
  options: Options<F, R> = {}
): [loading: boolean, onAction: (fields: F) => void, render: (children: React.ReactElement) => React.ReactElement] {
  const valuesRef = useRef<F>();
  const [open, setOpen] = useState(false);
  const [loading, onSubmit] = useSubmit<F, R>(action, options);

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const onConfirm = useCallback(() => {
    setOpen(false);

    onSubmit(valuesRef.current!);
  }, []);

  const onAction = useLatestCallback((fields: F) => {
    if (!options.disabled) {
      if (options.confirm) {
        valuesRef.current = fields;

        requestAnimationFrame(() => {
          setOpen(open => !open);
        });
      } else {
        onSubmit(fields);
      }
    }
  });

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const render = useLatestCallback((children: React.ReactElement): React.ReactElement => {
    const { confirm } = options;

    if (confirm) {
      const { disabled } = options;
      const props = isObject(confirm) ? confirm : { title: '警告', description: confirm };
      const { okButtonProps, placement = 'topRight', icon = <QuestionCircleOutlined /> } = props;

      return (
        <Popconfirm
          {...props}
          icon={icon}
          open={open}
          trigger={[]}
          // @ts-expect-error
          showAction={[]}
          hideAction="click"
          disabled={disabled}
          onCancel={onCancel}
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
  });

  return [loading, onAction, render];
}
