import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import supabase from "../../../../client.js";
import LargeLargeCategoriesTable from "./LargeLargeCategoriesTable.jsx";

function LargeLargeCategoriesView() {
  /**
   * @type {[
   *   {
   *     id: number,
   *     name: string,
   *     large_categories: {
   *       small_categories: {
   *         items: {
   *           count: number,
   *         }[],
   *       }[],
   *     }[],
   *   }[],
   *   import("react").Dispatch.<import("react").SetStateAction.<{
   *     id: number,
   *     name: string,
   *     large_categories: {
   *       small_categories: {
   *         items: {
   *           count: number,
   *         }[],
   *       }[],
   *     }[],
   *   }[]
   * ]}
   */
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('large_large_categories')
        .select('id, name, large_categories!inner(small_categories!inner(items(count)))')
        .order('name', { ascending: true });

      if (error) console.error(error.message);
      if (data?.length)
        setDisplayData(data);
    };

    load();
  }, []);

  return (
    <>
      <Typography variant="h2" component="h2">大分類</Typography>
      <LargeLargeCategoriesTable displayData={displayData} />
    </>
  );
}

export default LargeLargeCategoriesView;