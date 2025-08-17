//
// Items available as loot in the game.  Besides the visual `icon`, each item
// exposes an `apply` function that mutates the provided unit.  Some items can
// also grant an additional attack card for the turn panel and are flagged with
// `extraAttack`.
//
export const itemsConfig = [
  {
    id: 'sword',
    icon: '🗡️',
    // Adds extra attack damage and grants an extra attack card
    apply: unit => {
      unit.pa += 2;
    },
    extraAttack: true,
  },
  {
    id: 'shield',
    icon: '🛡️',
    // Small health boost
    apply: unit => {
      unit.pv += 2;
    },
  },
  {
    id: 'potion',
    icon: '🧪',
    // Restores one health point
    apply: unit => {
      unit.pv += 1;
    },
  },
  {
    id: 'bow',
    icon: '🏹',
    // Grants one additional action point
    apply: unit => {
      unit.pa += 1;
    },
  },
  {
    id: 'wand',
    icon: '✨',
    // Increases movement by one point
    apply: unit => {
      unit.pm += 1;
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
