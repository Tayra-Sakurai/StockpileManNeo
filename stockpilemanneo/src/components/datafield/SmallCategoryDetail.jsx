/**
 * @fileoverview The common component to edit and add a small category.
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
/**
 * @typedef {object} SmallCategoryFormData The small category's form data object.
 * @property {?import("./selections/SelectLargeLargeCategories.jsx").LargeLargeCategoryCandidate} large_large_categories The largest category.
 * @property {?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate} large_categories The large category related to the small category.
 * @property {string} name The small category name.
 */

import { useState } from "react";
import supabase from "../../client.js";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";
import { useNavigate } from "react-router-dom";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";
import { Box, Button, FormControl, FormLabel, Stack } from "@mui/material";
import SelectLargeCategories from "./selections/SelectLargeCategories.jsx";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SelectLargeLargeCategories from "./selections/SelectLargeLargeCategories.jsx";

/**
 * Manage the small category.
 * @param {object} props The props.
 * @param {(number|null)=} props.id The identifier.
 * @returns
 */
function SmallCategoryDetail({ id }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  /**
   * The upsert action.
   * @param {SmallCategoryFormData} param0
   */
  const upsertFunc = async ({ large_categories, name }) => {
    if (id && large_categories?.id) {
      await supabase
        .from('small_categories')
        .update({
          large_category_id: large_categories.id,
          name: name,
          vector: await createEmbeddingVector(name),
        })
        .eq('id', id);
      navigate(-1);
    } else if (large_categories?.id) {
      await supabase
        .from('small_categories')
        .insert({
          name: name,
          large_category_id: large_categories.id,
          vector: await createEmbeddingVector(name),
        });
      navigate(-1);
    }
  };

  /**
   * Default form value determinator.
   * @returns {Promise.<SmallCategoryFormData>}
   */
  const setDefaultValues = async () => {
    if (id) {
      const { data, error } = await supabase
        .from('small_categories')
        .select('name, large_categories(id, name, large_large_categories(id, name))')
        .eq('id', id);
      if (error)
        throw error;

      if (data.length)
        return {
          ...data[0],
          large_large_categories: data[0].large_categories.large_large_categories,
        };
    }

    return {
      name: '',
      large_categories: null,
      large_large_categories: null,
    };
  }

  return (
    <>
      <FormContainer
        defaultValues={setDefaultValues}
        onSuccess={upsertFunc}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="large_large_categories">大分類</FormLabel>
            <SelectLargeLargeCategories
              name="large_large_categories"
              id="large_large_categories"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="large_categories">カテゴリ</FormLabel>
            <SelectLargeCategories
              id="large_categories"
              name="large_categories"
              largeLargeCategoryName="large_large_categories"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="name">名称</FormLabel>
            <TextFieldElement
              id="name"
              name="name"
              required
              fullWidth
              placeholder="衣料用洗剤・醤油"
            />
          </FormControl>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
          >
            <Button
              type="button"
              color="primary"
              variant="text"
              startIcon={<UndoIcon />}
              onClick={() => navigate(-1)}
            >
              戻る
            </Button>
            <Button
              color="success"
              type="submit"
              startIcon={<SaveIcon />}
              variant="contained"
            >
              保存
            </Button>
            <Button
              color="error"
              type="button"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setOpen(v => !v)}
              disabled={!id}
              variant="contained"
            >
              削除（関連データも含めて完全に削除されます）
            </Button>
          </Stack>
        </Box>
      </FormContainer>
      <RemoveConfirmDialog
        open={open}
        setOpen={setOpen}
        callback={async () => {
          if (id) {
            await supabase
              .from('small_categories')
              .delete()
              .eq('id', id);
            navigate(-1);
          }
        }}
      />
    </>
  );
}

export default SmallCategoryDetail;