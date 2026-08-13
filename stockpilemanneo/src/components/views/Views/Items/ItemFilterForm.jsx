import { Button, FormControl, FormLabel, Stack } from "@mui/material";
import { TextFieldElement, useForm, useWatch } from "react-hook-form-mui";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

function ItemFilterForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      q: searchParams.get('q') ?? '',
      d1: searchParams.get('d1') ?? new Date().toISOString().replace(/T.*$/, ''),
      d2: searchParams.get('d2') ?? new Date().toISOString().replace(/T.*$/, ''),
    },
  });

  const [dmin, dmax] = useWatch({
    control,
    name: ['d1', 'd2'],
  });

  return (
    <form onSubmit={handleSubmit(formData => {
      setSearchParams(formData);
    })}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel htmlFor="q">検索ワード</FormLabel>
          <TextFieldElement
            id="q"
            name="q"
            fullWidth
            placeholder="あいまい検索もできます．"
            type="search"
            autoComplete="off"
            inputMode="search"
            control={control}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="d1">期限（始まり）</FormLabel>
          <TextFieldElement
            id="d1"
            name="d1"
            type="date"
            slotProps={{
              htmlInput: {
                max: dmax,
              },
            }}
            fullWidth
            control={control}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="d2">期限（終わり）</FormLabel>
          <TextFieldElement
            id="d2"
            name="d2"
            slotProps={{
              htmlInput: {
                min: dmin,
              },
            }}
            type="date"
            fullWidth
            control={control}
          />
        </FormControl>
        <Button
          type="submit"
          color="success"
          startIcon={<SearchIcon />}
          variant="contained"
        >
          指定した条件で絞り込み
        </Button>
      </Stack>
    </form>
  );
}

export default ItemFilterForm;