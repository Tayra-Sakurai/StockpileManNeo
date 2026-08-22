import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery } from "@mui/material";
import SmallCategoryRow from "./SmallCategoryRow.jsx";

/**
 * The small category viewer table.
 * @param {object} props The props.
 * @param {{
 *   id: number,
 *   name: string,
 *   large_categories: {
 *     name: string,
 *     id: number,
 *     large_large_categories: ?{
 *       id: number,
 *       name: string,
 *     },
 *   },
 *   items: {
 *     count: number,
 *   }[],
 * }[]} props.smallCategories The displaying small categories.
 * @returns
 */
function SmallCategoriesTable({ smallCategories }) {
  const isWide = useMediaQuery(theme => theme.breakpoints.up('md'));

  if (isWide)
    return (
      <TableContainer sx={{ width: '100%', overflow: 'scroll', margin: 0 }}>
        <Table sx={{ width: 'max-content', }}>
          <TableHead>
            <TableRow>
              <TableCell>番号</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>大分類</TableCell>
              <TableCell>分類</TableCell>
              <TableCell align="right">品目数</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {smallCategories.map(({ id, ...otherProps }) =>
              <SmallCategoryRow itemId={id} {...otherProps} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
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
      >
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>名称</TableCell>
            <TableCell align="right">品目数</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {smallCategories.map(({ id, ...otherProps }) => <SmallCategoryRow itemId={id} {...otherProps} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SmallCategoriesTable;