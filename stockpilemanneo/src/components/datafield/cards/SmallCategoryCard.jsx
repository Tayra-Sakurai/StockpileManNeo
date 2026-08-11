import { Avatar, Typography } from "@mui/material";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { useEffect, useState } from "react";
import { amber } from "@mui/material/colors";
import ClassIcon from "@mui/icons-material/Class";

/**
 * The small category viewer.
 * @param {object} props The props.
 * @param {number} props.number The number of the small category.
 * @returns
 */
function SmallCategoryCard({ number }) {
  const [title, setTitle] = useState('');
  const [largeCategoryName, setLargeCategoryName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('small_categories')
        .select('name, large_categories(name)')
        .eq('id', number);

      if (error) throw error;
      if (data) {
        setTitle(data[0].name);
        setLargeCategoryName(data[0].large_categories.name);
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
      <Typography
        variant="body2"
      >
        分類：{largeCategoryName}
      </Typography>
    </CommonCard>
  );
}

export default SmallCategoryCard;