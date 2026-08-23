/**
 * @fileoverview The speed dial of the addition actions.
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
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import ClassIcon from '@mui/icons-material/Class';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import { useNavigate } from "react-router-dom";
import AccountTreeIcon from '@mui/icons-material/AccountTree';

function SpecialActions() {
  const navigate = useNavigate();

  return (
    <SpeedDial
      ariaLabel="追加"
      sx={{
        position: 'fixed',
        bottom: {
          xs: 'calc(env(safe-area-inset-bottom) + 60px)',
          md: 'calc(env(safe-area-inset-bottom) + 16px)',
        },
        right: 16,
        zIndex(theme) {
          return theme.zIndex.speedDial;
        },
      }}
      icon={<SpeedDialIcon />}
    >
      <SpeedDialAction
        icon={<Inventory2Icon />}
        slotProps={{
          tooltip: {
            title: '品目',
          },
        }}
        onClick={() => navigate('/Add/items')}
      />
      <SpeedDialAction
        icon={<ClassIcon />}
        slotProps={{
          tooltip: {
            title: '名称',
          },
        }}
        onClick={() => navigate('/Add/small_categories')}
      />
      <SpeedDialAction
        icon={<CategoryIcon />}
        slotProps={{
          tooltip: {
            title: '分類',
          },
        }}
        onClick={() => navigate('/Add/large_categories')}
      />
      <SpeedDialAction
        icon={<AccountTreeIcon />}
        slotProps={{
          tooltip: {
            title: '大分類',
          },
        }}
        onClick={() => navigate('/Add/large_large_categories')}
      />
      <SpeedDialAction
        icon={<LocationPinIcon />}
        slotProps={{
          tooltip: {
            title: '保管場所',
          },
        }}
        onClick={() => navigate('/Add/locations')}
      />
    </SpeedDial>
  );
}

export default SpecialActions;