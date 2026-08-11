import { Card, CardContent, Typography } from "@mui/material";
import SearchForm from "./SearchForm.jsx";
import SearchResults from "./SearchResults.jsx";

function SearchPage() {
  return (
    <Card sx={{ width: '100%', margin: 0, boxSizing: 'border-box' }}>
      <CardContent>
        <Typography variant="h2" component="h2">検索</Typography>
        <SearchForm />
        <SearchResults />
      </CardContent>
    </Card>
  );
}

export default SearchPage;