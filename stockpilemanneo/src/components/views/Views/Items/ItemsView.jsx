import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../../../client.js";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import ClassIcon from "@mui/icons-material/Class";
import ItemsTable from "./ItemsTable.jsx";

/**
 * The table displaying data.
 * @typedef {object} TableData
 * @property {string} label The label.
 * @property {import("react").JSX.Element} icon The icon.
 */

/**
 * The filter display object.
 * @typedef {object} ChipData
 * @property {string} tableName The table name.
 * @property {string} tableCode The code in the table.
 */

/**
 * The table displayers.
 * @type {Object.<string, TableData>}
 */
const il = {
  locations: {
    label: '保管場所',
    icon: <LocationPinIcon />,
  },
  small_categories: {
    label: '名称',
    icon: <ClassIcon />,
  },
};

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

  /**
   * @type {[
   *   ChipData[],
   *   import("react").Dispatch.<import("react").SetStateAction.<ChipData[]>>
   * ]}
   */
  const [chips, setChips] = useState([]);

  const { table, code } = useParams();

  useEffect(() => {
    const loadItems = async () => {
      if (table && code) {
        const tables = table.split(',');
        const codes = code.split(',');
        setItems([]);

        if (tables.length == codes.length) {
          for (let i = 0; i < tables.length; i++) {
            const [tbl, cd] = [tables[i], codes[i]];
            setChips(values => {
              values.push({
                tableCode: cd,
                tableName: tbl,
              });
              return values;
            });

            if ((tbl == 'small_categories') || (tbl === 'locations')) {
              const { data, error } = await supabase
                .from(tbl)
                .select('items!inner(id)')
                .eq('id', parseInt(cd));

              if (error) throw error;
              if (data[0]) setItems(vals => vals.concat(data[0].items.map(value => value.id)));
            }
          }
          return;
        }
      }

      const { data: d, error: e } = await supabase
        .from('items')
        .select('id');

      if (e) throw e;
      setItems(d.map(value => value.id));
    };

    loadItems();
  }, [table, code]);

  return (
    <Paper sx={{ width: '100%', boxSizing: 'border-box', height: '100%' }}>
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
            justifyContent: 'start',
          }}
        >
          {chips.map(({ tableName, tableCode }) => <Chip label={`${il[tableName].label}: ${tableCode}`} icon={il[tableName].icon} />)}
        </Box>
        <ItemsTable items={items} />
      </Stack>
    </Paper>
  );
}

export default ItemsView;