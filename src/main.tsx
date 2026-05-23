import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.js'

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No #root element found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
