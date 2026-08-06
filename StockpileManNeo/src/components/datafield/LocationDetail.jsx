import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function LocationDetail({ value, onChange, readOnly = false, itemCount }) {
  if (readOnly) {
    return (
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            保管場所名
          </Typography>
          <Typography variant="body1">{value.name || '未設定'}</Typography>
        </Box>
        {typeof itemCount === 'number' ? (
          <Box>
            <Typography variant="caption" color="text.secondary">
              登録在庫
            </Typography>
            <Typography variant="body1">{itemCount}件</Typography>
          </Box>
        ) : null}
      </Stack>
    );
  }

  return (
    <TextField
      label="保管場所名"
      value={value.name ?? ''}
      onChange={(event) => onChange({ ...value, name: event.target.value })}
      required
      fullWidth
    />
  );
}
