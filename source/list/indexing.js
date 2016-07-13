/**
 * maryamyriameliamurphies.js
 * A library of Haskell-style morphisms ported to ES2015 JavaScript.
 *
 * list/indexing.js
 *
 * @file Functions for indexing lists.
 * @license ISC
 */

/** @module list/indexing */

import {
  partial,
  $
} from '../base';

import {isEq} from '../eq';

import {listToMaybe} from '../maybe';

import {
  fst,
  snd
} from '../tuple';

import {
  listRange,
  head,
  tail,
  length,
  isList,
  isEmpty,
  map,
  filter,
  zip
} from '../list';

import {error} from '../error';

/** @function index
 * Return the value from a `List` at the specified index, starting at 0.
 * Haskell> (!!) :: [a] -> Int -> a
 * @param {List} as - The `List` to index into.
 * @param {number} n - The index to return.
 * @returns {*} - The value at the specified index.
 * @example
 * const lst = list(1,2,3,4,5);
 * index(lst, 3));              // => 4
 */
export const index = (as, n) => {
  const index_ = (as, n) => {
    if (isList(as) === false ) { return error.listError(as, index); }
    if (n < 0) { return error.rangeError(n, index); }
    if (isEmpty(as)) { return error.rangeError(n, index); }
    const x = head(as);
    const xs = tail(as);
    if (n === 0) { return x; }
    return index(xs)(n - 1);
  }
  return partial(index_, as, n);
}

/** @function elemIndex
 * Return the index of the first value of a `List` equal to a query value, or `Nothing` if there is
 * no such value.
 * Haskell> elemIndex :: Eq a => a -> [a] -> Maybe Int
 * @param {*} a - The query value.
 * @param {List} as - The `List` to evaluate.
 * @returns {Maybe} - `Just a` or `Nothing`.
 * @example
 * const lst = list(1,2,2,3,2,4,2,2,5,2,6,8);
 * elemIndex(8, lst);                         // => Just 11
 * elemIndex(10, lst);                        // => Nothing
 */
export const elemIndex = (a, as) => {
  const elemIndex_ = (a, as) =>
    isList(as) ? findIndex(isEq(a), as) : error.listError(as, elemIndex);
  return partial(elemIndex_, a, as);
}

/** @function elemIndices
 * Return the indices of all values in a `List` equal to a query value, in ascending order.
 * Haskell> elemIndices :: Eq a => a -> [a] -> [Int]
 * @param {*} a - The query value.
 * @param {List} as - The `List` to evaluate.
 * @returns {List} as - A `List` of values equal to `a`.
 * @example
 * const lst = list(1,2,2,3,2,4,2,2,5,2,6,8);
 * elemIndices(2, lst);                       // => [1:2:4:6:7:9:[]]
 * elemIndices(10, lst);                      // => [[]]
 */
export const elemIndices = (a, as) => {
  const elemIndices_ = (a, as) =>
    isList(as) ? findIndices(isEq(a), as) : error.listError(as, elemIndices);
  return partial(elemIndices_, a, as);
}

/** @function find
 * Take a predicate function and a `List` and return the first value in the list that satisfies the
 * predicate, or `Nothing` if there is no such element. This function currently only works on `List`
 * objects, but should in the future work for all `Foldable` types.
 * Haskell> find :: Foldable t => (a -> Bool) -> t a -> Maybe a
 * @param {Function} p - The predicate function.
 * @param {List} xs - The `List` to evaluate.
 * @returns {Maybe} - The value inside a `Just` or `Nothing`, otherwise.
 * @example
 * const lst = list(1,2,3,4,5,6,7,8,9,10);
 * const pred1 = x => x % 3 === 0;
 * const pred2 = x => x > 10;
 * find(pred1, lst);                       // => Just 3
 * find(pred2, lst);                       // => Nothing
 */
export const find = (p, xs) => {
  const find_ = (p, xs) => isList(xs) ? $(listToMaybe)(filter(p))(xs) : error.listError(xs, find);
  return partial(find_, p, xs);
}

/** @function findIndex
 * Take a predicate function and a `List` and return the index of the first value in the list that
 * satisfies the predicate, or `Nothing` if there is no such element.
 * Haskell> findIndex :: (a -> Bool) -> [a] -> Maybe Int
 * @param {Function} p - The predicate function.
 * @param {List} xs - The `List` to evaluate.
 * @returns {Maybe} - The index inside a `Just` or `Nothing`, otherwise.
 * @example
 * const lst = list(1,2,3,4,5,6,7,8,9,10);
 * const pred1 = x => x % 3 === 0;
 * const pred2 = x => x > 10;
 * findIndex(pred1, lst);                  // => Just 2
 * findIndex(pred2, lst);                  // => Nothing
 */
export const findIndex = (p, xs) => {
  const findIndex_ = (p, xs) =>
    isList(xs) ? $(listToMaybe)(findIndices(p))(xs) : error.listError(xs, findIndex);
  return partial(findIndex_, p, xs);
}

/** @function findIndices
 * Return the indices of all values in a `List` that satisfy a predicate function,
 * in ascending order.
 * Haskell> findIndices :: (a -> Bool) -> [a] -> [Int]
 * @param {Function} p - The predicate function.
 * @param {List} xs - The `List` to evaluate.
 * @returns {List} - The `List` of matching indices.
 * @example
 * const lst = list(1,2,3,4,5,6,7,8,9,10);
 * const pred = x => even(x);
 * findIndices(pred, lst);                 // => [1:3:5:7:9:[]]
 */
export const findIndices = (p, xs) => {
  const findIndices_ = (p, xs) => {
    if (isList(xs) === false) { return error.listError(xs, findIndices); }
    const z = zip(xs, listRange(0, length(xs)));
    const f = xs => $(p)(fst)(xs) ? true : false;
    const m = t => snd(t);
    return map(m, filter(f, z));
  }
  return partial(findIndices_, p, xs);
}
