import { useState } from "react";
import { AutocompleteElement } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createFilterOptions } from "@mui/material";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

/**
 * @typedef {object} LargeCategoryCandidate
 * @property {string} name The large category name.
 * @property {?number=} id The identifier.
 */

const filter = createFilterOptions();

/**
 * Large category selector.
 * @param {object} props The props.
 * @param {string} props.name The name.
 * @param {string=} props.id The identifier.
 * @param {?LargeCategoryCandidate} props.value The value of the element.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<?LargeCategoryCandidate>>} props.setValue The value setter.
 * @returns
 */
function SelectLargeCategories(props) {
  const autoCompleteElementProps = props;

  const getLargeCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('large_categories')
      .select('name, id');
    console.info(data);
    if (!data) {
      console.error(error.message ?? 'An unknown error occurred.');
      setOptions([]);
    } else {
      setOptions(data);
    }

    setLoading(false);
  };

  /**
   * @type {[
   *   Array.<LargeCategoryCandidate>,
   *   import("react").Dispatch<import("react").SetStateAction<Array.<LargeCategoryCandidate>
   * ]}
   */
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <AutocompleteElement
      {...autoCompleteElementProps}
      options={options}
      loading={loading}
      required
      autocompleteProps={{
        id: props.id,
        getOptionLabel(option) {
          if (typeof option === 'string')
            return `${option} を追加する`;

          return option.name;
        },
        getOptionKey(option) {
          return typeof option === 'string' ? option : (option.id ?? 0);
        },
        fullWidth: true,
        selectOnFocus: true,
        clearOnBlur: true,
        handleHomeEndKeys: true,
        freeSolo: true,
        value: props.value,
        async onChange(event, newValue) {
          if (typeof newValue === 'string')
            props.setValue({
              name: newValue,
            });
          else if (newValue && !newValue.id) {
            const { data } = await supabase
              .from('large_categories')
              .insert({
                name: newValue.name,
                vector: await createEmbeddingVector(newValue.name)
              })
              .select('name, id');
            await getLargeCategories();
            if (data && data[0])
              props.setValue(data[0]);
          }
        },
        async onOpen() {
          if (options)
            return;
          else
            await getLargeCategories();
        },
        filterOptions(options, state) {
          const filtered = filter(options, state);

          const { inputValue } = state;

          if (inputValue && !filtered.some(option => option.name == inputValue)) {
            filtered.push({
              name: inputValue,
              id: null,
            });
          }

          return filtered;
        },
        renderOption(props, option) {
          const { key, ...otherProps } = props;

          return (
            <li key={key} {...otherProps}>
              {option.id ? option.name : `${option.name} を追加する`}
            </li>
          );
        },
      }}
    />
  );
}

export default SelectLargeCategories;