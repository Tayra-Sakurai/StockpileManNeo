import { Avatar, Breadcrumbs, Link } from "@mui/material";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { useEffect, useState } from "react";
import { deepPurple } from "@mui/material/colors";
import CategoryIcon from "@mui/icons-material/Category";
import { Link as RouterLink } from "react-router-dom";

/**
 * The large category displayer.
 * @param {object} props The properties.
 * @param {number} props.number The number id of the data.
 * @returns
 */
function LargeCategoryCard({ number }) {
  const [title, setTitle] = useState('');
  const [largeLargeCategory, setLargeLargeCategory] = useState('');
  const [largeLargeCategoryId, setLargeLargeCategoryId] = useState(0);

  useEffect(() => {
    const loadFunc = async () => {
      const { data, error } = await supabase
        .from('large_categories')
        .select('name, large_large_categories(id, name)')
        .eq('id', number);

      if (error) throw error;
      if (data.length) {
        setTitle(data[0].name);
        setLargeLargeCategory(data[0].large_large_categories?.name ?? '');
        setLargeLargeCategoryId(data[0].large_large_categories?.id ?? 0);
      }
    };

    loadFunc();
  });

  return (
    <CommonCard
      type="カテゴリ"
      title={title}
      table="large_categories"
      itemId={number}
      titleLink={`/View/small_categories/large_categories/${number}`}
      avatar={
        <Avatar sx={{ bgcolor: deepPurple[500] }}>
          <CategoryIcon />
        </Avatar>
      }
    >
      {
        largeLargeCategoryId ?
          <Breadcrumbs>
            <Link
              component={RouterLink}
              to={`/View/large_categories/large_large_categories/${largeLargeCategoryId}`}
              color="inherit"
            >
              {largeLargeCategory}
            </Link>
            <Link
              component={RouterLink}
              to={`/View/small_categories/large_categories/${number}`}
              color="textPrimary"
            >
              {title}
            </Link>
          </Breadcrumbs>
          : undefined
      }
    </CommonCard>
  );
}

export default LargeCategoryCard;