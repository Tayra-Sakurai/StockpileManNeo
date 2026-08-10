import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SignUp from './components/signup/SignUp.tsx';
import SignIn from './components/signin/SignIn.tsx';
import SessionCheck from './sessionman/SessionCheck.jsx';
import AppTheme from './components/signin/theme/AppTheme.tsx';
import AppBaseElement from './components/appbase/AppBaseElement.jsx';
import SearchPage from './components/views/SearchPage.jsx';
import EditBlock from './components/datafield/Editors/EditBlock.jsx';
import LargeCategoryEdit from './components/datafield/Editors/LargeCategoryEdit.jsx';
import SmallCategoryEdit from './components/datafield/Editors/SmallCategoryEdit.jsx';
import LocationEdit from './components/datafield/Editors/LocationEdit.jsx';
import ItemEdit from './components/datafield/Editors/ItemEdit.jsx';
import AddBlock from './components/datafield/Editors/AddBlock.jsx';
import LargeCategoryDetail from './components/datafield/LargeCategoryDetail.jsx';
import SmallCategoryDetail from './components/datafield/SmallCategoryDetail.jsx';
import LocationDetail from './components/datafield/LocationDetail.jsx';
import ItemDetail from './components/datafield/ItemDetail.jsx';

function App() {
  return (
    <BrowserRouter>
      <AppTheme>
        <Routes>
          <Route path="/" element={<AppBaseElement />}>
            <Route path="/" element={<SearchPage />} />
            <Route path="Search" element={<SearchPage />} />
            <Route path="Edit" element={<EditBlock />}>
              <Route path="large_categories/:id" element={<LargeCategoryEdit />} />
              <Route path="small_categories/:id" element={<SmallCategoryEdit />} />
              <Route path="locations/:id" element={<LocationEdit />} />
              <Route path="items/:id" element={<ItemEdit />} />
            </Route>
            <Route path="Add" element={<AddBlock />}>
              <Route path="large_categories" element={<LargeCategoryDetail />} />
              <Route path="small_categories" element={<SmallCategoryDetail />} />
              <Route path="locations" element={<LocationDetail />} />
              <Route path="items" element={<ItemDetail />} />
            </Route>
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<SessionCheck />} />
        </Routes>
      </AppTheme>
    </BrowserRouter>
  );
}

export default App;
