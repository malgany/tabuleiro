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
      expect(typeof it.usable).toBe('boolean');
      expect(typeof it.consumable).toBe('boolean');
    }
  });

  test('apply functions modify unit stats accordingly', () => {
    const base = { pv: 10, pa: 5, attack: 1 };
    const find = id => itemsConfig.find(i => i.id === id);

    const heartTarget = { pv: 8, pa: 5 };
    find('vida+2').apply(heartTarget);
    expect(heartTarget.pv).toBe(10);
    expect(heartTarget.pa).toBe(4);

    const u3 = { ...base };
    find('cafe').apply(u3);
    expect(u3.pa).toBe(base.pa + 2);

    const u4 = { ...base };
    find('bomba').apply(u4);
    expect(u4.pv).toBe(base.pv - 5);
  });

  test('sword attack deals damage without altering attacker stats', () => {
    const sword = itemsConfig.find(i => i.id === 'espada');
    const attacker = { attack: 1, pa: 6 };
    const enemy = { pv: 10 };
    sword.apply(attacker);
    attacker.pa -= sword.paCost;
    enemy.pv -= sword.damage;
    expect(enemy.pv).toBe(7);
    expect(attacker.attack).toBe(1);
    expect(attacker.pa).toBe(4);
  });
});
