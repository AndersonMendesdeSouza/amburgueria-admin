import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '../src/index.css'
import { AuthProvider } from './contexts/AuthContext'
import { OrderCountProvider } from './contexts/OrderCountContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OrderCountProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OrderCountProvider>
    </AuthProvider>
  </StrictMode>
)