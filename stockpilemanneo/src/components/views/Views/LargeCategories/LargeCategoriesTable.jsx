import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import supabase from "../../../../client.js";
import LargeCategoryViewRow from "./LargeCategoryViewRow.jsx";

/**
 * 
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
 * The large category listing table.
 * @param {object} props The props.
 * @param {number=} props.largeLargeCategoryId The largest category's id.
 * @returns
 */
function LargeCategoriesTable({ largeLargeCategoryId }) {
  /**
   * @type {[
   *   {
   *     id: number,
   *     name: string,
   *     small_categories: {
   *       items: {
   *         count: number
   *       }[],
   *     }[],
   *     large_large_categories: ?{
   *       id: number,
   *       name: string,
   *     },
   *   }[],
   *   import ("react").Dispatch.<import ("react").SetStateAction.<{
   *     id: number,
   *     name: string,
   *     small_categories: {
   *       items: {
   *         count: number
   *       }[],
   *     }[],
   *     large_large_categories: ?{
   *       id: number,
   *       name: string,
   *     },
   *   }[]>>
   * ]}
   */
  const [data, setData] = useState([]);

  const isNarrow = useMediaQuery(theme => theme.breakpoints.down('sm'));

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

  if (isNarrow)
    return (
      <TableContainer sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>分類名</TableCell>
            <TableCell>品目数</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(value => <LargeCategoryViewRow {...value} />)}
        </TableBody>
      </TableContainer>
    );
  else
    return (
      <TableContainer sx={{ width: '100%' }}>
        <Table sx={{ width: 'max-content', }}>
          <TableHead>
            <TableRow>
              <TableCell>番号</TableCell>
              <TableCell>カテゴリ名</TableCell>
              <TableCell>大分類</TableCell>
              <TableCell>品目数</TableCell>
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