import { Avatar, Card, CardContent, CardHeader, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { MarkdownHooks } from "react-markdown";

/**
 * Displays the Gemini response and user's request.
 * @param {object} props The props.
 * @param {string} props.markdown The raw response.
 * @param {"model" | "user"} props.role The role of the chat prompt.
 * @returns
 */
function ChatCard({ markdown, role }) {
  return (
    <Card>
      <CardHeader
        avatar={
          role === 'model' ?
            <Avatar src="/assets/gemini_logo.png" /> :
            <Avatar sx={{ bgcolor: deepPurple[500] }}>
              <AccountCircleIcon />
            </Avatar>
        }
        title={role}
      />
      <CardContent>
        <MarkdownHooks
          components={{
            table(options) {
              const { children } = options;

              return (
                <TableContainer sx={{ width: '100%' }}>
                  <Table sx={{ width: 'max-content' }}>
                    {children}
                  </Table>
                </TableContainer>
              );
            },
            tr(options) {
              const { children } = options;

              return (
                <TableRow>
                  {children}
                </TableRow>
              );
            },
            thead(options) {
              const { children } = options;

              return <TableHead>{children}</TableHead>;
            },
            tbody(options) {
              const { children } = options;

              return <TableBody>{children}</TableBody>;
            },
            th(options) {
              const { children, align, scope } = options;

              return <TableCell component="th" align={align !== 'char' ? align : 'inherit'} scope={scope}>{children}</TableCell>;
            },
            td(options) {
              const { children, align } = options;

              return (
                <TableCell
                  component="td"
                  align={align === 'char' ? 'inherit' : align}
                >
                  {children}
                </TableCell>
              );
            },
            a(options) {
              const { href, children } = options;

              return <Link href={href}>{children}</Link>;
            },
          }}
        >{markdown}</MarkdownHooks>
      </CardContent>
    </Card>
  );
}

export default ChatCard;