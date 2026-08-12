/**
 * The item comparing function.
 * @template {{life: ?string, name: string, id: number, [key: string]: any}} ItemType
 * @param {ItemType} itemA The first of the array.
 * @param {ItemType} itemB The second of the array.
 * @returns {number}
 */
export default function itemCompare(itemA, itemB) {
  if (!itemA.life && itemB.life) return 1;
  if (itemA.life && !itemB.life) return -1;

  if (itemA.life && itemB.life) {
    try {
      const l1 = new Date(itemA.life).getTime();
      const l2 = new Date(itemB.life).getTime();

      return l1 - l2 ? l1 - l2 : (itemA.name.localeCompare(itemB.name) || itemA.id - itemB.id);
    } catch {
      return itemA.name.localeCompare(itemB.name) || itemA.id - itemB.id;
    }
  }

  return itemA.name.localeCompare(itemB.name) || itemA.id - itemB.id;
}