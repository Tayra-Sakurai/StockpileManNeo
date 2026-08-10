import './App.css';
import { Routes, Route, BrowserRouter, useSearchParams } from 'react-router-dom';
import SignUp from './components/signup/SignUp.tsx';
import SignIn from './components/signin/SignIn.tsx';
import SessionCheck from './sessionman/SessionCheck.jsx';
import AppTheme from './components/signin/theme/AppTheme.tsx';
import UserViewContext from './sessionman/UserViewContext.jsx';
import { useEffect, useState } from 'react';
import supabase from './client.js';
import AppBaseElement from './components/appbase/AppBaseElement.jsx';
import SearchPage from './components/views/SearchPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AppTheme>
        <Routes>
          <Route path="/" element={<AppBaseElement />}>
            <Route path="Search" element={<SearchPage />} />
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
