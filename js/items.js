export const ITEMS = [
  {
    id: 'vida+2',
    emoji: '💖',
    paCost: 0,
    damage: 0,
    range: 0,
    effect: 'Cura 2 PV',
    apply(unit) {
      unit.pv += 2;
    }
  },
  {
    id: 'espada',
    emoji: '🗡️',
    paCost: 2,
    damage: 3,
    range: 1,
    effect: 'Aumenta ataque em 3',
    apply(unit) {
      unit.attack = (unit.attack || 0) + 3;
    }
  },
  {
    id: 'martelo',
    emoji: '🔨',
    paCost: 3,
    damage: 4,
    range: 1,
    effect: 'Aumenta ataque em 4',
    apply(unit) {
      unit.attack = (unit.attack || 0) + 4;
    }
  },
  {
    id: 'bomba',
    emoji: '💣',
    paCost: 4,
    damage: 5,
    range: 2,
    effect: 'Causa 5 de dano',
    apply(unit) {
      unit.pv -= 5;
    }
  },
  {
    id: 'escudo',
    emoji: '🛡️',
    paCost: 0,
    damage: 0,
    range: 0,
    effect: 'Aumenta PV em 3',
    apply(unit) {
      unit.pv += 3;
    }
  },
  {
    id: 'cafe',
    emoji: '☕',
    paCost: 0,
    damage: 0,
    range: 0,
    effect: 'Restaura 2 PA',
    apply(unit) {
      unit.pa += 2;
    }
  }
];
