import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';

const DESTINATIONS = [
  {
    label: '検索',
    to: '/Search',
    expression: /^\/Search$/,
    icon: <SearchIcon />,
  },
  {
    label: '項目',
    to: '/View/items',
    expression: /^\/View\/items(\/(small_categories|locations)\/\d+)?$/,
    icon: <Inventory2Icon />,
  },
  {
    label: 'チャット',
    to: '/Chat',
    expression: /\/(Chat)?/,
    icon: <ChatIcon />,
  },
  {
    label: '分類',
    to: '/View/large_large_categories',
    expression: /^\/View\/((large_){1,2}|small_)categories/,
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
        paddingBottom: 'env(safe-area-inset-bottom)',
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
