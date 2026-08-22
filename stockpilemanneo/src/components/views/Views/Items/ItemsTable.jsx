import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery } from "@mui/material";
import { useState } from "react";
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
 * The item display table.
 * @param {object} props The props
 * @param {number[]} props.items The items to be displayed.
 * @param {number[]} props.searchVector The search vector used to search items.
 * @returns
 */
function ItemsTable({ items, searchVector }) {
  const isNarrow = useMediaQuery(theme => theme.breakpoints.down('sm'));

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

  if (isNarrow)
    return (
      <TableContainer sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <Table sx={{ width: 'fit-content(100%)' }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>名称</TableCell>
              <TableCell>保管場所</TableCell>
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
          <TableCell>番号</TableCell>
          <TableCell>大分類</TableCell>
          <TableCell>分類</TableCell>
          <TableCell>名称</TableCell>
          <TableCell>商品名</TableCell>
          <TableCell>保管場所</TableCell>
          <TableCell>期限</TableCell>
        </TableHead>
        <TableBody>
          {data.map(value => <ItemRow {...value} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ItemsTable;