import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import ItemDetail from "../ItemDetail.jsx";

function ItemEdit() {
  const { id } = useParams();

  return (
    <>
      <Typography component="h2" variant="h2">品目を編集</Typography>
      <ItemDetail id={parseInt(id ?? '0') || 0} />
    </>
  );
}

export default ItemEdit;