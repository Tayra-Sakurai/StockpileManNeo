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