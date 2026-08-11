import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../../../client.js";
import SmallCategoriesTable from "./SmallCategoriesTable.jsx";
import CategoryIcon from "@mui/icons-material/Category";

function SmallCategoriesView() {
  const { code } = useParams();

  /**
   * @type {[
   *   {
   *     id: number,
   *     name: string,
   *     items: {
   *       count: number,
   *     }[],
   *     large_categories: {
   *       id: number,
   *       name: string,
   *     }
   *   }[],
   *   import("react").Dispatch.<import("react").SetStateAction.<Array.<{
   *     id: number,
   *     name: string,
   *     items: {
   *       count: number,
   *     }[],
   *     large_categories: {
   *       id: number,
   *       name: string
   *     },
   *   }>>>
   * ]}
   */
  const [smallCategories, setSmallCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (code) {
        const { data, error } = await supabase
          .from('large_categories')
          .select('small_categories!inner(id, name, items(count), large_categories!inner(id, name))')
          .eq('id', parseInt(code));

        if (error) throw error;
        if (data.length > 0) setSmallCategories(data[0].small_categories.toSorted((a, b) => a.name.localeCompare(b.name)));
      } else {
        const { data, error } = await supabase
          .from('small_categories')
          .select('id, name, items(count), large_categories!inner(id, name)')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data.length > 0) setSmallCategories(data);
      }
    };
    load();
  }, [code]);

  return (
    <Card sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h2">名称の一覧</Typography>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            justifyContent: 'start',
            alignItems: 'stretch',
            flexDirection: 'row-reverse',
          }}
        >
          {code ? <Chip icon={<CategoryIcon />} label={`分類: ${code}`} /> : null}
        </Box>
        <SmallCategoriesTable smallCategories={smallCategories} />
      </Stack>
    </Card>
  );
}

export default SmallCategoriesView;