/**
 * @fileoverview The page to add a data.
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
import { Paper, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

function AddBlock() {
  return (
    <Paper sx={{ width: '100%', padding: 2, boxSizing: 'border-box' }}>
      <Stack spacing="2">
        <Typography variant="h2" component="h2">項目を追加</Typography>
        <Outlet />
      </Stack>
    </Paper>
  );
}

export default AddBlock;