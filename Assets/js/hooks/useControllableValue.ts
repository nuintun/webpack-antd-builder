/**
 * @module useControllableValue
 */

import React, { useCallback, useState } from 'react';

import useIsMounted from './useIsMounted';
import usePersistRef from './usePersistRef';
import { isFunction } from '/js/utils/utils';
import useUpdateEffect from './useUpdateEffect';

export interface Props {
  [prop: string]: any;
}

export interface Options<V> {
  trigger?: string;
  defaultValue?: V;
  valuePropName?: string;
  defaultValuePropName?: string;
}

/**
 * @function getValuePropName
 * @param options 配置选项
 */
function getValuePropName<V>(options: Options<V>): string {
  const { valuePropName = 'value' } = options;

  return valuePropName;
}

/**
 * @function getDefaultValuePropName
 * @param options 配置选项
 */
function getDefaultValuePropName<V>(options: Options<V>): string {
  const { defaultValuePropName = 'defaultValue' } = options;

  return defaultValuePropName;
}

/**
 * @function isControlled
 * @param props 组件 Props
 * @param options 配置选项
 */
function isControlled<V>(props: Props, options: Options<V>): boolean {
  const valuePropName = getValuePropName(options);

  return valuePropName in props;
}

/**
 * @function isUncontrolled
 * @param props 组件 Props
 * @param options 配置选项
 */
function isUncontrolled<V>(props: Props, options: Options<V>): boolean {
  const defaultValuePropName = getDefaultValuePropName(options);

  return defaultValuePropName in props;
}

/**
 * @function getValue
 * @param props 组件 Props
 * @param options 配置选项
 */
function getValue<V>(props: Props, options: Options<V>): V {
  const valuePropName = getValuePropName(options);

  return props[valuePropName];
}

/**
 * @function getDefaultValue
 * @param props 组件 Props
 * @param options 配置选项
 */
function getDefaultValue<V>(props: Props, options: Options<V>): V {
  const defaultValuePropName = getDefaultValuePropName(options);

  return props[defaultValuePropName];
}

/**
 * @function useControllableValue
 * @description [hook] 生成同时支持受控和非受控状态的值
 * @param props 组件 Props
 * @param options 配置选项
 */
export default function useControllableValue<V = undefined>(
  props: Props,
  options: Options<V> = {}
): [value: V | undefined, setValue: (value: React.SetStateAction<V | undefined>, ...args: any[]) => void] {
  const isMounted = useIsMounted();
  const propsRef = usePersistRef(props);
  const optionsRef = usePersistRef(options);
  const [value, setValueState] = useState<V | undefined>(() => {
    if (isControlled(props, options)) {
      return getValue(props, options);
    }

    if (isUncontrolled(props, options)) {
      return getDefaultValue(props, options);
    }

    return options.defaultValue;
  });

  const prevValueRef = usePersistRef(value);

  const setValue = useCallback((value: React.SetStateAction<V | undefined>, ...args: any[]) => {
    if (isMounted()) {
      const props = propsRef.current;

      const setStateAction = (prevState: V | undefined): V | undefined => {
        const { trigger = 'onChange' } = props;
        const nextState = isFunction(value) ? value(prevState) : value;

        if (nextState !== prevState && isFunction(props[trigger])) {
          props[trigger](nextState, ...args);
        }

        return nextState;
      };

      if (isControlled(props, optionsRef.current)) {
        setStateAction(prevValueRef.current);
      } else {
        setValueState(setStateAction);
      }
    }
  }, []);

  useUpdateEffect(() => {
    if (isControlled(props, options)) {
      const prevValue = prevValueRef.current;
      const nextValue = getValue(props, options);

      if (nextValue !== prevValue) {
        setValueState(nextValue);
      }
    }
  });

  return [value, setValue];
}
