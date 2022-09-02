/**
 * @module useControllableValue
 */

import React, { useCallback, useState } from 'react';

import useSyncRef from './useSyncRef';
import useIsMounted from './useIsMounted';
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

export interface SetValueAction<V> {
  (value: React.SetStateAction<V>, ...args: unknown[]): void;
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
export default function useControllableValue<V>(
  props: Props,
  options: Options<V> & { defaultValue: V }
): [value: V, setValue: SetValueAction<V>];
/**
 * @function useControllableValue
 * @description [hook] 生成同时支持受控和非受控状态的值
 * @param props 组件 Props
 * @param options 配置选项
 */
export default function useControllableValue<V = undefined>(
  props: Props,
  options?: Omit<Options<V>, 'defaultValue'>
): [value: V | undefined, setValue: SetValueAction<V | undefined>];
export default function useControllableValue<V = undefined>(
  props: Props,
  options: Options<V> = {}
): [value: V | undefined, setValue: SetValueAction<V | undefined>] {
  const isMounted = useIsMounted();
  const propsRef = useSyncRef(props);
  const optionsRef = useSyncRef(options);

  const [value = options.defaultValue, setValueState] = useState<V | undefined>(() => {
    if (isControlled(props, options)) {
      return getValue(props, options);
    }

    if (isUncontrolled(props, options)) {
      return getDefaultValue(props, options);
    }

    return options.defaultValue;
  });

  const valueRef = useSyncRef(value);

  const setValue = useCallback((value: React.SetStateAction<V | undefined>, ...args: any[]) => {
    if (isMounted()) {
      const props = propsRef.current;

      const setStateAction = (state: V | undefined): V | undefined => {
        const { trigger = 'onChange' } = props;
        const nextState = isFunction(value) ? value(state) : value;

        if (nextState !== state && isFunction(props[trigger])) {
          props[trigger](nextState, ...args);
        }

        return nextState;
      };

      if (isControlled(props, optionsRef.current)) {
        setStateAction(valueRef.current);
      } else {
        setValueState(setStateAction);
      }
    }
  }, []);

  useUpdateEffect(() => {
    if (isControlled(props, options)) {
      const prevValue = valueRef.current;
      const nextValue = getValue(props, options);

      if (nextValue !== prevValue) {
        setValueState(nextValue);
      }
    }
  });

  return [value, setValue];
}
