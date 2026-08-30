import { Box } from "@mui/material";
import TermsOfService from "../../assets/terms.md?raw";
import Markdown from "react-markdown";

function Terms() {

  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Markdown>{TermsOfService}</Markdown>
    </Box>
  );
}

export default Terms;