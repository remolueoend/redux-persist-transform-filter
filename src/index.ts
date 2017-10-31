/**
 * Module which can be used as redux-persist plugin for persisting specific state paths to local storage.
 */

import { assocPath, path as getAtPath, fromPairs } from 'ramda'
const { createTransform } = require('redux-persist').default
import {
  OutConverter,
  InConverter,
  PathDef,
  SplittedPath,
  SplittedPathDef,
} from './types'
import { normalizePathDefs, splitPaths, getRootReducerPaths } from './helpers'

/**
 * Returns a redux-persist transform allowing to persist only a specific list of state paths.
 *
 * @param paths The pathes to perstst in the local storage.
 */
export const persistPaths = (paths: (PathDef | string)[]) => {
  const normalizePaths = normalizePathDefs(paths)
  const splittedPaths = splitPaths(normalizePaths)
  const rootPaths = splittedPaths.map(p => p[0][0])
  const reducerPaths = fromPairs(
    rootPaths.map(r => getRootReducerPaths(r, splittedPaths)),
  ) as { [root: string]: SplittedPathDef[] }
  
  const outbound = (state: {}, key: string) => (rootPaths.indexOf(key) !== -1 ? fromPairs(reducerPaths[key].map(p => [p[0].join('.'), p[1](getAtPath(p[0], state))] as [string, {}])) : undefined)
  const inbound = (state: { [path: string]: {} }, key: string) => (rootPaths.indexOf(key) !== -1 && !!state ? reducerPaths[key].reduce((p, c) => assocPath(c[0], c[2](state[c[0].join('.')]), p), {}) : {})

  return createTransform(
    outbound,
    inbound,
  )
}
