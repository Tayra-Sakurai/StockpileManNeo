/**
 * @fileoverview Item specific search result card.
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
import { useEffect, useState } from "react";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { Avatar, Breadcrumbs, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { indigo } from "@mui/material/colors";
import Inventory2Icon from "@mui/icons-material/Inventory2";

/**
 * The item card.
 * @param {object} props The props.
 * @param {number} props.number The item number.
 * @returns
 */
function ItemCard({ number }) {
  const [title, setTitle] = useState('');
  const [life, setLife] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [smallCategory, setSmallCategory] = useState('');
  const [largeCategory, setLargeCategory] = useState('');
  const [largeLargeCategory, setLargeLargeCategory] = useState('');
  const [smallCategoryId, setSmallCategoryId] = useState(0);
  const [largeCategoryId, setLargeCategoryId] = useState(0);
  const [locationId, setLocationId] = useState(0);
  const [largeLargeCategoryId, setLargeLargeCategoryId] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('name, life, description, locations!inner(id, name), small_categories!inner(id, name, large_categories!inner(id, name, large_large_categories(id, name)))')
        .eq('id', number);

      if (error) throw error;
      if (data[0]) {
        setTitle(data[0].name);
        setLife(data[0].life ? new Date(data[0].life).toLocaleDateString() : '');
        setNotes(data[0].description || '');
        setLocation(data[0].locations.name);
        setSmallCategory(data[0].small_categories.name);
        setLargeCategory(data[0].small_categories.large_categories.name);
        setLargeLargeCategory(data[0].small_categories.large_categories.large_large_categories?.name ?? '');
        setSmallCategoryId(data[0].small_categories.id);
        setLargeCategoryId(data[0].small_categories.large_categories.id);
        setLocationId(data[0].locations.id);
        setLargeLargeCategoryId(data[0].small_categories.large_categories.large_large_categories?.id ?? 0);
      }
    };

    loadData();
  });

  return (
    <CommonCard
      itemId={number}
      title={title}
      type="品目"
      table="items"
      titleLink={`/Edit/items/${number}`}
      avatar={
        <Avatar sx={{ bgcolor: indigo[500] }}>
          <Inventory2Icon />
        </Avatar>
      }
    >
      <>
        <Breadcrumbs>
          {(largeLargeCategory && largeLargeCategoryId) ?
            <Link
              to={`View/large_categories/large_large_categories/${largeLargeCategoryId}`}
              component={RouterLink}
              color="inherit"
            >
              {largeLargeCategory}
            </Link> :
            null
          }
          <Link
            to={`/View/small_categories/large_categories/${largeCategoryId}`}
            component={RouterLink}
            color="inherit"
          >
            {largeCategory}
          </Link>
          <Link
            component={RouterLink}
            color="inherit"
            to={`/View/items/small_categories/${smallCategoryId}`}
          >
            {smallCategory}
          </Link>
          <Link
            component={RouterLink}
            color="textPrimary"
            to={`/Edit/items/${number}`}
          >
            {title}
          </Link>
        </Breadcrumbs>
        <Typography
          variant="body2"
          component="div"
        >
          {notes}
        </Typography>
        <List
          sx={{ width: '100%', bgcolor: 'background.paper' }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
              <ListItemText>
                {life || 'なし'}
              </ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton component={RouterLink} to={`/View/items/locations/${locationId}`}>
              <ListItemIcon>
                <LocationOnIcon />
              </ListItemIcon>
              <ListItemText>
                {location}
              </ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </>
    </CommonCard>
  );
}

export default ItemCard;
