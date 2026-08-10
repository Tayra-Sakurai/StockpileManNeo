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
  const [searchParams] = useSearchParams();
  /**
   * @type {[
   *   (import("@supabase/supabase-js").User|null),
   *   import("react").Dispatch<import("react").SetStateAction<(import("@supabase/supabase-js").User|null)>>
   * ]}
   */
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userSet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
    };
    userSet();
  }, [searchParams]);

  return (
    <BrowserRouter>
      <UserViewContext.Provider value={userData}>
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
      </UserViewContext.Provider>
    </BrowserRouter>
  );
}

export default App;
