import { Button, TableCell, TableRow } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
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
      <TableCell align="right">{items[0].count}</TableCell>
      <TableCell>
        <Button
          component={RouterLink}
          to={`/View/items/locations/${id}`}
          variant="contained"
          color="info"
          startIcon={<LibraryBooksIcon />}
        >
          品目を確認する
        </Button>
        <Button
          component={RouterLink}
          to={`/Edit/locations/${id}`}
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
        >
          内容を編集する
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default LocationViewRow;