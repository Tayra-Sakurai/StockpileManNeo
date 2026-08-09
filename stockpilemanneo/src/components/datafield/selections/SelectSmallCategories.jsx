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
 * @param {import("./SelectLargeCategories.jsx").LargeCategoryCandidate=} props.largeCategory The large category.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<{ name: string, id?: number }>>=} props.setLargeCategory The large category setter.
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
        .select('id, name, large_categories(id, name)');

      if (error) throw error;

      if (data) setOptions(data);
    } else if (largeCategory.id) {
      const { data, error } = await supabase
        .from('small_categories')
        .select('id, name, large_categories(id, name)')
        .eq('large_category_id', largeCategory.id);

      if (error) throw error;

      if (data) setOptions(data);
    } else {
      setOptions([]);
    }

    setLoading(false);
  };

  if (!setLargeCategory) {
    return (
      <AutocompleteElement
        name={name}
        options={options}
        loading={loading}
        autocompleteProps={{
          id,
          value,
          fullWidth: true,
          getOptionLabel(option) {
            return option.id ? option.name : `${option.name}を追加`;
          },
          groupBy(option) {
            return option.large_categories.name;
          },
          selectOnFocus: true,
          clearOnBlur: true,
          handleHomeEndKeys: true,
          resetHighlightOnMouseLeave: true,
          async onOpen() {
            if (!options) await loadOptions();
          },
          filterOptions(options, params) {
            const filtered = filter(options, params);

            if (largeCategory?.id && params.inputValue && !filtered.some(val => val.name == params.inputValue)) {
              filtered.push({
                name: params.inputValue,
                large_categories: {
                  name: largeCategory.name,
                  id: largeCategory.id,
                },
              });
            }

            return filtered;
          },
          async onChange(event, newValue) {
            if (largeCategory?.id) {
              if (newValue && typeof newValue === 'string') {
                const { data, error } = await supabase
                  .from('small_categories')
                  .insert({
                    name: newValue,
                    large_category_id: largeCategory.id,
                    vector: await createEmbeddingVector(newValue)
                  })
                  .select('name, id, large_categories(id, name)');

                await loadOptions();

                if (error) throw error;
                if (data) setValue(data[0]);
              } else if (newValue?.id) {
                setValue(newValue);
              } else if (newValue?.large_categories?.id) {
                const { data, error } = await supabase
                  .from('small_categories')
                  .insert({
                    name: newValue.name,
                    large_category_id: newValue.large_categories.id,
                    vector: await createEmbeddingVector(newValue.name),
                  })
                  .select('id, name, large_categories(id, name)');

                await loadOptions();

                if (error) throw error;
                if (data) setValue(data[0]);
              } else {
                setValue(newValue);
              }
            } else {
              setValue(newValue);
            }
          },
        }}
      />
    );
  }


  return (
    <AutocompleteElement
      name={name}
      options={options}
      loading={loading}
      autocompleteProps={{
        fullWidth: true,
        selectOnFocus: true,
        clearOnBlur: true,
        handleHomeEndKeys: true,
        resetHighlightOnMouseLeave: true,
        getOptionLabel(option) {
          return option.id ? option.name : `${option.name}を追加する`;
        },
        groupBy(option) {
          return option.large_categories.name;
        },
        async onOpen() {
          if (!options) await loadOptions();
        },
        filterOptions(options, params) {
          const filtered = filter(options, params);

          const { inputValue } = params;

          const exists = filtered.some(val => val.name == inputValue);

          if (!exists && largeCategory?.id) {
            filtered.push({
              name: inputValue,
              large_categories: {
                name: largeCategory.name,
                id: largeCategory.id,
              },
            });
          }

          return filtered;
        },
        async onChange(event, newValue) {
          if (newValue?.id && newValue?.large_categories?.id) {
            setValue(newValue);
            setLargeCategory({
              name: newValue.large_categories.name,
              id: newValue.large_categories.id,
            });
          } else if (!newValue) {
            setValue(newValue);
          } else if (newValue.large_categories.id) {
            const { data, error } = await supabase
              .from('small_categories')
              .insert({
                name: newValue.name,
                vector: await createEmbeddingVector(newValue.name),
                large_category_id: newValue.large_categories.id,
              })
              .select('id, name, large_categories(id, name)');

            await loadOptions();

            if (error) throw error;
            if (data) setValue(data[0]);
          } else {
            const { data: d1, error: e1 } = await supabase
              .from('large_categories')
              .insert({
                name: newValue.large_categories.name,
                vector: await createEmbeddingVector(newValue.large_categories.name),
              })
              .select('id, name');

            if (e1) throw e1;
            if (d1) setLargeCategory(d1[0]);

            const { data: d2, error: e2 } = await supabase
              .from('small_categories')
              .insert({
                name: newValue.name,
                vector: await createEmbeddingVector(newValue.name),
                large_category_id: d1[0].id,
              })
              .select('id, name, large_categories(id, name)');

            await loadOptions();

            if (e2) throw e2;
            if (d2) setValue(d2[0]);
          }
        },
      }}
    />
  );
}

export default SelectSmallCategories;