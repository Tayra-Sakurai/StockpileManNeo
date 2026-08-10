/**
 * @typedef {object} SmallCategoryFormData The small category's form data object.
 * @property {?{
 *   name: string,
 *   id?: number,
 * }=} large_categories The large category related to the small category.
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
   * @type {[
   *   ?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate,
   *   import("react").Dispatch.<import("react").SetStateAction.<?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate>>
   * ]}
   */
  const [largeCategory, setLargeCategory] = useState(null);

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
        .select('name, large_categories(id, name)')
        .eq('id', id);
      if (error)
        throw error;

      if (data)
        return data[0];
    }

    return {
      name: '',
      large_categories: null,
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
            <FormLabel htmlFor="large_categories">カテゴリ</FormLabel>
            <SelectLargeCategories
              id="large_categories"
              name="large_categories"
              value={largeCategory}
              setValue={setLargeCategory}
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
            >
              保存
            </Button>
            <Button
              color="error"
              type="button"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setOpen(v => !v)}
              disabled={!id}
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