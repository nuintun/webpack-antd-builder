/**
 * @module global
 */

/// <reference types="webpack/module" />

declare module '*.png' {
  const content: string;

  export default content;
}

declare module '*.gif' {
  const content: string;

  export default content;
}

declare module '*.bmp' {
  const content: string;

  export default content;
}

declare module '*.ico' {
  const content: string;

  export default content;
}

declare module '*.jpg' {
  const content: string;

  export default content;
}

declare module '*.jpeg' {
  const content: string;

  export default content;
}

declare module '*.css' {
  const content: { readonly [className: string]: string };

  export default content;
}

declare module '*.less' {
  const content: { readonly [className: string]: string };

  export default content;
}

declare module '*.svg?url' {
  const content: string;

  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

  export default content;
}

declare const __DEV__: boolean;
declare const __APP_TITLE__: string;

declare type Timeout = NodeJS.Timeout;

declare function clearTimeout(timeoutId?: NodeJS.Timeout): void;

/**
 * @description 获取包含索引属性的签名
 */
declare type Keys<T> = keyof T;

/**
 * @description 获取非索引签名
 */
declare type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [P in keyof T]: infer U }
  ? {} extends U
    ? never
    : U
  : never;

/**
 * @description 获取对象的值类型
 */
declare type Values<T> = T extends { [K in keyof T]: infer U } ? U : never;

/**
 * @description 获取对象非索引签名的值类型
 */
declare type KnownValues<T> = T extends { [K in KnownKeys<T>]: infer U } ? U : never;

/**
 * @description 从非索引签名中忽略指定属性
 */
declare type OmitFromKnownKeys<T, K extends keyof T> = KnownKeys<T> extends infer U
  ? [U] extends [keyof T]
    ? Pick<T, Exclude<U, K>>
    : never
  : never;

/**
 * @description 增强版忽略指定属性
 */
declare type OmitX<T, K extends keyof T> = OmitFromKnownKeys<T, K> &
  (string extends K ? {} : string extends keyof T ? { [n: string]: T[Exclude<keyof T, number>] } : {}) &
  (number extends K ? {} : number extends keyof T ? { [n: number]: T[Exclude<keyof T, string>] } : {});

/**
 * @description 将对象指定键的值设置为可选
 */
declare type PartPartial<T, K extends keyof T> = OmitX<T, K> & Partial<Pick<T, K>>;

/**
 * @description 将对象指定键的值设置为必选
 */
declare type PartRequired<T, K extends keyof T> = OmitX<T, K> & Required<Pick<T, K>>;

/**
 * @description 获取组件的 props
 */
declare type GetComponentProps<C> = C extends React.ComponentType<infer P> ? P : never;
