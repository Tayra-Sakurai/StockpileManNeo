import { TableCell, TableRow } from "@mui/material";

/**
 * The large category table view row.
 * @param {object} props The props.
 * @param {number} props.id The identity.
 * @param {string} props.name The name of the large category.
 * @param {Array.<{
 *   items: Array.<{
 *     count: number,
 *   }>,
 * }>} props.small_categories The small categories.
 * @returns
 */
function LargeCategoryViewRow({ id, name, small_categories }) {
  /**
   * The number of items in the large category.
   * @type {number}
   */
  let itemCount = 0;

  for (const { items: [{ count }] } of small_categories)
    itemCount += count;

  return (
    <TableRow>
      <TableCell align="right">{id}</TableCell>
      <TableCell align="left">{name}</TableCell>
      <TableCell align="right">{itemCount}</TableCell>
    </TableRow>
  );
}

export default LargeCategoryViewRow;