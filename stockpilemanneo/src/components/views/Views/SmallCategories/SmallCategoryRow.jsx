import { Link, TableCell, TableRow } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * The small category viewer row.
 * @param {object} props The props.
 * @param {number} props.itemId The item's id.
 * @param {string} props.name The property's name.
 * @param {{
 *   id: number,
 *   name: string,
 * }} props.large_categories The related large category.
 * @param {{
 *   count: number,
 * }[]} props.items The related items.
 * @returns
 */
function SmallCategoryRow({ itemId, name, large_categories, items }) {
  return (
    <TableRow>
      <TableCell>{itemId}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>
        <Link component={RouterLink} to={`/View/small_categories/large_categories/${large_categories.id}`}>
          {large_categories.name}
        </Link>
      </TableCell>
      <TableCell align="right">
        <Link component={RouterLink} to={`/View/items/small_categories/${itemId}`}>
          {items[0].count}
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default SmallCategoryRow;