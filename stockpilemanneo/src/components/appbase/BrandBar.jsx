import { AppBar, Button, Menu, MenuItem } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { useContext, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import LogoutIcon from '@mui/icons-material/Logout';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import supabase from '../../client.js';
import UserViewContext from '../../sessionman/UserViewContext.jsx';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';

function BrandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const userData = useContext(UserViewContext);

  const toggleMenu = () => {
    setOpen(prev => !prev);
  };

  /**
   * The menu opening function
   * @param {Event} event
   * @returns
   */
  const handleOpenMenu = event => setAnchorEl(event.currentTarget);

  /**
   * The menu closing function.
   * @returns
   */
  const handleCloseMenu = () => setAnchorEl(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton
              type="button"
              aria-label="menu"
              onClick={toggleMenu}
              edge="start"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Inventory2Icon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              StockpileManNeo
            </Typography>
            {userData ? (
              <div>
                <IconButton
                  size="large"
                  onClick={handleOpenMenu}
                  color="inherit"
                  aria-controls="menu-account"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-account"
                  open={!!anchorEl}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                  }}
                  anchorEl={anchorEl}
                  transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                  }}
                  keepMounted
                >
                  <MenuItem onClick={handleCloseMenu}>ようこそ，{userData.email}</MenuItem>
                  <MenuItem onClick={signOut}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText>ログアウト</ListItemText>
                  </MenuItem>
                </Menu>
              </div>
            ) : (
              <Button color="inherit" onClick={() => navigate('/signin')} size="large" startIcon={<LoginIcon />}>
                サインイン
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Collapse in={open}>
        <List sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/" onClick={() => setOpen(false)}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="ホーム在庫" secondary="在庫、分類、保管場所を管理" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: { sm: 'none' } }}>
            <ListItemButton onClick={signOut}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="サインアウト" />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>
    </Box>
  );
}

export default BrandBar;
