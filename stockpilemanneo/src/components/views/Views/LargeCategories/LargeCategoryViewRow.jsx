import { Box, Button, Collapse, IconButton, Link as MuiLink, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useId, useState } from "react";

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
  const isNarrow = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);

  const detailId = useId();

  /**
   * The number of items in the large category.
   * @type {number}
   */
  let itemCount = 0;

  for (const { items: [{ count }] } of small_categories)
    itemCount += count;

  if (isNarrow)
    return (
      <>
        <TableRow sx={{ '& > .MuiCell-root': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand detail"
              aria-controls={detailId}
              onClick={() => setOpen(val => !val)}
              size="small"
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>
            {name}
          </TableCell>
          <TableCell align="right">
            <MuiLink
              component={Link}
              to={`/View/small_categories/large_categories/${id}`}
            >
              {itemCount}
            </MuiLink>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ paddingTop: 0, paddingBottom: 0 }} colSpan={3}>
            <Collapse
              in={open}
              id={detailId}
              unmountOnExit
              timeout="auto"
              aria-label="Detail"
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
                  詳細情報
                </Typography>
                <TableContainer
                  sx={{
                    width: 'fit-content',
                    boxSizing: 'boder-box',
                  }}
                >
                  <Table
                    sx={{
                      width: 'fit-content',
                      boxSizing: 'border-box',
                    }}
                    size="small"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>項目名</TableCell>
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
                        <TableCell>{id}</TableCell>
                      </TableRow>
                      {
                        large_large_categories ?
                          <TableRow>
                            <TableCell
                              component="th"
                              scope="row"
                            >
                              大分類
                            </TableCell>
                            <TableCell>
                              <MuiLink
                                component={Link}
                                to={`/View/large_categories/large_large_categories/${large_large_categories.id}`}
                              >
                                {large_large_categories.name}
                              </MuiLink>
                            </TableCell>
                          </TableRow> :
                          null
                      }
                      <TableRow>
                        <TableCell
                          component="th"
                          scope="row"
                        >
                          操作
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            type="button"
                            component={Link}
                            to={`/Edit/large_categories/${id}`}
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
  else
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