import { Button, TableCell, TableRow } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";

/**
 * The item display table row.
 * @param {object} props The props.
 * @param {number} props.id The identity.
 * @param {string} props.name The name of the item.
 * @param {?string} props.life The life of the item.
 * @param {{name: string}} props.small_categories The small category.
 * @param {{name: string}} props.locations The location.
 * @returns
 */
function ItemRow({ id, name, life, small_categories, locations }) {
  const dueDate = life ? new Date(life) : null;

  const dueDateVal = dueDate?.toLocaleDateString() ?? 'なし';

  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{small_categories.name}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{dueDateVal}</TableCell>
      <TableCell>{locations.name}</TableCell>
      <TableCell>
        <Button
          component={RouterLink}
          to={`/Edit/items/${id}`}
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
        >
          編集
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default ItemRow;