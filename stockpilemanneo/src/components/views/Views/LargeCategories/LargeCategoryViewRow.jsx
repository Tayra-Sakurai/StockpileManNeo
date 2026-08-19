import { Button, Link as MuiLink, TableCell, TableRow } from "@mui/material";
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';

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
 * @param {?{
 *   id: number,
 *   name: string,
 * }} props.large_large_categories The largest category.
 * @returns
 */
function LargeCategoryViewRow({ id, name, small_categories, large_large_categories }) {
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
      <TableCell>
        {large_large_categories &&
          <MuiLink
            component={Link}
            to={`/View/large_categories/large_large_categories/${large_large_categories.id}`}
          >
            {large_large_categories.name}
          </MuiLink>
        }
      </TableCell>
      <TableCell align="right">
        <MuiLink component={Link} to={`/View/small_categories/large_categories/${id}`}>
          {itemCount}
        </MuiLink>
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          color="primary"
          type="button"
          component={Link}
          to={`/Edit/large_categories/${id}`}
          startIcon={<EditIcon />}
        >
          編集
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default LargeCategoryViewRow;