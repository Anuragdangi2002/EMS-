import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'
import { App } from './app/app'
import { AuthProvider } from './store/auth-context'
const client = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })
createRoot(document.getElementById('root')!).render(<StrictMode><QueryClientProvider client={client}><BrowserRouter><AuthProvider><App /><Toaster position="top-right" toastOptions={{ duration: 4000 }} /></AuthProvider></BrowserRouter></QueryClientProvider></StrictMode>)
