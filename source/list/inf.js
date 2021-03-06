/**
 * maryamyriameliamurphies.js
 * A library of Haskell-style morphisms ported to ES2015 JavaScript.
 *
 * list/inf.js
 *
 * @file Infinite list functions.
 * @license ISC
 */

/** @module list/inf */

import {
  partial,
  id
} from '../base';

import {
  list,
  listRangeLazyBy,
  cons,
  isList,
  isEmpty,
  head,
  tail,
  take
} from '../list';

import {error} from '../error';

/**
 * Generate an infinite `List`. Use `listInfBy` to supply your own step function.
 * @param {*} start - The value with which to start the `List`
 * @returns {List} An infinite `List` of consecutive values, incremented from `start`
 * @kind function
 */
export const listInf = start => listInfBy(start, (x => x + 1));

/**
 * Generate an infinite `List`, incremented using a given step function.
 * @param {*} start - The value with which to start the `List`
 * @param {Function} step - A unary step function
 * @returns {List} An infinite `List` of consecutive values, incremented from `start`
 * @kind function
 */
export const listInfBy = (start, step) => {
  const listInfBy_ = (start, step) => listRangeLazyBy(start, Infinity, step);
  return partial(listInfBy_, start, step);
}

/**
 * Return an infinite `List` of repeated applications of a function to a value.
 * <br>`Haskell> iterate :: (a -> a) -> a -> [a]`
 * @param {Function} f - The function to apply
 * @param {*} x - The value to apply the function to
 * @returns {List} An infinite `List` of repeated applications of `f` to `x`
 * @kind function
 * @example
 * const f = x => x * 2;
 * const lst = iterate(f, 1);
 * take(10, lst);             // => [1:2:4:8:16:32:64:128:256:512:[]]
 * index(lst, 10);            // => 1024
 */
export const iterate = (f, x) => {
  const iterate_ = (f, x) => listInfBy(x, (x => f(x)));
  return partial(iterate_, f, x);
}

/**
 * Build an infinite `List` of identical values.
 * <br>`Haskell> repeat :: a -> [a]`
 * @param {*} a - The value to repeat
 * @returns {List} The infinite `List` of repeated values
 * @kind function
 * @example
 * const lst = repeat(3);
 * take(10, lst);         // => [3:3:3:3:3:3:3:3:3:3:[]]
 * index(lst, 100);       // => 3
 */
export const repeat = a => cons(a)(listInfBy(a, id));

/**
 * Return a `List` of a specified length in which every value is the same.
 * <br>`Haskell> replicate :: Int -> a -> [a]`
 * @param {number} n - The length of the `List`
 * @param {*} x - The value to replicate
 * @returns {List} The `List` of values
 * @kind function
 * @example
 * replicate(10, 3); // => [3:3:3:3:3:3:3:3:3:3:[]]
 */
export const replicate = (n, x) => {
  const replicate_ = (n, x) => take(n, repeat(x));
  return partial(replicate_, n, x);
}

/**
 * Return the infinite repetition of a `List` (i.e. the "identity" of infinite lists).
 * <br>`Haskell> cycle :: [a] -> [a]`
 * @param {List} as - A finite `List`
 * @returns {List} A circular `List`, the original `List` infinitely repeated
 * @kind function
 * @example
 * const lst = list(1,2,3);
 * const c = cycle(lst);
 * take(9, c);              // => [1:2:3:1:2:3:1:2:3:[]]
 * index(c, 100);           // => 2
 */
export const cycle = as => {
  if (isList(as) === false) { return error.listError(as, cycle); }
  if (isEmpty(as)) { return error.emptyList(as, cycle); }
  let x = head(as);
  let xs = tail(as);
  const c = list(x);
  /* eslint no-constant-condition: ["error", { "checkLoops": false }] */
  const listGenerator = function* () {
    do {
      x = isEmpty(xs) ? head(as) : head(xs);
      xs = isEmpty(xs) ? tail(as) : tail(xs);
      yield list(x);
    } while (true);
  }
  const gen = listGenerator();
  const handler = {
    get: function (target, prop) {
      if (prop === `tail` && isEmpty(tail(target))) {
        const next = gen.next();
        target[prop] = () => new Proxy(next.value, handler);
      }
      return target[prop];
    }
  };
  const proxy = new Proxy(c, handler);
  return proxy;
}
