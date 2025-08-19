import { itemsConfig } from '../js/config.js';
import { getTPatternCells, getCrossPatternCells } from '../js/units.js';

describe('itemsConfig configuration', () => {
  test('items array contains five objects with required properties', () => {
    expect(Array.isArray(itemsConfig)).toBe(true);
    expect(itemsConfig).toHaveLength(5);

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

    const heartTarget = { pv: 8, pa: 5, maxPv: 10 };
    find('vida+2').apply(heartTarget);
    expect(heartTarget.pv).toBe(10);
    expect(heartTarget.pa).toBe(5);

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

  test('bomb affects cross area and is consumable', () => {
    const bomb = itemsConfig.find(i => i.id === 'bomba');
    const center = { row: 2, col: 2 };
    const cells = getCrossPatternCells(center);
    const targets = [
      { pos: { row: 2, col: 2 }, pv: 10 },
      { pos: { row: 1, col: 2 }, pv: 10 },
      { pos: { row: 2, col: 3 }, pv: 10 },
      { pos: { row: 5, col: 5 }, pv: 10 },
    ];
    cells.forEach(cell => {
      targets.forEach(t => {
        if (t.pos.row === cell.row && t.pos.col === cell.col) {
          bomb.apply(t);
        }
      });
    });
    expect(targets[0].pv).toBe(5);
    expect(targets[1].pv).toBe(5);
    expect(targets[2].pv).toBe(5);
    expect(targets[3].pv).toBe(10);
    expect(bomb.consumable).toBe(true);
  });

  test('shield increases current and max Pv without being consumable', () => {
    const shield = itemsConfig.find(i => i.id === 'escudo');
    expect(shield.usable).toBe(true);
    const unit = { pv: 8, maxPv: 10 };
    shield.apply(unit);
    expect(unit.maxPv).toBe(13);
    expect(unit.pv).toBe(11);
    expect(shield.consumable).toBe(false);
  });
});
