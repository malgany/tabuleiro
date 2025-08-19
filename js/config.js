//
// Items available as loot in the game. Each entry includes its visual `icon`,
// action point `paCost`, base `damage`, attack `range`, textual `effect`
// description and two metadata flags: `usable` indicates whether the item can
// be stored in a slot for later use and `consumable` defines if it is removed
// once used. Every item exposes an `apply` function that mutates the provided
// unit.
//
export const itemsConfig = [
  {
    id: 'vida+2',
    icon: '💖',
    paCost: 1,
    damage: 0,
    range: 0,
    effect: 'Cura 2 PV',
    consumable: true,
    usable: true,
    apply(unit) {
      unit.pa -= 1;
      unit.pv = Math.min(unit.pv + 2, unit.maxPv || 10);
    },
  },
  {
    id: 'espada',
    icon: '🗡️',
    paCost: 2,
    damage: 3,
    range: 1,
    effect: 'Aumenta ataque em 3',
    consumable: false,
    usable: true,
    type: 'attack',
    // This item no longer alters permanent stats. Damage is applied
    // dynamically when the attack is performed.
    apply() {},
  },
  {
    id: 'martelo',
    icon: '🔨',
    paCost: 3,
    damage: 3,
    effect: 'Causa 3 de dano em T',
    consumable: false,
    usable: true,
    type: 'attack',
    pattern: 'T',
    // This item deals damage in a T-shaped area and does not
    // permanently modify unit stats.
    apply() {},
  },
  {
    id: 'bomba',
    icon: '💣',
    paCost: 4,
    damage: 5,
    range: 3,
    effect: 'Causa 5 de dano',
    consumable: true,
    usable: true,
    type: 'attack',
    pattern: 'cross',
    apply(unit) {
      unit.pv -= 5;
    },
  },
  {
    id: 'escudo',
    icon: '🛡️',
    paCost: 0,
    damage: 0,
    range: 0,
    effect: 'Aumenta PV máximo em 3',
    consumable: true,
    usable: true,
    apply(unit) {
      unit.maxPv = (unit.maxPv ?? 10) + 3;
    },
  },
];

export function getRandomItems(count = 1) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = itemsConfig[Math.floor(Math.random() * itemsConfig.length)];
    result.push(item);
  }
  return result;
}
