/**
 * @fileoverview Application base page component.
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
import { Outlet, useSearchParams } from "react-router-dom";
import BottomMenu from "./BottomMenu.jsx";
import BrandBar from "./BrandBar.jsx";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import supabase from "../../client.js";
import UserViewContext from "../../sessionman/UserViewContext.jsx";
import SpecialActions from "./SpecialActions.jsx";
import { Divider } from "@mui/material";

function AppBaseElement() {
  const [searchParams] = useSearchParams();
  /**
   * @type {[
   *   (import("@supabase/supabase-js").User|null),
   *   import("react").Dispatch<import("react").SetStateAction<(import("@supabase/supabase-js").User|null)>>
   * ]}
   */
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userSet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
    };
    userSet();
  }, [searchParams]);

  return (
    <Box sx={{
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      padding: [0, 2],
    }}>
      <UserViewContext.Provider value={userData}>
        <BrandBar />
      </UserViewContext.Provider>
      <Box component="div" sx={{
        flexGrow: 1,
      }}>
        <Outlet />
      </Box>
      <Divider />
      <Box
        component="footer"
      >
        
      </Box>
      <SpecialActions />
      <BottomMenu />
    </Box>
  );
}

export default AppBaseElement;
