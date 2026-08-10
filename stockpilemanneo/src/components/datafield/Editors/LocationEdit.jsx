import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import LocationDetail from "../LocationDetail.jsx";

function LocationEdit() {
  const { id } = useParams();

  return (
    <>
      <Typography variant="h2" component="h2">保管場所を編集</Typography>
      <LocationDetail id={parseInt(id ?? '0') || 0} />
    </>
  );
}

export default LocationEdit;