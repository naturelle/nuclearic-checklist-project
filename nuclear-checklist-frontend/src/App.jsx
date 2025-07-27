import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ChecklistDashboard } from './components/ChecklistDashboard'
import { ChecklistView } from './components/ChecklistView'
import { DataManagement } from './components/DataManagement'
import { Visualization } from './components/Visualization'
import { Navigation } from './components/Navigation'
import { LoginForm } from './components/LoginForm'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde token kontrolü yap
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      // Gerçek uygulamada token'ı doğrulayıp kullanıcı bilgilerini çekebiliriz
      setUser({ username: 'admin', role: 'admin' })
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ChecklistDashboard />} />
            <Route path="/checklist" element={<ChecklistView />} />
            <Route path="/visualization" element={<Visualization />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

