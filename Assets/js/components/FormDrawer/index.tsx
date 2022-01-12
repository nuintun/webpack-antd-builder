import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import useSubmit, { Options } from '/js/hooks/useSubmit';
import { Button, Form, FormInstance, FormProps, Space } from 'antd';
import FlexDrawer, { FlexDrawerProps } from '/js/components/FlexDrawer';

type SubmitPicked = 'query' | 'method' | 'notify' | 'normalize' | 'onError' | 'onSuccess' | 'onComplete';
type FormPicked = 'name' | 'size' | 'colon' | 'layout' | 'preserve' | 'labelAlign' | 'requiredMark' | 'initialValues';
type DrawerPicked = 'title' | 'width' | 'height' | 'placement' | 'forceRender' | 'destroyOnClose' | 'afterVisibleChange';

export interface FormDrawerProps<V, R>
  extends Pick<FormProps, FormPicked>,
    Pick<Options<V, R>, SubmitPicked>,
    Pick<FlexDrawerProps, DrawerPicked> {
  action: string;
  onOpen?: () => void;
  onClose?: () => void;
  form?: FormInstance<V>;
  children?: React.ReactNode;
  trigger: React.ReactElement;
  requestInit?: Omit<Options<V, R>, SubmitPicked>;
  extra?: (submitting: boolean, form: FormInstance<V>, onClose: () => void) => React.ReactNode;
  footer?: (submitting: boolean, form: FormInstance<V>, onClose: () => void) => React.ReactNode;
}

function defaultExtra<V>(submitting: boolean, form: FormInstance<V>, onClose: () => void): React.ReactNode {
  return (
    <Space wrap>
      <Button htmlType="reset" onClick={onClose}>
        取消
      </Button>
      <Button htmlType="submit" type="primary" loading={submitting} onClick={form.submit}>
        确认
      </Button>
    </Space>
  );
}

function FormDrawer<V, R>({
  form,
  title,
  query,
  width,
  action,
  method,
  notify,
  onOpen,
  height,
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
  destroyOnClose,
  afterVisibleChange,
  layout = 'vertical',
  extra = defaultExtra,
  ...restProps
}: FormDrawerProps<V, R>): React.ReactElement {
  const [wrapForm] = Form.useForm<V>(form);
  const [visible, setVisible] = useState(false);

  const [submitting, onSubmit] = useSubmit<V, R>(action, {
    ...requestInit,
    query,
    method,
    notify,
    onError,
    normalize,
    onComplete,
    onSuccess(response: R, values: V) {
      setVisible(false);

      onSuccess && onSuccess(response, values);
    }
  });

  const onCloseHandler = useCallback(() => {
    !submitting && setVisible(false);
  }, []);

  const triggerNode = useMemo(() => {
    const { onClick } = trigger.props;

    return React.cloneElement(trigger, {
      onClick(event: React.MouseEvent) {
        onClick && onClick(event);

        wrapForm.resetFields();

        setVisible(true);
      }
    });
  }, [trigger]);

  useEffect(() => {
    if (visible) {
      onOpen && onOpen();
    } else {
      onClose && onClose();
    }
  }, [visible]);

  return (
    <>
      {triggerNode}
      <FlexDrawer
        title={title}
        width={width}
        height={height}
        footer={footer}
        visible={visible}
        placement={placement}
        onClose={onCloseHandler}
        forceRender={forceRender}
        destroyOnClose={destroyOnClose}
        afterVisibleChange={afterVisibleChange}
        extra={extra(submitting, wrapForm, onCloseHandler)}
      >
        <Form {...restProps} layout={layout} form={wrapForm} onFinish={onSubmit}>
          {children}
        </Form>
      </FlexDrawer>
    </>
  );
}

export default memo(FormDrawer) as typeof FormDrawer;
