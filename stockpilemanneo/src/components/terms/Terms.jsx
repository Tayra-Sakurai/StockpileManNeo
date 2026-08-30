import { Box, Link } from "@mui/material";
import TermsOfService from "../../assets/terms.md?raw";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Terms() {

  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            return <Link href={href}>{children}</Link>;
          }
        }}
      >{TermsOfService}</Markdown>
    </Box>
  );
}

export default Terms;