import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material";
import LargeLargeCategoryRow from "./LargeLargeCategoryRow.jsx";
import { useState } from "react";

/**
 * Largest category data type.
 * @typedef {Object} LargeLargeCategoryData
 * @property {number} id The identifier.
 * @property {string} name The name of the largest category.
 * @property {import("./LargeLargeCategoryRow.jsx").LLDetail} large_categories The large category data.
 */

/**
 * Sorter func type.
 * @callback LargeLargeCategorySorter
 * @param {LargeLargeCategoryData} a The first parameter.
 * @param {LargeLargeCategoryData} b The second parameter.
 * @returns {number}
 */

/**
 * Gets the number of items
 * @param {Object} param The parameter object.
 * @param {import("./LargeLargeCategoryRow.jsx").LLDetail} param.large_categories The large category data.
 * @returns {number}
 */
function getNumberOfItems({ large_categories }) {
  /**
   * The number of items
   * @type {number}
   */
  let n = 0;

  for (const { small_categories } of large_categories) {
    for (const { items: [{ count }] } of small_categories) {
      n += count;
    }
  }

  return n;
}

/**
 * Gets the sorter by the data.
 * @param {keyof LargeLargeCategoryData} orderBy The standard of the sorting.
 * @param { "desc" | "asc" } direction The order direction.
 * @returns {LargeLargeCategorySorter}
 */
function getSorter(orderBy, direction) {
  switch (orderBy) {
    case 'id':
      return (direction === 'asc') ?
        (a, b) => a.id - b.id :
        (a, b) => b.id - a.id;

    case 'name':
      return (direction === 'asc') ?
        (a, b) => a.name.localeCompare(b.name) :
        (a, b) => b.name.localeCompare(a.name);

    case 'large_categories':
    default:
      return (direction === 'asc') ?
        (a, b) => getNumberOfItems(a) - getNumberOfItems(b) :
        (a, b) => getNumberOfItems(b) - getNumberOfItems(a);
  }
}

/**
 * Largest categories display table.
 * @param {object} props The props.
 * @param {LargeLargeCategoryData[]} props.displayData The displaying data.
 * @returns
 */
function LargeLargeCategoriesTable({ displayData }) {
  const [orderBy, setOrderBy] =
    /**
     * @type {<S = keyof LargeLargeCategoryData>(initialState: S) => [
     *   keyof LargeLargeCategoryData,
     *   import("react").Dispatch.<import("react").SetStateAction.<keyof LargeLargeCategoryData>>
     * ]}
     */
    (useState)('large_categories');

  const [order, setOrder] =
    /**
     * @type {
     *   <S = "asc" | "desc">(initialState: S) => [
     *     "asc" | "desc",
     *     import("react").Dispatch.<import("react").SetStateAction.<"asc" | "desc">>
     * ]}
     */
    (useState)('asc');

  /**
   * Handle the click action.
   * @param {keyof LargeLargeCategoryData} key The key.
   * @returns {() => void}
   */
  const handleClick = key => () => {
    const isAsc = (key == orderBy) && (order === 'asc');
    setOrderBy(key);
    setOrder(isAsc ? 'desc' : 'asc');
  };

  return (
    <TableContainer
      sx={{ width: '100%', overflow: 'scroll' }}
    >
      <Table sx={{ width: 'max-content' }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'id'}
                direction={(orderBy === 'id') ? order : 'asc'}
                onClick={handleClick('id')}
              >
                番号
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={(orderBy === 'name') ? order : 'asc'}
                onClick={handleClick('name')}
              >
                分類名
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'large_categories'}
                direction={(orderBy === 'large_categories') ? order : 'asc'}
                onClick={handleClick('large_categories')}
              >
                品目数
              </TableSortLabel>
            </TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayData.toSorted(getSorter(orderBy, order)).map(({ id, ...others }) => <LargeLargeCategoryRow itemId={id} {...others} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LargeLargeCategoriesTable;