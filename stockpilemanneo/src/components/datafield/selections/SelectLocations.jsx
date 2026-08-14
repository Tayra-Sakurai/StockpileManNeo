import { createFilterOptions } from "@mui/material";
import { useState } from "react";
import { AutocompleteElement } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

const filter = createFilterOptions();

/**
 * The location.
 * @typedef {object} LocationCandidate
 * @property {string} name The name.
 * @property {number=} id The ID.
 */

/**
 * The location selector.
 * @template {import("react-hook-form").FieldValues} T
 * @param {object} props The props.
 * @param {import("react-hook-form").Path<T>} props.name The name.
 * @param {string=} props.id The id.
 * @param {import("react-hook-form").Control<T>=} props.control The control of the element.
 * @returns
 */
function SelectLocations({ name, id, control }) {
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
      required
      control={control}
      autocompleteProps={{
        id,
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
          return option.name;
        },
        async onChange(event, newValue) {
          if (newValue && !newValue.id) {
            await supabase
              .from('locations')
              .insert({
                name: newValue.name,
                vector: await createEmbeddingVector(newValue.name),
              });

            await loadOptions();
          }
        },
        async onOpen() {
          await loadOptions();
        },
        renderOption({ key, ...otherProps }, option) {
          return (
            <li key={key} {...otherProps}>
              {option.id ? option.name : `${option.name}を追加`}
            </li>
          );
        },
      }}
    />
  );
}

export default SelectLocations;