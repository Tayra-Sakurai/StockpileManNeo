import { Outlet } from "react-router-dom";
import BottomMenu from "./BottomMenu.jsx";
import BrandBar from "./BrandBar.jsx";
import Box from "@mui/material/Box";

function AppBaseElement() {
  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <BrandBar />
      <Box component="div" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <BottomMenu />
    </Box>
  );
}

export default AppBaseElement;
