import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, useMediaQuery } from "@mui/material";
import SmallCategoryRow from "./SmallCategoryRow.jsx";
import { useState } from "react";

/**
 * The large category related to the small category.
 * @typedef {Object} LargeCategoryRelatedData
 * @property {string} name The name.
 * @property {number} id The identity.
 * @property {?{
 *   id: number,
 *   name: string,
 * }} large_large_categories The largest category.
 */

/**
 * Item counter object.
 * @typedef {Object} ItemCount
 * @property {number} count The item count.
 */

/**
 * The small category data type.
 * @typedef {Object} SmallCategoryData
 * @property {number} id The identity.
 * @property {string} name The name of the small category.
 * @property {LargeCategoryRelatedData} large_categories The related large category data.
 * @property {ItemCount[]} items The item counter array.
 */

/**
 * The small category sorter function.
 * @callback SmallCategorySort
 * @param {SmallCategoryData} a The first parameter.
 * @param {SmallCategoryData} b The second parameter.
 * @returns {number}
 */

/**
 * The order request receiver.
 * @param {"asc" | "desc"} order The ordering direction.
 * @param {(keyof SmallCategoryData) | "large_large_categories"} orderBy Which to order by.
 * @returns {SmallCategorySort}
 */
function orderSmallCategories(order, orderBy) {
  /**
   * @type {SmallCategorySort}
   */
  let result;
  switch (orderBy) {
    case 'id':
      result = (a, b) => a.id - b.id;
      break;

    case 'name':
      result = (a, b) => a.name.localeCompare(b.name);
      break;

    case 'large_categories':
      result = (a, b) => a.large_categories.name.localeCompare(b.large_categories.name);
      break;

    case 'large_large_categories':
      result = (a, b) => {
        if (a.large_categories.large_large_categories && !b.large_categories.large_large_categories)
          return -1;
        else if (!a.large_categories.large_large_categories && b.large_categories.large_large_categories)
          return 1;
        else if (a.large_categories.large_large_categories && b.large_categories.large_large_categories) {
          const compareN = a.large_categories.large_large_categories.name.localeCompare(b.large_categories.large_large_categories.name);
          const compareI = a.large_categories.large_large_categories.id - b.large_categories.large_large_categories.id;
          return compareN || compareI;
        }
        else
          return a.items[0].count - b.items[0].count;
      };
      break;

    case 'items':
    default:
      result = (a, b) => a.items[0].count - b.items[0].count;
      break;
  }

  if (order === 'asc')
    return result;

  return (a, b) => result(b, a);
}

/**
 * The small category viewer table.
 * @param {object} props The props.
 * @param {SmallCategoryData[]} props.smallCategories The displaying small categories.
 * @returns
 */
function SmallCategoriesTable({ smallCategories }) {
  const isWide = useMediaQuery(theme => theme.breakpoints.up('md'));

  const [order, setOrder] =
    /**
     * @type {<S = "asc" | "desc">(initialState: S) => [
     *   "asc" | "desc",
     *   import("react").Dispatch.<import("react").SetStateAction.<"asc" | "desc">>
     * ]}
     */
    (useState)('asc');

  const [orderBy, setOrderBy] =
    /**
     * @type {<S = (keyof SmallCategoryData | "large_large_categories")>(initialState: S) => [((keyof SmallCategoryData) | "large_large_categories"), import("react").Dispatch.<import("react").SetStateAction.<((keyof SmallCategoryData) | "large_large_categories")>>]}
     */
    (useState)('items');

  /**
   * The sorting request process.
   * @param {keyof SmallCategoryData | "large_large_categories"} key The order key.
   * @returns {() => void}
   */
  const requestSort = key => () => {
    const isAsc = (orderBy === key) && (order === 'asc');
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(key);
  }

  if (isWide)
    return (
      <TableContainer sx={{ width: '100%', overflow: 'scroll', margin: 0 }}>
        <Table sx={{ width: 'max-content', }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  direction={(orderBy === 'id') ? order : 'asc'}
                  active={orderBy === 'id'}
                  onClick={requestSort('id')}
                >
                  番号
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  direction={(orderBy === 'name') ? order : 'asc'}
                  active={orderBy === 'name'}
                  onClick={requestSort('name')}
                >
                  名称
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  direction={(orderBy === 'large_large_categories') ? order : 'asc'}
                  active={orderBy === 'large_large_categories'}
                  onClick={requestSort('large_large_categories')}
                >
                  大分類
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  direction={(orderBy === 'large_categories') ? order : 'asc'}
                  active={orderBy === 'large_categories'}
                  onClick={requestSort('large_categories')}
                >
                  分類
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  direction={(orderBy === 'items') ? order : 'asc'}
                  active={orderBy === 'items'}
                  onClick={requestSort('items')}
                >
                  品目数
                </TableSortLabel>
              </TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {smallCategories.toSorted(orderSmallCategories(order, orderBy)).map(({ id, ...otherProps }) =>
              <SmallCategoryRow itemId={id} {...otherProps} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
    <TableContainer
      sx={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Table
        sx={{
          width: 'fit-content',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>
              <TableSortLabel
                direction={(orderBy === 'name') ? order : 'asc'}
                active={orderBy === 'name'}
                onClick={requestSort('name')}
              >
                名称
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                direction={(orderBy === 'items') ? order : 'asc'}
                active={orderBy === 'items'}
                onClick={requestSort('items')}
              >
                品目数
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {smallCategories.toSorted(orderSmallCategories(order, orderBy)).map(({ id, ...otherProps }) => <SmallCategoryRow itemId={id} {...otherProps} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SmallCategoriesTable;