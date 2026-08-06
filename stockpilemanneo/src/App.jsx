import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SignUp from './components/signup/SignUp';
import SignIn from './components/signin/SignIn';
import SessionCheck from './sessionman/SessionCheck';

function App() {

  return (
    <BrowserRouter>
      <SessionCheck autoRedirect={true}>
        <main>
          <Routes>
            <Route path="/" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<SessionCheck />} />
          </Routes>
        </main>
      </SessionCheck>
    </BrowserRouter>
  );
}

export default App;
