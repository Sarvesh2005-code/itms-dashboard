import Dashboard from './components/Dashboard'
import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [dark, setDark] = useState<boolean>(false)

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  return (
    <div className="bg-app min-h-screen">
      <div className="fixed top-4 right-4 z-50 glass rounded-full px-3 py-2 shadow-sm">
        <button onClick={() => setDark(!dark)} className="text-sm text-gray-800 dark:text-gray-100">
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      <Dashboard />
    </div>
  )
}

export default App
