export const itemsConfig = [
  { id: 'sword', icon: '🗡️' },
  { id: 'shield', icon: '🛡️' },
  { id: 'potion', icon: '🧪' },
  { id: 'bow', icon: '🏹' },
  { id: 'wand', icon: '✨' }
];

export function getRandomItems(count = 1) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = itemsConfig[Math.floor(Math.random() * itemsConfig.length)];
    result.push(item);
  }
  return result;
}
