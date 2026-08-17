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