import { Paper, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

function AddBlock() {
  return (
    <Paper sx={{ width: '100%', padding: 2 }}>
      <Stack spacing="2">
        <Typography variant="h2" component="h2">項目を追加</Typography>
        <Outlet />
      </Stack>
    </Paper>
  );
}

export default AddBlock;