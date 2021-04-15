import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import useMedia from '~js/hooks/useMedia';
import { isString } from '~js/utils/utils';
import useSubmit, { Options } from '~js/hooks/useSubmit';
import { Button, ConfigProvider, Drawer, DrawerProps, Form, FormInstance, FormProps, Space } from 'antd';

type SubmitPicked = 'query' | 'method' | 'notify' | 'transform' | 'onError' | 'onSuccess' | 'onComplete';
type FormPicked = 'name' | 'size' | 'colon' | 'layout' | 'preserve' | 'labelAlign' | 'requiredMark' | 'initialValues';
type DrawerPicked = 'title' | 'width' | 'height' | 'placement' | 'forceRender' | 'destroyOnClose' | 'afterVisibleChange';

export interface FormDrawerProps<V, R>
  extends Pick<FormProps, FormPicked>,
    Pick<DrawerProps, DrawerPicked>,
    Pick<Options<V, R>, SubmitPicked> {
  action: string;
  autoReset?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  form?: FormInstance<V>;
  trigger: React.ReactElement;
  requestInit?: Omit<Options<V, R>, SubmitPicked>;
  footer?: (submitting: boolean, form: FormInstance<V>, onClose: () => void) => React.ReactNode;
}

const containerStyle: React.CSSProperties = { position: 'relative' };

function defaultFooter<V>(submitting: boolean, form: FormInstance<V>, onClose: () => void): React.ReactNode {
  return (
    <Space className="fn-right">
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
  action,
  method,
  notify,
  onOpen,
  onClose,
  trigger,
  onError,
  children,
  placement,
  transform,
  onSuccess,
  onComplete,
  requestInit,
  forceRender,
  width = 576,
  height = 576,
  destroyOnClose,
  afterVisibleChange,
  layout = 'vertical',
  footer = defaultFooter,
  ...restProps
}: FormDrawerProps<V, R>): React.ReactElement {
  const [wrapForm] = Form.useForm<V>(form);
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const isBrokenWidth = useMedia(`(max-width: ${isString(width) ? width : `${width}px`})`);
  const isBrokenHeight = useMedia(`(max-height: ${isString(height) ? height : `${height}px`})`);

  const [submitting, onSubmit] = useSubmit<V, R>(action, {
    ...requestInit,
    query,
    method,
    notify,
    onError,
    transform,
    onComplete,
    onSuccess(response: R, values: V) {
      setVisible(false);

      onSuccess && onSuccess(response, values);
      onClose && onClose();
    }
  });

  const onCloseHandler = useCallback(() => {
    !submitting && setVisible(false);

    onClose && onClose();
  }, []);

  const triggerNode = useMemo(() => {
    const { onClick } = trigger.props;

    return React.cloneElement(trigger, {
      onClick(event: React.MouseEvent) {
        onClick && onClick(event);

        wrapForm.resetFields();

        setVisible(true);

        onOpen && onOpen();
      }
    });
  }, [trigger]);

  const getContainer = useCallback(() => container.current || document.body, []);

  return (
    <>
      {triggerNode}
      <Drawer
        title={title}
        visible={visible}
        placement={placement}
        onClose={onCloseHandler}
        forceRender={forceRender}
        destroyOnClose={destroyOnClose}
        afterVisibleChange={afterVisibleChange}
        width={isBrokenWidth ? '100vw' : width}
        height={isBrokenHeight ? '100vh' : height}
        footer={visible && footer(submitting, wrapForm, onCloseHandler)}
      >
        <div ref={container} style={containerStyle}>
          <Form {...restProps} layout={layout} form={wrapForm} onFinish={onSubmit}>
            <ConfigProvider getPopupContainer={getContainer} getTargetContainer={getContainer}>
              {visible && children}
            </ConfigProvider>
          </Form>
        </div>
      </Drawer>
    </>
  );
}

export default memo(FormDrawer) as typeof FormDrawer;
