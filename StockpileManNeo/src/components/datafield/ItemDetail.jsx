import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function formatDate(value) {
  if (!value) return '未設定';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function DetailValue({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {value || '未設定'}
      </Typography>
    </Box>
  );
}

export default function ItemDetail({
  value,
  smallCategories = [],
  locations = [],
  onChange,
  readOnly = false,
}) {
  const smallCategory = smallCategories.find(
    (category) => String(category.id) === String(value.small_category_id),
  );
  const location = locations.find((entry) => String(entry.id) === String(value.location_id));

  if (readOnly) {
    const categoryName = smallCategory?.large_categories?.name
      ? `${smallCategory.large_categories.name} / ${smallCategory.name}`
      : smallCategory?.name || value.small_categories?.name;
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <DetailValue label="品名" value={value.name} />
        <DetailValue label="分類" value={categoryName} />
        <DetailValue label="保管場所" value={location?.name || value.locations?.name} />
        <DetailValue label="購入日" value={formatDate(value.purchase_timestamp)} />
        <DetailValue label="期限" value={formatDate(value.life)} />
        <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
          <DetailValue label="メモ" value={value.description} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
      <TextField
        label="品名"
        value={value.name ?? ''}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        required
        fullWidth
      />
      <TextField
        select
        label="小カテゴリ"
        value={value.small_category_id ?? ''}
        onChange={(event) => onChange({ ...value, small_category_id: event.target.value })}
        required
        fullWidth
      >
        {smallCategories.map((category) => (
          <MenuItem key={category.id} value={String(category.id)}>
            {category.large_categories?.name
              ? `${category.large_categories.name} / ${category.name}`
              : category.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="保管場所"
        value={value.location_id ?? ''}
        onChange={(event) => onChange({ ...value, location_id: event.target.value })}
        required
        fullWidth
      >
        {locations.map((locationOption) => (
          <MenuItem key={locationOption.id} value={String(locationOption.id)}>
            {locationOption.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="購入日時"
        type="datetime-local"
        value={value.purchase_timestamp ?? ''}
        onChange={(event) => onChange({ ...value, purchase_timestamp: event.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />
      <TextField
        label="期限"
        type="datetime-local"
        value={value.life ?? ''}
        onChange={(event) => onChange({ ...value, life: event.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />
      <TextField
        label="メモ"
        value={value.description ?? ''}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
        multiline
        minRows={2}
        fullWidth
        sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
      />
    </Box>
  );
}
