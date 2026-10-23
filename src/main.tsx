import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AdminPage } from './admin/AdminPage';
import { LabPage } from './lab/LabPage';
import './index.css';

// Tiny router: /admin, /build, everything else → the booth.
const path = window.location.pathname.replace(/\/+$/, '');
const page = path === '/admin' ? <AdminPage /> : path === '/build' ? <LabPage /> : <App />;

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>);
