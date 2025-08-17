import { itemsConfig } from '../js/config.js';

describe('itemsConfig configuration', () => {
  test('items array contains six objects with required properties', () => {
    expect(Array.isArray(itemsConfig)).toBe(true);
    expect(itemsConfig).toHaveLength(6);

    for (const it of itemsConfig) {
      expect(typeof it.id).toBe('string');
      expect(typeof it.icon).toBe('string');
      expect(typeof it.paCost).toBe('number');
      expect(typeof it.damage).toBe('number');
      expect(typeof it.range).toBe('number');
      expect(typeof it.effect).toBe('string');
      expect(typeof it.apply).toBe('function');
      if (it.extraAttack !== undefined) {
        expect(typeof it.extraAttack).toBe('boolean');
      }
    }
  });

  test('apply functions modify unit stats accordingly', () => {
    const base = { pv: 10, pa: 5, attack: 1 };
    const find = id => itemsConfig.find(i => i.id === id);

    const u1 = { ...base };
    find('vida+2').apply(u1);
    expect(u1.pv).toBe(12);

    const u2 = { ...base };
    find('espada').apply(u2);
    expect(u2.attack).toBe(base.attack + 3);

    const u3 = { ...base };
    find('cafe').apply(u3);
    expect(u3.pa).toBe(base.pa + 2);

    const u4 = { ...base };
    find('bomba').apply(u4);
    expect(u4.pv).toBe(base.pv - 5);
  });
});
