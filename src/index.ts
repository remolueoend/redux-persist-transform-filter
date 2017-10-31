/**
 * Module which can be used as redux-persist plugin for persisting specific state paths to local storage.
 */

import { assocPath, path as getAtPath, fromPairs } from 'ramda';
import { createTransform } from 'redux-persist';

export type OutConverter = (val: {}) => {};
export type InConverter = (val: {}) => {};
export type PathDef = [string, OutConverter, InConverter];
type SplittedPath = string[];
type SplittedPathDef = [SplittedPath, OutConverter, InConverter];

const defInConverter: InConverter = v => v;
const defOutConverter: OutConverter = v => v;

/**
 * Returns a normalized version of the provided paths by extending single strings
 * with the default in- and out-converters.
 *
 * @param paths Path definitions received from the API interface.
 */
const normalizePathDefs = (paths: (PathDef | string)[]): PathDef[] =>
  paths.map(p => typeof p === 'string' ? [p, defOutConverter, defInConverter] : p) as PathDef[];

/**
 * Returns a new version of the provided path definitions with the paths splitted up by '.'.
 *
 * @param paths The path definitions to split up.
 */
const splitPaths = (paths: PathDef[]) =>
  paths.map(p => [p[0].split('.'), p[1], p[2]]) as SplittedPathDef[];

/**
 * Returns a new path definition based on the provided by removing the first element of the path.
 * 
 * @param splittedPath The paths to transform.
 */
const getReducerPath = (splittedPath: SplittedPathDef) =>
  [splittedPath[0].slice(1), ...splittedPath.slice(1)] as SplittedPathDef;

/**
 * Returns a tuple containing the given root and the list of all path definitons under the root.
 * The path definitions are transformed using `getReducerPath`.
 *
 * @param root The current root path element.
 * @param splittedPaths A list of all available path definitoins.
 */
const getRootReducerPaths = (root: string, splittedPaths: SplittedPathDef[]) =>
  [root, splittedPaths.filter(p => p[0][0] === root).map(getReducerPath)] as [string, SplittedPathDef[]];

/**
 * Returns a redux-persist transform allowing to persist only a specific list of state paths.
 *
 * @param paths The pathes to perstst in the local storage.
 */
export const persistPaths = (paths: (PathDef | string)[]) => {
  const normalizePaths = normalizePathDefs(paths);
  const splittedPaths = splitPaths(normalizePaths);
  const rootPaths = splittedPaths.map(p => p[0][0]);
  const reducerPaths =
    fromPairs(rootPaths.map(r => getRootReducerPaths(r, splittedPaths))) as { [root: string]: SplittedPathDef[] };

  return createTransform(
    (state, key) =>
      rootPaths.indexOf(key) !== -1
        ? fromPairs(reducerPaths[key].map(p => [p[0].join('.'), p[1](getAtPath(p[0], state))] as [string, {}]))
        : undefined,
    (state, key) =>
      rootPaths.indexOf(key) !== -1 && !!state
        ? reducerPaths[key].reduce((p, c) => assocPath(c[0], c[2](state[c[0].join('.')]), p), {})
        : {},
  );
};
