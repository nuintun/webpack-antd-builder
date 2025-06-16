/**
 * @module index
 */

import { Fields } from '/js/utils/form';
import useSubmit, { Options } from '/js/hooks/useSubmit';
import { Button, Form, FormInstance, FormProps, Space } from 'antd';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';
import React, { cloneElement, memo, useCallback, useEffect, useId, useMemo, useState } from 'react';

const { useForm } = Form;

type DrawerPicked =
  | 'title'
  | 'width'
  | 'height'
  | 'loading'
  | 'children'
  | 'keyboard'
  | 'placement'
  | 'forceRender'
  | 'maskClosable'
  | 'destroyOnHidden'
  | 'afterOpenChange';
type FormOmitted = 'title' | 'onError' | 'children';
type SubmitPicked = 'query' | 'method' | 'notify' | 'normalize' | 'onError' | 'onSuccess' | 'onComplete';

function createFormName(id: string): string {
  return `form_${id.replace(/[^a-z_\d]/gi, '')}`;
}

export type Trigger = React.ReactElement<{
  disabled?: boolean;
  onClick?: (...args: unknown[]) => void;
}>;

export interface FormDrawerProps<F extends Fields, R = unknown>
  extends Omit<FormProps<F>, FormOmitted>,
    Pick<Options<F, R>, SubmitPicked>,
    Pick<FlexDrawerProps, DrawerPicked> {
  action: string;
  trigger: Trigger;
  onOpen?: () => void;
  onClose?: () => void;
  form?: FormInstance<F>;
  requestInit?: Omit<Options<F, R>, SubmitPicked>;
  extra?: (submitting: boolean, form: FormInstance<F>, onClose: () => void) => React.ReactNode;
  footer?: (submitting: boolean, form: FormInstance<F>, onClose: () => void) => React.ReactNode;
}

function defaultExtra<F>(submitting: boolean, form: FormInstance<F>, onClose: () => void): React.ReactNode {
  return (
    <Space>
      <Button htmlType="reset" onClick={onClose}>
        取消
      </Button>
      <Button htmlType="submit" type="primary" loading={submitting} onClick={form.submit}>
        确认
      </Button>
    </Space>
  );
}

function FormDrawer<F extends Fields, R = unknown>({
  form,
  name,
  query,
  title,
  action,
  footer,
  method,
  notify,
  onOpen,
  loading,
  onClose,
  onError,
  trigger,
  children,
  normalize,
  onSuccess,
  placement,
  onComplete,
  forceRender,
  requestInit,
  width = 560,
  height = 560,
  afterOpenChange,
  destroyOnHidden,
  keyboard = false,
  layout = 'vertical',
  extra = defaultExtra,
  maskClosable = false,
  ...restProps
}: FormDrawerProps<F, R>) {
  const id = useId();
  const [wrapForm] = useForm<F>(form);
  const [open, setOpen] = useState(false);

  const [submitting, onSubmit] = useSubmit<F, R>(action, {
    ...requestInit,
    query,
    method,
    notify,
    onError,
    normalize,
    onComplete,
    onSuccess(response: R, fields: F) {
      setOpen(false);

      onSuccess?.(response, fields);
    }
  });

  const onCloseHandler = useCallback(() => {
    setOpen(false);
  }, []);

  const triggerNode = useMemo(() => {
    return cloneElement(trigger, {
      onClick(...args: unknown[]) {
        const { disabled, onClick } = trigger.props;

        if (!disabled) {
          setOpen(true);

          onClick?.(...args);
        }
      }
    });
  }, [trigger]);

  useEffect(() => {
    if (open) {
      wrapForm.resetFields();

      onOpen?.();
    } else {
      onClose?.();
    }
  }, [open]);

  return (
    <>
      {triggerNode}
      <FlexDrawer
        open={open}
        title={title}
        width={width}
        height={height}
        loading={loading}
        keyboard={keyboard}
        placement={placement}
        onClose={onCloseHandler}
        forceRender={forceRender}
        maskClosable={maskClosable}
        afterOpenChange={afterOpenChange}
        destroyOnHidden={destroyOnHidden}
        extra={extra(submitting, wrapForm, onCloseHandler)}
        footer={footer?.(submitting, wrapForm, onCloseHandler)}
      >
        <Form {...restProps} layout={layout} form={wrapForm} onFinish={onSubmit} name={name || createFormName(id)}>
          {children}
        </Form>
      </FlexDrawer>
    </>
  );
}

export default memo(FormDrawer) as typeof FormDrawer;
