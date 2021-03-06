// @flow
/* eslint-disable no-bitwise, no-plusplus */

export function transform(
  obj: Object,
  iteratee: ((accumulator: any, value: any, key: string) => void),
  accumulator: any,
) {
  Object.keys(obj).forEach((key) => {
    iteratee(accumulator, obj[key], key);
  });
  return accumulator;
}

export function find(arr: Array<any>, pred: any): any {
  const index = findIndex(arr, pred);
  return index > -1 ? arr[index] : undefined;
}

export function findIndex(arr: Array<any>, pred: any): number {
  const predType = typeof pred;
  for (let i = 0; i < arr.length; i++) {
    if (predType === 'function' && pred(arr[i], i, arr) === true) {
      return i;
    }
    if (predType === 'object' && contains(arr[i], pred)) {
      return i;
    }
    if (['string', 'number', 'boolean'].indexOf(predType) !== -1) {
      return arr.indexOf(pred);
    }
  }
  return -1;
}

export function contains(obj: Object, pred: Object): boolean {
  for (const key in pred) {
    if (!obj.hasOwnProperty(key) || obj[key] !== pred[key]) {
      return false;
    }
  }
  return true;
}
