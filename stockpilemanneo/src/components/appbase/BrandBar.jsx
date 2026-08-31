/**
 * @fileoverview The application bar component of the application pages.
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
import { AppBar, Button, Drawer, Menu, MenuItem } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
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
import { Link as RouterLink, useNavigate } from 'react-router';
import supabase from '../../client.js';
import UserViewContext from '../../sessionman/UserViewContext.jsx';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import CategoryIcon from '@mui/icons-material/Category';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import ChatIcon from '@mui/icons-material/Chat';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import InfoIcon from '@mui/icons-material/Info';
import PolicyIcon from '@mui/icons-material/Policy';

function BrandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * @type {[
   *   ?EventTarget,
   *   import('react').Dispatch.<import('react').SetStateAction.<?EventTarget>>
   * ]}
   */
  const [anchorEl, setAnchorEl] = useState(null);

  const userData = useContext(UserViewContext);

  const toggleMenu = () => {
    setOpen(prev => !prev);
  };

  /**
   * The menu opening function
   * @param {import('react').MouseEvent<HTMLButtonElement, MouseEvent>} event The event arguments.
   * @returns {void}
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
    <>
      <Box component="header" sx={{
        position: 'sticky',
        top: 0,
        zIndex(theme) {
          return theme.zIndex.drawer + 1;
        },
      }}>
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
                StockpileMan&nbsp;neo
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
                    <MenuItem onClick={handleCloseMenu}>ようこそ，{userData.user_metadata.display_name ?? userData.email}さん</MenuItem>
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
      </Box>
      <Drawer open={open} onClose={() => setOpen(false)} anchor="top">
        <Toolbar />
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
          <List sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/Live" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <RecordVoiceOverIcon />
                </ListItemIcon>
                <ListItemText primary="ライブチャット（テスト版）" secondary="Gemini Live API によるリアルタイム在庫検索エージェント" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/Chat" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText primary="チャット" secondary="Gemini とチャットで在庫を確認" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/Search" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="ホーム在庫" secondary="在庫、分類、保管場所を管理" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/View/items" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <Inventory2Icon />
                </ListItemIcon>
                <ListItemText primary="在庫一覧" secondary="在庫の一覧を表示します" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/View/large_large_categories" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText primary="分類別一覧" secondary="分類別に在庫数を確認します" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/View/locations" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <LocationPinIcon />
                </ListItemIcon>
                <ListItemText primary="保管場所一覧" secondary="保管場所ごとの在庫状況を確認できます" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/Thanks" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText primary="謝辞" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/Terms" onClick={() => setOpen(false)}>
                <ListItemIcon>
                  <PolicyIcon />
                </ListItemIcon>
                <ListItemText primary="利用規約" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default BrandBar;
