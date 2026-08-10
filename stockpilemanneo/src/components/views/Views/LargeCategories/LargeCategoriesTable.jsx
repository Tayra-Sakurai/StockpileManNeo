import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import supabase from "../../../../client.js";
import LargeCategoryViewRow from "./LargeCategoryViewRow.jsx";

function LargeCategoriesTable() {
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
      const { data: d, error } = await supabase
        .from('large_categories')
        .select('id, name, small_categories(items(count))');
      if (error) throw error;

      if (d) setData(d);
    };

    load();
  }, []);

  return (
    <TableContainer sx={{ width: '100%' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>番号</TableCell>
            <TableCell>カテゴリ名</TableCell>
            <TableCell>品目数</TableCell>
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