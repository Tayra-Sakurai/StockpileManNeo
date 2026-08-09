import { Card, CardContent, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * The card common pieces.
 * @param {object} props The properties.
 * @param {string} props.type The data type.
 * @param {string} props.title The title of the card.
 * @param {number} props.itemId The item's id.
 * @param {string} props.table The data table name.
 * @param {import("react").JSX.Element=} props.children The content.
 * @returns
 */
function CommonCard({ type, title, itemId, table, children }) {
  return (
    <Card
      variant="outlined"
    >
      <CardContent>
        <Typography
          sx={{ color: 'text.secondary', fontSize: 14 }}
          gutterBottom
        >
          {type}
        </Typography>
        <Link
          component={RouterLink}
          to={`/Edit/${table}/${itemId}`}
        >
          <Typography
            variant="h5"
            component="div"
            color="textPrimary"
          >
            {title}
          </Typography>
        </Link>
        {children}
      </CardContent>
    </Card>
  );
}

export default CommonCard;