import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from '@mui/material/Typography';
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import supabase from "../../client";
import aimodel from "../../aimodules/Gemini";

/**
 * The category's detail display/edit component
 * @param {object} props The properties.
 * @param {(number|null)=} props.id The category's id.
 * @returns {JSX.Element} The category's detail display/edit component
 */
export default function LargeCategoryDetail({ id = null }) {
  return (
    <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h5" component="h2" sx={{ py: 2 }}>
        カテゴリ詳細
      </Typography>
      <FormContainer
        defaultValues={async () => {
          if (id === null) {
            return {
              name: ''
            };
          }
          /**
           * The default values for the category.
           * @type {{data: {name: string, id: number}}}
           */
          const { data } = await supabase.from('large_categories').select('name, id').eq('id', id).single();
          return {
            name: data.name
          };
        }}
        onSuccess={({ name }) => {
          const vector = await aimodel.models.embedContent({
            model: 'gemini-embedding-2',
            contents: `title: none | text: ${name}`,
            embedContentConfig: {
              outputDimensionality: 768
            }
          });
          if (id === null) {
            await supabase
              .from('large_categories')
              .insert([
                {
                  name: name,
                  vector: vector.embedding.values
                }
              ]);
          } else {
            await supabase
              .from('large_categories')
              .update({
                name: name,
                vector: vector.embedding.values
              })
              .match({ id: id });
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
          <FormControl>
            <FormControlLabel htmlFor="name">
              カテゴリ名
            </FormControlLabel>
            <TextFieldElement
              id="name"
              name="name"
              fullWidth
              required
              placeholder="食品"
            />
          </FormControl>
        </Box>
      </FormContainer>
    </Card>
  );
}