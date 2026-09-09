import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import LargeLargeCategoryRow from "./LargeLargeCategoryRow.jsx";

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
 * Largest categories display table.
 * @param {object} props The props.
 * @param {LargeLargeCategoryData[]} props.displayData The displaying data.
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