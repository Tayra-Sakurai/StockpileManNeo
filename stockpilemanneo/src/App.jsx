import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SignUp from './components/signup/SignUp.tsx';
import SignIn from './components/signin/SignIn.tsx';
import SessionCheck from './sessionman/SessionCheck.jsx';
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
import LargeCategoriesView from './components/views/Views/LargeCategories/LargeCategoriesView.jsx';
import LocationsView from './components/views/Views/Locations/LocationsView.jsx';
import ItemsView from './components/views/Views/Items/ItemsView.jsx';
import SmallCategoriesView from './components/views/Views/SmallCategories/SmallCategoriesView.jsx';
import PasswordReset from './components/signin/PasswordReset.tsx';
import LargeLargeCategoryDetail from './components/datafield/LargeLargeCategoryDetail.jsx';
import LargeLargeCategoriesView from './components/views/Views/LargeLargeCategories/LargeLargeCategoriesView.jsx';
import LargeLargeCategoryEdit from './components/datafield/Editors/LargeLargeCategoryEdit.jsx';
import AIChat from './components/chat/AIChat.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppBaseElement />}>
          <Route path="/" element={<AIChat />} />
          <Route path="Search" element={<SearchPage />} />
          <Route path="Edit" element={<EditBlock />}>
            <Route path="large_categories/:id" element={<LargeCategoryEdit />} />
            <Route path="small_categories/:id" element={<SmallCategoryEdit />} />
            <Route path="locations/:id" element={<LocationEdit />} />
            <Route path="items/:id" element={<ItemEdit />} />
            <Route path="large_large_categories/:id" element={<LargeLargeCategoryEdit />} />
          </Route>
          <Route path="Add" element={<AddBlock />}>
            <Route path="large_categories" element={<LargeCategoryDetail />} />
            <Route path="small_categories" element={<SmallCategoryDetail />} />
            <Route path="locations" element={<LocationDetail />} />
            <Route path="items" element={<ItemDetail />} />
            <Route path="large_large_categories" element={<LargeLargeCategoryDetail />} />
          </Route>
          <Route path="View/large_large_categories" element={<LargeLargeCategoriesView />} />
          <Route path="View/large_categories/large_large_categories/:code" element={<LargeCategoriesView />} />
          <Route path="View/large_categories" element={<LargeCategoriesView />} />
          <Route path="View/locations" element={<LocationsView />} />
          <Route path="View/items/:table/:code" element={<ItemsView />} />
          <Route path="View/items" element={<ItemsView />} />
          <Route path="View/small_categories" element={<SmallCategoriesView />} />
          <Route path="View/small_categories/large_categories/:code" element={<SmallCategoriesView />} />
          <Route path="Chat" element={<AIChat />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/callback" element={<SessionCheck />} />
        <Route path="/reset-password" element={<PasswordReset />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
