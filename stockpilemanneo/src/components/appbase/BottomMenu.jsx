import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PlaceIcon from '@mui/icons-material/Place';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DESTINATIONS = [
  {
    dest: '/',
    expression: /\/(Home)?/,
  },
  {
    dest: '/Search',
    expression: /\/Search/,
  },
  {
    dest: '/Views/large_categories',
    expression: /\/Views\/(large|small)_categories/,
  },
  {
    dest: '/Views/locations',
    expression: /\/Views\/locations/,
  },
];

function BottomMenu() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    navigate(DESTINATIONS[value].dest);
  }, [value, navigate]);

  return (
    <Paper
      component="nav"
      elevation={0}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        display: { xs: 'block', md: 'none' },
      }}
    >
      <BottomNavigation showLabels value={value} onChange={(event, newValue) => {
        setValue(newValue);
      }}>
        <BottomNavigationAction label="概要" icon={<HomeIcon />} />
        <BottomNavigationAction label="検索" icon={<Inventory2Icon />} />
        <BottomNavigationAction label="分類" icon={<CategoryIcon />} />
        <BottomNavigationAction label="場所" icon={<PlaceIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomMenu;
