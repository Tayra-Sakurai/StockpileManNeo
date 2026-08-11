import { useEffect, useState } from "react";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { Avatar, Breadcrumbs, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
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
  const [smallCategoryId, setSmallCategoryId] = useState(0);
  const [largeCategoryId, setLargeCategoryId] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('name, life, description, locations!inner(name), small_categories!inner(id, name, large_categories!inner(id, name))')
        .eq('id', number);

      if (error) throw error;
      if (data) {
        setTitle(data[0].name);
        setLife(data[0].life ? new Date(data[0].life).toLocaleDateString() : '');
        setNotes(data[0].description || '');
        setLocation(data[0].locations.name);
        setSmallCategory(data[0].small_categories.name);
        setLargeCategory(data[0].small_categories.large_categories.name);
        setSmallCategoryId(data[0].small_categories.id);
        setLargeCategoryId(data[0].small_categories.large_categories.id);
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
        >
          {notes}
        </Typography>
        <List
          sx={{ width: '100%', bgcolor: 'background.paper' }}
        >
          <ListItem>
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            <ListItemText>
              {life || 'なし'}
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationOnIcon />
            </ListItemIcon>
            <ListItemText>
              {location}
            </ListItemText>
          </ListItem>
        </List>
      </>
    </CommonCard>
  );
}

export default ItemCard;