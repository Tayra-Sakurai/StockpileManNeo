import { Card, CardContent } from "@mui/material";
import SearchForm from "./SearchForm.jsx";
import SearchResults from "./SearchResults.jsx";

function SearchPage() {
  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <SearchForm />
        <SearchResults />
      </CardContent>
    </Card>
  );
}

export default SearchPage;