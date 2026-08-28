/**
 * @fileoverview The bottom navigation of the application base pages for mobile devices.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
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
    expression: /\/(Chat)?$/,
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
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        display(theme) {
          return {
            [theme.breakpoints.up('md')]: 'none',
            [theme.breakpoints.down('md')]: 'block',
          };
        },
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
    </Box>
  );
}

export default BottomMenu;
