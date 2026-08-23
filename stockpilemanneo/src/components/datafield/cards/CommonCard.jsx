/**
 * @fileoverview The card base element of the search page result.
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
import { Card, CardContent, CardHeader, IconButton, Link, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";

/**
 * The card common pieces.
 * @param {object} props The properties.
 * @param {string} props.type The data type.
 * @param {string} props.title The title of the card.
 * @param {number} props.itemId The item's id.
 * @param {string} props.table The data table name.
 * @param {string} props.titleLink The link target of the title.
 * @param {import("react").ReactNode} props.avatar The avatar of the card.
 * @param {import("react").JSX.Element=} props.children The content.
 * @returns
 */
function CommonCard({ type, title, itemId, table, titleLink, avatar, children }) {
  /**
   * @type {[
   *   ?EventTarget,
   *   import("react").Dispatch.<import("react").SetStateAction.<?EventTarget>>
   * ]}
   */
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Card
      variant="outlined"
    >
      <CardHeader
        avatar={avatar}
        title={title}
        subheader={type}
        action={
          <>
            <IconButton
              onClick={event => setAnchorEl(event.currentTarget)}
              aria-expanded={!!anchorEl}
              aria-controls={!anchorEl ? undefined : 'card-manu-menu'}
              aria-haspopup={true}
              id="menu-open-btn"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              open={!!anchorEl}
              aria-labelledby="menu-open-btn"
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              id="card-menu-menu"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem>
                <ListItemButton component={RouterLink} to={`/Edit/${table}/${itemId}`}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="編集" />
                </ListItemButton>
              </MenuItem>
            </Menu>
          </>
        }
      />
      <CardContent>
        <Link
          component={RouterLink}
          to={titleLink}
        >
          <Typography
            variant="h5"
            component="div"
            color="textPrimary"
          >
            {title}
          </Typography>
        </Link>
        {children}
      </CardContent>
    </Card>
  );
}

export default CommonCard;