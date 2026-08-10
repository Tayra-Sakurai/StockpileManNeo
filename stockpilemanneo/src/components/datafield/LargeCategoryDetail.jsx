import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import supabase from "../../client.js";
import { Box, Button, FormControl, InputLabel, Stack } from "@mui/material";
import { useState } from "react";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";

/**
 * The detail view component for details of categories.
 * @param {object} props The element properties.
 * @param {number|null=} props.id The category identifier.
 * @returns
 */
function LargeCategoryDetail({ id = null }) {
  const [open, setOpen] = useState(false);

  const searchOrCreateLargeCategoryAsync = async () => {
    if (id == null) {
      return {
        name: '',
      };
    } else {
      const { data, error } = await supabase
        .from('large_categories')
        .select('name, id')
        .eq('id', id);
      if (error) {
        console.error('Failed to fetch data.\n', error.message);
        return {
          name: '',
        };
      }
      if (!data || !data[0]) {
        console.error('Unknown error occurred.');
        return {
          name: '',
        };
      }
      return {
        name: data[0].name,
      };
    }
  };

  const openDialog = () => setOpen(true);

  const categoryRemoveAction = async () => {
    await supabase
      .from('large_categories')
      .delete()
      .eq('id', id);
  };

  /**
   * The success action.
   * @param {{name:string}} event
   */
  const categoryUpsertAction = async ({ name }) => {
    const vector = await createEmbeddingVector(name);

    if (id)
      await supabase
        .from('large_categories')
        .update({
          name: name,
          vector: vector,
        })
        .eq('id', id);
    else
      await supabase
        .from('large_categories')
        .insert({
          name: name,
          vector: vector,
        });
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
            <InputLabel htmlFor="name">カテゴリ名</InputLabel>
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
              flexDirection: 'row',
              gap: 4,
            }}
          >
            <Button
              type="button"
              variant="text"
              color="primary"
            >
              戻る
            </Button>
            <Button
              type="submit"
              color="success"
            >
              保存
            </Button>
            <Button
              type="button"
              color="error"
              disabled={!id}
              onClick={openDialog}
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