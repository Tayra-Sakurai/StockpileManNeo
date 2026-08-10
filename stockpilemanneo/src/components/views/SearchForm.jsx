import { Box, Button, FormControl, FormLabel, Paper, Stack } from "@mui/material";
import { FormContainer, MultiSelectElement, TextFieldElement } from "react-hook-form-mui";
import { useSearchParams } from "react-router-dom";

const values = [
  {
    label: 'カテゴリ',
    value: 'large_categories',
  },
  {
    label: '名称',
    value: 'small_categories',
  },
  {
    label: '品目',
    value: 'items',
  },
  {
    label: '場所',
    value: 'locations',
  },
];

function SearchForm() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Paper
      sx={{ width: '100%' }}
    >
      <FormContainer
        defaultValues={{
          q: searchParams.get('q') || '',
          tables: searchParams.getAll('tables') || values.map(value => value.value),
        }}
        onSuccess={(data) => {
          setSearchParams(data);
        }}
      >
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
          <Stack spacing="2" sx={{ width: '100%' }}>
            <FormControl>
              <FormLabel htmlFor="q">検索ワード</FormLabel>
              <TextFieldElement
                name="q"
                type="search"
                id="q"
                fullWidth
              />
            </FormControl>
            <MultiSelectElement
              name="tables"
              itemValue="value"
              itemLabel="label"
              options={values}
              required
              fullWidth
            />
            <Button
              color="success"
              fullWidth
              type="submit"
            >
              検索
            </Button>
          </Stack>
        </Box>
      </FormContainer>
    </Paper>
  );
}

export default SearchForm;