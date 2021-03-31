declare module '*.png' {
  const src: string;

  export default src;
}

declare module '*.gif' {
  const src: string;

  export default src;
}

declare module '*.bmp' {
  const src: string;

  export default src;
}

declare module '*.ico' {
  const src: string;

  export default src;
}

declare module '*.jpg' {
  const src: string;

  export default src;
}

declare module '*.jpeg' {
  const src: string;

  export default src;
}

declare module '*.css' {
  const content: { readonly [className: string]: string };

  export default content;
}

declare module '*.less' {
  const content: { readonly [className: string]: string };

  export default content;
}

declare type SVGComponent = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

declare module '*.svg' {
  const src: string;
  const Component: SVGComponent;

  export default src;
  export { Component };
}

declare const __DEV__: boolean;
declare const __APP_TITLE__: string;

declare type Timeout = NodeJS.Timeout;

declare function clearTimeout(timeoutId?: NodeJS.Timeout): void;

/**
 * @description 获取对象的值类型
 */
declare type ValueOf<T> = T extends any[] ? T[number] : T[keyof T];

/**
 * @description 将对象指定键的值设置为可选
 */
declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * @description 将对象指定键的值设置为必选
 */
declare type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * @description 获取组件的 props
 */
declare type GetComponentProps<C> = C extends React.ComponentType<infer P> ? P : never;
