import { Alert, Box, Button, Collapse, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const WARNING_PERIOD = 30;

/**
 * The item display table row.
 * @param {object} props The props.
 * @param {number} props.id The identity.
 * @param {string} props.name The name of the item.
 * @param {?string} props.life The life of the item.
 * @param {{name: string, id: number}} props.small_categories The small category.
 * @param {{name: string, id: number}} props.locations The location.
 * @returns
 */
function ItemRow({ id, name, life, small_categories, locations }) {
  const dueDate = life ? new Date(life) : null;
  const [open, setOpen] = useState(false);

  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + WARNING_PERIOD);

  const dueDateVal = dueDate?.toLocaleDateString() ?? 'なし';

  return (
    <>
      <TableRow sx={{ '& > .MuiCell-root': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand detail"
            type="button"
            size="small"
            onClick={() => setOpen(val => !val)}
          >
            {open ? <KeyboardArrowUpIcon /> : ((dueDate && dueDate < warningDate) ? <WarningAmberIcon color="warning" /> : <KeyboardArrowDownIcon />)}
          </IconButton>
        </TableCell>
        <TableCell>
          <Link component={RouterLink} to={`/View/items/small_categories/${small_categories.id}`}>
            {small_categories.name}
          </Link>
        </TableCell>
        <TableCell>
          <Link component={RouterLink} to={`/View/items/locations/${locations.id}`}>
            {locations.name}
          </Link>
        </TableCell>
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
      <TableRow>
        <TableCell style={{ paddingTop: 0, paddingBottom: 0 }} colSpan={4}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
          >
            <Box sx={{ margin: 1 }}>
              {(dueDate && dueDate < warningDate) ?
                <Alert severity="warning">期限が間近です</Alert> :
                null
              }
              <Typography component="div" variant="h6" gutterBottom>詳細</Typography>
              <TableContainer sx={{ maxWidth: '100%' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>項目</TableCell>
                      <TableCell>内容</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">番号</TableCell>
                      <TableCell>{id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">期限</TableCell>
                      <TableCell>{dueDateVal}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">商品名</TableCell>
                      <TableCell>{name}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default ItemRow;