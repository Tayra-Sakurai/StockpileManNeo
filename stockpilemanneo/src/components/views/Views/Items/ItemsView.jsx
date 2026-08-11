import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../../../client.js";
import LocationPinIcon from "@mui/icons-material/LocationPin"
import ItemsTable from "./ItemsTable.jsx";

/**
 * The table displaying data.
 * @typedef {object} TableData
 * @property {string} label The label.
 * @property {import("react").JSX.Element} icon The icon.
 */

/**
 * The table displayers.
 * @type {Object.<string, TableData>}
 */
const il = {
  locations: {
    label: '保管場所',
    icon: <LocationPinIcon />
  }
}

/**
 * The view of the items.
 * @returns
 */
function ItemsView() {
  /**
   * @type {[
   *   number[],
   *   import("react").Dispatch.<import("react").SetStateAction.<number[]>>
   * ]}
   */
  const [items, setItems] = useState([]);

  const { table, code } = useParams();

  useEffect(() => {
    const loadItems = async () => {
      let data, error;
      if (((table == 'locations') || (table == 'small_categories')) && code) {
        ({ data, error } = await supabase
          .from(table)
          .select('items!inner(id)')
          .eq('id', parseInt(code))
        );

        if (data) setItems(data[0].items.map(item => item.id));
      } else {
        ({ data, error } = await supabase
          .from('items')
          .select('id')
        );

        if (data) setItems(data.map(item => item.id));
      }
      if (error) throw error;
    };

    loadItems();
  }, [table]);

  return (
    <Paper sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h2">在庫一覧</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            gap: 2,
            alignItems: 'stretch',
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          {(table && code) ? (<Chip icon={il[table].icon} label={`${il[table]?.label ?? table}: ${code}`} />) : null}
        </Box>
        <ItemsTable items={items} />
      </Stack>
    </Paper>
  );
}

export default ItemsView;