import { Paper, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import supabase from "../../client.js";
import { calcInnerProduct, createSearchVector } from "../stockpile/stockpileVectors.js";
import ItemCard from "../datafield/cards/ItemCard.jsx";
import LocationCard from "../datafield/cards/LocationCard.jsx";
import LargeCategoryCard from "../datafield/cards/LargeCategoryCard.jsx";
import SmallCategoryCard from "../datafield/cards/SmallCategoryCard.jsx";

/**
 * @type {Array.<"large_categories"|"small_categories"|"locations"|"items">}
 * @constant
 */
const TABLES = [
  'large_categories',
  'small_categories',
  'locations',
  'items',
];

/**
 * The search result display object.
 * @typedef {object} ResultMark
 * @property {number} id The identity of the result object.
 * @property {"large_categories" | "small_categories" | "locations" | "items"} table The table name.
 * @property {number} matchRate The matching rate.
 */

/**
 * The search result displayer.
 * @returns
 */
function SearchResults() {
  const [searchParams] = useSearchParams();

  /**
   * @type {[
   *   ResultMark[],
   *   import("react").Dispatch.<import("react").SetStateAction.<ResultMark[]>>
   * ]}
   */
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      const searchVector = await createSearchVector(searchParams.get('q') ?? '');

      /** @type {Array.<ResultMark>} */
      const results = [];

      for (const table of TABLES) {
        if (!searchParams.getAll('tables').some(val => val == table))
          continue;

        const { data, error } = await supabase
          .from(table)
          .select('id, vector');

        if (error) throw error;
        for (const entity of data)
          results.push({
            id: entity.id,
            table,
            matchRate: calcInnerProduct(entity.vector, searchVector),
          });
      }

      results.sort((a, b) => b.matchRate - a.matchRate);
      const filtered = results.filter(({ matchRate }) => matchRate > 0.5);

      setSearchResults(filtered);
    };

    load();
  }, [searchParams]);

  return (
    <Paper
      component="div"
      sx={{ width: '100%' }}
    >
      <Stack spacing={2}>
        {searchResults.map(({ id, table }) => {
          switch (table) {
            case 'items':
              return (
                <ItemCard number={id} />
              );
            case 'locations':
              return (<LocationCard number={id} />);
            case 'large_categories':
              return <LargeCategoryCard number={id} />;
            case 'small_categories':
              return <SmallCategoryCard number={id} />;
          }
        })}
      </Stack>
    </Paper>
  );
}

export default SearchResults;