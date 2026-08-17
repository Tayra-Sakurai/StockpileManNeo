import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import supabase from "../../../../client.js";
import LargeCategoryViewRow from "./LargeCategoryViewRow.jsx";

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
   *   }[],
   *   import ("react").Dispatch.<import ("react").SetStateAction.<{
   *     id: number,
   *     name: string,
   *     small_categories: {
   *       items: {
   *         count: number
   *       }[],
   *     }[],
   *   }[]>>
   * ]}
   */
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!largeLargeCategoryId) {
        const { data: d, error } = await supabase
          .from('large_categories')
          .select('id, name, small_categories(items(count))')
          .order('name', { ascending: true });
        if (error) throw error;

        if (d) setData(d);
      } else {
        const { data: d, error } = await supabase
          .from('large_categories')
          .select('id, name, small_categories(items(count))')
          .eq('large_large_category_id', largeLargeCategoryId)
          .order('name', { ascending: true });

        if (error) throw error;
        if (d) setData(d);
      }
    };

    load();
  }, [largeLargeCategoryId]);

  return (
    <TableContainer sx={{ width: '100%' }}>
      <Table sx={{ width: 'max-content', }}>
        <TableHead>
          <TableRow>
            <TableCell>番号</TableCell>
            <TableCell>カテゴリ名</TableCell>
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