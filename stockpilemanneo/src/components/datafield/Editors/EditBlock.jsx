import { Paper, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

function EditBlock() {
  return (
    <Paper
      sx={{ width: '100%', height: '100%' }}
    >
      <Stack spacing="2">
        <Outlet />
      </Stack>
    </Paper>
  );
}

export default EditBlock;