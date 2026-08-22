import { Box, Button, Collapse, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useId, useState } from "react";

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
  const isWide = useMediaQuery(theme => theme.breakpoints.up('md'));

  const [open, setOpen] = useState(false);
  const detailId = useId();

  if (isWide)
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

  return (
    <>
      <TableRow sx={{ '& > .MuiTableCell-root': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand detail"
            aria-controls={detailId}
            size="small"
            onClick={() => setOpen(open => !open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{name}</TableCell>
        <TableCell align="right">
          <Link component={RouterLink} to={`/View/items/locations/${id}`}>
            {items[0].count}
          </Link>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{
            paddingBottom: 0,
            paddingTop: 0,
          }}
          colSpan={3}
        >
          <Collapse
            aria-label="detail"
            in={open}
            aria-expanded={open}
            timeout="auto"
            unmountOnExit
            id={detailId}
          >
            <Box
              sx={{
                margin: 1,
              }}
            >
              <Typography
                component="div"
                variant="h6"
                gutterBottom
              >
                詳細
              </Typography>
              <TableContainer
                sx={{
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Table
                  sx={{
                    width: 'fit-content',
                  }}
                  size="small"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>項目</TableCell>
                      <TableCell>値</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                      >
                        番号
                      </TableCell>
                      <TableCell>
                        {id}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                      >
                        操作
                      </TableCell>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/Edit/locations/${id}`}
                          variant="contained"
                          color="primary"
                          startIcon={<EditIcon />}
                          size="small"
                        >
                          編集
                        </Button>
                      </TableCell>
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

export default LocationViewRow;