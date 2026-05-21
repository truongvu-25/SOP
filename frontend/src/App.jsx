import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import LeaveRequestPage from './Pages/LeaveRequestPage'
import LeaveHistory from './Pages/LeaveHistory'
import LoginPage from './Pages/LoginPage'
import Profile from './Pages/Profile'
import ManagerDashboard from './ManagerDashboard'
import './App.css'

const ProtectedRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return element
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/leave-request" element={<ProtectedRoute element={<LeaveRequestPage />} />} />
        <Route path="/leave-history" element={<ProtectedRoute element={<LeaveHistory />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/manager" element={<ProtectedRoute element={<ManagerDashboard />} requiredRole="MANAGER" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
