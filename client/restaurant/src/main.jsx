import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import AdminDashboard from './AdminDashboard.jsx'

const path = window.location.pathname.toLowerCase()
const isAdminRoute = path === '/admin' || path.startsWith('/admin/')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {isAdminRoute ? <AdminDashboard /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
)
