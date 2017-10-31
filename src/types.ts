export type OutConverter = (val: {}) => {}
export type InConverter = (val: {}) => {}
export type PathDef = [string, OutConverter, InConverter]
export type SplittedPath = string[]
export type SplittedPathDef = [SplittedPath, OutConverter, InConverter]