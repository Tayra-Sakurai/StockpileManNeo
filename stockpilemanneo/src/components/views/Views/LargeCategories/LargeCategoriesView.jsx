import { Box, Chip, Typography } from "@mui/material";
import LargeCategoriesTable from "./LargeCategoriesTable.jsx";
import { useParams } from "react-router";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

function LargeCategoriesView() {
  const { code } = useParams();

  return (
    <>
      <Typography variant="h2" component="h2">分類ごとの在庫</Typography>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexGrow: 0,
          flexShrink: 0,
          justifyContent: 'start',
          alignItems: 'stretch',
          flexDirection: 'row-reverse',
        }}
      >
        {!!code && <Chip icon={<AccountTreeIcon />} label={`大分類: ${code}`} />}
      </Box>
      <LargeCategoriesTable largeLargeCategoryId={code ? parseInt(code) : undefined} />
    </>
  );
}

export default LargeCategoriesView;