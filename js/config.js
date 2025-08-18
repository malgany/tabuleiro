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
    damage: 4,
    range: 1,
    effect: 'Aumenta ataque em 4',
    consumable: false,
    usable: true,
    apply(unit) {
      unit.attack = (unit.attack || 0) + 4;
    },
  },
  {
    id: 'bomba',
    icon: '💣',
    paCost: 4,
    damage: 5,
    range: 2,
    effect: 'Causa 5 de dano',
    consumable: true,
    usable: true,
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
    effect: 'Aumenta PV em 3',
    consumable: false,
    usable: true,
    apply(unit) {
      unit.pv += 3;
    },
  },
  {
    id: 'cafe',
    icon: '☕',
    paCost: 0,
    damage: 0,
    range: 0,
    effect: 'Restaura 2 PA',
    consumable: true,
    usable: false,
    apply(unit) {
      unit.pa += 2;
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
