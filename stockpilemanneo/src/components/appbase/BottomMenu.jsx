import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const DESTINATIONS = [
  {
    label: '概要',
    to: '/',
    expression: /^\/(Home)?$/,
    icon: < HomeIcon />,
  },
  {
    label: '検索',
    to: '/Search',
    expression: /^\/Search$/,
    icon: <SearchIcon />,
  },
  {
    label: '分類',
    to: '/View/large_categories',
    expression: /^\/View\/(large|small)_categories/,
    icon: <CategoryIcon />,
  },
  {
    label: '場所',
    to: '/View/locations',
    expression: /^\/View\/locations(\/\d+)?$/,
    icon: <PlaceIcon />,
  },
];

function BottomMenu() {
  const [value, setValue] = useState(-1);
  const path = useLocation();

  useEffect(() => {
    const valueMover = async () => {
      const match = DESTINATIONS.findIndex(({ expression }) => expression.exec(path.pathname));
      setValue(match);
    };

    valueMover();
  }, [path]);

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
      <BottomNavigation showLabels value={value} onChange={(event, newValue) => setValue(newValue)}>
        {DESTINATIONS.map(({ expression, ...props }) => (
          <BottomNavigationAction component={RouterLink} {...props} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomMenu;
