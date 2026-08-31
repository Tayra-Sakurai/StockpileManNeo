import { Box, Button, Collapse, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery } from "@mui/material";
import { Link as RouterLink } from "react-router";
import EditIcon from "@mui/icons-material/Edit";
import { useId, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

/**
 * The small category viewer row.
 * @param {object} props The props.
 * @param {number} props.itemId The item's id.
 * @param {string} props.name The property's name.
 * @param {{
 *   id: number,
 *   name: string,
 *   large_large_categories: ?{
 *     id: number,
 *     name: string,
 *   },
 * }} props.large_categories The related large category.
 * @param {{
 *   count: number,
 * }[]} props.items The related items.
 * @returns
 */
function SmallCategoryRow({ itemId, name, large_categories, items }) {
  const isWide = useMediaQuery(theme => theme.breakpoints.up('md'));
  const detailId = useId();
  const [open, setOpen] = useState(false);

  if (isWide)
    return (
      <TableRow>
        <TableCell>{itemId}</TableCell>
        <TableCell>{name}</TableCell>
        <TableCell>
          {large_categories.large_large_categories &&
            <Link
              component={RouterLink}
              to={`/View/large_categories/large_large_categories/${large_categories.large_large_categories.id}`}
            >
              {large_categories.large_large_categories.name}
            </Link>
          }
        </TableCell>
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
        <TableCell>
          <Button
            component={RouterLink}
            to={`/Edit/small_categories/${itemId}`}
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
          <Link component={RouterLink} to={`/View/items/small_categories/${itemId}`}>
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
                      <TableCell>{itemId}</TableCell>
                    </TableRow>
                    {
                      large_categories.large_large_categories &&
                      <TableRow>
                        <TableCell
                          component="th"
                          scope="row"
                        >
                          大分類
                        </TableCell>
                        <TableCell>
                          <Link
                            component={RouterLink}
                            to={`/View/large_categories/large_large_categories/${large_categories.large_large_categories.id}`}
                          >
                            {large_categories.large_large_categories.name}
                          </Link>
                        </TableCell>
                      </TableRow>
                    }
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                      >
                        分類
                      </TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={`/View/small_categories/large_categories/${large_categories.id}`}
                        >
                          {large_categories.name}
                        </Link>
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
                          to={`/Edit/small_categories/${itemId}`}
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

export default SmallCategoryRow;