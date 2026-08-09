import { Box, Button, FormControl, InputLabel, Stack } from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";
import supabase from "../../client.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";


/**
 * The location data editor.
 * @param {object} props The props.
 * @param {?number=} props.id The identifier.
 * @returns
 */
function LocationDetail({ id = null }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <FormContainer
        defaultValues={async () => {
          if (id) {
            const { data, error } = await supabase
              .from('locations')
              .select('name')
              .eq('id', id);

            if (error) throw error;

            if (data) return data[0];
          }

          return {
            name: '',
          };
        }}
        onSuccess={async ({ name }) => {
          if (id) {
            await supabase
              .from('locations')
              .update({
                name: name,
                vector: await createEmbeddingVector(name),
              })
              .eq('id', id);
            navigate(-1);
          } else {
            await supabase
              .from('locations')
              .insert({
                name: name,
                vector: await createEmbeddingVector(name),
              });
            navigate(-1);
          }
        }}
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
            <InputLabel htmlFor="name">保管場所の名前</InputLabel>
            <TextFieldElement
              id="name"
              name="name"
              fullWidth
              required
            />
          </FormControl>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
          >
            <Button
              type="button"
              startIcon={<UndoIcon />}
              color="primary"
              variant="text"
            >
              戻る
            </Button>
            <Button
              type="submit"
              startIcon={<SaveIcon />}
              color="success"
            >
              保存
            </Button>
            <Button
              type="button"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setOpen(v => !v)}
            >
              削除
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
              .from('locations')
              .delete()
              .eq('id', id);
            navigate(-1);
          }
        }}
      />
    </>
  );
}

export default LocationDetail;