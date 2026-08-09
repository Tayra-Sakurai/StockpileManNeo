import { createFilterOptions } from "@mui/material";
import { useState } from "react";
import { AutocompleteElement } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

const LOCATION_SEARCH_STRICTNESS_LEVEL = 0.5;

const filter = createFilterOptions();

/**
 * The location.
 * @typedef {object} LocationCandidate
 * @property {string} name The name.
 * @property {number=} id The ID.
 */

/**
 * The location selector.
 * @param {object} props The props.
 * @param {string} props.name The name.
 * @param {string=} props.id The id.
 * @returns
 */
function SelectLocations({ name, id }) {
  /**
   * @type {[
   *   ?LocationCandidate,
   *   import("react").Dispatch.<import("react").SetStateAction.<?LocationCandidate>>
   * ]}
   */
  const [value, setValue] = useState(null);
  /**
   * @type {[
   *   Array.<LocationCandidate>,
   *   import("react").Dispatch.<import("react").SetStateAction.<LocationCandidate[]>>
   * ]}
   */
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOptions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('locations')
      .select('id, name');
    data ? setOptions(data) : setOptions([]);
    setLoading(false);
  };

  return (
    <AutocompleteElement
      name={name}
      options={options}
      loading={loading}
      autocompleteProps={{
        id,
        value,
        fullWidth: true,
        handleHomeEndKeys: true,
        clearOnBlur: true,
        selectOnFocus: true,
        filterOptions(options, states) {
          const filtered = filter(options, states);

          const { inputValue } = states;
          const isExisting = filtered.some(val => val.name == inputValue);

          if (inputValue && !isExisting)
            filtered.push({
              name: inputValue,
            });

          return filtered;
        },
        getOptionLabel(option) {
          if (option.id) return option.name;

          return `${option.name}を追加`;
        },
        async onChange(event, newValue) {
          if (typeof newValue === 'string') {
            const { data, error } = await supabase
              .from('locations')
              .insert({
                name: newValue,
                vector: await createEmbeddingVector(newValue),
              })
              .select('id, name');

            if (error) throw error;

            await loadOptions();

            if (data) setValue(data[0]);
          } else if (!newValue || newValue.id) {
            setValue(newValue);
          } else {
            const { data, error } = await supabase
              .from('locations')
              .insert({
                name: newValue.name,
                vector: await createEmbeddingVector(newValue.name),
              })
              .select('id, name');

            if (error) throw error;

            await loadOptions();

            if (data) setValue(data[0]);
          }
        },
        async onOpen() {
          if (options) await loadOptions();
        },
      }}
    />
  );
}

export default SelectLocations;