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
 * @template {import("react-hook-form").FieldValues} T
 * @param {object} props The props.
 * @param {import("react-hook-form").Path<T>} props.name The name.
 * @param {string=} props.id The identifier.
 * @param {import("react-hook-form").Control<T>=} props.control The control of the element.
 * @returns
 */
function SelectLargeCategories(props) {
  const { ...autoCompleteElementProps } = props;

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
        getOptionLabel(option) {
          return option.name;
        },
        getOptionKey(option) {
          return typeof option === 'string' ? option : (option.id ?? 0);
        },
        fullWidth: true,
        selectOnFocus: true,
        clearOnBlur: true,
        handleHomeEndKeys: true,
        async onChange(event, newValue) {
          if (newValue && !newValue.id) {
            const { name: n } = newValue;
            await supabase
              .from('large_categories')
              .insert({
                name: n,
                vector: await createEmbeddingVector(n),
              });

            await getLargeCategories();
          }
        },
        async onOpen() {
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