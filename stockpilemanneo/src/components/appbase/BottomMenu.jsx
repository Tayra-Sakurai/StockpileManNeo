import { BottomNavigation, Paper } from "@mui/material";

function BottomMenu() {
  return (
    <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation>
      </BottomNavigation>
    </Paper>
  );
}

export default BottomMenu;