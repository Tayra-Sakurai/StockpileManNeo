import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import supabase from "../../client.js";
import { Box, Button, FormControl, FormLabel, Stack } from "@mui/material";
import { useState } from "react";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";
import { useNavigate } from "react-router-dom";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SelectLargeLargeCategories from "./selections/SelectLargeLargeCategories.jsx";

/**
 * The detail view component for details of categories.
 * @param {object} props The element properties.
 * @param {number|null=} props.id The category identifier.
 * @returns
 */
function LargeCategoryDetail({ id = null }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const searchOrCreateLargeCategoryAsync = async () => {
    if (id == null) {
      return {
        name: '',
        largeLargeCategory: null,
      };
    } else {
      const { data, error } = await supabase
        .from('large_categories')
        .select('name, id, large_large_categories(id, name)')
        .eq('id', id);
      if (error) {
        console.error('Failed to fetch data.\n', error.message);
        return {
          name: '',
          largeLargeCategory: null,
        };
      }
      if (!data || !data[0]) {
        console.error('Unknown error occurred.');
        return {
          name: '',
          largeLargeCategory: null,
        };
      }
      return {
        name: data[0].name,
        largeLargeCategory: data[0].large_large_categories,
      };
    }
  };

  const openDialog = () => setOpen(true);

  const categoryRemoveAction = async () => {
    await supabase
      .from('large_categories')
      .delete()
      .eq('id', id);

    navigate(-1);
  };

  /**
   * The success action.
   * @param {{name:string, largeLargeCategory: ?import("./selections/SelectLargeLargeCategories.jsx").LargeLargeCategoryCandidate}} event
   */
  const categoryUpsertAction = async ({ name, largeLargeCategory }) => {
    const vector = await createEmbeddingVector(name);

    if (id)
      await supabase
        .from('large_categories')
        .update({
          name: name,
          vector: vector,
          large_large_category_id: largeLargeCategory?.id,
        })
        .eq('id', id);
    else
      await supabase
        .from('large_categories')
        .insert({
          name: name,
          vector: vector,
          large_large_category_id: largeLargeCategory?.id,
        });

    navigate(-1);
  };

  return (
    <FormContainer
      defaultValues={searchOrCreateLargeCategoryAsync}
      onSuccess={categoryUpsertAction}
    >
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Stack spacing="2">
          <FormControl>
            <FormLabel htmlFor="largeLargeCategory">大分類</FormLabel>
            <SelectLargeLargeCategories
              id="largeLargeCategory"
              name="largeLargeCategory"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="name">カテゴリ名</FormLabel>
            <TextFieldElement
              id="name"
              name="name"
              required
              placeholder="例）洗剤，調味料など"
              fullWidth
              autoFocus
            />
          </FormControl>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'column',
                md: 'row',
              },
              gap: 4,
            }}
          >
            <Button
              type="button"
              variant="text"
              color="primary"
              onClick={() => navigate(-1)}
              startIcon={<UndoIcon />}
            >
              戻る
            </Button>
            <Button
              type="submit"
              color="success"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              保存
            </Button>
            <Button
              type="button"
              color="error"
              disabled={!id}
              onClick={openDialog}
              variant="contained"
              startIcon={<DeleteForeverIcon />}
            >
              カテゴリを削除（関連項目も含めて削除されます）
            </Button>
          </Box>
        </Stack>
      </Box>
      <RemoveConfirmDialog open={open} setOpen={setOpen} callback={categoryRemoveAction} />
    </FormContainer>
  );
}

export default LargeCategoryDetail;