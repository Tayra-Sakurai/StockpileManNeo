import { Paper, Stack, Typography } from "@mui/material";
import LocationsTable from "./LocationsTable.jsx";

function LocationsView() {
  return (
    <Paper sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h2" component="h2">保管場所の情報</Typography>
        <LocationsTable />
      </Stack>
    </Paper>
  );
}

export default LocationsView;