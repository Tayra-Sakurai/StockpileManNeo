/**
 * @fileoverview The largest category specific selector combo box.
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
import { useState } from "react";
import { AutocompleteElement } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createFilterOptions } from "@mui/material";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

const filter = createFilterOptions({
  /**
   * The filter string generator.
   * @param {LargeLargeCategoryCandidate} option The option.
   * @returns
   */
  stringify(option) {
    return option.name;
  }
});

/**
 * The largest category candidate object.
 * @public
 * @typedef {object} LargeLargeCategoryCandidate
 * @property {number=} id The identity.
 * @property {string} name The name to be displayed.
 */

/**
 * The largest category selector.
 * @template {import("react-hook-form").FieldValues} T
 * @param {object} props The props.
 * @param {import("react-hook-form").FieldPath<T>} props.name The name of the element.
 * @param {string=} props.id The identity of this element.
 * @param {boolean=} props.required Whether this is required, defaults to true.
 * @param {import("react-hook-form").Control<T>=} props.control The control. Optional.
 * @returns
 */
function SelectLargeLargeCategories({ id, required = true, ...otherProps }) {
  /**
   * @type {[
   *   LargeLargeCategoryCandidate[],
   *   import("react").Dispatch.<import("react").SetStateAction.<Array.<LargeLargeCategoryCandidate>>>
   * ]}
   */
  const [options, setOptions] = useState([]);

  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('large_large_categories')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;
    if (data.length) {
      setOptions(data);
      setLoading(false);
    }
  };

  return (
    <AutocompleteElement
      {...otherProps}
      required={required}
      options={options}
      loading={loading}
      autocompleteProps={{
        id,
        onOpen: load,
        getOptionLabel(option) {
          return option.name;
        },
        getOptionKey(option) {
          return option.id ?? option.name;
        },
        renderOption({ key, ...otherParams }, option) {
          return (
            <li key={key} {...otherParams}>
              {option.id ? option.name : `${option.name} を追加する`}
            </li>
          );
        },
        filterOptions(options, params) {
          const filtered = filter(options, params);

          const { inputValue } = params;

          const isExisting = filtered.some(({ name }) => name == inputValue);

          if (inputValue && !isExisting)
            filtered.push({
              name: inputValue,
            });

          return filtered;
        },
        async onChange(event, newValue) {
          if (newValue && !newValue.id) {
            await supabase
              .from('large_large_categories')
              .insert({
                ...newValue,
                vector: await createEmbeddingVector(newValue.name),
              });
          }
        }
      }}
    />
  );
}

export default SelectLargeLargeCategories;