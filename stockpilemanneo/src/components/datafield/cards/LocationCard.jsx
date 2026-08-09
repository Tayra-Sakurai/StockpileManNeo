import { useEffect, useState } from "react";
import CommonCard from "./CommonCard.jsx";
import supabase from "../../../client.js";

/**
 * The location card.
 * @param {object} props The props.
 * @param {number} props.number The number of the database.
 * @returns
 */
function LocationCard({ number }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('name')
        .eq('id', number);

      if (error) throw error;
      if (data) setTitle(data[0].name);
    };

    loadData();
  });

  return (
    <CommonCard
      itemId={number}
      table="locations"
      type="保管場所"
      title={title}
    />
  );
}

export default LocationCard;