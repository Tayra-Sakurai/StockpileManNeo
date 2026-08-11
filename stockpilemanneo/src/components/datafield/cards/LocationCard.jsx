import { useEffect, useState } from "react";
import CommonCard from "./CommonCard.jsx";
import supabase from "../../../client.js";
import { Avatar } from "@mui/material";
import { red } from "@mui/material/colors";
import LocationPinIcon from "@mui/icons-material/LocationPin";

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
      titleLink={`/View/items/locations/${number}`}
      avatar={
        <Avatar sx={{ bgcolor: red[500] }}>
          <LocationPinIcon />
        </Avatar>
      }
    />
  );
}

export default LocationCard;