import {
  PathDef,
  InConverter,
  OutConverter,
  SplittedPath,
  SplittedPathDef,
} from './types'

const defInConverter: InConverter = v => v
const defOutConverter: OutConverter = v => v

/**
 * Returns a normalized version of the provided paths by extending single strings
 * with the default in- and out-converters.
 *
 * @param paths Path definitions received from the API interface.
 */
export const normalizePathDefs = (paths: (PathDef | string)[]): PathDef[] =>
  paths.map(
    p => (typeof p === 'string' ? [p, defOutConverter, defInConverter] : p),
  ) as PathDef[]

/**
 * Returns a new version of the provided path definitions with the paths splitted up by '.'.
 *
 * @param paths The path definitions to split up.
 */
export const splitPaths = (paths: PathDef[]) =>
  paths.map(p => [p[0].split('.'), p[1], p[2]]) as SplittedPathDef[]

/**
 * Returns a new path definition based on the provided by removing the first element of the path.
 * 
 * @param splittedPath The paths to transform.
 */
export const getReducerPath = (splittedPath: SplittedPathDef) =>
  [splittedPath[0].slice(1), ...splittedPath.slice(1)] as SplittedPathDef

/**
 * Returns a tuple containing the given root and the list of all path definitons under the root.
 * The path definitions are transformed using `getReducerPath`.
 *
 * @param root The current root path element.
 * @param splittedPaths A list of all available path definitoins.
 */
export const getRootReducerPaths = (root: string, splittedPaths: SplittedPathDef[]) =>
  [root, splittedPaths.filter(p => p[0][0] === root).map(getReducerPath)] as [
    string,
    SplittedPathDef[]
  ]
