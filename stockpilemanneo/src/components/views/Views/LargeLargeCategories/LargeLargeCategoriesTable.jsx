import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import LargeLargeCategoryRow from "./LargeLargeCategoryRow.jsx";

/**
 * Largest categories display table.
 * @param {object} props The props.
 * @param {{
 *   id: number,
 *   name: string,
 *   large_categories: import("./LargeLargeCategoryRow.jsx").LLDetail,
 * }[]} props.displayData The displaying data.
 * @returns
 */
function LargeLargeCategoriesTable({ displayData }) {
  return (
    <TableContainer
      sx={{ width: '100%', overflow: 'scroll' }}
    >
      <Table sx={{ width: 'max-content' }}>
        <TableHead>
          <TableRow>
            <TableCell>番号</TableCell>
            <TableCell>分類名</TableCell>
            <TableCell align="right">品目数</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayData.map(({ id, ...others }) => <LargeLargeCategoryRow itemId={id} {...others} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LargeLargeCategoriesTable;