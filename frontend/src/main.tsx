import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import EventPage from './pages/EventPage'
import EventNew from './pages/EventNew'
import Login from './pages/Login'
import Register from './pages/Register'
import MyTickets from './pages/MyTickets'
import ThemeProvider from '@/components/theme/ThemeProvider'
import RequireAuth from '@/routes/RequireAuth'
import RequireRole from '@/routes/RequireRole'

// 👇 novo
import OrganizerApply from './pages/OrganizerApply'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/event/:id', element: <EventPage /> },

  {
    path: '/event/new',
    element: (
      <RequireRole allowed={['organizer', 'admin']}>
        <EventNew />
      </RequireRole>
    ),
  },

  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // 👇 nova rota (somente logado pode virar organizador)
  {
    path: '/organizer/apply',
    element: (
      <RequireAuth>
        <OrganizerApply />
      </RequireAuth>
    ),
  },

  {
    path: '/me/tickets',
    element: (
      <RequireAuth>
        <MyTickets />
      </RequireAuth>
    ),
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)