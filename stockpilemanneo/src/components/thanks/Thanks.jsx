import { Paper } from "@mui/material";

function Thanks() {
  return (
    <Paper
      sx={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <iframe
        src="/dependencies.txt"
        style={{
          border: 'none',
          width: 'fit-content',
        }}
      >
        レンダリングに失敗しました．
      </iframe>
    </Paper>
  );
}

export default Thanks;