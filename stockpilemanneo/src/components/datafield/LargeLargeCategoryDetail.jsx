/**
 * @fileoverview The common component to edit and add the largest category.
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
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import supabase from "../../client.js";
import { useState } from "react";
import { Alert, Button, FormControl, FormLabel, Stack } from "@mui/material";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";
import { useNavigate } from "react-router";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";

/**
 * The largest category detail editor.
 * @param {object} props The props.
 * @param {number=} props.item The item identity.
 * @returns
 */
function LargeLargeCategoryDetail({ item }) {
  const navigate = useNavigate();
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <>
      {!!err && <Alert severity="error">{err}</Alert>}
      <FormContainer
        defaultValues={async () => {
          if (item) {
            const { data, error } = await supabase
              .from('large_large_categories')
              .select('name')
              .eq('id', item);

            if (error) {
              setErr(error.message);
              return {
                name: '',
              };
            }

            if (data?.[0]) {
              return data[0];
            }
          }

          return {
            name: '',
          };
        }}
        onSuccess={async ({ name }) => {
          if (item) {
            const { error } = await supabase
              .from('large_large_categories')
              .update({
                name,
                vector: await createEmbeddingVector(name),
              })
              .eq('id', item);

            if (error)
              setErr(error.message);
            else
              navigate(-1);
          } else {
            const { error } = await supabase
              .from('large_large_categories')
              .insert({
                name,
                vector: await createEmbeddingVector(name),
              });

            if (error)
              setErr(error.message);
            else
              navigate(-1);
          }
        }}
      >
        <Stack spacing={2}>
          <FormControl>
            <FormLabel htmlFor="name">大分類の名称</FormLabel>
            <TextFieldElement
              id="name"
              name="name"
              required
              fullWidth
              type="text"
              autoCorrect="on"
            />
          </FormControl>
          <Button
            type="button"
            fullWidth
            color="primary"
            variant="contained"
            onClick={() => navigate(-1)}
            startIcon={<UndoIcon />}
          >
            戻る
          </Button>
          <Button
            type="submit"
            fullWidth
            color="success"
            variant="contained"
            startIcon={<SaveIcon />}
          >
            保存
          </Button>
          <Button
            disabled={!item}
            type="button"
            variant="contained"
            color="error"
            fullWidth
            startIcon={<DeleteForeverIcon />}
            onClick={() => setOpen(true)}
          >
            削除（関連データも含めて全て削除されます）
          </Button>
        </Stack>
      </FormContainer>
      <RemoveConfirmDialog
        open={open}
        setOpen={setOpen}
        callback={async () => {
          if (!item) return;

          const { error } = await supabase
            .from('large_large_categories')
            .delete()
            .eq('id', item);

          if (error) {
            setErr(error.message);
          } else {
            navigate(-1);
          }
        }}
      />
    </>
  );
}

export default LargeLargeCategoryDetail;