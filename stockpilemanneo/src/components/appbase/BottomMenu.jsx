import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PlaceIcon from '@mui/icons-material/Place';

function BottomMenu() {
  const changeView = (view) => {
    window.dispatchEvent(new CustomEvent('stockpile-view-change', { detail: view }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <BottomNavigation showLabels value={0}>
        <BottomNavigationAction label="概要" icon={<HomeIcon />} onClick={() => changeView('overview')} />
        <BottomNavigationAction label="在庫" icon={<Inventory2Icon />} onClick={() => changeView('items')} />
        <BottomNavigationAction label="分類" icon={<CategoryIcon />} onClick={() => changeView('taxonomy')} />
        <BottomNavigationAction label="場所" icon={<PlaceIcon />} onClick={() => changeView('locations')} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomMenu;
