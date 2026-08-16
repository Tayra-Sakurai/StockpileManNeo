import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import LargeCategoryDetail from "../LargeCategoryDetail.jsx";

function LargeCategoryEdit() {
  const { id } = useParams();

  if (!id) throw new Error('Invalid id was given.');

  const handleId = parseInt(id);

  return (
    <>
      <Typography
        component="h2"
        variant="h2"
      >
        分類を編集
      </Typography>
      <LargeCategoryDetail id={handleId} />
    </>
  );
}

export default LargeCategoryEdit;