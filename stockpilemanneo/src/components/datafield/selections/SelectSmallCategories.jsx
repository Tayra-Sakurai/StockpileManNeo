import { createFilterOptions } from "@mui/material";
import { useState } from "react";
import { AutocompleteElement, useFormContext, useWatch } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

/**
 * The value type.
 * @typedef {object} SmallCategoryCandidate
 * @property {string} name The name.
 * @property {?number=} id The identifier.
 * @property {import("./SelectLargeCategories.jsx").LargeCategoryCandidate} large_categories The related large category.
 */

const filter = createFilterOptions();

/**
 * The small category selector.
 * @template {import("react-hook-form").FieldValues} T
 * @param {object} props The props.
 * @param {import("react-hook-form").Path<T>} props.name The name of this element.
 * @param {string=} props.id The id.
 * @param {import("react-hook-form").Path<T>} props.largeCategoryName The name of the large category selector.
 * @returns
 */
function SelectSmallCategories({ name, id, largeCategoryName }) {
  /**
   * @type {[
   *   Array.<SmallCategoryCandidate>,
   *   import("react").Dispatch.<import("react").SetStateAction.<Array.<SmallCategoryCandidate>>>
   * ]}
   */
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const { setValue, control } = useFormContext();

  const largeCategory = useWatch({
    name: largeCategoryName,
    control,
  });

  const loadOptions = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('small_categories')
      .select('id, name, large_categories!inner(id, name)')
      .order('name', { ascending: true });

    if (data) setOptions(data.toSorted((a, b) => a.large_categories.name.localeCompare(b.large_categories.name)));

    setLoading(false);
  };

  return (
    <AutocompleteElement
      name={name}
      options={options}
      loading={loading}
      control={control}
      autocompleteProps={{
        id,
        async onOpen() {
          await loadOptions();
        },
        async onChange(event, newValue) {
          if (newValue && !newValue.id) {
            await supabase
              .from('small_categories')
              .insert({
                name: newValue.name,
                large_category_id: newValue.large_categories.id ?? 0,
                vector: await createEmbeddingVector(newValue.name),
              });
            loadOptions();
          }

          if (newValue && newValue.large_categories != largeCategory)
            setValue(largeCategoryName, newValue.large_categories);
        },
        getOptionLabel(option) {
          return option.name;
        },
        filterOptions(options, params) {
          const filtered = filter(options, params);

          const { inputValue } = params;

          const isExisting = filtered.some(value => value.name == inputValue);

          if (inputValue && !isExisting && largeCategory?.id)
            filtered.push({
              name: inputValue,
              large_categories: largeCategory,
            });

          return filtered;
        },
        renderOption(props, option) {
          const { key, ...otherProps } = props;

          return (
            <li key={key} {...otherProps}>
              {option.id ? option.name : `${option.name}を追加する`}
            </li>
          );
        },
        groupBy(option) {
          return option.large_categories.name;
        },
        getOptionKey(option) {
          return option.id ? option.id : option.name;
        },
        handleHomeEndKeys: true,
        selectOnFocus: true,
        clearOnBlur: true,
      }}
    />
  );
}

export default SelectSmallCategories;
