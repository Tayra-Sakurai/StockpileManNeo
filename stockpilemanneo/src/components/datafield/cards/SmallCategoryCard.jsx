/**
 * @fileoverview The small category specific search result card.
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
import { Avatar, Breadcrumbs, Link } from "@mui/material";
import supabase from "../../../client.js";
import CommonCard from "./CommonCard.jsx";
import { useEffect, useState } from "react";
import { amber } from "@mui/material/colors";
import ClassIcon from "@mui/icons-material/Class";
import { Link as RouterLink } from "react-router-dom";

/**
 * The small category viewer.
 * @param {object} props The props.
 * @param {number} props.number The number of the small category.
 * @returns
 */
function SmallCategoryCard({ number }) {
  const [title, setTitle] = useState('');
  const [largeCategoryName, setLargeCategoryName] = useState('');
  const [largeLargeCategoryName, setLargeLargeCategoryName] = useState('');
  const [largeCategoryId, setLargeCategoryId] = useState(0);
  const [largeLargeCategoryId, setLargeLargeCategoryId] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from('small_categories')
        .select('name, large_categories(id, name, large_large_categories(id, name))')
        .eq('id', number);

      if (error) throw error;
      if (data[0]) {
        setTitle(data[0].name);
        setLargeCategoryName(data[0].large_categories.name);
        setLargeCategoryId(data[0].large_categories.id);
        setLargeLargeCategoryId(data[0].large_categories.large_large_categories?.id ?? 0);
        setLargeLargeCategoryName(data[0].large_categories.large_large_categories?.name ?? '');
      }
    };

    loadData();
  });

  return (
    <CommonCard
      title={title}
      itemId={number}
      table="small_categories"
      type="名称"
      avatar={
        <Avatar sx={{ bgcolor: amber[500] }}>
          <ClassIcon />
        </Avatar>
      }
      titleLink={`/View/items/small_categories/${number}`}
    >
      <Breadcrumbs>
        {
          (largeLargeCategoryId && largeLargeCategoryName) ?
            <Link
              component={RouterLink}
              to={`/View/large_categories/large_large_categories/${largeLargeCategoryId}`}
              color="inherit"
            >
              {largeLargeCategoryName}
            </Link> :
            null
        }
        <Link
          component={RouterLink}
          to={`/View/small_categories/large_categories/${largeCategoryId}`}
          color="inherit"
        >
          {largeCategoryName}
        </Link>
        <Link
          component={RouterLink}
          to={`/View/items/small_categories/${number}`}
          color="textPrimary"
        >
          {title}
        </Link>
      </Breadcrumbs>
    </CommonCard>
  );
}

export default SmallCategoryCard;