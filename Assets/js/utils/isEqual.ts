/**
 * @module isEqual
 */

const keyList = Object.keys;
const isArray = Array.isArray;
const hasProp = Object.prototype.hasOwnProperty;

/**
 * @function isEqual
 * @description 深度比较两个值是否相等
 * @param a 值 1
 * @param b 值 2
 */
export default function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    const arrA = isArray(a);
    const arrB = isArray(b);

    if (arrA && arrB) {
      const length = a.length;

      if (length != b.length) return false;

      for (let i = 0; i < length; i++) {
        if (!isEqual(a[i], b[i])) return false;
      }

      return true;
    }

    if (arrA != arrB) return false;

    const dateA = a instanceof Date;
    const dateB = b instanceof Date;

    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    const regexpA = a instanceof RegExp;
    const regexpB = b instanceof RegExp;

    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    const keys = keyList(a);
    const length = keys.length;

    if (length !== keyList(b).length) return false;

    for (let i = 0; i < length; i++) {
      if (!hasProp.call(b, keys[i])) return false;
    }

    for (let i = 0; i < length; i++) {
      const key = keys[i];

      if (key === '_owner' && a.$$typeof && a._store) {
        // React-specific: avoid traversing React elements' _owner.
        //  _owner contains circular references
        // and is not needed when comparing the actual elements (and not their owners)
        // .$$typeof and ._store on just reasonable markers of a react element
        continue;
      } else {
        // all other properties should be traversed as usual
        if (!isEqual(a[key], b[key])) return false;
      }
    }

    return true;
  }

  return a !== a && b !== b;
}
