import { Alert, Paper, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import supabase from "../../client.js";
import { calcInnerProduct, createEmbeddingVector, createSearchVector } from "../stockpile/stockpileVectors.js";
import ItemCard from "../datafield/cards/ItemCard.jsx";
import LocationCard from "../datafield/cards/LocationCard.jsx";
import LargeCategoryCard from "../datafield/cards/LargeCategoryCard.jsx";
import SmallCategoryCard from "../datafield/cards/SmallCategoryCard.jsx";
import itemCompare from "../../sortmodules/ItemSorter.js";

/**
 * The search result display object.
 * @typedef {object} ResultMark
 * @property {number} id The identity of the result object.
 * @property {"large_categories" | "small_categories" | "locations" | "items"} table The table name.
 * @property {number} matchRate The matching rate.
 */

/**
 * Search result calculator.
 * @param {number[]} srch The query vector.
 * @param {number[]} doc The document vector.
 * @param {string} text The document text.
 * @returns {Promise<[number, ?number[]]>}
 */
async function getMatchRate(srch, doc, text) {
  const vector = (doc.length && doc.every(elm => !!elm)) ? doc : await createEmbeddingVector(text);
  return [calcInnerProduct(srch, vector), ((doc.length && doc.every(elm => !!elm)) ? null : vector)];
}

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

  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      const searchVector = await createSearchVector(searchParams.get('q') ?? '');

      /** @type {Array.<ResultMark>} */
      const results = [];

      /**
       * Shows if the remaining table should retrieve the values.
       * @type {boolean}
       */
      let doNotGoFlag = false;

      const searchingTables = searchParams.getAll('tables');

      if (searchingTables.length === 0 || searchingTables.indexOf('large_categories') >= 0) {
        const { data, error: err } = await supabase
          .from('large_categories')
          .select('id, name, vector');

        if (err) {
          setError(err.message);
          return;
        }

        data.sort((a, b) => a.name.localeCompare(b.name));

        for (const { id, name, vector } of data) {
          const [matchRate, v] = await getMatchRate(searchVector, vector, name);
          if (v) {
            await supabase
              .from('large_categories')
              .update({
                vector: v,
              })
              .eq('id', id);

            setError('値が変更されました．');
          }

          results.push({
            id,
            matchRate,
            table: 'large_categories',
          });
        }
      }

      if (searchingTables.length === 0 || searchingTables.indexOf('small_categories') >= 0) {
        const { data, error: err } = await supabase
          .from('small_categories')
          .select('id, name, vector, large_categories!inner(name, vector)');

        if (err) {
          setError(err.message);
          doNotGoFlag = true;
        }

        if (data) {
          data.sort((a, b) => a.name.localeCompare(b.name));

          for (const { id, name, vector, large_categories } of data) {
            const [m1, v] = await getMatchRate(searchVector, vector, name);
            const [m2] = await getMatchRate(searchVector, large_categories.vector, large_categories.name);

            if (v) {
              setError('自動的にインデックスが作成されました．');
              await supabase
                .from('small_categories')
                .update({
                  vector: v,
                })
                .eq('id', id);
            }

            results.push({
              id,
              matchRate: Math.max(m1, m2),
              table: 'small_categories',
            });
          }
        }
      }

      if (!doNotGoFlag && (searchingTables.length === 0 || searchingTables.indexOf('locations') >= 0)) {
        const { data, error: err } = await supabase
          .from('locations')
          .select('id, name, vector');

        if (err) {
          setError(err.message);
          doNotGoFlag = true;
        }

        if (data) {
          data.sort((a, b) => a.name.localeCompare(b.name));

          for (const { id, name, vector } of data) {
            const [matchRate, v] = await getMatchRate(searchVector, vector, name);

            if (v) {
              setError('自動的にインデックスが作成されました．');
              await supabase
                .from('locations')
                .update({
                  vector: v,
                });
            }

            results.push({
              id,
              table: 'locations',
              matchRate,
            });
          }
        }
      }

      if (!doNotGoFlag && (searchingTables.length === 0 || searchingTables.indexOf('items') >= 0)) {
        const { data, error: err } = await supabase
          .from('items')
          .select('id, name, vector, life, small_categories!inner(vector, name, large_categories!inner(name, vector)), locations!inner(name, vector)');

        if (err) {
          setError(err.message);
          doNotGoFlag = true;
        }

        if (data) {
          data.sort(itemCompare);

          for (const { id, name, vector, small_categories, locations } of data) {
            const [m1, v] = await getMatchRate(searchVector, vector, name);

            if (v) {
              setError('自動的にインデックスが作成されました．');
              await supabase
                .from('items')
                .update({
                  vector: v,
                })
                .eq('id', id);
            }

            const [m2] = await getMatchRate(searchVector, small_categories.vector, small_categories.name);
            const [m3] = await getMatchRate(searchVector, small_categories.large_categories.vector, small_categories.large_categories.name);
            const [m4] = await getMatchRate(searchVector, locations.vector, locations.name);

            results.push({
              id,
              table: 'items',
              matchRate: Math.max(m1, m2, m3, m4),
            });
          }
        }
      }

      results.sort((a, b) => b.matchRate - a.matchRate);
      const filtered = searchVector.every(value => value == 0) ? results : results.filter(({ matchRate }) => matchRate > 0.5);

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
        {error ? <Alert variant="standard" severity="error">{error}</Alert> : null}
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