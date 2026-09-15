import { asAttributeEntries } from './attributes';

describe('asAttributeEntries', () => {
  it('returns entries for a plain object', () => {
    expect(asAttributeEntries({ color: 'Graphite', weight: '78 g' })).toEqual([
      ['color', 'Graphite'],
      ['weight', '78 g'],
    ]);
  });

  it('returns an empty array for null', () => {
    expect(asAttributeEntries(null)).toEqual([]);
  });

  it('returns an empty array for undefined', () => {
    expect(asAttributeEntries(undefined)).toEqual([]);
  });

  it('returns an empty array for an array, rather than its index entries', () => {
    expect(asAttributeEntries(['a', 'b'])).toEqual([]);
  });

  it('returns an empty array for a primitive', () => {
    expect(asAttributeEntries('not an object')).toEqual([]);
    expect(asAttributeEntries(42)).toEqual([]);
  });
});
