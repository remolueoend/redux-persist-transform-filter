import 'mocha'
import { assert } from 'chai';
import { normalizePathDefs } from '../src/helpers'

describe('normalizePathDefs', () => {
  it('returns a triple if a string is provided', () => {
    const normalizePaths = normalizePathDefs(['test.path'])
    assert.lengthOf(normalizePaths, 3)
  })
});
