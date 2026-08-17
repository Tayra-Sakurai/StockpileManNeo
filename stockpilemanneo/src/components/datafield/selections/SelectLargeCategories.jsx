import { useState } from "react";
import { AutocompleteElement, useFormContext, useWatch } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createFilterOptions } from "@mui/material";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

/**
 * @typedef {object} LargeCategoryCandidate
 * @property {string} name The large category name.
 * @property {?number=} id The identifier.
 * @property {?import("./SelectLargeLargeCategories.jsx").LargeLargeCategoryCandidate} large_large_categories The largest category.
 */

const filter = createFilterOptions({
  /**
   * The option name finder.
   * @param {LargeCategoryCandidate} option The candidate.
   * @returns
   */
  stringify(option) {
    return option.name;
  }
});

/**
 * Large category selector.
 * @template {import("react-hook-form").FieldValues} T
 * @param {object} props The props.
 * @param {import("react-hook-form").Path<T>} props.name The name.
 * @param {string=} props.id The identifier.
 * @param {import("react-hook-form").FieldPathByValue<T, import("./SelectLargeLargeCategories.jsx").LargeLargeCategoryCandidate>} props.largeLargeCategoryName The largest category selector's name.
 * @returns
 */
function SelectLargeCategories(props) {
  const { largeLargeCategoryName, ...autoCompleteElementProps } = props;

  /**
   * @type {import("react-hook-form").UseFormReturn<T>}
   */
  const { control, setValue } = useFormContext();

  const getLargeCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('large_categories')
      .select('name, id, large_large_categories(id, name)')
      .order('name', { ascending: true });

    console.info(data);
    if (!data) {
      console.error(error.message ?? 'An unknown error occurred.');
      setOptions([]);
    } else {
      data.sort((a, b) => {
        if (!a.large_large_categories && b.large_large_categories)
          return 1;
        else if (a.large_large_categories && !b.large_large_categories)
          return -1;
        else if (a.large_large_categories && b.large_large_categories)
          return a.large_large_categories.name.localeCompare(b.large_large_categories.name) ||
            ((a.large_large_categories.id ?? 0) - (b.large_large_categories.id ?? 0)) ||
            a.name.localeCompare(b.name) ||
            (a.id - b.id);
        else
          return a.name.localeCompare(b.name) || (a.id - b.id);
      });
      setOptions(data);
    }

    setLoading(false);
  };

  const largeLargeCategory = useWatch({
    control,
    name: largeLargeCategoryName,
  });

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
                large_large_category_id: newValue.large_large_categories?.id,
              });

            await getLargeCategories();
          }

          if (newValue?.large_large_categories)
            setValue(
              largeLargeCategoryName,
              newValue.large_large_categories,
              {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
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
              large_large_categories: largeLargeCategory,
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