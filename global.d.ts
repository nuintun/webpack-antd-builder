/**
 * @module global
 */

/// <reference types="react" />
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

declare module '*.webp' {
  const content: string;

  export default content;
}

declare module '*.css' {
  const content: string;

  export default content;
}

declare module '*.scss' {
  const content: string;

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
declare const __APP_NAME__: string;

/**
 * @description 将只读类型设为可读写类型
 */
declare type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * @description 定义非空数组
 */
declare type NonEmptyArray<T> = [T, ...T[]];

/**
 * @description 定时器标识类型
 */
declare type Timeout = number | NodeJS.Timeout;
