import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import PixPage from './pages/PixPage';
import CalendarPage from './pages/CalendarPage';
import CrewListPage from './pages/CrewListPage';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<CrewListPage />} />
            <Route path="pix" element={<PixPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
