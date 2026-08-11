import { Avatar } from "@mui/material";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { useEffect, useState } from "react";
import { deepPurple } from "@mui/material/colors";
import CategoryIcon from "@mui/icons-material/Category";

/**
 * The large category displayer.
 * @param {object} props The properties.
 * @param {number} props.number The number id of the data.
 * @returns
 */
function LargeCategoryCard({ number }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    const loadFunc = async () => {
      const { data, error } = await supabase
        .from('large_categories')
        .select('name')
        .eq('id', number);

      if (error) throw error;
      if (data) setTitle(data[0].name);
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
    />
  );
}

export default LargeCategoryCard;