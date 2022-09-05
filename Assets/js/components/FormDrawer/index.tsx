import React, { cloneElement, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { isFunction } from '/js/utils/utils';
import useSubmit, { Options, Values } from '/js/hooks/useSubmit';
import { Button, Form, FormInstance, FormProps, Space } from 'antd';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';

const { useForm } = Form;

type FormOmitted = 'title' | 'onError';
type SubmitPicked = 'query' | 'method' | 'notify' | 'normalize' | 'onError' | 'onSuccess' | 'onComplete';
type DrawerPicked = 'title' | 'width' | 'height' | 'placement' | 'forceRender' | 'destroyOnClose' | 'afterOpenChange';

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
  form,
  title,
  query,
  action,
  method,
  notify,
  onOpen,
  footer,
  onClose,
  trigger,
  onError,
  children,
  placement,
  normalize,
  onSuccess,
  onComplete,
  requestInit,
  forceRender,
  width = 560,
  height = 560,
  destroyOnClose,
  afterOpenChange,
  layout = 'vertical',
  extra = defaultExtra,
  ...restProps
}: FormDrawerProps<V, R>): React.ReactElement {
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

      onSuccess && onSuccess(response, values);
    }
  });

  const onCloseHandler = useCallback(() => {
    !submitting && setOpen(false);
  }, []);

  const triggerNode = useMemo(() => {
    return cloneElement(trigger, {
      onClick(...args: unknown[]) {
        const { onClick } = trigger.props;

        onClick && onClick(...args);

        setOpen(true);
      }
    });
  }, [trigger]);

  useEffect(() => {
    if (open) {
      wrapForm.resetFields();

      onOpen && onOpen();
    } else {
      onClose && onClose();
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
        destroyOnClose={destroyOnClose}
        afterOpenChange={afterOpenChange}
        extra={extra(submitting, wrapForm, onCloseHandler)}
        footer={isFunction(footer) && footer(submitting, wrapForm, onCloseHandler)}
      >
        <Form {...restProps} layout={layout} form={wrapForm} onFinish={onSubmit}>
          {children}
        </Form>
      </FlexDrawer>
    </>
  );
}

export default memo(FormDrawer) as typeof FormDrawer;
