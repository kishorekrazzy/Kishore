import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './Root.jsx'
import { ContentProvider } from './content/ContentContext'
import ThemeVars from './content/ThemeVars'

/* Root picks between the desktop app and the phone app — see Root.jsx. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <ThemeVars />
      <Root />
    </ContentProvider>
  </StrictMode>,
)
