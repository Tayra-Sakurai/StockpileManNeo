import { Outlet, useSearchParams } from "react-router-dom";
import BottomMenu from "./BottomMenu.jsx";
import BrandBar from "./BrandBar.jsx";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import supabase from "../../client.js";
import UserViewContext from "../../sessionman/UserViewContext.jsx";
import SpecialActions from "./SpecialActions.jsx";

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
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <UserViewContext.Provider value={userData}>
        <BrandBar />
      </UserViewContext.Provider>
      <Box component="div" sx={{ flexGrow: 1 }}>
        <Outlet />
        <SpecialActions />
      </Box>
      <BottomMenu />
    </Box>
  );
}

export default AppBaseElement;
