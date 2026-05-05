import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      {/* The Toaster component renders the beautiful notifications globally */}
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Temporarily redirect the root to login until we build the dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;