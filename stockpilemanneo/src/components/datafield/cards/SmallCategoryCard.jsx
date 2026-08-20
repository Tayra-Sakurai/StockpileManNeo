import { Avatar, Breadcrumbs, Link } from "@mui/material";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { useEffect, useState } from "react";
import { amber } from "@mui/material/colors";
import ClassIcon from "@mui/icons-material/Class";
import { Link as RouterLink } from "react-router-dom";

/**
 * The small category viewer.
 * @param {object} props The props.
 * @param {number} props.number The number of the small category.
 * @returns
 */
function SmallCategoryCard({ number }) {
  const [title, setTitle] = useState('');
  const [largeCategoryName, setLargeCategoryName] = useState('');
  const [largeLargeCategoryName, setLargeLargeCategoryName] = useState('');
  const [largeCategoryId, setLargeCategoryId] = useState(0);
  const [largeLargeCategoryId, setLargeLargeCategoryId] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('small_categories')
        .select('name, large_categories(id, name, large_large_categories(id, name))')
        .eq('id', number);

      if (error) throw error;
      if (data[0]) {
        setTitle(data[0].name);
        setLargeCategoryName(data[0].large_categories.name);
        setLargeCategoryId(data[0].large_categories.id);
        setLargeLargeCategoryId(data[0].large_categories.large_large_categories?.id ?? 0);
        setLargeLargeCategoryName(data[0].large_categories.large_large_categories?.name ?? '');
      }
    };

    loadData();
  });

  return (
    <CommonCard
      title={title}
      itemId={number}
      table="small_categories"
      type="名称"
      avatar={
        <Avatar sx={{ bgcolor: amber[500] }}>
          <ClassIcon />
        </Avatar>
      }
      titleLink={`/View/items/small_categories/${number}`}
    >
      <Breadcrumbs>
        {
          (largeLargeCategoryId && largeLargeCategoryName) ?
            <Link
              component={RouterLink}
              to={`/View/large_categories/large_large_categories/${largeLargeCategoryId}`}
              color="inherit"
            >
              {largeLargeCategoryName}
            </Link> :
            null
        }
        <Link
          component={RouterLink}
          to={`/View/small_categories/large_categories/${largeCategoryId}`}
          color="inherit"
        >
          {largeCategoryName}
        </Link>
        <Link
          component={RouterLink}
          to={`/View/items/small_categories/${number}`}
          color="textPrimary"
        >
          {title}
        </Link>
      </Breadcrumbs>
    </CommonCard>
  );
}

export default SmallCategoryCard;