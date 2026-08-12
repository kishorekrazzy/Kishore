import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ContentProvider } from './content/ContentContext'
import ThemeVars from './content/ThemeVars'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <ThemeVars />
      <App />
    </ContentProvider>
  </StrictMode>,
)
