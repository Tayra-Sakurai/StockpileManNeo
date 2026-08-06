import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function DetailValue({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || '未設定'}</Typography>
    </Box>
  );
}

export default function SmallCategoryDetail({
  value,
  largeCategories = [],
  onChange,
  readOnly = false,
}) {
  const largeCategory = largeCategories.find(
    (category) => String(category.id) === String(value.large_category_id),
  );

  if (readOnly) {
    return (
      <Stack spacing={1.5}>
        <DetailValue label="小カテゴリ名" value={value.name} />
        <DetailValue label="大カテゴリ" value={largeCategory?.name || value.large_categories?.name} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <TextField
        label="小カテゴリ名"
        value={value.name ?? ''}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        required
        fullWidth
      />
      <TextField
        select
        label="大カテゴリ"
        value={value.large_category_id ?? ''}
        onChange={(event) => onChange({ ...value, large_category_id: event.target.value })}
        required
        fullWidth
      >
        {largeCategories.map((category) => (
          <MenuItem key={category.id} value={String(category.id)}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
