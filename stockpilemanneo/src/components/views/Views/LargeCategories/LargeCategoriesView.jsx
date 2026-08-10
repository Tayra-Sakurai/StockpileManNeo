import { Typography } from "@mui/material";
import LargeCategoriesTable from "./LargeCategoriesTable.jsx";

function LargeCategoriesView() {
  return (
    <>
      <Typography variant="h2" component="h2">分類ごとの在庫</Typography>
      <LargeCategoriesTable />
    </>
  );
}

export default LargeCategoriesView;