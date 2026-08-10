import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import { useState } from "react";
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
  const [value, setValue] = useState(-1);
  const navigate = useNavigate();

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
        zIndex(theme) {
          return theme.zIndex.appBar;
        },
      }}
    >
      <BottomNavigation showLabels value={value} onChange={(event, newValue) => {
        navigate(DESTINATIONS[newValue].dest);
        setValue(newValue);
      }}>
        <BottomNavigationAction label="概要" icon={<HomeIcon />} />
        <BottomNavigationAction label="検索" icon={<SearchIcon />} />
        <BottomNavigationAction label="分類" icon={<CategoryIcon />} />
        <BottomNavigationAction label="場所" icon={<PlaceIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomMenu;
