/**
 * @fileoverview Large category specific search result card.
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
import { deepPurple } from "@mui/material/colors";
import CategoryIcon from "@mui/icons-material/Category";
import { Link as RouterLink } from "react-router-dom";

/**
 * The large category displayer.
 * @param {object} props The properties.
 * @param {number} props.number The number id of the data.
 * @returns
 */
function LargeCategoryCard({ number }) {
  const [title, setTitle] = useState('');
  const [largeLargeCategory, setLargeLargeCategory] = useState('');
  const [largeLargeCategoryId, setLargeLargeCategoryId] = useState(0);

  useEffect(() => {
    const loadFunc = async () => {
      const { data, error } = await supabase
        .from('large_categories')
        .select('name, large_large_categories(id, name)')
        .eq('id', number);

      if (error) throw error;
      if (data.length) {
        setTitle(data[0].name);
        setLargeLargeCategory(data[0].large_large_categories?.name ?? '');
        setLargeLargeCategoryId(data[0].large_large_categories?.id ?? 0);
      }
    };

    loadFunc();
  });

  return (
    <CommonCard
      type="カテゴリ"
      title={title}
      table="large_categories"
      itemId={number}
      titleLink={`/View/small_categories/large_categories/${number}`}
      avatar={
        <Avatar sx={{ bgcolor: deepPurple[500] }}>
          <CategoryIcon />
        </Avatar>
      }
    >
      {
        largeLargeCategoryId ?
          <Breadcrumbs>
            <Link
              component={RouterLink}
              to={`/View/large_categories/large_large_categories/${largeLargeCategoryId}`}
              color="inherit"
            >
              {largeLargeCategory}
            </Link>
            <Link
              component={RouterLink}
              to={`/View/small_categories/large_categories/${number}`}
              color="textPrimary"
            >
              {title}
            </Link>
          </Breadcrumbs>
          : undefined
      }
    </CommonCard>
  );
}

export default LargeCategoryCard;