import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminOnlyApp from './AdminOnlyApp.tsx'

const RootApp = import.meta.env.VITE_APP_MODE === 'admin' ? AdminOnlyApp : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
