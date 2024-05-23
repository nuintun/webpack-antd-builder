/**
 * @module index
 */

import useSubmit, { Options, Values } from '/js/hooks/useSubmit';
import { Button, Form, FormInstance, FormProps, Space } from 'antd';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';
import React, { cloneElement, memo, useCallback, useEffect, useId, useMemo, useState } from 'react';

const { useForm } = Form;

type DrawerPicked =
  | 'title'
  | 'width'
  | 'height'
  | 'placement'
  | 'forceRender'
  | 'maskClosable'
  | 'destroyOnClose'
  | 'afterOpenChange';
type FormOmitted = 'title' | 'onError';
type SubmitPicked = 'query' | 'method' | 'notify' | 'normalize' | 'onError' | 'onSuccess' | 'onComplete';

function createFormId(id: string): string {
  return `form_${id.replace(/[^a-z_\d]/gi, '')}`;
}

export interface FormDrawerProps<V extends Values, R>
  extends Omit<FormProps<V>, FormOmitted>,
    Pick<Options<V, R>, SubmitPicked>,
    Pick<FlexDrawerProps, DrawerPicked> {
  action: string;
  onOpen?: () => void;
  onClose?: () => void;
  form?: FormInstance<V>;
  children?: React.ReactNode;
  requestInit?: Omit<Options<V, R>, SubmitPicked>;
  trigger: React.ReactElement<{ onClick?: (...args: unknown[]) => void }>;
  extra?: (submitting: boolean, form: FormInstance<V>, onClose: () => void) => React.ReactNode;
  footer?: (submitting: boolean, form: FormInstance<V>, onClose: () => void) => React.ReactNode;
}

function defaultExtra<V>(submitting: boolean, form: FormInstance<V>, onClose: () => void): React.ReactNode {
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

function FormDrawer<V extends Values, R>({
  name,
  form,
  query,
  title,
  action,
  footer,
  method,
  notify,
  onOpen,
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
  maskClosable,
  destroyOnClose,
  afterOpenChange,
  layout = 'vertical',
  extra = defaultExtra,
  ...restProps
}: FormDrawerProps<V, R>): React.ReactElement {
  const id = useId();
  const [wrapForm] = useForm<V>(form);
  const [open, setOpen] = useState(false);

  const [submitting, onSubmit] = useSubmit<V, R>(action, {
    ...requestInit,
    query,
    method,
    notify,
    onError,
    normalize,
    onComplete,
    onSuccess(response: R, values: V) {
      setOpen(false);

      onSuccess?.(response, values);
    }
  });

  const onCloseHandler = useCallback(() => {
    !submitting && setOpen(false);
  }, []);

  const triggerNode = useMemo(() => {
    return cloneElement(trigger, {
      onClick(...args: unknown[]) {
        const { onClick } = trigger.props;

        setOpen(true);

        onClick?.(...args);
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
        placement={placement}
        onClose={onCloseHandler}
        forceRender={forceRender}
        maskClosable={maskClosable}
        destroyOnClose={destroyOnClose}
        afterOpenChange={afterOpenChange}
        extra={extra(submitting, wrapForm, onCloseHandler)}
        footer={footer?.(submitting, wrapForm, onCloseHandler)}
      >
        <Form {...restProps} layout={layout} form={wrapForm} onFinish={onSubmit} name={name || createFormId(id)}>
          {children}
        </Form>
      </FlexDrawer>
    </>
  );
}

export default memo(FormDrawer) as typeof FormDrawer;
