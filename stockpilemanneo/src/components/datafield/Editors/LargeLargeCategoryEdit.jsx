import { Typography } from "@mui/material";
import LargeLargeCategoryDetail from "../LargeLargeCategoryDetail.jsx";
import { useParams } from "react-router-dom";

function LargeLargeCategoryEdit() {
  const { id } = useParams();

  if (!id) throw new Error('Invalid ID');

  const itemId = parseInt(id);

  return (
    <>
      <Typography variant="h2" component="h2">大分類を編集</Typography>
      <LargeLargeCategoryDetail item={itemId} />
    </>
  );
}

export default LargeLargeCategoryEdit;