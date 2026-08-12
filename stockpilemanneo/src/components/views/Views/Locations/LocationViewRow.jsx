import { Button, Link, TableCell, TableRow } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';

/**
 * The table row of the location table.
 * @param {object} props The properties.
 * @param {number} props.id The location id.
 * @param {string} props.name The name of the location.
 * @param {{
 *   count: number,
 * }[]} props.items The items at the location.
 * @returns
 */
function LocationViewRow({ id, name, items }) {
  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell align="right">
        <Link component={RouterLink} to={`/View/items/locations/${id}`}>
          {items[0].count}
        </Link>
      </TableCell>
      <TableCell>
        <Button
          component={RouterLink}
          to={`/Edit/locations/${id}`}
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

export default LocationViewRow;