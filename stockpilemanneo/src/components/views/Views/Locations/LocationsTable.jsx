import { Table, TableBody, TableCell, TableContainer, TableHead } from "@mui/material";
import { useState } from "react";
import supabase from "../../../../client.js";
import LocationViewRow from "./LocationViewRow.jsx";

/**
 * The location data object.
 * @typedef {object} LocationData
 * @property {number} id The id of the location.
 * @property {string} name The name of the location.
 * @property {Array.<{count: number}>} items The items in the locations.
 */

/**
 * The table of locations.
 * @returns
 */
function LocationsTable() {
  /**
   * @type {[
   *   Array.<LocationData>,
   *   import("react").Dispatch.<import("react").SetStateAction.<Array.<LocationData>>>
   * ]}
   */
  const [locations, setLocations] = useState([]);

  const loadData = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, items(count)');

    if (error) throw error;
    if (data) setLocations(data);
  };

  loadData();

  return (
    <TableContainer sx={{ width: '100%' }}>
      <Table sx={{ width: 'max-content', }}>
        <TableHead>
          <TableCell>番号</TableCell>
          <TableCell>名称</TableCell>
          <TableCell>品目数</TableCell>
          <TableCell>操作</TableCell>
        </TableHead>
        <TableBody>
          {locations.map(location => <LocationViewRow {...location} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LocationsTable;