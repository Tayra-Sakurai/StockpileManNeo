/**
 * @fileoverview The largest category specific search result card.
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
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CommonCard from './CommonCard.jsx';
import { Avatar } from '@mui/material';
import { lime } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import supabase from '../../../client.js';

/**
 * The largest category display card.
 * @param {object} props The props.
 * @param {number} props.itemId The item's identifier.
 * @returns
 */
function LargeLargeCategoryCard({ itemId }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('large_large_categories')
        .select('id, name')
        .eq('id', itemId);

      if (error) throw error;
      if (data?.[0]) {
        setTitle(data[0].name);
      }
    };

    load();
  }, [itemId]);

  return (
    <CommonCard
      type="大分類"
      avatar={
        <Avatar sx={{ bgcolor: lime[500] }}>
          <AccountTreeIcon />
        </Avatar>
      }
      itemId={itemId}
      table="large_large_categories"
      title={title}
      titleLink={`/View/large_categories/large_large_categories/${itemId}`}
    />
  );
}

export default LargeLargeCategoryCard;