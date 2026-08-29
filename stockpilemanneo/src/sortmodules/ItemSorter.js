/**
 * @fileoverview The item sorting module.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */
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

/**
 * The `typeof` value mapper.
 * @template T
 * @typedef {T extends string ? "string"
 *         : T extends number ? "number"
 *         : T extends boolean ? "boolean"
 *         : T extends bigint ? "bigint"
 *         : T extends symbol ? "symbol"
 *         : T extends (...args: any[]) => any ? "function"
 *         : T extends undefined ? "undefined"
 *         : "object"} TypeMapper
 */

/**
 * The comparison callback.
 * @template T
 * @callback Predicate
 * @param {T} a
 * @param {T} b
 * @returns {number}
 */

/**
 * Returns the function to compare the property values.
 * @template {Object.<string, any>} TObject The compared object type.
 * @template {keyof TObject} TKey The key to compare.
 * @template {TObject[TKey]} TProperty The property type.
 * @param {TKey} propertyName The property name to compare.
 * @param {boolean} order The order direction of the comparison.
 * @param {TypeMapper<TProperty>} propertyType The property type string.
 * @returns {Predicate<TObject>}
 */
export function compareProperty(propertyName, order, propertyType) {
  if (propertyType === 'string') {
    /**
     * @type {Predicate<TObject>}
     */
    const comparison = (a, b) => a[propertyName].localeCompare(b[propertyName]);
    return order ? comparison : (a, b) => -comparison(a, b);
  } else {
    return order ?
      (a, b) => {
        if (a[propertyName] > b[propertyName]) return 1;
        if (a[propertyName] == b[propertyName]) return 0;
        return -1;
      } :
      (a, b) => {
        if (a[propertyName] < b[propertyName]) return 1;
        if (a[propertyName] == b[propertyName]) return 0;
        return -1;
      };
  }
}