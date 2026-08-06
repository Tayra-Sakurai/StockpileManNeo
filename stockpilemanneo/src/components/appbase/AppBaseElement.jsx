import { Outlet } from "react-router-dom";
import BottomMenu from "./BottomMenu.jsx";
import BrandBar from "./BrandBar.jsx";

function AppBaseElement() {
  return (
    <>
      <BrandBar />
      <section>
        <Outlet />
      </section>
      <BottomMenu />
    </>
  );
}

export default AppBaseElement;