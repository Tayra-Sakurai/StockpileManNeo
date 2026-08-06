import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SignUp from './components/signup/SignUp.tsx';
import SignIn from './components/signin/SignIn.tsx';
import SessionCheck from './sessionman/SessionCheck.jsx';
import AppBaseElement from './components/appbase/AppBaseElement.jsx';
import StockpileDashboard from './components/stockpile/StockpileDashboard.jsx';
import AppTheme from './components/signin/theme/AppTheme.tsx';

function App() {
  return (
    <AppTheme>
      <BrowserRouter>
        <Routes>
          <Route element={<AppBaseElement />}>
            <Route path="/" element={<StockpileDashboard />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<SessionCheck />} />
        </Routes>
      </BrowserRouter>
    </AppTheme>
  );
}

export default App;
