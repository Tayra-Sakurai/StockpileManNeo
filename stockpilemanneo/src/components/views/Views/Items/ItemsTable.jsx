import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import supabase from "../../../../client.js";
import ItemRow from "./ItemRow.jsx";
import itemCompare from "../../../../sortmodules/ItemSorter.js";
import { calcInnerProduct } from "../../../stockpile/stockpileVectors.js";

/**
 * The item diplay data object.
 * @typedef {object} ItemData
 * @property {number} id The id.
 * @property {string} name The name of the item.
 * @property {?string} life The life.
 * @property {{name: string, id: number, large_categories: {id: number, name: string, large_large_categories: ?{id: number, name: string,}}}} small_categories The small category.
 * @property {{name: string, id: number}} locations The location.
 */

/**
 * Item comparing function delegate.
 * @callback Comparison
 * @param {ItemData} a
 * @param {ItemData} b
 * @returns {number}
 */

/**
 * Returns the item comparer.
 * @param {keyof ItemData | "small_categories.large_categories" | "small_categories.large_categories.large_large_categories"} propertyName The property name.
 * @param {"desc" | "asc"} direction The order direction.
 * @returns {Comparison}
 */
function compareByProperty(propertyName, direction) {
  switch (propertyName) {
    case 'id':
      return direction === 'asc' ?
        (a, b) => a.id - b.id :
        (a, b) => b.id - a.id;

    case 'locations':
      return direction === 'asc' ?
        (a, b) => a.locations.name.localeCompare(b.locations.name) :
        (a, b) => b.locations.name.localeCompare(a.locations.name);

    case 'life':
      return direction === 'asc' ?
        itemCompare :
        (a, b) => -itemCompare(a, b);

    case 'name':
      return direction === 'asc' ?
        (a, b) => a.name.localeCompare(b.name) :
        (a, b) => b.name.localeCompare(a.name);

    case 'small_categories':
      return direction === 'asc' ?
        (a, b) => a.small_categories.name.localeCompare(b.small_categories.name) :
        (a, b) => b.small_categories.name.localeCompare(a.small_categories.name);

    case 'small_categories.large_categories':
      return direction === 'asc' ?
        (a, b) => a.small_categories.large_categories.name.localeCompare(b.small_categories.large_categories.name) :
        (a, b) => b.small_categories.large_categories.name.localeCompare(a.small_categories.large_categories.name);

    default:
      /**
       * Abstract comparison.
       * @type {Comparison}
       */
      const comparison = (a, b) => {
        if (!a.small_categories.large_categories.large_large_categories && b.small_categories.large_categories.large_large_categories) {
          return 1;
        } else if (a.small_categories.large_categories.large_large_categories && !b.small_categories.large_categories.large_large_categories) {
          return -1;
        } else if (a.small_categories.large_categories.large_large_categories && b.small_categories.large_categories.large_large_categories) {
          return a.small_categories.large_categories.large_large_categories.name.localeCompare(b.small_categories.large_categories.large_large_categories.name);
        } else {
          return itemCompare(a, b);
        }
      };

      return direction === 'asc' ?
        comparison :
        (a, b) => comparison(b, a);
  }
}

/**
 * The item display table.
 * @param {object} props The props
 * @param {number[]} props.items The items to be displayed.
 * @param {number[]} props.searchVector The search vector used to search items.
 * @returns
 */
function ItemsTable({ items, searchVector }) {
  const isNarrow = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const [orderBy, setOrderBy] = /** @type {<S = keyof ItemData | "small_categories.large_categories" | "small_categories.large_categories.large_large_categories">(initialState: "life") => [S, import("react").Dispatch.<import("react").SetStateAction.<S>>]} */ (useState)('life');
  const [order, setOrder] =
    /**
     * @type {<S = "asc" | "desc">(initialState: "asc") => [S, import("react").Dispatch.<import("react").SetStateAction.<S>>]}
     */
    (useState)("asc");

  /**
   * Requests the order to reorder the table.
   * @param {keyof ItemData | "small_categories.large_categories" | "small_categories.large_categories.large_large_categories"} property The property name.
   */
  const requestOrder = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * @type {[
   *   ItemData[],
   *   import("react").Dispatch.<import("react").SetStateAction.<ItemData[]>>
   * ]}
   */
  const [data, setData] = useState([]);

  supabase
    .from('items')
    .select('id, name, description, life, locations!inner(name, id), small_categories(name, id, large_categories!inner(id, name, large_large_categories(name, id))), vector')
    .in('id', items)
    .then(
      ({ data: d, error }) => {
        if (error) throw error;
        if (d.length > 0) {
          d.sort(itemCompare);
          if (searchVector.length)
            d.sort((a, b) => calcInnerProduct(b.vector, searchVector) - calcInnerProduct(a.vector, searchVector));
          setData(d.map(({ vector, ...others }) => ({ ...others })));
        }
      },
      (error) => {
        console.error(error);
      });

  useEffect(() => {
    const action = async () => {
      setData(current => current.toSorted(compareByProperty(orderBy, order)));
    };

    action();
  }, [order, orderBy]);

  if (isNarrow)
    return (
      <TableContainer sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
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
                  名称
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'locations'}
                  direction={orderBy === 'locations' ? order : 'asc'}
                  onClick={() => requestOrder('locations')}
                >
                  保管場所
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(value => <ItemRow {...value} />)}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
    <TableContainer sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Table sx={{ width: 'fit-content' }}>
        <TableHead>
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
              active={orderBy === 'small_categories.large_categories.large_large_categories'}
              direction={orderBy === 'small_categories.large_categories.large_large_categories' ? order : 'asc'}
              onClick={() => requestOrder('small_categories.large_categories.large_large_categories')}
            >
              大分類
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'small_categories.large_categories'}
              direction={orderBy === 'small_categories.large_categories' ? order : 'asc'}
              onClick={() => requestOrder('small_categories.large_categories')}
            >
              小分類
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'small_categories'}
              direction={orderBy === 'small_categories' ? order : 'asc'}
              onClick={() => requestOrder('small_categories')}
            >
              名称
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'name'}
              direction={orderBy === 'name' ? order : 'asc'}
              onClick={() => requestOrder('name')}
            >
              商品名
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'locations'}
              direction={orderBy === 'locations' ? order : 'asc'}
              onClick={() => requestOrder('locations')}
            >
              保管場所
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'life'}
              direction={orderBy === 'life' ? order : 'asc'}
              onClick={() => requestOrder('life')}
            >
              期限
            </TableSortLabel>
          </TableCell>
          <TableCell>
            操作
          </TableCell>
        </TableHead>
        <TableBody>
          {data.map(value => <ItemRow {...value} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ItemsTable;