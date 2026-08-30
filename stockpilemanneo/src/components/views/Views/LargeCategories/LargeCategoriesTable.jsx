import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import supabase from "../../../../client.js";
import LargeCategoryViewRow from "./LargeCategoryViewRow.jsx";

/**
 * The item counter type data.
 * @typedef {Object} ItemCount
 * @property {number} count The number of the items under the small category.
 */

/**
 * The small category type.
 * @typedef {Object} SmallCategoryData
 * @property {ItemCount[]} items The items counter.
 */

/**
 * The largest category type.
 * @typedef {Object} LargeLargeCategoryData
 * @property {number} id The identity.
 * @property {string} name The name.
 */

/**
 * The large category data type.
 * @typedef {Object} LargeCategoryData
 * @property {number} id The identity.
 * @property {string} name The name of the large category.
 * @property {SmallCategoryData[]} small_categories The related small categories.
 * @property {?LargeLargeCategoryData} large_large_categories The largest category related to the large category.
 */

/**
 * The property specifier.
 * @typedef {"id" |
 *   "name" |
 *   "count" |
 *   "large_large_categories"} Key
 */

/**
 * The sorting order.
 * @typedef {"asc" | "desc"} Order
 */

/**
 * Counts the related items.
 * @template {{
 *   [x: string]: any,
 *   small_categories: {
 *     items: {
 *       count: number
 *     }[],
 *     [y: string]: any,
 *   }[],
 * }} T
 * @param {T} largeCategory The large category.
 * @returns
 */
function countRelatedItems(largeCategory) {
  let count = 0;
  for (const { items } of largeCategory.small_categories)
    count += items[0].count;

  return count;
}

/**
 * Compares the large categories.
 * @callback LargeCategoryComparator
 * @param {LargeCategoryData} a The first large category.
 * @param {LargeCategoryData} b The second one.
 * @returns {number}
 */

/**
 * The sorting function for user option.
 * @param {Key} key The ordering key.
 * @param {Order} order The order of sort.
 * @returns {LargeCategoryComparator}
 */
function reorderByColumn(key, order) {
  /**
   * The name comparator.
   * @type {LargeCategoryComparator}
   */
  const orderByName = (a, b) => a.name.localeCompare(b.name);
  /**
   * The id comparator.
   * @type {LargeCategoryComparator}
   */
  const orderById = (a, b) => a.id - b.id;
  /**
   * The count comparator.
   * @type {LargeCategoryComparator}
   */
  const orderByCount = (a, b) => countRelatedItems(a) - countRelatedItems(b);
  /**
   * The largest category comparator (ascending order).
   * @type {LargeCategoryComparator}
   */
  const orderByLargeLargeCategoryAsc = (a, b) => {
    if (a.large_large_categories && !b.large_large_categories) return -1;
    else if (!a.large_large_categories && b.large_large_categories) return 1;
    else if (a.large_large_categories && b.large_large_categories)
      return a.large_large_categories.id - b.large_large_categories.id;
    else
      return 0;
  };
  /**
   * The largest category comparator (descending order)
   * @type {LargeCategoryComparator}
   */
  const orderByLargeLargeCategoryDesc = (a, b) => {
    if (a.large_large_categories && !b.large_large_categories) return -1;
    else if (!a.large_large_categories && b.large_large_categories) return 1;
    else if (a.large_large_categories && b.large_large_categories)
      return b.large_large_categories.id - a.large_large_categories.id;
    else
      return 0;
  };
  switch (key) {
    case 'count':
      return order === 'asc' ?
        orderByCount :
        (a, b) => -orderByCount(a, b);

    case 'id':
      return order === 'asc' ?
        orderById :
        (a, b) => orderById(b, a);

    case 'large_large_categories':
      return order === 'asc' ?
        orderByLargeLargeCategoryAsc :
        orderByLargeLargeCategoryDesc;

    case 'name':
      return order === 'asc' ?
        orderByName :
        (a, b) => orderByName(b, a);
  }
}

/**
 * The large category listing table.
 * @param {object} props The props.
 * @param {number=} props.largeLargeCategoryId The largest category's id.
 * @returns
 */
function LargeCategoriesTable({ largeLargeCategoryId }) {
  const [data, setData] =
    /**
     * @type {<S = LargeCategoryData[]>(
     *   initialState: S[]
     * ) => [
     *   LargeCategoryData[],
     *   import("react").Dispatch.<import("react").SetStateAction.<LargeCategoryData[]>>
     * ]}
     */
    (useState)([]);

  const isNarrow = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const [orderBy, setOrderBy] =
    /**
     * @type {<S = Key>(initialState: S) => [Key, import("react").Dispatch.<import("react").SetStateAction<Key>>]}
     */
    (useState)('count');

  const [order, setOrder] =
    /**
     * @type {<S = Order>(initialState: S) => [Order, import("react").Dispatch.<import("react").SetStateAction.<Order>>]}
     */
    (useState)('asc');

  useEffect(() => {
    const load = async () => {
      if (!largeLargeCategoryId) {
        const { data: d, error } = await supabase
          .from('large_categories')
          .select('id, name, small_categories(items(count)), large_large_categories(id, name)')
          .order('name', { ascending: true });
        if (error) throw error;

        if (d) {
          d.sort((a, b) => {
            const [aItems, bItems] = [
              countRelatedItems(a),
              countRelatedItems(b),
            ];

            return aItems - bItems;
          });
          setData(d);
        }
      } else {
        const { data: d, error } = await supabase
          .from('large_categories')
          .select('id, name, small_categories(items(count)), large_large_categories(id, name)')
          .eq('large_large_category_id', largeLargeCategoryId)
          .order('name', { ascending: true });

        if (error) throw error;
        if (d) {
          d.sort((a, b) => countRelatedItems(a) - countRelatedItems(b));
          setData(d);
        }
      }
    };

    load();
  }, [largeLargeCategoryId]);

  useEffect(() => {
    const s = async () => {
      setData(d => d.toSorted(reorderByColumn(orderBy, order)));
    };

    s();
  }, [order, orderBy]);

  /**
   * The reorder request function.
   * @param {Key} key
   */
  const requestOrder = key => {
    const isAsc = (orderBy == key) && (order === 'asc');
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(key);
  };

  if (isNarrow)
    return (
      <TableContainer sx={{ width: '100%' }}>
        <Table sx={{ width: 'fit-content' }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => requestOrder('name')}
                >
                  分類名
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'count'}
                  direction={orderBy === 'count' ? order : 'asc'}
                  onClick={() => requestOrder('count')}
                >
                  品目数
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(value => <LargeCategoryViewRow {...value} />)}
          </TableBody>
        </Table>
      </TableContainer>
    );
  else
    return (
      <TableContainer sx={{ width: '100%' }}>
        <Table sx={{ width: 'max-content', }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => requestOrder('id')}
                >
                  番号
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => requestOrder('name')}
                >
                  分類名
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'large_large_categories'}
                  direction={orderBy === 'large_large_categories' ? order : 'asc'}
                  onClick={() => requestOrder('large_large_categories')}
                >
                  大分類
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'count'}
                  direction={orderBy === 'count' ? order : 'asc'}
                  onClick={() => requestOrder('count')}
                >
                  品目数
                </TableSortLabel>
              </TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(value => <LargeCategoryViewRow {...value} />)}
          </TableBody>
        </Table>
      </TableContainer>
    );
}

export default LargeCategoriesTable;