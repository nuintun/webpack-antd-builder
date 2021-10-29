/**
 * @module useControllableValue
 */

import React, { useCallback, useState } from 'react';

import usePrevious from './usePrevious';
import useIsMounted from './useIsMounted';
import usePersistRef from './usePersistRef';
import { isFunction } from '~js/utils/utils';
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
 * @function useControllableValue
 * @description [hook] 生成同时支持受控和非受控状态的值
 * @param props 组件 Props
 * @param options 配置选项
 */
export default function useControllableValue<V = undefined>(
  props: Props,
  options: Options<V> = {}
): [value: V | undefined, setValue: (value: React.SetStateAction<V | undefined>, ...args: any[]) => void] {
  const { defaultValue, defaultValuePropName = 'defaultValue', valuePropName = 'value', trigger = 'onChange' } = options;

  const value: V = props[valuePropName];

  const isMounted = useIsMounted();
  const prevValue = usePrevious(value);
  const propsRef = usePersistRef(props);

  const [state, setState] = useState<V | undefined>(() => {
    if (valuePropName in props) return value;

    if (defaultValuePropName in props) {
      return props[defaultValuePropName];
    }

    return defaultValue;
  });

  const setValue = useCallback((value: React.SetStateAction<V | undefined>, ...args: any[]) => {
    if (isMounted()) {
      const props = propsRef.current;

      const setStateAction = (prevState: V | undefined): V | undefined => {
        const nextState = isFunction(value) ? value(prevState) : value;

        if (nextState !== prevState && isFunction(props[trigger])) {
          props[trigger](nextState, ...args);
        }

        return nextState;
      };

      if (valuePropName in props) {
        setStateAction(prevValue);
      } else {
        setState(setStateAction);
      }
    }
  }, []);

  useUpdateEffect(() => {
    if (prevValue !== value && valuePropName in props) {
      setState(value);
    }
  }, [value, valuePropName]);

  return [state, setValue];
}
