import { Button, Link, TableCell, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";

/**
 * The large categories.
 * @typedef {Array.<{
 *   small_categories: Array.<{
 *     items: Array.<{
 *       count: number
 *     }>
 *   }>
 * }>} LLDetail
 */

/**
 * The largest category row.
 * @param {object} props The props.
 * @param {number} props.itemId The item's id.
 * @param {string} props.name The name of the largest category.
 * @param {LLDetail} props.large_categories The large categories related to it.
 * @returns
 */
function LargeLargeCategoryRow({ name, itemId, large_categories }) {
  const [itms, setItms] = useState(0);

  useEffect(() => {
    const load = async () => {
      for (const { small_categories } of large_categories)
        for (const { items } of small_categories)
          if (items[0])
            setItms(i => i + items[0].count);
    };

    load();

    return () => setItms(0);
  }, [large_categories]);

  return (
    <TableRow>
      <TableCell align="right">{itemId}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell align="right">
        <Link component={RouterLink} to={`/View/large_categories/large_large_categories/${itemId}`}>
          {itms}
        </Link>
      </TableCell>
      <TableCell>
        <Button
          component={RouterLink}
          to={`/Edit/large_large_categories/${itemId}`}
          color="primary"
          variant="contained"
          startIcon={<EditIcon />}
        >
          編集
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default LargeLargeCategoryRow;