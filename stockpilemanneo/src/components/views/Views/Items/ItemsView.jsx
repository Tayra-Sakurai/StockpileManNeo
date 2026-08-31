import { Box, Chip, Collapse, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import supabase from "../../../../client.js";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import ClassIcon from "@mui/icons-material/Class";
import ItemsTable from "./ItemsTable.jsx";
import { calcInnerProduct, createSearchVector } from "../../../stockpile/stockpileVectors.js";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ItemFilterForm from "./ItemFilterForm.jsx";

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
  const [searchParams] = useSearchParams();

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

  /**
   * @type {[
   *   number[],
   *   import("react").Dispatch.<import("react").SetStateAction.<number[]>>
   * ]}
   */
  const [searchV, setSearchV] = useState([]);

  const { table, code } = useParams();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setChips([]);
      const q = searchParams.get('q');
      const d1 = searchParams.get('d1');
      const d2 = searchParams.get('d2');
      const hasD = !(searchParams.get('hasd') == 'null' || !searchParams.get('hasd'));

      let { data, error } = await supabase
        .from('items')
        .select('id, life, vector, locations!inner(id), small_categories!inner(id)');

      if (error) throw error;
      if (!data) throw Error('Unknown SQL error.');

      const tables = table?.split(',');
      const codes = code?.split(',');

      if (tables && codes && (tables.length === codes.length)) {
        for (let i = 0; i < tables.length; i++) {
          const [tbl, cd] = [tables[i], codes[i]];
          if ((tbl === 'locations') || (tbl === 'small_categories')) {
            setChips(values => {
              values.push({
                tableCode: cd,
                tableName: tbl,
              });
              return values;
            });
            data = data.filter(value => value[tbl].id == parseInt(cd));
          }
        }
      }

      if (q) {
        const qVec = await createSearchVector(q);
        setSearchV(qVec);
        data = data.filter(({ vector }) => calcInnerProduct(vector, qVec) > 0.5);
      }

      if (hasD && d1) {
        const d1Date = new Date(d1);
        data = data.filter(({ life }) => !life || new Date(life) >= d1Date);
      }

      if (hasD && d2) {
        const d2Date = new Date(d2);
        data = data.filter(({ life }) => life && new Date(life) <= d2Date);
      }

      setItems(data.map(({ id }) => id));
    };

    loadItems();
  }, [table, code, searchParams]);

  return (
    <Paper sx={{ width: '100%', boxSizing: 'border-box', height: '100%' }}>
      <Stack spacing={4}>
        <Typography component="h2" variant="h2">在庫一覧</Typography>
        <Box
          sx={{
            display: 'flex',
            direction: 'row',
            gap: 2,
          }}
          onClick={() => setOpen(open => !open)}
        >
          <IconButton
            type="button"
            aria-controls="filter-form"
            sx={{
              flexGrow: 0,
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <Typography
            variant="h3"
            component="h3"
            sx={{
              flexGrow: 1,
              textAlign: 'left',
            }}
          >
            絞り込み
          </Typography>
        </Box>
        <Collapse
          in={open}
          aria-expanded={open}
          id="filter-form"
        >
          <ItemFilterForm />
        </Collapse>
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
        <ItemsTable searchVector={searchV} items={items} />
      </Stack>
    </Paper>
  );
}

export default ItemsView;