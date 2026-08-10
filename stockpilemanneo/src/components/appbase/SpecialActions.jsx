import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import ClassIcon from '@mui/icons-material/Class';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import { useNavigate } from "react-router-dom";


function SpecialActions() {
  const navigate = useNavigate();

  return (
    <SpeedDial
      ariaLabel="追加"
      sx={{
        position: 'fixed',
        bottom: {
          xs: 56,
          md: 16,
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