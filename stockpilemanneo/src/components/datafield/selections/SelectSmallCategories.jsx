import { createFilterOptions } from "@mui/material";
import { useState } from "react";
import { AutocompleteElement } from "react-hook-form-mui";
import supabase from "../../../client.js";
import { createEmbeddingVector } from "../../stockpile/stockpileVectors.js";

/**
 * The value type.
 * @typedef {object} SmallCategoryCandidate
 * @property {string} name The name.
 * @property {?number=} id The identifier.
 * @property {{
 *   name: string,
 *   id?: ?number,
 * }} large_categories The related large category.
 */

const filter = createFilterOptions();

/**
 * The small category selector.
 * @param {object} props The props.
 * @param {string} props.name The name of this element.
 * @param {string=} props.id The id.
 * @param {?import("./SelectLargeCategories.jsx").LargeCategoryCandidate=} props.largeCategory The large category.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<?{ name: string, id?: number }>>=} props.setLargeCategory The large category setter.
 * @returns
 */
function SelectSmallCategories({ name, id, largeCategory, setLargeCategory }) {
  /**
   * @type {[
   *   Array.<SmallCategoryCandidate>,
   *   import("react").Dispatch.<import("react").SetStateAction.<Array.<SmallCategoryCandidate>>>
   * ]}
   */
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  /**
   * @type {[
   *   ?SmallCategoryCandidate,
   *   import("react").Dispatch.<import("react").SetStateAction.<?SmallCategoryCandidate>>
   * ]}
   */
  const [value, setValue] = useState(null);

  const loadOptions = async () => {
    setLoading(true);

    if (!largeCategory || setLargeCategory) {
      const { data, error } = await supabase
        .from('small_categories')
        .select('id, name, large_categories!inner(id, name)');

      if (error) throw error;

      if (data.length) {
        data.sort((a, b) => a.name.localeCompare(b.name));
        data.sort((a, b) => a.large_categories.name.localeCompare(b.large_categories.name));
        setOptions(data);
      }
    } else if (largeCategory.id) {
      const { data, error } = await supabase
        .from('small_categories')
        .select('id, name, large_categories!inner(id, name)')
        .eq('large_category_id', largeCategory.id);

      if (error) throw error;

      if (data) setOptions(data.toSorted((a, b) => a.name.localeCompare(b.name)));
    } else {
      setOptions([]);
    }

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
        async onOpen() {
          await loadOptions();
        },
        async onChange(event, newValue) {
          if (typeof newValue === 'string') {
            if (largeCategory?.id) {
              const { data, error } = await supabase
                .from('small_categories')
                .insert({
                  large_category_id: largeCategory.id,
                  name: newValue,
                  vector: await createEmbeddingVector(newValue),
                })
                .select('id, name, large_categories(id, name)');

              if (error) throw error;
              if (data) setValue(data[0]);
            } else {
              throw new Error('The value is not valid.');
            }
          } else if (newValue?.id) {
            setValue(newValue);

            if (newValue.large_categories.id && setLargeCategory)
              setLargeCategory(newValue.large_categories);
          } else if (newValue && largeCategory?.id) {
            const { data, error } = await supabase
              .from('small_categories')
              .insert({
                name: newValue.name,
                large_category_id: largeCategory.id,
                vector: await createEmbeddingVector(newValue.name),
              })
              .select('id, name, large_categories(id, name)');

            if (error) throw error;
            if (data) setValue(data[0]);
          }

          await loadOptions();
        },
        getOptionLabel(option) {
          if (typeof option === 'string')
            return option;
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

          if (largeCategory?.id && !setLargeCategory)
            return filtered.filter(value => value.large_categories.id == largeCategory.id);

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
          if (typeof option === 'string')
            return option;

          return option.name;
        },
        freeSolo: true,
        handleHomeEndKeys: true,
        selectOnFocus: true,
        clearOnBlur: true,
      }}
    />
  );
}

export default SelectSmallCategories;