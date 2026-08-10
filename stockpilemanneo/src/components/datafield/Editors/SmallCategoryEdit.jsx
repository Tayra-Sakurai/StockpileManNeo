import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import supabase from "../../../client.js";
import SmallCategoryDetail from "../SmallCategoryDetail.jsx";

function SmallCategoryEdit() {
  const { id } = useParams();

  const [large, setLarge] = useState('');
  const [largeId, setLargeId] = useState(0);
  const [small, setSmall] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) throw new TypeError('Invalid ID.');

      const { data, error } = await supabase
        .from('small_categories')
        .select('name, large_categories(id, name)')
        .eq('id', parseInt(id));

      if (error) throw error;
      if (data) {
        setLarge(data[0].large_categories.name);
        setLargeId(data[0].large_categories.id);
        setSmall(data[0].name);
      }
    };

    load();
  }, [id]);

  return (
    <>
      <Breadcrumbs>
        <Link
          component={RouterLink}
          to={`/Edit/large_categories/${largeId}`}
        >
          {large}
        </Link>
        <Link href="#">{small}</Link>
      </Breadcrumbs>
      <Typography component="h2" variant="h2">名称の編集</Typography>
      <SmallCategoryDetail id={parseInt(id ?? '0') || 0} />
    </>
  );
}

export default SmallCategoryEdit;