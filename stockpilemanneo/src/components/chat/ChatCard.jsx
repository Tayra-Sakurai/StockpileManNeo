/**
 * @fileoverview The statement dialog of the AI chat page.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */
import { Avatar, Card, CardContent, CardHeader, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Markdown from "react-markdown";
import GeminiLogo from "../../assets/gemini_logo.png";
import remarkGfm from "remark-gfm";

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
            <Avatar src={GeminiLogo} /> :
            <Avatar sx={{ bgcolor: deepPurple[500] }}>
              <AccountCircleIcon />
            </Avatar>
        }
        title={role}
      />
      <CardContent>
        <Markdown
          remarkPlugins={[remarkGfm]}
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
        >{markdown}</Markdown>
      </CardContent>
    </Card>
  );
}

export default ChatCard;