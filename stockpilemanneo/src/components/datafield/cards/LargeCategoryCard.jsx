import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { useEffect, useState } from "react";

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
    />
  );
}

export default LargeCategoryCard;