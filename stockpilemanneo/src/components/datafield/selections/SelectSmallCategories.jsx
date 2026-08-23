/**
 * @fileoverview The small category specific selector combo box.
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
 * @param {import("react-hook-form").FieldPathByValue<T, SmallCategoryCandidate>} props.name The name of this element.
 * @param {string=} props.id The id.
 * @param {import("react-hook-form").FieldPathByValue<T, import("./SelectLargeCategories.jsx").LargeCategoryCandidate>} props.largeCategoryName The name of the large category selector.
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

  /**
   * @type {import("react-hook-form").UseFormReturn<T>}
   */
  const { setValue, control } = useFormContext();

  const largeCategory = useWatch({
    name: largeCategoryName,
    control,
  });

  const loadOptions = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('small_categories')
      .select('id, name, large_categories!inner(id, name, large_large_categories(id, name))')
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
            setValue(
              largeCategoryName,
              newValue.large_categories,
              {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
              });
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
