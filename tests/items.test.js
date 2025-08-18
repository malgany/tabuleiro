import { itemsConfig } from '../js/config.js';
import { getTPatternCells } from '../js/units.js';

describe('itemsConfig configuration', () => {
  test('items array contains six objects with required properties', () => {
    expect(Array.isArray(itemsConfig)).toBe(true);
    expect(itemsConfig).toHaveLength(6);

    for (const it of itemsConfig) {
      expect(typeof it.id).toBe('string');
      expect(typeof it.icon).toBe('string');
      expect(typeof it.paCost).toBe('number');
      expect(typeof it.damage).toBe('number');
      if ('range' in it) expect(typeof it.range).toBe('number');
      if ('pattern' in it) expect(typeof it.pattern).toBe('string');
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

  test('hammer attack uses T pattern and deals 3 damage', () => {
    const hammer = itemsConfig.find(i => i.id === 'martelo');
    const attacker = { id: 'blue', pos: { row: 3, col: 2 }, pa: 6 };
    const enemy = { pos: { row: 0, col: 2 }, pv: 10 };
    const cells = getTPatternCells(attacker, enemy);
    const expected = [
      { row: 2, col: 2 },
      { row: 1, col: 2 },
      { row: 0, col: 2 },
      { row: 0, col: 1 },
      { row: 0, col: 3 },
    ];
    expect(cells).toEqual(expected);
    const hit = cells.some(
      c => c.row === enemy.pos.row && c.col === enemy.pos.col,
    );
    if (hit) enemy.pv -= hammer.damage;
    attacker.pa -= hammer.paCost;
    expect(enemy.pv).toBe(7);
    expect(attacker.pa).toBe(3);
  });
});
