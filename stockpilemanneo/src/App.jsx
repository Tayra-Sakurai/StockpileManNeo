/**
 * @fileoverview The application.
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
import AppTheme from './components/theme/AppTheme.tsx';

function App() {
  return (
    <BrowserRouter>
      <AppTheme>
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
      </AppTheme>
    </BrowserRouter>
  );
}

export default App;
