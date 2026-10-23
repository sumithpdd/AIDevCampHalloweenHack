import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AdminPage } from './admin/AdminPage';
import './index.css';

// Tiny router: /admin → admin area, everything else → the booth.
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')!).render(<StrictMode>{isAdmin ? <AdminPage /> : <App />}</StrictMode>);
