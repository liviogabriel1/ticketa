import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import EventPage from './pages/EventPage'
import Login from './pages/Login'
import Register from './pages/Register'
import MyTickets from './pages/MyTickets'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/event/:id', element: <EventPage /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/me/tickets', element: <MyTickets /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
