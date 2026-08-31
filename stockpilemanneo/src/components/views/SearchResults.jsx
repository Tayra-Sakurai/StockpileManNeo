import { Alert, Card, CardContent, Grid, Paper, Skeleton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import supabase from "../../client.js";
import { calcInnerProduct, createEmbeddingVector, createSearchVector } from "../stockpile/stockpileVectors.js";
import ItemCard from "../datafield/cards/ItemCard.jsx";
import LocationCard from "../datafield/cards/LocationCard.jsx";
import LargeCategoryCard from "../datafield/cards/LargeCategoryCard.jsx";
import SmallCategoryCard from "../datafield/cards/SmallCategoryCard.jsx";
import itemCompare from "../../sortmodules/ItemSorter.js";
import asynchronousTimer from "../../timers/AsynchronousTimer.js";
import LargeLargeCategoryCard from "../datafield/cards/LargeLargeCategoryCard.jsx";

/**
 * The search result display object.
 * @typedef {object} ResultMark
 * @property {number} id The identity of the result object.
 * @property {"large_categories" | "small_categories" | "locations" | "items" | "large_large_categories"} table The table name.
 * @property {number} matchRate The matching rate.
 */

function LoadingCard() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={2} columns={12}>
          <Grid size="auto">
            <Skeleton variant="circular" width={56} height={56} />
          </Grid>
          <Grid size="grow">
            <Stack spacing={2}>
              <Skeleton />
              <Skeleton />
            </Stack>
          </Grid>
          <Grid size="auto">
            <Skeleton variant="rounded" width={56} height={56} />
          </Grid>
        </Grid>
      </CardContent>
      <CardContent>
        <Skeleton variant="rounded" height={40} />
      </CardContent>
    </Card>
  );
}

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
    const load = async function() {
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

      if (searchingTables.length === 0 || searchingTables.indexOf('large_large_categories') >= 0) {
        const { data, error: err } = await supabase
          .from('large_large_categories')
          .select('id, name, vector')
          .order('name', { ascending: true });

        if (err) {
          setError(err.message);
          return;
        }

        for (const { id, name, vector } of data) {
          const [matchRate, v] = await getMatchRate(searchVector, vector, name);

          if (v) {
            await supabase
              .from('large_large_categories')
              .update({
                vector: v,
              })
              .eq('id', id);

            setError('値が自動的に変更されました，');
            await asynchronousTimer(10);
          }

          results.push({
            id,
            matchRate,
            table: 'large_large_categories',
          });
        }
      }

      if (searchingTables.length === 0 || searchingTables.indexOf('large_categories') >= 0) {
        const { data, error: err } = await supabase
          .from('large_categories')
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
              await supabase
                .from('large_categories')
                .update({
                  vector: v,
                })
                .eq('id', id);

              setError('値が変更されました．');
              await asynchronousTimer(10);
            }

            results.push({
              id,
              matchRate,
              table: 'large_categories',
            });
          }
        }
      }

      if (!doNotGoFlag && (searchingTables.length === 0 || searchingTables.indexOf('small_categories') >= 0)) {
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
              await asynchronousTimer(10);
            }

            results.push({
              id,
              matchRate: (m1 + m2) / 2,
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
              await asynchronousTimer(10);
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
              await asynchronousTimer(10);
            }

            const [m2] = await getMatchRate(searchVector, small_categories.vector, small_categories.name);
            const [m3] = await getMatchRate(searchVector, small_categories.large_categories.vector, small_categories.large_categories.name);
            const [m4] = await getMatchRate(searchVector, locations.vector, locations.name);

            results.push({
              id,
              table: 'items',
              matchRate: (m1 + m2 + m3 + m4) / 4,
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
        {searchResults.length ?
          (
            searchResults.map(({ id, table }) => {
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
                case 'large_large_categories':
                  return <LargeLargeCategoryCard itemId={id} />;
              }
            })
          ) :
          (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          )
        }
      </Stack>
    </Paper>
  );
}

export default SearchResults;