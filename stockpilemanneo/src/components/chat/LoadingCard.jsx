import { Avatar, Card, CardContent, CardHeader, Skeleton, Stack } from "@mui/material";
import GeminiLogo from "../../assets/gemini_logo.png";

function LoadingCard() {
  return (
    <Card>
      <CardHeader
        avatar={<Avatar src={GeminiLogo} />}
        title="model"
        subheader="読み込み中..."
      />
      <CardContent>
        <Stack spacing={2}>
          <Skeleton
            variant="rectangular"
            height={64}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default LoadingCard;