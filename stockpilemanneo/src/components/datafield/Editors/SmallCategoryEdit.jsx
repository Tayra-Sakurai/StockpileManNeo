/**
 * @fileoverview The small category specific editor.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */
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